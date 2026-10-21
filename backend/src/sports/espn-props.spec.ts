import { goalsFromBoxscore, mapEspnProps } from './espn-props'

const athletes = new Map([['30116', 'Ilia Gruev']])
const teams = new Map([
  ['359', 'Arsenal'],
  ['357', 'Leeds United'],
])

describe('mapEspnProps', () => {
  it('keeps priced player, over, and moneyline selections', () => {
    const markets = mapEspnProps(
      [
        {
          athlete: { $ref: 'http://sports.core.api.espn.com/v2/sports/soccer/leagues/eng.1/seasons/2026/athletes/30116' },
          type: { name: 'Anytime Goalscorer' },
          current: { over: { decimal: 29 } },
        },
        {
          type: { name: 'Total Corners' },
          current: { over: { decimal: 1.47 }, target: { value: 8.5 } },
        },
        {
          type: { name: 'Total Corners' },
          current: { over: { decimal: 2.5 }, target: { value: 8.5 } },
        },
        {
          type: { name: 'Total Corners' },
          current: { over: { decimal: 2.25 }, target: { value: 10.5 } },
        },
        {
          type: { name: 'Total Corners' },
          current: { over: { decimal: 1.6 }, target: { value: 10.5 } },
        },
        {
          team: { $ref: 'http://sports.core.api.espn.com/v2/sports/soccer/leagues/eng.1/seasons/2026/teams/359' },
          type: { name: '1st Half Moneyline' },
          current: { over: { decimal: 1.83 } },
        },
        {
          type: { name: '1st Half Moneyline' },
          current: { over: { decimal: 2.45 } },
        },
        {
          team: { $ref: 'http://sports.core.api.espn.com/v2/sports/soccer/leagues/eng.1/seasons/2026/teams/359' },
          type: { name: 'Team Total Goals' },
          current: { over: { decimal: 1.4 }, target: { value: 1.5 } },
        },
        {
          team: { $ref: 'http://sports.core.api.espn.com/v2/sports/soccer/leagues/eng.1/seasons/2026/teams/359' },
          type: { name: 'Team Total Goals' },
          current: { over: { decimal: 2.4 }, target: { value: 1.5 } },
        },
        {
          team: { $ref: 'http://sports.core.api.espn.com/v2/sports/soccer/leagues/eng.1/seasons/2026/teams/359' },
          type: { name: 'Team Total Goals' },
          current: { over: { decimal: 2.1 }, target: { value: 2.5 } },
        },
        {
          team: { $ref: 'http://sports.core.api.espn.com/v2/sports/soccer/leagues/eng.1/seasons/2026/teams/359' },
          type: { name: 'Team Total Goals' },
          current: { over: { decimal: 1.7 }, target: { value: 2.5 } },
        },
        {
          type: { name: 'Both Teams To Score' },
          current: { over: { decimal: 2.05 } },
        },
        {
          type: { name: 'Total Passing Yards' },
          current: { target: { value: 265.5 } },
        },
      ],
      athletes,
      teams,
    )

    const goal = markets.find((market) => market.key === 'anytime_goalscorer')
    expect(goal?.outcomes).toEqual([{ name: 'Ilia Gruev', price: 29 }])
    const corners = markets.find((market) => market.key === 'total_corners')
    expect(corners?.outcomes).toEqual(
      expect.arrayContaining([
        { name: 'Over', price: 1.47, point: 8.5 },
        { name: 'Under', price: 2.5, point: 8.5 },
        { name: 'Over', price: 2.25, point: 10.5 },
        { name: 'Under', price: 1.6, point: 10.5 },
      ]),
    )
    const half = markets.find((market) => market.key === '1st_half_moneyline')
    expect(half?.outcomes.map((outcome) => outcome.name).sort()).toEqual(['Arsenal', 'Draw'])
    const teamTotal = markets.find((market) => market.key === 'team_total_goals')
    expect(teamTotal?.outcomes).toEqual(
      expect.arrayContaining([
        { name: 'Arsenal Over', price: 1.4, point: 1.5 },
        { name: 'Arsenal Under', price: 2.4, point: 1.5 },
        { name: 'Arsenal Over', price: 2.1, point: 2.5 },
        { name: 'Arsenal Under', price: 1.7, point: 2.5 },
      ]),
    )
    expect(markets.some((market) => market.key.includes('both_teams'))).toBe(false)
    expect(markets.some((market) => market.key.includes('passing'))).toBe(false)
  })
})

describe('goalsFromBoxscore', () => {
  it('reads goal totals by player name', () => {
    const goals = goalsFromBoxscore({
      players: [
        {
          statistics: [
            {
              names: ['goals', 'assists'],
              athletes: [{ athlete: { displayName: 'Bukayo Saka' }, stats: ['2', '1'] }],
            },
          ],
        },
      ],
    })
    expect(goals?.get('bukayo saka')).toBe(2)
  })
})
