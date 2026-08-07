'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import SportsLayout from '@/components/sports/SportsLayout'
import SportsSidebar from '@/components/sports/SportsSidebar'
import SportsHeader from '@/components/sports/SportsHeader'
import MatchList from '@/components/sports/MatchList'
import MatchDetails from '@/components/sports/MatchDetails'
import BetSlip from '@/components/sports/BetSlip'
import ErrorBoundary from '@/components/sports/ErrorBoundary'
import { EmptyState, ErrorState } from '@/components/sports/LoadingStates'
import { MatchData } from '@/components/sports/MatchCard'
import { sportsApi, SportCategory } from '@/services/sportsApi'
import { bettingService, BetSlipItem } from '@/services/bettingService'
import { realtimeOddsEngine, RealtimeOddsUpdate } from '@/services/realtimeOddsEngine'

export default function SportsPage() {
  const router = useRouter()
  
  const [matches, setMatches] = useState<MatchData[]>([])
  const [categories, setCategories] = useState<SportCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>()
  const [selectedMatch, setSelectedMatch] = useState<MatchData | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>()
  const [error, setError] = useState<string | null>(null)
  
  // Betting state
  const [betSlipItems, setBetSlipItems] = useState<BetSlipItem[]>([])
  const [isBetSlipOpen, setIsBetSlipOpen] = useState(false)
  const [isPlacingBets, setIsPlacingBets] = useState(false)
  const [userBalance, setUserBalance] = useState(10000) // Mock balance
  const [oddsChanges, setOddsChanges] = useState<RealtimeOddsUpdate['changes']>([])

  const loadData = useCallback(async (category?: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await sportsApi.getMatchesByCategory(category)
      const apiResponse = await sportsApi.fetchUpcomingOdds()
      
      setMatches(response)
      setCategories(apiResponse.categories)
      setLastUpdated(apiResponse.lastUpdated)
    } catch (err: any) {
      console.error('Error loading sports data:', err)
      setError(err.message || 'Failed to load sports data')
      toast.error('Failed to load sports data')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleRefresh = useCallback(async () => {
    await sportsApi.forceRefresh()
    await loadData(selectedCategory)
  }, [loadData, selectedCategory])

  const handleCategorySelect = useCallback((category: string) => {
    setSelectedCategory(category)
    setSelectedMatch(null)
    loadData(category)
  }, [loadData])

  const handleMatchSelect = useCallback((match: MatchData) => {
    setSelectedMatch(match)
    // Navigate to match details page
    router.push(`/sports/match/${match.id}`)
  }, [router])

  // Betting handlers
  const handleOddsClick = useCallback((market: string, outcome: string, odds: number, bookmaker: string, match: MatchData) => {
    const marketType = market.includes('lay') ? 'lay' : 'back'
    const betId = `${match.id}_${market}_${outcome}_${bookmaker}`
    
    // Check if bet already exists
    const existingBetIndex = betSlipItems.findIndex(item => item.id === betId)
    
    if (existingBetIndex >= 0) {
      // Remove existing bet
      setBetSlipItems(prev => prev.filter(item => item.id !== betId))
      toast.error('Bet removed from slip')
    } else {
      // Add new bet
      const newBet: BetSlipItem = {
        id: betId,
        matchId: match.id,
        matchName: `${match.home_team} vs ${match.away_team}`,
        market,
        outcome,
        odds,
        bookmaker,
        stake: 100,
        type: marketType
      }
      
      setBetSlipItems(prev => [...prev, newBet])
      setIsBetSlipOpen(true)
      toast.success(`${marketType.toUpperCase()} bet added to slip`)
    }
  }, [betSlipItems])

  const handleUpdateBetStake = useCallback((betId: string, stake: number) => {
    setBetSlipItems(prev => prev.map(item => 
      item.id === betId ? { ...item, stake } : item
    ))
  }, [])

  const handleRemoveBet = useCallback((betId: string) => {
    setBetSlipItems(prev => prev.filter(item => item.id !== betId))
  }, [])

  const handlePlaceBets = useCallback(async () => {
    setIsPlacingBets(true)
    
    try {
      // Validate all bets
      for (const bet of betSlipItems) {
        const validation = bettingService.validateBet(bet, userBalance)
        if (!validation.isValid) {
          toast.error(validation.error || 'Invalid bet')
          return
        }
      }

      // Calculate required balance
      const requiredBalance = bettingService.getRequiredBalance(betSlipItems)
      if (requiredBalance > userBalance) {
        toast.error('Insufficient balance for all bets')
        return
      }

      // Place bets
      const placedBets = await bettingService.placeMultipleBets(betSlipItems, 'user-123') // Mock user ID
      
      // Update balance
      const totalStake = bettingService.calculateTotalStake(betSlipItems)
      setUserBalance(prev => prev - totalStake)
      
      // Clear bet slip
      setBetSlipItems([])
      setIsBetSlipOpen(false)
      
      toast.success(`${placedBets.length} bets placed successfully!`)
    } catch (error) {
      console.error('Error placing bets:', error)
      toast.error('Failed to place bets')
    } finally {
      setIsPlacingBets(false)
    }
  }, [betSlipItems, userBalance])

  // Real-time odds integration
  useEffect(() => {
    const unsubscribe = realtimeOddsEngine.subscribe((update: RealtimeOddsUpdate) => {
      setMatches(update.matches)
      setOddsChanges(update.changes)
      setLastUpdated(update.timestamp)
      
      // Update odds in bet slip if they changed
      setBetSlipItems(prev => prev.map(item => {
        const change = update.changes.find(c => 
          c.matchId === item.matchId && 
          c.market === item.market && 
          c.outcome === item.outcome &&
          c.bookmaker === item.bookmaker
        )
        
        if (change) {
          return { ...item, odds: change.newOdds }
        }
        return item
      }))
    })

    // Start polling
    realtimeOddsEngine.startPolling(async () => {
      const response = await sportsApi.fetchUpcomingOdds()
      return response.data
    })

    return () => {
      unsubscribe()
      realtimeOddsEngine.stopPolling()
    }
  }, [])

  // Initial load
  useEffect(() => {
    loadData()
  }, [loadData])

  return (
    <ErrorBoundary>
      <SportsLayout
        sidebar={
          <SportsSidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
          />
        }
        header={
          <SportsHeader
            selectedCategory={selectedCategory}
            onRefresh={handleRefresh}
            loading={loading}
            lastUpdated={lastUpdated}
          />
        }
      >
        <div className="p-3 sm:p-6">
          {error ? (
            <ErrorState error={error} onRetry={handleRefresh} />
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">
                  {selectedCategory ? `${selectedCategory} Matches` : 'All Sports'}
                </h2>
                <MatchList
                  matches={matches}
                  selectedMatchId={selectedMatch?.id}
                  onMatchSelect={handleMatchSelect}
                  onOddsClick={handleOddsClick}
                  loading={loading}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Bet Slip */}
        <BetSlip
          isOpen={isBetSlipOpen}
          onClose={() => setIsBetSlipOpen(false)}
          items={betSlipItems}
          onUpdateItem={handleUpdateBetStake}
          onRemoveItem={handleRemoveBet}
          onPlaceBets={handlePlaceBets}
          isPlacing={isPlacingBets}
          balance={userBalance}
        />
      </SportsLayout>
    </ErrorBoundary>
  )
}

