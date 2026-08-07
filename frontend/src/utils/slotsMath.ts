import { 
  PAYLINES, 
  SYMBOL_MULTIPLIERS, 
  CLUSTER_MULTIPLIERS, 
  JACKPOT_CONFIG,
  type SymbolType,
  type WinLine,
  type ClusterWin,
  type SlotsRound
} from './slotsConfig'

export interface SlotsResult {
  grid: SymbolType[][]
  winLines: WinLine[]
  clusterWins: ClusterWin[]
  totalMultiplier: number
  payout: number
  isBigWin: boolean
  isJackpot: boolean
}

export function checkPaylines(grid: SymbolType[][]): WinLine[] {
  const winLines: WinLine[] = []
  
  for (const payline of PAYLINES) {
    const symbols: SymbolType[] = []
    const positions: [number, number][] = []
    
    // Get symbols from payline positions
    for (const [row, col] of payline.positions) {
      if (row < grid.length && col < grid[row].length) {
        symbols.push(grid[row][col])
        positions.push([row, col])
      }
    }
    
    // Check for winning combinations (minimum 3 matching symbols)
    if (symbols.length >= 3) {
      const firstSymbol = symbols[0]
      let count = 1
      
      // Count consecutive matching symbols (allow wild as substitute)
      for (let i = 1; i < symbols.length; i++) {
        if (symbols[i] === firstSymbol || symbols[i] === 'wild') {
          count++
        } else {
          break
        }
      }
      
      // Check if we have a winning combination
      if (count >= 3) {
        const multiplier = SYMBOL_MULTIPLIERS[firstSymbol]?.[count] || 0
        
        if (multiplier > 0) {
          winLines.push({
            lineId: payline.id,
            symbol: firstSymbol,
            count,
            multiplier,
            positions: positions.slice(0, count)
          })
        }
      }
    }
  }
  
  return winLines
}

export function findClusters(grid: SymbolType[][]): ClusterWin[] {
  const clusterWins: ClusterWin[] = []
  const visited = new Set<string>()
  
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const key = `${row}-${col}`
      
      if (!visited.has(key)) {
        const symbol = grid[row][col]
        if (symbol !== 'wild') { // Wild doesn't form clusters
          const cluster = exploreCluster(grid, row, col, symbol, visited)
          
          if (cluster.length >= 4) { // Minimum cluster size
            const multiplier = CLUSTER_MULTIPLIERS[cluster.length] || 0
            
            if (multiplier > 0) {
              clusterWins.push({
                symbol,
                count: cluster.length,
                multiplier,
                positions: cluster
              })
            }
          }
        }
      }
    }
  }
  
  return clusterWins
}

function exploreCluster(
  grid: SymbolType[][], 
  startRow: number, 
  startCol: number, 
  targetSymbol: SymbolType, 
  visited: Set<string>
): [number, number][] {
  const cluster: [number, number][] = []
  const stack: [number, number][] = [[startRow, startCol]]
  const rows = grid.length
  const cols = grid[0].length
  
  while (stack.length > 0) {
    const [row, col] = stack.pop()!
    const key = `${row}-${col}`
    
    if (visited.has(key) || row < 0 || row >= rows || col < 0 || col >= cols) {
      continue
    }
    
    if (grid[row][col] === targetSymbol || grid[row][col] === 'wild') {
      visited.add(key)
      cluster.push([row, col])
      
      // Add adjacent cells (8-directional)
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue
          stack.push([row + dr, col + dc])
        }
      }
    }
  }
  
  return cluster
}

export function checkJackpot(grid: SymbolType[][]): boolean {
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

export function calculatePayout(betAmount: number, multiplier: number): number {
  return Math.round((betAmount * multiplier) * 100) / 100
}

export function evaluateGrid(grid: SymbolType[][], betAmount: number): SlotsResult {
  const isJackpotWin = checkJackpot(grid)
  
  if (isJackpotWin) {
    return {
      grid,
      winLines: [],
      clusterWins: [],
      totalMultiplier: JACKPOT_CONFIG.multiplier,
      payout: calculatePayout(betAmount, JACKPOT_CONFIG.multiplier),
      isBigWin: true,
      isJackpot: true
    }
  }
  
  const winLines = checkPaylines(grid)
  const clusterWins = findClusters(grid)
  
  // Calculate total multiplier from all wins
  const lineMultiplier = winLines.reduce((sum, line) => sum + line.multiplier, 0)
  const clusterMultiplier = clusterWins.reduce((sum, cluster) => sum + cluster.multiplier, 0)
  const totalMultiplier = lineMultiplier + clusterMultiplier
  
  const payout = calculatePayout(betAmount, totalMultiplier)
  const isBigWin = totalMultiplier >= JACKPOT_CONFIG.bigWinThreshold
  
  return {
    grid,
    winLines,
    clusterWins,
    totalMultiplier,
    payout,
    isBigWin,
    isJackpot: false
  }
}

export function generateSlotsResult(betAmount: number): SlotsResult {
  // Generate grid first (deterministic)
  const grid = Array.from({ length: 5 }, () => 
    Array.from({ length: 5 }, () => {
      const symbols: SymbolType[] = ['1', '2', '3', '4', '5', '6', '7', 'bonus', 'wild']
      const weights = [25, 20, 15, 12, 10, 8, 1, 2, 7]
      
      const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
      let random = Math.random() * totalWeight
      
      for (let i = 0; i < symbols.length; i++) {
        random -= weights[i]
        if (random <= 0) {
          return symbols[i]
        }
      }
      
      return '1' // Fallback
    })
  )
  
  // Evaluate the grid
  return evaluateGrid(grid, betAmount)
}

export function getWinType(multiplier: number): 'normal' | 'big' | 'mega' | 'jackpot' {
  if (multiplier >= JACKPOT_CONFIG.multiplier) return 'jackpot'
  if (multiplier >= JACKPOT_CONFIG.megaWinThreshold) return 'mega'
  if (multiplier >= JACKPOT_CONFIG.bigWinThreshold) return 'big'
  return 'normal'
}

export function formatWinAmount(amount: number): string {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`
  }
  return amount.toFixed(2)
}

export function getWinAnimationType(result: SlotsResult): 'none' | 'normal' | 'big' | 'mega' | 'jackpot' {
  if (result.isJackpot) return 'jackpot'
  if (result.totalMultiplier >= JACKPOT_CONFIG.megaWinThreshold) return 'mega'
  if (result.isBigWin) return 'big'
  if (result.totalMultiplier > 0) return 'normal'
  return 'none'
}
