/**
 * Keno payout system with difficulty levels
 * Implements Stake-style payout multipliers
 */

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert'

export interface PayoutTable {
  [matches: number]: number
}

export interface DifficultyConfig {
  name: string
  description: string
  color: string
  bgColor: string
  payoutTable: PayoutTable
  minHitsToWin: number
  houseEdge: number
}

export const KENO_CONFIG = {
  totalNumbers: 40,
  drawCount: 10,
  maxSelections: 10,
  minSelections: 1,
  recommendedMinSelections: 4,
  minBet: 1,
  maxBet: 10000,
  houseEdge: 0.05 // 5% house edge
}

export const QUICK_BET_AMOUNTS = [10, 25, 50, 100, 250, 500]

export function formatAmount(amount: number): string {
  return amount.toFixed(2)
}

export function validateBet(amount: number, selections: number[]): {
  isValid: boolean
  error?: string
} {
  if (amount <= 0) {
    return { isValid: false, error: 'Bet amount must be greater than 0' }
  }
  
  if (amount < 1) {
    return { isValid: false, error: 'Minimum bet is 1' }
  }
  
  if (amount > 10000) {
    return { isValid: false, error: 'Maximum bet is 10000' }
  }
  
  if (selections.length === 0) {
    return { isValid: false, error: 'Please select at least one number' }
  }
  
  if (selections.length > 10) {
    return { isValid: false, error: 'Maximum 10 selections allowed' }
  }
  
  return { isValid: true }
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    name: 'Easy',
    description: 'Higher hit probability, lower payout',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-600/20',
    payoutTable: {
      4: 1.5,
      5: 3,
      6: 8,
      7: 20,
      8: 50,
      9: 150,
      10: 500
    },
    minHitsToWin: 4,
    houseEdge: 0.08
  },
  medium: {
    name: 'Medium',
    description: 'Balanced risk and reward',
    color: 'text-blue-400',
    bgColor: 'bg-blue-600/20',
    payoutTable: {
      4: 2,
      5: 5,
      6: 15,
      7: 40,
      8: 100,
      9: 300,
      10: 800
    },
    minHitsToWin: 4,
    houseEdge: 0.05
  },
  hard: {
    name: 'Hard',
    description: 'Lower probability, higher reward',
    color: 'text-orange-400',
    bgColor: 'bg-orange-600/20',
    payoutTable: {
      4: 3,
      5: 8,
      6: 25,
      7: 80,
      8: 200,
      9: 500,
      10: 1000
    },
    minHitsToWin: 4,
    houseEdge: 0.03
  },
  expert: {
    name: 'Expert',
    description: 'Very low probability, very high reward',
    color: 'text-red-400',
    bgColor: 'bg-red-600/20',
    payoutTable: {
      4: 5,
      5: 15,
      6: 50,
      7: 150,
      8: 400,
      9: 800,
      10: 1200
    },
    minHitsToWin: 4,
    houseEdge: 0.02
  }
}

export function getPayoutMultiplier(matches: number, difficulty: Difficulty): number {
  const config = DIFFICULTY_CONFIGS[difficulty]
  
  if (matches < config.minHitsToWin) {
    return 0 // No payout below minimum hits
  }
  
  return config.payoutTable[matches] || 0
}

export function calculatePayout(
  betAmount: number,
  matches: number,
  difficulty: Difficulty
): {
  payout: number
  profit: number
  multiplier: number
  isWin: boolean
} {
  const multiplier = getPayoutMultiplier(matches, difficulty)
  const payout = multiplier > 0 ? betAmount * multiplier : 0
  const profit = payout - betAmount
  const isWin = profit > 0
  
  return {
    payout,
    profit,
    multiplier,
    isWin
  }
}

export function getMinimumHitsToWin(difficulty: Difficulty): number {
  return DIFFICULTY_CONFIGS[difficulty].minHitsToWin
}

export function getDifficultyInfo(difficulty: Difficulty): DifficultyConfig {
  return DIFFICULTY_CONFIGS[difficulty]
}

export function getAllDifficulties(): Difficulty[] {
  return Object.keys(DIFFICULTY_CONFIGS) as Difficulty[]
}

export function getDifficultyColor(difficulty: Difficulty): string {
  return DIFFICULTY_CONFIGS[difficulty].color
}

export function getDifficultyBgColor(difficulty: Difficulty): string {
  return DIFFICULTY_CONFIGS[difficulty].bgColor
}

export function getDifficultyHouseEdge(difficulty: Difficulty): number {
  return DIFFICULTY_CONFIGS[difficulty].houseEdge
}

export function getExpectedValue(difficulty: Difficulty, selections: number = 10): number {
  // Calculate expected value for given difficulty and number of selections
  const config = DIFFICULTY_CONFIGS[difficulty]
  let expectedValue = 0
  
  // Use hypergeometric distribution for probabilities
  for (let matches = 0; matches <= Math.min(selections, KENO_CONFIG.drawCount); matches++) {
    const probability = getHypergeometricProbability(
      matches,
      selections,
      KENO_CONFIG.drawCount,
      KENO_CONFIG.totalNumbers
    )
    
    const multiplier = getPayoutMultiplier(matches, difficulty)
    const payout = multiplier > 0 ? multiplier : 0
    
    expectedValue += probability * payout
  }
  
  return expectedValue
}

