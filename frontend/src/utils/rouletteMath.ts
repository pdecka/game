import {
  getNumbersForBetType,
  createRouletteResult,
  generateRouletteNumber,
  PAYOUT_RATIOS,
  generateMockHistory,
  type BetType,
  type Bet,
  type RouletteResult,
  type RouletteNumber,
  type RouletteRound
} from './rouletteConfig'

// Re-export types for convenience
export type { BetType, Bet, RouletteResult, RouletteNumber, RouletteRound }

export interface RouletteSpinResult {
  result: RouletteResult
  bets: Bet[]
  totalBetAmount: number
  totalPayout: number
  profit: number
  isWin: boolean
}

export function evaluateBet(bet: Bet, result: RouletteResult): Bet {
  const won = bet.numbers.includes(result.number)
  const winAmount = won ? bet.amount * PAYOUT_RATIOS[bet.type] : 0
  
  return {
    ...bet,
    won,
    winAmount
  }
}

export function evaluateAllBets(bets: Bet[], result: RouletteResult): Bet[] {
  return bets.map(bet => evaluateBet(bet, result))
}

export function calculateTotalPayout(bets: Bet[]): number {
  return bets.reduce((total, bet) => total + bet.winAmount, 0)
}

export function calculateTotalBetAmount(bets: Bet[]): number {
  return bets.reduce((total, bet) => total + bet.amount, 0)
}

export function calculateProfit(totalBetAmount: number, totalPayout: number): number {
  return totalPayout - totalBetAmount
}

export function generateRouletteResult(): RouletteResult {
  const number = generateRouletteNumber()
  return createRouletteResult(number)
}

export function spinRoulette(bets: Bet[]): RouletteSpinResult {
  // Generate result FIRST (deterministic)
  const result = generateRouletteResult()
  
  // Evaluate all bets
  const evaluatedBets = evaluateAllBets(bets, result)
  const totalBetAmount = calculateTotalBetAmount(bets)
  const totalPayout = calculateTotalPayout(evaluatedBets)
  const profit = calculateProfit(totalBetAmount, totalPayout)
  const isWin = totalPayout > 0
  
  return {
    result,
    bets: evaluatedBets,
    totalBetAmount,
    totalPayout,
    profit,
    isWin
  }
}

export function createBet(
  type: BetType,
  amount: number,
  numbers?: RouletteNumber[]
): Bet {
  const betNumbers = getNumbersForBetType(type, numbers)
  const payout = PAYOUT_RATIOS[type]
  
  return {
    id: `bet-${Date.now()}-${Math.random()}`,
    type,
    amount,
    numbers: betNumbers,
    payout,
    won: false,
    winAmount: 0
  }
}

export function validateBet(type: BetType, amount: number, numbers?: RouletteNumber[]): boolean {
  if (amount <= 0) return false
  
  switch (type) {
    case 'straight':
      return !!(numbers && numbers.length === 1)
    case 'split':
      return !!(numbers && numbers.length === 2)
    case 'street':
      return !!(numbers && numbers.length === 3)
    case 'corner':
      return !!(numbers && numbers.length === 4)
    case 'sixline':
      return !!(numbers && numbers.length === 6)
    default:
      return true // Outside bets don't need specific numbers
  }
}

export function getBetNumbers(type: BetType, selectedNumbers: RouletteNumber[]): RouletteNumber[] {
  switch (type) {
    case 'straight':
      return selectedNumbers.slice(0, 1)
    case 'split':
      return selectedNumbers.slice(0, 2)
    case 'street':
      return selectedNumbers.slice(0, 3)
    case 'corner':
      return selectedNumbers.slice(0, 4)
    case 'sixline':
      return selectedNumbers.slice(0, 6)
    default:
      return getNumbersForBetType(type)
  }
}

export function formatBetAmount(amount: number): string {
  return amount.toFixed(2)
}

export function formatPayout(amount: number): string {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`
  }
  return amount.toFixed(2)
}

export function getWinRate(history: RouletteRound[]): number {
  if (history.length === 0) return 0
  const wins = history.filter(round => round.isWin).length
  return (wins / history.length) * 100
}

export function getMostFrequentColor(history: RouletteRound[]): string {
  if (history.length === 0) return 'N/A'
  
  const colorCounts = history.reduce((counts, round) => {
    counts[round.result.color] = (counts[round.result.color] || 0) + 1
    return counts
  }, {} as Record<string, number>)
  
  const mostFrequent = Object.entries(colorCounts)
    .sort(([,a], [,b]) => b - a)[0]
  
  return mostFrequent ? mostFrequent[0] : 'N/A'
}

export function getHotNumbers(history: RouletteRound[], count: number = 5): RouletteNumber[] {
  if (history.length === 0) return []
  
  const numberCounts = history.reduce((counts, round) => {
    counts[round.result.number] = (counts[round.result.number] || 0) + 1
    return counts
  }, {} as Record<RouletteNumber, number>)
  
  return Object.entries(numberCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, count)
    .map(([number]) => number as RouletteNumber)
}

export function getColdNumbers(history: RouletteRound[], count: number = 5): RouletteNumber[] {
  if (history.length === 0) return []
  
  const allNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, '00'] as RouletteNumber[]
  
  const numberCounts = history.reduce((counts, round) => {
    counts[round.result.number] = (counts[round.result.number] || 0) + 1
    return counts
  }, {} as Record<RouletteNumber, number>)
  
  return allNumbers
    .sort((a, b) => (numberCounts[a] || 0) - (numberCounts[b] || 0))
    .slice(0, count)
}

export function createRouletteRound(
  bets: Bet[],
  result?: RouletteResult
): RouletteRound {
  const spinResult = result ? { result, bets, totalBetAmount: 0, totalPayout: 0, profit: 0, isWin: false } : spinRoulette(bets)
  
  return {
    id: `roulette-${Date.now()}`,
    timestamp: Date.now(),
    result: spinResult.result,
    bets: spinResult.bets,
    totalBetAmount: spinResult.totalBetAmount,
    totalPayout: spinResult.totalPayout,
    profit: spinResult.profit,
    isWin: spinResult.isWin
  }
}

export function getBetChipColor(amount: number): string {
  if (amount >= 1000) return 'bg-purple-600'
  if (amount >= 500) return 'bg-blue-600'
  if (amount >= 100) return 'bg-green-600'
  if (amount >= 50) return 'bg-yellow-600'
  if (amount >= 25) return 'bg-orange-600'
  if (amount >= 10) return 'bg-red-600'
  return 'bg-gray-600'
}

export function getBetChipTextColor(amount: number): string {
  return 'text-white'
}

export function isValidRouletteNumber(number: string | number): number is RouletteNumber {
  if (number === '00' || number === 0) return true
  const num = typeof number === 'number' ? number : parseInt(number)
  return !isNaN(num) && num >= 0 && num <= 36
}

export function parseRouletteNumber(number: string): RouletteNumber {
  if (number === '00') return '00'
  const num = parseInt(number)
  if (isNaN(num) || num < 0 || num > 36) throw new Error('Invalid roulette number')
  return num as RouletteNumber
}
