/**
 * Dragon Tiger game engine with state management
 * Handles deck management, game flow, and all game actions
 */

import type { Card, Deck } from './dragonTigerDeck'
import { 
  createMultiDeck, 
  shuffleDeck, 
  drawCard, 
  drawMultipleCards,
  resetDeck,
  shouldReshuffle,
  getWinner,
  getGameId,
  getShoeId
} from './dragonTigerDeck'

export type BetType = 'dragon' | 'tiger' | 'tie'
export type GameState = 'betting' | 'dealing' | 'result' | 'reset'

export interface GameConfig {
  deckCount: number
  minBet: number
  maxBet: number
  dragonPayout: number
  tigerPayout: number
  tiePayout: number
  tieRefundPercentage: number
  reshuffleThreshold: number
}

export const DEFAULT_CONFIG: GameConfig = {
  deckCount: 8,
  minBet: 1,
  maxBet: 10000,
  dragonPayout: 1,
  tigerPayout: 1,
  tiePayout: 10,
  tieRefundPercentage: 0.5,
  reshuffleThreshold: 85
}

export interface DragonTigerBet {
  amount: number
  betType: BetType
  timestamp: number
}

export interface GameResult {
  id: string
  dragonCard: Card
  tigerCard: Card
  winner: 'dragon' | 'tiger' | 'tie'
  timestamp: number
  shoeId: string
  gameNumber: number
}

export interface PayoutInfo {
  betType: BetType
  won: boolean
  payout: number
  profit: number
  refund?: number
}

export interface DragonTigerRound {
  id: string
  bet: DragonTigerBet
  result: GameResult
  payouts: PayoutInfo[]
  timestamp: number
}

export interface DragonTigerGameState {
  state: GameState
  deck: Deck
  dragonCard: Card | null
  tigerCard: Card | null
  currentBet: DragonTigerBet | null
  result: GameResult | null
  payouts: PayoutInfo[]
  gameHistory: DragonTigerRound[]
  config: GameConfig
  shoeId: string
  gameNumber: number
}

export function createDragonTigerGameState(config: GameConfig = DEFAULT_CONFIG): DragonTigerGameState {
  const deck = shuffleDeck(createMultiDeck(config.deckCount))
  const shoeId = getShoeId()
  
  return {
    state: 'betting',
    deck,
    dragonCard: null,
    tigerCard: null,
    currentBet: null,
    result: null,
    payouts: [],
    gameHistory: [],
    config,
    shoeId,
    gameNumber: 0
  }
}

export function placeBet(
  gameState: DragonTigerGameState, 
  amount: number, 
  betType: BetType
): DragonTigerGameState {
  if (gameState.state !== 'betting') {
    throw new Error('Cannot place bet during game')
  }
  
  if (amount < gameState.config.minBet || amount > gameState.config.maxBet) {
    throw new Error(`Bet amount must be between ${gameState.config.minBet} and ${gameState.config.maxBet}`)
  }
  
  return {
    ...gameState,
    currentBet: {
      amount,
      betType,
      timestamp: Date.now()
    }
  }
}

export function startGame(gameState: DragonTigerGameState): DragonTigerGameState {
  if (!gameState.currentBet) {
    throw new Error('Place bet first')
  }
  
  if (gameState.state !== 'betting') {
    throw new Error('Game already in progress')
  }
  
  // Check if deck needs reshuffling
  let deck = gameState.deck
  if (shouldReshuffle(deck)) {
    deck = shuffleDeck(resetDeck(gameState.config.deckCount))
  }
  
  // Draw 2 cards (1 for Dragon, 1 for Tiger)
  const { cards: drawnCards, remainingDeck } = drawMultipleCards(deck, 2)
  
  if (drawnCards.length !== 2) {
    throw new Error('Not enough cards to deal')
  }
  
  const [dragonCard, tigerCard] = drawnCards
  const winner = getWinner(dragonCard, tigerCard)
  
  const result: GameResult = {
    id: getGameId(),
    dragonCard,
    tigerCard,
    winner,
    timestamp: Date.now(),
    shoeId: gameState.shoeId,
    gameNumber: gameState.gameNumber + 1
  }
  
  // Calculate payouts
  const payouts = calculatePayouts(result, gameState.currentBet, gameState.config)
  
  return {
    ...gameState,
    state: 'result',
    deck: remainingDeck,
    dragonCard,
    tigerCard,
    result,
    payouts,
    gameNumber: gameState.gameNumber + 1
  }
}

