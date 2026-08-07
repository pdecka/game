/**
 * Baccarat rules engine with exact third card logic
 * Implements the precise baccarat drawing rules as specified in casino standards
 */

import type { Card } from './baccaratDeck'
import { calculateBaccaratTotal, isNatural, getRankValue } from './baccaratDeck'

export type BetType = 'player' | 'banker' | 'tie' | 'playerPair' | 'bankerPair' | 'superSix'

export interface BaccaratHand {
  cards: Card[]
  total: number
  natural: boolean
  description: string
}

export interface ThirdCardDecision {
  shouldDraw: boolean
  reason: string
}

export interface GameResult {
  winner: 'player' | 'banker' | 'tie'
  playerTotal: number
  bankerTotal: number
  playerNatural: boolean
  bankerNatural: boolean
  thirdCardDrawn: boolean
  playerThirdCard?: Card
  bankerThirdCard?: Card
  playerHand?: BaccaratHand
  bankerHand?: BaccaratHand
}

export interface PayoutInfo {
  betType: BetType
  won: boolean
  payout: number
  profit: number
  commission?: number
}

// Payout configurations (can be made configurable)
export const PAYOUT_CONFIG = {
  player: 1,      // 1:1
  banker: 0.95,   // 1:1 with 5% commission
  tie: 8,         // 8:1
  playerPair: 11, // 11:1
  bankerPair: 11, // 11:1
  superSix: 12    // 12:1 (banker wins with 6)
}

export function createBaccaratHand(cards: Card[]): BaccaratHand {
  const total = calculateBaccaratTotal(cards)
  const natural = isNatural(total)
  
  return {
    cards,
    total,
    natural,
    description: natural ? `Natural ${total}` : total.toString()
  }
}

// PLAYER THIRD CARD RULES
export function shouldPlayerDrawCard(hand: BaccaratHand): ThirdCardDecision {
  if (hand.natural) {
    return {
      shouldDraw: false,
      reason: 'Natural hand - no third card'
    }
  }
  
  if (hand.total <= 5) {
    return {
      shouldDraw: true,
      reason: `Player total ${hand.total} <= 5 - must draw`
    }
  }
  
  return {
    shouldDraw: false,
    reason: `Player total ${hand.total} >= 6 - must stand`
  }
}

// BANKER THIRD CARD RULES - EXACT IMPLEMENTATION
export function shouldBankerDrawCard(
  bankerHand: BaccaratHand, 
  playerHand: BaccaratHand, 
  playerThirdCard?: Card
): ThirdCardDecision {
  
  // Natural hand - no draw
  if (bankerHand.natural) {
    return {
      shouldDraw: false,
      reason: 'Natural hand - no third card'
    }
  }
  
  // If player stands (no third card)
  if (!playerThirdCard) {
    if (bankerHand.total <= 5) {
      return {
        shouldDraw: true,
        reason: `Player stood, banker total ${bankerHand.total} <= 5 - must draw`
      }
    }
    
    return {
      shouldDraw: false,
      reason: `Player stood, banker total ${bankerHand.total} >= 6 - must stand`
    }
  }
  
  // Player drew a third card - apply complex banker rules
  const playerCardValue = getRankValue(playerThirdCard.rank)
  
  // Banker draws with 0-2 regardless of player's third card
  if (bankerHand.total <= 2) {
    return {
      shouldDraw: true,
      reason: `Banker total ${bankerHand.total} <= 2 - always draw`
    }
  }
  
  // Banker total 3 - draw unless player third card is 8
  if (bankerHand.total === 3) {
    if (playerCardValue === 8) {
      return {
        shouldDraw: false,
        reason: 'Banker total 3, player third card 8 - must stand'
      }
    }
    return {
      shouldDraw: true,
      reason: 'Banker total 3, player third card not 8 - must draw'
    }
  }
  
  // Banker total 4 - draw if player third card is 2-7
  if (bankerHand.total === 4) {
    if (playerCardValue >= 2 && playerCardValue <= 7) {
      return {
        shouldDraw: true,
        reason: `Banker total 4, player third card ${playerCardValue} (2-7) - must draw`
      }
    }
    return {
      shouldDraw: false,
      reason: `Banker total 4, player third card ${playerCardValue} (not 2-7) - must stand`
    }
  }
  
  // Banker total 5 - draw if player third card is 4-7
  if (bankerHand.total === 5) {
    if (playerCardValue >= 4 && playerCardValue <= 7) {
      return {
        shouldDraw: true,
        reason: `Banker total 5, player third card ${playerCardValue} (4-7) - must draw`
      }
    }
    return {
      shouldDraw: false,
      reason: `Banker total 5, player third card ${playerCardValue} (not 4-7) - must stand`
    }
  }
  
  // Banker total 6 - draw if player third card is 6-7
  if (bankerHand.total === 6) {
    if (playerCardValue === 6 || playerCardValue === 7) {
      return {
        shouldDraw: true,
        reason: `Banker total 6, player third card ${playerCardValue} (6-7) - must draw`
      }
    }
    return {
      shouldDraw: false,
      reason: `Banker total 6, player third card ${playerCardValue} (not 6-7) - must stand`
    }
  }
  
  // Banker total 7+ - always stand
  return {
    shouldDraw: false,
    reason: `Banker total ${bankerHand.total} >= 7 - must stand`
  }
}

