export type RouletteNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | '00'

export type RouletteColor = 'red' | 'black' | 'green'

export type BetType = 
  | 'straight' // Single number
  | 'split' // 2 numbers
  | 'street' // 3 numbers (row)
  | 'corner' // 4 numbers
  | 'sixline' // 6 numbers (2 rows)
  | 'red' // Red numbers
  | 'black' // Black numbers
  | 'odd' // Odd numbers
  | 'even' // Even numbers
  | 'low' // 1-18
  | 'high' // 19-36
  | 'dozen1' // 1-12
  | 'dozen2' // 13-24
  | 'dozen3' // 25-36
  | 'column1' // 1,4,7,10,13,16,19,22,25,28,31,34
  | 'column2' // 2,5,8,11,14,17,20,23,26,29,32,35
  | 'column3' // 3,6,9,12,15,18,21,24,27,30,33,36

export interface Bet {
  id: string
  type: BetType
  amount: number
  numbers: RouletteNumber[]
  payout: number
  won: boolean
  winAmount: number
}

export interface RouletteResult {
  number: RouletteNumber
  color: RouletteColor
  isRed: boolean
  isBlack: boolean
  isGreen: boolean
  isOdd: boolean
  isEven: boolean
  isLow: boolean
  isHigh: boolean
  isZero: boolean
}

export interface RouletteRound {
  id: string
  timestamp: number
  result: RouletteResult
  bets: Bet[]
  totalBetAmount: number
  totalPayout: number
  profit: number
  isWin: boolean
}

// Roulette wheel numbers in order (European + American)
export const WHEEL_NUMBERS: RouletteNumber[] = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26, '00'
]

// Number color mapping
export const NUMBER_COLORS: Record<RouletteNumber, RouletteColor> = {
  0: 'green',
  '00': 'green',
  1: 'red', 2: 'black', 3: 'red', 4: 'black', 5: 'red', 6: 'black',
  7: 'red', 8: 'black', 9: 'red', 10: 'black', 11: 'black', 12: 'red',
  13: 'black', 14: 'red', 15: 'black', 16: 'red', 17: 'black', 18: 'red',
  19: 'red', 20: 'black', 21: 'red', 22: 'black', 23: 'red', 24: 'black',
  25: 'red', 26: 'black', 27: 'red', 28: 'black', 29: 'black', 30: 'red',
  31: 'black', 32: 'red', 33: 'black', 34: 'red', 35: 'black', 36: 'red'
}

// Payout ratios
export const PAYOUT_RATIOS: Record<BetType, number> = {
  'straight': 35,
  'split': 17,
  'street': 11,
  'corner': 8,
  'sixline': 5,
  'red': 1,
  'black': 1,
  'odd': 1,
  'even': 1,
  'low': 1,
  'high': 1,
  'dozen1': 2,
  'dozen2': 2,
  'dozen3': 2,
  'column1': 2,
  'column2': 2,
  'column3': 2
}

// Red numbers
export const RED_NUMBERS: RouletteNumber[] = [
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36
]

// Black numbers
export const BLACK_NUMBERS: RouletteNumber[] = [
  2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35
]

// Dozen groups
export const DOZEN_GROUPS = {
  dozen1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as RouletteNumber[],
  dozen2: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24] as RouletteNumber[],
  dozen3: [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36] as RouletteNumber[]
}

// Column groups
export const COLUMN_GROUPS = {
  column1: [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34] as RouletteNumber[],
  column2: [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35] as RouletteNumber[],
  column3: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36] as RouletteNumber[]
}

// Street groups (rows of 3)
export const STREET_GROUPS: RouletteNumber[][] = [
  [1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12],
  [13, 14, 15], [16, 17, 18], [19, 20, 21], [22, 23, 24],
  [25, 26, 27], [28, 29, 30], [31, 32, 33], [34, 35, 36]
]

// Six line groups (2 rows of 3)
export const SIXLINE_GROUPS: RouletteNumber[][] = [
  [1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12],
  [13, 14, 15, 16, 17, 18], [19, 20, 21, 22, 23, 24],
  [25, 26, 27, 28, 29, 30], [31, 32, 33, 34, 35, 36]
]

// All possible numbers
export const ALL_NUMBERS: RouletteNumber[] = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, '00'
]

export function getNumberColor(number: RouletteNumber): RouletteColor {
  return NUMBER_COLORS[number]
}

