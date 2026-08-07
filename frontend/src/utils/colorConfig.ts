export type Number = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export type Color = 'red' | 'green' | 'purple'

export type BetType = 'color' | 'number'

export interface ColorBet {
  id: string
  type: BetType
  value: Color | Number
  amount: number
  payout: number
  won: boolean
  winAmount: number
}

export interface RoundResult {
  gameId: string
  number: Number
  color: Color
  timestamp: number
}

export interface ColorRound {
  id: string
  gameId: string
  timestamp: number
  result: RoundResult
  bets: ColorBet[]
  totalBetAmount: number
  totalPayout: number
  profit: number
  isWin: boolean
}

// Number to color mapping
export const NUMBER_COLOR_MAPPING: Record<Number, Color> = {
  0: 'purple',
  1: 'green',
  2: 'red',
  3: 'green',
  4: 'red',
  5: 'purple',
  6: 'red',
  7: 'green',
  8: 'red',
  9: 'green'
}

// Color to numbers mapping
export const COLOR_NUMBERS_MAPPING: Record<Color, Number[]> = {
  red: [2, 4, 6, 8],
  green: [1, 3, 7, 9],
  purple: [0, 5]
}

// Payout multipliers
export const PAYOUT_MULTIPLIERS = {
  color: 2, // Red/Green
  number: 9, // Exact number
  special: 5 // 0 or 5 (purple numbers)
}

// Color display configuration
export const COLOR_CONFIG: Record<Color, {
  name: string
  emoji: string
  bgClass: string
  hoverClass: string
  borderClass: string
  textClass: string
}> = {
  red: {
    name: 'Red',
    emoji: 'ð',
    bgClass: 'bg-red-500',
    hoverClass: 'hover:bg-red-600',
    borderClass: 'border-red-600',
    textClass: 'text-red-400'
  },
  green: {
    name: 'Green',
    emoji: 'ð',
    bgClass: 'bg-green-500',
    hoverClass: 'hover:bg-green-600',
    borderClass: 'border-green-600',
    textClass: 'text-green-400'
  },
  purple: {
    name: 'Purple',
    emoji: 'ð',
    bgClass: 'bg-purple-500',
    hoverClass: 'hover:bg-purple-600',
    borderClass: 'border-purple-600',
    textClass: 'text-purple-400'
  }
}

// Grid layout (5x2)
export const GRID_LAYOUT: Number[][] = [
  [0, 1, 2, 3, 4], // First row
  [5, 6, 7, 8, 9]  // Second row
]

export function getNumberColor(number: Number): Color {
  return NUMBER_COLOR_MAPPING[number]
}

export function getNumbersForColor(color: Color): Number[] {
  return COLOR_NUMBERS_MAPPING[color]
}

export function isSpecialNumber(number: Number): boolean {
  return number === 0 || number === 5
}

export function getPayoutForBet(type: BetType, value: Color | Number): number {
  if (type === 'color') {
    return PAYOUT_MULTIPLIERS.color
  } else if (type === 'number') {
    if (isSpecialNumber(value as Number)) {
      return PAYOUT_MULTIPLIERS.special
    }
    return PAYOUT_MULTIPLIERS.number
  }
  return 1
}

export function generateGameId(): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000)
  return `CP-${timestamp}-${random}`
}

export function generateRoundId(): string {
  return `round-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function generateRandomNumber(): Number {
  return Math.floor(Math.random() * 10) as Number
}

export function createRoundResult(number: Number): RoundResult {
  return {
    gameId: generateGameId(),
    number,
    color: getNumberColor(number),
    timestamp: Date.now()
  }
}

export function createColorBet(
  type: BetType,
  value: Color | Number,
  amount: number
): ColorBet {
  const payout = getPayoutForBet(type, value)
  
  return {
    id: `bet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    value,
    amount,
    payout,
    won: false,
    winAmount: 0
  }
}

