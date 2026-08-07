/**
 * Andar Bahar deck system with single 52-card deck
 * Standard 52-card deck with proper ranking for Andar Bahar game
 */

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades'
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'

export interface Card {
  id: string
  suit: Suit
  rank: Rank
  value: number
  color: 'red' | 'black'
  symbol: string
}

export interface Deck {
  cards: Card[]
  remaining: number
  total: number
  shuffled: boolean
}

export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']
export const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

// Andar Bahar card values: A=1, 2-10=face value, J=11, Q=12, K=13
export const ANDAR_BAHAR_CARD_VALUES: Record<Rank, number> = {
  'A': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 11,
  'Q': 12,
  'K': 13
}

export const SUIT_SYMBOLS: Record<Suit, string> = {
  'hearts': 'â¥',
  'diamonds': 'â¦',
  'clubs': 'â£',
  'spades': 'â '
}

export const SUIT_COLORS: Record<Suit, 'red' | 'black'> = {
  'hearts': 'red',
  'diamonds': 'red',
  'clubs': 'black',
  'spades': 'black'
}

export function createCard(suit: Suit, rank: Rank): Card {
  return {
    id: `${rank}-${suit}`,
    suit,
    rank,
    value: ANDAR_BAHAR_CARD_VALUES[rank],
    color: SUIT_COLORS[suit],
    symbol: SUIT_SYMBOLS[suit]
  }
}

export function createSingleDeck(): Card[] {
  const cards: Card[] = []
  
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push(createCard(suit, rank))
    }
  }
  
  return cards
}

export function createDeck(): Deck {
  const cards = createSingleDeck()
  
  return {
    cards,
    remaining: cards.length,
    total: cards.length,
    shuffled: false
  }
}

export function shuffleDeck(deck: Deck, seed?: number): Deck {
  // Fisher-Yates shuffle algorithm
  const shuffled = [...deck.cards]
  
  // Use seeded random if provided (for provably fair)
  let random = seed ? seededRandom(seed) : Math.random
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  return {
    ...deck,
    cards: shuffled,
    shuffled: true
  }
}

// Seeded random number generator for testing and provably fair
function seededRandom(seed: number): () => number {
  let m = 0x80000000 // 2**31
  let a = 1103515245
  let c = 12345
  let state = seed ? seed : Math.floor(Math.random() * (m - 1))
  
  return function() {
    state = (a * state + c) % m
    return state / (m - 1)
  }
}

export function drawCard(deck: Deck): { card: Card | null; remainingDeck: Deck } {
  if (deck.remaining === 0) {
    return { card: null, remainingDeck: deck }
  }
  
  const card = deck.cards[deck.cards.length - deck.remaining]
  const remainingDeck = {
    ...deck,
    remaining: deck.remaining - 1
  }
  
  return { card, remainingDeck }
}

export function drawMultipleCards(deck: Deck, count: number): { cards: Card[]; remainingDeck: Deck } {
  const cards: Card[] = []
  let currentDeck = deck
  
  for (let i = 0; i < count; i++) {
    const { card, remainingDeck } = drawCard(currentDeck)
    if (!card) break
    cards.push(card)
    currentDeck = remainingDeck
  }
  
  return { cards, remainingDeck: currentDeck }
}

export function resetDeck(): Deck {
  return createDeck()
}

export function getCardDisplay(card: Card): string {
  return `${card.rank}${card.symbol}`
}

export function getCardColor(card: Card): string {
  return card.color === 'red' ? 'text-red-500' : 'text-black'
}

export function getCardBackground(card: Card, isHidden: boolean = false): string {
  if (isHidden) {
    return 'bg-gradient-to-br from-purple-800 to-purple-900 border-purple-700'
  }
  
  return card.color === 'red' 
    ? 'bg-white border-red-300' 
    : 'bg-white border-gray-300'
}

export function isValidCard(card: any): card is Card {
  return (
    card &&
    typeof card === 'object' &&
    typeof card.id === 'string' &&
    SUITS.includes(card.suit) &&
    RANKS.includes(card.rank) &&
    typeof card.value === 'number' &&
    ANDAR_BAHAR_CARD_VALUES[card.rank as Rank] === card.value
  )
}

export function getRankValue(rank: Rank): number {
  return ANDAR_BAHAR_CARD_VALUES[rank]
}

export function getSuitColor(suit: Suit): 'red' | 'black' {
  return SUIT_COLORS[suit]
}

export function getSuitSymbol(suit: Suit): string {
  return SUIT_SYMBOLS[suit]
}

export function isFaceCard(rank: Rank): boolean {
  return ['J', 'Q', 'K'].includes(rank)
}

