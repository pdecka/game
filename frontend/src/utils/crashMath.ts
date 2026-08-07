export interface CrashPoint {
  time: number
  multiplier: number
}

export interface CrashRound {
  id: string
  crashPoint: number
  timestamp: number
  hash?: string
}

export interface CrashBet {
  id: string
  amount: number
  autoCashout?: number
  cashedOutAt?: number
  timestamp: number
  userId?: string
}

export interface CrashUser {
  id: string
  username: string
  bet: CrashBet
  profit: number
  status: 'waiting' | 'playing' | 'cashed_out' | 'lost'
}

// Crash point calculation (provably fair structure ready)
export function generateCrashPoint(seed?: number): number {
  // Simple mock implementation - in production, use provably fair algorithm
  const minCrash = 1.01
  const maxCrash = 100.00
  
  // Exponential distribution favoring lower multipliers
  const random = Math.random()
  const crashPoint = minCrash + (maxCrash - minCrash) * Math.pow(random, 2)
  
  return Math.round(crashPoint * 100) / 100
}

// Multiplier calculation over time
export function calculateMultiplier(
  startTime: number,
  currentTime: number,
  growthFactor: number = 0.08
): number {
  const elapsedTime = (currentTime - startTime) / 1000 // Convert to seconds
  const multiplier = 1 + (elapsedTime * growthFactor)
  return Math.round(multiplier * 100) / 100
}

// Generate crash curve points for graph
export function generateCrashCurve(
  startTime: number,
  endTime: number,
  crashPoint: number,
  growthFactor: number = 0.08
): CrashPoint[] {
  const points: CrashPoint[] = []
  const duration = endTime - startTime
  
  for (let time = 0; time <= duration; time += 100) {
    const currentMultiplier = calculateMultiplier(startTime, startTime + time, growthFactor)
    const finalMultiplier = Math.min(currentMultiplier, crashPoint)
    
    points.push({
      time,
      multiplier: finalMultiplier
    })
    
    if (currentMultiplier >= crashPoint) break
  }
  
  return points
}

// Calculate profit
export function calculateProfit(betAmount: number, cashoutMultiplier: number): number {
  return Math.round((betAmount * cashoutMultiplier - betAmount) * 100) / 100
}

// Calculate house edge
export function calculateHouseEdge(crashPoint: number): number {
  if (crashPoint <= 1) return 100
  return Math.round((1 - (1 / crashPoint)) * 10000) / 100
}

// Format multiplier display
export function formatMultiplier(multiplier: number): string {
  return multiplier.toFixed(2) + 'x'
}

// Generate mock previous rounds
export function generateMockHistory(count: number = 20): CrashRound[] {
  const history: CrashRound[] = []
  const now = Date.now()
  
  for (let i = 0; i < count; i++) {
    history.push({
      id: `round-${i}`,
      crashPoint: generateCrashPoint(),
      timestamp: now - (i * 30000), // 30 seconds apart
    })
  }
  
  return history.sort((a, b) => b.timestamp - a.timestamp)
}

// Generate mock active players
export function generateMockPlayers(count: number = 50): CrashUser[] {
  const players: CrashUser[] = []
  const statuses: CrashUser['status'][] = ['waiting', 'playing', 'cashed_out', 'lost']
  
  for (let i = 0; i < count; i++) {
    const betAmount = Math.floor(Math.random() * 1000) + 10
    const crashPoint = generateCrashPoint()
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    
    players.push({
      id: `user-${i}`,
      username: `Player${i + 1}`,
      bet: {
        id: `bet-${i}`,
        amount: betAmount,
        timestamp: Date.now()
      },
      profit: status === 'cashed_out' ? calculateProfit(betAmount, Math.random() * crashPoint) : 0,
      status
    })
  }
  
  return players
}
