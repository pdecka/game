import type { Card } from './pokerDeck'

export type HandRank = 
  | 'high-card'
  | 'pair'
  | 'two-pair'
  | 'three-of-a-kind'
  | 'straight'
  | 'flush'
  | 'full-house'
  | 'four-of-a-kind'
  | 'straight-flush'
  | 'royal-flush'

export interface HandEvaluation {
  rank: HandRank
  score: number
  cards: Card[]
  description: string
}

export interface HandComparison {
  winner: 'player' | 'dealer' | 'tie'
  playerHand: HandEvaluation
  dealerHand: HandEvaluation
  difference: number
}

export const HAND_RANKINGS: HandRank[] = [
  'high-card',
  'pair',
  'two-pair',
  'three-of-a-kind',
  'straight',
  'flush',
  'full-house',
  'four-of-a-kind',
  'straight-flush',
  'royal-flush'
]

export const HAND_DESCRIPTIONS: Record<HandRank, string> = {
  'high-card': 'High Card',
  'pair': 'Pair',
  'two-pair': 'Two Pair',
  'three-of-a-kind': 'Three of a Kind',
  'straight': 'Straight',
  'flush': 'Flush',
  'full-house': 'Full House',
  'four-of-a-kind': 'Four of a Kind',
  'straight-flush': 'Straight Flush',
  'royal-flush': 'Royal Flush'
}

export function evaluateHand(cards: Card[]): HandEvaluation {
  if (cards.length < 5) {
    throw new Error('At least 5 cards are required to evaluate a hand')
  }

  // Get all possible 5-card combinations
  const combinations = getCombinations(cards, 5)
  
  // Evaluate each combination and return the best
  let bestHand: HandEvaluation | null = null
  
  for (const combination of combinations) {
    const evaluation = evaluateFiveCards(combination)
    
    if (!bestHand || evaluation.score > bestHand.score) {
      bestHand = evaluation
    }
  }
  
  return bestHand!
}

export function evaluateFiveCards(cards: Card[]): HandEvaluation {
  const sortedCards = [...cards].sort((a, b) => b.value - a.value)
  
  // Check for each hand type in order of strength
  const royalFlush = checkRoyalFlush(sortedCards)
  if (royalFlush) return royalFlush
  
  const straightFlush = checkStraightFlush(sortedCards)
  if (straightFlush) return straightFlush
  
  const fourOfAKind = checkFourOfAKind(sortedCards)
  if (fourOfAKind) return fourOfAKind
  
  const fullHouse = checkFullHouse(sortedCards)
  if (fullHouse) return fullHouse
  
  const flush = checkFlush(sortedCards)
  if (flush) return flush
  
  const straight = checkStraight(sortedCards)
  if (straight) return straight
  
  const threeOfAKind = checkThreeOfAKind(sortedCards)
  if (threeOfAKind) return threeOfAKind
  
  const twoPair = checkTwoPair(sortedCards)
  if (twoPair) return twoPair
  
  const pair = checkPair(sortedCards)
  if (pair) return pair
  
  return checkHighCard(sortedCards)
}

export function checkRoyalFlush(cards: Card[]): HandEvaluation | null {
  const straightFlush = checkStraightFlush(cards)
  
  if (straightFlush && straightFlush.cards[0].value === 14) { // Ace high
    return {
      rank: 'royal-flush',
      score: 9000000 + getHighCardScore(straightFlush.cards),
      cards: straightFlush.cards,
      description: 'Royal Flush'
    }
  }
  
  return null
}

export function checkStraightFlush(cards: Card[]): HandEvaluation | null {
  const straight = checkStraight(cards)
  const flush = checkFlush(cards)
  
  if (straight && flush) {
    return {
      rank: 'straight-flush',
      score: 8000000 + getHighCardScore(straight.cards),
      cards: straight.cards,
      description: 'Straight Flush'
    }
  }
  
  return null
}

export function checkFourOfAKind(cards: Card[]): HandEvaluation | null {
  const rankCounts = getRankCounts(cards)
  
  for (const [rank, count] of Object.entries(rankCounts)) {
    if (count === 4) {
      const fourCards = cards.filter(card => card.rank === rank)
      const kicker = cards.find(card => card.rank !== rank)!
      
      return {
        rank: 'four-of-a-kind',
        score: 7000000 + getRankValue(rank) * 10000 + kicker.value,
        cards: [...fourCards, kicker],
        description: `Four of a Kind, ${rank}s`
      }
    }
  }
  
  return null
}

