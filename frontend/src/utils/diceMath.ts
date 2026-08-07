import {
  DICE_CONFIG,
  createDiceBet,
  createDiceResult,
  createDiceRound,
  determineWin,
  calculatePayout,
  calculateProfit,
  type RollType,
  type DiceBet,
  type DiceResult,
  type DiceRound
} from './diceConfig'

export interface DiceGameResult {
  bet: DiceBet
  result: DiceResult
  payout: number
  profit: number
  isWin: boolean
}

export function rollDice(target: number, rollType: RollType, betAmount: number): DiceGameResult {
  // Generate random roll value FIRST (deterministic)
  const rollValue = Math.random() * DICE_CONFIG.ROLL_RANGE
  
  // Calculate win chance and multiplier
  const winChance = calculateWinChance(target, rollType)
  const multiplier = calculateMultiplier(winChance)
  
  // Create bet and result
  const bet = createDiceBet(betAmount, target, rollType)
  const result = createDiceResult(rollValue, target, rollType, winChance, multiplier)
  
  // Determine outcome
  const isWin = determineWin(rollValue, target, rollType)
  const payout = calculatePayout(betAmount, multiplier)
  const profit = calculateProfit(betAmount, payout)
  
  return {
    bet,
    result,
    payout,
    profit,
    isWin
  }
}

export function evaluateGame(bet: DiceBet, result: DiceResult): DiceRound {
  return createDiceRound(bet, result)
}

export function calculateWinChance(target: number, rollType: RollType): number {
  if (rollType === 'over') {
    // Win chance = (100 - target) / 100
    return (DICE_CONFIG.ROLL_RANGE - target) / DICE_CONFIG.ROLL_RANGE
  } else {
    // Win chance = target / 100
    return target / DICE_CONFIG.ROLL_RANGE
  }
}

export function calculateMultiplier(winChance: number, houseEdge: number = DICE_CONFIG.HOUSE_EDGE): number {
  // multiplier = (100 / winChance) * (1 - houseEdge)
  // Ensure minimum multiplier of 1.01x
  const rawMultiplier = (1 / winChance) * (1 - houseEdge)
  return Math.max(1.01, rawMultiplier)
}

export function calculateExpectedValue(target: number, rollType: RollType, houseEdge: number = DICE_CONFIG.HOUSE_EDGE): number {
  const winChance = calculateWinChance(target, rollType)
  const multiplier = calculateMultiplier(winChance, houseEdge)
  
  // Expected value = (Win Probability * Payout) - (Loss Probability * Bet)
  // For a 1 unit bet: EV = (P(win) * multiplier) - P(loss)
  const lossProbability = 1 - winChance
  
  return (winChance * multiplier) - lossProbability
}

export function simulateGameSession(
  rounds: number,
  betAmount: number,
  target: number,
  rollType: RollType,
  houseEdge: number = DICE_CONFIG.HOUSE_EDGE
): {
  roundsPlayed: number
  totalBet: number
  totalPayout: number
  profit: number
  winRate: number
  averageRollValue: number
  highestRoll: number
  lowestRoll: number
  rollDistribution: Record<string, number>
} {
  let totalBet = 0
  let totalPayout = 0
  let wins = 0
  const rollValues: number[] = []
  const rollDistribution: Record<string, number> = {
    '0-25': 0,
    '25-50': 0,
    '50-75': 0,
    '75-100': 0
  }
  
  for (let i = 0; i < rounds; i++) {
    const gameResult = rollDice(target, rollType, betAmount)
    
    totalBet += betAmount
    totalPayout += gameResult.payout
    
    if (gameResult.isWin) {
      wins++
    }
    
    rollValues.push(gameResult.result.rollValue)
    
    // Categorize roll value
    const roll = gameResult.result.rollValue
    if (roll < 25) rollDistribution['0-25']++
    else if (roll < 50) rollDistribution['25-50']++
    else if (roll < 75) rollDistribution['50-75']++
    else rollDistribution['75-100']++
  }
  
  const averageRollValue = rollValues.reduce((sum, roll) => sum + roll, 0) / rollValues.length
  const highestRoll = Math.max(...rollValues)
  const lowestRoll = Math.min(...rollValues)
  
  return {
    roundsPlayed: rounds,
    totalBet,
    totalPayout,
    profit: totalPayout - totalBet,
    winRate: (wins / rounds) * 100,
    averageRollValue,
    highestRoll,
    lowestRoll,
    rollDistribution
  }
}

