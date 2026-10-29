import { NormalizedEvent, OddsBookmaker, OddsOutcome } from './odds-api.provider'
import { EspnProp, goalsFromBoxscore, mapEspnProps } from '../espn-props'
import { buildCricketMarkets, cricketLiveScore } from '../cricket-markets'

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
  ['basketball', 'mens-college-basketball', 'Basketball', 'NCAAB'],
  ['football', 'college-football', 'American Football', 'NCAAF'],
  ['rugby', '270557', 'Rugby', 'United Rugby Championship'],
  ['rugby', '180659', 'Rugby', 'Rugby Championship'],
  ['rugby', '164205', 'Rugby', 'Six Nations'],
  ['rugby', '267979', 'Rugby', 'Premiership Rugby'],
  ['golf', 'pga', 'Golf', 'PGA TOUR'],
  ['golf', 'lpga', 'Golf', 'LPGA'],
  ['golf', 'liv', 'Golf', 'LIV Golf'],
  ['golf', 'eur', 'Golf', 'DP World Tour'],
  ['golf', 'ntw', 'Golf', 'Korn Ferry Tour'],
  ['golf', 'champions-tour', 'Golf', 'PGA TOUR Champions'],
  ['racing', 'f1', 'Racing', 'Formula 1'],
  ['racing', 'irl', 'Racing', 'IndyCar'],
  ['racing', 'nascar-premier', 'Racing', 'NASCAR Cup'],
  ['racing', 'nascar-secondary', 'Racing', 'NASCAR Xfinity'],
  ['racing', 'nascar-truck', 'Racing', 'NASCAR Truck'],
  ['mma', 'ufc', 'MMA', 'UFC'],
  ['mma', 'bellator', 'MMA', 'Bellator'],
  ['mma', 'ksw', 'MMA', 'KSW'],
  ['mma', 'cage-warriors', 'MMA', 'Cage Warriors'],
  ['mma', 'k1', 'MMA', 'K-1'],
  ['mma', 'lfa', 'MMA', 'LFA'],
].map(([sport, league, group, title]) => ({
  key: `${sport}/${league}`,
  sport,
  league,
  group,
  title,
}))

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

const HEADER_SPORTS = ['cricket', 'soccer', 'tennis', 'rugby', 'mma', 'basketball', 'football', 'baseball', 'hockey', 'golf', 'racing']

const GROUP_FOR_SPORT: Record<string, string> = {
  soccer: 'Soccer',
  cricket: 'Cricket',
  basketball: 'Basketball',
  football: 'American Football',
  baseball: 'Baseball',
  hockey: 'Ice Hockey',
  tennis: 'Tennis',
  rugby: 'Rugby',
  mma: 'MMA',
  golf: 'Golf',
  racing: 'Racing',
  boxing: 'Boxing',
}

export class EspnScoreboardProvider {
  private fetchedAt = new Map<string, number>()
  private soccerSlugs: string[] = []
  private slugsFetchedAt = 0
  private headerLeagues: LeagueTarget[] = []
  private headerEvents: NormalizedEvent[] = []
  private headerFetchedAt = 0
  private groupCursor = 0
  private rosterNames = new Map<string, Map<string, string>>()

