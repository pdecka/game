export enum SportType {
  CRICKET = 'cricket',
  FOOTBALL = 'football',
  HOCKEY = 'hockey',
}

export enum SportsMatchStatus {
  UPCOMING = 'upcoming',
  LIVE = 'live',
  FINISHED = 'finished',
  CANCELLED = 'cancelled',
}

export enum SportsBetType {
  MATCH_WINNER = 'match_winner',
  TOSS_WINNER = 'toss_winner',
  TOTAL_RUNS_OVER_UNDER = 'total_runs_over_under',
  OVER_UNDER = 'over_under',
  FIRST_GOAL = 'first_goal',
}

export enum SportsBetStatus {
  PENDING = 'pending',
  WON = 'won',
  LOST = 'lost',
  VOID = 'void',
}