export function analyzeBettingPattern(rounds: DiceRound[]): {
  averageTarget: number
  averageBetAmount: number
  preferredRollType: RollType
  rollTypeDistribution: Record<RollType, number>
  riskLevel: 'Conservative' | 'Moderate' | 'Aggressive'
  successRateByRollType: Record<RollType, number>
} {
  if (rounds.length === 0) {
    return {
      averageTarget: 0,
      averageBetAmount: 0,
      preferredRollType: 'over',
      rollTypeDistribution: { over: 0, under: 0 },
      riskLevel: 'Conservative',
      successRateByRollType: { over: 0, under: 0 }
    }
  }
  
  const rollTypes: RollType[] = ['over', 'under']
  const rollTypeDistribution: Record<RollType, number> = {
    over: 0,
    under: 0
  }
  
  rounds.forEach(round => {
    rollTypeDistribution[round.bet.rollType]++
  })
  
  const preferredRollType = rollTypeDistribution.over > rollTypeDistribution.under ? 'over' : 'under'
  
  const averageTarget = rounds.reduce((sum, round) => sum + round.bet.target, 0) / rounds.length
  const averageBetAmount = rounds.reduce((sum, round) => sum + round.bet.amount, 0) / rounds.length
  
  // Determine risk level based on average win chance
  const avgWinChance = calculateWinChance(averageTarget, preferredRollType)
  let riskLevel: 'Conservative' | 'Moderate' | 'Aggressive' = 'Conservative'
  if (avgWinChance < 0.25) riskLevel = 'Aggressive'
  else if (avgWinChance < 0.4) riskLevel = 'Moderate'
  
  // Calculate success rate by roll type
  const successRateByRollType: Record<RollType, number> = {
    over: 0,
    under: 0
  }
  
  rollTypes.forEach(rollType => {
    const typeRounds = rounds.filter(round => round.bet.rollType === rollType)
    const wins = typeRounds.filter(round => round.isWin).length
    successRateByRollType[rollType] = typeRounds.length > 0 ? (wins / typeRounds.length) * 100 : 0
  })
  
  return {
    averageTarget,
    averageBetAmount,
    preferredRollType,
    rollTypeDistribution,
    riskLevel,
    successRateByRollType
  }
}

export function calculateStreaks(rounds: DiceRound[]): {
  currentStreak: number
  currentStreakType: 'win' | 'loss' | null
  longestWinStreak: number
  longestLossStreak: number
  averageStreakLength: number
} {
  if (rounds.length === 0) {
    return {
      currentStreak: 0,
      currentStreakType: null,
      longestWinStreak: 0,
      longestLossStreak: 0,
      averageStreakLength: 0
    }
  }
  
  let currentStreak = 1
  let currentStreakType: 'win' | 'loss' = rounds[0].isWin ? 'win' : 'loss'
  let longestWinStreak = 0
  let longestLossStreak = 0
  const streaks: number[] = []
  
  for (let i = 1; i < rounds.length; i++) {
    if (rounds[i].isWin === rounds[i-1].isWin) {
      currentStreak++
    } else {
      // Update longest streaks
      if (currentStreakType === 'win') {
        longestWinStreak = Math.max(longestWinStreak, currentStreak)
      } else {
        longestLossStreak = Math.max(longestLossStreak, currentStreak)
      }
      
      streaks.push(currentStreak)
      
      // Reset current streak
      currentStreak = 1
      currentStreakType = rounds[i].isWin ? 'win' : 'loss'
    }
  }
  
  // Check final streak
  if (currentStreakType === 'win') {
    longestWinStreak = Math.max(longestWinStreak, currentStreak)
  } else {
    longestLossStreak = Math.max(longestLossStreak, currentStreak)
  }
  
  streaks.push(currentStreak)
  
  const averageStreakLength = streaks.reduce((sum, streak) => sum + streak, 0) / streaks.length
  
  return {
    currentStreak,
    currentStreakType,
    longestWinStreak,
    longestLossStreak,
    averageStreakLength
  }
}

export function getOptimalTarget(rollType: RollType, houseEdge: number = DICE_CONFIG.HOUSE_EDGE): number {
  let bestTarget = DICE_CONFIG.MIN_TARGET
  let bestEV = -Infinity
  
  // Test targets from 2 to 96
  for (let target = DICE_CONFIG.MIN_TARGET; target <= DICE_CONFIG.MAX_TARGET; target += 1) {
    const ev = calculateExpectedValue(target, rollType, houseEdge)
    
    if (ev > bestEV) {
      bestEV = ev
      bestTarget = target
    }
  }
  
  return bestTarget
}

export function getOptimalRollType(target: number, houseEdge: number = DICE_CONFIG.HOUSE_EDGE): RollType {
  const overEV = calculateExpectedValue(target, 'over', houseEdge)
  const underEV = calculateExpectedValue(target, 'under', houseEdge)
  
  return overEV > underEV ? 'over' : 'under'
}

