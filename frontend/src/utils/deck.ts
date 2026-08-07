export type CardSuit = 'hearts' | 'diamonds' | 'clubs' | 'spades'
export type CardRank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'

export interface Card {
  suit: CardSuit
  rank: CardRank
  value: number
}

export interface HiloRound {
  id: string
  timestamp: number
  betAmount: number
  finalMultiplier: number
  payout: number
  outcome: 'won' | 'lost' | 'cashed_out'
  cardsDrawn: number
}

export const CARD_RANKS: CardRank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
export const CARD_SUITS: CardSuit[] = ['hearts', 'diamonds', 'clubs', 'spades']

export const CARD_VALUES: Record<CardRank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 11, 'Q': 12, 'K': 13, 'A': 14
}

export const SUIT_SYMBOLS: Record<CardSuit, string> = {
  'hearts': ' hearts',
  'diamonds': ' diamonds',
  'clubs': ' clubs',
  'spades': ' spades'
}

export const SUIT_COLORS: Record<CardSuit, 'red' | 'black'> = {
  'hearts': 'red',
  'diamonds': 'red',
  'clubs': 'black',
  'spades': 'black'
}

export function createDeck(): Card[] {
  const deck: Card[] = []
  
  for (const suit of CARD_SUITS) {
    for (const rank of CARD_RANKS) {
      deck.push({
        suit,
        rank,
        value: CARD_VALUES[rank]
      })
    }
  }
  
  return deck
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck]
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  return shuffled
}

export function calculateMultiplier(streak: number): number {
  const baseMultiplier = 1.0
  const increment = 0.15
  
  return Math.round((baseMultiplier + (streak * increment)) * 100) / 100
}

export function calculateProfit(betAmount: number, multiplier: number): number {
  return Math.round((betAmount * multiplier - betAmount) * 100) / 100
}

export function compareCards(currentCard: Card, nextCard: Card): 'higher' | 'lower' | 'same' {
  if (nextCard.value > currentCard.value) return 'higher'
  if (nextCard.value < currentCard.value) return 'lower'
  return 'same'
}

export function isPredictionCorrect(
  currentCard: Card, 
  nextCard: Card, 
  prediction: 'higher' | 'lower'
): boolean {
  const comparison = compareCards(currentCard, nextCard)
  
  if (prediction === 'higher') {
    return comparison === 'higher' || comparison === 'same'
  } else {
    return comparison === 'lower' || comparison === 'same'
  }
}

export function generateMockHistory(count: number = 20): HiloRound[] {
  const history: HiloRound[] = []
  const now = Date.now()
  
  for (let i = 0; i < count; i++) {
    const betAmount = Math.floor(Math.random() * 500) + 10
    const cardsDrawn = Math.floor(Math.random() * 8) + 1
    const finalMultiplier = calculateMultiplier(cardsDrawn - 1)
    const outcomes: ('won' | 'lost' | 'cashed_out')[] = ['won', 'lost', 'cashed_out']
    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)]
    
    history.push({
      id: `hilo-${i}`,
      timestamp: now - (i * 45000),
      betAmount,
      finalMultiplier,
      payout: outcome === 'lost' ? 0 : calculateProfit(betAmount, finalMultiplier),
      outcome,
      cardsDrawn
    })
  }
  
  return history.sort((a, b) => b.timestamp - a.timestamp)
}
