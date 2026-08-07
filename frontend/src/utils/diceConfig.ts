export type GameState = 'idle' | 'rolling' | 'result' | 'payout'

export type RollType = 'over' | 'under'

export interface DiceBet {
  id: string
  amount: number
  target: number
  rollType: RollType
  timestamp: number
}

export interface DiceResult {
  rollValue: number
  target: number
  rollType: RollType
  winChance: number
  multiplier: number
  timestamp: number
  gameId: string
}

export interface DiceRound {
  id: string
  gameId: string
  bet: DiceBet
  result: DiceResult
  payout: number
  profit: number
  isWin: boolean
  timestamp: number
}

// Game configuration
export const DICE_CONFIG = {
  MIN_TARGET: 2,
  MAX_TARGET: 96,
  MIN_BET: 1,
  MAX_BET: 10000,
  HOUSE_EDGE: 0.02, // 2% house edge
  ROLL_RANGE: 100,
  PRECISION: 2, // decimal places for roll value
  ANIMATION_DURATION: 2000, // 2 seconds
} as const

// Utility functions
export function generateGameId(): string {
  return `dice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function createDiceBet(amount: number, target: number, rollType: RollType): DiceBet {
  return {
    id: `bet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    amount,
    target,
    rollType,
    timestamp: Date.now()
  }
}

export function createDiceResult(
  rollValue: number,
  target: number,
  rollType: RollType,
  winChance: number,
  multiplier: number
): DiceResult {
  return {
    rollValue,
    target,
    rollType,
    winChance,
    multiplier,
    timestamp: Date.now(),
    gameId: generateGameId()
  }
}

export function determineWin(rollValue: number, target: number, rollType: RollType): boolean {
  if (rollType === 'over') {
    return rollValue > target
  } else {
    return rollValue < target
  }
}

export function calculatePayout(betAmount: number, multiplier: number): number {
  return betAmount * multiplier
}

export function calculateProfit(betAmount: number, payout: number): number {
  return payout - betAmount
}

