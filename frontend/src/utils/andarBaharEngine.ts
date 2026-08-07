/**
 * Andar Bahar game engine with state management
 * Handles deck management, game flow, and all game actions
 */

import type { Card, Deck } from './andarBaharDeck'
import { 
  createDeck, 
  shuffleDeck, 
  drawCard, 
  drawMultipleCards,
  resetDeck,
  getJokerCard,
  findJokerInDeck,
  getDealingSequence
} from './andarBaharDeck'

export type BetType = 'andar' | 'bahar' | 'superBahar'
export type GameState = 'betting1' | 'dealing1' | 'betting2' | 'dealing2' | 'result' | 'reset'

export interface GameConfig {
  minBet: number
  maxBet: number
  andarPayout: number
  baharPayout: number
  superBaharPayout: number
  earlyBaharPayout: number
  secondBetPayout: number
}

export const DEFAULT_CONFIG: GameConfig = {
  minBet: 1,
  maxBet: 10000,
  andarPayout: 1,
  baharPayout: 1,
  superBaharPayout: 11,
  earlyBaharPayout: 0.25,
  secondBetPayout: 1
}

export interface AndarBaharBet {
  amount: number
  betType: BetType
  timestamp: number
  round: number // 1 for first bet, 2 for second bet
}

export interface GameResult {
  id: string
  jokerCard: Card
  winner: 'andar' | 'bahar'
  position: number
  isEarlyWin: boolean
  payoutType: 'normal' | 'early' | 'super' | 'second'
  timestamp: number
  sequence: Array<{ card: Card; side: 'andar' | 'bahar' }>
}

export interface PayoutInfo {
  betType: BetType
  won: boolean
  payout: number
  profit: number
  multiplier: number
}

export interface AndarBaharRound {
  id: string
  bets: AndarBaharBet[]
  result: GameResult
  payouts: PayoutInfo[]
  timestamp: number
}

export interface AndarBaharGameState {
  state: GameState
  deck: Deck
  jokerCard: Card | null
  currentBets: AndarBaharBet[]
  result: GameResult | null
  payouts: PayoutInfo[]
  gameHistory: AndarBaharRound[]
  config: GameConfig
  sequence: Array<{ card: Card; side: 'andar' | 'bahar' }>
  cardsDealt: number
}

export function createAndarBaharGameState(config: GameConfig = DEFAULT_CONFIG): AndarBaharGameState {
  const deck = shuffleDeck(createDeck())
  
  return {
    state: 'betting1',
    deck,
    jokerCard: null,
    currentBets: [],
    result: null,
    payouts: [],
    gameHistory: [],
    config,
    sequence: [],
    cardsDealt: 0
  }
}

export function placeBet(
  gameState: AndarBaharGameState, 
  amount: number, 
  betType: BetType,
  round: number = 1
): AndarBaharGameState {
  if (gameState.state !== 'betting1' && gameState.state !== 'betting2') {
    throw new Error('Cannot place bet during dealing')
  }
  
  if (amount < gameState.config.minBet || amount > gameState.config.maxBet) {
    throw new Error(`Bet amount must be between ${gameState.config.minBet} and ${gameState.config.maxBet}`)
  }
  
  // Check if this is a second bet (only allowed after first dealing phase)
  if (round === 2 && gameState.state !== 'betting2') {
    throw new Error('Second bet only allowed after first dealing phase')
  }
  
  const newBet: AndarBaharBet = {
    amount,
    betType,
    timestamp: Date.now(),
    round
  }
  
  return {
    ...gameState,
    currentBets: [...gameState.currentBets, newBet]
  }
}

