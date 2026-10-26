'use client'

import { useMemo } from 'react'
import Link from 'next/link'

interface Outcome {
  name: string
  price: number
  point?: number
  description?: string
}

interface Market {
  key: string
  last_update?: string
  outcomes: Outcome[]
}

interface Bookmaker {
  key: string
  title: string
  last_update?: string
  markets: Market[]
}

export interface MatchData {
  id: string
  sport_key: string
  sport_title: string
  commence_time: string
  home_team: string
  away_team: string
  bookmakers: Bookmaker[]
  status?: string
  league?: string
  scoreHome?: string | null
  scoreAway?: string | null
  scoreDetail?: string
  lastFetchedAt?: string | null
  bettingOpen?: boolean
}

interface PriceButton {
  name: string
  price: number
  bookmaker: string
  bookmakerKey: string
}

interface MatchCardProps {
  match: MatchData
  onClick?: (match: MatchData) => void
  onOddsClick?: (
    market: string,
    outcome: string,
    odds: number,
    bookmaker: string,
    point: number | undefined,
    bookmakerKey: string,
  ) => void
  isSelected?: boolean
}

function bestH2h(bookmakers: Bookmaker[]): PriceButton[] {
  const best = new Map<string, PriceButton>()
  bookmakers.forEach((bookmaker) => {
    bookmaker.markets.forEach((market) => {
      if (market.key !== 'h2h' && market.key !== 'outrights') return
      market.outcomes.forEach((outcome) => {
        const current = best.get(outcome.name)
        if (!current || outcome.price > current.price) {
          best.set(outcome.name, {
            name: outcome.name,
            price: outcome.price,
            bookmaker: bookmaker.title,
            bookmakerKey: bookmaker.key,
          })
        }
      })
    })
  })
  return [...best.values()]
}

export default function MatchCard({ match, onClick, onOddsClick, isSelected }: MatchCardProps) {
  const prices = useMemo(() => {
    const rows = bestH2h(match.bookmakers || [])
    const order = [match.home_team, 'Draw', match.away_team]
    return rows.slice(0, 8).sort((a, b) => {
      const ai = order.findIndex((name) => name.toLowerCase() === a.name.toLowerCase())
      const bi = order.findIndex((name) => name.toLowerCase() === b.name.toLowerCase())
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
    })
  }, [match])

  const status = useMemo(() => {
    const raw = (match.status || '').toLowerCase()
    if (raw === 'live') return { text: 'Live', className: 'bg-brand/15 text-brand' }
    if (raw === 'finished') return { text: 'Finished', className: 'bg-elevated text-ink-2' }
    if (raw === 'cancelled') return { text: 'Cancelled', className: 'bg-elevated text-ink-3' }
    return { text: 'Upcoming', className: 'bg-elevated text-ink-2' }
  }, [match.status])

  const kickoff = match.commence_time
    ? new Date(match.commence_time).toLocaleString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : 'Time to be confirmed'

  return (
    <article
      className={`rounded-2xl border p-4 py-5 transition-colors sm:p-5 sm:py-6 ${
        isSelected ? 'border-brand/40 bg-brand/5' : 'border-line bg-card'
      }`}
    >
      <Link href={`/sports/match/${match.id}`} onClick={() => onClick?.(match)} className="block w-full text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-ink-3">
              {match.sport_title}
              {match.league && match.league !== match.sport_title ? ` · ${match.league}` : ''}
            </p>
            <p className="mt-1 text-base font-semibold text-ink">
              {match.home_team} <span className="font-medium text-ink-3">vs</span> {match.away_team}
            </p>
            {(match.scoreHome || match.scoreAway) && (
              <p className="odds-num mt-1 text-sm text-brand">
                {match.scoreHome || '—'} <span className="text-ink-3">-</span> {match.scoreAway || '—'}
              </p>
            )}
            <p className="mt-1 text-xs text-ink-3">{kickoff}</p>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}>{status.text}</span>
        </div>
      </Link>

      <div className={`mt-3 grid gap-2 ${prices.length > 2 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {prices.length === 0 ? (
          <p className="col-span-2 text-xs text-ink-3">
            {match.status === 'finished' ? 'Market closed' : 'Open the match for nested markets.'}
          </p>
        ) : (
          prices.map((price) => (
            <button
              key={price.name}
              type="button"
              disabled={match.bettingOpen === false}
              onClick={() =>
                onOddsClick?.('h2h', price.name, price.price, price.bookmaker, undefined, price.bookmakerKey)
              }
              className="rounded-xl border border-line bg-elevated px-3 py-2 text-left transition-colors hover:border-brand/40 hover:bg-brand/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="block truncate text-xs text-ink-2">{price.name}</span>
              <span className="odds-num mt-0.5 block text-sm font-bold text-ink">{price.price.toFixed(2)}</span>
            </button>
          ))
        )}
      </div>
    </article>
  )
}
