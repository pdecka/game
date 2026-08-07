/**
 * Baccarat game engine with state management
 * Handles deck management, game flow, and all game actions
 */

import type { Card, Deck } from './baccaratDeck'
import type { 
  BaccaratHand, 
  BetType, 
  GameResult, 
  PayoutInfo,
  ThirdCardDecision 
} from './baccaratRules'
import { 
  createMultiDeck, 
  shuffleDeck, 
  drawCard, 
  drawMultipleCards,
  resetDeck,
  shouldReshuffle
} from './baccaratDeck'
import {
  createBaccaratHand,
  shouldPlayerDrawCard,
  shouldBankerDrawCard,
  determineGameResult,
  calculatePayouts,
  validateBet,
  PAYOUT_CONFIG
} from './baccaratRules'

export type GameState = 'betting' | 'dealing' | 'thirdCard' | 'result' | 'reset'
export type { BetType, GameResult } from './baccaratRules'

export interface GameConfig {
  deckCount: number
  minBet: number
  maxBet: number
  bankerCommission: number
  tiePayout: number
  pairPayout: number
  superSixPayout: number
  reshuffleThreshold: number
}

export const DEFAULT_CONFIG: GameConfig = {
  deckCount: 8,
  minBet: 1,
  maxBet: 10000,
  bankerCommission: 0.05,
  tiePayout: 8,
  pairPayout: 11,
  superSixPayout: 12,
  reshuffleThreshold: 85
}

export interface BaccaratBet {
  amount: number
  betTypes: BetType[]
  timestamp: number
}

export interface BaccaratRound {
  id: string
  bet: BaccaratBet
  result: GameResult
  payouts: PayoutInfo[]
  timestamp: number
}

export interface BaccaratGameState {
  state: GameState
  deck: Deck
  playerHand: BaccaratHand | null
  bankerHand: BaccaratHand | null
  playerThirdCard: Card | null
  bankerThirdCard: Card | null
  bet: BaccaratBet | null
  result: GameResult | null
  payouts: PayoutInfo[]
  gameHistory: BaccaratRound[]
  config: GameConfig
  shoeId: string
  gameNumber: number
}

