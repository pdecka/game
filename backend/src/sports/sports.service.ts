import { BadRequestException, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { WalletService } from '../wallet/wallet.service'
import { Currency, TransactionType } from '@gaming-platform/shared'
import { SportType, SportsMatchStatus, SportsBetStatus, SportsBetType } from './sports.enums'
import { OddsEngineService, SportsMarket } from './odds-engine.service'
import { CricketProvider } from './providers/cricket.provider'
import { SportSrcProvider } from './providers/sportsrc.provider'
import { NormalizedEvent, OddsApiProvider, OddsBookmaker } from './providers/odds-api.provider'
import { EspnScoreboardProvider } from './providers/espn-scoreboard.provider'
import { CricinfoProvider } from './providers/cricinfo.provider'
import { gradeBookmakerBet } from './odds-grade'
import { commentaryItems, cricketRuns, firstBallAfter, gradeNextBall, overRuns, overNumber, playerRunsMap } from './cricket-markets'
import { toNum } from '../common/utils/prisma-decimal'
import { SPORT_HUB, sportBySlug, matchBelongsToSport } from './sport-hub'

type PlaceBetInput = {
  sport: string
  matchId: string
  betType?: SportsBetType
  selection: string
  line?: number
  stake: number
  marketKey?: string
  bookmaker?: string
  odds?: number
}

@Injectable()
export class SportsService implements OnModuleInit, OnModuleDestroy {
  private cricketProvider = new CricketProvider()
  private sportSrcProvider = new SportSrcProvider()
  private oddsApi = new OddsApiProvider()
  private espn = new EspnScoreboardProvider()
  private cricinfo = new CricinfoProvider()

  private fetchTimer: any
  private settleTimer: any
  private refreshing = false
  private bootstrapped = false
  private ready: Promise<void> | null = null
  private scoreFetchedAt = new Map<string, number>()

  private oddsFeedMeta: { configured: boolean; upstreamStatus: number | null; reason: string } = {
    configured: false,
    upstreamStatus: null,
    reason: 'not_loaded',
  }

  constructor(
    private readonly prisma: PrismaService,
    private walletService: WalletService,
    private oddsEngine: OddsEngineService,
  ) {}

  async onModuleInit() {
    await this.ensureDefaultSettings()
    this.fetchTimer = setInterval(() => this.tickOddsFeed(12).catch(() => {}), 60_000)
    this.settleTimer = setInterval(() => this.settleAll().catch(() => {}), 60_000)
    void this.ensureReady().catch(() => {})
  }

  onModuleDestroy() {
    clearInterval(this.fetchTimer)
    clearInterval(this.settleTimer)
  }

  private async ensureDefaultSettings() {
    const sports = [SportType.CRICKET, SportType.FOOTBALL, SportType.HOCKEY]
    const existing = await this.prisma.sportsSetting.findMany()
    const missing = sports.filter((s) => !existing.some((e) => e.sport === s))
    if (missing.length) {
      await this.prisma.sportsSetting.createMany({
        data: missing.map((sport) => ({
          sport,
          enabled: true,
          houseEdge: 0.05,
        })),
      })
    }
  }

  async getSettings() {
    await this.ensureDefaultSettings()
    return this.prisma.sportsSetting.findMany({ orderBy: { sport: 'asc' } })
  }

  /** Bookmaker odds for every in-season fixture currently cached. The key stays on the server. */
  async getUpcomingOddsFeed(): Promise<any[]> {
    await this.ensureReady()
    return this.oddsApi.toOddsApiShape()
  }

  async getBoard(slug?: string, status?: SportsMatchStatus) {
    await Promise.race([
      this.ensureReady(),
      new Promise((resolve) => setTimeout(resolve, 4000)),
    ])
    const since = new Date(Date.now() - 12 * 60 * 60 * 1000)
    const hub = sportBySlug(slug)
    const prefixes = hub
      ? hub.groups.flatMap((group) => {
          const g = group.toLowerCase()
          if (g === 'soccer') return ['soccer']
          if (g === 'cricket') return ['cricket']
          if (g === 'tennis') return ['tennis']
          if (g === 'basketball') return ['basketball']
          if (g === 'baseball') return ['baseball']
          if (g === 'american football') return ['football']
          if (g === 'ice hockey') return ['hockey']
          if (g === 'rugby') return ['rugby']
          return [g]
        })
      : []
    const matches = await this.prisma.sportsMatch.findMany({
      where: {
        AND: [
          {
            OR: [
              { startTime: { gte: since } },
              { status: { in: [SportsMatchStatus.LIVE, SportsMatchStatus.UPCOMING] as any } },
            ],
          },
          ...(prefixes.length
            ? [
                {
                  OR: prefixes.map((prefix) => ({ sport: { startsWith: prefix } })),
                },
              ]
            : []),
        ],
      },
      orderBy: [{ startTime: 'asc' }],
      take: 800,
    })
    const feed = matches.filter((match) => {
      const source = (match.score as any)?.source
      return source === 'the-odds-api' || source === 'espn'
    })
    const rows = feed.length ? feed : matches
    const mapped = rows.map((match) => this.toBoardMatch(match))
    const scoped = hub ? mapped.filter((match) => matchBelongsToSport(match, hub)) : mapped
    const byStatus = status ? scoped.filter((match) => match.status === status) : scoped
    const odds = this.oddsApi.isConfigured() ? { ...this.oddsFeedMeta, ...this.oddsApi.getMeta() } : this.oddsFeedMeta
    return {
      matches: byStatus,
      catalog: SPORT_HUB.map((item) => ({
        slug: item.slug,
        name: item.name,
        count: mapped.filter((match) => matchBelongsToSport(match, item)).length,
      })),
      odds,
      fetchedAt: new Date().toISOString(),
    }
  }

  private async ensureReady() {
    if (this.bootstrapped) return
    if (!this.ready) {
      this.ready = this.tickOddsFeed(24)
        .then(() => {
          this.bootstrapped = true
          void this.backfillOdds()
        })
        .catch(() => {
          this.bootstrapped = true
        })
    }
    await this.ready
  }

  private async backfillOdds() {
    for (let i = 0; i < 15; i += 1) {
      const before = this.oddsApi.getMeta().quotaRemaining
      const result = await this.oddsApi.tick(4)
      if (result.pricedSports.length) {
        await this.persistFeed(this.oddsApi.getNormalizedEvents(), this.oddsApi.getPricedIds())
      }
      if (!result.pricedSports.length) break
      if (before != null && before < 20) break
      await new Promise((resolve) => setTimeout(resolve, 400))
    }
  }

  private async tickOddsFeed(limit: number) {
    const result = await this.oddsApi.tick(limit)
    if (this.oddsApi.isConfigured()) {
      this.oddsFeedMeta = this.oddsApi.getMeta()
      const events = this.oddsApi.getNormalizedEvents()
      if ((result.catalogUpdated || result.pricedSports.length) && events.length) {
        await this.persistFeed(events, this.oddsApi.getPricedIds())
      }
    }

    try {
      const espn = await this.espn.refresh(limit >= 12 ? 24 : Math.max(limit, 8))
      if (espn.events.length) {
        await this.persistFeed(espn.events, espn.priced)
        if (!this.oddsApi.isConfigured() || this.oddsFeedMeta.reason !== 'ok') {
          this.oddsFeedMeta = { configured: true, upstreamStatus: 200, reason: 'ok' }
        }
      }
      const cricinfo = await this.cricinfo.refresh()
      if (cricinfo.length) {
        await this.persistFeed(cricinfo, new Map())
        if (!this.oddsApi.isConfigured() || this.oddsFeedMeta.reason !== 'ok') {
          this.oddsFeedMeta = { configured: true, upstreamStatus: 200, reason: 'ok' }
        }
      }
      if (!espn.events.length && !cricinfo.length && !this.oddsApi.isConfigured() && this.oddsFeedMeta.reason !== 'ok') {
        this.oddsFeedMeta = {
          configured: false,
          upstreamStatus: null,
          reason: 'The public scoreboard returned no matches yet',
        }
      }
    } catch (error) {
      console.error('[sports] scoreboard request failed', error)
      if (!this.oddsApi.isConfigured() && this.oddsFeedMeta.reason !== 'ok') {
        this.oddsFeedMeta = { configured: false, upstreamStatus: null, reason: 'Sports feed is temporarily unavailable' }
      }
    }
  }

  private async persistFeed(events: NormalizedEvent[], priced: Map<string, Set<string>>) {
    const sportKeys = [...new Set(events.map((event) => event.sportKey))]
    const existing = await this.prisma.sportsMatch.findMany({
      where: { sport: { in: sportKeys } },
    })
    const byKey = new Map(existing.map((match) => [`${match.sport}:${match.externalId}`, match]))
    const creates: any[] = []
    const updates: Array<{ id: string; data: any }> = []
    const now = new Date()

    for (const event of events) {
      const commence = new Date(event.commenceTime)
      const startOk = !Number.isNaN(commence.getTime())
      const prev = byKey.get(`${event.sportKey}:${event.externalId}`)
      const prevScore = ((prev?.score as any) || {}) as any
      const bookmakers = event.bookmakers.length ? event.bookmakers : prevScore.bookmakers || []
      const pricedSet = priced.get(event.sportKey)
      let bettingClosed = Boolean(prevScore.bettingClosed)
      if (pricedSet) {
        const stillListed = pricedSet.has(event.externalId)
        bettingClosed = !stillListed && startOk && commence.getTime() <= Date.now()
      }
      if (event.completed) bettingClosed = true
      const status = event.completed
        ? SportsMatchStatus.FINISHED
        : prev?.status === SportsMatchStatus.FINISHED
          ? SportsMatchStatus.FINISHED
          : startOk && commence.getTime() <= Date.now()
            ? SportsMatchStatus.LIVE
            : SportsMatchStatus.UPCOMING
      const score = {
        ...prevScore,
        source: event.source || 'the-odds-api',
        sportKey: event.sportKey,
        sportGroup: event.sportGroup,
        sportTitle: event.sportTitle,
        bookmakers,
        bettingClosed,
        ...(event.homeScore != null &&
        event.awayScore != null &&
        (event.completed || (startOk && commence.getTime() <= Date.now()))
          ? { teamA: String(event.homeScore), teamB: String(event.awayScore) }
          : {}),
        ...(event.scoreText?.home && event.scoreText?.away
          ? { teamA: event.scoreText.home, teamB: event.scoreText.away }
          : {}),
      }
      if (!prev) {
        creates.push({
          sport: event.sportKey,
          externalId: event.externalId,
          league: event.sportTitle || event.sportGroup,
          teamA: event.homeTeam,
          teamB: event.awayTeam,
          startTime: startOk ? commence : null,
          status: status as any,
          score,
          lastFetchedAt: now,
        })
      } else {
        updates.push({
          id: prev.id,
          data: {
            league: event.sportTitle || prev.league,
            teamA: event.homeTeam || prev.teamA,
            teamB: event.awayTeam || prev.teamB,
            startTime: startOk ? commence : prev.startTime,
            status: status as any,
            score,
            lastFetchedAt: now,
          },
        })
      }
    }

    if (creates.length) {
      await this.prisma.sportsMatch.createMany({ data: creates, skipDuplicates: true })
    }
    for (let i = 0; i < updates.length; i += 20) {
      const chunk = updates.slice(i, i + 20)
      await Promise.all(chunk.map((row) => this.prisma.sportsMatch.update({ where: { id: row.id }, data: row.data })))
    }
  }

  private toBoardMatch(match: any) {
    const score = (match.score as any) || {}
    const bookmakers: OddsBookmaker[] = Array.isArray(score.bookmakers) ? score.bookmakers : []
    const feed = score.source === 'the-odds-api' || score.source === 'espn'
    const closed = match.status === SportsMatchStatus.FINISHED || match.status === SportsMatchStatus.CANCELLED
    return {
      id: match.id,
      externalId: match.externalId,
      sport: feed ? score.sportGroup || match.sport : match.sport,
      sportKey: score.sportKey || match.sport,
      league: feed ? score.sportTitle || match.league : match.league,
      teamA: match.teamA,
      teamB: match.teamB,
      status: match.status,
      startTime: match.startTime,
      lastFetchedAt: match.lastFetchedAt,
      bettingOpen: !closed && !score.bettingClosed && bookmakers.length > 0,
      score: this.publicScore(score),
      result: match.result ?? null,
      bookmakers,
      odds: this.bestH2h(bookmakers),
    }
  }

  private bestH2h(bookmakers: OddsBookmaker[]) {
    const best = new Map<string, { name: string; price: number; bookmaker: string; bookmakerKey: string }>()
    for (const book of bookmakers) {
      const market = book.markets?.find((item) => item.key === 'h2h')
      for (const outcome of market?.outcomes || []) {
        const current = best.get(outcome.name)
        if (!current || outcome.price > current.price) {
          best.set(outcome.name, {
            name: outcome.name,
            price: outcome.price,
            bookmaker: book.title,
            bookmakerKey: book.key,
          })
        }
      }
    }
    if (!best.size) return null
    return {
      source: 'the-odds-api',
      bookmaker: 'Best',
      updatedAt: new Date().toISOString(),
      outcomes: [...best.values()],
    }
  }

  private publicScore(score: any) {
    if (!score || typeof score !== 'object') return score ?? null
    const pick = (side: any) => {
      if (side == null) return null
      if (typeof side === 'string' || typeof side === 'number') return String(side)
      if (typeof side !== 'object') return null
      if (side.runs != null) {
        const wickets = side.wickets != null ? `/${side.wickets}` : ''
        const overs = side.overs != null ? ` (${side.overs} ov)` : ''
        return `${side.runs}${wickets}${overs}`
      }
      if (side.score != null) return String(side.score)
      if (side.goals != null) return String(side.goals)
      return null
    }
    const teamA = pick(score.teamA ?? score.team1 ?? score.home)
    const teamB = pick(score.teamB ?? score.team2 ?? score.away)
    if (teamA == null && teamB == null && !score.detail && !score.status && !score.state) return null
    return {
      teamA,
      teamB,
      innings: Array.isArray(score.innings) ? score.innings.slice(0, 4) : undefined,
      balls: Array.isArray(score.balls) ? score.balls.slice(-12) : Array.isArray(score.recentBalls) ? score.recentBalls.slice(-12) : undefined,
      batting: Array.isArray(score.batting) ? score.batting.slice(0, 11) : undefined,
      bowling: Array.isArray(score.bowling) ? score.bowling.slice(0, 11) : undefined,
      detail: typeof score.status === 'string' ? score.status : typeof score.state === 'string' ? score.state : undefined,
    }
  }

  async updateSetting(sport: SportType, patch: { enabled?: boolean; houseEdge?: number }) {
    const current = await this.prisma.sportsSetting.findUnique({ where: { sport } })
    if (!current) throw new BadRequestException('Setting not found')
    return this.prisma.sportsSetting.update({
      where: { id: current.id },
      data: {
        ...(typeof patch.enabled === 'boolean' ? { enabled: patch.enabled } : {}),
        ...(typeof patch.houseEdge === 'number' ? { houseEdge: patch.houseEdge } : {}),
      },
    })
  }

  async refreshAllSports() {
    if (this.refreshing) return
    this.refreshing = true
    try {
      await Promise.all([
        this.refreshSport(SportType.CRICKET),
        this.refreshSport(SportType.FOOTBALL),
        this.refreshSport(SportType.HOCKEY),
      ])
    } finally {
      this.refreshing = false
    }
  }

  async refreshSport(sport: SportType) {
    const setting = await this.prisma.sportsSetting.findUnique({ where: { sport } })
    if (!setting?.enabled) return

    let providerMatches: any[] = []
    if (sport === SportType.CRICKET) providerMatches = await this.cricketProvider.fetchLiveAndUpcoming()
    if (sport === SportType.FOOTBALL) providerMatches = await this.sportSrcProvider.fetchMatches(SportType.FOOTBALL)
    if (sport === SportType.HOCKEY) providerMatches = await this.sportSrcProvider.fetchMatches(SportType.HOCKEY)

    const now = new Date()

    for (const pm of providerMatches) {
      const existing = await this.prisma.sportsMatch.findUnique({
        where: { sport_externalId: { sport, externalId: pm.externalId } },
      })
      if (!existing) {
        await this.prisma.sportsMatch.create({
          data: {
            sport,
            externalId: pm.externalId,
            league: pm.league || sport,
            teamA: pm.teamA,
            teamB: pm.teamB,
            teamAShort: pm.teamAShort || null,
            teamBShort: pm.teamBShort || null,
            startTime: pm.startTime || null,
            status: (pm.status || SportsMatchStatus.UPCOMING) as any,
            score: pm.score || null,
            result: pm.result || null,
            lastFetchedAt: now,
          },
        })
      } else {
        await this.prisma.sportsMatch.update({
          where: { id: existing.id },
          data: {
            league: pm.league || existing.league,
            teamA: pm.teamA || existing.teamA,
            teamB: pm.teamB || existing.teamB,
            startTime: pm.startTime || existing.startTime,
            status: (pm.status || existing.status) as any,
            score: pm.score || existing.score,
            result: pm.result || existing.result,
            lastFetchedAt: now,
          },
        })
      }
    }
  }

  async listMatches(sport: SportType, status?: SportsMatchStatus) {
    const where: any = { sport }
    if (status) where.status = status
    return this.prisma.sportsMatch.findMany({
      where,
      orderBy: [{ startTime: 'asc' }, { createdAt: 'desc' }],
      take: 200,
    })
  }

  private async findMatch(matchId: string) {
    const byId = await this.prisma.sportsMatch.findUnique({ where: { id: matchId } })
    if (byId) return byId
    return this.prisma.sportsMatch.findFirst({ where: { externalId: matchId } })
  }

  async getMatch(matchId: string) {
    const match = await this.findMatch(matchId)
    if (!match) throw new BadRequestException('Match not found')
    await this.maybeEnrichMatch(match)
    const fresh = (await this.findMatch(match.id)) || match
    return this.toBoardMatch(fresh)
  }

  private async maybeEnrichMatch(match: any) {
    const score = (match.score as any) || {}
    const fetchedAt = Number(score.detailFetchedAt || 0)
    const live = match.status === SportsMatchStatus.LIVE
    const ttl = live ? 45_000 : 10 * 60_000
    if (fetchedAt && Date.now() - fetchedAt < ttl) return

    if (score.source === 'espn') {
      const sportKey = String(score.sportKey || '')
      let extra: Awaited<ReturnType<EspnScoreboardProvider['fetchDetailMarkets']>> = null
      try {
        extra = await this.espn.fetchDetailMarkets(sportKey, match.externalId)
      } catch {
        extra = null
      }
      const current = Array.isArray(score.bookmakers) ? score.bookmakers : []
      const bookmakers = extra?.bookmaker?.markets?.length
        ? this.mergeBookmakers(current, [extra.bookmaker])
        : current
      await this.prisma.sportsMatch.update({
        where: { id: match.id },
        data: {
          score: {
            ...score,
            bookmakers,
            detailFetchedAt: Date.now(),
            ...(extra?.live?.teamA ? { teamA: extra.live.teamA } : {}),
            ...(extra?.live?.teamB ? { teamB: extra.live.teamB } : {}),
            ...(extra?.live?.batting ? { batting: extra.live.batting } : {}),
            ...(extra?.live?.lastBallSequence != null ? { lastBallSequence: extra.live.lastBallSequence } : {}),
          },
        },
      })
      return
    }

    if (score.source !== 'the-odds-api') return
    const sportKey = String(score.sportKey || match.sport || '')
    const extraMarkets = this.extraMarketsFor(sportKey)
    try {
      const extra = await this.oddsApi.fetchEventOdds(sportKey, match.externalId, extraMarkets)
      if (!extra.length) {
        await this.prisma.sportsMatch.update({
          where: { id: match.id },
          data: { score: { ...score, detailFetchedAt: Date.now() } },
        })
        return
      }
      const merged = this.mergeBookmakers(Array.isArray(score.bookmakers) ? score.bookmakers : [], extra)
      await this.prisma.sportsMatch.update({
        where: { id: match.id },
        data: { score: { ...score, bookmakers: merged, detailFetchedAt: Date.now() } },
      })
    } catch {
      // Featured prices already on the match are enough if the extra call fails.
    }
  }

  private extraMarketsFor(sportKey: string) {
    if (sportKey.startsWith('soccer_')) return 'btts,draw_no_bet,alternate_totals,alternate_spreads'
    if (sportKey.startsWith('cricket')) return 'h2h,totals,spreads'
    if (sportKey.startsWith('tennis')) return 'h2h,h2h_lay,spreads,totals'
    return 'h2h,spreads,totals,alternate_totals'
  }

  private mergeBookmakers(current: OddsBookmaker[], extra: OddsBookmaker[]) {
    const byKey = new Map<string, OddsBookmaker>()
    for (const book of current) byKey.set(book.key, { ...book, markets: [...(book.markets || [])] })
    for (const book of extra) {
      const existing = byKey.get(book.key)
      if (!existing) {
        byKey.set(book.key, book)
        continue
      }
      for (const market of book.markets || []) {
        existing.markets = [
          ...existing.markets.filter((currentMarket) => currentMarket.key !== market.key),
          market,
        ]
      }
    }
    return [...byKey.values()]
  }

  async getMarkets(matchId: string): Promise<{ match: any; markets: SportsMarket[] }> {
    const match = await this.findMatch(matchId)
    if (!match) throw new BadRequestException('Match not found')
    const score = (match.score as any) || {}
    const bookmakers = score.bookmakers
    if (score.source === 'the-odds-api' || (Array.isArray(bookmakers) && bookmakers.length)) {
      return {
        match: this.toBoardMatch(match),
        markets: this.marketsFromBookmakers(Array.isArray(bookmakers) ? bookmakers : []),
      }
    }
    const setting = await this.prisma.sportsSetting.findUnique({ where: { sport: match.sport } })
    if (!setting?.enabled) throw new BadRequestException('Sport is disabled')
    const markets = this.oddsEngine.buildMarkets(match as any, setting as any)
    return { match: this.toBoardMatch(match), markets }
  }

  private marketsFromBookmakers(bookmakers: OddsBookmaker[]): SportsMarket[] {
    const grouped = new Map<string, SportsMarket>()
    for (const book of bookmakers) {
      for (const market of book.markets || []) {
        if (String(market.key).endsWith('_lay')) continue
        if (!grouped.has(market.key)) {
          grouped.set(market.key, {
            betType: this.betTypeForMarket(market.key),
            title: this.marketTitle(market.key),
            options: [],
          })
        }
        const bucket = grouped.get(market.key)!
        for (const outcome of market.outcomes || []) {
          const key = `${outcome.name}::${outcome.point ?? ''}`
          const existing = bucket.options.find((option) => option.key === key)
          if (!existing || outcome.price > existing.odds) {
            const label = outcome.point != null ? `${outcome.name} ${outcome.point}` : outcome.name
            if (existing) {
              existing.odds = outcome.price
              existing.label = label
            } else {
              bucket.options.push({
                key,
                label,
                odds: outcome.price,
                ...(outcome.point != null ? { line: outcome.point } : {}),
              })
            }
          }
        }
      }
    }
    return [...grouped.values()].filter((market) => market.options.length > 0)
  }

  async placeBet(userId: string, input: PlaceBetInput) {
    const match = await this.findMatch(input.matchId)
    if (!match) throw new BadRequestException('Match not found')
    const score = (match.score as any) || {}
    const bookmakers: OddsBookmaker[] = Array.isArray(score.bookmakers) ? score.bookmakers : []
    if (input.marketKey || score.source === 'the-odds-api' || score.source === 'espn') {
      return this.placeBookmakerBet(userId, match, input, bookmakers)
    }
    return this.placeLegacyBet(userId, match, input)
  }

  private async placeBookmakerBet(userId: string, match: any, input: PlaceBetInput, bookmakers: OddsBookmaker[]) {
    this.assertSport(match, input.sport)
    if (![SportsMatchStatus.UPCOMING, SportsMatchStatus.LIVE].includes(match.status)) {
      throw new BadRequestException('Betting closed for this match')
    }
    const score = (match.score as any) || {}
    if (score.bettingClosed || !bookmakers.length) throw new BadRequestException('Betting closed for this match')
    const setting = await this.prisma.sportsSetting.findUnique({ where: { sport: match.sport } })
    if (setting && setting.enabled === false) throw new BadRequestException('Sport is disabled')

    const marketKey = String(input.marketKey || 'h2h')
    if (marketKey.endsWith('_lay')) throw new BadRequestException('Lay prices are display-only')
    const quoted = this.findQuote(bookmakers, marketKey, input.bookmaker, input.selection, input.line)
    if (!quoted) throw new BadRequestException('Selection is no longer available')
    if (input.odds != null && Math.abs(Number(input.odds) - quoted.outcome.price) > 0.02) {
      throw new BadRequestException('Odds changed. Review the price and try again.')
    }

    const stake = Number(input.stake)
    if (!stake || stake <= 0) throw new BadRequestException('Invalid stake')
    const h2h = bookmakers.flatMap((book) => book.markets || []).find((market) => market.key === 'h2h')
    const drawOffered = Boolean(h2h?.outcomes?.some((outcome) => outcome.name.toLowerCase() === 'draw'))

    const savedBet = await this.prisma.sportsBet.create({
      data: {
        userId,
        sport: match.sport,
        matchId: match.id,
        externalMatchId: match.externalId,
        betType: this.betTypeForMarket(marketKey) as any,
        selection: quoted.outcome.name,
        line: quoted.outcome.point ?? null,
        stake,
        odds: quoted.outcome.price,
        payoutAmount: 0,
        currency: Currency.INR,
        status: SportsBetStatus.PENDING as any,
        meta: {
          source: score.source || 'the-odds-api',
          marketKey,
          marketTitle: this.marketTitle(marketKey),
          optionLabel: quoted.outcome.point != null ? `${quoted.outcome.name} ${quoted.outcome.point}` : quoted.outcome.name,
          bookmaker: quoted.book.title,
          bookmakerKey: quoted.book.key,
          oddsSnapshot: quoted.outcome.price,
          lineSnapshot: quoted.outcome.point ?? null,
          drawOffered,
          commenceTime: match.startTime,
          sportKey: score.sportKey || match.sport,
          lastBallSequence: score.lastBallSequence ?? 0,
          matchSnapshot: {
            league: match.league,
            teamA: match.teamA,
            teamB: match.teamB,
          },
        },
      },
    })
    try {
      await this.walletService.createTransaction(userId, Currency.INR, stake, TransactionType.BET, savedBet.id, {
        domain: 'sports',
      })
    } catch (err) {
      await this.prisma.sportsBet.delete({ where: { id: savedBet.id } })
      throw err
    }
    return savedBet
  }

  private findQuote(
    bookmakers: OddsBookmaker[],
    marketKey: string,
    bookmaker: string | undefined,
    selection: string,
    line?: number,
  ) {
    const wanted = (bookmaker || '').trim().toLowerCase()
    const books = bookmakers.filter((book) => {
      if (!wanted) return true
      return book.key.toLowerCase() === wanted || book.title.toLowerCase() === wanted
    })
    for (const book of books) {
      for (const market of book.markets || []) {
        if (market.key !== marketKey) continue
        for (const outcome of market.outcomes || []) {
          if (outcome.name !== selection) continue
          if (line != null && outcome.point != null && Number(outcome.point) !== Number(line)) continue
          if (line == null && outcome.point != null && marketKey !== 'h2h' && marketKey !== 'btts' && marketKey !== 'draw_no_bet') {
            continue
          }
          return { book, market, outcome }
        }
      }
    }
    return null
  }

  private assertSport(match: any, sport: string) {
    const score = (match.score as any) || {}
    const aliases = [match.sport, score.sportKey, score.sportGroup, score.sportTitle, match.league]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase())
    if (!aliases.includes(String(sport || '').toLowerCase())) {
      throw new BadRequestException('Sport mismatch')
    }
  }

  private betTypeForMarket(marketKey: string): SportsBetType {
    if (
      marketKey === 'totals' ||
      marketKey.startsWith('alternate_totals') ||
      marketKey === 'btts' ||
      marketKey.includes('total') ||
      marketKey === 'innings_runs' ||
      marketKey === 'current_over_runs' ||
      marketKey === 'player_runs'
    ) {
      return SportsBetType.OVER_UNDER
    }
    if (marketKey === 'toss') return SportsBetType.TOSS_WINNER
    return SportsBetType.MATCH_WINNER
  }

  private marketTitle(marketKey: string) {
    switch (marketKey) {
      case 'h2h':
        return 'Match Winner'
      case 'spreads':
        return 'Handicap'
      case 'totals':
        return 'Total'
      case 'btts':
        return 'Both Teams to Score'
      case 'draw_no_bet':
        return 'Draw No Bet'
      case 'toss':
        return 'Toss Winner'
      case 'innings_runs':
        return 'Innings runs'
      case 'current_over_runs':
        return 'This over'
      case 'next_ball':
        return 'Next ball'
      case 'player_runs':
        return 'Player runs'
      case 'player_fifty':
        return 'To score 50'
      default:
        return marketKey
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (char) => char.toUpperCase())
    }
  }

  private async placeLegacyBet(userId: string, match: any, input: PlaceBetInput) {
    if (match.sport !== input.sport) throw new BadRequestException('Sport mismatch')
    if (!input.betType) throw new BadRequestException('Market is required')
    if (![SportsMatchStatus.UPCOMING, SportsMatchStatus.LIVE].includes(match.status as any)) {
      throw new BadRequestException('Betting closed for this match')
    }

    const { markets } = await this.getMarkets(match.id)
    const market = markets.find((m) => m.betType === input.betType)
    if (!market) throw new BadRequestException('Market not available')
    const option = market.options.find((o) => o.key === input.selection)
    if (!option) throw new BadRequestException('Selection not available')

    if (option.line != null && input.line != null) {
      if (Number(option.line) !== Number(input.line)) throw new BadRequestException('Line changed, refresh odds')
    }

    const currency = Currency.INR
    const stake = Number(input.stake)
    if (!stake || stake <= 0) throw new BadRequestException('Invalid stake')

    const savedBet = await this.prisma.sportsBet.create({
      data: {
        userId,
        sport: match.sport,
        matchId: match.id,
        externalMatchId: match.externalId,
        betType: input.betType as any,
        selection: input.selection,
        line: option.line ?? input.line ?? null,
        stake,
        odds: option.odds,
        payoutAmount: 0,
        currency: currency,
        status: SportsBetStatus.PENDING as any,
        meta: {
          marketTitle: market.title,
          optionLabel: option.label,
          oddsSnapshot: option.odds,
          lineSnapshot: option.line ?? null,
          matchSnapshot: {
            league: match.league,
            teamA: match.teamA,
            teamB: match.teamB,
          },
        },
      },
    })
    try {
      await this.walletService.createTransaction(userId, currency, stake, TransactionType.BET, savedBet.id, {
        domain: 'sports',
      })
    } catch (err) {
      await this.prisma.sportsBet.delete({ where: { id: savedBet.id } })
      throw err
    }
    return savedBet
  }

  async listMyBets(userId: string) {
    return this.prisma.sportsBet.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })
  }

  private async settleAll() {
    await this.settleBookmakerBets()
    await this.settleFinishedMatches()
  }

  private scoreTtlMs() {
    const remaining = this.oddsApi.getMeta().quotaRemaining
    if (remaining == null || remaining > 2000) return 3 * 60_000
    if (remaining > 200) return 30 * 60_000
    return 3 * 60 * 60_000
  }

  private async settleEspnBets(bets: any[]) {
    const goalsCache = new Map<string, Map<string, number> | null>()
    const cricketCache = new Map<string, { summary: any; playByPlay: any } | null>()
    for (const bet of bets) {
      const match = await this.prisma.sportsMatch.findUnique({ where: { id: bet.matchId } })
      if (!match) continue
      const score = (match.score as any) || {}
      const meta = (bet.meta as any) || {}
      const marketKey = String(meta.marketKey || 'h2h')
      const liveMarket = marketKey === 'next_ball' || marketKey === 'current_over_runs'
      if (!liveMarket && match.status !== SportsMatchStatus.FINISHED) continue

      const homeScore = cricketRuns(score.teamA) ?? Number(score.teamA)
      const awayScore = cricketRuns(score.teamB) ?? Number(score.teamB)
      if (!liveMarket && (!Number.isFinite(homeScore) || !Number.isFinite(awayScore))) continue

      let playerGoals: Map<string, number> | undefined
      let playerRuns: Map<string, number> | undefined
      let tossWinner: string | null | undefined
      let nextBall: any
      if (/goalscorer|to_score_\d+_goals/.test(marketKey)) {
        if (!goalsCache.has(match.id)) {
          goalsCache.set(match.id, await this.espn.fetchPlayerGoals(String(score.sportKey || ''), match.externalId))
        }
        const parsed = goalsCache.get(match.id)
        if (parsed) playerGoals = parsed
      }
      if (
        String(score.sportKey || '').startsWith('cricket') &&
        /player_|toss|next_ball|current_over|innings_runs/.test(marketKey)
      ) {
        if (!cricketCache.has(match.id)) {
          cricketCache.set(match.id, await this.espn.fetchCricketContext(String(score.sportKey || ''), match.externalId))
        }
        const ctx = cricketCache.get(match.id)
        if (ctx?.summary) {
          playerRuns = playerRunsMap(ctx.summary)
          const tossNote = (ctx.summary.notes || []).find((note: any) => /elected/i.test(String(note?.text || '')))
          const tossName = String(tossNote?.text || '').split(',')[0].trim()
          tossWinner = tossName || null
          const items = commentaryItems(ctx.summary, ctx.playByPlay)
          if (marketKey === 'next_ball') {
            nextBall = firstBallAfter(items, Number(meta.lastBallSequence || 0))
            if (nextBall) {
              const grade = gradeNextBall(nextBall, bet.selection)
              if (grade !== 'open') await this.applyGrade(bet, grade, { homeScore, awayScore })
              continue
            }
          }
          if (marketKey === 'current_over_runs') {
            const start = firstBallAfter(items, Number(meta.lastBallSequence || 0))
            const over = start ? overNumber(start) : null
            const period = Number(start?.period || 0)
            const balls = items.filter((item) => overNumber(item) === over && Number(item?.period || 0) === period)
            if (over != null && balls.length >= 6) {
              const total = overRuns(items, over, period)
              const line = Number(bet.line)
              const overPick = /\bover\b/i.test(String(bet.selection))
              const grade = total === line ? 'void' : overPick ? (total > line ? 'won' : 'lost') : total < line ? 'won' : 'lost'
              await this.applyGrade(bet, grade, { homeScore, awayScore })
              continue
            }
          }
        }
      }
      const grade = gradeBookmakerBet({
        marketKey,
        selection: bet.selection,
        line: bet.line != null ? toNum(bet.line) : null,
        homeTeam: match.teamA,
        awayTeam: match.teamB,
        homeScore: Number(homeScore),
        awayScore: Number(awayScore),
        drawOffered: Boolean(meta.drawOffered),
        playerGoals,
        playerRuns,
        tossWinner,
        nextBall,
      })
      if (grade === 'open') continue
      await this.applyGrade(bet, grade, { homeScore, awayScore })
    }
  }

  private async settleBookmakerBets() {
    const pending = await this.prisma.sportsBet.findMany({
      where: { status: SportsBetStatus.PENDING as any },
      orderBy: { createdAt: 'asc' },
      take: 500,
    })
    const bookBets = pending.filter((bet) => {
      const source = (bet.meta as any)?.source
      return source === 'the-odds-api' || source === 'espn'
    })
    if (!bookBets.length) return
    await this.settleEspnBets(bookBets.filter((bet) => (bet.meta as any)?.source === 'espn'))

    const bySport = new Map<string, typeof bookBets>()
    for (const bet of bookBets.filter((item) => (item.meta as any)?.source !== 'espn')) {
      const sportKey = String((bet.meta as any)?.sportKey || bet.sport || '')
      if (!sportKey) continue
      const commence = new Date((bet.meta as any)?.commenceTime || 0).getTime()
      if (Number.isFinite(commence) && commence > Date.now()) continue
      const list = bySport.get(sportKey) || []
      list.push(bet)
      bySport.set(sportKey, list)
    }

    for (const [sportKey, bets] of bySport) {
      const last = this.scoreFetchedAt.get(sportKey) || 0
      if (Date.now() - last < this.scoreTtlMs()) continue
      this.scoreFetchedAt.set(sportKey, Date.now())
      let scores: Awaited<ReturnType<OddsApiProvider['fetchScores']>> = []
      try {
        scores = await this.oddsApi.fetchScores(sportKey)
      } catch {
        continue
      }
      const byId = new Map(scores.map((row) => [row.id, row]))
      for (const bet of bets) {
        const row = byId.get(bet.externalMatchId)
        if (!row?.completed || !row.scores?.length) continue
        const match = await this.prisma.sportsMatch.findUnique({ where: { id: bet.matchId } })
        if (!match) continue
        const homeScore = this.readSideScore(row.scores, match.teamA)
        const awayScore = this.readSideScore(row.scores, match.teamB)
        if (homeScore == null || awayScore == null) continue
        const meta = (bet.meta as any) || {}
        const grade = gradeBookmakerBet({
          marketKey: meta.marketKey || 'h2h',
          selection: bet.selection,
          line: bet.line != null ? toNum(bet.line) : null,
          homeTeam: match.teamA,
          awayTeam: match.teamB,
          homeScore,
          awayScore,
          drawOffered: Boolean(meta.drawOffered),
        })
        if (grade === 'open') continue
        await this.applyGrade(bet, grade, { homeScore, awayScore })
        const prevScore = (match.score as any) || {}
        await this.prisma.sportsMatch.update({
          where: { id: match.id },
          data: {
            status: SportsMatchStatus.FINISHED as any,
            score: {
              ...prevScore,
              teamA: String(homeScore),
              teamB: String(awayScore),
              bettingClosed: true,
            },
            result: { winner: homeScore === awayScore ? 'draw' : homeScore > awayScore ? 'teamA' : 'teamB' },
          },
        })
      }
    }
  }

  private readSideScore(scores: Array<{ name: string; score: string }>, team: string) {
    const row = scores.find((item) => item.name?.toLowerCase() === team.toLowerCase())
    const value = Number(row?.score)
    return Number.isFinite(value) ? value : null
  }

  private async applyGrade(bet: any, grade: 'won' | 'lost' | 'void', outcome: any) {
    const fresh = await this.prisma.sportsBet.findUnique({ where: { id: bet.id } })
    if (!fresh || fresh.status !== SportsBetStatus.PENDING) return
    const stake = toNum(fresh.stake)
    const odds = toNum(fresh.odds)
    const meta = { ...((fresh.meta as any) ?? {}), settlement: { outcome, grade } }
    if (grade === 'void') {
      await this.prisma.sportsBet.update({
        where: { id: fresh.id },
        data: { status: SportsBetStatus.VOID as any, payoutAmount: 0, settledAt: new Date(), meta },
      })
      await this.walletService.createTransaction(fresh.userId, fresh.currency as any, stake, TransactionType.REFUND, fresh.id, {
        sportsVoid: true,
      })
      return
    }
    if (grade === 'won') {
      const payout = Number((stake * odds).toFixed(8))
      await this.walletService.createTransaction(fresh.userId, fresh.currency as any, payout, TransactionType.WIN, fresh.id, {
        unlockAmount: stake,
      })
      await this.prisma.sportsBet.update({
        where: { id: fresh.id },
        data: { status: SportsBetStatus.WON as any, payoutAmount: payout, settledAt: new Date(), meta },
      })
      return
    }
    await this.walletService.createTransaction(fresh.userId, fresh.currency as any, stake, TransactionType.LOSS, fresh.id)
    await this.prisma.sportsBet.update({
      where: { id: fresh.id },
      data: { status: SportsBetStatus.LOST as any, payoutAmount: 0, settledAt: new Date(), meta },
    })
  }

  private resolveMatchOutcome(match: {
    result?: any
    score?: any
  }): {
    winnerKey?: 'teamA' | 'teamB' | 'draw'
    total?: number
    firstGoalKey?: 'teamA' | 'teamB'
    tossWinnerKey?: 'teamA' | 'teamB'
  } | null {
    const r = (match.result as any) || {}
    const s = (match.score as any) || {}

    const tossRaw = String(r.tossWinner ?? r.toss_winner ?? r.toss ?? '').toLowerCase()
    let tossWinnerKey: 'teamA' | 'teamB' | undefined
    if (tossRaw.includes('draw') || tossRaw.includes('tie')) {
      tossWinnerKey = undefined
    } else if (
      tossRaw === 'teama' ||
      tossRaw === 'team_a' ||
      tossRaw === 'a' ||
      tossRaw.includes('home') ||
      (tossRaw.includes('team') && tossRaw.includes('a'))
    ) {
      tossWinnerKey = 'teamA'
    } else if (
      tossRaw === 'teamb' ||
      tossRaw === 'team_b' ||
      tossRaw === 'b' ||
      tossRaw.includes('away') ||
      (tossRaw.includes('team') && tossRaw.includes('b'))
    ) {
      tossWinnerKey = 'teamB'
    }

    const winner = String(r.winner ?? r.winnerKey ?? r.winner_team ?? '').toLowerCase()
    if (winner.includes('team') || winner.includes('home') || winner.includes('away')) {
      if (winner.includes('a') || winner.includes('home')) return { winnerKey: 'teamA', tossWinnerKey }
      if (winner.includes('b') || winner.includes('away')) return { winnerKey: 'teamB', tossWinnerKey }
    }
    if (winner.includes('draw') || winner.includes('tie')) return { winnerKey: 'draw', tossWinnerKey }

    const a = Number(s?.teamA?.score ?? s?.teamA?.goals ?? s?.teamA?.runs ?? 0)
    const b = Number(s?.teamB?.score ?? s?.teamB?.goals ?? s?.teamB?.runs ?? 0)
    if (a || b) {
      if (a > b) return { winnerKey: 'teamA', total: a + b, tossWinnerKey }
      if (b > a) return { winnerKey: 'teamB', total: a + b, tossWinnerKey }
      return { winnerKey: 'draw', total: a + b, tossWinnerKey }
    }

    if (tossWinnerKey) return { tossWinnerKey }
    return null
  }

  async settleFinishedMatches() {
    const finished = await this.prisma.sportsMatch.findMany({
      where: { status: SportsMatchStatus.FINISHED as any },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    })

    for (const match of finished) {
      const outcome = this.resolveMatchOutcome(match)
      if (!outcome) continue

      const pendingBets = await this.prisma.sportsBet.findMany({
        where: { matchId: match.id, status: SportsBetStatus.PENDING as any },
        orderBy: { createdAt: 'asc' },
        take: 500,
      })

      for (const bet of pendingBets) {
        const betSource = (bet.meta as any)?.source
        if (betSource === 'the-odds-api' || betSource === 'espn') continue
        const stake = toNum(bet.stake)
        const odds = toNum(bet.odds)
        const payout = Number((stake * odds).toFixed(8))

        let won = false
        let voided = false

        if (bet.betType === SportsBetType.MATCH_WINNER && !outcome.winnerKey) {
          voided = true
        }

        if (bet.betType === SportsBetType.MATCH_WINNER) {
          won = bet.selection === outcome.winnerKey
        }

        if (bet.betType === SportsBetType.OVER_UNDER || bet.betType === SportsBetType.TOTAL_RUNS_OVER_UNDER) {
          const line = toNum(bet.line ?? 0)
          const total = Number(outcome.total ?? 0)
          if (!line || !total) voided = true
          else won = bet.selection === 'over' ? total > line : total < line
        }

        if (bet.betType === SportsBetType.TOSS_WINNER) {
          const t = outcome.tossWinnerKey
          if (!t) voided = true
          else won = bet.selection === t
        }

        if (bet.betType === SportsBetType.FIRST_GOAL) {
          voided = true
        }

        if (voided) {
          await this.prisma.sportsBet.update({
            where: { id: bet.id },
            data: {
              status: SportsBetStatus.VOID as any,
              payoutAmount: 0,
              settledAt: new Date(),
              meta: { ...((bet.meta as any) ?? {}), settlement: { voided: true, reason: 'Insufficient result data' } },
            },
          })
          await this.walletService.createTransaction(
            bet.userId,
            bet.currency as any,
            stake,
            TransactionType.REFUND,
            bet.id,
            { sportsVoid: true },
          )
          continue
        }

        if (won) {
          await this.walletService.createTransaction(bet.userId, bet.currency as any, payout, TransactionType.WIN, bet.id, {
            unlockAmount: stake,
          })
          await this.prisma.sportsBet.update({
            where: { id: bet.id },
            data: {
              status: SportsBetStatus.WON as any,
              payoutAmount: payout,
              settledAt: new Date(),
              meta: { ...((bet.meta as any) ?? {}), settlement: { outcome } },
            },
          })
        } else {
          await this.walletService.createTransaction(bet.userId, bet.currency as any, stake, TransactionType.LOSS, bet.id)
          await this.prisma.sportsBet.update({
            where: { id: bet.id },
            data: {
              status: SportsBetStatus.LOST as any,
              payoutAmount: 0,
              settledAt: new Date(),
              meta: { ...((bet.meta as any) ?? {}), settlement: { outcome } },
            },
          })
        }
      }
    }
  }
}
