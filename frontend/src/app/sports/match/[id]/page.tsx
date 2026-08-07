'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import SportsLayout from '@/components/sports/SportsLayout'
import SportsHeader from '@/components/sports/SportsHeader'
import MatchDetails from '@/components/sports/MatchDetails'
import ErrorBoundary from '@/components/sports/ErrorBoundary'
import { MatchData } from '@/components/sports/MatchCard'
import { sportsApi } from '@/services/sportsApi'

export default function MatchDetailsPage() {
  const params = useParams()
  const matchId = params.id as string
  
  const [match, setMatch] = useState<MatchData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>()

  const loadMatch = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const matchData = await sportsApi.getMatchById(matchId)
      const apiResponse = await sportsApi.fetchUpcomingOdds()
      
      if (!matchData) {
        setError('Match not found')
        return
      }
      
      setMatch(matchData)
      setLastUpdated(apiResponse.lastUpdated)
    } catch (err: any) {
      console.error('Error loading match details:', err)
      setError(err.message || 'Failed to load match details')
      toast.error('Failed to load match details')
    } finally {
      setLoading(false)
    }
  }, [matchId])

  const handleRefresh = useCallback(async () => {
    await sportsApi.forceRefresh()
    await loadMatch()
  }, [loadMatch])

  // Initial load
  useEffect(() => {
    loadMatch()
  }, [loadMatch])

  // Auto-refresh every 5 seconds for match details
  useEffect(() => {
    const interval = setInterval(() => {
      if (!error && match) {
        loadMatch()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [loadMatch, error, match])

  if (loading && !match) {
    return (
      <SportsLayout 
        sidebar={<div className="w-64 bg-[#1a2c38] p-4">Loading sidebar...</div>}
        header={<SportsHeader loading={true} />}
      >
        <div className="flex-1 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-white/10 rounded w-1/3"></div>
            <div className="h-32 bg-white/10 rounded"></div>
          </div>
        </div>
      </SportsLayout>
    )
  }

  if (error || !match) {
    return (
      <SportsLayout 
        sidebar={<div className="w-64 bg-[#1a2c38] p-4">Error loading sidebar...</div>}
        header={<SportsHeader loading={false} />}
      >
        <div className="flex-1 p-6">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
            <p className="text-red-400 mb-2">{error || 'Match not found'}</p>
            <button
              onClick={handleRefresh}
              className="rounded-xl bg-red-500/20 hover:bg-red-500/30 px-4 py-2 text-sm text-red-300 transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      </SportsLayout>
    )
  }

  return (
    <SportsLayout
      sidebar={null}
      header={
        <SportsHeader
          selectedCategory={match.sport_title}
          onRefresh={handleRefresh}
          loading={loading}
          lastUpdated={lastUpdated}
        />
      }
    >
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <ErrorBoundary>
            <MatchDetails match={match} />
          </ErrorBoundary>
        </div>
      </div>
    </SportsLayout>
  )
}