export function createBaccaratGameState(config: GameConfig = DEFAULT_CONFIG): BaccaratGameState {
  const deck = shuffleDeck(createMultiDeck(config.deckCount))
  const shoeId = `shoe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  return {
    state: 'betting',
    deck,
    playerHand: null,
    bankerHand: null,
    playerThirdCard: null,
    bankerThirdCard: null,
    bet: null,
    result: null,
    payouts: [],
    gameHistory: [],
    config,
    shoeId,
    gameNumber: 0
  }
}

export function placeBet(
  gameState: BaccaratGameState, 
  amount: number, 
  betTypes: BetType[]
): BaccaratGameState {
  const validation = validateBet(amount, gameState.config.minBet, gameState.config.maxBet)
  if (!validation.isValid) {
    throw new Error(validation.error)
  }
  
  if (gameState.state !== 'betting') {
    throw new Error('Cannot place bet during game')
  }
  
  return {
    ...gameState,
    bet: {
      amount,
      betTypes,
      timestamp: Date.now()
    }
  }
}

export function startGame(gameState: BaccaratGameState): BaccaratGameState {
  if (!gameState.bet) {
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
  
  // Deal initial cards (2 cards each)
  const { cards: playerCards, remainingDeck: deck1 } = drawMultipleCards(deck, 2)
  const { cards: bankerCards, remainingDeck: deck2 } = drawMultipleCards(deck1, 2)
  
  if (playerCards.length !== 2 || bankerCards.length !== 2) {
    throw new Error('Not enough cards to deal initial hands')
  }
  
  const playerHand = createBaccaratHand(playerCards)
  const bankerHand = createBaccaratHand(bankerCards)
  
  // Check for naturals
  if (playerHand.natural || bankerHand.natural) {
    const result = determineGameResult(playerHand, bankerHand)
    const payouts = calculatePayouts(result, gameState.bet.amount, gameState.bet.betTypes, {
      player: 1,
      banker: 1 - gameState.config.bankerCommission,
      tie: gameState.config.tiePayout,
      playerPair: gameState.config.pairPayout,
      bankerPair: gameState.config.pairPayout,
      superSix: gameState.config.superSixPayout
    })
    
    return {
      ...gameState,
      state: 'result',
      deck: deck2,
      playerHand,
      bankerHand,
      result: {
        ...result,
        playerHand,
        bankerHand
      },
      payouts,
      gameNumber: gameState.gameNumber + 1
    }
  }
  
  // No naturals - continue to third card phase
  return {
    ...gameState,
    state: 'thirdCard',
    deck: deck2,
    playerHand,
    bankerHand,
    gameNumber: gameState.gameNumber + 1
  }
}

export function processThirdCards(gameState: BaccaratGameState): BaccaratGameState {
  if (gameState.state !== 'thirdCard' || !gameState.playerHand || !gameState.bankerHand) {
    throw new Error('Cannot process third cards in current state')
  }
  
  let deck = gameState.deck
  let playerThirdCard: Card | null = null
  let bankerThirdCard: Card | null = null
  
  // Check if player should draw third card
  const playerDecision = shouldPlayerDrawCard(gameState.playerHand)
  
  if (playerDecision.shouldDraw) {
    const { card, remainingDeck } = drawCard(deck)
    if (!card) {
      throw new Error('Not enough cards for player third card')
    }
    playerThirdCard = card
    deck = remainingDeck
  }
  
  // Check if banker should draw third card
  const bankerDecision = shouldBankerDrawCard(
    gameState.bankerHand, 
    gameState.playerHand, 
    playerThirdCard || undefined
  )
  
  if (bankerDecision.shouldDraw) {
    const { card, remainingDeck } = drawCard(deck)
    if (!card) {
      throw new Error('Not enough cards for banker third card')
    }
    bankerThirdCard = card
    deck = remainingDeck
  }
  
  // Update hands with third cards
  const updatedPlayerHand = playerThirdCard 
    ? createBaccaratHand([...gameState.playerHand.cards, playerThirdCard])
    : gameState.playerHand
  
  const updatedBankerHand = bankerThirdCard
    ? createBaccaratHand([...gameState.bankerHand.cards, bankerThirdCard])
    : gameState.bankerHand
  
  // Determine final result
  const result = determineGameResult(
    updatedPlayerHand, 
    updatedBankerHand, 
    playerThirdCard || undefined, 
    bankerThirdCard || undefined
  )
  
  // Calculate payouts
  const payouts = calculatePayouts(result, gameState.bet!.amount, gameState.bet!.betTypes, {
    player: 1,
    banker: 1 - gameState.config.bankerCommission,
    tie: gameState.config.tiePayout,
    playerPair: gameState.config.pairPayout,
    bankerPair: gameState.config.pairPayout,
    superSix: gameState.config.superSixPayout
  })
  
  return {
    ...gameState,
    state: 'result',
    deck,
    playerHand: updatedPlayerHand,
    bankerHand: updatedBankerHand,
    playerThirdCard,
    bankerThirdCard,
    result: {
      ...result,
      playerHand: updatedPlayerHand,
      bankerHand: updatedBankerHand
    },
    payouts
  }
}

export function finishGame(gameState: BaccaratGameState): BaccaratGameState {
  if (gameState.state !== 'result' || !gameState.result || !gameState.bet) {
    throw new Error('Game not in result state')
  }
  
  const round: BaccaratRound = {
    id: `round-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    bet: gameState.bet,
    result: gameState.result,
    payouts: gameState.payouts,
    timestamp: Date.now()
  }
  
  return {
    ...gameState,
    gameHistory: [round, ...gameState.gameHistory.slice(0, 49)], // Keep last 50 rounds
    state: 'betting',
    playerHand: null,
    bankerHand: null,
    playerThirdCard: null,
    bankerThirdCard: null,
    bet: null,
    result: null,
    payouts: []
  }
}

export function resetGame(gameState: BaccaratGameState): BaccaratGameState {
  return createBaccaratGameState(gameState.config)
}

export function canPlaceBet(gameState: BaccaratGameState): boolean {
  return gameState.state === 'betting'
}

export function canStartGame(gameState: BaccaratGameState): boolean {
  return gameState.state === 'betting' && gameState.bet !== null
}

export function canProcessThirdCards(gameState: BaccaratGameState): boolean {
  return gameState.state === 'thirdCard'
}

export function canFinishGame(gameState: BaccaratGameState): boolean {
  return gameState.state === 'result'
}

export function getGameStateText(gameState: GameState): string {
  const texts: Record<GameState, string> = {
    'betting': 'Place Your Bets',
    'dealing': 'Dealing Cards',
    'thirdCard': 'Drawing Third Cards',
    'result': 'Game Complete',
    'reset': 'Ready to Play'
  }
  
  return texts[gameState]
}

export function getGameStateColor(gameState: GameState): string {
  const colors: Record<GameState, string> = {
    'betting': 'text-blue-400',
    'dealing': 'text-orange-400',
    'thirdCard': 'text-purple-400',
    'result': 'text-red-400',
    'reset': 'text-slate-400'
  }
  
  return colors[gameState]
}

export function getGameProgress(gameState: BaccaratGameState): number {
  switch (gameState.state) {
    case 'betting': return 0
    case 'dealing': return 20
    case 'thirdCard': return 60
    case 'result': return 100
    case 'reset': return 0
    default: return 0
  }
}

export function getValidBettingActions(gameState: BaccaratGameState): {
  canPlaceBet: boolean
  canStartGame: boolean
  canProcessThirdCards: boolean
  canFinishGame: boolean
  reason?: string
} {
  return {
    canPlaceBet: canPlaceBet(gameState),
    canStartGame: canStartGame(gameState),
    canProcessThirdCards: canProcessThirdCards(gameState),
    canFinishGame: canFinishGame(gameState)
  }
}

