import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { WalletService } from '../wallet/wallet.service'
import { Currency, TransactionType } from '@gaming-platform/shared'
import { SportType, SportsMatchStatus, SportsBetStatus, SportsBetType } from './sports.enums'
import { OddsEngineService, SportsMarket } from './odds-engine.service'
import { CricketProvider } from './providers/cricket.provider'
import { SportSrcProvider } from './providers/sportsrc.provider'
import { toNum } from '../common/utils/prisma-decimal'

@Injectable()
export class SportsService implements OnModuleInit {
  private cricketProvider = new CricketProvider()
  private sportSrcProvider = new SportSrcProvider()

  private fetchTimer: any
  private settleTimer: any

  // Server-side cache of The Odds API feed so the key stays off the client
  // and we don't burn through the request quota.
  private oddsFeedCache: { data: any[]; fetchedAt: number } | null = null
  private readonly oddsFeedTtlMs = 30_000

  constructor(
    private readonly prisma: PrismaService,
    private walletService: WalletService,
    private oddsEngine: OddsEngineService,
  ) {}

  async onModuleInit() {
    // Ensure default settings rows exist.
    await this.ensureDefaultSettings()

    // Near-real-time: refresh cache + settle in background (no extra deps).
    this.fetchTimer = setInterval(() => this.refreshAllSports().catch(() => {}), 15_000)
    this.settleTimer = setInterval(() => this.settleFinishedMatches().catch(() => {}), 10_000)
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

  /** Proxy for The Odds API upcoming h2h odds (key kept server-side). */
  async getUpcomingOddsFeed(): Promise<any[]> {
    const now = Date.now()
    if (this.oddsFeedCache && now - this.oddsFeedCache.fetchedAt < this.oddsFeedTtlMs) {
      return this.oddsFeedCache.data
    }

    const apiKey = (process.env.ODDS_API_KEY || '').trim()
    if (!apiKey) {
      throw new BadRequestException('Sports odds feed is not configured (ODDS_API_KEY missing)')
    }

    const url = `https://api.the-odds-api.com/v4/sports/upcoming/odds/?regions=uk&markets=h2h&apiKey=${apiKey}`
    const res = await fetch(url)
    if (!res.ok) {
      // Serve stale data on upstream failure rather than erroring the UI.
      if (this.oddsFeedCache) return this.oddsFeedCache.data
      throw new BadRequestException(`Odds feed unavailable (upstream ${res.status})`)
    }

    const data = (await res.json()) as any[]
    this.oddsFeedCache = { data, fetchedAt: now }
    return data
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
    await Promise.all([
      this.refreshSport(SportType.CRICKET),
      this.refreshSport(SportType.FOOTBALL),
      this.refreshSport(SportType.HOCKEY),
    ])
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

  async getMatch(matchId: string) {
    const match = await this.prisma.sportsMatch.findUnique({ where: { id: matchId } })
    if (!match) throw new BadRequestException('Match not found')
    return match
  }

  async getMarkets(matchId: string): Promise<{ match: any; markets: SportsMarket[] }> {
    const match = await this.getMatch(matchId)
    const setting = await this.prisma.sportsSetting.findUnique({ where: { sport: match.sport } })
    if (!setting?.enabled) throw new BadRequestException('Sport is disabled')
    const markets = this.oddsEngine.buildMarkets(match as any, setting as any)
    return { match, markets }
  }

  async placeBet(userId: string, input: { sport: SportType; matchId: string; betType: SportsBetType; selection: string; line?: number; stake: number }) {
    const match = await this.getMatch(input.matchId)
    if (match.sport !== input.sport) throw new BadRequestException('Sport mismatch')
    if (![SportsMatchStatus.UPCOMING, SportsMatchStatus.LIVE].includes(match.status as any)) {
      throw new BadRequestException('Betting closed for this match')
    }

    const { markets } = await this.getMarkets(match.id)
    const market = markets.find((m) => m.betType === input.betType)
    if (!market) throw new BadRequestException('Market not available')
    const option = market.options.find((o) => o.key === input.selection)
    if (!option) throw new BadRequestException('Selection not available')

    // Line validation if applicable
    if (option.line != null && input.line != null) {
      // Must match current line to avoid stale bets
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

  private resolveMatchOutcome(match: {
    result?: any
    score?: any
  }): {
    winnerKey?: 'teamA' | 'teamB' | 'draw'
    total?: number
    firstGoalKey?: 'teamA' | 'teamB'
    tossWinnerKey?: 'teamA' | 'teamB'
  } | null {
    // Best-effort outcome derivation from normalized result/score payloads.
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

    // Winner
    const winner = String(r.winner ?? r.winnerKey ?? r.winner_team ?? '').toLowerCase()
    if (winner.includes('team') || winner.includes('home') || winner.includes('away')) {
      if (winner.includes('a') || winner.includes('home')) return { winnerKey: 'teamA', tossWinnerKey }
      if (winner.includes('b') || winner.includes('away')) return { winnerKey: 'teamB', tossWinnerKey }
    }
    if (winner.includes('draw') || winner.includes('tie')) return { winnerKey: 'draw', tossWinnerKey }

    // Fallback by score
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
    // Grab recently-fetched finished matches and settle pending bets.
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
          // Best-effort; if not available, void.
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