export function isAce(rank: Rank): boolean {
  return rank === 'A'
}

export function isTenValue(rank: Rank): boolean {
  return rank === '10'
}

export function getCardCount(deck: Deck): number {
  return deck.remaining
}

export function getCardCountBySuit(deck: Deck, suit: Suit): number {
  return deck.cards
    .slice(deck.cards.length - deck.remaining)
    .filter(card => card.suit === suit).length
}

export function getCardCountByRank(deck: Deck, rank: Rank): number {
  return deck.cards
    .slice(deck.cards.length - deck.remaining)
    .filter(card => card.rank === rank).length
}

export function getRemainingCards(deck: Deck): Card[] {
  return deck.cards.slice(deck.cards.length - deck.remaining)
}

export function getUsedCards(deck: Deck): Card[] {
  return deck.cards.slice(0, deck.cards.length - deck.remaining)
}

export function getDeckStatistics(deck: Deck): {
  totalCards: number
  remainingCards: number
  usedCards: number
  cardsBySuit: Record<Suit, number>
  cardsByRank: Record<Rank, number>
  aces: number
  faceCards: number
  lowCards: number
  highCards: number
} {
  const remainingCards = getRemainingCards(deck)
  const usedCards = getUsedCards(deck)
  
  const cardsBySuit: Record<Suit, number> = {
    hearts: 0,
    diamonds: 0,
    clubs: 0,
    spades: 0
  }
  
  const cardsByRank: Record<Rank, number> = {
    'A': 0,
    '2': 0,
    '3': 0,
    '4': 0,
    '5': 0,
    '6': 0,
    '7': 0,
    '8': 0,
    '9': 0,
    '10': 0,
    'J': 0,
    'Q': 0,
    'K': 0
  }
  
  let aces = 0
  let faceCards = 0
  let lowCards = 0
  let highCards = 0
  
  // Count remaining cards by suit and rank
  remainingCards.forEach(card => {
    cardsBySuit[card.suit]++
    cardsByRank[card.rank]++
    
    if (card.rank === 'A') {
      aces++
    } else if (isFaceCard(card.rank)) {
      faceCards++
    } else if (card.value <= 6) {
      lowCards++
    } else {
      highCards++
    }
  })
  
  return {
    totalCards: deck.total,
    remainingCards: deck.remaining,
    usedCards: deck.total - deck.remaining,
    cardsBySuit,
    cardsByRank,
    aces,
    faceCards,
    lowCards,
    highCards
  }
}

export function createCardFromId(id: string): Card | null {
  const parts = id.split('-')
  if (parts.length !== 2) return null
  
  const [rank, suit] = parts
  
  if (!RANKS.includes(rank as Rank) || !SUITS.includes(suit as Suit)) {
    return null
  }
  
  return createCard(suit as Suit, rank as Rank)
}

export function formatCardId(card: Card): string {
  return `${card.rank}-${card.suit}`
}

export function getCardShortDisplay(card: Card): string {
  return `${card.rank}${card.symbol.charAt(0)}`
}

export function getCardUnicode(card: Card): string {
  const rankUnicode: Record<Rank, string> = {
    'A': 'A',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',
    '10': '10',
    'J': 'J',
    'Q': 'Q',
    'K': 'K'
  }
  
  return rankUnicode[card.rank] + card.symbol
}

export function getDeckDescription(deck: Deck): string {
  return `Andar Bahar Deck (${deck.remaining}/${deck.total} cards remaining)`
}

