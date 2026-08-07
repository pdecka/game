export type PlinkoPath = number[] // 0 = left, 1 = right

export interface PlinkoResult {
  path: PlinkoPath
  finalSlot: number
  multiplier: number
  payout: number
}

export function generatePlinkoPath(rows: number): PlinkoPath {
  const path: PlinkoPath = []
  
  for (let i = 0; i < rows; i++) {
    // Each row has a 50% chance to go left or right
    path.push(Math.random() < 0.5 ? 0 : 1)
  }
  
  return path
}

export function calculateFinalSlot(path: PlinkoPath): number {
  // Count the number of right moves to determine final position
  return path.reduce((sum, direction) => sum + direction, 0)
}

export function calculatePayout(betAmount: number, multiplier: number): number {
  return Math.round((betAmount * multiplier) * 100) / 100
}

export function validatePlinkoConfig(rows: number, risk: string): boolean {
  const validRows = [8, 10, 12, 14, 16]
  const validRisks = ['low', 'medium', 'high']
  
  return validRows.includes(rows) && validRisks.includes(risk)
}

export function getSlotProbability(rows: number, slotIndex: number): number {
  // Calculate probability of landing in a specific slot using binomial distribution
  const totalPaths = Math.pow(2, rows)
  const combinations = binomialCoefficient(rows, slotIndex)
  return combinations / totalPaths
}

function binomialCoefficient(n: number, k: number): number {
  if (k < 0 || k > n) return 0
  if (k === 0 || k === n) return 1
  
  let result = 1
  for (let i = 0; i < k; i++) {
    result = result * (n - i) / (i + 1)
  }
  
  return Math.round(result)
}

export function getExpectedMultiplier(rows: number, risk: string, multipliers: number[]): number {
  let expectedValue = 0
  
  for (let slotIndex = 0; slotIndex < multipliers.length; slotIndex++) {
    const probability = getSlotProbability(rows, slotIndex)
    expectedValue += multipliers[slotIndex] * probability
  }
  
  return Math.round(expectedValue * 100) / 100
}
