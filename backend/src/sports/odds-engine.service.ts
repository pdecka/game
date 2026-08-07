import { Injectable } from '@nestjs/common'
import { SportType, SportsBetType } from './sports.enums'

export type SportsMarketOption = {
  key: string
  label: string
  odds: number
  line?: number
}

export type SportsMarket = {
  betType: SportsBetType
  title: string
  options: SportsMarketOption[]
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function toOddsFromProbability(prob: number) {
  const p = clamp(prob, 0.01, 0.99)
  return Number((1 / p).toFixed(2))
}

function applyMargin2Way(pA: number, houseEdge: number) {
  // Normalize probs and apply an overround.
  const baseSum = pA + (1 - pA)
  const overround = clamp(1 + houseEdge, 1.02, 1.08)
  const pAAdj = (pA / baseSum) * overround
  const pBAdj = ((1 - pA) / baseSum) * overround
  // Convert to odds (implied odds use overround).
  const oA = Number((1 / pAAdj).toFixed(2))
  const oB = Number((1 / pBAdj).toFixed(2))
  return { oA, oB }
}

@Injectable()
export class OddsEngineService {
  buildMarkets(match: any, setting: any): SportsMarket[] {
    const houseEdge = Number(setting.houseEdge ?? 0.05)

    // Simple internal “strength” heuristic without relying on paid odds:
    // - If live score indicates advantage, slightly tilt probabilities.
    // - Otherwise keep near-symmetric.
    let pTeamA = 0.5
    try {
      const score = match.score || {}
      if (match.sport === SportType.CRICKET) {
        const a = Number(score?.teamA?.runs ?? 0)
        const b = Number(score?.teamB?.runs ?? 0)
        if (a || b) pTeamA = clamp(0.5 + (a - b) / 800, 0.35, 0.65)
      } else {
        const a = Number(score?.teamA?.goals ?? score?.teamA?.score ?? 0)
        const b = Number(score?.teamB?.goals ?? score?.teamB?.score ?? 0)
        if (a || b) pTeamA = clamp(0.5 + (a - b) / 10, 0.35, 0.65)
      }
    } catch {
      pTeamA = 0.5
    }

    const { oA, oB } = applyMargin2Way(pTeamA, houseEdge)

    const markets: SportsMarket[] = [
      {
        betType: SportsBetType.MATCH_WINNER,
        title: 'Match Winner',
        options: [
          { key: 'teamA', label: match.teamA, odds: oA },
          { key: 'teamB', label: match.teamB, odds: oB },
        ],
      },
    ]

    if (match.sport === SportType.CRICKET) {
      markets.push({
        betType: SportsBetType.TOSS_WINNER,
        title: 'Toss Winner',
        options: [
          { key: 'teamA', label: `${match.teamA} win toss`, odds: 1.9 },
          { key: 'teamB', label: `${match.teamB} win toss`, odds: 1.9 },
        ].map((o) => ({ ...o, odds: Number((o.odds * (1 - houseEdge)).toFixed(2)) })),
      })

      // Total runs line (simple by match “format” guess)
      const line = 320.5
      const pOver = 0.5
      const { oA: oOver, oB: oUnder } = applyMargin2Way(pOver, houseEdge)
      markets.push({
        betType: SportsBetType.TOTAL_RUNS_OVER_UNDER,
        title: 'Total Runs (Over/Under)',
        options: [
          { key: 'over', label: `Over ${line}`, odds: oOver, line },
          { key: 'under', label: `Under ${line}`, odds: oUnder, line },
        ],
      })
    }

    if (match.sport === SportType.FOOTBALL) {
      const line = 2.5
      const pOver = 0.5
      const { oA: oOver, oB: oUnder } = applyMargin2Way(pOver, houseEdge)
      markets.push({
        betType: SportsBetType.OVER_UNDER,
        title: 'Goals (Over/Under)',
        options: [
          { key: 'over', label: `Over ${line}`, odds: oOver, line },
          { key: 'under', label: `Under ${line}`, odds: oUnder, line },
        ],
      })

      markets.push({
        betType: SportsBetType.FIRST_GOAL,
        title: 'First Goal',
        options: [
          { key: 'teamA', label: match.teamA, odds: toOddsFromProbability(clamp(pTeamA, 0.35, 0.65)) },
          { key: 'teamB', label: match.teamB, odds: toOddsFromProbability(clamp(1 - pTeamA, 0.35, 0.65)) },
        ].map((o) => ({ ...o, odds: Number((o.odds * (1 - houseEdge / 2)).toFixed(2)) })),
      })
    }

    if (match.sport === SportType.HOCKEY) {
      const line = 5.5
      const pOver = 0.5
      const { oA: oOver, oB: oUnder } = applyMargin2Way(pOver, houseEdge)
      markets.push({
        betType: SportsBetType.OVER_UNDER,
        title: 'Goals (Over/Under)',
        options: [
          { key: 'over', label: `Over ${line}`, odds: oOver, line },
          { key: 'under', label: `Under ${line}`, odds: oUnder, line },
        ],
      })
    }

    return markets
  }
}