export function createDiceRound(bet: DiceBet, result: DiceResult): DiceRound {
  const isWin = determineWin(result.rollValue, result.target, result.rollType)
  const payout = calculatePayout(bet.amount, result.multiplier)
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

export function formatRollValue(value: number): string {
  return value.toFixed(DICE_CONFIG.PRECISION)
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
export function generateMockHistory(count: number = 20): DiceRound[] {
  const history: DiceRound[] = []
  
  for (let i = 0; i < count; i++) {
    const target = Math.floor(Math.random() * 94) + 2 // 2-96
    const rollType: RollType = Math.random() < 0.5 ? 'over' : 'under'
    const betAmount = Math.floor(Math.random() * 500) + 10
    const rollValue = Math.random() * 100
    
    const bet = createDiceBet(betAmount, target, rollType)
    
    // Calculate win chance and multiplier
    const winChance = calculateWinChance(target, rollType)
    const multiplier = calculateMultiplier(winChance)
    
    const result = createDiceResult(rollValue, target, rollType, winChance, multiplier)
    result.timestamp = Date.now() - (i * 60000) // 1 minute ago per record
    
    const round = createDiceRound(bet, result)
    history.push(round)
  }
  
  return history.reverse()
}

// Probability calculations
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

export function validateTarget(target: number): boolean {
  return target >= DICE_CONFIG.MIN_TARGET && target <= DICE_CONFIG.MAX_TARGET
}

export function validateBet(amount: number): boolean {
  return amount >= DICE_CONFIG.MIN_BET && amount <= DICE_CONFIG.MAX_BET
}

export function validateRollType(rollType: string): rollType is RollType {
  return rollType === 'over' || rollType === 'under'
}

export function validateGameInput(amount: number, target: number, rollType: RollType): {
  isValid: boolean
  error?: string
} {
  if (amount <= 0) {
    return { isValid: false, error: 'Bet amount must be greater than 0' }
  }
  
  if (amount > DICE_CONFIG.MAX_BET) {
    return { isValid: false, error: `Maximum bet amount is ${DICE_CONFIG.MAX_BET}` }
  }
  
  if (!validateTarget(target)) {
    return { isValid: false, error: `Target must be between ${DICE_CONFIG.MIN_TARGET} and ${DICE_CONFIG.MAX_TARGET}` }
  }
  
  if (!validateRollType(rollType)) {
    return { isValid: false, error: 'Invalid roll type' }
  }
  
  return { isValid: true }
}

// Statistics utilities
export function calculateStatistics(history: DiceRound[]) {
  if (history.length === 0) {
    return {
      totalGames: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      totalBet: 0,
      totalPayout: 0,
      totalProfit: 0,
      averageRollValue: 0,
      averageMultiplier: 0,
      overWins: 0,
      underWins: 0
    }
  }
  
  const wins = history.filter(round => round.isWin).length
  const losses = history.length - wins
  const totalBet = history.reduce((sum, round) => sum + round.bet.amount, 0)
  const totalPayout = history.reduce((sum, round) => sum + round.payout, 0)
  const totalProfit = totalPayout - totalBet
  const averageRollValue = history.reduce((sum, round) => sum + round.result.rollValue, 0) / history.length
  const averageMultiplier = history.reduce((sum, round) => sum + round.result.multiplier, 0) / history.length
  const overWins = history.filter(round => round.bet.rollType === 'over' && round.isWin).length
  const underWins = history.filter(round => round.bet.rollType === 'under' && round.isWin).length
  
  return {
    totalGames: history.length,
    wins,
    losses,
    winRate: (wins / history.length) * 100,
    totalBet,
    totalPayout,
    totalProfit,
    averageRollValue,
    averageMultiplier,
    overWins,
    underWins
  }
}

// Target distribution analysis
export function analyzeTargetDistribution(history: DiceRound[]): {
  lowTargets: number
  mediumTargets: number
  highTargets: number
  averageTarget: number
  mostCommonTarget: number
} {
  if (history.length === 0) {
    return {
      lowTargets: 0,
      mediumTargets: 0,
      highTargets: 0,
      averageTarget: 0,
      mostCommonTarget: 0
    }
  }
  
  const targets = history.map(round => round.bet.target)
  const lowTargets = targets.filter(t => t <= 33).length
  const mediumTargets = targets.filter(t => t > 33 && t <= 66).length
  const highTargets = targets.filter(t => t > 66).length
  const averageTarget = targets.reduce((sum, t) => sum + t, 0) / targets.length
  
  // Find most common target (rounded to nearest integer)
  const targetCounts: Record<number, number> = {}
  targets.forEach(target => {
    const rounded = Math.round(target)
    targetCounts[rounded] = (targetCounts[rounded] || 0) + 1
  })
  
  const mostCommonTarget = Number(Object.entries(targetCounts)
    .reduce((a, b) => a[1] > b[1] ? a : b)[0])
  
  return {
    lowTargets,
    mediumTargets,
    highTargets,
    averageTarget,
    mostCommonTarget
  }
}

// Game state helpers
export function canRoll(state: GameState): boolean {
  return state === 'idle'
}

export function isRolling(state: GameState): boolean {
  return state === 'rolling'
}

export function showResult(state: GameState): boolean {
  return state === 'result' || state === 'payout'
}

export function getGameStateColor(state: GameState): string {
  switch (state) {
    case 'idle':
      return 'text-emerald-400'
    case 'rolling':
      return 'text-yellow-400'
    case 'result':
      return 'text-blue-400'
    case 'payout':
      return 'text-purple-400'
    default:
      return 'text-white'
  }
}

export function getGameStateText(state: GameState): string {
  switch (state) {
    case 'idle':
      return 'Ready to Roll'
    case 'rolling':
      return 'Rolling...'
    case 'result':
      return 'Result!'
    case 'payout':
      return 'Payout'
    default:
      return 'Unknown'
  }
}

// Slider utilities
export function getWinningZone(target: number, rollType: RollType): {
  start: number
  end: number
  size: number
} {
  if (rollType === 'over') {
    return {
      start: target,
      end: DICE_CONFIG.ROLL_RANGE,
      size: DICE_CONFIG.ROLL_RANGE - target
    }
  } else {
    return {
      start: 0,
      end: target,
      size: target
    }
  }
}

export function getLosingZone(target: number, rollType: RollType): {
  start: number
  end: number
  size: number
} {
  if (rollType === 'over') {
    return {
      start: 0,
      end: target,
      size: target
    }
  } else {
    return {
      start: target,
      end: DICE_CONFIG.ROLL_RANGE,
      size: DICE_CONFIG.ROLL_RANGE - target
    }
  }
}

export function getZoneColor(isWinning: boolean): string {
  return isWinning ? 'bg-emerald-600' : 'bg-red-600'
}

export function getZoneTextColor(isWinning: boolean): string {
  return isWinning ? 'text-emerald-400' : 'text-red-400'
}

// Quick bet amounts
export const QUICK_BET_AMOUNTS = [10, 25, 50, 100, 250, 500]

// Quick target presets
export const QUICK_TARGETS = [
  { value: 25, label: '25' },
  { value: 50, label: '50' },
  { value: 75, label: '75' }
]

// Risk assessment
export function getRiskLevel(winChance: number): 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High' {
  if (winChance >= 0.45) return 'Very Low'
  if (winChance >= 0.35) return 'Low'
  if (winChance >= 0.25) return 'Medium'
  if (winChance >= 0.15) return 'High'
  return 'Very High'
}

export function getRiskColor(riskLevel: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High'): string {
  switch (riskLevel) {
    case 'Very Low': return 'text-emerald-400'
    case 'Low': return 'text-green-400'
    case 'Medium': return 'text-yellow-400'
    case 'High': return 'text-orange-400'
    case 'Very High': return 'text-red-400'
    default: return 'text-white'
  }
}

export function getRiskBgColor(riskLevel: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High'): string {
  switch (riskLevel) {
    case 'Very Low': return 'bg-emerald-600'
    case 'Low': return 'bg-green-600'
    case 'Medium': return 'bg-yellow-600'
    case 'High': return 'bg-orange-600'
    case 'Very High': return 'bg-red-600'
    default: return 'bg-gray-600'
  }
}

// Animation utilities
export function getRollAnimationClass(state: GameState): string {
  switch (state) {
    case 'rolling':
      return 'animate-pulse'
    case 'result':
      return 'animate-bounce'
    default:
      return ''
  }
}

export function formatMultiplierForDisplay(multiplier: number): string {
  if (multiplier >= 100) {
    return `${(multiplier / 100).toFixed(1)}kx`
  } else if (multiplier >= 10) {
    return `${multiplier.toFixed(0)}x`
  } else {
    return `${multiplier.toFixed(2)}x`
  }
}
