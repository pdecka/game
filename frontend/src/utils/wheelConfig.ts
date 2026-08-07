export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert'

export type GameState = 'idle' | 'spinning' | 'result' | 'payout'

export interface WheelSegment {
  id: string
  multiplier: number
  weight: number
  color: string
  label: string
}

export interface WheelConfig {
  difficulty: Difficulty
  totalSegments: number
  segments: WheelSegment[]
  spinDuration: number
}

export interface WheelBet {
  id: string
  amount: number
  difficulty: Difficulty
  timestamp: number
}

export interface WheelResult {
  segment: WheelSegment
  difficulty: Difficulty
  timestamp: number
  gameId: string
  finalAngle: number
}

export interface WheelRound {
  id: string
  gameId: string
  bet: WheelBet
  result: WheelResult
  payout: number
  profit: number
  isWin: boolean
  timestamp: number
}

// Difficulty configurations
export const DIFFICULTY_CONFIGS: Record<Difficulty, WheelConfig> = {
  easy: {
    difficulty: 'easy',
    totalSegments: 20,
    spinDuration: 3000,
    segments: [
      // 50% losing segments (0x)
      { id: 'lose-1', multiplier: 0, weight: 10, color: '#6B7280', label: '0x' },
      { id: 'lose-2', multiplier: 0, weight: 10, color: '#6B7280', label: '0x' },
      
      // 50% winning segments - more frequent low multipliers
      { id: 'win-1', multiplier: 1.2, weight: 3, color: '#10B981', label: '1.2x' },
      { id: 'win-2', multiplier: 1.2, weight: 3, color: '#10B981', label: '1.2x' },
      { id: 'win-3', multiplier: 1.5, weight: 2, color: '#10B981', label: '1.5x' },
      { id: 'win-4', multiplier: 1.5, weight: 2, color: '#10B981', label: '1.5x' },
      { id: 'win-5', multiplier: 2, weight: 1, color: '#FCD34D', label: '2x' },
      { id: 'win-6', multiplier: 2, weight: 1, color: '#FCD34D', label: '2x' },
      { id: 'win-7', multiplier: 3, weight: 0.5, color: '#FCD34D', label: '3x' },
      { id: 'win-8', multiplier: 5, weight: 0.25, color: '#F97316', label: '5x' },
      { id: 'win-9', multiplier: 10, weight: 0.1, color: '#A855F7', label: '10x' },
      { id: 'win-10', multiplier: 20, weight: 0.05, color: '#EF4444', label: '20x' }
    ]
  },
  medium: {
    difficulty: 'medium',
    totalSegments: 30,
    spinDuration: 3500,
    segments: [
      // 50% losing segments (0x)
      { id: 'lose-1', multiplier: 0, weight: 15, color: '#6B7280', label: '0x' },
      { id: 'lose-2', multiplier: 0, weight: 15, color: '#6B7280', label: '0x' },
      
      // 50% winning segments - balanced distribution
      { id: 'win-1', multiplier: 1.3, weight: 4, color: '#10B981', label: '1.3x' },
      { id: 'win-2', multiplier: 1.3, weight: 4, color: '#10B981', label: '1.3x' },
      { id: 'win-3', multiplier: 1.8, weight: 3, color: '#10B981', label: '1.8x' },
      { id: 'win-4', multiplier: 1.8, weight: 3, color: '#10B981', label: '1.8x' },
      { id: 'win-5', multiplier: 2.5, weight: 2, color: '#FCD34D', label: '2.5x' },
      { id: 'win-6', multiplier: 2.5, weight: 2, color: '#FCD34D', label: '2.5x' },
      { id: 'win-7', multiplier: 4, weight: 1, color: '#FCD34D', label: '4x' },
      { id: 'win-8', multiplier: 6, weight: 0.5, color: '#F97316', label: '6x' },
      { id: 'win-9', multiplier: 12, weight: 0.25, color: '#A855F7', label: '12x' },
      { id: 'win-10', multiplier: 25, weight: 0.1, color: '#EF4444', label: '25x' }
    ]
  },
  hard: {
    difficulty: 'hard',
    totalSegments: 40,
    spinDuration: 4000,
    segments: [
      // 50% losing segments (0x)
      { id: 'lose-1', multiplier: 0, weight: 20, color: '#6B7280', label: '0x' },
      { id: 'lose-2', multiplier: 0, weight: 20, color: '#6B7280', label: '0x' },
      
      // 50% winning segments - fewer high multipliers
      { id: 'win-1', multiplier: 1.4, weight: 5, color: '#10B981', label: '1.4x' },
      { id: 'win-2', multiplier: 1.4, weight: 5, color: '#10B981', label: '1.4x' },
      { id: 'win-3', multiplier: 2, weight: 3, color: '#10B981', label: '2x' },
      { id: 'win-4', multiplier: 2, weight: 3, color: '#10B981', label: '2x' },
      { id: 'win-5', multiplier: 3, weight: 2, color: '#FCD34D', label: '3x' },
      { id: 'win-6', multiplier: 3, weight: 2, color: '#FCD34D', label: '3x' },
      { id: 'win-7', multiplier: 5, weight: 1, color: '#F97316', label: '5x' },
      { id: 'win-8', multiplier: 8, weight: 0.5, color: '#F97316', label: '8x' },
      { id: 'win-9', multiplier: 15, weight: 0.25, color: '#A855F7', label: '15x' },
      { id: 'win-10', multiplier: 30, weight: 0.1, color: '#EF4444', label: '30x' }
    ]
  },
  expert: {
    difficulty: 'expert',
    totalSegments: 50,
    spinDuration: 4500,
    segments: [
      // 50% losing segments (0x) - more clustered
      { id: 'lose-1', multiplier: 0, weight: 25, color: '#6B7280', label: '0x' },
      { id: 'lose-2', multiplier: 0, weight: 25, color: '#6B7280', label: '0x' },
      
      // 50% winning segments - very rare high multipliers
      { id: 'win-1', multiplier: 1.5, weight: 6, color: '#10B981', label: '1.5x' },
      { id: 'win-2', multiplier: 1.5, weight: 6, color: '#10B981', label: '1.5x' },
      { id: 'win-3', multiplier: 2.2, weight: 3, color: '#10B981', label: '2.2x' },
      { id: 'win-4', multiplier: 2.2, weight: 3, color: '#10B981', label: '2.2x' },
      { id: 'win-5', multiplier: 3.5, weight: 2, color: '#FCD34D', label: '3.5x' },
      { id: 'win-6', multiplier: 3.5, weight: 2, color: '#FCD34D', label: '3.5x' },
      { id: 'win-7', multiplier: 6, weight: 1, color: '#F97316', label: '6x' },
      { id: 'win-8', multiplier: 10, weight: 0.5, color: '#F97316', label: '10x' },
      { id: 'win-9', multiplier: 20, weight: 0.2, color: '#A855F7', label: '20x' },
      { id: 'win-10', multiplier: 40, weight: 0.05, color: '#EF4444', label: '40x' }
    ]
  }
}

