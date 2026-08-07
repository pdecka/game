/**
 * Scratch Card Game Engine
 * Pre-determined outcomes with RNG-based result generation
 */

export type Volatility = 'low' | 'medium' | 'high'
export type CardType = 'classic' | 'multiplier' | 'bonus' | 'jackpot'
export type GameState = 'idle' | 'generated' | 'scratching' | 'revealed' | 'result'

export interface SymbolConfig {
  id: string
  emoji: string
  value: number
  type: 'normal' | 'bonus' | 'jackpot' | 'multiplier'
  weight: number
}

export interface ScratchConfig {
  rtp: number
  volatility: Volatility
  minBet: number
  maxBet: number
  gridSize: number
  symbols: SymbolConfig[]
  multipliers: number[]
  jackpotOdds: number
  autoRevealThreshold: number
}

export interface ScratchResult {
  id: string
  isWin: boolean
  multiplier: number
  totalPayout: number
  symbolGrid: string[][]
  winningSymbols: string[]
  timestamp: number
  volatility: Volatility
  cardType: CardType
  seed?: number
}

export interface ScratchRound {
  id: string
  betAmount: number
  result: ScratchResult
  timestamp: number
}

export const DEFAULT_SYMBOLS: SymbolConfig[] = [
  { id: 'cherry', emoji: 'ð', value: 1, type: 'normal', weight: 30 },
  { id: 'lemon', emoji: 'ð', value: 1, type: 'normal', weight: 25 },
  { id: 'orange', emoji: 'ð', value: 1, type: 'normal', weight: 20 },
  { id: 'plum', emoji: 'ð', value: 1, type: 'normal', weight: 15 },
  { id: 'bell', emoji: 'ð', value: 2, type: 'bonus', weight: 8 },
  { id: 'star', emoji: 'â', value: 3, type: 'multiplier', weight: 5 },
  { id: 'seven', emoji: '7ï¸', value: 10, type: 'jackpot', weight: 1 },
]

export const DEFAULT_CONFIG: ScratchConfig = {
  rtp: 95,
  volatility: 'medium',
  minBet: 1,
  maxBet: 10000,
  gridSize: 9, // 3x3 grid
  symbols: DEFAULT_SYMBOLS,
  multipliers: [1.2, 1.5, 2, 3, 5, 10, 25, 50, 100],
  jackpotOdds: 1000,
  autoRevealThreshold: 0.6
}

export function createScratchConfig(overrides: Partial<ScratchConfig> = {}): ScratchConfig {
  return { ...DEFAULT_CONFIG, ...overrides }
}