// Determine game result
export function determineGameResult(
  playerHand: BaccaratHand,
  bankerHand: BaccaratHand,
  playerThirdCard?: Card,
  bankerThirdCard?: Card
): GameResult {
  
  const winner = playerHand.total > bankerHand.total ? 'player' :
                 playerHand.total < bankerHand.total ? 'banker' : 'tie'
  
  return {
    winner,
    playerTotal: playerHand.total,
    bankerTotal: bankerHand.total,
    playerNatural: playerHand.natural,
    bankerNatural: bankerHand.natural,
    thirdCardDrawn: !!(playerThirdCard || bankerThirdCard),
    playerThirdCard,
    bankerThirdCard
  }
}

// Calculate payouts for all bet types
export function calculatePayouts(
  result: GameResult,
  betAmount: number,
  betTypes: BetType[],
  config: typeof PAYOUT_CONFIG = PAYOUT_CONFIG
): PayoutInfo[] {
  
  const payouts: PayoutInfo[] = []
  
  for (const betType of betTypes) {
    let won = false
    let payout = 0
    let commission = 0
    
    switch (betType) {
      case 'player':
        won = result.winner === 'player'
        payout = won ? betAmount * (1 + config.player) : 0
        break
        
      case 'banker':
        won = result.winner === 'banker'
        if (won) {
          // Check for Super Six
          if (result.bankerTotal === 6) {
            payout = betAmount * (1 + config.superSix)
          } else {
            payout = betAmount * (1 + config.banker)
            commission = betAmount * 0.05 // 5% commission
          }
        }
        break
        
      case 'tie':
        won = result.winner === 'tie'
        payout = won ? betAmount * (1 + config.tie) : 0
        break
        
      case 'playerPair':
        won = result.playerHand?.cards.length === 2 && 
              result.playerHand.cards[0].rank === result.playerHand.cards[1].rank
        payout = won ? betAmount * (1 + config.playerPair) : 0
        break
        
      case 'bankerPair':
        won = result.bankerHand?.cards.length === 2 && 
              result.bankerHand.cards[0].rank === result.bankerHand.cards[1].rank
        payout = won ? betAmount * (1 + config.bankerPair) : 0
        break
        
      case 'superSix':
        won = result.winner === 'banker' && result.bankerTotal === 6
        payout = won ? betAmount * (1 + config.superSix) : 0
        break
    }
    
    payouts.push({
      betType,
      won,
      payout,
      profit: payout - betAmount,
      commission: commission > 0 ? commission : undefined
    })
  }
  
  return payouts
}

// Check for pairs
export function hasPair(hand: BaccaratHand): boolean {
  if (hand.cards.length !== 2) return false
  return hand.cards[0].rank === hand.cards[1].rank
}

// Get hand statistics
export function getHandStats(hand: BaccaratHand): {
  total: number
  natural: boolean
  highCards: number
  lowCards: number
  zeroCards: number
  aces: number
} {
  const highCards = hand.cards.filter(card => card.value >= 7 && card.value <= 9).length
  const lowCards = hand.cards.filter(card => card.value >= 2 && card.value <= 6).length
  const zeroCards = hand.cards.filter(card => card.value === 0).length
  const aces = hand.cards.filter(card => card.rank === 'A').length
  
  return {
    total: hand.total,
    natural: hand.natural,
    highCards,
    lowCards,
    zeroCards,
    aces
  }
}

// Validate bet amounts
export function validateBet(betAmount: number, minBet: number, maxBet: number): {
  isValid: boolean
  error?: string
} {
  if (betAmount <= 0) {
    return { isValid: false, error: 'Bet amount must be greater than 0' }
  }
  
  if (betAmount < minBet) {
    return { isValid: false, error: `Minimum bet is ${minBet}` }
  }
  
  if (betAmount > maxBet) {
    return { isValid: false, error: `Maximum bet is ${maxBet}` }
  }
  
  return { isValid: true }
}

// Get recommended action (for educational purposes)
export function getRecommendedAction(
  playerHand: BaccaratHand,
  bankerHand: BaccaratHand
): {
  playerAction: string
  bankerAction: string
  reasoning: string
} {
  const playerDecision = shouldPlayerDrawCard(playerHand)
  let bankerAction = 'Unknown'
  let reasoning = ''
  
  if (playerHand.natural || bankerHand.natural) {
    reasoning = 'Natural hand detected - no third cards drawn'
    bankerAction = 'Stand (Natural)'
  } else {
    // Simulate what would happen
    if (playerDecision.shouldDraw) {
      reasoning += 'Player will draw third card. '
      // Banker action depends on what player draws
      bankerAction = 'Depends on player third card'
    } else {
      reasoning += 'Player will stand. '
      const bankerDecision = shouldBankerDrawCard(bankerHand, playerHand)
      bankerAction = bankerDecision.shouldDraw ? 'Draw' : 'Stand'
      reasoning += `Banker will ${bankerDecision.shouldDraw ? 'draw' : 'stand'} because ${bankerDecision.reason.toLowerCase()}.`
    }
  }
  
  return {
    playerAction: playerDecision.shouldDraw ? 'Draw' : 'Stand',
    bankerAction,
    reasoning
  }
}

