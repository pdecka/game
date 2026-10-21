export type Grade = 'won' | 'lost' | 'void' | 'open'

export function gradeBookmakerBet(input: {
  marketKey: string
  selection: string
  line?: number | null
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  drawOffered?: boolean
  playerGoals?: Map<string, number>
}): Grade {
  const market = String(input.marketKey || '')
  const selection = String(input.selection || '').trim()
  const home = Number(input.homeScore)
  const away = Number(input.awayScore)
  if (!Number.isFinite(home) || !Number.isFinite(away)) return 'void'

  if (market === 'h2h') {
    if (home === away) {
      if (selection.toLowerCase() === 'draw') return 'won'
      return input.drawOffered ? 'lost' : 'void'
    }
    const winner = home > away ? input.homeTeam : input.awayTeam
    if (selection.toLowerCase() === 'draw') return 'lost'
    return sameTeam(selection, winner) ? 'won' : 'lost'
  }

  if (market === 'draw_no_bet') {
    if (home === away) return 'void'
    const winner = home > away ? input.homeTeam : input.awayTeam
    return sameTeam(selection, winner) ? 'won' : 'lost'
  }

  if (market === 'btts') {
    const both = home > 0 && away > 0
    if (selection.toLowerCase() === 'yes') return both ? 'won' : 'lost'
    if (selection.toLowerCase() === 'no') return both ? 'lost' : 'won'
    return 'void'
  }

  if (market === 'totals' || market.startsWith('alternate_totals')) {
    const line = Number(input.line)
    if (!Number.isFinite(line)) return 'void'
    const total = home + away
    if (total === line) return 'void'
    const over = selection.toLowerCase() === 'over'
    const under = selection.toLowerCase() === 'under'
    if (!over && !under) return 'void'
    if (over) return total > line ? 'won' : 'lost'
    return total < line ? 'won' : 'lost'
  }

  if (market === 'spreads' || market.startsWith('alternate_spreads')) {
    const line = Number(input.line)
    if (!Number.isFinite(line)) return 'void'
    const onHome = sameTeam(selection, input.homeTeam)
    const onAway = sameTeam(selection, input.awayTeam)
    if (!onHome && !onAway) return 'void'
    const selectedScore = onHome ? home : away
    const otherScore = onHome ? away : home
    const margin = selectedScore + line - otherScore
    if (margin === 0) return 'void'
    return margin > 0 ? 'won' : 'lost'
  }

  if (market === 'team_total_goals') {
    const line = Number(input.line)
    if (!Number.isFinite(line)) return 'open'
    const onHome = selection.toLowerCase().startsWith(`${input.homeTeam.trim().toLowerCase()} `)
    const onAway = selection.toLowerCase().startsWith(`${input.awayTeam.trim().toLowerCase()} `)
    const over = /\bover\b/i.test(selection)
    const under = /\bunder\b/i.test(selection)
    if ((!onHome && !onAway) || (!over && !under)) return 'open'
    const goals = onHome ? home : away
    if (goals === line) return 'void'
    if (over) return goals > line ? 'won' : 'lost'
    return goals < line ? 'won' : 'lost'
  }

  if (market === 'anytime_goalscorer' || market === 'to_score_2_goals' || market === 'to_score_3_goals') {
    if (!input.playerGoals) return 'open'
    const goals = input.playerGoals.get(selection.toLowerCase()) ?? 0
    const need = market === 'to_score_3_goals' ? 3 : market === 'to_score_2_goals' ? 2 : 1
    return goals >= need ? 'won' : 'lost'
  }

  return 'open'
}

function sameTeam(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase()
}
