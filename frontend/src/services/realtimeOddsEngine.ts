import { MatchData } from '@/components/sports/MatchCard'

export interface OddsChange {
  matchId: string
  market: string
  outcome: string
  oldOdds: number
  newOdds: number
  bookmaker: string
  changeType: 'increase' | 'decrease'
}

export interface RealtimeOddsUpdate {
  timestamp: Date
  changes: OddsChange[]
  matches: MatchData[]
}

class RealtimeOddsEngine {
  private previousData: MatchData[] = []
  private pollingInterval: NodeJS.Timeout | null = null
  private isPolling = false
  private subscribers: Set<(update: RealtimeOddsUpdate) => void> = new Set()
  private pollInterval = 5000 // 5 seconds

  // Subscribe to odds updates
  subscribe(callback: (update: RealtimeOddsUpdate) => void): () => void {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  // Start polling
  startPolling(fetchFunction: () => Promise<MatchData[]>): void {
    if (this.isPolling) return

    this.isPolling = true
    this.pollingInterval = setInterval(async () => {
      try {
        const newData = await fetchFunction()
        const changes = this.detectChanges(this.previousData, newData)
        
        if (changes.length > 0) {
          const update: RealtimeOddsUpdate = {
            timestamp: new Date(),
            changes,
            matches: newData
          }

          // Notify all subscribers
          this.subscribers.forEach(callback => callback(update))
        }

        this.previousData = [...newData]
      } catch (error) {
        console.error('Error polling odds:', error)
      }
    }, this.pollInterval)
  }

  // Stop polling
  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
    this.isPolling = false
  }

  // Detect odds changes between previous and new data
  private detectChanges(previousData: MatchData[], newData: MatchData[]): OddsChange[] {
    const changes: OddsChange[] = []

    // Create maps for efficient lookup
    const previousMap = new Map(previousData.map(m => [m.id, m]))
    const newMap = new Map(newData.map(m => [m.id, m]))

    // Check for changes in existing matches
    for (const [matchId, newMatch] of newMap) {
      const previousMatch = previousMap.get(matchId)
      
      if (!previousMatch) continue // New match, not a change

      // Compare bookmakers and markets
      const previousBookmakers = new Map(
        previousMatch.bookmakers.map(b => [b.key, b])
      )
      const newBookmakers = new Map(
        newMatch.bookmakers.map(b => [b.key, b])
      )

      for (const [bookmakerKey, newBookmaker] of newBookmakers) {
        const previousBookmaker = previousBookmakers.get(bookmakerKey)
        
        if (!previousBookmaker) continue // New bookmaker

        // Compare markets
        const previousMarkets = new Map(
          previousBookmaker.markets.map(m => [m.key, m])
        )
        const newMarkets = new Map(
          newBookmaker.markets.map(m => [m.key, m])
        )

        for (const [marketKey, newMarket] of newMarkets) {
          const previousMarket = previousMarkets.get(marketKey)
          
          if (!previousMarket) continue // New market

          // Compare outcomes
          const previousOutcomes = new Map(
            previousMarket.outcomes.map(o => [o.name, o])
          )
          const newOutcomes = new Map(
            newMarket.outcomes.map(o => [o.name, o])
          )

          for (const [outcomeName, newOutcome] of newOutcomes) {
            const previousOutcome = previousOutcomes.get(outcomeName)
            
            if (!previousOutcome) continue // New outcome

            // Check for odds change
            if (previousOutcome.price !== newOutcome.price) {
              changes.push({
                matchId,
                market: marketKey,
                outcome: outcomeName,
                oldOdds: previousOutcome.price,
                newOdds: newOutcome.price,
                bookmaker: newBookmaker.title,
                changeType: newOutcome.price > previousOutcome.price ? 'increase' : 'decrease'
              })
            }
          }
        }
      }
    }

    return changes
  }

  // Set polling interval
  setPollInterval(interval: number): void {
    this.pollInterval = interval
    if (this.isPolling) {
      this.stopPolling()
      // Note: Caller needs to restart polling with new interval
    }
  }

  // Get current polling status
  getPollingStatus(): { isPolling: boolean; interval: number; subscriberCount: number } {
    return {
      isPolling: this.isPolling,
      interval: this.pollInterval,
      subscriberCount: this.subscribers.size
    }
  }

  // Force immediate check
  async forceCheck(fetchFunction: () => Promise<MatchData[]>): Promise<RealtimeOddsUpdate | null> {
    try {
      const newData = await fetchFunction()
      const changes = this.detectChanges(this.previousData, newData)
      
      this.previousData = [...newData]

      if (changes.length > 0) {
        const update: RealtimeOddsUpdate = {
          timestamp: new Date(),
          changes,
          matches: newData
        }
        return update
      }

      return null
    } catch (error) {
      console.error('Error in force check:', error)
      return null
    }
  }

  // Clear previous data (useful for initial load)
  clearPreviousData(): void {
    this.previousData = []
  }

  // Get odds change statistics
  getChangeStats(changes: OddsChange[]): {
    totalChanges: number
    increases: number
    decreases: number
    affectedMatches: number
    affectedMarkets: string[]
  } {
    const totalChanges = changes.length
    const increases = changes.filter(c => c.changeType === 'increase').length
    const decreases = changes.filter(c => c.changeType === 'decrease').length
    const affectedMatches = new Set(changes.map(c => c.matchId)).size
    const affectedMarkets = Array.from(new Set(changes.map(c => c.market)))

    return {
      totalChanges,
      increases,
      decreases,
      affectedMatches,
      affectedMarkets
    }
  }
}

// Export singleton instance
export const realtimeOddsEngine = new RealtimeOddsEngine()

// Utility functions for UI
export const getChangeColor = (changeType: 'increase' | 'decrease'): string => {
  return changeType === 'increase' ? 'text-[#22c55e]' : 'text-[#ef4444]'
}

export const getChangeIcon = (changeType: 'increase' | 'decrease'): string => {
  return changeType === 'increase' ? 'arrow_up' : 'arrow_down'
}

export const formatChange = (oldOdds: number, newOdds: number): string => {
  const diff = newOdds - oldOdds
  const percent = (diff / oldOdds) * 100
  return `${diff >= 0 ? '+' : ''}${diff.toFixed(2)} (${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%)`
}
