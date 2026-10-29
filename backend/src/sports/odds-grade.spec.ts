import { sameTossSide, tossWinnerFromNotes } from './cricket-markets'
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

  it('settles a toss when the winner is known, before the match has a score', () => {
    expect(
      gradeBookmakerBet({
        ...base,
        marketKey: 'toss',
        selection: 'India',
        homeScore: Number.NaN,
        awayScore: Number.NaN,
        tossWinner: 'India',
      }),
    ).toBe('won')
    expect(
      gradeBookmakerBet({ ...base, marketKey: 'toss', selection: 'Pakistan', homeScore: 0, awayScore: 0, tossWinner: 'India' }),
    ).toBe('lost')
    expect(gradeBookmakerBet({ ...base, marketKey: 'toss', selection: 'India', homeScore: 10, awayScore: 4, tossWinner: null })).toBe(
      'open',
    )
    expect(
      tossWinnerFromNotes(
        [{ type: 'toss', text: 'Sikkim , elected to field first' }],
        'Sikkim',
        'Nagaland',
      ),
    ).toBe('Sikkim')
    expect(
      tossWinnerFromNotes([{ type: 'toss', text: 'Hyderabad , elected to bat first' }], 'Hyderabad (India)', 'Punjab'),
    ).toBe('Hyderabad (India)')
    expect(
      tossWinnerFromNotes(
        [{ type: 'toss', text: 'Jammu and Kashmir , elected to field first' }],
        'Jammu & Kashmir',
        'Mumbai',
      ),
    ).toBe('Jammu & Kashmir')
    expect(tossWinnerFromNotes([{ type: 'toss', text: 'India , elected to bat first' }], 'West Indies', 'India')).toBe('India')
    expect(tossWinnerFromNotes([{ type: 'toss', text: 'West Indies , elected to field first' }], 'West Indies', 'India')).toBe(
      'West Indies',
    )
    expect(sameTossSide('India', 'West Indies')).toBe(false)
    expect(gradeBookmakerBet({ ...base, marketKey: 'toss', selection: 'teamA', homeScore: Number.NaN, awayScore: Number.NaN, tossWinner: 'India' })).toBe(
      'lost',
    )
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
