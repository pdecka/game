import { NormalizedEvent, OddsBookmaker, OddsOutcome } from './odds-api.provider'
import { EspnProp, goalsFromBoxscore, mapEspnProps } from '../espn-props'

type LeagueTarget = {
  key: string
  sport: string
  league: string
  group: string
  title: string
}

const PRIORITY: LeagueTarget[] = [
  ['soccer', 'eng.1', 'Soccer', 'Premier League'],
  ['soccer', 'eng.2', 'Soccer', 'Championship'],
  ['soccer', 'eng.fa', 'Soccer', 'FA Cup'],
  ['soccer', 'uefa.champions', 'Soccer', 'Champions League'],
  ['soccer', 'uefa.europa', 'Soccer', 'Europa League'],
  ['soccer', 'uefa.europa.conf', 'Soccer', 'Conference League'],
  ['soccer', 'esp.1', 'Soccer', 'La Liga'],
  ['soccer', 'ger.1', 'Soccer', 'Bundesliga'],
  ['soccer', 'ita.1', 'Soccer', 'Serie A'],
  ['soccer', 'fra.1', 'Soccer', 'Ligue 1'],
  ['soccer', 'ned.1', 'Soccer', 'Eredivisie'],
  ['soccer', 'por.1', 'Soccer', 'Primeira Liga'],
  ['soccer', 'sco.1', 'Soccer', 'Scottish Premiership'],
  ['soccer', 'bel.1', 'Soccer', 'Belgian Pro League'],
  ['soccer', 'tur.1', 'Soccer', 'Super Lig'],
  ['soccer', 'usa.1', 'Soccer', 'MLS'],
  ['soccer', 'mex.1', 'Soccer', 'Liga MX'],
  ['soccer', 'bra.1', 'Soccer', 'Brasileirao'],
  ['soccer', 'arg.1', 'Soccer', 'Argentine Primera'],
  ['soccer', 'ksa.1', 'Soccer', 'Saudi Pro League'],
  ['soccer', 'aus.1', 'Soccer', 'A-League'],
  ['soccer', 'jpn.1', 'Soccer', 'J.League'],
  ['soccer', 'chn.1', 'Soccer', 'Chinese Super League'],
  ['soccer', 'ind.1', 'Soccer', 'Indian Super League'],
  ['soccer', 'caf.nations', 'Soccer', 'Africa Cup of Nations'],
  ['soccer', 'caf.championship', 'Soccer', 'CAF Champions League'],
  ['soccer', 'afc.champions', 'Soccer', 'AFC Champions League'],
  ['soccer', 'conmebol.libertadores', 'Soccer', 'Copa Libertadores'],
  ['soccer', 'fifa.world', 'Soccer', 'FIFA World Cup'],
  ['soccer', 'fifa.worldq.caf', 'Soccer', 'World Cup Qualifying Africa'],
  ['soccer', 'fifa.worldq.uefa', 'Soccer', 'World Cup Qualifying Europe'],
  ['soccer', 'fifa.worldq.afc', 'Soccer', 'World Cup Qualifying Asia'],
  ['basketball', 'nba', 'Basketball', 'NBA'],
  ['basketball', 'wnba', 'Basketball', 'WNBA'],
  ['football', 'nfl', 'American Football', 'NFL'],
  ['baseball', 'mlb', 'Baseball', 'MLB'],
  ['hockey', 'nhl', 'Ice Hockey', 'NHL'],
  ['mma', 'ufc', 'MMA', 'UFC'],
  ['tennis', 'atp', 'Tennis', 'ATP'],
  ['tennis', 'wta', 'Tennis', 'WTA'],
  ['rugby', '270557', 'Rugby', 'Rugby'],
  ['rugby', '180659', 'Rugby', 'Rugby'],
  ['rugby', '164205', 'Rugby', 'Rugby'],
].map(([sport, league, group, title]) => ({
  key: `${sport}/${league}`,
  sport,
  league,
  group,
  title,
}))

const PRIORITY_KEYS = new Set(PRIORITY.map((item) => item.key))

function americanToDecimal(raw: unknown): number | null {
  if (raw == null || raw === '') return null
  const text = String(raw).trim().replace('+', '')
  if (!text || text.toLowerCase() === 'even') return 2
  const value = Number(text)
  if (!Number.isFinite(value) || value === 0) return null
  const decimal = value > 0 ? value / 100 + 1 : 100 / Math.abs(value) + 1
  const rounded = Math.round(decimal * 100) / 100
  return rounded > 1 ? rounded : null
}

function lineNumber(raw: unknown): number | null {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw
  if (raw == null) return null
  const match = String(raw).match(/-?\d+(\.\d+)?/)
  if (!match) return null
  const value = Number(match[0])
  return Number.isFinite(value) ? value : null
}

