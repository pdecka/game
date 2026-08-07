export type CardSuit = 'hearts' | 'diamonds' | 'clubs' | 'spades'
export type CardRank = 'A' | 'K' | 'Q' | 'J' | '10' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2'

export interface Card {
  id: string
  suit: CardSuit
  rank: CardRank
  value: number
}

export interface Deck {
  cards: Card[]
  dealt: Card[]
  remaining: Card[]
}

export const POKER_RANKS: CardRank[] = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2']
export const POKER_SUITS: CardSuit[] = ['hearts', 'diamonds', 'clubs', 'spades']

export const POKER_CARD_VALUES: Record<CardRank, number> = {
  'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2
}

export const SUIT_SYMBOLS: Record<CardSuit, string> = {
  'hearts': 'â¤£',
  'diamonds': 'â¦',
  'clubs': 'â£',
  'spades': 'â '
}

export const SUIT_COLORS: Record<CardSuit, 'red' | 'black'> = {
  'hearts': 'red',
  'diamonds': 'red',
  'clubs': 'black',
  'spades': 'black'
}

export const RANK_DISPLAY: Record<CardRank, string> = {
  'A': 'A', 'K': 'K', 'Q': 'Q', 'J': 'J', '10': '10', '9': '9', '8': '8', '7': '7', '6': '6', '5': '5', '4': '4', '3': '3', '2': '2'
}

export function createPokerDeck(): Card[] {
  const deck: Card[] = []
  
  for (const suit of POKER_SUITS) {
    for (const rank of POKER_RANKS) {
      deck.push({
        id: `${suit}-${rank}`,
        suit,
        rank,
        value: POKER_CARD_VALUES[rank]
      })
    }
  }
  
  return deck
}

export function shufflePokerDeck(deck: Card[]): Card[] {
  const shuffled = [...deck]
  
  // Fisher-Yates shuffle algorithm
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  return shuffled
}

export function createPokerGame(): Deck {
  const fullDeck = createPokerDeck()
  const shuffled = shufflePokerDeck(fullDeck)
  
  return {
    cards: shuffled,
    dealt: [],
    remaining: shuffled
  }
}

export function dealCard(deck: Deck): Card | null {
  if (deck.remaining.length === 0) {
    return null
  }
  
  const card = deck.remaining.shift()!
  deck.dealt.push(card)
  
  return card
}

export function dealMultipleCards(deck: Deck, count: number): Card[] {
  const cards: Card[] = []
  
  for (let i = 0; i < count; i++) {
    const card = dealCard(deck)
    if (card) {
      cards.push(card)
    }
  }
  
  return cards
}

export function resetDeck(deck: Deck): void {
  const fullDeck = createPokerDeck()
  const shuffled = shufflePokerDeck(fullDeck)
  
  deck.cards = shuffled
  deck.dealt = []
  deck.remaining = shuffled
}

export function getCardDisplay(card: Card): string {
  return `${card.rank}${SUIT_SYMBOLS[card.suit]}`
}

export function getCardColor(card: Card): 'red' | 'black' {
  return SUIT_COLORS[card.suit]
}

export function compareCards(a: Card, b: Card): number {
  return b.value - a.value // Higher cards first
}

export function sortCards(cards: Card[]): Card[] {
  return [...cards].sort(compareCards)
}

export function getDeckState(deck: Deck): {
  total: number
  dealt: number
  remaining: number
  percentageRemaining: number
} {
  const total = deck.cards.length
  const dealt = deck.dealt.length
  const remaining = deck.remaining.length
  
  return {
    total,
    dealt,
    remaining,
    percentageRemaining: (remaining / total) * 100
  }
}

export function isValidCard(card: any): card is Card {
  return (
    card &&
    typeof card === 'object' &&
    typeof card.id === 'string' &&
    POKER_SUITS.includes(card.suit) &&
    POKER_RANKS.includes(card.rank) &&
    typeof card.value === 'number' &&
    POKER_CARD_VALUES[card.rank as CardRank] === card.value
  )
}

export function createCardFromId(id: string): Card | null {
  const [suit, rank] = id.split('-')
  
  if (!POKER_SUITS.includes(suit as CardSuit) || !POKER_RANKS.includes(rank as CardRank)) {
    return null
  }
  
  return {
    id,
    suit: suit as CardSuit,
    rank: rank as CardRank,
    value: POKER_CARD_VALUES[rank as CardRank]
  }
}

export function getCardUnicode(card: Card): string {
  const suitUnicode: Record<CardSuit, string> = {
    'hearts': 'â¤¥',
    'diamonds': 'â¦',
    'clubs': 'â£',
    'spades': 'â '
  }
  
  return `${card.rank}${suitUnicode[card.suit]}`
}

export function formatCardForDisplay(card: Card): {
  display: string
  color: 'red' | 'black'
  unicode: string
} {
  return {
    display: getCardDisplay(card),
    color: getCardColor(card),
    unicode: getCardUnicode(card)
  }
}

export function areCardsEqual(a: Card, b: Card): boolean {
  return a.id === b.id
}

export function getRankDifference(a: Card, b: Card): number {
  return Math.abs(a.value - b.value)
}

export function isSequential(cards: Card[]): boolean {
  if (cards.length < 2) return true
  
  const sorted = sortCards(cards)
  
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].value - sorted[i + 1].value !== 1) {
      return false
    }
  }
  
  return true
}

export function hasSameSuit(cards: Card[]): boolean {
  if (cards.length < 2) return true
  
  const firstSuit = cards[0].suit
  
  return cards.every(card => card.suit === firstSuit)
}

export function getRankCounts(cards: Card[]): Record<CardRank, number> {
  const counts: Partial<Record<CardRank, number>> = {}
  
  cards.forEach(card => {
    counts[card.rank] = (counts[card.rank] || 0) + 1
  })
  
  return counts as Record<CardRank, number>
}

export function getSuitCounts(cards: Card[]): Record<CardSuit, number> {
  const counts: Partial<Record<CardSuit, number>> = {}
  
  cards.forEach(card => {
    counts[card.suit] = (counts[card.suit] || 0) + 1
  })
  
  return counts as Record<CardSuit, number>
}

export function getDuplicateRanks(cards: Card[]): CardRank[] {
  const counts = getRankCounts(cards)
  
  return Object.entries(counts)
    .filter(([_, count]) => count > 1)
    .map(([rank]) => rank as CardRank)
}

export function getHighestCard(cards: Card[]): Card {
  return sortCards(cards)[0]
}

export function getLowestCard(cards: Card[]): Card {
  return sortCards(cards)[cards.length - 1]
}