// RNG function with optional seed for provably fair
function rng(min: number, max: number, seed?: number): number {
  if (seed !== undefined) {
    // Seeded random for testing/provably fair
    const x = Math.sin(seed) * 10000
    seed = x - Math.floor(x)
    return Math.floor(seed * (max - min + 1)) + min
  }
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Weighted random selection
function weightedRandom<T>(items: T[], weights: number[], seed?: number): T {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  let random = seed ? rng(0, totalWeight - 1, seed) : Math.random() * totalWeight
  
  for (let i = 0; i < items.length; i++) {
    random -= weights[i]
    if (random <= 0) {
      return items[i]
    }
  }
  
  return items[items.length - 1]
}

// Get volatility-based win probability
function getWinProbability(volatility: Volatility): number {
  switch (volatility) {
    case 'low':
      return 0.45 // 45% win rate
    case 'medium':
      return 0.35 // 35% win rate
    case 'high':
      return 0.20 // 20% win rate
    default:
      return 0.35
  }
}

// Get volatility-based multiplier range
function getMultiplierRange(volatility: Volatility): { min: number; max: number } {
  switch (volatility) {
    case 'low':
      return { min: 1.2, max: 3 }
    case 'medium':
      return { min: 1.5, max: 10 }
    case 'high':
      return { min: 2, max: 100 }
    default:
      return { min: 1.5, max: 10 }
  }
}

// Generate scratch result with pre-determined outcome
export function generateScratchResult(
  betAmount: number,
  volatility: Volatility,
  config: ScratchConfig,
  seed?: number
): ScratchResult {
  const winProbability = getWinProbability(volatility)
  const isWin = seed ? rng(0, 999, seed) < winProbability * 1000 : Math.random() < winProbability
  
  let multiplier = 1
  let symbolGrid: string[][]
  let winningSymbols: string[] = []
  let cardType: CardType = 'classic'
  
  if (isWin) {
    const multiplierRange = getMultiplierRange(volatility)
    const availableMultipliers = config.multipliers.filter(m => 
      m >= multiplierRange.min && m <= multiplierRange.max
    )
    
    multiplier = weightedRandom(availableMultipliers, 
      availableMultipliers.map(() => 1), 
      seed ? seed + 1 : undefined
    )
    
    // Determine card type based on multiplier
    if (multiplier >= 50) {
      cardType = 'jackpot'
    } else if (multiplier >= 10) {
      cardType = 'multiplier'
    } else if (multiplier >= 3) {
      cardType = 'bonus'
    } else {
      cardType = 'classic'
    }
    
    // Generate winning grid
    const winningSymbol = weightedRandom(
      config.symbols,
      config.symbols.map(s => s.weight),
      seed ? seed + 2 : undefined
    )
    
    winningSymbols = Array(3).fill(winningSymbol.id)
    
    // Create 3x3 grid with winning combination
    symbolGrid = generateWinningGrid(winningSymbol.emoji, config.gridSize, seed ? seed + 3 : undefined)
  } else {
    // Generate losing grid
    symbolGrid = generateLosingGrid(config.symbols, config.gridSize, seed ? seed + 4 : undefined)
    cardType = 'classic'
  }
  
  const totalPayout = isWin ? betAmount * multiplier : 0
  
  return {
    id: Date.now().toString(),
    isWin,
    multiplier,
    totalPayout,
    symbolGrid,
    winningSymbols,
    timestamp: Date.now(),
    volatility,
    cardType,
    seed
  }
}

// Generate winning grid with matching symbols
function generateWinningGrid(winningEmoji: string, gridSize: number, seed?: number): string[][] {
  const size = Math.sqrt(gridSize)
  const grid: string[][] = []
  
  // Create grid with winning combination
  for (let i = 0; i < size; i++) {
    const row: string[] = []
    for (let j = 0; j < size; j++) {
      // Place winning symbols in a pattern (row, column, or diagonal)
      if (i === 0 || (i === 1 && j === 1) || (i === 2 && j === 2)) {
        row.push(winningEmoji)
      } else {
        // Random losing symbols
        const losingSymbols = ['ð', 'ð', 'ð', 'ð']
        row.push(losingSymbols[Math.floor(Math.random() * losingSymbols.length)])
      }
    }
    grid.push(row)
  }
  
  return grid
}

// Generate losing grid with no matching symbols
function generateLosingGrid(symbols: SymbolConfig[], gridSize: number, seed?: number): string[][] {
  const size = Math.sqrt(gridSize)
  const grid: string[][] = []
  const usedSymbols: string[] = []
  
  for (let i = 0; i < size; i++) {
    const row: string[] = []
    for (let j = 0; j < size; j++) {
      let symbol: SymbolConfig
      
      do {
        symbol = weightedRandom(
          symbols,
          symbols.map(s => s.weight),
          seed ? seed + i * size + j : undefined
        )
      } while (usedSymbols.length < 8 && usedSymbols.includes(symbol.emoji)) // Avoid too many matches
      
      row.push(symbol.emoji)
      usedSymbols.push(symbol.emoji)
    }
    grid.push(row)
  }
  
  return grid
}

// Check if grid has winning combination
export function checkWinCondition(grid: string[][]): {
  isWin: boolean
  winningSymbols: string[]
  winType: 'row' | 'column' | 'diagonal' | 'none'
} {
  const size = grid.length
  
  // Check rows
  for (let i = 0; i < size; i++) {
    if (grid[i].every(symbol => symbol === grid[i][0])) {
      return {
        isWin: true,
        winningSymbols: grid[i],
        winType: 'row'
      }
    }
  }
  
  // Check columns
  for (let j = 0; j < size; j++) {
    const column = grid.map(row => row[j])
    if (column.every(symbol => symbol === column[0])) {
      return {
        isWin: true,
        winningSymbols: column,
        winType: 'column'
      }
    }
  }
  
  // Check diagonals
  const diagonal1 = grid.map((row, i) => row[i])
  if (diagonal1.every(symbol => symbol === diagonal1[0])) {
    return {
      isWin: true,
      winningSymbols: diagonal1,
      winType: 'diagonal'
    }
  }
  
  const diagonal2 = grid.map((row, i) => row[size - 1 - i])
  if (diagonal2.every(symbol => symbol === diagonal2[0])) {
    return {
      isWin: true,
      winningSymbols: diagonal2,
      winType: 'diagonal'
    }
  }
  
  return {
    isWin: false,
    winningSymbols: [],
    winType: 'none'
  }
}

// Calculate expected value for RTP verification
export function calculateExpectedValue(config: ScratchConfig): number {
  const winProbability = getWinProbability(config.volatility)
  const multiplierRange = getMultiplierRange(config.volatility)
  const avgMultiplier = (multiplierRange.min + multiplierRange.max) / 2
  
  return (winProbability * avgMultiplier - (1 - winProbability)) * 100
}

// Validate scratch result
export function validateScratchResult(result: ScratchResult, config: ScratchConfig): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  // Check basic structure
  if (!result.id || !result.symbolGrid || !Array.isArray(result.symbolGrid)) {
    errors.push('Invalid result structure')
  }
  
  // Check grid size
  const expectedSize = Math.sqrt(config.gridSize)
  if (result.symbolGrid.length !== expectedSize) {
    errors.push('Invalid grid size')
  }
  
  for (const row of result.symbolGrid) {
    if (!Array.isArray(row) || row.length !== expectedSize) {
      errors.push('Invalid grid row')
      break
    }
  }
  
  // Check win condition consistency
  const { isWin } = checkWinCondition(result.symbolGrid)
  if (isWin !== result.isWin) {
    errors.push('Win condition mismatch')
  }
  
  // Check multiplier range
  const multiplierRange = getMultiplierRange(result.volatility)
  if (result.multiplier < multiplierRange.min || result.multiplier > multiplierRange.max) {
    errors.push('Multiplier out of range')
  }
  
  // Check payout calculation
  const expectedPayout = result.isWin ? result.multiplier : 0
  if (Math.abs(result.totalPayout - expectedPayout) > 0.01) {
    errors.push('Payout calculation error')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Generate mock history for testing
export function generateMockHistory(count: number = 20, config: ScratchConfig = DEFAULT_CONFIG): ScratchRound[] {
  const history: ScratchRound[] = []
  
  for (let i = 0; i < count; i++) {
    const betAmount = Math.floor(Math.random() * 500) + 10
    const volatility: Volatility = (['low', 'medium', 'high'] as Volatility[])[Math.floor(Math.random() * 3)]
    
    const result = generateScratchResult(betAmount, volatility, config)
    
    history.push({
      id: result.id,
      betAmount,
      result,
      timestamp: Date.now() - (i * 60000) // 1 minute apart
    })
  }
  
  return history
}

// Get game statistics
export function getGameStatistics(history: ScratchRound[]): {
  totalGames: number
  totalWins: number
  totalLosses: number
  winRate: number
  totalBet: number
  totalPayout: number
  totalProfit: number
  averageBet: number
  biggestWin: number
  biggestLoss: number
  volatilityBreakdown: Record<Volatility, number>
  cardTypeBreakdown: Record<CardType, number>
  averageMultiplier: number
} {
  if (history.length === 0) {
    return {
      totalGames: 0,
      totalWins: 0,
      totalLosses: 0,
      winRate: 0,
      totalBet: 0,
      totalPayout: 0,
      totalProfit: 0,
      averageBet: 0,
      biggestWin: 0,
      biggestLoss: 0,
      volatilityBreakdown: { low: 0, medium: 0, high: 0 },
      cardTypeBreakdown: { classic: 0, multiplier: 0, bonus: 0, jackpot: 0 },
      averageMultiplier: 0
    }
  }
  
  const wins = history.filter(round => round.result.isWin)
  const losses = history.filter(round => !round.result.isWin)
  
  const totalBet = history.reduce((sum, round) => sum + round.betAmount, 0)
  const totalPayout = history.reduce((sum, round) => sum + round.result.totalPayout, 0)
  const totalProfit = totalPayout - totalBet
  
  const volatilityBreakdown: Record<Volatility, number> = { low: 0, medium: 0, high: 0 }
  const cardTypeBreakdown: Record<CardType, number> = { classic: 0, multiplier: 0, bonus: 0, jackpot: 0 }
  
  history.forEach(round => {
    volatilityBreakdown[round.result.volatility]++
    cardTypeBreakdown[round.result.cardType]++
  })
  
  const averageMultiplier = wins.length > 0 
    ? wins.reduce((sum, round) => sum + round.result.multiplier, 0) / wins.length 
    : 0
  
  return {
    totalGames: history.length,
    totalWins: wins.length,
    totalLosses: losses.length,
    winRate: (wins.length / history.length) * 100,
    totalBet,
    totalPayout,
    totalProfit,
    averageBet: totalBet / history.length,
    biggestWin: Math.max(...history.map(round => round.result.totalPayout - round.betAmount)),
    biggestLoss: Math.min(...history.map(round => round.result.totalPayout - round.betAmount)),
    volatilityBreakdown,
    cardTypeBreakdown,
    averageMultiplier
  }
}

// Format game result for display
export function formatGameResult(result: ScratchResult): {
  status: string
  statusColor: string
  emoji: string
  description: string
} {
  if (result.isWin) {
    let emoji = 'ð'
    let status = 'WIN'
    let description = `Won ${result.multiplier}x`
    
    if (result.cardType === 'jackpot') {
      emoji = 'ð'
      status = 'JACKPOT!'
      description = `Massive ${result.multiplier}x win!`
    } else if (result.cardType === 'multiplier') {
      emoji = 'â'
      status = 'MULTIPLIER'
      description = `${result.multiplier}x multiplier`
    } else if (result.cardType === 'bonus') {
      emoji = 'â'
      status = 'BONUS'
      description = `Bonus ${result.multiplier}x`
    }
    
    return {
      status,
      statusColor: 'text-emerald-400',
      emoji,
      description
    }
  } else {
    return {
      status: 'LOSS',
      statusColor: 'text-red-400',
      emoji: 'â',
      description: 'No winning combination'
    }
  }
}

// Get card type configuration
export function getCardTypeConfig(cardType: CardType): {
  name: string
  color: string
  bgColor: string
  borderColor: string
  description: string
} {
  const configs = {
    classic: {
      name: 'Classic',
      color: 'text-blue-400',
      bgColor: 'bg-blue-600',
      borderColor: 'border-blue-400',
      description: 'Match 3 symbols to win'
    },
    multiplier: {
      name: 'Multiplier',
      color: 'text-purple-400',
      bgColor: 'bg-purple-600',
      borderColor: 'border-purple-400',
      description: 'Direct multiplier rewards'
    },
    bonus: {
      name: 'Bonus',
      color: 'text-orange-400',
      bgColor: 'bg-orange-600',
      borderColor: 'border-orange-400',
      description: 'Enhanced winning chances'
    },
    jackpot: {
      name: 'Jackpot',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-600',
      borderColor: 'border-yellow-400',
      description: 'Rare massive rewards'
    }
  }
  
  return configs[cardType]
}

// Get volatility configuration
export function getVolatilityConfig(volatility: Volatility): {
  name: string
  color: string
  bgColor: string
  borderColor: string
  description: string
  winRate: string
  multiplierRange: string
} {
  const configs = {
    low: {
      name: 'Low',
      color: 'text-green-400',
      bgColor: 'bg-green-600',
      borderColor: 'border-green-400',
      description: 'Frequent small wins',
      winRate: '45%',
      multiplierRange: '1.2x - 3x'
    },
    medium: {
      name: 'Medium',
      color: 'text-blue-400',
      bgColor: 'bg-blue-600',
      borderColor: 'border-blue-400',
      description: 'Balanced risk/reward',
      winRate: '35%',
      multiplierRange: '1.5x - 10x'
    },
    high: {
      name: 'High',
      color: 'text-red-400',
      bgColor: 'bg-red-600',
      borderColor: 'border-red-400',
      description: 'Rare big wins',
      winRate: '20%',
      multiplierRange: '2x - 100x'
    }
  }
  
  return configs[volatility]
}

// Calculate scratch percentage
export function calculateScratchPercentage(scratchedPixels: number, totalPixels: number): number {
  return (scratchedPixels / totalPixels) * 100
}

// Check if should auto-reveal
export function shouldAutoReveal(scratchPercentage: number, threshold: number): boolean {
  return scratchPercentage >= threshold
}

// Flatten grid for easier processing
export function flattenGrid(grid: string[][]): string[] {
  return grid.flat()
}

// Get symbol positions in grid
export function getSymbolPositions(grid: string[][], targetSymbol: string): { row: number; col: number }[] {
  const positions: { row: number; col: number }[] = []
  
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j] === targetSymbol) {
        positions.push({ row: i, col: j })
      }
    }
  }
  
  return positions
}

// Format timestamp for display
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  })
}

// Format date for display
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  })
}