function closeOdds(side: any): { line: number | null; price: number | null } {
  const node = side?.close || side?.open || side
  return {
    line: lineNumber(node?.line),
    price: americanToDecimal(node?.odds ?? node?.moneyLine),
  }
}

export class EspnScoreboardProvider {
  private fetchedAt = new Map<string, number>()
  private soccerSlugs: string[] = []
  private slugsFetchedAt = 0
  private slugCursor = 0
  private rosterNames = new Map<string, Map<string, string>>()

  async refresh(batch: number): Promise<{ events: NormalizedEvent[]; priced: Map<string, Set<string>> }> {
    await this.ensureSoccerSlugs()
    const targets = this.nextTargets(batch)
    const events: NormalizedEvent[] = []
    const priced = new Map<string, Set<string>>()
    await this.mapPool(targets, 6, async (target) => {
      const rows = await this.fetchLeague(target)
      this.fetchedAt.set(target.key, Date.now())
      priced.set(target.key, new Set(rows.map((row) => row.externalId)))
      events.push(...rows)
    })
    if (events.length) {
      const leagues = new Set(events.map((event) => event.sportTitle)).size
      console.log(`[sports] ESPN board updated: ${events.length} matches across ${leagues} competitions`)
    }
    return { events, priced }
  }

  private nextTargets(batch: number): LeagueTarget[] {
    const now = Date.now()
    const stale = (key: string) => now - (this.fetchedAt.get(key) || 0) > 8 * 60_000
    const picked: LeagueTarget[] = []
    for (const target of PRIORITY) {
      if (picked.length >= batch) return picked
      if (stale(target.key)) picked.push(target)
    }
    const extra = this.soccerSlugs.filter((slug) => !PRIORITY_KEYS.has(`soccer/${slug}`))
    let guard = 0
    while (picked.length < batch && extra.length && guard < extra.length) {
      const slug = extra[this.slugCursor % extra.length]
      this.slugCursor += 1
      guard += 1
      const key = `soccer/${slug}`
      if (!stale(key)) continue
      picked.push({ key, sport: 'soccer', league: slug, group: 'Soccer', title: this.prettyLeague(slug) })
    }
    return picked
  }

  private prettyLeague(slug: string) {
    return slug
      .split('.')
      .filter((part) => part !== '1')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  }

