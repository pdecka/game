'use client'

import { useMemo } from 'react'
import MatchCard, { MatchData } from './MatchCard'

interface MatchListProps {
  matches: MatchData[]
  selectedMatchId?: string
  onMatchSelect?: (match: MatchData) => void
  onOddsClick?: (market: string, outcome: string, odds: number, bookmaker: string, match: MatchData) => void
  loading?: boolean
}

export default function MatchList({ matches, selectedMatchId, onMatchSelect, onOddsClick, loading }: MatchListProps) {
  const sortedMatches = useMemo(() => {
    return [...matches].sort((a, b) => {
      // Sort by commence time, with upcoming matches first
      const now = new Date()
      const aTime = new Date(a.commence_time)
      const bTime = new Date(b.commence_time)
      
      const aIsLive = now > aTime
      const bIsLive = now > bTime
      
      if (aIsLive && !bIsLive) return -1
      if (!aIsLive && bIsLive) return 1
      
      return aTime.getTime() - bTime.getTime()
    })
  }, [matches])

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4 animate-pulse">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <div className="h-3 bg-white/10 rounded w-20 mb-2"></div>
                <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-white/10 rounded w-32"></div>
              </div>
              <div className="w-16 h-6 bg-white/10 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-sm text-slate-300">No matches available right now.</p>
        <p className="text-xs text-slate-400 mt-1">Check back later for upcoming games.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sortedMatches.map((match) => (
        <MatchCard
          key={match.id}
          match={match}
          isSelected={match.id === selectedMatchId}
          onClick={onMatchSelect}
          onOddsClick={(market, outcome, odds, bookmaker) => 
            onOddsClick?.(market, outcome, odds, bookmaker, match)
          }
        />
      ))}
    </div>
  )
}