export function startFirstDeal(gameState: AndarBaharGameState): AndarBaharGameState {
  if (gameState.state !== 'betting1') {
    throw new Error('Cannot start first deal during this state')
  }
  
  if (gameState.currentBets.length === 0) {
    throw new Error('Place bet first')
  }
  
  // Draw joker card (first card)
  const { card: jokerCard, remainingDeck } = drawCard(gameState.deck)
  
  if (!jokerCard) {
    throw new Error('No cards in deck')
  }
  
  // Get dealing sequence
  const dealingSequence = getDealingSequence(remainingDeck, jokerCard)
  
  return {
    ...gameState,
    state: 'dealing1',
    deck: remainingDeck,
    jokerCard,
    sequence: dealingSequence.sequence,
    cardsDealt: 0
  }
}

export function dealFirstCards(gameState: AndarBaharGameState, count: number = 2): AndarBaharGameState {
  if (gameState.state !== 'dealing1') {
    throw new Error('Not in first dealing phase')
  }
  
  const newCardsDealt = Math.min(count, gameState.sequence.length)
  const updatedSequence = gameState.sequence.slice(0, newCardsDealt)
  
  // Check if joker appeared
  const jokerAppeared = updatedSequence.some(item => 
    item.card.rank === gameState.jokerCard?.rank && 
    item.card.suit === gameState.jokerCard?.suit
  )
  
  if (jokerAppeared) {
    // Game ended immediately
    return finishGame(gameState, updatedSequence)
  }
  
  // Check if we should allow second betting
  const shouldAllowSecondBet = newCardsDealt >= 2 && !jokerAppeared
  
  return {
    ...gameState,
    sequence: updatedSequence,
    cardsDealt: newCardsDealt,
    state: shouldAllowSecondBet ? 'betting2' : 'dealing2'
  }
}

export function startSecondDeal(gameState: AndarBaharGameState): AndarBaharGameState {
  if (gameState.state !== 'betting2') {
    throw new Error('Cannot start second deal during this state')
  }
  
  return {
    ...gameState,
    state: 'dealing2'
  }
}

export function dealRemainingCards(gameState: AndarBaharGameState): AndarBaharGameState {
  if (gameState.state !== 'dealing1' && gameState.state !== 'dealing2') {
    throw new Error('Not in dealing phase')
  }
  
  // Deal all remaining cards until joker is found
  const remainingSequence = gameState.sequence.slice(gameState.cardsDealt)
  
  return finishGame(gameState, gameState.sequence)
}

export function finishGame(gameState: AndarBaharGameState, finalSequence?: Array<{ card: Card; side: 'andar' | 'bahar' }>): AndarBaharGameState {
  if (!gameState.jokerCard) {
    throw new Error('No joker card set')
  }
  
  const sequence = finalSequence || gameState.sequence
  
  // Find joker position and winner
  const { position, side, isEarlyWin } = findJokerInDeck(gameState.jokerCard, gameState.deck)
  
  // Determine payout type
  let payoutType: 'normal' | 'early' | 'super' | 'second' = 'normal'
  
  if (isEarlyWin) {
    // Check for super bahar bet
    const hasSuperBaharBet = gameState.currentBets.some(bet => bet.betType === 'superBahar')
    payoutType = hasSuperBaharBet ? 'super' : 'early'
  } else if (gameState.currentBets.some(bet => bet.round === 2)) {
    payoutType = 'second'
  }
  
  const result: GameResult = {
    id: Date.now().toString(),
    jokerCard: gameState.jokerCard,
    winner: side,
    position,
    isEarlyWin,
    payoutType,
    timestamp: Date.now(),
    sequence: sequence
  }
  
  // Calculate payouts
  const payouts = calculatePayouts(result, gameState.currentBets, gameState.config)
  
  // Create round
  const round: AndarBaharRound = {
    id: result.id,
    bets: gameState.currentBets,
    result,
    payouts,
    timestamp: Date.now()
  }
  
  return {
    ...gameState,
    state: 'result',
    result,
    payouts,
    gameHistory: [round, ...gameState.gameHistory.slice(0, 49)], // Keep last 50 rounds
    sequence: finalSequence || gameState.sequence,
    cardsDealt: (finalSequence || gameState.sequence).length
  }
}

