import { mkdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'

export type OddsOutcome = {
  name: string
  price: number
  point?: number
  description?: string
}

export type OddsMarket = {
  key: string
  last_update?: string
  outcomes: OddsOutcome[]
}

export type OddsBookmaker = {
  key: string
  title: string
  last_update?: string
  markets: OddsMarket[]
}

export type NormalizedEvent = {
  externalId: string
  sportKey: string
  sportGroup: string
  sportTitle: string
  homeTeam: string
  awayTeam: string
  commenceTime: string
  bookmakers: OddsBookmaker[]
  source?: 'the-odds-api' | 'espn'
  completed?: boolean
  homeScore?: number | null
  awayScore?: number | null
}

type SportRow = {
  key: string
  group: string
  title: string
  description?: string
  active?: boolean
  has_outrights?: boolean
}

type RawEvent = {
  id: string
  sport_key: string
  sport_title?: string
  commence_time: string
  home_team: string
  away_team: string
  bookmakers?: OddsBookmaker[]
}

type CacheFile = {
  savedAt: string
  quotaRemaining: number | null
  sports: SportRow[]
  sportsFetchedAt: number
  events: Record<string, { fetchedAt: number; rows: RawEvent[] }>
  odds: Record<string, { fetchedAt: number; rows: RawEvent[] }>
}

const FEATURED_MARKETS = 'h2h,spreads,totals'
const HOST = 'https://api.the-odds-api.com/v4'

export function regionForSport(sportKey: string, group: string): 'us' | 'uk' | 'eu' | 'au' {
  const key = sportKey.toLowerCase()
  const g = group.toLowerCase()
  if (
    key.startsWith('americanfootball') ||
    key.startsWith('baseball') ||
    key.startsWith('icehockey') ||
    key.includes('basketball_nba') ||
    key.includes('basketball_ncaab') ||
    key.includes('basketball_wnba')
  ) {
    return 'us'
  }
  if (key.startsWith('aussierules') || key.startsWith('rugbyleague') || g.includes('aussie')) return 'au'
  if (key.startsWith('cricket') || g === 'cricket') return 'uk'
  return 'eu'
}

function cacheFilePath() {
  const cwd = process.cwd().replace(/\\/g, '/')
  const root = cwd.endsWith('/backend') ? process.cwd() : join(process.cwd(), 'backend')
  return join(root, '.cache', 'odds-feed.json')
}

export class OddsApiProvider {
  private sports: SportRow[] = []
  private sportsFetchedAt = 0
  private events = new Map<string, { fetchedAt: number; rows: RawEvent[] }>()
  private odds = new Map<string, { fetchedAt: number; rows: RawEvent[] }>()
  private quotaRemaining: number | null = null
  private ticking = false
  private meta = {
    configured: false,
    upstreamStatus: null as number | null,
    reason: 'not_loaded',
  }
  private warnedMissingKey = false
  private loadedDisk = false

  isConfigured() {
    return Boolean((process.env.ODDS_API_KEY || '').trim())
  }

  getMeta() {
    return { ...this.meta, quotaRemaining: this.quotaRemaining }
  }

  getNormalizedEvents(): NormalizedEvent[] {
    const groupByKey = new Map(this.sports.map((sport) => [sport.key, sport.group]))
    const out: NormalizedEvent[] = []
    for (const [sportKey, bucket] of this.events) {
      const priced = new Map((this.odds.get(sportKey)?.rows || []).map((row) => [row.id, row]))
      for (const row of bucket.rows) {
        if (!row?.id || !row.home_team || !row.away_team) continue
        const withOdds = priced.get(row.id)
        out.push({
          externalId: row.id,
          sportKey,
          sportGroup: groupByKey.get(sportKey) || row.sport_title || sportKey,
          sportTitle: row.sport_title || this.sports.find((s) => s.key === sportKey)?.title || sportKey,
          homeTeam: row.home_team,
          awayTeam: row.away_team,
          commenceTime: row.commence_time,
          bookmakers: this.cleanBookmakers(withOdds?.bookmakers || []),
        })
      }
    }
    return out
  }

  /** Event ids that currently have a price, keyed by sport. Sports absent here have not been priced yet. */
  getPricedIds(): Map<string, Set<string>> {
    const map = new Map<string, Set<string>>()
    for (const [sportKey, bucket] of this.odds) {
      map.set(sportKey, new Set(bucket.rows.map((row) => row.id)))
    }
    return map
  }

  toOddsApiShape() {
    return this.getNormalizedEvents().map((event) => ({
      id: event.externalId,
      sport_key: event.sportKey,
      sport_title: event.sportTitle,
      sport_group: event.sportGroup,
      commence_time: event.commenceTime,
      home_team: event.homeTeam,
      away_team: event.awayTeam,
      bookmakers: event.bookmakers,
    }))
  }

  async tick(oddsLimit = 4): Promise<{ catalogUpdated: boolean; pricedSports: string[] }> {
    if (!(await this.ensureDisk())) return { catalogUpdated: false, pricedSports: [] }
    if (!this.isConfigured()) {
      this.meta = { configured: false, upstreamStatus: null, reason: 'ODDS_API_KEY is not set' }
      if (!this.warnedMissingKey) {
        this.warnedMissingKey = true
        console.warn('[sports] ODDS_API_KEY is not set; bookmaker odds are unavailable')
      }
      return { catalogUpdated: false, pricedSports: [] }
    }
    if (this.ticking) return { catalogUpdated: false, pricedSports: [] }
    this.ticking = true
    try {
      let catalogUpdated = false
      if (Date.now() - this.sportsFetchedAt > 30 * 60_000 || this.sports.length === 0) {
        await this.loadCatalog()
        catalogUpdated = true
      }
      const pricedSports = await this.fillOdds(oddsLimit)
      const events = this.getNormalizedEvents()
      this.meta = {
        configured: true,
        upstreamStatus: 200,
        reason: events.length ? 'ok' : 'provider returned no events',
      }
      await this.saveDisk()
      return { catalogUpdated, pricedSports }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Odds provider request failed'
      console.error('[sports] odds provider request failed', message)
      this.meta = { configured: true, upstreamStatus: this.meta.upstreamStatus, reason: message }
      return { catalogUpdated: false, pricedSports: [] }
    } finally {
      this.ticking = false
    }
  }

  async fetchEventOdds(sportKey: string, eventId: string, markets: string): Promise<OddsBookmaker[]> {
    if (!this.isConfigured()) return []
    if (this.quotaRemaining != null && this.quotaRemaining < 12) return []
    const group = this.sports.find((sport) => sport.key === sportKey)?.group || ''
    const region = regionForSport(sportKey, group)
    const url =
      `${HOST}/sports/${encodeURIComponent(sportKey)}/events/${encodeURIComponent(eventId)}/odds/` +
      `?regions=${region}&markets=${encodeURIComponent(markets)}&oddsFormat=decimal&dateFormat=iso&apiKey=${this.apiKey()}`
    const { status, json } = await this.request(url)
    if (status === 404 || status === 422) return []
    if (!json || Array.isArray(json)) return []
    return this.cleanBookmakers((json as RawEvent).bookmakers || [])
  }

  async fetchScores(sportKey: string): Promise<Array<{
    id: string
    completed: boolean
    home_team: string
    away_team: string
    scores: Array<{ name: string; score: string }> | null
  }>> {
    if (!this.isConfigured()) return []
    if (this.quotaRemaining != null && this.quotaRemaining < 8) return []
    const url =
      `${HOST}/sports/${encodeURIComponent(sportKey)}/scores/` +
      `?daysFrom=3&dateFormat=iso&apiKey=${this.apiKey()}`
    const { status, json } = await this.request(url)
    if (status !== 200 || !Array.isArray(json)) return []
    return json as any
  }

  private apiKey() {
    return (process.env.ODDS_API_KEY || '').trim()
  }

  private async loadCatalog() {
    const sportsUrl = `${HOST}/sports/?apiKey=${this.apiKey()}`
    const { status, json } = await this.request(sportsUrl)
    if (status !== 200 || !Array.isArray(json)) {
      throw new Error(`Odds provider returned ${status} for sports list`)
    }
    this.sports = (json as SportRow[]).filter((sport) => sport?.key && sport.active !== false)
    this.sportsFetchedAt = Date.now()

    const playable = this.sports.filter((sport) => !sport.has_outrights)
    await this.mapPool(playable, 6, async (sport) => {
      const url = `${HOST}/sports/${encodeURIComponent(sport.key)}/events?dateFormat=iso&apiKey=${this.apiKey()}`
      try {
        const res = await this.request(url)
        const rows = Array.isArray(res.json) ? (res.json as RawEvent[]) : []
        this.events.set(sport.key, {
          fetchedAt: Date.now(),
          rows: rows.filter((row) => row?.id && row.home_team && row.away_team),
        })
      } catch {
        // Keep the previous catalog slice for this sport.
      }
    })
  }

  private async fillOdds(limit: number): Promise<string[]> {
    const due = this.dueSports()
    const priced: string[] = []
    for (const sport of due) {
      if (priced.length >= limit) break
      if (this.quotaRemaining != null && this.quotaRemaining < 6) break
      const ok = await this.fetchSportOdds(sport)
      if (ok) priced.push(sport.key)
    }
    return priced
  }

  private dueSports(): SportRow[] {
    const ttl = this.oddsTtlMs()
    const lowQuota = (this.quotaRemaining ?? 10_000) < 800
    const ranked = this.sports
      .filter((sport) => !sport.has_outrights && (this.events.get(sport.key)?.rows.length || 0) > 0)
      .map((sport) => ({ sport, soonest: this.soonestKickoff(sport.key) }))
      .filter((row) => row.soonest != null)
      .sort((a, b) => (a.soonest as number) - (b.soonest as number))

    return ranked
      .filter(({ sport, soonest }) => {
        const cached = this.odds.get(sport.key)
        const age = cached ? Date.now() - cached.fetchedAt : Number.POSITIVE_INFINITY
        if (age < ttl) return false
        if (!lowQuota) return true
        const delta = (soonest as number) - Date.now()
        return delta <= 6 * 60 * 60_000
      })
      .map((row) => row.sport)
  }

  private soonestKickoff(sportKey: string): number | null {
    const rows = this.events.get(sportKey)?.rows || []
    let best: number | null = null
    for (const row of rows) {
      const time = new Date(row.commence_time).getTime()
      if (!Number.isFinite(time)) continue
      if (best == null || time < best) best = time
    }
    return best
  }

  private oddsTtlMs() {
    const remaining = this.quotaRemaining
    if (remaining == null) return 20 * 60_000
    if (remaining > 20_000) return 8 * 60_000
    if (remaining > 5_000) return 20 * 60_000
    if (remaining > 1_500) return 60 * 60_000
    if (remaining > 400) return 6 * 60 * 60_000
    if (remaining > 80) return 12 * 60 * 60_000
    return Number.POSITIVE_INFINITY
  }

  private async fetchSportOdds(sport: SportRow): Promise<boolean> {
    const region = regionForSport(sport.key, sport.group)
    const url =
      `${HOST}/sports/${encodeURIComponent(sport.key)}/odds/` +
      `?regions=${region}&markets=${FEATURED_MARKETS}&oddsFormat=decimal&dateFormat=iso&apiKey=${this.apiKey()}`
    const { status, json } = await this.request(url)
    if (status !== 200 || !Array.isArray(json)) return false
    this.odds.set(sport.key, { fetchedAt: Date.now(), rows: json as RawEvent[] })
    return true
  }

  private cleanBookmakers(bookmakers: OddsBookmaker[]): OddsBookmaker[] {
    return (bookmakers || [])
      .map((book) => ({
        key: String(book.key || ''),
        title: String(book.title || book.key || 'Bookmaker'),
        last_update: book.last_update,
        markets: (book.markets || [])
          .map((market) => ({
            key: String(market.key || ''),
            last_update: market.last_update,
            outcomes: (market.outcomes || [])
              .filter((outcome) => outcome?.name && typeof outcome.price === 'number' && outcome.price > 1)
              .map((outcome) => ({
                name: String(outcome.name),
                price: Number(outcome.price),
                ...(typeof outcome.point === 'number' ? { point: Number(outcome.point) } : {}),
                ...(outcome.description ? { description: String(outcome.description) } : {}),
              })),
          }))
          .filter((market) => market.key && market.outcomes.length > 0),
      }))
      .filter((book) => book.key && book.markets.length > 0)
  }

  private async request(url: string): Promise<{ status: number; json: unknown }> {
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    const remaining = res.headers.get('x-requests-remaining')
    if (remaining != null && remaining !== '') {
      const parsed = Number(remaining)
      if (Number.isFinite(parsed)) this.quotaRemaining = parsed
    }
    this.meta.upstreamStatus = res.status
    if (res.status === 401) {
      throw new Error('Odds provider rejected the API key')
    }
    let json: unknown = null
    try {
      json = await res.json()
    } catch {
      json = null
    }
    return { status: res.status, json }
  }

  private async mapPool<T>(items: T[], limit: number, fn: (item: T) => Promise<void>) {
    if (!items.length) return
    let index = 0
    const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (index < items.length) {
        const current = items[index]
        index += 1
        await fn(current)
      }
    })
    await Promise.all(workers)
  }

  private async ensureDisk() {
    if (this.loadedDisk) return true
    this.loadedDisk = true
    try {
      const raw = await readFile(cacheFilePath(), 'utf8')
      const parsed = JSON.parse(raw) as CacheFile
      this.sports = Array.isArray(parsed.sports) ? parsed.sports : []
      this.sportsFetchedAt = Number(parsed.sportsFetchedAt) || 0
      this.quotaRemaining = parsed.quotaRemaining ?? null
      for (const [key, value] of Object.entries(parsed.events || {})) {
        this.events.set(key, value)
      }
      for (const [key, value] of Object.entries(parsed.odds || {})) {
        this.odds.set(key, value)
      }
    } catch {
      // First run has no cache.
    }
    return true
  }

  private async saveDisk() {
    const payload: CacheFile = {
      savedAt: new Date().toISOString(),
      quotaRemaining: this.quotaRemaining,
      sports: this.sports,
      sportsFetchedAt: this.sportsFetchedAt,
      events: Object.fromEntries(this.events),
      odds: Object.fromEntries(this.odds),
    }
    const path = cacheFilePath()
    await mkdir(join(path, '..'), { recursive: true })
    await writeFile(path, JSON.stringify(payload))
  }
}