function getHypergeometricProbability(
  matches: number,
  selections: number,
  drawCount: number,
  totalNumbers: number
): number {
  // Hypergeometric probability calculation
  const combinations = (n: number, k: number): number => {
    if (k > n || k < 0) return 0
    if (k === 0 || k === n) return 1
    
    let result = 1
    for (let i = 0; i < k; i++) {
      result = result * (n - i) / (k - i)
    }
    
    return result
  }
  
  const waysToChooseHits = combinations(selections, matches)
  const waysToChooseMisses = combinations(totalNumbers - selections, drawCount - matches)
  const totalWays = combinations(totalNumbers, drawCount)
  
  return (waysToChooseHits * waysToChooseMisses) / totalWays
}

export function getWinProbability(difficulty: Difficulty, selections: number = 10): number {
  const config = DIFFICULTY_CONFIGS[difficulty]
  let probability = 0
  
  for (let matches = config.minHitsToWin; matches <= Math.min(selections, KENO_CONFIG.drawCount); matches++) {
    probability += getHypergeometricProbability(
      matches,
      selections,
      KENO_CONFIG.drawCount,
      KENO_CONFIG.totalNumbers
    )
  }
  
  return probability
}

export function getRiskLevel(difficulty: Difficulty): 'low' | 'medium' | 'high' | 'very-high' {
  const winProbability = getWinProbability(difficulty)
  
  if (winProbability > 0.15) return 'low'
  if (winProbability > 0.08) return 'medium'
  if (winProbability > 0.04) return 'high'
  return 'very-high'
}

export function getRiskLevelColor(riskLevel: 'low' | 'medium' | 'high' | 'very-high'): string {
  switch (riskLevel) {
    case 'low': return 'text-emerald-400'
    case 'medium': return 'text-blue-400'
    case 'high': return 'text-orange-400'
    case 'very-high': return 'text-red-400'
    default: return 'text-slate-400'
  }
}

export function getPayoutTableDisplay(difficulty: Difficulty): Array<{
  matches: number
  multiplier: number
  probability: number
  expectedReturn: number
}> {
  const config = DIFFICULTY_CONFIGS[difficulty]
  const display = []
  
  for (let matches = config.minHitsToWin; matches <= 10; matches++) {
    const multiplier = config.payoutTable[matches] || 0
    const probability = getHypergeometricProbability(
      matches,
      10,
      KENO_CONFIG.drawCount,
      KENO_CONFIG.totalNumbers
    )
    const expectedReturn = multiplier * probability
    
    display.push({
      matches,
      multiplier,
      probability,
      expectedReturn
    })
  }
  
  return display
}

export function formatMultiplier(multiplier: number): string {
  return multiplier.toFixed(1) + 'x'
}

export function formatProbability(probability: number): string {
  return (probability * 100).toFixed(2) + '%'
}

export function formatExpectedValue(value: number): string {
  return value.toFixed(3)
}

export function getOptimalDifficulty(targetRTP: number = 0.95): Difficulty {
  // Find difficulty closest to target RTP (Return to Player)
  let bestDifficulty: Difficulty = 'medium'
  let bestDifference = Infinity
  
  for (const difficulty of getAllDifficulties()) {
    const expectedValue = getExpectedValue(difficulty)
    const difference = Math.abs(expectedValue - targetRTP)
    
    if (difference < bestDifference) {
      bestDifference = difference
      bestDifficulty = difficulty
    }
  }
  
  return bestDifficulty
}

export function validatePayoutTable(table: PayoutTable): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  // Check for required matches
  for (let matches = 4; matches <= 10; matches++) {
    if (!table[matches]) {
      errors.push(`Missing payout for ${matches} matches`)
    } else if (table[matches] <= 0) {
      errors.push(`Invalid payout for ${matches} matches: must be > 0`)
    }
  }
  
  // Check for increasing payouts
  for (let matches = 4; matches < 10; matches++) {
    if (table[matches] && table[matches + 1] && table[matches] >= table[matches + 1]) {
      errors.push(`Payouts must increase: ${matches} matches (${table[matches]}) >= ${matches + 1} matches (${table[matches + 1]})`)
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function getMaxPayout(difficulty: Difficulty): number {
  const config = DIFFICULTY_CONFIGS[difficulty]
  return Math.max(...Object.values(config.payoutTable))
}

export function getMinPayout(difficulty: Difficulty): number {
  const config = DIFFICULTY_CONFIGS[difficulty]
  const payouts = Object.values(config.payoutTable).filter(m => m > 0)
  return Math.min(...payouts)
}

export function calculateRTP(difficulty: Difficulty): number {
  // Return to Player percentage
  const expectedValue = getExpectedValue(difficulty)
  return expectedValue * 100
}

export function getDifficultyRecommendation(bankroll: number, betAmount: number): Difficulty {
  const riskRatio = betAmount / bankroll
  
  if (riskRatio > 0.05) return 'easy'
  if (riskRatio > 0.02) return 'medium'
  if (riskRatio > 0.01) return 'hard'
  return 'expert'
}

export function getStatisticsForDifficulty(difficulty: Difficulty): {
  winProbability: number
  expectedValue: number
  rtp: number
  maxPayout: number
  minPayout: number
  riskLevel: 'low' | 'medium' | 'high' | 'very-high'
} {
  return {
    winProbability: getWinProbability(difficulty),
    expectedValue: getExpectedValue(difficulty),
    rtp: calculateRTP(difficulty),
    maxPayout: getMaxPayout(difficulty),
    minPayout: getMinPayout(difficulty),
    riskLevel: getRiskLevel(difficulty)
  }
}
