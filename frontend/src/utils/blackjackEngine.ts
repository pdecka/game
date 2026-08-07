/**
 * Blackjack game engine with state management
 * Handles deck management, game flow, and all game actions
 */

import type { Card, Deck } from './blackjackDeck'
import type { Hand, HandValue, SplitHand } from './blackjackHands'
import { 
  createMultiDeck, 
  shuffleDeck, 
  drawCard, 
  drawMultipleCards,
  resetDeck,
  shouldReshuffle
} from './blackjackDeck'
import {
  calculateHandValue,
  createHand,
  addCardToHand,
  standHand,
  doubleDownHand,
  splitHand,
  isBlackjack,
  isBust,
  canDoubleDown,
  canSplit,
  canTakeInsurance,
  shouldDealerHit,
  evaluateInitialHands,
  calculatePayout,
  getDealerAction
} from './blackjackHands'

export type GameState = 'betting' | 'dealing' | 'playerTurn' | 'dealerTurn' | 'result' | 'reset'

export interface GameConfig {
  deckCount: number
  minBet: number
  maxBet: number
  hitOnSoft17: boolean
  blackjackPayout: number
  insurancePayout: number
  reshuffleThreshold: number
}

export const DEFAULT_CONFIG: GameConfig = {
  deckCount: 6,
  minBet: 1,
  maxBet: 10000,
  hitOnSoft17: false,
  blackjackPayout: 2.5,
  insurancePayout: 2,
  reshuffleThreshold: 75
}

export interface BlackjackBet {
  amount: number
  insurance?: number
  timestamp: number
}

export interface BlackjackResult {
  playerHands: Hand[]
  dealerHand: Hand
  result: 'win' | 'lose' | 'push'
  payout: number
  profit: number
  multiplier: number
  timestamp: number
  gameData: {
    playerBlackjack: boolean
    dealerBlackjack: boolean
    immediateResult: string | null
    insurance?: {
      bet: number
      won: boolean
      payout: number
    }
  }
}

export interface BlackjackRound {
  id: string
  bet: BlackjackBet
  result: BlackjackResult
  timestamp: number
}

export interface BlackjackGameState {
  state: GameState
  deck: Deck
  playerHands: Hand[]
  dealerHand: Hand
  currentHandIndex: number
  bet: BlackjackBet | null
  result: BlackjackResult | null
  gameHistory: BlackjackRound[]
  config: GameConfig
  splitHand?: SplitHand
  insuranceOffered: boolean
  insuranceTaken: boolean
}

export function createBlackjackGameState(config: GameConfig = DEFAULT_CONFIG): BlackjackGameState {
  const deck = shuffleDeck(createMultiDeck(config.deckCount))
  
  return {
    state: 'betting',
    deck,
    playerHands: [],
    dealerHand: createHand([], 0),
    currentHandIndex: 0,
    bet: null,
    result: null,
    gameHistory: [],
    config,
    insuranceOffered: false,
    insuranceTaken: false
  }
}

export function placeBet(gameState: BlackjackGameState, amount: number): BlackjackGameState {
  if (amount < gameState.config.minBet || amount > gameState.config.maxBet) {
    throw new Error(`Bet must be between ${gameState.config.minBet} and ${gameState.config.maxBet}`)
  }
  
  if (gameState.state !== 'betting') {
    throw new Error('Cannot place bet during game')
  }
  
  return {
    ...gameState,
    bet: {
      amount,
      timestamp: Date.now()
    }
  }
}

export function takeInsurance(gameState: BlackjackGameState, amount: number): BlackjackGameState {
  if (!gameState.insuranceOffered) {
    throw new Error('Insurance not offered')
  }
  
  if (gameState.insuranceTaken) {
    throw new Error('Insurance already taken')
  }
  
  if (amount > gameState.bet!.amount / 2) {
    throw new Error('Insurance bet cannot exceed half of main bet')
  }
  
  return {
    ...gameState,
    bet: {
      ...gameState.bet!,
      insurance: amount
    },
    insuranceTaken: true
  }
}

