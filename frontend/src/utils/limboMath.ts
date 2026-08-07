import {
  LIMBO_CONFIG,
  createLimboBet,
  createLimboResult,
  createLimboRound,
  determineWin,
  calculatePayout,
  calculateProfit,
  type LimboBet,
  type LimboResult,
  type LimboRound
} from './limboConfig'

export interface LimboGameResult {
  bet: LimboBet
  result: LimboResult
  payout: number
  profit: number
  isWin: boolean
}

export function generateMultiplier(): number {
  // Inverse exponential distribution with house edge
  // This creates realistic casino-like multiplier distribution
  
  const houseEdge = LIMBO_CONFIG.HOUSE_EDGE
  const maxMultiplier = LIMBO_CONFIG.MAX_MULTIPLIER
  
  // Generate random number between 0 and 1
  const random = Math.random()
  
  // Apply inverse exponential transformation
  // Lower multipliers are more common, higher multipliers are rare
  let multiplier
  
  if (random < 0.01) {
    // 1% chance for very high multipliers (100x+)
    multiplier = 100 + Math.random() * 900 // 100x - 1000x
  } else if (random < 0.05) {
    // 4% chance for high multipliers (10x - 100x)
    multiplier = 10 + Math.random() * 90 // 10x - 100x
  } else if (random < 0.20) {
    // 15% chance for medium multipliers (3x - 10x)
    multiplier = 3 + Math.random() * 7 // 3x - 10x
  } else if (random < 0.50) {
    // 30% chance for low-medium multipliers (1.5x - 3x)
    multiplier = 1.5 + Math.random() * 1.5 // 1.5x - 3x
  } else {
    // 50% chance for low multipliers (1.01x - 1.5x)
    multiplier = 1.01 + Math.random() * 0.49 // 1.01x - 1.5x
  }
  
  // Apply house edge by slightly reducing higher multipliers
  if (multiplier > 2) {
    multiplier = multiplier * (1 - houseEdge)
  }
  
  // Ensure minimum multiplier
  multiplier = Math.max(multiplier, LIMBO_CONFIG.MIN_MULTIPLIER)
  
  // Cap at maximum multiplier
  multiplier = Math.min(multiplier, maxMultiplier)
  
  // Round to 2 decimal places
  return Math.round(multiplier * 100) / 100
}

export function calculateWinProbability(targetMultiplier: number, houseEdge: number = LIMBO_CONFIG.HOUSE_EDGE): number {
  // Calculate theoretical win probability based on target multiplier
  // This follows the casino logic: P(win) = (1 / targetMultiplier) * (1 - houseEdge)
  
  if (targetMultiplier < LIMBO_CONFIG.MIN_MULTIPLIER) {
    return 1.0 // 100% chance for minimum multiplier
  }
  
  const rawProbability = 1 / targetMultiplier
  const adjustedProbability = rawProbability * (1 - houseEdge)
  
  return Math.min(adjustedProbability, 0.99) // Cap at 99% to account for edge cases
}

export function calculateExpectedValue(targetMultiplier: number, houseEdge: number = LIMBO_CONFIG.HOUSE_EDGE): number {
  // Expected value = (Win Probability * Payout) - (Loss Probability * Bet)
  // For a 1 unit bet: EV = (P(win) * targetMultiplier) - P(loss)
  
  const winProbability = calculateWinProbability(targetMultiplier, houseEdge)
  const lossProbability = 1 - winProbability
  const payout = targetMultiplier
  
  const expectedValue = (winProbability * payout) - lossProbability
  
  return expectedValue
}

export function playLimbo(betAmount: number, targetMultiplier: number, houseEdge: number = LIMBO_CONFIG.HOUSE_EDGE): LimboGameResult {
  // Generate result FIRST (deterministic)
  const generatedMultiplier = generateMultiplier()
  
  // Create bet and result
  const bet = createLimboBet(betAmount, targetMultiplier)
  const result = createLimboResult(generatedMultiplier, targetMultiplier, houseEdge)
  
  // Determine outcome
  const isWin = determineWin(generatedMultiplier, targetMultiplier)
  const payout = calculatePayout(betAmount, targetMultiplier, isWin)
  const profit = calculateProfit(betAmount, payout)
  
  return {
    bet,
    result,
    payout,
    profit,
    isWin
  }
}

export function evaluateGame(bet: LimboBet, result: LimboResult): LimboRound {
  return createLimboRound(bet, result)
}

export function simulateGameSession(
  rounds: number,
  betAmount: number,
  targetMultiplier: number,
  houseEdge: number = LIMBO_CONFIG.HOUSE_EDGE
): {
  roundsPlayed: number
  totalBet: number
  totalPayout: number
  profit: number
  winRate: number
  averageMultiplier: number
  highestMultiplier: number
  lowestMultiplier: number
} {
  let totalBet = 0
  let totalPayout = 0
  let wins = 0
  const multipliers: number[] = []
  
  for (let i = 0; i < rounds; i++) {
    const gameResult = playLimbo(betAmount, targetMultiplier, houseEdge)
    
    totalBet += betAmount
    totalPayout += gameResult.payout
    
    if (gameResult.isWin) {
      wins++
    }
    
    multipliers.push(gameResult.result.generatedMultiplier)
  }
  
  const averageMultiplier = multipliers.reduce((sum, mult) => sum + mult, 0) / multipliers.length
  const highestMultiplier = Math.max(...multipliers)
  const lowestMultiplier = Math.min(...multipliers)
  
  return {
    roundsPlayed: rounds,
    totalBet,
    totalPayout,
    profit: totalPayout - totalBet,
    winRate: (wins / rounds) * 100,
    averageMultiplier,
    highestMultiplier,
    lowestMultiplier
  }
}

