import {
  generateCoinResult,
  createCoinBet,
  createCoinRound,
  determineWin,
  calculatePayout,
  calculateProfit,
  type CoinSide,
  type CoinBet,
  type CoinResult,
  type CoinRound
} from './coinConfig'

export interface CoinGameResult {
  bet: CoinBet
  result: CoinResult
  payout: number
  profit: number
  isWin: boolean
}

export function flipCoin(selectedSide: CoinSide, betAmount: number): CoinGameResult {
  // Generate result FIRST (deterministic)
  const result = generateCoinResult()
  
  // Create bet
  const bet = createCoinBet(selectedSide, betAmount)
  
  // Determine outcome
  const isWin = determineWin(selectedSide, result.side)
  const payout = calculatePayout(betAmount, isWin)
  const profit = calculateProfit(betAmount, payout)
  
  return {
    bet,
    result,
    payout,
    profit,
    isWin
  }
}

export function evaluateGame(bet: CoinBet, result: CoinResult): CoinRound {
  return createCoinRound(bet, result)
}

export function getWinProbability(): number {
  return 0.5 // 50% chance for heads or tails
}

export function getExpectedValue(): number {
  const winProbability = getWinProbability()
  const payoutMultiplier = 2
  return (winProbability * payoutMultiplier) - 1
}

export function getRiskRewardRatio(): string {
  const winProbability = getWinProbability()
  const payoutMultiplier = 2
  const ratio = (payoutMultiplier - 1) / winProbability
  return ratio.toFixed(2)
}

export function analyzeBettingPattern(rounds: CoinRound[]): {
  headsBets: number
  tailsBets: number
  averageBetAmount: number
  headsWinRate: number
  tailsWinRate: number
  riskLevel: 'Low' | 'Medium' | 'High'
} {
  const headsBets = rounds.filter(round => round.bet.side === 'heads').length
  const tailsBets = rounds.filter(round => round.bet.side === 'tails').length
  const averageBetAmount = rounds.length > 0 ? 
    rounds.reduce((sum, round) => sum + round.bet.amount, 0) / rounds.length : 0
  
  const headsWins = rounds.filter(round => 
    round.bet.side === 'heads' && round.isWin
  ).length
  const tailsWins = rounds.filter(round => 
    round.bet.side === 'tails' && round.isWin
  ).length
  
  const headsWinRate = headsBets > 0 ? (headsWins / headsBets) * 100 : 0
  const tailsWinRate = tailsBets > 0 ? (tailsWins / tailsBets) * 100 : 0
  
  let riskLevel: 'Low' | 'Medium' | 'High' = 'Low'
  if (averageBetAmount > 100) riskLevel = 'Medium'
  if (averageBetAmount > 500) riskLevel = 'High'
  
  return {
    headsBets,
    tailsBets,
    averageBetAmount,
    headsWinRate,
    tailsWinRate,
    riskLevel
  }
}

export function simulateGameSession(
  rounds: number,
  betAmount: number,
  strategy: 'random' | 'heads' | 'tails' | 'alternating'
): {
  roundsPlayed: number
  totalBet: number
  totalPayout: number
  profit: number
  winRate: number
  headsWins: number
  tailsWins: number
} {
  let totalBet = 0
  let totalPayout = 0
  let wins = 0
  let headsWins = 0
  let tailsWins = 0
  let lastSide: CoinSide | null = null
  
  for (let i = 0; i < rounds; i++) {
    let selectedSide: CoinSide
    
    // Determine side based on strategy
    if (strategy === 'random') {
      selectedSide = Math.random() < 0.5 ? 'heads' : 'tails'
    } else if (strategy === 'heads') {
      selectedSide = 'heads'
    } else if (strategy === 'tails') {
      selectedSide = 'tails'
    } else if (strategy === 'alternating') {
      selectedSide = lastSide === 'heads' ? 'tails' : 'heads'
    } else {
      selectedSide = 'heads' // fallback
    }
    
    const gameResult = flipCoin(selectedSide, betAmount)
    totalBet += betAmount
    totalPayout += gameResult.payout
    
    if (gameResult.isWin) {
      wins++
      if (gameResult.result.side === 'heads') {
        headsWins++
      } else {
        tailsWins++
      }
    }
    
    lastSide = selectedSide
  }
  
  return {
    roundsPlayed: rounds,
    totalBet,
    totalPayout,
    profit: totalPayout - totalBet,
    winRate: (wins / rounds) * 100,
    headsWins,
    tailsWins
  }
}

