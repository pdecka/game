'use client'

import { useMemo } from 'react'

interface Bookmaker {
  key: string
  title: string
  last_update: string
  markets: Array<{
    key: string
    last_update: string
    outcomes: Array<{
      name: string
      price: number
    }>
  }>
}

export interface MatchData {
  id: string
  sport_key: string
  sport_title: string
  commence_time: string
  home_team: string
  away_team: string
  bookmakers: Bookmaker[]
}

interface MatchCardProps {
  match: MatchData
  onClick?: (match: MatchData) => void
  onOddsClick?: (market: string, outcome: string, odds: number, bookmaker: string) => void
  isSelected?: boolean
}

export default function MatchCard({ match, onClick, onOddsClick, isSelected }: MatchCardProps) {
  const bestOdds = useMemo(() => {
    if (!match.bookmakers || match.bookmakers.length === 0) {
      return null
    }

    const allOdds: { [team: string]: { price: number; bookmaker: string } } = {}

    match.bookmakers.forEach(bookmaker => {
      bookmaker.markets.forEach(market => {
        if (market.key === 'h2h') {
          market.outcomes.forEach(outcome => {
            const currentBest = allOdds[outcome.name]
            if (!currentBest || outcome.price < currentBest.price) {
              allOdds[outcome.name] = {
                price: outcome.price,
                bookmaker: bookmaker.title
              }
            }
          })
        }
      })
    })

    return allOdds
  }, [match.bookmakers])

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

  const getOddsColor = (price: number) => {
    if (price <= 1.5) return 'text-[#22c55e]' // Favorable odds
    if (price >= 3.0) return 'text-[#ef4444]' // Risky odds
    return 'text-white'
  }

  return (
    <button
      onClick={() => onClick?.(match)}
      className={`w-full rounded-2xl border border-white/10 p-4 text-left transition-all hover:bg-white/5 ${
        isSelected ? 'bg-white/5 border-[#22c55e]/30' : 'bg-transparent'
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex-1">
          <p className="text-xs text-slate-400">{match.sport_title}</p>
          <p className="text-base font-semibold text-white mt-1">
            {match.home_team} <span className="text-slate-400 font-medium">vs</span> {match.away_team}
          </p>
          <p className="text-xs text-slate-400 mt-1">{formatTime(match.commence_time)}</p>
        </div>
        <div className={`inline-flex items-center rounded-full border px-3 py-1 text-xs capitalize ${status.className}`}>
          {status.text}
        </div>
      </div>

      {/* Best Odds Display */}
      <div className="mt-3">
        {bestOdds && Object.keys(bestOdds).length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(bestOdds).map(([team, odds]) => (
              <button
                key={team}
                onClick={() => onOddsClick?.('h2h', team, odds.price, odds.bookmaker)}
                className="bg-[#1a2c38] hover:bg-[#2a3c48] rounded-lg px-3 py-2 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300 truncate group-hover:text-white">{team}</span>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${getOddsColor(odds.price)} group-hover:opacity-90`}>
                      {odds.price.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-500">{odds.bookmaker}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-white/5 rounded-lg px-3 py-2 text-center">
            <span className="text-xs text-slate-400">Odds not available</span>
          </div>
        )}
      </div>
    </button>
  )
}
