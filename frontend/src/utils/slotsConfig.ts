export type SymbolType = '1' | '2' | '3' | '4' | '5' | '6' | '7' | 'bonus' | 'wild' | 'A' | 'K' | 'Q' | 'J' | '10' | '9' | '★'

export interface Symbol {
  id: SymbolType
  display: string
  value: number
  weight: number
  color: string
  bgColor: string
}

export interface Payline {
  id: number
  name: string
  positions: [number, number][] // [row, col] positions
}

export interface WinLine {
  lineId: number
  symbol: SymbolType
  count: number
  multiplier: number
  positions: [number, number][]
}

export interface ClusterWin {
  symbol: SymbolType
  count: number
  multiplier: number
  positions: [number, number][]
}

export interface SlotsRound {
  id: string
  timestamp: number
  betAmount: number
  grid: SymbolType[][]
  winLines: WinLine[]
  clusterWins: ClusterWin[]
  totalMultiplier: number
  payout: number
  isBigWin: boolean
  isJackpot: boolean
}

// Symbol definitions with weighted probabilities
export const SYMBOLS: Record<SymbolType, Symbol> = {
  '1': { id: '1', display: '1', value: 1, weight: 25, color: 'text-slate-400', bgColor: 'bg-slate-600' },
  '2': { id: '2', display: '2', value: 2, weight: 20, color: 'text-slate-300', bgColor: 'bg-slate-500' },
  '3': { id: '3', display: '3', value: 3, weight: 15, color: 'text-blue-400', bgColor: 'bg-blue-600' },
  '4': { id: '4', display: '4', value: 4, weight: 12, color: 'text-green-400', bgColor: 'bg-green-600' },
  '5': { id: '5', display: '5', value: 5, weight: 10, color: 'text-yellow-400', bgColor: 'bg-yellow-600' },
  '6': { id: '6', display: '6', value: 6, weight: 8, color: 'text-orange-400', bgColor: 'bg-orange-600' },
  '7': { id: '7', display: '7', value: 7, weight: 1, color: 'text-red-500', bgColor: 'bg-red-600' },
  'bonus': { id: 'bonus', display: 'B', value: 10, weight: 2, color: 'text-purple-400', bgColor: 'bg-purple-600' },
  'wild': { id: 'wild', display: 'W', value: 0, weight: 7, color: 'text-pink-400', bgColor: 'bg-pink-600' },
  '9': { id: '9', display: '9', value: 1, weight: 0, color: 'text-slate-300', bgColor: 'bg-slate-600' },
  '10': { id: '10', display: '10', value: 2, weight: 0, color: 'text-blue-400', bgColor: 'bg-blue-600' },
  'J': { id: 'J', display: 'J', value: 3, weight: 0, color: 'text-green-400', bgColor: 'bg-green-600' },
  'Q': { id: 'Q', display: 'Q', value: 4, weight: 0, color: 'text-yellow-400', bgColor: 'bg-yellow-600' },
  'K': { id: 'K', display: 'K', value: 5, weight: 0, color: 'text-orange-400', bgColor: 'bg-orange-600' },
  'A': { id: 'A', display: 'A', value: 6, weight: 0, color: 'text-red-400', bgColor: 'bg-red-600' },
  '★': { id: '★', display: '★', value: 10, weight: 0, color: 'text-pink-400', bgColor: 'bg-pink-600' }
}

// Payline definitions (5x5 grid)
export const PAYLINES: Payline[] = [
  // Horizontal lines
  { id: 1, name: 'Top Row', positions: [[0,0], [0,1], [0,2], [0,3], [0,4]] },
  { id: 2, name: 'Second Row', positions: [[1,0], [1,1], [1,2], [1,3], [1,4]] },
  { id: 3, name: 'Middle Row', positions: [[2,0], [2,1], [2,2], [2,3], [2,4]] },
  { id: 4, name: 'Fourth Row', positions: [[3,0], [3,1], [3,2], [3,3], [3,4]] },
  { id: 5, name: 'Bottom Row', positions: [[4,0], [4,1], [4,2], [4,3], [4,4]] },
  
  // Vertical lines
  { id: 6, name: 'First Column', positions: [[0,0], [1,0], [2,0], [3,0], [4,0]] },
  { id: 7, name: 'Second Column', positions: [[0,1], [1,1], [2,1], [3,1], [4,1]] },
  { id: 8, name: 'Middle Column', positions: [[0,2], [1,2], [2,2], [3,2], [4,2]] },
  { id: 9, name: 'Fourth Column', positions: [[0,3], [1,3], [2,3], [3,3], [4,3]] },
  { id: 10, name: 'Fifth Column', positions: [[0,4], [1,4], [2,4], [3,4], [4,4]] },
  
  // Diagonal lines
  { id: 11, name: 'Diagonal TL-BR', positions: [[0,0], [1,1], [2,2], [3,3], [4,4]] },
  { id: 12, name: 'Diagonal TR-BL', positions: [[0,4], [1,3], [2,2], [3,1], [4,0]] },
  { id: 13, name: 'V-Shape', positions: [[0,0], [1,1], [2,2], [1,3], [0,4]] },
  { id: 14, name: 'Inverted V', positions: [[4,0], [3,1], [2,2], [3,3], [4,4]] },
  { id: 15, name: 'Z-Shape', positions: [[0,0], [0,1], [0,2], [1,2], [2,2]] },
  { id: 16, name: 'S-Shape', positions: [[2,0], [3,0], [4,0], [4,1], [4,2]] },
  { id: 17, name: 'Cross', positions: [[0,2], [1,2], [2,2], [3,2], [4,2]] },
  { id: 18, name: 'Diamond', positions: [[0,2], [1,1], [2,2], [3,3], [4,2]] },
  { id: 19, name: 'Hourglass', positions: [[0,0], [1,1], [2,2], [3,3], [4,4]] },
  { id: 20, name: 'Pyramid', positions: [[4,2], [3,1], [2,0], [3,3], [4,4]] }
]

