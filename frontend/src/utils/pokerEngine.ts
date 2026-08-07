import type { Card, Deck } from './pokerDeck'
import type { HandEvaluation, HandComparison, HandRank } from './pokerHands'
import { evaluateHand, compareHands } from './pokerHands'
import { createPokerGame, dealCard, dealMultipleCards } from './pokerDeck'

export type GameState = 
  | 'idle'
  | 'dealing'
  | 'flop'
  | 'turn'
  | 'river'
  | 'showdown'
  | 'result'

export interface PokerBet {
  id: string
  amount: number
  timestamp: number
}

export interface PokerResult {
  gameId: string
  playerHand: HandEvaluation
  dealerHand: HandEvaluation
  winner: 'player' | 'dealer' | 'tie'
  payout: number
  profit: number
  timestamp: number
  playerCards: Card[]
  dealerCards: Card[]
  communityCards: Card[]
}

export interface PokerRound {
  id: string
  gameId: string
  bet: PokerBet
  result: PokerResult
  timestamp: number
}

export interface PokerGameState {
  state: GameState
  deck: Deck
  playerCards: Card[]
  dealerCards: Card[]
  communityCards: Card[]
  currentBet: PokerBet | null
  currentResult: PokerResult | null
  gameHistory: PokerRound[]
}

export interface GameConfig {
  minBet: number
  maxBet: number
  houseEdge: number
  payoutMultiplier: number
}

export const POKER_CONFIG: GameConfig = {
  minBet: 1,
  maxBet: 10000,
  houseEdge: 0.02, // 2% house edge
  payoutMultiplier: 2 // 2x for wins
}

export const QUICK_BET_AMOUNTS = [10, 25, 50, 100, 250, 500]

export function formatAmount(amount: number): string {
  return amount.toFixed(2)
}


export function createPokerGameState(): PokerGameState {
  return {
    state: 'idle',
    deck: createPokerGame(),
    playerCards: [],
    dealerCards: [],
    communityCards: [],
    currentBet: null,
    currentResult: null,
    gameHistory: []
  }
}