export function calculateStreaks(rounds: CoinRound[]): {
  currentStreak: number
  currentStreakType: 'win' | 'loss' | null
  longestWinStreak: number
  longestLossStreak: number
} {
  if (rounds.length === 0) {
    return {
      currentStreak: 0,
      currentStreakType: null,
      longestWinStreak: 0,
      longestLossStreak: 0
    }
  }
  
  let currentStreak = 1
  let currentStreakType: 'win' | 'loss' = rounds[0].isWin ? 'win' : 'loss'
  let longestWinStreak = 0
  let longestLossStreak = 0
  
  for (let i = 1; i < rounds.length; i++) {
    if (rounds[i].isWin === rounds[i-1].isWin) {
      currentStreak++
    } else {
      // Update longest streaks
      if (currentStreakType === 'win') {
        longestWinStreak = Math.max(longestWinStreak, currentStreak)
      } else {
        longestLossStreak = Math.max(longestLossStreak, currentStreak)
      }
      
      // Reset current streak
      currentStreak = 1
      currentStreakType = rounds[i].isWin ? 'win' : 'loss'
    }
  }
  
  // Check final streak
  if (currentStreakType === 'win') {
    longestWinStreak = Math.max(longestWinStreak, currentStreak)
  } else {
    longestLossStreak = Math.max(longestLossStreak, currentStreak)
  }
  
  return {
    currentStreak,
    currentStreakType,
    longestWinStreak,
    longestLossStreak
  }
}

export function getBestBetSide(rounds: CoinRound[]): CoinSide {
  if (rounds.length === 0) return 'heads'
  
  const headsWins = rounds.filter(round => round.result.side === 'heads').length
  const tailsWins = rounds.filter(round => round.result.side === 'tails').length
  
  return headsWins > tailsWins ? 'heads' : 'tails'
}

export function calculateVolatility(rounds: CoinRound[]): number {
  if (rounds.length < 2) return 0
  
  const profits = rounds.map(round => round.profit)
  const mean = profits.reduce((sum, profit) => sum + profit, 0) / profits.length
  const squaredDifferences = profits.map(profit => Math.pow(profit - mean, 2))
  const variance = squaredDifferences.reduce((sum, diff) => sum + diff, 0) / profits.length
  
  return Math.sqrt(variance)
}

export function getProfitTrend(rounds: CoinRound[]): 'up' | 'down' | 'stable' {
  if (rounds.length < 10) return 'stable'
  
  const recentRounds = rounds.slice(0, 10)
  const olderRounds = rounds.slice(10, 20)
  
  if (olderRounds.length === 0) return 'stable'
  
  const recentProfit = recentRounds.reduce((sum, round) => sum + round.profit, 0)
  const olderProfit = olderRounds.reduce((sum, round) => sum + round.profit, 0)
  
  const difference = recentProfit - olderProfit
  
  if (difference > 0) return 'up'
  if (difference < 0) return 'down'
  return 'stable'
}

export function formatBetAmount(amount: number): string {
  return amount.toFixed(2)
}

export function formatPayout(payout: number): string {
  return payout.toFixed(2)
}

export function formatProfit(profit: number): string {
  if (profit >= 0) {
    return `+${formatBetAmount(profit)}`
  } else {
    return `-${formatBetAmount(Math.abs(profit))}`
  }
}

export function validateGameInput(side: CoinSide, amount: number): {
  isValid: boolean
  error?: string
} {
  if (amount <= 0) {
    return { isValid: false, error: 'Bet amount must be greater than 0' }
  }
  
  if (amount > 10000) {
    return { isValid: false, error: 'Maximum bet amount is 10,000' }
  }
  
  if (!side || (side !== 'heads' && side !== 'tails')) {
    return { isValid: false, error: 'Invalid coin side selection' }
  }
  
  return { isValid: true }
}

export function getOutcomeColor(isWin: boolean): string {
  return isWin ? 'text-emerald-400' : 'text-red-400'
}

export function getOutcomeEmoji(isWin: boolean): string {
  return isWin ? 'ð' : 'ð'
}

export function getOutcomeText(isWin: boolean): string {
  return isWin ? 'WIN' : 'LOSS'
}
