'use client'

import { useMemo } from 'react'
import MatchCard, { MatchData } from './MatchCard'

interface MatchListProps {
  matches: MatchData[]
  selectedMatchId?: string
  onMatchSelect?: (match: MatchData) => void
  onOddsClick?: (
    market: string,
    outcome: string,
    odds: number,
    bookmaker: string,
    point: number | undefined,
    bookmakerKey: string,
    match: MatchData,
  ) => void
  loading?: boolean
}

export default function MatchList({ matches, selectedMatchId, onMatchSelect, onOddsClick, loading }: MatchListProps) {
  const sortedMatches = useMemo(() => {
    const rank = (status?: string) => {
      if (status === 'live') return 0
      if (status === 'upcoming') return 1
      if (status === 'finished') return 2
      return 3
    }
    return [...matches].sort((a, b) => {
      const byStatus = rank(a.status) - rank(b.status)
      if (byStatus !== 0) return byStatus
      const aTime = a.commence_time ? new Date(a.commence_time).getTime() : 0
      const bTime = b.commence_time ? new Date(b.commence_time).getTime() : 0
      return rank(a.status) === 2 ? bTime - aTime : aTime - bTime
    })
  }, [matches])

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-line bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <div className="mb-2 h-3 w-20 rounded bg-elevated"></div>
                <div className="mb-2 h-4 w-3/4 rounded bg-elevated"></div>
                <div className="h-3 w-32 rounded bg-elevated"></div>
              </div>
              <div className="h-6 w-16 rounded-full bg-elevated"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-white p-8 text-center shadow-panel">
        <p className="text-sm text-ink-2">No matches for this sport right now.</p>
        <p className="mt-1 text-xs text-ink-3">Live and upcoming fixtures appear here when the scoreboard has games.</p>
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
          onOddsClick={(market, outcome, odds, bookmaker, point, bookmakerKey) =>
            onOddsClick?.(market, outcome, odds, bookmaker, point, bookmakerKey, match)
          }
        />
      ))}
    </div>
  )
}
