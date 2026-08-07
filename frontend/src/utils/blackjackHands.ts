/**
 * Blackjack hand evaluation engine
 * Handles hard/soft totals, ace adjustment logic, and hand comparisons
 */

import type { Card } from './blackjackDeck'

export interface HandValue {
  total: number
  soft: boolean
  bust: boolean
  blackjack: boolean
  description: string
}

export interface Hand {
  cards: Card[]
  value: HandValue
  bet: number
  status: 'active' | 'stand' | 'bust' | 'blackjack'
  doubledDown?: boolean
  splitFrom?: string
}

export interface SplitHand {
  id: string
  hands: Hand[]
  currentHandIndex: number
  totalBet: number
}

export function calculateHandValue(cards: Card[]): HandValue {
  if (cards.length === 0) {
    return {
      total: 0,
      soft: false,
      bust: false,
      blackjack: false,
      description: 'Empty'
    }
  }
  
  let total = 0
  let aces = 0
  
  // First, calculate total treating all aces as 11
  for (const card of cards) {
    total += card.value
    if (card.rank === 'A') {
      aces++
    }
  }
  
  // Then adjust for aces if bust
  let soft = aces > 0
  let adjustedTotal = total
  
  while (adjustedTotal > 21 && aces > 0) {
    adjustedTotal -= 10 // Convert ace from 11 to 1
    aces--
    soft = aces > 0 // Still soft if we have aces counting as 11
  }
  
  const bust = adjustedTotal > 21
  const blackjack = cards.length === 2 && adjustedTotal === 21
  
  let description = String(adjustedTotal)
  if (soft && !bust) {
    description += ' (soft)'
  }
  
  return {
    total: adjustedTotal,
    soft: soft && !bust,
    bust,
    blackjack,
    description
  }
}

export function isBlackjack(cards: Card[]): boolean {
  if (cards.length !== 2) return false
  
  const hasAce = cards.some(card => card.rank === 'A')
  const hasTenValue = cards.some(card => ['10', 'J', 'Q', 'K'].includes(card.rank))
  
  return hasAce && hasTenValue
}

export function isBust(cards: Card[]): boolean {
  const value = calculateHandValue(cards)
  return value.bust
}

export function isSoft(cards: Card[]): boolean {
  const value = calculateHandValue(cards)
  return value.soft
}

export function canDoubleDown(cards: Card[]): boolean {
  return cards.length === 2 && !isBust(cards)
}

export function canSplit(cards: Card[]): boolean {
  if (cards.length !== 2) return false
  
  const [card1, card2] = cards
  return card1.rank === card2.rank
}

export function canTakeInsurance(dealerUpCard: Card): boolean {
  return dealerUpCard.rank === 'A'
}

export function shouldOfferInsurance(dealerUpCard: Card): boolean {
  return dealerUpCard.rank === 'A'
}

export function getHandRecommendation(playerCards: Card[], dealerUpCard: Card): string {
  const playerValue = calculateHandValue(playerCards)
  const dealerValue = dealerUpCard.value
  
  // Basic strategy recommendations
  if (playerValue.bust) return 'Bust'
  if (playerValue.blackjack) return 'Blackjack!'
  
  // Hard totals
  if (!playerValue.soft) {
    if (playerValue.total <= 11) return 'Hit'
    if (playerValue.total >= 17) return 'Stand'
    
    // Hard 12-16
    if (playerValue.total >= 12 && playerValue.total <= 16) {
      if (dealerValue >= 7) return 'Hit'
      return 'Stand'
    }
  }
  
  // Soft totals
  if (playerValue.soft) {
    if (playerValue.total <= 17) return 'Hit'
    if (playerValue.total >= 19) return 'Stand'
    
    // Soft 18
    if (playerValue.total === 18) {
      if (dealerValue >= 9 || dealerValue === 1) return 'Hit'
      return 'Stand'
    }
  }
  
  return 'Stand'
}

export function compareHands(playerValue: HandValue, dealerValue: HandValue): 'win' | 'lose' | 'push' {
  // Check for blackjacks
  if (playerValue.blackjack && !dealerValue.blackjack) return 'win'
  if (!playerValue.blackjack && dealerValue.blackjack) return 'lose'
  if (playerValue.blackjack && dealerValue.blackjack) return 'push'
  
  // Check for busts
  if (playerValue.bust && dealerValue.bust) return 'push' // Both bust - push (rare case)
  if (playerValue.bust) return 'lose'
  if (dealerValue.bust) return 'win'
  
  // Compare totals
  if (playerValue.total > dealerValue.total) return 'win'
  if (playerValue.total < dealerValue.total) return 'lose'
  return 'push'
}

export function getPayoutMultiplier(result: 'win' | 'lose' | 'push', playerBlackjack: boolean): number {
  if (result === 'lose') return 0
  if (result === 'push') return 1
  if (playerBlackjack) return 2.5 // 3:2 payout
  return 2 // 1:1 payout
}

export function calculatePayout(
  bet: number,
  playerValue: HandValue,
  dealerValue: HandValue
): {
  result: 'win' | 'lose' | 'push'
  payout: number
  profit: number
  multiplier: number
} {
  const result = compareHands(playerValue, dealerValue)
  const multiplier = getPayoutMultiplier(result, playerValue.blackjack)
  const payout = bet * multiplier
  const profit = payout - bet
  
  return {
    result,
    payout,
    profit,
    multiplier
  }
}

export function createHand(cards: Card[], bet: number): Hand {
  const value = calculateHandValue(cards)
  
  return {
    cards,
    value,
    bet,
    status: value.bust ? 'bust' : value.blackjack ? 'blackjack' : 'active'
  }
}