export function startGame(gameState: BlackjackGameState): BlackjackGameState {
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
  
  // Deal initial cards
  const { card: playerCards1, remainingDeck: deck1 } = drawCard(deck)
  const { card: dealerCard1, remainingDeck: deck2 } = drawCard(deck1)
  const { card: playerCards2, remainingDeck: deck3 } = drawCard(deck2)
  const { card: dealerCard2, remainingDeck: deck4 } = drawCard(deck3)
  
  if (!playerCards1 || !playerCards2 || !dealerCard1 || !dealerCard2) {
    throw new Error('Not enough cards in deck')
  }
  
  const playerHand = createHand([playerCards1, playerCards2], gameState.bet.amount)
  const dealerHand = createHand([dealerCard1, dealerCard2], 0)
  
  // Check for insurance offer
  const insuranceOffered = canTakeInsurance(dealerCard1)
  
  // Check for initial blackjacks
  const { playerBlackjack, dealerBlackjack, immediateResult } = evaluateInitialHands(
    playerHand.cards,
    dealerHand.cards
  )
  
  // If immediate result (both blackjacks), go straight to result
  if (immediateResult) {
    const result = calculatePayout(gameState.bet.amount, playerHand.value, dealerHand.value)
    
    return {
      ...gameState,
      state: 'result',
      deck: deck4,
      playerHands: [playerHand],
      dealerHand,
      result: {
        playerHands: [playerHand],
        dealerHand,
        result: result.result,
        payout: result.payout,
        profit: result.profit,
        multiplier: result.multiplier,
        timestamp: Date.now(),
        gameData: {
          playerBlackjack,
          dealerBlackjack,
          immediateResult
        }
      },
      insuranceOffered
    }
  }
  
  return {
    ...gameState,
    state: insuranceOffered ? 'playerTurn' : 'playerTurn',
    deck: deck4,
    playerHands: [playerHand],
    dealerHand,
    insuranceOffered
  }
}

export function hit(gameState: BlackjackGameState): BlackjackGameState {
  if (gameState.state !== 'playerTurn') {
    throw new Error('Cannot hit now')
  }
  
  const currentHand = getCurrentPlayerHand(gameState)
  if (currentHand.status !== 'active') {
    throw new Error('Cannot hit on this hand')
  }
  
  const { card, remainingDeck } = drawCard(gameState.deck)
  if (!card) {
    throw new Error('No cards left in deck')
  }
  
  const newHand = addCardToHand(currentHand, card)
  const updatedHands = [...gameState.playerHands]
  updatedHands[gameState.currentHandIndex] = newHand
  
  // Check if bust or if we need to move to next hand (split)
  if (newHand.status === 'bust') {
    return moveToNextHandOrDealer({
      ...gameState,
      deck: remainingDeck,
      playerHands: updatedHands
    })
  }
  
  return {
    ...gameState,
    deck: remainingDeck,
    playerHands: updatedHands
  }
}

export function stand(gameState: BlackjackGameState): BlackjackGameState {
  if (gameState.state !== 'playerTurn') {
    throw new Error('Cannot stand now')
  }
  
  const currentHand = getCurrentPlayerHand(gameState)
  if (currentHand.status !== 'active') {
    throw new Error('Cannot stand on this hand')
  }
  
  const newHand = standHand(currentHand)
  const updatedHands = [...gameState.playerHands]
  updatedHands[gameState.currentHandIndex] = newHand
  
  return moveToNextHandOrDealer({
    ...gameState,
    playerHands: updatedHands
  })
}

export function doubleDown(gameState: BlackjackGameState): BlackjackGameState {
  if (gameState.state !== 'playerTurn') {
    throw new Error('Cannot double down now')
  }
  
  const currentHand = getCurrentPlayerHand(gameState)
  if (!canDoubleDown(currentHand.cards)) {
    throw new Error('Cannot double down on this hand')
  }
  
  const { card, remainingDeck } = drawCard(gameState.deck)
  if (!card) {
    throw new Error('No cards left in deck')
  }
  
  const newHand = doubleDownHand(currentHand, card)
  const updatedHands = [...gameState.playerHands]
  updatedHands[gameState.currentHandIndex] = newHand
  
  return moveToNextHandOrDealer({
    ...gameState,
    deck: remainingDeck,
    playerHands: updatedHands
  })
}

export function split(gameState: BlackjackGameState): BlackjackGameState {
  if (gameState.state !== 'playerTurn') {
    throw new Error('Cannot split now')
  }
  
  const currentHand = getCurrentPlayerHand(gameState)
  if (!canSplit(currentHand.cards)) {
    throw new Error('Cannot split this hand')
  }
  
  const splitHandData = splitHand(currentHand)
  
  // Draw additional cards for each split hand
  const { card: cards1, remainingDeck: deck1 } = drawCard(gameState.deck)
  const { card: cards2, remainingDeck: deck2 } = drawCard(deck1)
  
  if (!cards1 || !cards2) {
    throw new Error('Not enough cards to split')
  }
  
  const hand1 = addCardToHand(splitHandData.hands[0], cards1)
  const hand2 = addCardToHand(splitHandData.hands[1], cards2)
  
  return {
    ...gameState,
    state: 'playerTurn',
    deck: deck2,
    playerHands: [hand1, hand2],
    currentHandIndex: 0,
    splitHand: {
      ...splitHandData,
      hands: [hand1, hand2]
    }
  }
}