export function checkFullHouse(cards: Card[]): HandEvaluation | null {
  const rankCounts = getRankCounts(cards)
  
  const threeOfKind = Object.entries(rankCounts).find(([_, count]) => count === 3)
  const pair = Object.entries(rankCounts).find(([_, count]) => count === 2)
  
  if (threeOfKind && pair) {
    const threeCards = cards.filter(card => card.rank === threeOfKind[0])
    const pairCards = cards.filter(card => card.rank === pair[0])
    
    return {
      rank: 'full-house',
      score: 6000000 + getRankValue(threeOfKind[0]) * 10000 + getRankValue(pair[0]) * 100,
      cards: [...threeCards, ...pairCards],
      description: `Full House, ${threeOfKind[0]}s over ${pair[0]}s`
    }
  }
  
  return null
}

export function checkFlush(cards: Card[]): HandEvaluation | null {
  const suitCounts = getSuitCounts(cards)
  
  for (const [suit, count] of Object.entries(suitCounts)) {
    if (count >= 5) {
      const flushCards = cards.filter(card => card.suit === suit).slice(0, 5)
      
      return {
        rank: 'flush',
        score: 5000000 + getHighCardScore(flushCards),
        cards: flushCards,
        description: `Flush, ${suit}`
      }
    }
  }
  
  return null
}

export function checkStraight(cards: Card[]): HandEvaluation | null {
  const sortedCards = [...cards].sort((a, b) => b.value - a.value)
  
  // Check for regular straight
  for (let i = 0; i <= sortedCards.length - 5; i++) {
    const segment = sortedCards.slice(i, i + 5)
    
    if (isStraightSegment(segment)) {
      return {
        rank: 'straight',
        score: 4000000 + segment[0].value * 10000,
        cards: segment,
        description: `Straight, ${segment[0].rank} high`
      }
    }
  }
  
  // Check for A-2-3-4-5 straight (wheel)
  const hasAce = sortedCards.some(card => card.value === 14)
  const hasTwo = sortedCards.some(card => card.value === 2)
  const hasThree = sortedCards.some(card => card.value === 3)
  const hasFour = sortedCards.some(card => card.value === 4)
  const hasFive = sortedCards.some(card => card.value === 5)
  
  if (hasAce && hasTwo && hasThree && hasFour && hasFive) {
    const wheelCards = [
      sortedCards.find(card => card.value === 5)!,
      sortedCards.find(card => card.value === 4)!,
      sortedCards.find(card => card.value === 3)!,
      sortedCards.find(card => card.value === 2)!,
      sortedCards.find(card => card.value === 14)!
    ]
    
    return {
      rank: 'straight',
      score: 4000000 + 5 * 10000, // 5-high straight
      cards: wheelCards,
      description: 'Straight, 5 high'
    }
  }
  
  return null
}

export function checkThreeOfAKind(cards: Card[]): HandEvaluation | null {
  const rankCounts = getRankCounts(cards)
  
  for (const [rank, count] of Object.entries(rankCounts)) {
    if (count === 3) {
      const threeCards = cards.filter(card => card.rank === rank)
      const kickers = cards.filter(card => card.rank !== rank).slice(0, 2)
      
      return {
        rank: 'three-of-a-kind',
        score: 3000000 + getRankValue(rank) * 10000 + getKickerScore(kickers),
        cards: [...threeCards, ...kickers],
        description: `Three of a Kind, ${rank}s`
      }
    }
  }
  
  return null
}

export function checkTwoPair(cards: Card[]): HandEvaluation | null {
  const rankCounts = getRankCounts(cards)
  const pairs = Object.entries(rankCounts).filter(([_, count]) => count === 2)
  
  if (pairs.length >= 2) {
    // Sort pairs by rank (higher pair first)
    pairs.sort((a, b) => getRankValue(b[0]) - getRankValue(a[0]))
    
    const firstPair = cards.filter(card => card.rank === pairs[0][0]).slice(0, 2)
    const secondPair = cards.filter(card => card.rank === pairs[1][0]).slice(0, 2)
    const kicker = cards.find(card => card.rank !== pairs[0][0] && card.rank !== pairs[1][0])!
    
    return {
      rank: 'two-pair',
      score: 2000000 + getRankValue(pairs[0][0]) * 10000 + getRankValue(pairs[1][0]) * 100 + kicker.value,
      cards: [...firstPair, ...secondPair, kicker],
      description: `Two Pair, ${pairs[0][0]}s and ${pairs[1][0]}s`
    }
  }
  
  return null
}

export function checkPair(cards: Card[]): HandEvaluation | null {
  const rankCounts = getRankCounts(cards)
  
  for (const [rank, count] of Object.entries(rankCounts)) {
    if (count === 2) {
      const pairCards = cards.filter(card => card.rank === rank)
      const kickers = cards.filter(card => card.rank !== rank).slice(0, 3)
      
      return {
        rank: 'pair',
        score: 1000000 + getRankValue(rank) * 10000 + getKickerScore(kickers),
        cards: [...pairCards, ...kickers],
        description: `Pair of ${rank}s`
      }
    }
  }
  
  return null
}