export function calculatePayouts(
  result: GameResult, 
  bet: DragonTigerBet, 
  config: GameConfig
): PayoutInfo[] {
  const payouts: PayoutInfo[] = []
  
  const won = bet.betType === result.winner
  const isTie = result.winner === 'tie'
  const refund = isTie && bet.betType !== 'tie' ? bet.amount * config.tieRefundPercentage : 0
  
  let payout = 0
  let profit = 0
  
  if (won) {
    switch (bet.betType) {
      case 'dragon':
        payout = bet.amount * (1 + config.dragonPayout)
        profit = bet.amount * config.dragonPayout
        break
      case 'tiger':
        payout = bet.amount * (1 + config.tigerPayout)
        profit = bet.amount * config.tigerPayout
        break
      case 'tie':
        payout = bet.amount * (1 + config.tiePayout)
        profit = bet.amount * config.tiePayout
        break
    }
  } else if (refund > 0) {
    payout = refund
    profit = 0
  }
  
  payouts.push({
    betType: bet.betType,
    won,
    payout,
    profit,
    refund: refund > 0 ? refund : undefined
  })
  
  return payouts
}

export function finishGame(gameState: DragonTigerGameState): DragonTigerGameState {
  if (gameState.state !== 'result' || !gameState.result || !gameState.currentBet) {
    throw new Error('Game not in result state')
  }
  
  const round: DragonTigerRound = {
    id: gameState.result.id,
    bet: gameState.currentBet,
    result: gameState.result,
    payouts: gameState.payouts,
    timestamp: Date.now()
  }
  
  return {
    ...gameState,
    gameHistory: [round, ...gameState.gameHistory.slice(0, 49)], // Keep last 50 rounds
    state: 'betting',
    dragonCard: null,
    tigerCard: null,
    currentBet: null,
    result: null,
    payouts: []
  }
}

export function resetGame(gameState: DragonTigerGameState): DragonTigerGameState {
  return createDragonTigerGameState(gameState.config)
}

export function canPlaceBet(gameState: DragonTigerGameState): boolean {
  return gameState.state === 'betting'
}

export function canStartGame(gameState: DragonTigerGameState): boolean {
  return gameState.state === 'betting' && gameState.currentBet !== null
}

export function canFinishGame(gameState: DragonTigerGameState): boolean {
  return gameState.state === 'result'
}

export function getGameStateText(gameState: GameState): string {
  const texts: Record<GameState, string> = {
    'betting': 'Place Your Bets',
    'dealing': 'Dealing Cards',
    'result': 'Game Complete',
    'reset': 'Ready to Play'
  }
  
  return texts[gameState]
}

export function getGameStateColor(gameState: GameState): string {
  const colors: Record<GameState, string> = {
    'betting': 'text-blue-400',
    'dealing': 'text-orange-400',
    'result': 'text-red-400',
    'reset': 'text-slate-400'
  }
  
  return colors[gameState]
}

export function getGameProgress(gameState: DragonTigerGameState): number {
  switch (gameState.state) {
    case 'betting': return 0
    case 'dealing': return 50
    case 'result': return 100
    case 'reset': return 0
    default: return 0
  }
}

export function getValidBettingActions(gameState: DragonTigerGameState): {
  canPlaceBet: boolean
  canStartGame: boolean
  canFinishGame: boolean
  reason?: string
} {
  return {
    canPlaceBet: canPlaceBet(gameState),
    canStartGame: canStartGame(gameState),
    canFinishGame: canFinishGame(gameState)
  }
}

export function simulateFullGame(
  betAmount: number, 
  betType: BetType, 
  config: GameConfig = DEFAULT_CONFIG
): DragonTigerRound {
  let gameState = createDragonTigerGameState(config)
  gameState = placeBet(gameState, betAmount, betType)
  gameState = startGame(gameState)
  gameState = finishGame(gameState)
  
  return gameState.gameHistory[0]
}