// Format payout information
export function formatPayout(payout: PayoutInfo): string {
  if (!payout.won) return 'Lost'
  
  let result = `Won: ${payout.profit.toFixed(2)}`
  if (payout.commission) {
    result += ` (Commission: ${payout.commission.toFixed(2)})`
  }
  return result
}

// Get bet type display name
export function getBetTypeDisplay(betType: BetType): string {
  const displays: Record<BetType, string> = {
    player: 'Player',
    banker: 'Banker',
    tie: 'Tie',
    playerPair: 'Player Pair',
    bankerPair: 'Banker Pair',
    superSix: 'Super Six'
  }
  return displays[betType]
}

// Get bet type color
export function getBetTypeColor(betType: BetType): string {
  const colors: Record<BetType, string> = {
    player: 'text-blue-400',
    banker: 'text-red-400',
    tie: 'text-green-400',
    playerPair: 'text-purple-400',
    bankerPair: 'text-orange-400',
    superSix: 'text-yellow-400'
  }
  return colors[betType]
}

// Get result color
export function getResultColor(result: GameResult): string {
  switch (result.winner) {
    case 'player': return 'text-blue-400'
    case 'banker': return 'text-red-400'
    case 'tie': return 'text-green-400'
    default: return 'text-slate-400'
  }
}

// Get result emoji
export function getResultEmoji(result: GameResult): string {
  switch (result.winner) {
    case 'player': return 'ð'
    case 'banker': return 'ð'
    case 'tie': return 'ð'
    default: return 'â'
  }
}

// Check if result is a Super Six
export function isSuperSix(result: GameResult): boolean {
  return result.winner === 'banker' && result.bankerTotal === 6
}

// Get detailed result description
export function getResultDescription(result: GameResult): string {
  let description = `${result.winner.toUpperCase()} wins!`
  
  if (result.playerNatural || result.bankerNatural) {
    const naturals = []
    if (result.playerNatural) naturals.push('Player')
    if (result.bankerNatural) naturals.push('Banker')
    description += ` (${naturals.join(' & ')} Natural${naturals.length > 1 ? 's' : ''})`
  }
  
  if (result.thirdCardDrawn) {
    description += ' (Third card drawn)'
  }
  
  return description
}

// Calculate house edge for different bet types
export function getHouseEdge(betType: BetType, config: typeof PAYOUT_CONFIG = PAYOUT_CONFIG): number {
  // Simplified house edge calculations (actual values depend on specific rules)
  const houseEdges: Record<BetType, number> = {
    player: 0.0124,      // ~1.24%
    banker: 0.0106,      // ~1.06% (after commission)
    tie: 0.1436,         // ~14.36%
    playerPair: 0.1111, // ~11.11%
    bankerPair: 0.1111, // ~11.11%
    superSix: 0.1667    // ~16.67%
  }
  
  return houseEdges[betType]
}

// Validate game state
export function validateGameState(
  playerHand: BaccaratHand,
  bankerHand: BaccaratHand,
  playerThirdCard?: Card,
  bankerThirdCard?: Card
): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  // Check hand sizes
  if (playerHand.cards.length < 2 || playerHand.cards.length > 3) {
    errors.push('Player hand must have 2-3 cards')
  }
  
  if (bankerHand.cards.length < 2 || bankerHand.cards.length > 3) {
    errors.push('Banker hand must have 2-3 cards')
  }
  
  // Check totals
  const playerTotal = calculateBaccaratTotal(playerHand.cards)
  const bankerTotal = calculateBaccaratTotal(bankerHand.cards)
  
  if (playerTotal !== playerHand.total) {
    errors.push('Player hand total mismatch')
  }
  
  if (bankerTotal !== bankerHand.total) {
    errors.push('Banker hand total mismatch')
  }
  
  // Check natural rules
  if (playerHand.natural && playerThirdCard) {
    errors.push('Natural player hand should not have third card')
  }
  
  if (bankerHand.natural && bankerThirdCard) {
    errors.push('Natural banker hand should not have third card')
  }
  
  // Validate third card rules
  if (playerThirdCard && !shouldPlayerDrawCard(playerHand).shouldDraw) {
    errors.push('Player third card drawn when should stand')
  }
  
  if (bankerThirdCard) {
    const bankerDecision = shouldBankerDrawCard(bankerHand, playerHand, playerThirdCard)
    if (!bankerDecision.shouldDraw) {
      errors.push('Banker third card drawn when should stand')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