// Multiplier tables based on symbol count
export const SYMBOL_MULTIPLIERS: Record<SymbolType, Record<number, number>> = {
  '1': { 3: 0.5, 4: 1.0, 5: 2.0 },
  '2': { 3: 0.8, 4: 1.5, 5: 3.0 },
  '3': { 3: 1.0, 4: 2.0, 5: 4.0 },
  '4': { 3: 1.5, 4: 3.0, 5: 6.0 },
  '5': { 3: 2.0, 4: 4.0, 5: 8.0 },
  '6': { 3: 3.0, 4: 6.0, 5: 12.0 },
  '7': { 3: 5.0, 4: 10.0, 5: 25.0 },
  'bonus': { 3: 8.0, 4: 15.0, 5: 50.0 },
  'wild': { 3: 1.0, 4: 2.0, 5: 5.0 }, // Wild substitutes
  '9': {},
  '10': {},
  'J': {},
  'Q': {},
  'K': {},
  'A': {},
  '★': {}
}

// Cluster win multipliers
export const CLUSTER_MULTIPLIERS: Record<number, number> = {
  4: 1.0,
  5: 2.0,
  6: 3.0,
  7: 5.0,
  8: 8.0,
  9: 12.0,
  10: 20.0,
  11: 30.0,
  12: 50.0,
  13: 75.0,
  14: 100.0,
  15: 150.0,
  16: 200.0,
  17: 300.0,
  18: 500.0,
  19: 750.0,
  20: 1000.0,
  21: 1500.0,
  22: 2000.0,
  23: 3000.0,
  24: 5000.0,
  25: 10000.0 // Full board jackpot
}

// Jackpot configuration
export const JACKPOT_CONFIG = {
  symbol: '7' as SymbolType,
  requiredCount: 25,
  multiplier: 1000.0,
  bigWinThreshold: 50.0,
  megaWinThreshold: 100.0
}

export function getRandomSymbol(): SymbolType {
  const totalWeight = Object.values(SYMBOLS).reduce((sum, symbol) => sum + symbol.weight, 0)
  let random = Math.random() * totalWeight
  
  for (const [symbolType, symbol] of Object.entries(SYMBOLS)) {
    random -= symbol.weight
    if (random <= 0) {
      return symbolType as SymbolType
    }
  }
  
  return '1' // Fallback
}

export function generateGrid(rows: number = 5, cols: number = 5): SymbolType[][] {
  const grid: SymbolType[][] = []
  
  for (let row = 0; row < rows; row++) {
    const gridRow: SymbolType[] = []
    for (let col = 0; col < cols; col++) {
      gridRow.push(getRandomSymbol())
    }
    grid.push(gridRow)
  }
  
  return grid
}

export function getSymbol(symbolType: SymbolType): Symbol {
  return SYMBOLS[symbolType]
}

export function isJackpot(grid: SymbolType[][]): boolean {
  const requiredSymbol = JACKPOT_CONFIG.symbol
  
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col] !== requiredSymbol) {
        return false
      }
    }
  }
  
  return true
}

export function generateMockHistory(count: number = 20): SlotsRound[] {
  const history: SlotsRound[] = []
  const now = Date.now()
  
  for (let i = 0; i < count; i++) {
    const grid = generateGrid()
    const betAmount = Math.floor(Math.random() * 500) + 10
    const isJackpotWin = isJackpot(grid)
    
    history.push({
      id: `slots-${i}`,
      timestamp: now - (i * 90000), // 1.5 minutes apart
      betAmount,
      grid,
      winLines: [], // Would be calculated in actual game
      clusterWins: [], // Would be calculated in actual game
      totalMultiplier: isJackpotWin ? JACKPOT_CONFIG.multiplier : Math.random() * 5,
      payout: betAmount * (isJackpotWin ? JACKPOT_CONFIG.multiplier : Math.random() * 5),
      isBigWin: isJackpotWin || Math.random() > 0.9,
      isJackpot: isJackpotWin
    })
  }
  
  return history.sort((a, b) => b.timestamp - a.timestamp)
}