export function calculatePayouts(
  result: GameResult, 
  bets: AndarBaharBet[], 
  config: GameConfig
): PayoutInfo[] {
  const payouts: PayoutInfo[] = []
  
  bets.forEach(bet => {
    let won = false
    let multiplier = 0
    
    switch (bet.betType) {
      case 'andar':
        won = result.winner === 'andar'
        if (won) {
          if (bet.round === 2) {
            multiplier = config.secondBetPayout
          } else {
            multiplier = config.andarPayout
          }
        }
        break
        
      case 'bahar':
        won = result.winner === 'bahar'
        if (won) {
          if (result.isEarlyWin && bet.round === 1) {
            multiplier = config.earlyBaharPayout
          } else if (bet.round === 2) {
            multiplier = config.secondBetPayout
          } else {
            multiplier = config.baharPayout
          }
        }
        break
        
      case 'superBahar':
        won = result.winner === 'bahar' && result.isEarlyWin
        if (won) {
          multiplier = config.superBaharPayout
        }
        break
    }
    
    const payout = won ? bet.amount * (1 + multiplier) : 0
    const profit = won ? bet.amount * multiplier : -bet.amount
    
    payouts.push({
      betType: bet.betType,
      won,
      payout,
      profit,
      multiplier
    })
  })
  
  return payouts
}

export function resetGame(gameState: AndarBaharGameState): AndarBaharGameState {
  return createAndarBaharGameState(gameState.config)
}

export function canPlaceBet(gameState: AndarBaharGameState): boolean {
  return gameState.state === 'betting1' || gameState.state === 'betting2'
}

export function canStartFirstDeal(gameState: AndarBaharGameState): boolean {
  return gameState.state === 'betting1' && gameState.currentBets.length > 0
}

export function canStartSecondDeal(gameState: AndarBaharGameState): boolean {
  return gameState.state === 'betting2'
}

export function canFinishGame(gameState: AndarBaharGameState): boolean {
  return gameState.state === 'result'
}

export function getGameStateText(gameState: GameState): string {
  const texts: Record<GameState, string> = {
    'betting1': 'Place Your First Bet',
    'dealing1': 'Dealing First Cards',
    'betting2': 'Place Your Second Bet',
    'dealing2': 'Dealing Remaining Cards',
    'result': 'Game Complete',
    'reset': 'Ready to Play'
  }
  
  return texts[gameState]
}

export function getGameStateColor(gameState: GameState): string {
  const colors: Record<GameState, string> = {
    'betting1': 'text-blue-400',
    'dealing1': 'text-orange-400',
    'betting2': 'text-purple-400',
    'dealing2': 'text-orange-400',
    'result': 'text-red-400',
    'reset': 'text-slate-400'
  }
  
  return colors[gameState]
}

export function getGameProgress(gameState: AndarBaharGameState): number {
  switch (gameState.state) {
    case 'betting1': return 0
    case 'dealing1': return 25
    case 'betting2': return 50
    case 'dealing2': return 75
    case 'result': return 100
    case 'reset': return 0
    default: return 0
  }
}

export function getValidBettingActions(gameState: AndarBaharGameState): {
  canPlaceBet: boolean
  canStartFirstDeal: boolean
  canStartSecondDeal: boolean
  canFinishGame: boolean
  reason?: string
} {
  return {
    canPlaceBet: canPlaceBet(gameState),
    canStartFirstDeal: canStartFirstDeal(gameState),
    canStartSecondDeal: canStartSecondDeal(gameState),
    canFinishGame: canFinishGame(gameState)
  }
}

