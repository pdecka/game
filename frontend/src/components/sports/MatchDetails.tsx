'use client'

import { useMemo } from 'react'
import { MatchData } from './MatchCard'
import OddsTable from './OddsTable'

interface MatchDetailsProps {
  match: MatchData
  onOddsClick?: (
    market: string,
    outcome: string,
    odds: number,
    bookmaker: string,
    point: number | undefined,
    bookmakerKey: string,
  ) => void
}

export default function MatchDetails({ match, onOddsClick }: MatchDetailsProps) {
  const status = useMemo(() => {
    const raw = (match.status || '').toLowerCase()
    if (raw === 'live') return { text: 'Live', className: 'bg-brand/15 border-brand/30 text-brand' }
    if (raw === 'finished') return { text: 'Finished', className: 'bg-elevated border-line text-ink-2' }
    if (raw === 'cancelled') return { text: 'Cancelled', className: 'bg-elevated border-line text-ink-3' }
    return { text: 'Upcoming', className: 'bg-elevated border-line text-ink-2' }
  }, [match.status])

  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    if (Number.isNaN(date.getTime())) return 'Time to be confirmed'
    return date.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div className="rounded-2xl border border-line bg-card p-6">
      {/* Match Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-sm text-ink-3">{match.sport_title}</p>
            <h2 className="mt-1 text-xl font-bold text-ink">
              {match.home_team} vs {match.away_team}
            </h2>
            <p className="mt-1 text-sm text-ink-3">{formatTime(match.commence_time)}</p>
          </div>
          <div className={`inline-flex items-center rounded-full border px-4 py-2 text-sm capitalize font-semibold ${status.className}`}>
            {status.text}
          </div>
        </div>
      </div>

      {/* Odds Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-ink">Markets</h3>
        <p className="text-sm text-ink-2">
          Match winner, totals, player prices, and every other priced market for this match. Tap a price to bet.
        </p>
        
        {match.bookmakers && match.bookmakers.length > 0 ? (
          <OddsTable
            bookmakers={match.bookmakers}
            homeTeam={match.home_team}
            awayTeam={match.away_team}
            bettingOpen={match.bettingOpen !== false}
            onOddsClick={onOddsClick}
          />
        ) : (
          <div className="rounded-xl border border-line bg-elevated p-6 text-center">
            <p className="text-sm text-ink-2">No odds available for this match</p>
            <p className="text-xs text-ink-3 mt-1">Bookmakers may not have odds for this event yet</p>
          </div>
        )}
      </div>

      <p className="mt-6 border-t border-line pt-4 text-xs text-ink-3">
        Tap a price, enter what you want to spend, and that amount is held as exposure. If the bet wins, the return at these odds is added to your balance.
      </p>
    </div>
  )
}