export function isDeckEmpty(deck: Deck): boolean {
  return deck.remaining === 0
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

export function getGameId(): string {
  return `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Andar Bahar specific utilities
export function getCardValueDescription(card: Card): string {
  if (card.value === 1) return 'Ace (1)'
  if (card.value === 11) return 'Jack (11)'
  if (card.value === 12) return 'Queen (12)'
  if (card.value === 13) return 'King (13)'
  return card.value.toString()
}

export function getCardRankDescription(card: Card): string {
  return `${card.rank} (${card.value})`
}

export function isHighCard(card: Card): boolean {
  return card.value >= 10
}

export function isLowCard(card: Card): boolean {
  return card.value <= 6
}

export function getCardStrength(card: Card): 'low' | 'medium' | 'high' {
  if (card.value <= 6) return 'low'
  if (card.value <= 10) return 'medium'
  return 'high'
}

export function getCardCountForAndarBahar(deck: Deck): {
  total: number
  aces: number
  faceCards: number
  low: number
  high: number
} {
  const remaining = getRemainingCards(deck)
  
  const stats = remaining.reduce((acc, card) => {
    acc.total++
    
    if (card.rank === 'A') {
      acc.aces++
    } else if (isFaceCard(card.rank)) {
      acc.faceCards++
    } else if (card.value <= 6) {
      acc.low++
    } else {
      acc.high++
    }
    
    return acc
  }, { total: 0, aces: 0, faceCards: 0, low: 0, high: 0 })
  
  return stats
}

export function getCardColorClass(card: Card): string {
  return card.color === 'red' ? 'text-red-500' : 'text-gray-900'
}

export function getCardBackgroundColor(card: Card): string {
  return card.color === 'red' 
    ? 'bg-red-50 border-red-200' 
    : 'bg-gray-50 border-gray-200'
}

export function getCardBorderColor(card: Card): string {
  return card.color === 'red' 
    ? 'border-red-300' 
    : 'border-gray-300'
}

// Card comparison utilities for Andar Bahar
export function compareCards(card1: Card, card2: Card): 'card1' | 'card2' | 'tie' {
  if (card1.value > card2.value) return 'card1'
  if (card2.value > card1.value) return 'card2'
  return 'tie'
}

export function getCardRankOrder(card: Card): number {
  return card.value
}

// Animation utilities
export function getCardAnimationDelay(position: number): number {
  return position * 300 // 300ms delay between cards
}

export function getCardAnimationDuration(): number {
  return 800
}

export function getRevealAnimationDuration(): number {
  return 600
}

// Validation utilities
export function validateDeck(deck: Deck): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (deck.cards.length !== deck.total) {
    errors.push('Card count mismatch')
  }
  
  if (deck.remaining < 0 || deck.remaining > deck.total) {
    errors.push('Invalid remaining count')
  }
  
  // Check for duplicate cards
  const cardIds = deck.cards.map(card => card.id)
  const uniqueIds = new Set(cardIds)
  if (cardIds.length !== uniqueIds.size) {
    errors.push('Duplicate cards found')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Joker specific utilities for Andar Bahar
export function getJokerCard(deck: Deck): Card | null {
  if (deck.remaining === 0) return null
  
  // In Andar Bahar, the first card drawn becomes the Joker
  const { card } = drawCard(deck)
  return card
}

export function findJokerInDeck(jokerCard: Card, deck: Deck): {
  position: number
  side: 'andar' | 'bahar'
  isEarlyWin: boolean
} {
  const remainingCards = getRemainingCards(deck)
  
  // Find the position of the joker card in the remaining deck
  const jokerPosition = remainingCards.findIndex(card => 
    card.rank === jokerCard.rank && card.suit === jokerCard.suit
  )
  
  if (jokerPosition === -1) {
    return { position: -1, side: 'andar', isEarlyWin: false }
  }
  
  // Determine side based on position
  // Position 0 = first card dealt to Bahar
  // Position 1 = second card dealt to Andar
  // And so on...
  const side = jokerPosition % 2 === 0 ? 'bahar' : 'andar'
  const isEarlyWin = jokerPosition === 0 // Joker on first Bahar card
  
  return { position: jokerPosition, side, isEarlyWin }
}

export function getDealingSequence(deck: Deck, jokerCard: Card): {
  cards: Card[]
  winner: 'andar' | 'bahar'
  position: number
  isEarlyWin: boolean
  sequence: Array<{ card: Card; side: 'andar' | 'bahar' }>
} {
  const remainingCards = getRemainingCards(deck)
  const { position, side, isEarlyWin } = findJokerInDeck(jokerCard, deck)
  
  // Create dealing sequence up to the joker
  const sequence: Array<{ card: Card; side: 'andar' | 'bahar' }> = []
  
  for (let i = 0; i <= position; i++) {
    const card = remainingCards[i]
    const cardSide = i % 2 === 0 ? 'bahar' : 'andar'
    sequence.push({ card, side: cardSide })
  }
  
  return {
    cards: sequence.map(item => item.card),
    winner: side,
    position,
    isEarlyWin,
    sequence
  }
}

export function getSideColor(side: 'andar' | 'bahar'): string {
  return side === 'andar' ? 'text-purple-400' : 'text-orange-400'
}

export function getSideEmoji(side: 'andar' | 'bahar'): string {
  return side === 'andar' ? 'ð' : 'ð'
}

export function getSideText(side: 'andar' | 'bahar'): string {
  return side === 'andar' ? 'ANDAR' : 'BAHAR'
}

export function getSideBgColor(side: 'andar' | 'bahar'): string {
  return side === 'andar' ? 'bg-purple-600' : 'bg-orange-600'
}

export function getSideBorderColor(side: 'andar' | 'bahar'): string {
  return side === 'andar' ? 'border-purple-400' : 'border-orange-400'
}
