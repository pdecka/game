export type RiskLevel = 'low' | 'medium' | 'high'

export interface PlinkoConfig {
  rows: number
  risk: RiskLevel
  multipliers: number[]
}

export interface PlinkoRound {
  id: string
  timestamp: number
  betAmount: number
  rows: number
  risk: RiskLevel
  multiplier: number
  payout: number
  path: number[]
  finalSlot: number
}

// Multiplier configurations based on risk level and rows
export const PLINKO_MULTIPLIERS: Record<RiskLevel, Record<number, number[]>> = {
  low: {
    8: [0.5, 0.7, 0.9, 1.1, 1.1, 0.9, 0.7, 0.5, 0.5],
    10: [0.5, 0.6, 0.8, 1.0, 1.2, 1.2, 1.0, 0.8, 0.6, 0.5, 0.5],
    12: [0.5, 0.6, 0.7, 0.9, 1.1, 1.3, 1.3, 1.1, 0.9, 0.7, 0.6, 0.5, 0.5],
    14: [0.5, 0.5, 0.6, 0.8, 1.0, 1.2, 1.4, 1.4, 1.2, 1.0, 0.8, 0.6, 0.5, 0.5, 0.5],
    16: [0.5, 0.5, 0.5, 0.7, 0.9, 1.1, 1.3, 1.5, 1.5, 1.3, 1.1, 0.9, 0.7, 0.5, 0.5, 0.5, 0.5]
  },
  medium: {
    8: [0.3, 0.5, 0.8, 1.3, 1.3, 0.8, 0.5, 0.3, 0.3],
    10: [0.3, 0.4, 0.7, 1.2, 1.8, 1.8, 1.2, 0.7, 0.4, 0.3, 0.3],
    12: [0.3, 0.3, 0.5, 0.9, 1.5, 2.2, 2.2, 1.5, 0.9, 0.5, 0.3, 0.3, 0.3],
    14: [0.2, 0.3, 0.4, 0.8, 1.4, 2.0, 2.8, 2.8, 2.0, 1.4, 0.8, 0.4, 0.3, 0.2, 0.2],
    16: [0.2, 0.2, 0.3, 0.5, 1.0, 1.6, 2.5, 3.4, 3.4, 2.5, 1.6, 1.0, 0.5, 0.3, 0.2, 0.2, 0.2]
  },
  high: {
    8: [0.2, 0.3, 0.6, 1.8, 1.8, 0.6, 0.3, 0.2, 0.2],
    10: [0.2, 0.2, 0.4, 1.2, 3.0, 3.0, 1.2, 0.4, 0.2, 0.2, 0.2],
    12: [0.1, 0.2, 0.3, 0.8, 2.0, 5.0, 5.0, 2.0, 0.8, 0.3, 0.2, 0.1, 0.1],
    14: [0.1, 0.1, 0.2, 0.5, 1.2, 3.0, 7.5, 7.5, 3.0, 1.2, 0.5, 0.2, 0.1, 0.1, 0.1],
    16: [0.1, 0.1, 0.1, 0.3, 0.8, 2.0, 5.0, 10.0, 10.0, 5.0, 2.0, 0.8, 0.3, 0.1, 0.1, 0.1, 0.1]
  }
}

// Available row options
export const ROW_OPTIONS = [8, 10, 12, 14, 16]

// Risk level colors for slots
export const SLOT_COLORS = {
  low: {
    high: 'bg-emerald-500',
    medium: 'bg-emerald-400',
    low: 'bg-emerald-300'
  },
  medium: {
    high: 'bg-yellow-500',
    medium: 'bg-yellow-400',
    low: 'bg-yellow-300'
  },
  high: {
    high: 'bg-red-500',
    medium: 'bg-red-400',
    low: 'bg-red-300'
  }
}

export function getMultiplierForSlot(rows: number, risk: RiskLevel, slotIndex: number): number {
  const multipliers = PLINKO_MULTIPLIERS[risk][rows]
  if (!multipliers || slotIndex < 0 || slotIndex >= multipliers.length) {
    return 0
  }
  return multipliers[slotIndex]
}

export function getSlotColorClass(risk: RiskLevel, multiplier: number, maxMultiplier: number): string {
  const ratio = multiplier / maxMultiplier
  
  if (ratio >= 0.7) {
    return SLOT_COLORS[risk].high
  } else if (ratio >= 0.4) {
    return SLOT_COLORS[risk].medium
  } else {
    return SLOT_COLORS[risk].low
  }
}

export function getMaxMultiplier(rows: number, risk: RiskLevel): number {
  const multipliers = PLINKO_MULTIPLIERS[risk][rows]
  return Math.max(...multipliers)
}

export function generateMockHistory(count: number = 20): PlinkoRound[] {
  const history: PlinkoRound[] = []
  const now = Date.now()
  const risks: RiskLevel[] = ['low', 'medium', 'high']
  
  for (let i = 0; i < count; i++) {
    const rows = ROW_OPTIONS[Math.floor(Math.random() * ROW_OPTIONS.length)]
    const risk = risks[Math.floor(Math.random() * risks.length)]
    const path = Array.from({ length: rows }, () => Math.random() < 0.5 ? 0 : 1)
    const finalSlot = path.reduce((sum: number, direction: number) => sum + direction, 0)
    const multiplier = getMultiplierForSlot(rows, risk, finalSlot)
    const betAmount = Math.floor(Math.random() * 500) + 10
    
    history.push({
      id: `plinko-${i}`,
      timestamp: now - (i * 60000), // 1 minute apart
      betAmount,
      rows,
      risk,
      multiplier,
      payout: betAmount * multiplier,
      path,
      finalSlot
    })
  }
  
  return history.sort((a, b) => b.timestamp - a.timestamp)
}
