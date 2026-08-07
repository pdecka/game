/**
 * Shuffle utilities for Keno game
 * Implements Fisher-Yates algorithm for secure random shuffling
 */

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  
  // Fisher-Yates shuffle algorithm
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  return shuffled
}

export function shuffleNumbers(min: number, max: number): number[] {
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i)
  return shuffleArray(numbers)
}

export function drawRandomNumbers(count: number, min: number, max: number): number[] {
  const shuffled = shuffleNumbers(min, max)
  return shuffled.slice(0, count)
}

export function createSecureShuffle<T>(array: T[], seed?: number): T[] {
  // If seed is provided, use seeded random for reproducible shuffling
  // This is useful for testing and provably fair systems
  let random = seed ? seededRandom(seed) : Math.random
  
  const shuffled = [...array]
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  return shuffled
}

// Seeded random number generator for testing and provably fair
function seededRandom(seed: number): () => number {
  let m = 0x80000000 // 2**31
  let a = 1103515245
  let c = 12345
  let state = seed ? seed : Math.floor(Math.random() * (m - 1))
  
  return function() {
    state = (a * state + c) % m
    return state / (m - 1)
  }
}

export function generateKenoDraw(count: number = 10, min: number = 1, max: number = 40): number[] {
  return drawRandomNumbers(count, min, max)
}

export function validateDraw(draw: number[], min: number = 1, max: number = 40): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  // Check for duplicates
  const uniqueDraw = [...new Set(draw)]
  if (uniqueDraw.length !== draw.length) {
    errors.push('Draw contains duplicate numbers')
  }
  
  // Check range
  const outOfRange = draw.filter(num => num < min || num > max)
  if (outOfRange.length > 0) {
    errors.push(`Numbers out of range (${min}-${max}): ${outOfRange.join(', ')}`)
  }
  
  // Check count
  if (draw.length !== 10) {
    errors.push(`Expected 10 numbers, got ${draw.length}`)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function calculateIntersection<T>(array1: T[], array2: T[]): T[] {
  return array1.filter(item => array2.includes(item))
}

export function calculateMatches(selected: number[], drawn: number[]): number {
  return calculateIntersection(selected, drawn).length
}

export function getDrawStatistics(draws: number[][]): {
  frequency: Record<number, number>
  mostDrawn: number[]
  leastDrawn: number[]
  averageFrequency: number
} {
  const frequency: Record<number, number> = {}
  
  // Initialize all numbers with 0
  for (let i = 1; i <= 40; i++) {
    frequency[i] = 0
  }
  
  // Count frequency
  draws.forEach(draw => {
    draw.forEach(num => {
      if (num >= 1 && num <= 40) {
        frequency[num]++
      }
    })
  })
  
  const frequencies = Object.entries(frequency).map(([num, count]) => ({
    number: parseInt(num),
    count
  }))
  
  const maxCount = Math.max(...frequencies.map(f => f.count))
  const minCount = Math.min(...frequencies.map(f => f.count))
  const averageFrequency = frequencies.reduce((sum, f) => sum + f.count, 0) / 40
  
  const mostDrawn = frequencies.filter(f => f.count === maxCount).map(f => f.number)
  const leastDrawn = frequencies.filter(f => f.count === minCount).map(f => f.number)
  
  return {
    frequency,
    mostDrawn,
    leastDrawn,
    averageFrequency
  }
}

export function formatDraw(draw: number[]): string {
  return draw
    .sort((a, b) => a - b)
    .map(num => num.toString().padStart(2, '0'))
    .join(', ')
}

export function parseDrawString(drawString: string): number[] {
  return drawString
    .split(',')
    .map(num => parseInt(num.trim()))
    .filter(num => !isNaN(num) && num >= 1 && num <= 40)
}

export function generateMockDraws(count: number = 100): number[][] {
  const draws: number[][] = []
  
  for (let i = 0; i < count; i++) {
    draws.push(generateKenoDraw())
  }
  
  return draws
}

export function getDrawProbability(matches: number, selected: number = 10, drawn: number = 10, total: number = 40): number {
  // Calculate probability of getting exactly 'matches' hits
  // Using hypergeometric distribution
  
  if (matches > selected || matches > drawn || matches > total) {
    return 0
  }
  
  // Hypergeometric probability formula
  const combinations = (n: number, k: number): number => {
    if (k > n || k < 0) return 0
    if (k === 0 || k === n) return 1
    
    let result = 1
    for (let i = 0; i < k; i++) {
      result = result * (n - i) / (k - i)
    }
    
    return result
  }
  
  const waysToChooseHits = combinations(selected, matches)
  const waysToChooseMisses = combinations(total - selected, drawn - matches)
  const totalWays = combinations(total, drawn)
  
  return (waysToChooseHits * waysToChooseMisses) / totalWays
}

export function getExpectedHits(selected: number = 10, drawn: number = 10, total: number = 40): number {
  // Expected value of hits in hypergeometric distribution
  return (selected * drawn) / total
}

export function getDrawOdds(selected: number = 10, drawn: number = 10, total: number = 40): Record<number, number> {
  const odds: Record<number, number> = {}
  
  for (let matches = 0; matches <= Math.min(selected, drawn); matches++) {
    odds[matches] = getDrawProbability(matches, selected, drawn, total)
  }
  
  return odds
}