export function analyzeBettingPattern(rounds: LimboRound[]): {
  averageTargetMultiplier: number
  averageBetAmount: number
  riskLevel: 'Conservative' | 'Moderate' | 'Aggressive'
  multiplierPreference: 'Low' | 'Medium' | 'High'
  successRateByRange: {
    low: number
    medium: number
    high: number
  }
} {
  if (rounds.length === 0) {
    return {
      averageTargetMultiplier: 0,
      averageBetAmount: 0,
      riskLevel: 'Conservative',
      multiplierPreference: 'Low',
      successRateByRange: { low: 0, medium: 0, high: 0 }
    }
  }
  
  const averageTargetMultiplier = rounds.reduce((sum, round) => sum + round.bet.targetMultiplier, 0) / rounds.length
  const averageBetAmount = rounds.reduce((sum, round) => sum + round.bet.amount, 0) / rounds.length
  
  // Determine risk level
  let riskLevel: 'Conservative' | 'Moderate' | 'Aggressive' = 'Conservative'
  if (averageTargetMultiplier > 10) riskLevel = 'Aggressive'
  else if (averageTargetMultiplier > 3) riskLevel = 'Moderate'
  
  // Determine multiplier preference
  const lowTargets = rounds.filter(round => round.bet.targetMultiplier <= 2).length
  const mediumTargets = rounds.filter(round => round.bet.targetMultiplier > 2 && round.bet.targetMultiplier <= 10).length
  const highTargets = rounds.filter(round => round.bet.targetMultiplier > 10).length
  
  let multiplierPreference: 'Low' | 'Medium' | 'High' = 'Low'
  if (highTargets >= mediumTargets && highTargets >= lowTargets) multiplierPreference = 'High'
  else if (mediumTargets >= lowTargets) multiplierPreference = 'Medium'
  
  // Calculate success rate by range
  const lowWins = rounds.filter(round => round.bet.targetMultiplier <= 2 && round.isWin).length
  const mediumWins = rounds.filter(round => round.bet.targetMultiplier > 2 && round.bet.targetMultiplier <= 10 && round.isWin).length
  const highWins = rounds.filter(round => round.bet.targetMultiplier > 10 && round.isWin).length
  
  const successRateByRange = {
    low: lowTargets > 0 ? (lowWins / lowTargets) * 100 : 0,
    medium: mediumTargets > 0 ? (mediumWins / mediumTargets) * 100 : 0,
    high: highTargets > 0 ? (highWins / highTargets) * 100 : 0
  }
  
  return {
    averageTargetMultiplier,
    averageBetAmount,
    riskLevel,
    multiplierPreference,
    successRateByRange
  }
}

export function calculateStreaks(rounds: LimboRound[]): {
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

export function getOptimalMultiplier(houseEdge: number = LIMBO_CONFIG.HOUSE_EDGE): number {
  // Calculate the multiplier with the best expected value
  // This is typically around 2x for most casino games
  
  let bestMultiplier = LIMBO_CONFIG.MIN_MULTIPLIER
  let bestEV = -1 // Start with worst possible EV
  
  // Test multipliers from 1.01x to 100x
  for (let multiplier = LIMBO_CONFIG.MIN_MULTIPLIER; multiplier <= 100; multiplier += 0.01) {
    const ev = calculateExpectedValue(multiplier, houseEdge)
    
    if (ev > bestEV) {
      bestEV = ev
      bestMultiplier = multiplier
    }
  }
  
  return Math.round(bestMultiplier * 100) / 100
}

export function getMultiplierRiskScore(targetMultiplier: number): {
  score: number
  level: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High'
  description: string
} {
  // Risk score from 0-100
  let score = 0
  let level: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High' = 'Very Low'
  let description = ''
  
  if (targetMultiplier <= 1.5) {
    score = 10
    level = 'Very Low'
    description = 'Very safe - high win probability'
  } else if (targetMultiplier <= 2) {
    score = 25
    level = 'Low'
    description = 'Low risk - good win probability'
  } else if (targetMultiplier <= 5) {
    score = 50
    level = 'Medium'
    description = 'Moderate risk - balanced odds'
  } else if (targetMultiplier <= 20) {
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

export function formatMultiplierForDisplay(multiplier: number): string {
  if (multiplier >= 1000) {
    return `${(multiplier / 1000).toFixed(1)}k`
  } else if (multiplier >= 100) {
    return `${multiplier.toFixed(0)}`
  } else if (multiplier >= 10) {
    return `${multiplier.toFixed(1)}`
  } else {
    return `${multiplier.toFixed(2)}`
  }
}

export function validateGameResult(result: LimboGameResult): {
  isValid: boolean
  error?: string
} {
  if (result.result.generatedMultiplier < LIMBO_CONFIG.MIN_MULTIPLIER) {
    return { isValid: false, error: 'Generated multiplier below minimum' }
  }
  
  if (result.result.generatedMultiplier > LIMBO_CONFIG.MAX_MULTIPLIER) {
    return { isValid: false, error: 'Generated multiplier above maximum' }
  }
  
  if (result.bet.targetMultiplier < LIMBO_CONFIG.MIN_MULTIPLIER) {
    return { isValid: false, error: 'Target multiplier below minimum' }
  }
  
  if (result.bet.targetMultiplier > LIMBO_CONFIG.MAX_MULTIPLIER) {
    return { isValid: false, error: 'Target multiplier above maximum' }
  }
  
  if (result.isWin !== determineWin(result.result.generatedMultiplier, result.bet.targetMultiplier)) {
    return { isValid: false, error: 'Win/loss determination mismatch' }
  }
  
  if (result.payout !== calculatePayout(result.bet.amount, result.bet.targetMultiplier, result.isWin)) {
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
