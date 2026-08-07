/**
 * Dragon Tiger deck system with 6-8 deck support
 * Standard 52-card deck with proper ranking for Dragon Tiger game
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
  deckCount: number
  shuffled: boolean
}

export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']
export const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

// Dragon Tiger card values: A=1, 2-10=face value, J=11, Q=12, K=13
export const DRAGON_TIGER_CARD_VALUES: Record<Rank, number> = {
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

export function createCard(suit: Suit, rank: Rank, deckIndex: number = 0): Card {
  return {
    id: `${rank}-${suit}-${deckIndex}`,
    suit,
    rank,
    value: DRAGON_TIGER_CARD_VALUES[rank],
    color: SUIT_COLORS[suit],
    symbol: SUIT_SYMBOLS[suit]
  }
}

export function createSingleDeck(deckIndex: number = 0): Card[] {
  const cards: Card[] = []
  
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push(createCard(suit, rank, deckIndex))
    }
  }
  
  return cards
}

export function createMultiDeck(deckCount: number = 8): Deck {
  const allCards: Card[] = []
  
  for (let i = 0; i < deckCount; i++) {
    allCards.push(...createSingleDeck(i))
  }
  
  return {
    cards: allCards,
    remaining: allCards.length,
    total: allCards.length,
    deckCount,
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

export function resetDeck(deckCount: number = 8): Deck {
  return createMultiDeck(deckCount)
}

export function getDeckPenetration(deck: Deck): number {
  return ((deck.total - deck.remaining) / deck.total) * 100
}

export function needsReshuffle(deck: Deck, threshold: number = 85): boolean {
  return getDeckPenetration(deck) >= threshold
}

export function getCardDisplay(card: Card): string {
  return `${card.rank}${card.symbol}`
}

export function getCardColor(card: Card): string {
  return card.color === 'red' ? 'text-red-500' : 'text-black'
}

export function getCardBackground(card: Card, isHidden: boolean = false): string {
  if (isHidden) {
    return 'bg-gradient-to-br from-blue-800 to-blue-900 border-blue-700'
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
    DRAGON_TIGER_CARD_VALUES[card.rank as Rank] === card.value
  )
}

export function getRankValue(rank: Rank): number {
  return DRAGON_TIGER_CARD_VALUES[rank]
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
  penetration: number
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
    penetration: getDeckPenetration(deck),
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
  if (parts.length !== 3) return null
  
  const [rank, suit, deckIndex] = parts
  
  if (!RANKS.includes(rank as Rank) || !SUITS.includes(suit as Suit)) {
    return null
  }
  
  return createCard(suit as Suit, rank as Rank, parseInt(deckIndex))
}

export function formatCardId(card: Card): string {
  return `${card.rank}-${card.suit}-${card.id.split('-')[2] || '0'}`
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
  return `${deck.deckCount}-deck Dragon Tiger Shoe (${deck.remaining}/${deck.total} cards remaining)`
}

export function isDeckEmpty(deck: Deck): boolean {
  return deck.remaining === 0
}

export function getRecommendedReshufflePoint(deckCount: number): number {
  // Standard casino practice: reshuffle at 85-90% penetration
  return deckCount <= 4 ? 90 : 85
}

export function shouldReshuffle(deck: Deck): boolean {
  const threshold = getRecommendedReshufflePoint(deck.deckCount)
  return needsReshuffle(deck, threshold)
}

// Dragon Tiger specific utilities
export function compareCards(card1: Card, card2: Card): 'card1' | 'card2' | 'tie' {
  if (card1.value > card2.value) return 'card1'
  if (card2.value > card1.value) return 'card2'
  return 'tie'
}

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

export function getCardCountForDragonTiger(deck: Deck): {
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

export function getShoeId(): string {
  return `shoe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Card comparison utilities for Dragon Tiger
export function getWinner(dragonCard: Card, tigerCard: Card): 'dragon' | 'tiger' | 'tie' {
  const result = compareCards(dragonCard, tigerCard)
  if (result === 'card1') return 'dragon'
  if (result === 'card2') return 'tiger'
  return 'tie'
}

export function getWinnerColor(winner: 'dragon' | 'tiger' | 'tie'): string {
  switch (winner) {
    case 'dragon': return 'text-blue-400'
    case 'tiger': return 'text-red-400'
    case 'tie': return 'text-green-400'
    default: return 'text-slate-400'
  }
}

export function getWinnerEmoji(winner: 'dragon' | 'tiger' | 'tie'): string {
  switch (winner) {
    case 'dragon': return 'ð'
    case 'tiger': return 'ð'
    case 'tie': return 'ð'
    default: return 'â'
  }
}

export function getWinnerText(winner: 'dragon' | 'tiger' | 'tie'): string {
  switch (winner) {
    case 'dragon': return 'DRAGON WINS'
    case 'tiger': return 'TIGER WINS'
    case 'tie': return 'TIE'
    default: return 'UNKNOWN'
  }
}

// Probability calculations
export function getCardProbabilities(deck: Deck): {
  ace: number
  faceCard: number
  highCard: number
  lowCard: number
  tieProbability: number
} {
  const stats = getDeckStatistics(deck)
  const totalCards = stats.remainingCards
  
  return {
    ace: stats.aces / totalCards,
    faceCard: stats.faceCards / totalCards,
    highCard: stats.highCards / totalCards,
    lowCard: stats.lowCards / totalCards,
    tieProbability: Object.values(stats.cardsByRank).reduce((sum, count) => sum + (count * (count - 1)), 0) / (totalCards * (totalCards - 1))
  }
}

export function getExpectedValue(betType: 'dragon' | 'tiger' | 'tie', deck: Deck, payouts: { dragon: number; tiger: number; tie: number }): number {
  const probs = getCardProbabilities(deck)
  
  switch (betType) {
    case 'dragon':
    case 'tiger':
      // For dragon/tiger: win probability = 0.5 - tieProbability/2
      const winProb = 0.5 - probs.tieProbability / 2
      const loseProb = 0.5 + probs.tieProbability / 2
      return (winProb * payouts.dragon) - loseProb
    case 'tie':
      return probs.tieProbability * payouts.tie - (1 - probs.tieProbability)
    default:
      return 0
  }
}

// Card animation utilities
export function getCardAnimationDelay(position: 'left' | 'right'): number {
  return position === 'left' ? 100 : 300
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
  
  if (deck.deckCount < 1 || deck.deckCount > 10) {
    errors.push('Invalid deck count')
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