export function isRedNumber(number: RouletteNumber): boolean {
  return NUMBER_COLORS[number] === 'red'
}

export function isBlackNumber(number: RouletteNumber): boolean {
  return NUMBER_COLORS[number] === 'black'
}

export function isGreenNumber(number: RouletteNumber): boolean {
  return NUMBER_COLORS[number] === 'green'
}

export function isOddNumber(number: RouletteNumber): boolean {
  if (number === 0 || number === '00') return false
  return (number as number) % 2 === 1
}

export function isEvenNumber(number: RouletteNumber): boolean {
  if (number === 0 || number === '00') return false
  return (number as number) % 2 === 0
}

export function isLowNumber(number: RouletteNumber): boolean {
  if (number === 0 || number === '00') return false
  return (number as number) >= 1 && (number as number) <= 18
}

export function isHighNumber(number: RouletteNumber): boolean {
  if (number === 0 || number === '00') return false
  return (number as number) >= 19 && (number as number) <= 36
}

export function getNumbersForBetType(betType: BetType, numbers?: RouletteNumber[]): RouletteNumber[] {
  switch (betType) {
    case 'straight':
      return numbers || []
    case 'red':
      return RED_NUMBERS
    case 'black':
      return BLACK_NUMBERS
    case 'odd':
      return ALL_NUMBERS.filter(n => isOddNumber(n))
    case 'even':
      return ALL_NUMBERS.filter(n => isEvenNumber(n))
    case 'low':
      return ALL_NUMBERS.filter(n => isLowNumber(n))
    case 'high':
      return ALL_NUMBERS.filter(n => isHighNumber(n))
    case 'dozen1':
      return DOZEN_GROUPS.dozen1
    case 'dozen2':
      return DOZEN_GROUPS.dozen2
    case 'dozen3':
      return DOZEN_GROUPS.dozen3
    case 'column1':
      return COLUMN_GROUPS.column1
    case 'column2':
      return COLUMN_GROUPS.column2
    case 'column3':
      return COLUMN_GROUPS.column3
    default:
      return numbers || []
  }
}

export function generateRouletteNumber(): RouletteNumber {
  const numbers = ALL_NUMBERS
  return numbers[Math.floor(Math.random() * numbers.length)]
}

export function createRouletteResult(number: RouletteNumber): RouletteResult {
  return {
    number,
    color: getNumberColor(number),
    isRed: isRedNumber(number),
    isBlack: isBlackNumber(number),
    isGreen: isGreenNumber(number),
    isOdd: isOddNumber(number),
    isEven: isEvenNumber(number),
    isLow: isLowNumber(number),
    isHigh: isHighNumber(number),
    isZero: number === 0 || number === '00'
  }
}

export function generateMockHistory(count: number = 20): RouletteRound[] {
  const history: RouletteRound[] = []
  const now = Date.now()
  
  for (let i = 0; i < count; i++) {
    const number = generateRouletteNumber()
    const result = createRouletteResult(number)
    const betAmount = Math.floor(Math.random() * 500) + 10
    
    history.push({
      id: `roulette-${i}`,
      timestamp: now - (i * 60000), // 1 minute apart
      result,
      bets: [], // Would be populated in actual game
      totalBetAmount: betAmount,
      totalPayout: betAmount * (Math.random() > 0.7 ? Math.random() * 5 : 0),
      profit: 0, // Would be calculated
      isWin: false // Would be calculated
    })
  }
  
  return history.sort((a, b) => b.timestamp - a.timestamp)
}

export function formatRouletteNumber(number: RouletteNumber): string {
  return number.toString()
}

export function getBetTypeDisplayName(betType: BetType): string {
  const displayNames: Record<BetType, string> = {
    'straight': 'Straight',
    'split': 'Split',
    'street': 'Street',
    'corner': 'Corner',
    'sixline': 'Six Line',
    'red': 'Red',
    'black': 'Black',
    'odd': 'Odd',
    'even': 'Even',
    'low': 'Low (1-18)',
    'high': 'High (19-36)',
    'dozen1': '1st 12',
    'dozen2': '2nd 12',
    'dozen3': '3rd 12',
    'column1': 'Column 1',
    'column2': 'Column 2',
    'column3': 'Column 3'
  }
  
  return displayNames[betType] || betType
}