// Game configuration
export const WHEEL_CONFIG = {
  MIN_BET: 1,
  MAX_BET: 10000,
  HOUSE_EDGE: 0.02, // 2% house edge
  ROTATION_MULTIPLIER: 5, // Extra rotations for visual effect
  POINTER_ANGLE: -90, // Pointer at top (12 o'clock)
} as const

// Utility functions
export function generateGameId(): string {
  return `wheel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function createWheelBet(amount: number, difficulty: Difficulty): WheelBet {
  return {
    id: `bet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    amount,
    difficulty,
    timestamp: Date.now()
  }
}

export function createWheelResult(
  segment: WheelSegment,
  difficulty: Difficulty,
  finalAngle: number
): WheelResult {
  return {
    segment,
    difficulty,
    finalAngle,
    timestamp: Date.now(),
    gameId: generateGameId()
  }
}

export function determineWin(multiplier: number): boolean {
  return multiplier > 0
}

export function calculatePayout(betAmount: number, multiplier: number): number {
  return betAmount * multiplier
}

export function calculateProfit(betAmount: number, payout: number): number {
  return payout - betAmount
}

export function createWheelRound(bet: WheelBet, result: WheelResult): WheelRound {
  const isWin = determineWin(result.segment.multiplier)
  const payout = calculatePayout(bet.amount, result.segment.multiplier)
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
  return multiplier.toFixed(2)
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
export function generateMockHistory(count: number = 20): WheelRound[] {
  const history: WheelRound[] = []
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert']
  
  for (let i = 0; i < count; i++) {
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)]
    const config = DIFFICULTY_CONFIGS[difficulty]
    const betAmount = Math.floor(Math.random() * 500) + 10
    
    // Select random segment
    const segment = config.segments[Math.floor(Math.random() * config.segments.length)]
    
    const bet = createWheelBet(betAmount, difficulty)
    const finalAngle = Math.random() * 360
    const result = createWheelResult(segment, difficulty, finalAngle)
    result.timestamp = Date.now() - (i * 60000) // 1 minute ago per record
    
    const round = createWheelRound(bet, result)
    history.push(round)
  }
  
  return history.reverse()
}