export function simulateFullGame(
  betAmount: number, 
  betType: BetType, 
  config: GameConfig = DEFAULT_CONFIG
): AndarBaharRound {
  let gameState = createAndarBaharGameState(config)
  
  // Place first bet
  gameState = placeBet(gameState, betAmount, betType, 1)
  
  // Start first deal
  gameState = startFirstDeal(gameState)
  
  // Deal first cards
  gameState = dealFirstCards(gameState, 2)
  
  // If still dealing, continue
  if (gameState.state === 'dealing2') {
    gameState = dealRemainingCards(gameState)
  }
  
  return gameState.gameHistory[0]
}

export function generateMockHistory(count: number = 20, config: GameConfig = DEFAULT_CONFIG): AndarBaharRound[] {
  const history: AndarBaharRound[] = []
  
  for (let i = 0; i < count; i++) {
    const betAmount = Math.floor(Math.random() * 500) + 10
    const betType: BetType = (['andar', 'bahar', 'superBahar'] as BetType[])[Math.floor(Math.random() * 3)]
    
    const round = simulateFullGame(betAmount, betType, config)
    history.push(round)
  }
  
  return history
}

export function getGameStatistics(history: AndarBaharRound[]): {
  totalGames: number
  andarWins: number
  baharWins: number
  earlyWins: number
  andarWinRate: number
  baharWinRate: number
  earlyWinRate: number
  totalBet: number
  totalPayout: number
  totalProfit: number
  averageBet: number
  biggestWin: number
  biggestLoss: number
  averageCardsDealt: number
  superBaharWins: number
} {
  if (history.length === 0) {
    return {
      totalGames: 0,
      andarWins: 0,
      baharWins: 0,
      earlyWins: 0,
      andarWinRate: 0,
      baharWinRate: 0,
      earlyWinRate: 0,
      totalBet: 0,
      totalPayout: 0,
      totalProfit: 0,
      averageBet: 0,
      biggestWin: 0,
      biggestLoss: 0,
      averageCardsDealt: 0,
      superBaharWins: 0
    }
  }
  
  const andarWins = history.filter(round => round.result.winner === 'andar').length
  const baharWins = history.filter(round => round.result.winner === 'bahar').length
  const earlyWins = history.filter(round => round.result.isEarlyWin).length
  const superBaharWins = history.filter(round => 
    round.result.isEarlyWin && 
    round.bets.some(bet => bet.betType === 'superBahar')
  ).length
  
  const totalBet = history.reduce((sum, round) => sum + round.bets.reduce((betSum, bet) => betSum + bet.amount, 0), 0)
  const totalPayout = history.reduce((sum, round) => sum + round.payouts.reduce((payoutSum, payout) => payoutSum + payout.payout, 0), 0)
  const totalProfit = history.reduce((sum, round) => sum + round.payouts.reduce((profitSum, payout) => profitSum + payout.profit, 0), 0)
  const averageBet = totalBet / history.length
  const biggestWin = Math.max(...history.map(round => round.payouts.reduce((max, payout) => Math.max(max, payout.profit), 0)))
  const biggestLoss = Math.min(...history.map(round => round.payouts.reduce((min, payout) => Math.min(min, payout.profit), 0)))
  
  const averageCardsDealt = history.reduce((sum, round) => sum + round.result.sequence.length, 0) / history.length
  
  return {
    totalGames: history.length,
    andarWins,
    baharWins,
    earlyWins,
    andarWinRate: (andarWins / history.length) * 100,
    baharWinRate: (baharWins / history.length) * 100,
    earlyWinRate: (earlyWins / history.length) * 100,
    totalBet,
    totalPayout,
    totalProfit,
    averageBet,
    biggestWin,
    biggestLoss,
    averageCardsDealt,
    superBaharWins
  }
}

