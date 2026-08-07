import {
  createRoundResult,
  evaluateColorBet,
  createColorBet,
  generateRandomNumber,
  type ColorBet,
  type RoundResult,
  type ColorRound,
  type BetType,
  type Color,
  type Number
} from './colorConfig'

export interface ColorGameResult {
  result: RoundResult
  bets: ColorBet[]
  totalBetAmount: number
  totalPayout: number
  profit: number
  isWin: boolean
}

export function evaluateAllBets(bets: ColorBet[], result: RoundResult): ColorBet[] {
  return bets.map(bet => evaluateColorBet(bet, result))
}

export function calculateTotalPayout(bets: ColorBet[]): number {
  return bets.reduce((total, bet) => total + bet.winAmount, 0)
}

export function calculateTotalBetAmount(bets: ColorBet[]): number {
  return bets.reduce((total, bet) => total + bet.amount, 0)
}

export function calculateProfit(totalBetAmount: number, totalPayout: number): number {
  return totalPayout - totalBetAmount
}

export function spinColorGame(bets: ColorBet[]): ColorGameResult {
  // Generate result FIRST (deterministic)
  const result = createRoundResult(generateRandomNumber())
  
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

export function validateBet(type: BetType, value: Color | Number, amount: number): boolean {
  if (amount <= 0) return false
  
  if (type === 'color') {
    return value === 'red' || value === 'green' || value === 'purple'
  } else if (type === 'number') {
    const numValue = Number(value)
    return numValue >= 0 && numValue <= 9
  }
  
  return false
}

export function calculateOdds(type: BetType, value: Color | Number): number {
  if (type === 'color') {
    // Color bets: 2x payout (50% win chance)
    return 0.5
  } else if (type === 'number') {
    if (value === 0 || value === 5) {
      // Special numbers: 5x payout (20% win chance)
      return 0.2
    } else {
      // Regular numbers: 9x payout (10% win chance)
      return 0.111
    }
  }
  
  return 0
}

export function getExpectedValue(type: BetType, value: Color | Number): number {
  const odds = calculateOdds(type, value)
  const payout = type === 'color' ? 2 : (Number(value) === 0 || Number(value) === 5 ? 5 : 9)
  return (odds * payout) - 1
}

export function getBestColorBet(): Color {
  const colorValues: Color[] = ['red', 'green', 'purple']
  let bestColor = colorValues[0]
  let bestEV = getExpectedValue('color', bestColor)
  
  for (const color of colorValues) {
    const ev = getExpectedValue('color', color)
    if (ev > bestEV) {
      bestEV = ev
      bestColor = color
    }
  }
  
  return bestColor
}

export function getBestNumberBet(): Number {
  let bestNumber = 0 as Number
  let bestEV = getExpectedValue('number', bestNumber)
  
  for (let i = 0; i <= 9; i++) {
    const ev = getExpectedValue('number', i as Number)
    if (ev > bestEV) {
      bestEV = ev
      bestNumber = i as Number
    }
  }
  
  return bestNumber
}

export function analyzeBettingPattern(bets: ColorBet[]): {
  colorBets: number
  numberBets: number
  averageBetAmount: number
  riskLevel: 'Low' | 'Medium' | 'High'
} {
  const colorBets = bets.filter(bet => bet.type === 'color').length
  const numberBets = bets.filter(bet => bet.type === 'number').length
  const averageBetAmount = bets.length > 0 ? bets.reduce((sum, bet) => sum + bet.amount, 0) / bets.length : 0
  
  let riskLevel: 'Low' | 'Medium' | 'High' = 'Low'
  if (numberBets > colorBets) riskLevel = 'High'
  else if (averageBetAmount > 100) riskLevel = 'Medium'
  
  return {
    colorBets,
    numberBets,
    averageBetAmount,
    riskLevel
  }
}

export function simulateGameSession(
  rounds: number,
  betAmount: number,
  strategy: 'random' | 'color' | 'number' | 'mixed'
): {
  roundsPlayed: number
  totalBet: number
  totalPayout: number
  profit: number
  winRate: number
} {
  let totalBet = 0
  let totalPayout = 0
  let wins = 0
  
  for (let i = 0; i < rounds; i++) {
    const bets: ColorBet[] = []
    
    // Generate bets based on strategy
    if (strategy === 'random') {
      const betType = Math.random() > 0.5 ? 'color' : 'number'
      const colors: Color[] = ['red', 'green', 'purple']
      const value = betType === 'color' 
        ? colors[Math.floor(Math.random() * colors.length)]
        : Math.floor(Math.random() * 10) as Number
      
      bets.push(createColorBet(betType, value, betAmount))
    } else if (strategy === 'color') {
      const colors: Color[] = ['red', 'green', 'purple']
      const value = colors[Math.floor(Math.random() * colors.length)]
      bets.push(createColorBet('color', value, betAmount))
    } else if (strategy === 'number') {
      const value = Math.floor(Math.random() * 10) as Number
      bets.push(createColorBet('number', value, betAmount))
    } else if (strategy === 'mixed') {
      // One color bet and one number bet
      const colors: Color[] = ['red', 'green', 'purple']
      bets.push(createColorBet('color', colors[Math.floor(Math.random() * colors.length)], betAmount / 2))
      bets.push(createColorBet('number', Math.floor(Math.random() * 10) as Number, betAmount / 2))
    }
    
    const result = spinColorGame(bets)
    totalBet += result.totalBetAmount
    totalPayout += result.totalPayout
    if (result.isWin) wins++
  }
  
  return {
    roundsPlayed: rounds,
    totalBet,
    totalPayout,
    profit: totalPayout - totalBet,
    winRate: (wins / rounds) * 100
  }
}

export function createColorRound(
  bets: ColorBet[],
  result?: RoundResult
): ColorRound {
  const gameResult = result ? { result, bets, totalBetAmount: 0, totalPayout: 0, profit: 0, isWin: false } : spinColorGame(bets)
  
  return {
    id: `color-round-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    gameId: gameResult.result.gameId,
    timestamp: Date.now(),
    result: gameResult.result,
    bets: gameResult.bets,
    totalBetAmount: gameResult.totalBetAmount,
    totalPayout: gameResult.totalPayout,
    profit: gameResult.profit,
    isWin: gameResult.isWin
  }
}

export function formatBetAmount(amount: number): string {
  return amount.toFixed(2)
}

export function formatProfit(profit: number): string {
  if (profit >= 0) {
    return `+${formatBetAmount(profit)}`
  } else {
    return `-${formatBetAmount(Math.abs(profit))}`
  }
}

export function getWinProbability(type: BetType, value: Color | Number): number {
  if (type === 'color') {
    // 4 red, 4 green, 2 purple out of 10 numbers
    if (value === 'purple') return 0.2
    return 0.4
  } else if (type === 'number') {
    // 1 out of 10 numbers
    return 0.1
  }
  
  return 0
}

export function getRiskRewardRatio(type: BetType, value: Color | Number): string {
  const probability = getWinProbability(type, value)
  const payout = type === 'color' ? 2 : (value === 0 || value === 5 ? 5 : 9)
  const ratio = (payout - 1) / probability
  
  return ratio.toFixed(2)
}
