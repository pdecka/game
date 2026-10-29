import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { toNum } from '../common/utils/prisma-decimal'

const LEVELS = [
  { name: 'Bronze', minUsd: 10_000 },
  { name: 'Silver', minUsd: 15_000 },
  { name: 'Gold', minUsd: 100_000 },
  { name: 'Platinum', minUsd: 1_000_000 },
  { name: 'Diamond', minUsd: 1_500_000 },
] as const

const INR_PER_USD = 83
const WAGER_CREDIT = 0.5

function money(value: unknown) {
  const n = toNum(value)
  return Math.round(n * 100) / 100
}

function dayKey(value: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(value)
}

function stamp(value: Date) {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(value)
}

function shiftDay(ymd: string, days: number) {
  const [year, month, day] = ymd.split('-').map(Number)
  const next = new Date(Date.UTC(year, month - 1, day + days))
  return next.toISOString().slice(0, 10)
}

function eachDay(fromIso: string, toIso: string) {
  const from = fromIso.slice(0, 10)
  const to = toIso.slice(0, 10)
  const start = from <= to ? from : to
  const end = from <= to ? to : from
  const days: string[] = []
  let cursor = start
  while (cursor <= end && days.length < 400) {
    days.push(cursor)
    cursor = shiftDay(cursor, 1)
  }
  return days
}

