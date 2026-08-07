export type GameState = 'idle' | 'betting' | 'animating' | 'result' | 'payout'

export interface LimboBet {
  id: string
  amount: number
  targetMultiplier: number
  timestamp: number
}

export interface LimboResult {
  generatedMultiplier: number
  targetMultiplier: number
  timestamp: number
  gameId: string
  houseEdge: number
}

export interface LimboRound {
  id: string
  gameId: string
  bet: LimboBet
  result: LimboResult
  payout: number
  profit: number
  isWin: boolean
  timestamp: number
}

// Game configuration
export const LIMBO_CONFIG = {
  MIN_MULTIPLIER: 1.01,
  MAX_MULTIPLIER: 1000000, // 1 million max
  MIN_BET: 1,
  MAX_BET: 10000,
  HOUSE_EDGE: 0.01, // 1% house edge
  ANIMATION_DURATION: 3000, // 3 seconds
  MULTIPLIER_PRECISION: 2, // decimal places
} as const

// Quick multiplier presets
export const QUICK_MULTIPLIERS = [1.5, 2, 5, 10, 50, 100]

// Utility functions
export function generateGameId(): string {
  return `limbo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function createLimboBet(amount: number, targetMultiplier: number): LimboBet {
  return {
    id: `bet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    amount,
    targetMultiplier,
    timestamp: Date.now()
  }
}

export function createLimboResult(
  generatedMultiplier: number,
  targetMultiplier: number,
  houseEdge: number
): LimboResult {
  return {
    generatedMultiplier,
    targetMultiplier,
    timestamp: Date.now(),
    gameId: generateGameId(),
    houseEdge
  }
}

export function determineWin(generatedMultiplier: number, targetMultiplier: number): boolean {
  return generatedMultiplier >= targetMultiplier
}

export function calculatePayout(betAmount: number, targetMultiplier: number, won: boolean): number {
  return won ? betAmount * targetMultiplier : 0
}

export function calculateProfit(betAmount: number, payout: number): number {
  return payout - betAmount
}