export function simulateFullGame(
  betAmount: number, 
  betTypes: BetType[], 
  config: GameConfig = DEFAULT_CONFIG
): BaccaratRound {
  let gameState = createBaccaratGameState(config)
  gameState = placeBet(gameState, betAmount, betTypes)
  gameState = startGame(gameState)
  
  if (gameState.state === 'thirdCard') {
    gameState = processThirdCards(gameState)
  }
  
  gameState = finishGame(gameState)
  
  return gameState.gameHistory[0]
}

export function generateMockHistory(count: number = 20, config: GameConfig = DEFAULT_CONFIG): BaccaratRound[] {
  const history: BaccaratRound[] = []
  
  for (let i = 0; i < count; i++) {
    const betAmount = Math.floor(Math.random() * 500) + 10
    const betTypes: BetType[] = (['player', 'banker', 'tie'] as BetType[]).filter(() => Math.random() > 0.5)
    
    const round = simulateFullGame(betAmount, betTypes, config)
    history.push(round)
  }
  
  return history
}

export function getShoeStatistics(gameState: BaccaratGameState): {
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

export function getGameStatistics(history: BaccaratRound[]): {
  totalGames: number
  playerWins: number
  bankerWins: number
  ties: number
  playerWinRate: number
  bankerWinRate: number
  tieRate: number
  totalBet: number
  totalPayout: number
  totalProfit: number
  averageBet: number
  biggestWin: number
  biggestLoss: number
  naturalsCount: number
  superSixCount: number
} {
  if (history.length === 0) {
    return {
      totalGames: 0,
      playerWins: 0,
      bankerWins: 0,
      ties: 0,
      playerWinRate: 0,
      bankerWinRate: 0,
      tieRate: 0,
      totalBet: 0,
      totalPayout: 0,
      totalProfit: 0,
      averageBet: 0,
      biggestWin: 0,
      biggestLoss: 0,
      naturalsCount: 0,
      superSixCount: 0
    }
  }
  
  const playerWins = history.filter(round => round.result.winner === 'player').length
  const bankerWins = history.filter(round => round.result.winner === 'banker').length
  const ties = history.filter(round => round.result.winner === 'tie').length
  
  const totalBet = history.reduce((sum, round) => sum + round.bet.amount, 0)
  const totalPayout = history.reduce((sum, round) => sum + round.payouts.reduce((payoutSum, payout) => payoutSum + payout.payout, 0), 0)
  const totalProfit = history.reduce((sum, round) => sum + round.payouts.reduce((profitSum, payout) => profitSum + payout.profit, 0), 0)
  const averageBet = totalBet / history.length
  const biggestWin = Math.max(...history.map(round => round.payouts.reduce((max, payout) => Math.max(max, payout.profit), 0)))
  const biggestLoss = Math.min(...history.map(round => round.payouts.reduce((min, payout) => Math.min(min, payout.profit), 0)))
  
  const naturalsCount = history.filter(round => round.result.playerNatural || round.result.bankerNatural).length
  const superSixCount = history.filter(round => round.result.winner === 'banker' && round.result.bankerTotal === 6).length
  
  return {
    totalGames: history.length,
    playerWins,
    bankerWins,
    ties,
    playerWinRate: (playerWins / history.length) * 100,
    bankerWinRate: (bankerWins / history.length) * 100,
    tieRate: (ties / history.length) * 100,
    totalBet,
    totalPayout,
    totalProfit,
    averageBet,
    biggestWin,
    biggestLoss,
    naturalsCount,
    superSixCount
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

export function getThirdCardDecisionText(decision: ThirdCardDecision): string {
  if (decision.shouldDraw) {
    return `Draw: ${decision.reason}`
  }
  return `Stand: ${decision.reason}`
}

export function validateGameState(gameState: BaccaratGameState): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  // Check deck
  if (gameState.deck.remaining < 0 || gameState.deck.remaining > gameState.deck.total) {
    errors.push('Invalid deck state')
  }
  
  // Check hands
  if (gameState.playerHand && (gameState.playerHand.cards.length < 2 || gameState.playerHand.cards.length > 3)) {
    errors.push('Invalid player hand size')
  }
  
  if (gameState.bankerHand && (gameState.bankerHand.cards.length < 2 || gameState.bankerHand.cards.length > 3)) {
    errors.push('Invalid banker hand size')
  }
  
  // Check state consistency
  if (gameState.state === 'result' && !gameState.result) {
    errors.push('Result state without result data')
  }
  
  if (gameState.state === 'betting' && gameState.bet) {
    errors.push('Betting state with existing bet')
  }
  
  if (gameState.state !== 'betting' && !gameState.bet) {
    errors.push('Non-betting state without bet')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