export function startNewGame(gameState: PokerGameState, betAmount: number): PokerGameState {
  // Reset deck
  const deck = createPokerGame()
  
  // Create bet
  const bet: PokerBet = {
    id: `bet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    amount: betAmount,
    timestamp: Date.now()
  }
  
  return {
    ...gameState,
    state: 'dealing',
    deck,
    playerCards: [],
    dealerCards: [],
    communityCards: [],
    currentBet: bet,
    currentResult: null
  }
}

export function dealInitialCards(gameState: PokerGameState): PokerGameState {
  const { deck } = gameState
  
  // Deal 2 cards to player
  const playerCards = dealMultipleCards(deck, 2)
  
  // Deal 2 cards to dealer
  const dealerCards = dealMultipleCards(deck, 2)
  
  return {
    ...gameState,
    state: 'flop',
    playerCards,
    dealerCards,
    deck
  }
}

export function dealFlop(gameState: PokerGameState): PokerGameState {
  const { deck } = gameState
  
  // Deal 3 community cards
  const flopCards = dealMultipleCards(deck, 3)
  
  return {
    ...gameState,
    state: 'turn',
    communityCards: flopCards,
    deck
  }
}

export function dealTurn(gameState: PokerGameState): PokerGameState {
  const { deck } = gameState
  
  // Deal 1 turn card
  const turnCard = dealCard(deck)
  
  if (!turnCard) {
    return gameState // Should not happen with proper deck management
  }
  
  return {
    ...gameState,
    state: 'river',
    communityCards: [...gameState.communityCards, turnCard],
    deck
  }
}

export function dealRiver(gameState: PokerGameState): PokerGameState {
  const { deck } = gameState
  
  // Deal 1 river card
  const riverCard = dealCard(deck)
  
  if (!riverCard) {
    return gameState // Should not happen with proper deck management
  }
  
  return {
    ...gameState,
    state: 'showdown',
    communityCards: [...gameState.communityCards, riverCard],
    deck
  }
}

export function showdown(gameState: PokerGameState): PokerGameState {
  const { playerCards, dealerCards, communityCards, currentBet } = gameState
  
  if (!currentBet) {
    return gameState
  }
  
  // Evaluate hands
  const playerHand = evaluateHand([...playerCards, ...communityCards])
  const dealerHand = evaluateHand([...dealerCards, ...communityCards])
  
  // Determine winner
  const comparison = compareHands([...playerCards, ...communityCards], [...dealerCards, ...communityCards])
  
  // Calculate payout
  let payout = 0
  let profit = -currentBet.amount
  
  if (comparison.winner === 'player') {
    payout = currentBet.amount * POKER_CONFIG.payoutMultiplier
    profit = payout - currentBet.amount
  } else if (comparison.winner === 'tie') {
    payout = currentBet.amount // Push - return bet
    profit = 0
  }
  
  // Create result
  const result: PokerResult = {
    gameId: `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    playerHand,
    dealerHand,
    winner: comparison.winner,
    payout,
    profit,
    timestamp: Date.now(),
    playerCards: [...playerCards],
    dealerCards: [...dealerCards],
    communityCards: [...communityCards]
  }
  
  // Create round
  const round: PokerRound = {
    id: `round-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    gameId: result.gameId,
    bet: currentBet,
    result,
    timestamp: Date.now()
  }
  
  return {
    ...gameState,
    state: 'result',
    currentResult: result,
    gameHistory: [round, ...gameState.gameHistory.slice(0, 19)] // Keep last 20 rounds
  }
}

export function resetGame(gameState: PokerGameState): PokerGameState {
  return {
    ...gameState,
    state: 'idle',
    playerCards: [],
    dealerCards: [],
    communityCards: [],
    currentBet: null,
    currentResult: null
  }
}

export function playFullGame(betAmount: number): {
  gameState: PokerGameState
  result: PokerResult
} {
  let gameState = createPokerGameState()
  
  // Start game
  gameState = startNewGame(gameState, betAmount)
  
  // Deal initial cards
  gameState = dealInitialCards(gameState)
  
  // Deal flop
  gameState = dealFlop(gameState)
  
  // Deal turn
  gameState = dealTurn(gameState)
  
  // Deal river
  gameState = dealRiver(gameState)
  
  // Showdown
  gameState = showdown(gameState)
  
  return {
    gameState,
    result: gameState.currentResult!
  }
}

export function getGameProgress(gameState: GameState): number {
  const progress: Record<GameState, number> = {
    'idle': 0,
    'dealing': 10,
    'flop': 30,
    'turn': 60,
    'river': 85,
    'showdown': 95,
    'result': 100
  }
  
  return progress[gameState]
}

export function getGameStateText(gameState: GameState): string {
  const texts: Record<GameState, string> = {
    'idle': 'Ready to Deal',
    'dealing': 'Dealing Cards',
    'flop': 'Flop Dealt',
    'turn': 'Turn Dealt',
    'river': 'River Dealt',
    'showdown': 'Showdown',
    'result': 'Game Complete'
  }
  
  return texts[gameState]
}

export function getGameStateColor(gameState: GameState): string {
  const colors: Record<GameState, string> = {
    'idle': 'text-slate-400',
    'dealing': 'text-blue-400',
    'flop': 'text-emerald-400',
    'turn': 'text-yellow-400',
    'river': 'text-orange-400',
    'showdown': 'text-red-400',
    'result': 'text-purple-400'
  }
  
  return colors[gameState]
}

export function canBet(gameState: PokerGameState): boolean {
  return gameState.state === 'idle'
}

export function canDeal(gameState: PokerGameState): boolean {
  return gameState.state === 'idle' && gameState.currentBet !== null
}

export function isGameActive(gameState: PokerGameState): boolean {
  return ['dealing', 'flop', 'turn', 'river', 'showdown', 'result'].includes(gameState.state)
}

export function canShowCards(gameState: PokerGameState): boolean {
  return gameState.state === 'showdown' || gameState.state === 'result'
}

export function getHandStrengthBonus(handRank: HandRank): number {
  const bonuses: Record<HandRank, number> = {
    'high-card': 0,
    'pair': 0,
    'two-pair': 0.1,
    'three-of-a-kind': 0.2,
    'straight': 0.3,
    'flush': 0.4,
    'full-house': 0.5,
    'four-of-a-kind': 0.8,
    'straight-flush': 1.0,
    'royal-flush': 2.0
  }
  
  return bonuses[handRank] || 0
}

export function calculatePayoutWithBonus(betAmount: number, handRank: HandRank, winner: 'player' | 'dealer' | 'tie'): {
  payout: number
  profit: number
  bonus: number
} {
  const basePayout = winner === 'player' ? betAmount * POKER_CONFIG.payoutMultiplier : winner === 'tie' ? betAmount : 0
  const bonus = winner === 'player' ? betAmount * getHandStrengthBonus(handRank) : 0
  const totalPayout = basePayout + bonus
  const profit = totalPayout - betAmount
  
  return {
    payout: totalPayout,
    profit,
    bonus
  }
}

export function validateBet(amount: number): {
  isValid: boolean
  error?: string
} {
  if (amount <= 0) {
    return { isValid: false, error: 'Bet amount must be greater than 0' }
  }
  
  if (amount < POKER_CONFIG.minBet) {
    return { isValid: false, error: `Minimum bet is ${POKER_CONFIG.minBet}` }
  }
  
  if (amount > POKER_CONFIG.maxBet) {
    return { isValid: false, error: `Maximum bet is ${POKER_CONFIG.maxBet}` }
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

export function formatTime(timestamp: number): string {
  return formatTimestamp(timestamp)
}

export function getWinRate(history: PokerRound[]): number {
  if (history.length === 0) return 0
  
  const wins = history.filter(round => round.result.winner === 'player').length
  return (wins / history.length) * 100
}

export function getTotalProfit(history: PokerRound[]): number {
  return history.reduce((total, round) => total + round.result.profit, 0)
}

export function getAverageBet(history: PokerRound[]): number {
  if (history.length === 0) return 0
  
  const totalBet = history.reduce((total, round) => total + round.bet.amount, 0)
  return totalBet / history.length
}

export function getMostFrequentHand(history: PokerRound[]): HandRank | null {
  if (history.length === 0) return null
  
  const handCounts: Record<HandRank, number> = {
    'high-card': 0,
    'pair': 0,
    'two-pair': 0,
    'three-of-a-kind': 0,
    'straight': 0,
    'flush': 0,
    'full-house': 0,
    'four-of-a-kind': 0,
    'straight-flush': 0,
    'royal-flush': 0
  }
  
  history.forEach(round => {
    handCounts[round.result.playerHand.rank]++
  })
  
  let maxCount = 0
  let mostFrequent: HandRank = 'high-card'
  
  for (const [hand, count] of Object.entries(handCounts)) {
    if (count > maxCount) {
      maxCount = count
      mostFrequent = hand as HandRank
    }
  }
  
  return maxCount > 0 ? mostFrequent : null
}

export function simulatePokerGame(betAmount: number, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): PokerResult {
  // Simulate a full poker game with optional difficulty bias
  const { result } = playFullGame(betAmount)
  
  // Apply difficulty bias (for testing purposes - not for production)
  if (difficulty !== 'medium') {
    // In a real implementation, this would be controlled by backend configuration
    // For now, we'll just return the fair result
  }
  
  return result
}

export function generateMockHistory(count: number = 20): PokerRound[] {
  const history: PokerRound[] = []
  
  for (let i = 0; i < count; i++) {
    const betAmount = Math.floor(Math.random() * 500) + 10
    const { result } = playFullGame(betAmount)
    
    const round: PokerRound = {
      id: `round-${i}`,
      gameId: result.gameId,
      bet: {
        id: `bet-${i}`,
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