export function evaluateColorBet(bet: ColorBet, result: RoundResult): ColorBet {
  let won = false
  
  if (bet.type === 'color') {
    won = result.color === bet.value
  } else if (bet.type === 'number') {
    won = result.number === bet.value
  }
  
  const winAmount = won ? bet.amount * bet.payout : 0
  
  return {
    ...bet,
    won,
    winAmount
  }
}

export function generateMockHistory(count: number = 20): ColorRound[] {
  const history: ColorRound[] = []
  const now = Date.now()
  
  for (let i = 0; i < count; i++) {
    const number = generateRandomNumber()
    const result = createRoundResult(number)
    const betAmount = Math.floor(Math.random() * 500) + 10
    
    // Generate some random bets for this round
    const bets: ColorBet[] = []
    const numBets = Math.floor(Math.random() * 3) + 1
    
    for (let j = 0; j < numBets; j++) {
      const betType = Math.random() > 0.5 ? 'color' : 'number'
      let value: Color | Number
      
      if (betType === 'color') {
        const colors: Color[] = ['red', 'green', 'purple']
        value = colors[Math.floor(Math.random() * colors.length)]
      } else {
        value = generateRandomNumber()
      }
      
      bets.push(createColorBet(betType, value, betAmount))
    }
    
    // Evaluate bets
    const evaluatedBets = bets.map(bet => evaluateColorBet(bet, result))
    const totalPayout = evaluatedBets.reduce((sum, bet) => sum + bet.winAmount, 0)
    
    history.push({
      id: generateRoundId(),
      gameId: result.gameId,
      timestamp: now - (i * 60000), // 1 minute apart
      result,
      bets: evaluatedBets,
      totalBetAmount: betAmount,
      totalPayout,
      profit: totalPayout - betAmount,
      isWin: totalPayout > 0
    })
  }
  
  return history.sort((a, b) => b.timestamp - a.timestamp)
}

export function formatNumber(number: Number): string {
  return number.toString()
}

export function formatColor(color: Color): string {
  return COLOR_CONFIG[color].name
}

export function getColorEmoji(color: Color): string {
  return COLOR_CONFIG[color].emoji
}

export function formatPayout(amount: number): string {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`
  }
  return amount.toFixed(2)
}

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  })
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString([], { 
    month: 'short', 
    day: 'numeric' 
  })
}

export function getWinRate(history: ColorRound[]): number {
  if (history.length === 0) return 0
  const wins = history.filter(round => round.isWin).length
  return (wins / history.length) * 100
}

export function getMostFrequentColor(history: ColorRound[]): string {
  if (history.length === 0) return 'N/A'
  
  const colorCounts = history.reduce((counts, round) => {
    counts[round.result.color] = (counts[round.result.color] || 0) + 1
    return counts
  }, {} as Record<string, number>)
  
  const mostFrequent = Object.entries(colorCounts)
    .sort(([,a], [,b]) => b - a)[0]
  
  return mostFrequent ? mostFrequent[0] : 'N/A'
}

export function getHotNumbers(history: ColorRound[], count: number = 5): Number[] {
  if (history.length === 0) return []
  
  const numberCounts = history.reduce((counts, round) => {
    counts[round.result.number] = (counts[round.result.number] || 0) + 1
    return counts
  }, {} as Record<Number, number>)
  
  return Object.entries(numberCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, count)
    .map(([number]) => Number(number) as Number)
}

export function getColdNumbers(history: ColorRound[], count: number = 5): Number[] {
  if (history.length === 0) return []
  
  const allNumbers: Number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  
  const numberCounts = history.reduce((counts, round) => {
    counts[round.result.number] = (counts[round.result.number] || 0) + 1
    return counts
  }, {} as Record<Number, number>)
  
  return allNumbers
    .sort((a, b) => (numberCounts[a] || 0) - (numberCounts[b] || 0))
    .slice(0, count)
}