// Statistics utilities
export function calculateStatistics(history: WheelRound[]) {
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
      lowestMultiplier: 0
    }
  }
  
  const wins = history.filter(round => round.isWin).length
  const losses = history.length - wins
  const totalBet = history.reduce((sum, round) => sum + round.bet.amount, 0)
  const totalPayout = history.reduce((sum, round) => sum + round.payout, 0)
  const totalProfit = totalPayout - totalBet
  
  const multipliers = history.map(round => round.result.segment.multiplier)
  const nonZeroMultipliers = multipliers.filter(m => m > 0)
  const averageMultiplier = nonZeroMultipliers.length > 0 
    ? nonZeroMultipliers.reduce((sum, m) => sum + m, 0) / nonZeroMultipliers.length 
    : 0
  const highestMultiplier = Math.max(...multipliers)
  const lowestMultiplier = Math.min(...multipliers)
  
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
    lowestMultiplier
  }
}

// Difficulty analysis
export function analyzeDifficultyPerformance(history: WheelRound[]): Record<Difficulty, {
  games: number
  wins: number
  winRate: number
  totalProfit: number
  averageMultiplier: number
}> {
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert']
  const analysis: Record<Difficulty, {
    games: number
    wins: number
    winRate: number
    totalProfit: number
    averageMultiplier: number
  }> = {
    easy: { games: 0, wins: 0, winRate: 0, totalProfit: 0, averageMultiplier: 0 },
    medium: { games: 0, wins: 0, winRate: 0, totalProfit: 0, averageMultiplier: 0 },
    hard: { games: 0, wins: 0, winRate: 0, totalProfit: 0, averageMultiplier: 0 },
    expert: { games: 0, wins: 0, winRate: 0, totalProfit: 0, averageMultiplier: 0 }
  }
  
  difficulties.forEach(difficulty => {
    const difficultyGames = history.filter(round => round.bet.difficulty === difficulty)
    const wins = difficultyGames.filter(round => round.isWin).length
    const totalProfit = difficultyGames.reduce((sum, round) => sum + round.profit, 0)
    
    const nonZeroMultipliers = difficultyGames
      .filter(round => round.result.segment.multiplier > 0)
      .map(round => round.result.segment.multiplier)
    const averageMultiplier = nonZeroMultipliers.length > 0 
      ? nonZeroMultipliers.reduce((sum, m) => sum + m, 0) / nonZeroMultipliers.length 
      : 0
    
    analysis[difficulty] = {
      games: difficultyGames.length,
      wins,
      winRate: difficultyGames.length > 0 ? (wins / difficultyGames.length) * 100 : 0,
      totalProfit,
      averageMultiplier
    }
  })
  
  return analysis
}

