export interface BetSlipItem {
  id: string
  matchId: string
  matchName: string
  market: string
  outcome: string
  odds: number
  bookmaker: string
  stake: number
  type: 'back' | 'lay'
}

export interface PlacedBet {
  id: string
  userId: string
  matchId: string
  matchName: string
  market: string
  outcome: string
  odds: number
  stake: number
  type: 'back' | 'lay'
  status: 'pending' | 'won' | 'lost' | 'void'
  exposure: number
  placedAt: Date
  settledAt?: Date
  potentialWin: number
  liability?: number
}

class BettingService {
  private bets: PlacedBet[] = []
  private betIdCounter = 1

  // Generate unique bet ID
  private generateBetId(): string {
    return `bet_${this.betIdCounter++}_${Date.now()}`
  }

  // Calculate potential win for back bet
  private calculatePotentialWin(stake: number, odds: number): number {
    return stake * (odds - 1)
  }

  // Calculate liability for lay bet
  private calculateLiability(stake: number, odds: number): number {
    return stake * (odds - 1)
  }

  // Place a single bet
  async placeBet(item: BetSlipItem, userId: string): Promise<PlacedBet> {
    const betId = this.generateBetId()
    
    const bet: PlacedBet = {
      id: betId,
      userId,
      matchId: item.matchId,
      matchName: item.matchName,
      market: item.market,
      outcome: item.outcome,
      odds: item.odds,
      stake: item.stake,
      type: item.type,
      status: 'pending',
      exposure: item.type === 'lay' ? this.calculateLiability(item.stake, item.odds) : item.stake,
      placedAt: new Date(),
      potentialWin: item.type === 'back' ? this.calculatePotentialWin(item.stake, item.odds) : 0,
      liability: item.type === 'lay' ? this.calculateLiability(item.stake, item.odds) : undefined
    }

    this.bets.push(bet)
    return bet
  }

  // Place multiple bets (for bet slip)
  async placeMultipleBets(items: BetSlipItem[], userId: string): Promise<PlacedBet[]> {
    const placedBets: PlacedBet[] = []
    
    for (const item of items) {
      try {
        const bet = await this.placeBet(item, userId)
        placedBets.push(bet)
      } catch (error) {
        console.error('Failed to place bet:', error)
        throw error
      }
    }
    
    return placedBets
  }

  // Get user's bets
  getUserBets(userId: string): PlacedBet[] {
    return this.bets.filter(bet => bet.userId === userId)
  }

  // Get user's active bets
  getActiveBets(userId: string): PlacedBet[] {
    return this.bets.filter(bet => bet.userId === userId && bet.status === 'pending')
  }

  // Get user's settled bets
  getSettledBets(userId: string): PlacedBet[] {
    return this.bets.filter(bet => bet.userId === userId && ['won', 'lost', 'void'].includes(bet.status))
  }

  // Settle a bet (called when match result is known)
  settleBet(betId: string, result: 'won' | 'lost' | 'void'): void {
    const bet = this.bets.find(b => b.id === betId)
    if (bet && bet.status === 'pending') {
      bet.status = result
      bet.settledAt = new Date()
    }
  }

  // Get total exposure for a user
  getUserExposure(userId: string): number {
    return this.bets
      .filter(bet => bet.userId === userId && bet.status === 'pending')
      .reduce((total, bet) => total + bet.exposure, 0)
  }

  // Get profit/loss for settled bets
  getUserProfitLoss(userId: string): number {
    return this.bets
      .filter(bet => bet.userId === userId && ['won', 'lost'].includes(bet.status))
      .reduce((total, bet) => {
        if (bet.status === 'won') {
          return total + bet.potentialWin
        } else {
          return total - bet.stake
        }
      }, 0)
  }

  // Validate bet before placing
  validateBet(item: BetSlipItem, balance: number): { isValid: boolean; error?: string } {
    if (item.stake <= 0) {
      return { isValid: false, error: 'Stake must be greater than 0' }
    }

    const requiredBalance = item.type === 'lay' 
      ? item.stake + this.calculateLiability(item.stake, item.odds)
      : item.stake

    if (requiredBalance > balance) {
      return { isValid: false, error: 'Insufficient balance' }
    }

    if (item.odds <= 1) {
      return { isValid: false, error: 'Invalid odds' }
    }

    return { isValid: true }
  }

  // Calculate total stake for bet slip
  calculateTotalStake(items: BetSlipItem[]): number {
    return items.reduce((total, item) => total + item.stake, 0)
  }

  // Calculate total potential win for bet slip
  calculateTotalPotentialWin(items: BetSlipItem[]): number {
    return items
      .filter(item => item.type === 'back')
      .reduce((total, item) => total + this.calculatePotentialWin(item.stake, item.odds), 0)
  }

  // Calculate total liability for bet slip
  calculateTotalLiability(items: BetSlipItem[]): number {
    return items
      .filter(item => item.type === 'lay')
      .reduce((total, item) => total + this.calculateLiability(item.stake, item.odds), 0)
  }

  // Get required balance for bet slip
  getRequiredBalance(items: BetSlipItem[]): number {
    return items.reduce((total, item) => {
      if (item.type === 'lay') {
        return total + item.stake + this.calculateLiability(item.stake, item.odds)
      }
      return total + item.stake
    }, 0)
  }
}

// Export singleton instance
export const bettingService = new BettingService()

// Utility functions
export const formatOdds = (odds: number): string => {
  return odds.toFixed(2)
}

export const formatProfit = (profit: number): string => {
  return profit >= 0 ? `+${profit.toFixed(2)}` : profit.toFixed(2)
}

export const getProfitColor = (profit: number): string => {
  if (profit > 0) return 'text-[#22c55e]'
  if (profit < 0) return 'text-[#ef4444]'
  return 'text-white'
}
