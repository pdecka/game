'use client'

import { useMemo } from 'react'
import { MatchData } from './MatchCard'
import OddsTable from './OddsTable'

interface MatchDetailsProps {
  match: MatchData
  onOddsClick?: (market: string, outcome: string, odds: number, bookmaker: string) => void
}

export default function MatchDetails({ match, onOddsClick }: MatchDetailsProps) {
  const status = useMemo(() => {
    const now = new Date()
    const commenceTime = new Date(match.commence_time)
    
    if (now > commenceTime) {
      return { text: 'Live', className: 'bg-[#22c55e]/15 border-[#22c55e]/30 text-[#22c55e]' }
    }
    return { text: 'Upcoming', className: 'bg-white/5 border-white/10 text-slate-200' }
  }, [match.commence_time])

  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    return date.toLocaleString()
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0f212e]/60 p-6">
      {/* Match Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-sm text-slate-400">{match.sport_title}</p>
            <h2 className="text-xl font-bold text-white mt-1">
              {match.home_team} vs {match.away_team}
            </h2>
            <p className="text-sm text-slate-400 mt-1">{formatTime(match.commence_time)}</p>
          </div>
          <div className={`inline-flex items-center rounded-full border px-4 py-2 text-sm capitalize font-semibold ${status.className}`}>
            {status.text}
          </div>
        </div>
      </div>

      {/* Odds Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Odds Comparison</h3>
        
        {match.bookmakers && match.bookmakers.length > 0 ? (
          <OddsTable bookmakers={match.bookmakers} onOddsClick={onOddsClick} />
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
            <p className="text-sm text-slate-300">No odds available for this match</p>
            <p className="text-xs text-slate-400 mt-1">Bookmakers may not have odds for this event yet</p>
          </div>
        )}
      </div>

      {/* Additional Match Info */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-400">Match ID</p>
            <p className="text-white font-mono text-xs mt-1">{match.id}</p>
          </div>
          <div>
            <p className="text-slate-400">Sport Key</p>
            <p className="text-white font-mono text-xs mt-1">{match.sport_key}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