  private async ensureSoccerSlugs() {
    if (this.soccerSlugs.length && Date.now() - this.slugsFetchedAt < 12 * 60 * 60_000) return
    try {
      const res = await fetch('https://sports.core.api.espn.com/v2/sports/soccer/leagues?limit=300', {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) return
      const json = (await res.json()) as { items?: Array<{ $ref?: string }> }
      const slugs = (json.items || [])
        .map((item) => {
          const ref = String(item?.$ref || '')
          const slug = ref.split('/leagues/')[1]?.split('?')[0]
          return slug ? decodeURIComponent(slug) : ''
        })
        .filter(Boolean)
      if (slugs.length) {
        this.soccerSlugs = slugs
        this.slugsFetchedAt = Date.now()
      }
    } catch {
      // Priority leagues still load if the catalog call fails.
    }
  }

  private async fetchLeague(target: LeagueTarget): Promise<NormalizedEvent[]> {
    const url = `https://site.api.espn.com/apis/site/v2/sports/${encodeURIComponent(target.sport)}/${encodeURIComponent(target.league)}/scoreboard?limit=100`
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) return []
      const json = (await res.json()) as any
      const leagueName = json?.leagues?.[0]?.name || json?.leagues?.[0]?.abbreviation || target.title
      const events = Array.isArray(json?.events) ? json.events : []
      const out: NormalizedEvent[] = []
      for (const event of events) {
        const mapped = this.mapEvent(event, target, leagueName)
        if (mapped) out.push(mapped)
      }
      return out
    } catch {
      return []
    }
  }

  private mapEvent(event: any, target: LeagueTarget, leagueName: string): NormalizedEvent | null {
    const competition = event?.competitions?.[0]
    const competitors = competition?.competitors || []
    const home = competitors.find((row: any) => row?.homeAway === 'home') || competitors[0]
    const away = competitors.find((row: any) => row?.homeAway === 'away') || competitors[1]
    const homeTeam = String(home?.team?.displayName || home?.team?.name || '').trim()
    const awayTeam = String(away?.team?.displayName || away?.team?.name || '').trim()
    if (!event?.id || !homeTeam || !awayTeam) return null

    const state = String(event?.status?.type?.state || '')
    const completed = Boolean(event?.status?.type?.completed) || state === 'post'
    const homeScore = Number(home?.score)
    const awayScore = Number(away?.score)
    const bookmakers = this.mapBookmakers(competition?.odds, homeTeam, awayTeam)

    return {
      externalId: `espn-${event.id}`,
      sportKey: target.key,
      sportGroup: target.group,
      sportTitle: leagueName || target.title,
      homeTeam,
      awayTeam,
      commenceTime: event.date || event?.competitions?.[0]?.date || new Date().toISOString(),
      bookmakers,
      source: 'espn',
      completed,
      homeScore: Number.isFinite(homeScore) ? homeScore : null,
      awayScore: Number.isFinite(awayScore) ? awayScore : null,
    }
  }

  private mapBookmakers(oddsList: any[] | undefined, homeTeam: string, awayTeam: string): OddsBookmaker[] {
    if (!Array.isArray(oddsList)) return []
    const books: OddsBookmaker[] = []
    for (const odds of oddsList) {
      const markets = []
      const h2h: OddsOutcome[] = []
      const homeMl = americanToDecimal(odds?.moneyline?.home?.close?.odds ?? odds?.homeTeamOdds?.moneyLine)
      const awayMl = americanToDecimal(odds?.moneyline?.away?.close?.odds ?? odds?.awayTeamOdds?.moneyLine)
      const drawMl = americanToDecimal(odds?.moneyline?.draw?.close?.odds ?? odds?.drawOdds?.moneyLine)
      if (homeMl) h2h.push({ name: homeTeam, price: homeMl })
      if (drawMl) h2h.push({ name: 'Draw', price: drawMl })
      if (awayMl) h2h.push({ name: awayTeam, price: awayMl })
      if (h2h.length >= 2) markets.push({ key: 'h2h', outcomes: h2h })

      const homeSpread = closeOdds(odds?.pointSpread?.home || odds?.spread?.home)
      const awaySpread = closeOdds(odds?.pointSpread?.away || odds?.spread?.away)
      const spreads: OddsOutcome[] = []
      if (homeSpread.price != null && homeSpread.line != null) {
        spreads.push({ name: homeTeam, price: homeSpread.price, point: homeSpread.line })
      }
      if (awaySpread.price != null && awaySpread.line != null) {
        spreads.push({ name: awayTeam, price: awaySpread.price, point: awaySpread.line })
      }
      if (spreads.length === 2) markets.push({ key: 'spreads', outcomes: spreads })

      const over = closeOdds(odds?.total?.over)
      const under = closeOdds(odds?.total?.under)
      const totalLine = over.line ?? under.line ?? (typeof odds?.overUnder === 'number' ? odds.overUnder : null)
      const totals: OddsOutcome[] = []
      if (over.price != null && totalLine != null) totals.push({ name: 'Over', price: over.price, point: Math.abs(totalLine) })
      if (under.price != null && totalLine != null) totals.push({ name: 'Under', price: under.price, point: Math.abs(totalLine) })
      if (totals.length === 2) markets.push({ key: 'totals', outcomes: totals })

      if (!markets.length) continue
      const name = String(odds?.provider?.displayName || odds?.provider?.name || 'DraftKings')
      books.push({
        key: name.toLowerCase().replace(/[^a-z0-9]+/g, '') || 'draftkings',
        title: name,
        markets,
      })
    }
    return books
  }

  async fetchDetailMarkets(sportKey: string, externalId: string): Promise<OddsBookmaker | null> {
    const parsed = this.parseEvent(sportKey, externalId)
    if (!parsed) return null
    const { sport, league, eventId } = parsed
    const [summary, props] = await Promise.all([
      this.fetchJson(
        `https://site.api.espn.com/apis/site/v2/sports/${encodeURIComponent(sport)}/${encodeURIComponent(league)}/summary?event=${encodeURIComponent(eventId)}`,
      ),
      this.fetchPropItems(sport, league, eventId),
    ])
    if (!props) return null
    const teams = this.teamsFromSummary(summary)
    const athletes = new Map<string, string>()
    const teamIds = new Set<string>(teams.keys())
    for (const item of props) {
      const teamId = refId(item?.team?.$ref, 'teams')
      if (teamId) teamIds.add(teamId)
    }
    await this.mapPool([...teamIds], 4, async (teamId) => {
      if (!teams.has(teamId)) {
        const name = await this.teamName(sport, league, teamId)
        if (name) teams.set(teamId, name)
      }
      const roster = await this.teamRoster(sport, league, teamId)
      for (const [id, name] of roster) athletes.set(id, name)
    })
    const missing = new Map<string, string>()
    for (const item of props) {
      const athleteId = refId(item?.athlete?.$ref, 'athletes')
      const ref = String(item?.athlete?.$ref || '').replace(/^http:\/\//, 'https://')
      if (athleteId && ref && !athletes.has(athleteId)) missing.set(athleteId, ref)
    }
    await this.mapPool([...missing.entries()].slice(0, 80), 6, async ([athleteId, ref]) => {
      const json = await this.fetchJson(ref)
      const name = String(json?.displayName || json?.fullName || '').trim()
      if (name) athletes.set(athleteId, name)
    })
    const markets = mapEspnProps(props, athletes, teams)
    return { key: 'draftkings', title: 'DraftKings', markets }
  }

  async fetchPlayerGoals(sportKey: string, externalId: string): Promise<Map<string, number> | null> {
    const parsed = this.parseEvent(sportKey, externalId)
    if (!parsed) return null
    const summary = await this.fetchJson(
      `https://site.api.espn.com/apis/site/v2/sports/${encodeURIComponent(parsed.sport)}/${encodeURIComponent(parsed.league)}/summary?event=${encodeURIComponent(parsed.eventId)}`,
    )
    return goalsFromBoxscore(summary?.boxscore)
  }

  private parseEvent(sportKey: string, externalId: string) {
    const [sport, league] = String(sportKey || '').split('/')
    const eventId = String(externalId || '').replace(/^espn-/, '')
    if (!sport || !league || !/^\d+$/.test(eventId)) return null
    return { sport, league, eventId }
  }

  private async fetchPropItems(sport: string, league: string, eventId: string): Promise<EspnProp[] | null> {
    const base = `https://sports.core.api.espn.com/v2/sports/${encodeURIComponent(sport)}/leagues/${encodeURIComponent(league)}/events/${eventId}/competitions/${eventId}/odds/100/propBets?lang=en&region=us`
    const first = await this.fetchJson(`${base}&limit=200&page=1`)
    if (!first || !Array.isArray(first.items)) return null
    const items: EspnProp[] = [...first.items]
    const count = Number(first.count || items.length)
    const pageCount = Math.min(Number(first.pageCount || 1), 4)
    for (let page = 2; page <= pageCount && items.length < count; page += 1) {
      const next = await this.fetchJson(`${base}&limit=200&page=${page}`)
      const batch: EspnProp[] = Array.isArray(next?.items) ? next.items : []
      if (!batch.length) break
      if (propSignature(batch[0]) === propSignature(items[0])) break
      items.push(...batch)
    }
    return items
  }

  private teamsFromSummary(summary: any) {
    const teams = new Map<string, string>()
    for (const row of summary?.rosters || []) {
      const id = String(row?.team?.id || '')
      const name = String(row?.team?.displayName || '').trim()
      if (id && name) teams.set(id, name)
    }
    for (const competition of summary?.header?.competitions || []) {
      for (const side of competition?.competitors || []) {
        const id = String(side?.team?.id || '')
        const name = String(side?.team?.displayName || side?.team?.name || '').trim()
        if (id && name) teams.set(id, name)
      }
    }
    return teams
  }

  private async teamRoster(sport: string, league: string, teamId: string) {
    const cacheKey = `${sport}/${league}/${teamId}`
    const cached = this.rosterNames.get(cacheKey)
    if (cached) return cached
    const json = await this.fetchJson(
      `https://site.api.espn.com/apis/site/v2/sports/${encodeURIComponent(sport)}/${encodeURIComponent(league)}/teams/${encodeURIComponent(teamId)}/roster`,
    )
    const names = new Map<string, string>()
    for (const athlete of json?.athletes || []) {
      const id = String(athlete?.id || '')
      const name = String(athlete?.displayName || athlete?.fullName || '').trim()
      if (id && name) names.set(id, name)
    }
    this.rosterNames.set(cacheKey, names)
    return names
  }

  private async teamName(sport: string, league: string, teamId: string) {
    const json = await this.fetchJson(
      `https://site.api.espn.com/apis/site/v2/sports/${encodeURIComponent(sport)}/${encodeURIComponent(league)}/teams/${encodeURIComponent(teamId)}`,
    )
    return String(json?.team?.displayName || json?.displayName || '').trim()
  }

  private async fetchJson(url: string) {
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) return null
      return await res.json()
    } catch {
      return null
    }
  }

  private async mapPool<T>(items: T[], limit: number, fn: (item: T) => Promise<void>) {
    if (!items.length) return
    let index = 0
    await Promise.all(
      Array.from({ length: Math.min(limit, items.length) }, async () => {
        while (index < items.length) {
          const current = items[index]
          index += 1
          await fn(current)
        }
      }),
    )
  }
}

function propSignature(item: EspnProp | undefined) {
  return `${item?.type?.name || ''}|${item?.athlete?.$ref || ''}|${item?.team?.$ref || ''}|${item?.current?.target?.value ?? ''}|${item?.current?.over?.decimal ?? ''}`
}

function refId(ref: string | undefined, kind: 'athletes' | 'teams') {
  const match = String(ref || '').match(new RegExp(`/${kind}/(\\d+)`))
  return match ? match[1] : ''
}