// Validation utilities
export function validateBet(amount: number): boolean {
  return amount >= WHEEL_CONFIG.MIN_BET && amount <= WHEEL_CONFIG.MAX_BET
}

export function validateDifficulty(difficulty: string): difficulty is Difficulty {
  return ['easy', 'medium', 'hard', 'expert'].includes(difficulty)
}

export function validateGameInput(amount: number, difficulty: Difficulty): {
  isValid: boolean
  error?: string
} {
  if (amount <= 0) {
    return { isValid: false, error: 'Bet amount must be greater than 0' }
  }
  
  if (amount > WHEEL_CONFIG.MAX_BET) {
    return { isValid: false, error: `Maximum bet amount is ${WHEEL_CONFIG.MAX_BET}` }
  }
  
  if (!validateDifficulty(difficulty)) {
    return { isValid: false, error: 'Invalid difficulty level' }
  }
  
  return { isValid: true }
}

// Game state helpers
export function canSpin(state: GameState): boolean {
  return state === 'idle'
}

export function isSpinning(state: GameState): boolean {
  return state === 'spinning'
}

export function showResult(state: GameState): boolean {
  return state === 'result' || state === 'payout'
}

export function getGameStateColor(state: GameState): string {
  switch (state) {
    case 'idle':
      return 'text-emerald-400'
    case 'spinning':
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
      return 'Ready to Spin'
    case 'spinning':
      return 'Spinning...'
    case 'result':
      return 'Result!'
    case 'payout':
      return 'Payout'
    default:
      return 'Unknown'
  }
}

// Animation utilities
export function calculateSpinAngle(targetSegmentIndex: number, totalSegments: number): number {
  const segmentAngle = 360 / totalSegments
  const segmentCenter = targetSegmentIndex * segmentAngle + segmentAngle / 2
  
  // Calculate angle needed to position segment at pointer
  const targetAngle = WHEEL_CONFIG.POINTER_ANGLE - segmentCenter
  
  // Add extra rotations for visual effect
  const extraRotations = WHEEL_CONFIG.ROTATION_MULTIPLIER * 360
  
  return targetAngle + extraRotations
}

export function getSegmentColor(multiplier: number): string {
  if (multiplier === 0) return '#6B7280' // Gray for losses
  if (multiplier <= 2) return '#10B981' // Green for low multipliers
  if (multiplier <= 5) return '#FCD34D' // Yellow for medium multipliers
  if (multiplier <= 15) return '#F97316' // Orange for high multipliers
  return '#EF4444' // Red for very high multipliers
}

// Quick bet amounts
export const QUICK_BET_AMOUNTS = [10, 25, 50, 100, 250, 500]

// Difficulty display info
export const DIFFICULTY_INFO: Record<Difficulty, {
  name: string
  color: string
  description: string
  riskLevel: 'Low' | 'Medium' | 'High' | 'Extreme'
  maxMultiplier: number
}> = {
  easy: {
    name: 'Easy',
    color: 'text-emerald-400',
    description: 'More frequent wins, lower multipliers',
    riskLevel: 'Low',
    maxMultiplier: 20
  },
  medium: {
    name: 'Medium',
    color: 'text-yellow-400',
    description: 'Balanced risk and reward',
    riskLevel: 'Medium',
    maxMultiplier: 25
  },
  hard: {
    name: 'Hard',
    color: 'text-orange-400',
    description: 'Higher risk, better rewards',
    riskLevel: 'High',
    maxMultiplier: 30
  },
  expert: {
    name: 'Expert',
    color: 'text-red-400',
    description: 'Maximum risk, maximum rewards',
    riskLevel: 'Extreme',
    maxMultiplier: 40
  }
}
