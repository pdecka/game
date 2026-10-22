import { OddsBookmaker, OddsMarket, OddsOutcome } from './providers/odds-api.provider'

function roundPrice(value: number) {
  const n = Math.round(value * 100) / 100
  return n > 1.01 ? n : 1.02
}

function twoWay(prob: number, houseEdge: number): { over: number; under: number } {
  const p = Math.min(0.88, Math.max(0.12, prob))
  const overround = Math.min(1.08, Math.max(1.02, 1 + houseEdge))
  return {
    over: roundPrice(1 / (p * overround)),
    under: roundPrice(1 / ((1 - p) * overround)),
  }
}

function multiWay(weights: Record<string, number>, houseEdge: number): OddsOutcome[] {
  const total = Object.values(weights).reduce((sum, value) => sum + value, 0) || 1
  const overround = Math.min(1.1, Math.max(1.03, 1 + houseEdge))
  return Object.entries(weights).map(([name, weight]) => ({
    name,
    price: roundPrice(1 / ((weight / total) * overround)),
  }))
}

export function cricketRuns(raw: unknown): number | null {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw
  const text = String(raw ?? '').trim()
  if (!text) return null
  const match = text.match(/(\d+)/)
  if (!match) return null
  const value = Number(match[1])
  return Number.isFinite(value) ? value : null
}

export function cricketFormat(summary: any): 't20' | 'odi' | 'test' {
  const blob = JSON.stringify(summary?.notes || summary?.header || {}).toLowerCase()
  if (/\btest\b/.test(blob) && !/t20|twenty/.test(blob)) return 'test'
  if (/\bodi\b|50-over|50 over/.test(blob)) return 'odi'
  return 't20'
}

function competitorScore(summary: any, side: 'home' | 'away'): string {
  const row = summary?.header?.competitions?.[0]?.competitors?.find((item: any) => item?.homeAway === side)
  return String(row?.score || '').trim()
}

function tossDone(summary: any) {
  return (summary?.notes || []).some((note: any) => /elected/i.test(String(note?.text || '')))
}

function currentBatters(summary: any): Array<{ name: string; runs: number; out: boolean }> {
  const out: Array<{ name: string; runs: number; out: boolean }> = []
  for (const roster of summary?.rosters || []) {
    for (const player of roster?.roster || []) {
      const name = String(player?.athlete?.displayName || player?.athlete?.fullName || '').trim()
      const batting = (player?.linescores?.[0]?.linescores?.[0]?.statistics?.categories?.[0]?.stats || []) as Array<{
        name?: string
        value?: number
      }>
      const byName = new Map(batting.map((stat) => [String(stat?.name), stat]))
      const batted = Number(byName.get('batted')?.value || 0)
      if (!name || !batted) continue
      const runs = Number(byName.get('runs')?.value || 0)
      const outFlag = Number(byName.get('outs')?.value || 0) > 0
      out.push({ name, runs: Number.isFinite(runs) ? runs : 0, out: outFlag })
    }
  }
  return out
}

export function commentaryItems(summary: any, playByPlay: any): any[] {
  const fromHeader = summary?.header?.competitions?.[0]?.commentaries
  const headerRows = fromHeader && typeof fromHeader === 'object' ? Object.values(fromHeader) : []
  const pbp = Array.isArray(playByPlay?.commentary?.items) ? playByPlay.commentary.items : []
  return [...headerRows, ...pbp].filter(Boolean)
}

function latestBall(items: any[]) {
  return [...items].sort((a, b) => Number(b?.sequence || 0) - Number(a?.sequence || 0))[0] || null
}