export function addCardToHand(hand: Hand, card: Card): Hand {
  const newCards = [...hand.cards, card]
  const newValue = calculateHandValue(newCards)
  
  return {
    ...hand,
    cards: newCards,
    value: newValue,
    status: newValue.bust ? 'bust' : newValue.blackjack ? 'blackjack' : hand.status
  }
}

export function standHand(hand: Hand): Hand {
  return {
    ...hand,
    status: 'stand'
  }
}

export function doubleDownHand(hand: Hand, card: Card): Hand {
  const newHand = addCardToHand(hand, card)
  return {
    ...newHand,
    bet: hand.bet * 2,
    status: newHand.value.bust ? 'bust' : 'stand',
    doubledDown: true
  }
}

export function splitHand(hand: Hand): SplitHand {
  if (!canSplit(hand.cards)) {
    throw new Error('Cannot split this hand')
  }
  
  const [card1, card2] = hand.cards
  const hand1 = createHand([card1], hand.bet)
  const hand2 = createHand([card2], hand.bet)
  
  return {
    id: `split-${Date.now()}`,
    hands: [hand1, hand2],
    currentHandIndex: 0,
    totalBet: hand.bet * 2
  }
}

export function getCurrentSplitHand(splitHand: SplitHand): Hand {
  return splitHand.hands[splitHand.currentHandIndex]
}

export function moveToNextSplitHand(splitHand: SplitHand): SplitHand {
  const nextIndex = splitHand.currentHandIndex + 1
  
  if (nextIndex >= splitHand.hands.length) {
    return splitHand // Already at the end
  }
  
  return {
    ...splitHand,
    currentHandIndex: nextIndex
  }
}

export function isSplitHandComplete(splitHand: SplitHand): boolean {
  return splitHand.hands.every(hand => 
    hand.status === 'stand' || hand.status === 'bust' || hand.status === 'blackjack'
  )
}

export function getAllSplitHandResults(splitHand: SplitHand): Array<{
  hand: Hand
  result: 'win' | 'lose' | 'push'
  payout: number
  profit: number
}> {
  return splitHand.hands.map(hand => {
    // This would be called after dealer plays
    // For now, return placeholder
    return {
      hand,
      result: 'push' as const,
      payout: hand.bet,
      profit: 0
    }
  })
}

export function getHandStatusText(hand: Hand): string {
  if (hand.status === 'bust') return 'Bust'
  if (hand.status === 'blackjack') return 'Blackjack!'
  if (hand.status === 'stand') return 'Stand'
  return 'Active'
}

export function getHandStatusColor(hand: Hand): string {
  if (hand.status === 'bust') return 'text-red-500'
  if (hand.status === 'blackjack') return 'text-emerald-500'
  if (hand.status === 'stand') return 'text-blue-500'
  return 'text-gray-500'
}

export function formatHandValue(value: HandValue): string {
  return value.description
}

export function getHandTotal(cards: Card[]): number {
  return calculateHandValue(cards).total
}

export function getBestHandValue(cards: Card[]): HandValue {
  return calculateHandValue(cards)
}

export function canHit(hand: Hand): boolean {
  return hand.status === 'active' && !hand.value.bust
}

export function canStand(hand: Hand): boolean {
  return hand.status === 'active' && !hand.value.bust
}

export function canDouble(hand: Hand): boolean {
  return hand.status === 'active' && canDoubleDown(hand.cards)
}

export function hasSoftHand(cards: Card[]): boolean {
  return isSoft(cards)
}

export function getHandType(cards: Card[]): string {
  if (cards.length === 0) return 'Empty'
  if (isBlackjack(cards)) return 'Blackjack'
  if (isBust(cards)) return 'Bust'
  if (isSoft(cards)) return 'Soft'
  return 'Hard'
}

export function getHandStrength(cards: Card[]): number {
  const value = calculateHandValue(cards)
  if (value.bust) return 0
  if (value.blackjack) return 22 // Higher than any normal hand
  return value.total
}

export function shouldDealerHit(dealerCards: Card[], hitOnSoft17: boolean = false): boolean {
  const value = calculateHandValue(dealerCards)
  
  // Dealer must hit on 16 or less
  if (value.total <= 16) return true
  
  // Hit on soft 17 if configured
  if (value.total === 17 && value.soft && hitOnSoft17) return true
  
  return false
}

export function getDealerAction(dealerCards: Card[], hitOnSoft17: boolean = false): 'hit' | 'stand' {
  return shouldDealerHit(dealerCards, hitOnSoft17) ? 'hit' : 'stand'
}

export function evaluateInitialHands(playerCards: Card[], dealerCards: Card[]): {
  playerBlackjack: boolean
  dealerBlackjack: boolean
  immediateResult: 'player_blackjack' | 'dealer_blackjack' | 'push_blackjack' | null
} {
  const playerBlackjack = isBlackjack(playerCards)
  const dealerBlackjack = isBlackjack(dealerCards)
  
  let immediateResult: 'player_blackjack' | 'dealer_blackjack' | 'push_blackjack' | null = null
  
  if (playerBlackjack && dealerBlackjack) {
    immediateResult = 'push_blackjack'
  } else if (playerBlackjack) {
    immediateResult = 'player_blackjack'
  } else if (dealerBlackjack) {
    immediateResult = 'dealer_blackjack'
  }
  
  return {
    playerBlackjack,
    dealerBlackjack,
    immediateResult
  }
}

export function getInsurancePayout(dealerBlackjack: boolean, insuranceBet: number): number {
  return dealerBlackjack ? insuranceBet * 3 : 0 // 2:1 payout
}

export function formatPayout(payout: number): string {
  return payout.toFixed(2)
}

export function formatProfit(profit: number): string {
  const sign = profit >= 0 ? '+' : ''
  return `${sign}${profit.toFixed(2)}`
}