export function generateMockHistory(count: number = 20, config: GameConfig = DEFAULT_CONFIG): DragonTigerRound[] {
  const history: DragonTigerRound[] = []
  
  for (let i = 0; i < count; i++) {
    const betAmount = Math.floor(Math.random() * 500) + 10
    const betType: BetType = (['dragon', 'tiger', 'tie'] as BetType[])[Math.floor(Math.random() * 3)]
    
    const round = simulateFullGame(betAmount, betType, config)
    history.push(round)
  }
  
  return history
}

export function getShoeStatistics(gameState: DragonTigerGameState): {
  shoeId: string
  gameNumber: number
  cardsRemaining: number
  cardsDealt: number
  penetration: number
  needsReshuffle: boolean
} {
  return {
    shoeId: gameState.shoeId,
    gameNumber: gameState.gameNumber,
    cardsRemaining: gameState.deck.remaining,
    cardsDealt: gameState.deck.total - gameState.deck.remaining,
    penetration: ((gameState.deck.total - gameState.deck.remaining) / gameState.deck.total) * 100,
    needsReshuffle: shouldReshuffle(gameState.deck)
  }
}

export function getGameStatistics(history: DragonTigerRound[]): {
  totalGames: number
  dragonWins: number
  tigerWins: number
  ties: number
  dragonWinRate: number
  tigerWinRate: number
  tieRate: number
  totalBet: number
  totalPayout: number
  totalProfit: number
  averageBet: number
  biggestWin: number
  biggestLoss: number
  highestCard: number
  lowestCard: number
} {
  if (history.length === 0) {
    return {
      totalGames: 0,
      dragonWins: 0,
      tigerWins: 0,
      ties: 0,
      dragonWinRate: 0,
      tigerWinRate: 0,
      tieRate: 0,
      totalBet: 0,
      totalPayout: 0,
      totalProfit: 0,
      averageBet: 0,
      biggestWin: 0,
      biggestLoss: 0,
      highestCard: 0,
      lowestCard: 0
    }
  }
  
  const dragonWins = history.filter(round => round.result.winner === 'dragon').length
  const tigerWins = history.filter(round => round.result.winner === 'tiger').length
  const ties = history.filter(round => round.result.winner === 'tie').length
  
  const totalBet = history.reduce((sum, round) => sum + round.bet.amount, 0)
  const totalPayout = history.reduce((sum, round) => sum + round.payouts.reduce((payoutSum, payout) => payoutSum + payout.payout, 0), 0)
  const totalProfit = history.reduce((sum, round) => sum + round.payouts.reduce((profitSum, payout) => profitSum + payout.profit, 0), 0)
  const averageBet = totalBet / history.length
  const biggestWin = Math.max(...history.map(round => round.payouts.reduce((max, payout) => Math.max(max, payout.profit), 0)))
  const biggestLoss = Math.min(...history.map(round => round.payouts.reduce((min, payout) => Math.min(min, payout.profit), 0)))
  
  const allCards = history.flatMap(round => [round.result.dragonCard, round.result.tigerCard])
  const highestCard = Math.max(...allCards.map(card => card.value))
  const lowestCard = Math.min(...allCards.map(card => card.value))
  
  return {
    totalGames: history.length,
    dragonWins,
    tigerWins,
    ties,
    dragonWinRate: (dragonWins / history.length) * 100,
    tigerWinRate: (tigerWins / history.length) * 100,
    tieRate: (ties / history.length) * 100,
    totalBet,
    totalPayout,
    totalProfit,
    averageBet,
    biggestWin,
    biggestLoss,
    highestCard,
    lowestCard
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

export function getCardComparison(dragonCard: Card, tigerCard: Card): {
  winner: 'dragon' | 'tiger' | 'tie'
  difference: number
  description: string
} {
  const winner = getWinner(dragonCard, tigerCard)
  const difference = Math.abs(dragonCard.value - tigerCard.value)
  
  let description = ''
  if (winner === 'tie') {
    description = `Both cards are ${dragonCard.rank} (${dragonCard.value})`
  } else {
    const winnerCard = winner === 'dragon' ? dragonCard : tigerCard
    const loserCard = winner === 'dragon' ? tigerCard : dragonCard
    description = `${winnerCard.rank} (${winnerCard.value}) beats ${loserCard.rank} (${loserCard.value})`
  }
  
  return {
    winner,
    difference,
    description
  }
}

export function validateGameState(gameState: DragonTigerGameState): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  // Check deck
  if (gameState.deck.remaining < 0 || gameState.deck.remaining > gameState.deck.total) {
    errors.push('Invalid deck state')
  }
  
  // Check cards
  if (gameState.dragonCard && gameState.tigerCard) {
    if (gameState.dragonCard.id === gameState.tigerCard.id) {
      errors.push('Dragon and Tiger cards cannot be the same')
    }
  }
  
  // Check state consistency
  if (gameState.state === 'result' && !gameState.result) {
    errors.push('Result state without result data')
  }
  
  if (gameState.state === 'betting' && gameState.currentBet) {
    errors.push('Betting state with existing bet')
  }
  
  if (gameState.state !== 'betting' && !gameState.currentBet) {
    errors.push('Non-betting state without bet')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function getHouseEdge(betType: BetType, config: GameConfig = DEFAULT_CONFIG): number {
  // Simplified house edge calculations (actual values depend on specific rules)
  const houseEdges: Record<BetType, number> = {
    dragon: 0.0373,      // ~3.73%
    tiger: 0.0373,       // ~3.73%
    tie: 0.1852          // ~18.52%
  }
  
  return houseEdges[betType]
}

export function getExpectedValue(betType: BetType, config: GameConfig = DEFAULT_CONFIG): number {
  const houseEdge = getHouseEdge(betType, config)
  return -houseEdge
}

export function getProbabilityOfWinning(betType: BetType, deck: Deck): number {
  const totalCards = deck.remaining
  
  if (totalCards < 2) return 0
  
  // Simplified probability calculation
  // For dragon/tiger: approximately 46.15% each, tie: 7.69%
  switch (betType) {
    case 'dragon':
    case 'tiger':
      return 0.4615
    case 'tie':
      return 0.0769
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

export function shouldIncreaseBet(history: DragonTigerRound[], strategy: 'martingale' | 'fibonacci' | 'paroli'): boolean {
  if (history.length === 0) return false
  
  const lastRound = history[0]
  const won = lastRound.payouts.some(payout => payout.won)
  
  switch (strategy) {
    case 'martingale':
      return !won // Increase after loss
    case 'fibonacci':
      return !won // Increase after loss (following fibonacci sequence)
    case 'paroli':
      return won // Increase after win
    default:
      return false
  }
}

export function getCardTrend(history: DragonTigerRound[], side: 'dragon' | 'tiger'): {
  wins: number
  losses: number
  streak: number
  trend: 'hot' | 'cold' | 'neutral'
} {
  const recentRounds = history.slice(0, 10)
  const wins = recentRounds.filter(round => round.result.winner === side).length
  const losses = recentRounds.filter(round => round.result.winner !== side && round.result.winner !== 'tie').length
  
  // Calculate current streak
  let streak = 0
  for (const round of recentRounds) {
    if (round.result.winner === side) {
      streak++
    } else if (round.result.winner !== 'tie') {
      break
    }
  }
  
  // Determine trend
  const winRate = wins / recentRounds.length
  let trend: 'hot' | 'cold' | 'neutral' = 'neutral'
  if (winRate > 0.6) trend = 'hot'
  else if (winRate < 0.4) trend = 'cold'
  
  return {
    wins,
    losses,
    streak,
    trend
  }
}

export function getBettingSuggestion(history: DragonTigerRound[], strategy: 'trend' | 'anti-trend' | 'balanced'): BetType {
  if (history.length === 0) return 'dragon' // Default bet
  
  const dragonTrend = getCardTrend(history, 'dragon')
  const tigerTrend = getCardTrend(history, 'tiger')
  
  switch (strategy) {
    case 'trend':
      // Bet on the hot side
      if (dragonTrend.trend === 'hot' && dragonTrend.streak >= 2) return 'dragon'
      if (tigerTrend.trend === 'hot' && tigerTrend.streak >= 2) return 'tiger'
      return 'dragon'
    case 'anti-trend':
      // Bet against the streak
      if (dragonTrend.streak >= 3) return 'tiger'
      if (tigerTrend.streak >= 3) return 'dragon'
      return 'dragon'
    case 'balanced':
      // Alternate or bet on the side with fewer recent wins
      if (dragonTrend.wins < tigerTrend.wins) return 'dragon'
      if (tigerTrend.wins < dragonTrend.wins) return 'tiger'
      return 'dragon'
    default:
      return 'dragon'
  }
}