export function formatGameId(gameId: string): string {
  return gameId.slice(-8).toUpperCase()
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

export function getCardComparison(jokerCard: Card, dealtCard: Card): {
  isMatch: boolean
  description: string
} {
  const isMatch = jokerCard.rank === dealtCard.rank && jokerCard.suit === dealtCard.suit
  
  return {
    isMatch,
    description: isMatch 
      ? `Joker ${jokerCard.rank}${jokerCard.symbol} matches ${dealtCard.rank}${dealtCard.symbol}` 
      : `${dealtCard.rank}${dealtCard.symbol} (no match)`
  }
}

export function validateGameState(gameState: AndarBaharGameState): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  // Check deck
  if (gameState.deck.remaining < 0 || gameState.deck.remaining > gameState.deck.total) {
    errors.push('Invalid deck state')
  }
  
  // Check joker card
  if (gameState.jokerCard && !isValidCard(gameState.jokerCard)) {
    errors.push('Invalid joker card')
  }
  
  // Check sequence consistency
  if (gameState.sequence.length > gameState.deck.total) {
    errors.push('Sequence longer than deck')
  }
  
  // Check state consistency
  if (gameState.state === 'result' && !gameState.result) {
    errors.push('Result state without result data')
  }
  
  if ((gameState.state === 'betting1' || gameState.state === 'betting2') && gameState.currentBets.length === 0) {
    errors.push('Betting state without bets')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Helper function to check if a card is valid
function isValidCard(card: any): card is Card {
  return (
    card &&
    typeof card === 'object' &&
    typeof card.id === 'string' &&
    typeof card.suit === 'string' &&
    typeof card.rank === 'string' &&
    typeof card.value === 'number'
  )
}

export function getHouseEdge(betType: BetType, config: GameConfig = DEFAULT_CONFIG): number {
  // Simplified house edge calculations
  const houseEdges: Record<BetType, number> = {
    andar: 0.05,        // ~5%
    bahar: 0.05,        // ~5%
    superBahar: 0.15     // ~15%
  }
  
  return houseEdges[betType]
}

export function getExpectedValue(betType: BetType, config: GameConfig = DEFAULT_CONFIG): number {
  const houseEdge = getHouseEdge(betType, config)
  return -houseEdge
}

export function getProbabilityOfWinning(betType: BetType): number {
  // Simplified probability calculations
  switch (betType) {
    case 'andar':
    case 'bahar':
      return 0.5 // 50% each
    case 'superBahar':
      return 0.0192 // ~1.92% (first card match probability)
    default:
      return 0
  }
}

export function getRecommendedBetAmount(bankroll: number, riskLevel: 'low' | 'medium' | 'high'): number {
  const riskMultipliers = {
    low: 0.01,    // 1% of bankroll
    medium: 0.025, // 2.5% of bankroll
    high: 0.05    // 5% of bankroll
  }
  
  return Math.floor(bankroll * riskMultipliers[riskLevel])
}

export function shouldAllowSecondBet(gameState: AndarBaharGameState): boolean {
  return gameState.state === 'betting2' && gameState.cardsDealt >= 2
}

export function getCardCountBySide(gameState: AndarBaharGameState): {
  andar: number
  bahar: number
  total: number
} {
  let andar = 0
  let bahar = 0
  
  gameState.sequence.forEach(item => {
    if (item.side === 'andar') {
      andar++
    } else {
      bahar++
    }
  })
  
  return {
    andar,
    bahar,
    total: andar + bahar
  }
}

export function getBettingSuggestion(history: AndarBaharRound[], strategy: 'trend' | 'anti-trend' | 'balanced'): BetType {
  if (history.length === 0) return 'andar' // Default bet
  
  const recentRounds = history.slice(0, 10)
  const andarWins = recentRounds.filter(round => round.result.winner === 'andar').length
  const baharWins = recentRounds.filter(round => round.result.winner === 'bahar').length
  
  switch (strategy) {
    case 'trend':
      // Bet on the side that's winning more
      return andarWins > baharWins ? 'andar' : 'bahar'
    case 'anti-trend':
      // Bet against the trend
      return andarWins > baharWins ? 'bahar' : 'andar'
    case 'balanced':
      // Bet on the side with fewer recent wins
      return andarWins < baharWins ? 'andar' : 'bahar'
    default:
      return 'andar'
  }
}