  async refresh(batch: number): Promise<{ events: NormalizedEvent[]; priced: Map<string, Set<string>> }> {
    await Promise.all([this.ensureSoccerSlugs(), this.ensureHeaderLeagues()])
    const targets = this.nextTargets(batch)
    const events: NormalizedEvent[] = [...this.headerEvents]
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

  private allTargets(): LeagueTarget[] {
    const byKey = new Map<string, LeagueTarget>()
    for (const target of PRIORITY) byKey.set(target.key, target)
    for (const target of this.headerLeagues) {
      if (!byKey.has(target.key)) byKey.set(target.key, target)
    }
    for (const slug of this.soccerSlugs) {
      const key = `soccer/${slug}`
      if (byKey.has(key)) continue
      byKey.set(key, { key, sport: 'soccer', league: slug, group: 'Soccer', title: this.prettyLeague(slug) })
    }
    return [...byKey.values()]
  }

  private nextTargets(batch: number): LeagueTarget[] {
    const now = Date.now()
    const stale = (key: string) => now - (this.fetchedAt.get(key) || 0) > 8 * 60_000
    const all = this.allTargets()
    const byGroup = new Map<string, LeagueTarget[]>()
    for (const target of all) {
      const list = byGroup.get(target.group) || []
      list.push(target)
      byGroup.set(target.group, list)
    }
    const groups = [...byGroup.keys()]
    const picked: LeagueTarget[] = []
    const seen = new Set<string>()
    let spins = 0
    while (picked.length < batch && groups.length && spins < groups.length * 12) {
      const group = groups[this.groupCursor % groups.length]
      this.groupCursor += 1
      spins += 1
      const next = (byGroup.get(group) || []).find((target) => stale(target.key) && !seen.has(target.key))
      if (!next) continue
      seen.add(next.key)
      picked.push(next)
    }
    if (picked.length < batch) {
      for (const target of all) {
        if (picked.length >= batch) break
        if (seen.has(target.key) || !stale(target.key)) continue
        picked.push(target)
      }
    }
    return picked
  }

  private async ensureHeaderLeagues() {
    if (this.headerLeagues.length && Date.now() - this.headerFetchedAt < 6 * 60 * 60_000) return
    const found: LeagueTarget[] = []
    const headerEvents: NormalizedEvent[] = []
    const queries: Array<{ sport: string; region?: string }> = [
      ...HEADER_SPORTS.map((sport) => ({ sport })),
      { sport: 'cricket', region: 'in' },
      { sport: 'cricket', region: 'gb' },
      { sport: 'cricket', region: 'au' },
      { sport: 'cricket', region: 'za' },
      { sport: 'cricket', region: 'us' },
    ]
    await this.mapPool(queries, 4, async ({ sport, region }) => {
      const extra = region ? `&region=${encodeURIComponent(region)}` : ''
      const json = await this.fetchJson(
        `https://site.web.api.espn.com/apis/v2/scoreboard/header?sport=${encodeURIComponent(sport)}${extra}`,
      )
      const rows = Array.isArray(json?.sports) ? json.sports : []
      for (const row of rows) {
        const espnSport = String(row?.slug || sport)
        const group = GROUP_FOR_SPORT[espnSport] || String(row?.name || espnSport)
        for (const league of Array.isArray(row?.leagues) ? row.leagues : []) {
          const leagueSlug = String(league?.slug || league?.id || '').trim()
          if (!leagueSlug) continue
          const title = String(league?.name || league?.abbreviation || leagueSlug)
          const key = `${espnSport}/${leagueSlug}`
          const target = { key, sport: espnSport, league: leagueSlug, group, title }
          found.push(target)
          for (const event of Array.isArray(league?.events) ? league.events : []) {
            const mapped = this.mapHeaderEvent(event, target, title)
            if (mapped) headerEvents.push(mapped)
          }
        }
      }
    })
    if (found.length) {
      this.headerLeagues = found
      this.headerEvents = headerEvents
      this.headerFetchedAt = Date.now()
    }
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
    const base = `https://site.api.espn.com/apis/site/v2/sports/${encodeURIComponent(target.sport)}/${encodeURIComponent(target.league)}/scoreboard?limit=100`
    try {
      const first = await this.fetchJson(base)
      if (!first) return []
      const leagueName = first?.leagues?.[0]?.name || first?.leagues?.[0]?.abbreviation || target.title
      const calendar = Array.isArray(first?.leagues?.[0]?.calendar) ? first.leagues[0].calendar : []
      const extraDates =
        target.sport === 'cricket' || target.sport === 'tennis' || target.sport === 'mma' || target.sport === 'golf' || target.sport === 'racing'
          ? calendar
              .map((value: string) => String(value).slice(0, 10).replace(/-/g, ''))
              .filter((value: string) => /^\d{8}$/.test(value))
              .slice(0, 6)
          : []
      const pages = [first]
      await this.mapPool(extraDates, 3, async (date) => {
        const json = await this.fetchJson(`${base}&dates=${date}`)
        if (json) pages.push(json)
      })
      const seen = new Set<string>()
      const out: NormalizedEvent[] = []
      for (const json of pages) {
        for (const event of Array.isArray(json?.events) ? json.events : []) {
          const mappedEvents = this.mapEvent(event, target, leagueName)
          for (const mapped of mappedEvents) {
            if (!mapped || seen.has(mapped.externalId)) continue
            seen.add(mapped.externalId)
            out.push(mapped)
          }
        }
      }
      return out
    } catch {
      return []
    }
  }

  private numericScore(raw: unknown): number | null {
    const text = String(raw ?? '').trim()
    if (!text) return null
    const direct = Number(text)
    if (Number.isFinite(direct)) return direct
    const match = text.match(/-?\d+(\.\d+)?/)
    if (!match) return null
    const value = Number(match[0])
    return Number.isFinite(value) ? value : null
  }

  private competitorName(row: any): string {
    return String(
      row?.athlete?.displayName ||
        row?.athlete?.fullName ||
        row?.team?.displayName ||
        row?.team?.name ||
        '',
    ).trim()
  }

  private mapEvent(event: any, target: LeagueTarget, leagueName: string): NormalizedEvent[] {
    if (!event?.id) return []
    const competitions = Array.isArray(event?.competitions) && event.competitions.length ? event.competitions : [event]
    const manyCards = competitions.length > 1
    const out: NormalizedEvent[] = []
    competitions.forEach((competition: any) => {
      const competitors = competition?.competitors || []
      const home = competitors.find((row: any) => row?.homeAway === 'home') || competitors[0]
      const away = competitors.find((row: any) => row?.homeAway === 'away') || competitors[1]
      let homeTeam = this.competitorName(home)
      let awayTeam = this.competitorName(away)
      if (competitors.length > 2) {
        homeTeam = String(event?.shortName || event?.name || leagueName || 'Event').trim()
        awayTeam = 'Field'
      }
      if (!homeTeam || !awayTeam) return
      const state = String(competition?.status?.type?.state || event?.status?.type?.state || '')
      const completed = Boolean(competition?.status?.type?.completed || event?.status?.type?.completed) || state === 'post'
      const homeRaw = String(home?.score ?? '').trim()
      const awayRaw = String(away?.score ?? '').trim()
      const homeScore = Number(homeRaw)
      const awayScore = Number(awayRaw)
      const bookmakers = this.mapBookmakers(competition?.odds || event?.competitions?.[0]?.odds, homeTeam, awayTeam)
      const compId = String(competition?.id || '')
      const externalId =
        manyCards && compId && compId !== String(event.id) ? `espn-${event.id}-c${compId}` : `espn-${event.id}`
      const scoreText =
        homeRaw && awayRaw && (!Number.isFinite(homeScore) || !Number.isFinite(awayScore))
          ? { home: homeRaw, away: awayRaw }
          : undefined
      out.push({
        externalId,
        sportKey: target.key,
        sportGroup: target.group,
        sportTitle: leagueName || target.title,
        homeTeam,
        awayTeam,
        commenceTime: competition?.date || event.date || new Date().toISOString(),
        bookmakers,
        source: 'espn',
        completed,
        homeScore: Number.isFinite(homeScore) ? homeScore : null,
        awayScore: Number.isFinite(awayScore) ? awayScore : null,
        scoreText,
      })
    })
    return out
  }

  private mapHeaderEvent(event: any, target: LeagueTarget, leagueName: string): NormalizedEvent | null {
    const id = String(event?.id || event?.competitionId || '')
    if (!id) return null
    const competitors = event?.competitors || event?.competitions?.[0]?.competitors || []
    const home = competitors.find((row: any) => row?.homeAway === 'home') || competitors[0]
    const away = competitors.find((row: any) => row?.homeAway === 'away') || competitors[1]
    let homeTeam = this.competitorName(home)
    let awayTeam = this.competitorName(away)
    if (!homeTeam || !awayTeam) {
      const parts = String(event?.name || event?.shortName || '')
        .split(/\s+v(?:s\.?)?\s+/i)
        .map((part) => part.trim())
        .filter(Boolean)
      homeTeam = parts[0] || ''
      awayTeam = parts[1] || ''
    }
    if (!homeTeam || !awayTeam) return null
    const state = String(event?.fullStatus?.type?.state || event?.status || '')
    const completed = Boolean(event?.fullStatus?.type?.completed) || state === 'post'
    const homeRaw = String(home?.score ?? event?.homeScore ?? '').trim()
    const awayRaw = String(away?.score ?? event?.awayScore ?? '').trim()
    const homeScore = Number(homeRaw)
    const awayScore = Number(awayRaw)
    return {
      externalId: `espn-${id}`,
      sportKey: target.key,
      sportGroup: target.group,
      sportTitle: leagueName || target.title,
      homeTeam,
      awayTeam,
      commenceTime: event.date || event.startDate || new Date().toISOString(),
      bookmakers: this.mapBookmakers(event?.odds, homeTeam, awayTeam),
      source: 'espn',
      completed,
      homeScore: Number.isFinite(homeScore) ? homeScore : null,
      awayScore: Number.isFinite(awayScore) ? awayScore : null,
      scoreText:
        homeRaw && awayRaw && (!Number.isFinite(homeScore) || !Number.isFinite(awayScore))
          ? { home: homeRaw, away: awayRaw }
          : undefined,
    }
  }

  private mapBookmakers(oddsList: any[] | undefined, homeTeam: string, awayTeam: string): OddsBookmaker[] {
    if (!Array.isArray(oddsList)) return []
    const books: OddsBookmaker[] = []
    for (const odds of oddsList) {
      const markets = []
      const h2h: OddsOutcome[] = []
      const homeMl = americanToDecimal(
        odds?.moneyline?.home?.close?.odds ?? odds?.homeTeamOdds?.moneyLine ?? odds?.homeTeamOdds?.odds,
      )
      const awayMl = americanToDecimal(
        odds?.moneyline?.away?.close?.odds ?? odds?.awayTeamOdds?.moneyLine ?? odds?.awayTeamOdds?.odds,
      )
      const drawMl = americanToDecimal(
        odds?.moneyline?.draw?.close?.odds ?? odds?.drawOdds?.moneyLine ?? odds?.drawOdds?.odds,
      )
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

  async fetchDetailMarkets(
    sportKey: string,
    externalId: string,
  ): Promise<{
    bookmaker: OddsBookmaker | null
    live?: { teamA: string | null; teamB: string | null; batting?: unknown; lastBallSequence?: number }
  } | null> {
    const parsed = this.parseEvent(sportKey, externalId)
    if (!parsed) return null
    const { sport, league, eventId } = parsed
    const isCricket = sport === 'cricket'
    const [summary, props, coreOdds, playByPlay] = await Promise.all([
      this.fetchJson(
        `https://site.api.espn.com/apis/site/v2/sports/${encodeURIComponent(sport)}/${encodeURIComponent(league)}/summary?event=${encodeURIComponent(eventId)}`,
      ),
      isCricket ? Promise.resolve(null) : this.fetchPropItems(sport, league, eventId),
      isCricket ? Promise.resolve([]) : this.fetchCoreOdds(sport, league, eventId),
      isCricket
        ? this.fetchJson(
            `https://site.api.espn.com/apis/site/v2/sports/${encodeURIComponent(sport)}/${encodeURIComponent(league)}/playbyplay?event=${encodeURIComponent(eventId)}`,
          )
        : Promise.resolve(null),
    ])
    const teams = this.teamsFromSummary(summary)
    const homeTeam = String(summary?.header?.competitions?.[0]?.competitors?.find((row: { homeAway?: string }) => row?.homeAway === 'home')?.team?.displayName || [...teams.values()][0] || '').trim()
    const awayTeam = String(summary?.header?.competitions?.[0]?.competitors?.find((row: { homeAway?: string }) => row?.homeAway === 'away')?.team?.displayName || [...teams.values()][1] || '').trim()
    const fromHeader = this.mapBookmakers(
      summary?.header?.competitions?.[0]?.odds || summary?.pickcenter,
      homeTeam,
      awayTeam,
    )
    const fromCore = this.mapBookmakers(coreOdds, homeTeam, awayTeam)
    let propMarkets: OddsBookmaker['markets'] = []
    if (props?.length) {
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
      propMarkets = mapEspnProps(props, athletes, teams)
    }
    const merged = this.mergeMarketLists([
      ...fromHeader.flatMap((book) => book.markets),
      ...fromCore.flatMap((book) => book.markets),
      ...propMarkets,
    ])
    const live = isCricket && summary ? cricketLiveScore(summary, playByPlay) : undefined
    if (isCricket && summary && homeTeam && awayTeam) {
      const nested = buildCricketMarkets({
        summary,
        playByPlay,
        homeTeam,
        awayTeam,
      })
      const existing = new Set(merged.map((market) => market.key))
      for (const market of nested) {
        if (market.key === 'h2h' && existing.has('h2h')) continue
        if (market.key === 'totals' && existing.has('totals')) continue
        const current = merged.find((row) => row.key === market.key)
        if (!current) merged.push(market)
        else if (!current.outcomes.length) current.outcomes = market.outcomes
      }
    }
    return {
      bookmaker: { key: 'espn', title: isCricket && !fromHeader.length && !fromCore.length ? 'Arena' : 'ESPN', markets: merged },
      live,
    }
  }

  async fetchCricketSummary(sportKey: string, externalId: string) {
    const parsed = this.parseEvent(sportKey, externalId)
    if (!parsed || parsed.sport !== 'cricket') return null
    return this.fetchJson(
      `https://site.api.espn.com/apis/site/v2/sports/${encodeURIComponent(parsed.sport)}/${encodeURIComponent(parsed.league)}/summary?event=${encodeURIComponent(parsed.eventId)}`,
    )
  }

  async fetchCricketContext(sportKey: string, externalId: string) {
    const parsed = this.parseEvent(sportKey, externalId)
    if (!parsed || parsed.sport !== 'cricket') return null
    const [summary, playByPlay] = await Promise.all([
      this.fetchJson(
        `https://site.api.espn.com/apis/site/v2/sports/${encodeURIComponent(parsed.sport)}/${encodeURIComponent(parsed.league)}/summary?event=${encodeURIComponent(parsed.eventId)}`,
      ),
      this.fetchJson(
        `https://site.api.espn.com/apis/site/v2/sports/${encodeURIComponent(parsed.sport)}/${encodeURIComponent(parsed.league)}/playbyplay?event=${encodeURIComponent(parsed.eventId)}`,
      ),
    ])
    return { summary, playByPlay }
  }

  private mergeMarketLists(markets: OddsBookmaker['markets']): OddsBookmaker['markets'] {
    const byKey = new Map<string, OddsBookmaker['markets'][number]>()
    for (const market of markets) {
      const current = byKey.get(market.key)
      if (!current) {
        byKey.set(market.key, { key: market.key, outcomes: [...(market.outcomes || [])] })
        continue
      }
      for (const outcome of market.outcomes || []) {
        const existing = current.outcomes.find(
          (row) => row.name === outcome.name && row.point === outcome.point && row.description === outcome.description,
        )
        if (!existing) current.outcomes.push(outcome)
        else if (outcome.price > existing.price) existing.price = outcome.price
      }
    }
    return [...byKey.values()].filter((market) => market.outcomes.length > 0)
  }

  private async fetchCoreOdds(sport: string, league: string, eventId: string) {
    const base = `https://sports.core.api.espn.com/v2/sports/${encodeURIComponent(sport)}/leagues/${encodeURIComponent(league)}/events/${eventId}/competitions/${eventId}/odds`
    const json = await this.fetchJson(`${base}?limit=200`)
    const items = Array.isArray(json?.items) ? json.items : json ? [json] : []
    const resolved: unknown[] = []
    for (const item of items.slice(0, 12)) {
      const ref = String(item?.$ref || '').replace(/^http:\/\//, 'https://')
      if (item?.provider || item?.moneyline || item?.homeTeamOdds) {
        resolved.push(item)
        continue
      }
      if (ref) {
        const full = await this.fetchJson(ref)
        if (full) resolved.push(full)
      }
    }
    return resolved
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
    const raw = String(externalId || '').replace(/^espn-/, '')
    const match = raw.match(/^(\d+)(?:-c(\d+))?$/)
    const eventId = match?.[1] || ''
    if (!sport || !league || !eventId) return null
    return { sport, league, eventId, competitionId: match?.[2] || null }
  }

  async fetchEventResult(
    sportKey: string,
    externalId: string,
    commenceTime?: Date | string | null,
  ): Promise<{
    completed: boolean
    homeName: string
    awayName: string
    homeScore: number | null
    awayScore: number | null
  } | null> {
    const parsed = this.parseEvent(sportKey, externalId)
    if (!parsed) return null
    const { sport, league, eventId, competitionId } = parsed
    const summary = await this.fetchJson(
      `https://site.api.espn.com/apis/site/v2/sports/${encodeURIComponent(sport)}/${encodeURIComponent(league)}/summary?event=${encodeURIComponent(eventId)}`,
    )
    let fromSummary = this.resultFromCompetitions(
      summary?.header?.competitions || summary?.competitions || [],
      competitionId,
    )
    if (fromSummary) return fromSummary

    const date = commenceTime ? new Date(commenceTime) : null
    const ymd =
      date && Number.isFinite(date.getTime())
        ? date.toISOString().slice(0, 10).replace(/-/g, '')
        : ''
    if (ymd) {
      const board = await this.fetchJson(
        `https://site.api.espn.com/apis/site/v2/sports/${encodeURIComponent(sport)}/${encodeURIComponent(league)}/scoreboard?dates=${ymd}&limit=100`,
      )
      const event = (board?.events || []).find((row: any) => String(row?.id) === eventId)
      fromSummary = this.resultFromCompetitions(event?.competitions || [], competitionId)
      if (fromSummary) return fromSummary
    }
    return null
  }

  private resultFromCompetitions(competitions: any[], competitionId: string | null) {
    if (!Array.isArray(competitions) || !competitions.length) return null
    const competition =
      (competitionId && competitions.find((row) => String(row?.id) === competitionId)) || competitions[0]
    const competitors = competition?.competitors || []
    if (competitors.length !== 2) return null
    const home = competitors.find((row: any) => row?.homeAway === 'home') || competitors[0]
    const away = competitors.find((row: any) => row?.homeAway === 'away') || competitors[1]
    const homeName = this.competitorName(home)
    const awayName = this.competitorName(away)
    if (!homeName || !awayName) return null
    const state = String(competition?.status?.type?.state || '')
    const completed = Boolean(competition?.status?.type?.completed) || state === 'post'
    const homeScore = this.numericScore(home?.score)
    const awayScore = this.numericScore(away?.score)
    return {
      completed,
      homeName,
      awayName,
      homeScore,
      awayScore,
    }
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