export function overNumber(item: any): number | null {
  const overs = Number(item?.bowler?.overs)
  if (Number.isFinite(overs)) return Math.floor(overs)
  const sequence = String(item?.sequence || '')
  if (sequence.length >= 3) {
    const parsed = Number(sequence.slice(0, sequence.length - 2))
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

export function overRuns(items: any[], over: number, period: number) {
  return items
    .filter((item) => overNumber(item) === over && Number(item?.period || 0) === period)
    .reduce((sum, item) => sum + Number(item?.scoreValue || 0), 0)
}

export function buildCricketMarkets(input: {
  summary: any
  playByPlay?: any
  homeTeam: string
  awayTeam: string
  houseEdge?: number
}): OddsMarket[] {
  const edge = input.houseEdge ?? 0.05
  const format = cricketFormat(input.summary)
  const homeScore = cricketRuns(competitorScore(input.summary, 'home')) ?? 0
  const awayScore = cricketRuns(competitorScore(input.summary, 'away')) ?? 0
  const chasing = awayScore > 0 || /target/i.test(competitorScore(input.summary, 'away') + competitorScore(input.summary, 'home'))
  const lead = homeScore - awayScore
  const pHome = chasing
    ? Math.min(0.78, Math.max(0.22, 0.5 + lead / (format === 't20' ? 80 : format === 'odi' ? 140 : 220)))
    : 0.5
  const winner = twoWay(pHome, edge)
  const markets: OddsMarket[] = [
    {
      key: 'h2h',
      outcomes: [
        { name: input.homeTeam, price: winner.over },
        { name: input.awayTeam, price: winner.under },
      ],
    },
  ]

  if (!tossDone(input.summary)) {
    const toss = twoWay(0.5, edge)
    markets.push({
      key: 'toss',
      outcomes: [
        { name: input.homeTeam, price: toss.over },
        { name: input.awayTeam, price: toss.under },
      ],
    })
  }

  const inningsLine = format === 't20' ? 165.5 : format === 'odi' ? 270.5 : 320.5
  const inningsProb = twoWay(homeScore > inningsLine ? 0.72 : 0.48, edge)
  markets.push({
    key: 'innings_runs',
    outcomes: [
      { name: 'Over', price: inningsProb.over, point: inningsLine },
      { name: 'Under', price: inningsProb.under, point: inningsLine },
    ],
  })

  const matchLine = format === 't20' ? 320.5 : format === 'odi' ? 520.5 : 700.5
  const matchProb = twoWay(homeScore + awayScore > matchLine ? 0.7 : 0.5, edge)
  markets.push({
    key: 'totals',
    outcomes: [
      { name: 'Over', price: matchProb.over, point: matchLine },
      { name: 'Under', price: matchProb.under, point: matchLine },
    ],
  })

  const items = commentaryItems(input.summary, input.playByPlay)
  const last = latestBall(items)
  if (last) {
    const over = overNumber(last)
    const period = Number(last.period || 1)
    if (over != null) {
      const scored = overRuns(items, over, period)
      const line = 9.5
      const overProb = twoWay(scored > line ? 0.7 : 0.46, edge)
      markets.push({
        key: 'current_over_runs',
        outcomes: [
          { name: 'Over', price: overProb.over, point: line, description: `Over ${over + 1}` },
          { name: 'Under', price: overProb.under, point: line, description: `Over ${over + 1}` },
        ],
      })
    }
    markets.push({
      key: 'next_ball',
      outcomes: multiWay(
        { '0': 0.3, '1': 0.27, '2': 0.1, '3': 0.04, '4': 0.12, '6': 0.08, Wicket: 0.09 },
        edge,
      ),
    })
  }

  const batters = currentBatters(input.summary)
    .filter((row) => !row.out)
    .sort((a, b) => b.runs - a.runs)
    .slice(0, 6)
  if (batters.length) {
    const outcomes: OddsOutcome[] = []
    for (const batter of batters) {
      const line = Math.floor(batter.runs / 10) * 10 + 14.5
      const prices = twoWay(batter.runs > line - 8 ? 0.55 : 0.45, edge)
      outcomes.push({ name: `${batter.name} Over`, price: prices.over, point: line })
      outcomes.push({ name: `${batter.name} Under`, price: prices.under, point: line })
    }
    markets.push({ key: 'player_runs', outcomes })
  }

  const milestones = currentBatters(input.summary)
    .filter((row) => !row.out && row.runs < 50)
    .slice(0, 8)
  if (milestones.length) {
    markets.push({
      key: 'player_fifty',
      outcomes: milestones.map((row) => {
        const p = row.runs >= 50 ? 0.92 : row.runs >= 30 ? 0.42 : 0.18
        return { name: row.name, price: roundPrice(1 / (p * (1 + edge))) }
      }),
    })
  }

  return markets.filter((market) => market.outcomes.length > 0)
}

export function cricketLiveScore(summary: any, playByPlay?: any) {
  const last = latestBall(commentaryItems(summary, playByPlay))
  return {
    teamA: competitorScore(summary, 'home') || null,
    teamB: competitorScore(summary, 'away') || null,
    batting: currentBatters(summary).slice(0, 11),
    lastBallSequence: last ? Number(last.sequence || 0) : 0,
  }
}

export function gradeNextBall(item: any, selection: string): 'won' | 'lost' | 'void' | 'open' {
  if (!item) return 'open'
  const text = `${item?.playType?.description || ''} ${item?.shortText || ''} ${item?.text || ''}`.toLowerCase()
  const wicket = /\bout\b|wicket|lbw|caught|bowled|stumped|run out/.test(text)
  const runs = Number(item?.scoreValue)
  const pick = selection.trim().toLowerCase()
  if (pick === 'wicket') return wicket ? 'won' : 'lost'
  if (!Number.isFinite(runs)) return 'void'
  if (wicket && runs === 0) return pick === '0' ? 'lost' : 'lost'
  return String(runs) === pick ? 'won' : 'lost'
}

export function firstBallAfter(items: any[], sequence: number) {
  const next = items
    .filter((item) => Number(item?.sequence || 0) > sequence)
    .sort((a, b) => Number(a?.sequence || 0) - Number(b?.sequence || 0))
  return next[0] || null
}

export function playerRunsMap(summary: any): Map<string, number> {
  const map = new Map<string, number>()
  for (const row of currentBatters(summary)) {
    map.set(row.name.toLowerCase(), row.runs)
  }
  return map
}