export function getTargetRiskScore(target: number, rollType: RollType): {
  score: number
  level: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High'
  description: string
} {
  const winChance = calculateWinChance(target, rollType)
  
  let score: number
  let level: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High'
  let description: string
  
  if (winChance >= 0.45) {
    score = 10
    level = 'Very Low'
    description = 'Very safe - high win probability'
  } else if (winChance >= 0.35) {
    score = 30
    level = 'Low'
    description = 'Low risk - good win probability'
  } else if (winChance >= 0.25) {
    score = 50
    level = 'Medium'
    description = 'Moderate risk - balanced odds'
  } else if (winChance >= 0.15) {
    score = 75
    level = 'High'
    description = 'High risk - low win probability'
  } else {
    score = 95
    level = 'Very High'
    description = 'Very high risk - very low win probability'
  }
  
  return { score, level, description }
}

export function formatRollValueForDisplay(value: number): string {
  return value.toFixed(DICE_CONFIG.PRECISION)
}

export function validateGameResult(result: DiceGameResult): {
  isValid: boolean
  error?: string
} {
  if (result.result.rollValue < 0 || result.result.rollValue > DICE_CONFIG.ROLL_RANGE) {
    return { isValid: false, error: 'Roll value out of range' }
  }
  
  if (result.bet.target < DICE_CONFIG.MIN_TARGET || result.bet.target > DICE_CONFIG.MAX_TARGET) {
    return { isValid: false, error: 'Target out of valid range' }
  }
  
  if (result.bet.amount <= 0) {
    return { isValid: false, error: 'Invalid bet amount' }
  }
  
  if (result.isWin !== determineWin(result.result.rollValue, result.bet.target, result.bet.rollType)) {
    return { isValid: false, error: 'Win/loss determination mismatch' }
  }
  
  if (result.payout !== calculatePayout(result.bet.amount, result.result.multiplier)) {
    return { isValid: false, error: 'Payout calculation mismatch' }
  }
  
  return { isValid: true }
}

export function getOutcomeColor(isWin: boolean): string {
  return isWin ? 'text-emerald-400' : 'text-red-400'
}

export function getOutcomeEmoji(isWin: boolean): string {
  return isWin ? 'ð' : 'ð'
}

export function getOutcomeText(isWin: boolean): string {
  return isWin ? 'WIN' : 'LOSS'
}

export function getRollTypeColor(rollType: RollType): string {
  return rollType === 'over' ? 'text-blue-400' : 'text-purple-400'
}

export function getRollTypeBgColor(rollType: RollType): string {
  return rollType === 'over' ? 'bg-blue-600' : 'bg-purple-600'
}

export function getRollTypeEmoji(rollType: RollType): string {
  return rollType === 'over' ? 'â' : 'â'
}

export function analyzeRollDistribution(rounds: DiceRound[]): {
  distribution: Record<string, number>
  fairness: number
} {
  if (rounds.length === 0) {
    return {
      distribution: {
        '0-25': 0,
        '25-50': 0,
        '50-75': 0,
        '75-100': 0
      },
      fairness: 0
    }
  }
  
  const distribution: Record<string, number> = {
    '0-25': 0,
    '25-50': 0,
    '50-75': 0,
    '75-100': 0
  }
  
  rounds.forEach(round => {
    const roll = round.result.rollValue
    if (roll < 25) distribution['0-25']++
    else if (roll < 50) distribution['25-50']++
    else if (roll < 75) distribution['50-75']++
    else distribution['75-100']++
  })
  
  // Calculate fairness (chi-square approximation)
  const expected = rounds.length / 4
  const chiSquare = Object.values(distribution).reduce((sum, observed) => {
    return sum + Math.pow(observed - expected, 2) / expected
  }, 0)
  
  // Convert to fairness score (0-100, where 100 is perfectly fair)
  const fairness = Math.max(0, 100 - (chiSquare / rounds.length) * 10)
  
  return { distribution, fairness }
}

export function calculateVolatility(rounds: DiceRound[]): number {
  if (rounds.length < 2) return 0
  
  const profits = rounds.map(round => round.profit)
  const mean = profits.reduce((sum, profit) => sum + profit, 0) / profits.length
  const squaredDifferences = profits.map(profit => Math.pow(profit - mean, 2))
  const variance = squaredDifferences.reduce((sum, diff) => sum + diff, 0) / profits.length
  
  return Math.sqrt(variance)
}

export function getProfitTrend(rounds: DiceRound[]): 'up' | 'down' | 'stable' {
  if (rounds.length < 10) return 'stable'
  
  const recentRounds = rounds.slice(0, 10)
  const olderRounds = rounds.slice(10, 20)
  
  if (olderRounds.length === 0) return 'stable'
  
  const recentProfit = recentRounds.reduce((sum, round) => sum + round.profit, 0)
  const olderProfit = olderRounds.reduce((sum, round) => sum + round.profit, 0)
  
  const difference = recentProfit - olderProfit
  
  if (difference > 0) return 'up'
  if (difference < 0) return 'down'
  return 'stable'
}
