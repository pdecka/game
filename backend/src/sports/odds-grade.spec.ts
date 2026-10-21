import { gradeBookmakerBet } from './odds-grade'

describe('gradeBookmakerBet', () => {
  const base = { homeTeam: 'India', awayTeam: 'Pakistan', drawOffered: true }

  it('grades 3-way match winner including draw', () => {
    expect(gradeBookmakerBet({ ...base, marketKey: 'h2h', selection: 'India', homeScore: 2, awayScore: 1 })).toBe('won')
    expect(gradeBookmakerBet({ ...base, marketKey: 'h2h', selection: 'Pakistan', homeScore: 2, awayScore: 1 })).toBe('lost')
    expect(gradeBookmakerBet({ ...base, marketKey: 'h2h', selection: 'Draw', homeScore: 1, awayScore: 1 })).toBe('won')
    expect(gradeBookmakerBet({ ...base, marketKey: 'h2h', selection: 'India', homeScore: 1, awayScore: 1 })).toBe('lost')
  })

  it('voids a 2-way moneyline on a tie', () => {
    expect(
      gradeBookmakerBet({
        ...base,
        drawOffered: false,
        marketKey: 'h2h',
        selection: 'India',
        homeScore: 10,
        awayScore: 10,
      }),
    ).toBe('void')
  })

  it('grades totals and pushes on the line', () => {
    expect(gradeBookmakerBet({ ...base, marketKey: 'totals', selection: 'Over', line: 2.5, homeScore: 2, awayScore: 1 })).toBe('won')
    expect(gradeBookmakerBet({ ...base, marketKey: 'totals', selection: 'Under', line: 2.5, homeScore: 2, awayScore: 1 })).toBe('lost')
    expect(gradeBookmakerBet({ ...base, marketKey: 'totals', selection: 'Over', line: 2, homeScore: 1, awayScore: 1 })).toBe('void')
  })

  it('grades spreads from the selected team handicap', () => {
    expect(gradeBookmakerBet({ ...base, marketKey: 'spreads', selection: 'Pakistan', line: 1.5, homeScore: 2, awayScore: 1 })).toBe('won')
    expect(gradeBookmakerBet({ ...base, marketKey: 'spreads', selection: 'India', line: -1.5, homeScore: 2, awayScore: 1 })).toBe('lost')
  })

  it('grades both teams to score and draw no bet', () => {
    expect(gradeBookmakerBet({ ...base, marketKey: 'btts', selection: 'Yes', homeScore: 1, awayScore: 1 })).toBe('won')
    expect(gradeBookmakerBet({ ...base, marketKey: 'btts', selection: 'No', homeScore: 1, awayScore: 0 })).toBe('won')
    expect(gradeBookmakerBet({ ...base, marketKey: 'draw_no_bet', selection: 'India', homeScore: 1, awayScore: 1 })).toBe('void')
    expect(gradeBookmakerBet({ ...base, marketKey: 'draw_no_bet', selection: 'India', homeScore: 2, awayScore: 0 })).toBe('won')
  })

  it('grades a team goal total and leaves unnamed markets open', () => {
    expect(
      gradeBookmakerBet({ ...base, marketKey: 'team_total_goals', selection: 'India Over', line: 1.5, homeScore: 2, awayScore: 1 }),
    ).toBe('won')
    expect(
      gradeBookmakerBet({ ...base, marketKey: 'team_total_goals', selection: 'Pakistan Over', line: 1.5, homeScore: 2, awayScore: 1 }),
    ).toBe('lost')
    expect(
      gradeBookmakerBet({
        ...base,
        marketKey: 'anytime_goalscorer',
        selection: 'Virat Kohli',
        homeScore: 2,
        awayScore: 1,
        playerGoals: new Map([['virat kohli', 1]]),
      }),
    ).toBe('won')
    expect(gradeBookmakerBet({ ...base, marketKey: 'total_corners', selection: 'Over', line: 9.5, homeScore: 2, awayScore: 1 })).toBe(
      'open',
    )
  })
})
