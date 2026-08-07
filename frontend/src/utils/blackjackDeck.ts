/**
 * Blackjack deck system with multi-deck support
 * Standard 52-card deck with configurable deck count
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

export const CARD_VALUES: Record<Rank, number> = {
  'A': 11,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 10,
  'Q': 10,
  'K': 10
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
    value: CARD_VALUES[rank],
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

export function createMultiDeck(deckCount: number = 6): Deck {
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

export function resetDeck(deckCount: number = 6): Deck {
  return createMultiDeck(deckCount)
}

export function getDeckPenetration(deck: Deck): number {
  return ((deck.total - deck.remaining) / deck.total) * 100
}

export function needsReshuffle(deck: Deck, threshold: number = 75): boolean {
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
    CARD_VALUES[card.rank as Rank] === card.value
  )
}

export function getRankValue(rank: Rank): number {
  return CARD_VALUES[rank]
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
  return ['10', 'J', 'Q', 'K'].includes(rank)
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
  
  // Count remaining cards by suit and rank
  remainingCards.forEach(card => {
    cardsBySuit[card.suit]++
    cardsByRank[card.rank]++
  })
  
  return {
    totalCards: deck.total,
    remainingCards: deck.remaining,
    usedCards: deck.total - deck.remaining,
    penetration: getDeckPenetration(deck),
    cardsBySuit,
    cardsByRank
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
  return `${deck.deckCount}-deck Blackjack Deck (${deck.remaining}/${deck.total} cards remaining)`
}

export function isDeckEmpty(deck: Deck): boolean {
  return deck.remaining === 0
}

export function getRecommendedReshufflePoint(deckCount: number): number {
  // Standard casino practice: reshuffle at 75-80% penetration
  return deckCount <= 2 ? 80 : 75
}

export function shouldReshuffle(deck: Deck): boolean {
  const threshold = getRecommendedReshufflePoint(deck.deckCount)
  return needsReshuffle(deck, threshold)
}