export function dealerPlay(gameState: BlackjackGameState): BlackjackGameState {
  if (gameState.state !== 'dealerTurn') {
    throw new Error('Not dealer turn yet')
  }
  
  let currentDealerHand = gameState.dealerHand
  let currentDeck = gameState.deck
  
  // Reveal hidden card
  if (currentDealerHand.cards.length === 2) {
    // Dealer hand is already complete, just calculate value
    currentDealerHand = {
      ...currentDealerHand,
      value: calculateHandValue(currentDealerHand.cards)
    }
  }
  
  // Dealer hits until 17+ (or soft 17+ based on config)
  while (shouldDealerHit(currentDealerHand.cards, gameState.config.hitOnSoft17)) {
    const { card, remainingDeck } = drawCard(currentDeck)
    if (!card) break
    
    currentDealerHand = addCardToHand(currentDealerHand, card)
    currentDeck = remainingDeck
  }
  
  // Finalize dealer hand
  currentDealerHand = standHand(currentDealerHand)
  
  return {
    ...gameState,
    state: 'result',
    deck: currentDeck,
    dealerHand: currentDealerHand
  }
}

export function calculateGameResult(gameState: BlackjackGameState): BlackjackResult {
  if (!gameState.bet) {
    throw new Error('No bet placed')
  }
  
  let totalPayout = 0
  let totalProfit = 0
  let finalResult: 'win' | 'lose' | 'push' = 'lose'
  
  // Calculate results for each player hand
  const handResults = gameState.playerHands.map(hand => {
    const result = calculatePayout(hand.bet, hand.value, gameState.dealerHand.value)
    totalPayout += result.payout
    totalProfit += result.profit
    
    return {
      hand,
      result: result.result,
      payout: result.payout,
      profit: result.profit
    }
  })
  
  // Determine overall result
  if (totalProfit > 0) finalResult = 'win'
  else if (totalProfit < 0) finalResult = 'lose'
  else finalResult = 'push'
  
  // Calculate insurance result
  let insuranceResult
  if (gameState.bet.insurance) {
    const dealerBlackjack = isBlackjack(gameState.dealerHand.cards)
    const insurancePayout = dealerBlackjack ? gameState.bet.insurance * gameState.config.insurancePayout : 0
    const insuranceProfit = insurancePayout - gameState.bet.insurance
    
    insuranceResult = {
      bet: gameState.bet.insurance,
      won: dealerBlackjack,
      payout: insurancePayout
    }
    
    totalPayout += insurancePayout
    totalProfit += insuranceProfit
  }
  
  // Get initial evaluation data
  const { playerBlackjack, dealerBlackjack, immediateResult } = evaluateInitialHands(
    gameState.playerHands[0]?.cards || [],
    gameState.dealerHand.cards
  )
  
  return {
    playerHands: gameState.playerHands,
    dealerHand: gameState.dealerHand,
    result: finalResult,
    payout: totalPayout,
    profit: totalProfit,
    multiplier: totalPayout / gameState.bet.amount,
    timestamp: Date.now(),
    gameData: {
      playerBlackjack,
      dealerBlackjack,
      immediateResult,
      insurance: insuranceResult
    }
  }
}