function pretty(value: string) {
  return String(value || '')
    .split('/')[0]
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function paymentWord(status: string) {
  if (status === 'completed') return 'Paid'
  if (status === 'pending') return 'Waiting'
  if (status === 'processing') return 'Checking'
  if (status === 'refunded') return 'Refunded'
  if (status === 'cancelled') return 'Cancelled'
  if (status === 'failed') return 'Failed'
  return pretty(status)
}

function levelName(volumeUsd: number) {
  let name = 'Member'
  for (const level of LEVELS) {
    if (volumeUsd >= level.minUsd) name = level.name
    else break
  }
  return name
}

@Injectable()
export class AdminReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async detail(filters: { from?: string; to?: string; username?: string }) {
    const from = filters.from ? new Date(filters.from) : new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    const to = filters.to ? new Date(filters.to) : new Date()
    const createdAt = { gte: from, lte: to }
    const name = String(filters.username || '').trim()
    let userIds: string[] | undefined
    if (name) {
      const matched = await this.prisma.user.findMany({
        where: { role: 'user', username: { contains: name, mode: 'insensitive' } },
        select: { id: true },
        take: 100,
      })
      userIds = matched.map((row) => row.id)
      if (!userIds.length) return this.empty(from, to, name)
    }

    const userFilter = userIds ? { userId: { in: userIds } } : {}
    const [payments, bonuses, sports, games, players, wagers] = await Promise.all([
      this.prisma.payment.findMany({
        where: { createdAt, ...userFilter },
        orderBy: { createdAt: 'desc' },
        take: 5000,
        select: {
          userId: true,
          amount: true,
          currency: true,
          method: true,
          status: true,
          purpose: true,
          createdAt: true,
        },
      }),
      this.prisma.bonus.findMany({
        where: { createdAt, ...userFilter },
        orderBy: { createdAt: 'desc' },
        take: 5000,
        select: { userId: true, type: true, amount: true, currency: true, status: true, createdAt: true },
      }),
      this.prisma.sportsBet.findMany({
        where: { createdAt, ...userFilter },
        orderBy: { createdAt: 'desc' },
        take: 5000,
        select: {
          userId: true,
          sport: true,
          selection: true,
          stake: true,
          odds: true,
          payoutAmount: true,
          status: true,
          createdAt: true,
          meta: true,
        },
      }),
      this.prisma.gameSession.findMany({
        where: { createdAt, betAmount: { gt: 0 }, ...userFilter },
        orderBy: { createdAt: 'desc' },
        take: 5000,
        select: { userId: true, gameType: true, betAmount: true, winAmount: true, status: true, createdAt: true },
      }),
      this.prisma.user.findMany({
        where: {
          role: 'user',
          ...(name ? { username: { contains: name, mode: 'insensitive' } } : {}),
        },
        select: { id: true, username: true },
        orderBy: { username: 'asc' },
        take: 2000,
      }),
      this.prisma.ledgerEntry.groupBy({
        by: ['userId', 'currency'],
        where: {
          type: 'bet',
          status: 'completed',
          ...(userIds ? { userId: { in: userIds } } : {}),
        },
        _sum: { amount: true },
      }),
    ])

    const names = await this.usernames([
      ...payments.map((row) => row.userId),
      ...bonuses.map((row) => row.userId),
      ...sports.map((row) => row.userId),
      ...games.map((row) => row.userId),
      ...players.map((row) => row.id),
    ])

    const days = new Map<string, {
      date: string
      deposits: number
      withdrawals: number
      bonus: number
      sportsPlayed: number
      sportsPaid: number
      casinoPlayed: number
      casinoPaid: number
    }>()
    for (const date of eachDay(dayKey(from), dayKey(to))) {
      days.set(date, {
        date,
        deposits: 0,
        withdrawals: 0,
        bonus: 0,
        sportsPlayed: 0,
        sportsPaid: 0,
        casinoPlayed: 0,
        casinoPaid: 0,
      })
    }
    const bucket = (when: Date) => {
      const key = dayKey(when)
      return days.get(key) || null
    }

    let depositsPaid = 0
    let depositsWaiting = 0
    let withdrawalsPaid = 0
    let withdrawalsWaiting = 0
    const depositRows = []
    const withdrawalRows = []
    for (const row of payments) {
      const amount = money(row.amount)
      const paid = row.status === 'completed'
      const waiting = row.status === 'pending' || row.status === 'processing'
      const line = {
        when: stamp(row.createdAt),
        username: names.get(row.userId) || 'Unknown',
        amount,
        currency: row.currency,
        method: pretty(String(row.method)),
        status: paymentWord(String(row.status)),
      }
      if (row.purpose === 'deposit') {
        depositRows.push(line)
        if (paid) depositsPaid += amount
        if (waiting) depositsWaiting += amount
        const day = paid ? bucket(row.createdAt) : null
        if (day) day.deposits = money(day.deposits + amount)
      } else if (row.purpose === 'withdrawal') {
        withdrawalRows.push(line)
        if (paid) withdrawalsPaid += amount
        if (waiting) withdrawalsWaiting += amount
        const day = paid ? bucket(row.createdAt) : null
        if (day) day.withdrawals = money(day.withdrawals + amount)
      }
    }

    let bonusTotal = 0
    const bonusRows = bonuses.map((row) => {
      const amount = money(row.amount)
      bonusTotal += amount
      const day = bucket(row.createdAt)
      if (day) day.bonus = money(day.bonus + amount)
      return {
        when: stamp(row.createdAt),
        username: names.get(row.userId) || 'Unknown',
        type: pretty(String(row.type)),
        amount,
        currency: row.currency,
        status: pretty(String(row.status)),
      }
    })

    let sportsPlayed = 0
    let sportsPaid = 0
    let sportsSettledStake = 0
    const sportsRows = sports.map((row) => {
      const stake = money(row.stake)
      const payout = money(row.payoutAmount)
      sportsPlayed += stake
      if (row.status !== 'pending') {
        sportsPaid += payout
        sportsSettledStake += stake
      }
      const day = bucket(row.createdAt)
      if (day) {
        day.sportsPlayed = money(day.sportsPlayed + stake)
        if (row.status !== 'pending') day.sportsPaid = money(day.sportsPaid + payout)
      }
      const meta = (row.meta as { marketTitle?: string } | null) || {}
      return {
        when: stamp(row.createdAt),
        username: names.get(row.userId) || 'Unknown',
        sport: pretty(row.sport),
        pick: meta.marketTitle ? `${meta.marketTitle}: ${row.selection}` : row.selection,
        stake,
        odds: money(row.odds),
        payout,
        status: row.status === 'pending' ? 'Open' : row.status === 'won' ? 'Won' : row.status === 'lost' ? 'Lost' : 'Cancelled',
      }
    })

    let casinoPlayed = 0
    let casinoPaid = 0
    let casinoSettledStake = 0
    const gameRows = games.map((row) => {
      const stake = money(row.betAmount)
      const win = money(row.winAmount)
      casinoPlayed += stake
      if (row.status === 'completed') {
        casinoPaid += win
        casinoSettledStake += stake
      }
      const day = bucket(row.createdAt)
      if (day) {
        day.casinoPlayed = money(day.casinoPlayed + stake)
        if (row.status === 'completed') day.casinoPaid = money(day.casinoPaid + win)
      }
      return {
        when: stamp(row.createdAt),
        username: names.get(row.userId) || 'Unknown',
        game: pretty(String(row.gameType)),
        stake,
        win,
        status: row.status === 'completed' ? 'Finished' : row.status === 'cancelled' ? 'Cancelled' : 'Open',
      }
    })

    const wagerByUser = new Map<string, { inr: number; usdt: number }>()
    for (const row of wagers) {
      const current = wagerByUser.get(row.userId) || { inr: 0, usdt: 0 }
      if (row.currency === 'INR') current.inr += toNum(row._sum.amount)
      if (row.currency === 'USDT') current.usdt += toNum(row._sum.amount)
      wagerByUser.set(row.userId, current)
    }
    const rank = ['Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze', 'Member']
    const levelRows = players
      .map((player) => {
        const wager = wagerByUser.get(player.id) || { inr: 0, usdt: 0 }
        const volumeUsd = ((wager.inr / INR_PER_USD) + wager.usdt) * WAGER_CREDIT
        return {
          username: player.username,
          level: levelName(volumeUsd),
          wageredInr: money(wager.inr),
        }
      })
      .sort((a, b) => rank.indexOf(a.level) - rank.indexOf(b.level) || a.username.localeCompare(b.username))
    const levelCounts = ['Member', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'].map((level) => ({
      level,
      players: levelRows.filter((row) => row.level === level).length,
    }))

    return {
      from: dayKey(from),
      to: dayKey(to),
      username: name,
      summary: {
        depositsPaid: money(depositsPaid),
        depositsWaiting: money(depositsWaiting),
        withdrawalsPaid: money(withdrawalsPaid),
        withdrawalsWaiting: money(withdrawalsWaiting),
        bonusTotal: money(bonusTotal),
        sportsPlayed: money(sportsPlayed),
        sportsPaid: money(sportsPaid),
        sportsProfit: money(sportsSettledStake - sportsPaid),
        casinoPlayed: money(casinoPlayed),
        casinoPaid: money(casinoPaid),
        casinoProfit: money(casinoSettledStake - casinoPaid),
      },
      days: [...days.values()],
      deposits: depositRows,
      withdrawals: withdrawalRows,
      bonuses: bonusRows,
      levels: { counts: levelCounts, players: levelRows },
      sports: sportsRows,
      games: gameRows,
    }
  }

  private empty(from: Date, to: Date, username: string) {
    return {
      from: dayKey(from),
      to: dayKey(to),
      username,
      summary: {
        depositsPaid: 0,
        depositsWaiting: 0,
        withdrawalsPaid: 0,
        withdrawalsWaiting: 0,
        bonusTotal: 0,
        sportsPlayed: 0,
        sportsPaid: 0,
        sportsProfit: 0,
        casinoPlayed: 0,
        casinoPaid: 0,
        casinoProfit: 0,
      },
      days: eachDay(dayKey(from), dayKey(to)).map((date) => ({
        date,
        deposits: 0,
        withdrawals: 0,
        bonus: 0,
        sportsPlayed: 0,
        sportsPaid: 0,
        casinoPlayed: 0,
        casinoPaid: 0,
      })),
      deposits: [],
      withdrawals: [],
      bonuses: [],
      levels: {
        counts: ['Member', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'].map((level) => ({ level, players: 0 })),
        players: [],
      },
      sports: [],
      games: [],
    }
  }

  private async usernames(ids: string[]) {
    const unique = [...new Set(ids.filter(Boolean))]
    const map = new Map<string, string>()
    if (!unique.length) return map
    const rows = await this.prisma.user.findMany({
      where: { id: { in: unique } },
      select: { id: true, username: true },
    })
    for (const row of rows) map.set(row.id, row.username)
    return map
  }
}