export function checkHighCard(cards: Card[]): HandEvaluation {
  const sortedCards = [...cards].sort((a, b) => b.value - a.value)
  const highCards = sortedCards.slice(0, 5)
  
  return {
    rank: 'high-card',
    score: getHighCardScore(highCards),
    cards: highCards,
    description: `High Card, ${highCards[0].rank}`
  }
}

export function compareHands(playerCards: Card[], dealerCards: Card[]): HandComparison {
  const playerHand = evaluateHand(playerCards)
  const dealerHand = evaluateHand(dealerCards)
  
  if (playerHand.score > dealerHand.score) {
    return {
      winner: 'player',
      playerHand,
      dealerHand,
      difference: playerHand.score - dealerHand.score
    }
  } else if (dealerHand.score > playerHand.score) {
    return {
      winner: 'dealer',
      playerHand,
      dealerHand,
      difference: dealerHand.score - playerHand.score
    }
  } else {
    return {
      winner: 'tie',
      playerHand,
      dealerHand,
      difference: 0
    }
  }
}

// Helper functions
function getCombinations<T>(array: T[], size: number): T[][] {
  const result: T[][] = []
  
  function combine(start: number, combo: T[]): void {
    if (combo.length === size) {
      result.push([...combo])
      return
    }
    
    for (let i = start; i < array.length; i++) {
      combo.push(array[i])
      combine(i + 1, combo)
      combo.pop()
    }
  }
  
  combine(0, [])
  return result
}

function getRankCounts(cards: Card[]): Record<string, number> {
  const counts: Record<string, number> = {}
  
  cards.forEach(card => {
    counts[card.rank] = (counts[card.rank] || 0) + 1
  })
  
  return counts
}

function getSuitCounts(cards: Card[]): Record<string, number> {
  const counts: Record<string, number> = {}
  
  cards.forEach(card => {
    counts[card.suit] = (counts[card.suit] || 0) + 1
  })
  
  return counts
}

function getRankValue(rank: string): number {
  const values: Record<string, number> = {
    'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2
  }
  
  return values[rank] || 0
}

function getHighCardScore(cards: Card[]): number {
  return cards.reduce((score, card, index) => {
    return score + card.value * Math.pow(100, 4 - index)
  }, 0)
}

function getKickerScore(kickers: Card[]): number {
  return kickers.reduce((score, kicker, index) => {
    return score + kicker.value * Math.pow(100, 2 - index)
  }, 0)
}

function isStraightSegment(cards: Card[]): boolean {
  for (let i = 0; i < cards.length - 1; i++) {
    if (cards[i].value - cards[i + 1].value !== 1) {
      return false
    }
  }
  
  return true
}

export function getHandRankDisplay(rank: HandRank): string {
  return HAND_DESCRIPTIONS[rank]
}

export function getHandStrength(hand: HandEvaluation): 'weak' | 'medium' | 'strong' | 'very-strong' {
  const rankIndex = HAND_RANKINGS.indexOf(hand.rank)
  
  if (rankIndex <= 2) return 'weak'
  if (rankIndex <= 4) return 'medium'
  if (rankIndex <= 6) return 'strong'
  return 'very-strong'
}

export function getHandStrengthColor(strength: 'weak' | 'medium' | 'strong' | 'very-strong'): string {
  switch (strength) {
    case 'weak': return 'text-red-400'
    case 'medium': return 'text-yellow-400'
    case 'strong': return 'text-emerald-400'
    case 'very-strong': return 'text-purple-400'
    default: return 'text-white'
  }
}

export function formatHandEvaluation(evaluation: HandEvaluation): {
  rank: string
  description: string
  cards: string[]
  strength: 'weak' | 'medium' | 'strong' | 'very-strong'
  color: string
} {
  const strength = getHandStrength(evaluation)
  
  return {
    rank: evaluation.rank,
    description: evaluation.description,
    cards: evaluation.cards.map(card => `${card.rank}${card.suit.charAt(0).toUpperCase()}`),
    strength,
    color: getHandStrengthColor(strength)
  }
}

export function isWinningHand(playerHand: HandEvaluation, dealerHand: HandEvaluation): boolean {
  return playerHand.score > dealerHand.score
}

export function getHandOdds(handRank: HandRank): number {
  // Approximate odds for getting each hand in Texas Hold'em
  const odds: Record<HandRank, number> = {
    'high-card': 0.501177,
    'pair': 0.422569,
    'two-pair': 0.047539,
    'three-of-a-kind': 0.021128,
    'straight': 0.003925,
    'flush': 0.001965,
    'full-house': 0.001441,
    'four-of-a-kind': 0.000240,
    'straight-flush': 0.000015,
    'royal-flush': 0.000001
  }
  
  return odds[handRank] || 0
}