export function createLimboRound(bet: LimboBet, result: LimboResult): LimboRound {
  const isWin = determineWin(result.generatedMultiplier, result.targetMultiplier)
  const payout = calculatePayout(bet.amount, bet.targetMultiplier, isWin)
  const profit = calculateProfit(bet.amount, payout)
  
  return {
    id: `round-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    gameId: result.gameId,
    bet,
    result,
    payout,
    profit,
    isWin,
    timestamp: Date.now()
  }
}

export function formatMultiplier(multiplier: number): string {
  return multiplier.toFixed(LIMBO_CONFIG.MULTIPLIER_PRECISION)
}

export function formatAmount(amount: number): string {
  return amount.toFixed(2)
}

export function formatProfit(profit: number): string {
  if (profit >= 0) {
    return `+${formatAmount(profit)}`
  } else {
    return `-${formatAmount(Math.abs(profit))}`
  }
}

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  })
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

// Mock history generation
export function generateMockHistory(count: number = 20): LimboRound[] {
  const history: LimboRound[] = []
  
  for (let i = 0; i < count; i++) {
    const targetMultiplier = QUICK_MULTIPLIERS[Math.floor(Math.random() * QUICK_MULTIPLIERS.length)]
    const betAmount = Math.floor(Math.random() * 500) + 10
    const generatedMultiplier = Math.random() * 50 + 1 // Random between 1 and 51
    
    const bet = createLimboBet(betAmount, targetMultiplier)
    const result = createLimboResult(generatedMultiplier, targetMultiplier, LIMBO_CONFIG.HOUSE_EDGE)
    result.timestamp = Date.now() - (i * 60000) // 1 minute ago per record
    
    const round = createLimboRound(bet, result)
    history.push(round)
  }
  
  return history.reverse()
}

// Statistics utilities
export function calculateStatistics(history: LimboRound[]) {
  if (history.length === 0) {
    return {
      totalGames: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      totalBet: 0,
      totalPayout: 0,
      totalProfit: 0,
      averageMultiplier: 0,
      highestMultiplier: 0,
      lowestMultiplier: 0,
      averageTargetMultiplier: 0
    }
  }
  
  const wins = history.filter(round => round.isWin).length
  const losses = history.length - wins
  const totalBet = history.reduce((sum, round) => sum + round.bet.amount, 0)
  const totalPayout = history.reduce((sum, round) => sum + round.payout, 0)
  const totalProfit = totalPayout - totalBet
  
  const allMultipliers = history.map(round => round.result.generatedMultiplier)
  const averageMultiplier = allMultipliers.reduce((sum, mult) => sum + mult, 0) / allMultipliers.length
  const highestMultiplier = Math.max(...allMultipliers)
  const lowestMultiplier = Math.min(...allMultipliers)
  
  const averageTargetMultiplier = history.reduce((sum, round) => sum + round.bet.targetMultiplier, 0) / history.length
  
  return {
    totalGames: history.length,
    wins,
    losses,
    winRate: (wins / history.length) * 100,
    totalBet,
    totalPayout,
    totalProfit,
    averageMultiplier,
    highestMultiplier,
    lowestMultiplier,
    averageTargetMultiplier
  }
}

// Multiplier distribution analysis
export function analyzeMultiplierDistribution(history: LimboRound[]) {
  if (history.length === 0) {
    return {
      lowMultiplier: 0,    // < 2x
      mediumMultiplier: 0, // 2x - 10x
      highMultiplier: 0,   // > 10x
      averageWinMultiplier: 0,
      averageLossMultiplier: 0
    }
  }
  
  const lowMultiplier = history.filter(round => round.result.generatedMultiplier < 2).length
  const mediumMultiplier = history.filter(round => 
    round.result.generatedMultiplier >= 2 && round.result.generatedMultiplier <= 10
  ).length
  const highMultiplier = history.filter(round => round.result.generatedMultiplier > 10).length
  
  const winMultipliers = history.filter(round => round.isWin).map(round => round.result.generatedMultiplier)
  const lossMultipliers = history.filter(round => !round.isWin).map(round => round.result.generatedMultiplier)
  
  const averageWinMultiplier = winMultipliers.length > 0 
    ? winMultipliers.reduce((sum, mult) => sum + mult, 0) / winMultipliers.length 
    : 0
  
  const averageLossMultiplier = lossMultipliers.length > 0 
    ? lossMultipliers.reduce((sum, mult) => sum + mult, 0) / lossMultipliers.length 
    : 0
  
  return {
    lowMultiplier,
    mediumMultiplier,
    highMultiplier,
    averageWinMultiplier,
    averageLossMultiplier
  }
}

// Validation utilities
export function validateBet(amount: number): boolean {
  return amount >= LIMBO_CONFIG.MIN_BET && amount <= LIMBO_CONFIG.MAX_BET
}

export function validateMultiplier(multiplier: number): boolean {
  return multiplier >= LIMBO_CONFIG.MIN_MULTIPLIER && multiplier <= LIMBO_CONFIG.MAX_MULTIPLIER
}

export function validateGameInput(amount: number, targetMultiplier: number): {
  isValid: boolean
  error?: string
} {
  if (amount <= 0) {
    return { isValid: false, error: 'Bet amount must be greater than 0' }
  }
  
  if (amount > LIMBO_CONFIG.MAX_BET) {
    return { isValid: false, error: `Maximum bet amount is ${LIMBO_CONFIG.MAX_BET}` }
  }
  
  if (targetMultiplier < LIMBO_CONFIG.MIN_MULTIPLIER) {
    return { isValid: false, error: `Target multiplier must be at least ${LIMBO_CONFIG.MIN_MULTIPLIER}x` }
  }
  
  if (targetMultiplier > LIMBO_CONFIG.MAX_MULTIPLIER) {
    return { isValid: false, error: `Target multiplier cannot exceed ${LIMBO_CONFIG.MAX_MULTIPLIER}x` }
  }
  
  return { isValid: true }
}

// Game state helpers
export function canBet(state: GameState): boolean {
  return state === 'idle'
}

export function isAnimating(state: GameState): boolean {
  return state === 'animating'
}

export function showResult(state: GameState): boolean {
  return state === 'result' || state === 'payout'
}

export function getGameStateColor(state: GameState): string {
  switch (state) {
    case 'idle':
      return 'text-emerald-400'
    case 'betting':
      return 'text-yellow-400'
    case 'animating':
      return 'text-blue-400'
    case 'result':
      return 'text-purple-400'
    case 'payout':
      return 'text-orange-400'
    default:
      return 'text-white'
  }
}

export function getGameStateText(state: GameState): string {
  switch (state) {
    case 'idle':
      return 'Ready to Bet'
    case 'betting':
      return 'Placing Bet...'
    case 'animating':
      return 'Flying...'
    case 'result':
      return 'Result!'
    case 'payout':
      return 'Payout'
    default:
      return 'Unknown'
  }
}

// Animation utilities
export function getAnimationDuration(targetMultiplier: number): number {
  // Longer animation for higher multipliers
  const baseDuration = LIMBO_CONFIG.ANIMATION_DURATION
  const multiplier = Math.min(targetMultiplier, 100) // Cap at 100 for reasonable duration
  return baseDuration + (multiplier * 20) // Add 20ms per multiplier unit
}

export function getMultiplierColor(multiplier: number, targetMultiplier: number): string {
  if (multiplier >= targetMultiplier) {
    return 'text-emerald-400'
  } else {
    return 'text-red-400'
  }
}

export function getMultiplierBgColor(multiplier: number, targetMultiplier: number): string {
  if (multiplier >= targetMultiplier) {
    return 'bg-emerald-600'
  } else {
    return 'bg-red-600'
  }
}

// Risk assessment
export function getRiskLevel(targetMultiplier: number): 'Low' | 'Medium' | 'High' | 'Extreme' {
  if (targetMultiplier <= 2) return 'Low'
  if (targetMultiplier <= 10) return 'Medium'
  if (targetMultiplier <= 100) return 'High'
  return 'Extreme'
}

export function getRiskColor(riskLevel: 'Low' | 'Medium' | 'High' | 'Extreme'): string {
  switch (riskLevel) {
    case 'Low':
      return 'text-emerald-400'
    case 'Medium':
      return 'text-yellow-400'
    case 'High':
      return 'text-orange-400'
    case 'Extreme':
      return 'text-red-400'
    default:
      return 'text-white'
  }
}

// Quick bet amounts
export const QUICK_BET_AMOUNTS = [10, 25, 50, 100, 250, 500]
