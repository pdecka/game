export type CoinSide = 'heads' | 'tails'

export type GameState = 'idle' | 'flipping' | 'result' | 'payout'

export interface CoinBet {
  id: string
  side: CoinSide
  amount: number
  timestamp: number
}

export interface CoinResult {
  side: CoinSide
  timestamp: number
  gameId: string
}

export interface CoinRound {
  id: string
  gameId: string
  bet: CoinBet
  result: CoinResult
  payout: number
  profit: number
  isWin: boolean
  timestamp: number
}

// Game configuration
export const COIN_CONFIG = {
  PAYOUT_MULTIPLIER: 2,
  ANIMATION_DURATION: 2000, // 2 seconds
  MIN_BET: 1,
  MAX_BET: 10000,
} as const

// Coin side configuration
export const COIN_SIDES: Record<CoinSide, {
  name: string
  emoji: string
  color: string
  bgColor: string
  borderColor: string
  hoverColor: string
}> = {
  heads: {
    name: 'Heads',
    emoji: 'ð',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500',
    borderColor: 'border-yellow-600',
    hoverColor: 'hover:bg-yellow-600'
  },
  tails: {
    name: 'Tails',
    emoji: 'ð',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500',
    borderColor: 'border-blue-600',
    hoverColor: 'hover:bg-blue-600'
  }
}

// Utility functions
export function generateGameId(): string {
  return `coin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function generateCoinResult(): CoinResult {
  const side: CoinSide = Math.random() < 0.5 ? 'heads' : 'tails'
  
  return {
    side,
    timestamp: Date.now(),
    gameId: generateGameId()
  }
}

export function createCoinBet(side: CoinSide, amount: number): CoinBet {
  return {
    id: `bet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    side,
    amount,
    timestamp: Date.now()
  }
}

export function calculatePayout(betAmount: number, won: boolean): number {
  return won ? betAmount * COIN_CONFIG.PAYOUT_MULTIPLIER : 0
}

export function calculateProfit(betAmount: number, payout: number): number {
  return payout - betAmount
}

export function determineWin(betSide: CoinSide, resultSide: CoinSide): boolean {
  return betSide === resultSide
}

export function createCoinRound(bet: CoinBet, result: CoinResult): CoinRound {
  const isWin = determineWin(bet.side, result.side)
  const payout = calculatePayout(bet.amount, isWin)
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

// Mock history generation
export function generateMockHistory(count: number = 20): CoinRound[] {
  const history: CoinRound[] = []
  
  for (let i = 0; i < count; i++) {
    const betSide: CoinSide = Math.random() < 0.5 ? 'heads' : 'tails'
    const resultSide: CoinSide = Math.random() < 0.5 ? 'heads' : 'tails'
    const betAmount = Math.floor(Math.random() * 500) + 10
    
    const bet = createCoinBet(betSide, betAmount)
    const result = generateCoinResult()
    result.side = resultSide
    result.timestamp = Date.now() - (i * 60000) // 1 minute ago per record
    
    const round = createCoinRound(bet, result)
    history.push(round)
  }
  
  return history.reverse()
}

// Statistics utilities
export function calculateStatistics(history: CoinRound[]) {
  if (history.length === 0) {
    return {
      totalGames: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      totalBet: 0,
      totalPayout: 0,
      totalProfit: 0,
      headsWins: 0,
      tailsWins: 0
    }
  }
  
  const wins = history.filter(round => round.isWin).length
  const losses = history.length - wins
  const totalBet = history.reduce((sum, round) => sum + round.bet.amount, 0)
  const totalPayout = history.reduce((sum, round) => sum + round.payout, 0)
  const totalProfit = totalPayout - totalBet
  const headsWins = history.filter(round => round.isWin && round.result.side === 'heads').length
  const tailsWins = history.filter(round => round.isWin && round.result.side === 'tails').length
  
  return {
    totalGames: history.length,
    wins,
    losses,
    winRate: (wins / history.length) * 100,
    totalBet,
    totalPayout,
    totalProfit,
    headsWins,
    tailsWins
  }
}

// Animation utilities
export function getCoinRotation(result: CoinSide): number {
  // Base rotations to land on the correct side
  const baseRotations = {
    heads: 0,      // 0 degrees = heads
    tails: 180     // 180 degrees = tails
  }
  
  // Add multiple full rotations for visual effect
  const fullRotations = 5 // 5 full rotations
  const additionalRotation = fullRotations * 360
  
  return baseRotations[result] + additionalRotation
}

export function getCoinAnimationClass(state: GameState): string {
  switch (state) {
    case 'idle':
      return ''
    case 'flipping':
      return 'animate-spin'
    case 'result':
      return 'animate-bounce'
    case 'payout':
      return 'animate-pulse'
    default:
      return ''
  }
}

// Validation utilities
export function validateBet(amount: number): boolean {
  return amount >= COIN_CONFIG.MIN_BET && amount <= COIN_CONFIG.MAX_BET
}

export function validateSide(side: string): side is CoinSide {
  return side === 'heads' || side === 'tails'
}

// Quick bet amounts
export const QUICK_BET_AMOUNTS = [10, 25, 50, 100, 250, 500]

// Game state helpers
export function canFlip(state: GameState): boolean {
  return state === 'idle'
}

export function isAnimating(state: GameState): boolean {
  return state === 'flipping'
}

export function showResult(state: GameState): boolean {
  return state === 'result' || state === 'payout'
}

export function getGameStateColor(state: GameState): string {
  switch (state) {
    case 'idle':
      return 'text-emerald-400'
    case 'flipping':
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
      return 'Ready to Flip'
    case 'flipping':
      return 'Flipping...'
    case 'result':
      return 'Result!'
    case 'payout':
      return 'Payout'
    default:
      return 'Unknown'
  }
}