export function finishGame(gameState: BlackjackGameState): BlackjackGameState {
  if (gameState.state !== 'result') {
    throw new Error('Game not in result state')
  }
  
  const result = calculateGameResult(gameState)
  
  const round: BlackjackRound = {
    id: `round-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    bet: gameState.bet!,
    result,
    timestamp: Date.now()
  }
  
  return {
    ...gameState,
    result,
    gameHistory: [round, ...gameState.gameHistory.slice(0, 49)] // Keep last 50 rounds
  }
}

export function resetGame(gameState: BlackjackGameState): BlackjackGameState {
  return createBlackjackGameState(gameState.config)
}

export function getCurrentPlayerHand(gameState: BlackjackGameState): Hand {
  return gameState.playerHands[gameState.currentHandIndex]
}

export function moveToNextHandOrDealer(gameState: BlackjackGameState): BlackjackGameState {
  // If split hand, move to next hand
  if (gameState.splitHand) {
    const nextIndex = gameState.currentHandIndex + 1
    if (nextIndex < gameState.playerHands.length) {
      return {
        ...gameState,
        currentHandIndex: nextIndex,
        state: 'playerTurn'
      }
    }
  }
  
  // All player hands done, move to dealer
  return {
    ...gameState,
    state: 'dealerTurn'
  }
}

export function canPlayerAct(gameState: BlackjackGameState): boolean {
  return gameState.state === 'playerTurn'
}

export function canPlayerHit(gameState: BlackjackGameState): boolean {
  if (!canPlayerAct(gameState)) return false
  
  const currentHand = getCurrentPlayerHand(gameState)
  return currentHand.status === 'active'
}

export function canPlayerStand(gameState: BlackjackGameState): boolean {
  if (!canPlayerAct(gameState)) return false
  
  const currentHand = getCurrentPlayerHand(gameState)
  return currentHand.status === 'active'
}

export function canPlayerDouble(gameState: BlackjackGameState): boolean {
  if (!canPlayerAct(gameState)) return false
  
  const currentHand = getCurrentPlayerHand(gameState)
  return canDoubleDown(currentHand.cards) && currentHand.status === 'active'
}

export function canPlayerSplit(gameState: BlackjackGameState): boolean {
  if (!canPlayerAct(gameState)) return false
  
  const currentHand = getCurrentPlayerHand(gameState)
  return canSplit(currentHand.cards) && currentHand.status === 'active'
}

export function canTakeInsuranceAction(gameState: BlackjackGameState): boolean {
  return gameState.insuranceOffered && !gameState.insuranceTaken
}

export function getGameStateText(gameState: GameState): string {
  const texts: Record<GameState, string> = {
    'betting': 'Place Your Bet',
    'dealing': 'Dealing Cards',
    'playerTurn': 'Your Turn',
    'dealerTurn': 'Dealer Turn',
    'result': 'Game Complete',
    'reset': 'Ready to Play'
  }
  
  return texts[gameState]
}

export function getGameStateColor(gameState: GameState): string {
  const colors: Record<GameState, string> = {
    'betting': 'text-blue-400',
    'dealing': 'text-orange-400',
    'playerTurn': 'text-emerald-400',
    'dealerTurn': 'text-purple-400',
    'result': 'text-red-400',
    'reset': 'text-slate-400'
  }
  
  return colors[gameState]
}

export function getGameProgress(gameState: BlackjackGameState): number {
  switch (gameState.state) {
    case 'betting': return 0
    case 'dealing': return 10
    case 'playerTurn': return 30 + (gameState.currentHandIndex * 20)
    case 'dealerTurn': return 80
    case 'result': return 100
    case 'reset': return 0
    default: return 0
  }
}

export function getValidActions(gameState: BlackjackGameState): Array<{
  action: 'hit' | 'stand' | 'double' | 'split' | 'insurance'
  available: boolean
  reason?: string
}> {
  const actions = [
    { action: 'hit' as const, available: canPlayerHit(gameState) },
    { action: 'stand' as const, available: canPlayerStand(gameState) },
    { action: 'double' as const, available: canPlayerDouble(gameState) },
    { action: 'split' as const, available: canPlayerSplit(gameState) },
    { action: 'insurance' as const, available: canTakeInsuranceAction(gameState) }
  ]
  
  return actions
}

export function simulateFullGame(betAmount: number, config: GameConfig = DEFAULT_CONFIG): BlackjackResult {
  let gameState = createBlackjackGameState(config)
  gameState = placeBet(gameState, betAmount)
  gameState = startGame(gameState)
  
  // Simple player strategy: hit until 17
  while (gameState.state === 'playerTurn') {
    const currentHand = getCurrentPlayerHand(gameState)
    if (currentHand.value.total < 17 && currentHand.status === 'active') {
      gameState = hit(gameState)
    } else {
      gameState = stand(gameState)
    }
  }
  
  if (gameState.state === 'dealerTurn') {
    gameState = dealerPlay(gameState)
  }
  
  gameState = finishGame(gameState)
  
  return gameState.result!
}

export function generateMockHistory(count: number = 20, config: GameConfig = DEFAULT_CONFIG): BlackjackRound[] {
  const history: BlackjackRound[] = []
  
  for (let i = 0; i < count; i++) {
    const betAmount = Math.floor(Math.random() * 500) + 10
    const result = simulateFullGame(betAmount, config)
    
    const round: BlackjackRound = {
      id: `round-${i}`,
      bet: {
        amount: betAmount,
        timestamp: Date.now() - (i * 60000)
      },
      result,
      timestamp: Date.now() - (i * 60000)
    }
    
    history.push(round)
  }
  
  return history
}

export function validateBet(amount: number, config: GameConfig): {
  isValid: boolean
  error?: string
} {
  if (amount <= 0) {
    return { isValid: false, error: 'Bet amount must be greater than 0' }
  }
  
  if (amount < config.minBet) {
    return { isValid: false, error: `Minimum bet is ${config.minBet}` }
  }
  
  if (amount > config.maxBet) {
    return { isValid: false, error: `Maximum bet is ${config.maxBet}` }
  }
  
  return { isValid: true }
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
