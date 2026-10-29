'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { GameLayout } from '@/components/layout/GameLayout'
import MatchDetails from '@/components/sports/MatchDetails'
import BetSlip from '@/components/sports/BetSlip'
import ErrorBoundary from '@/components/sports/ErrorBoundary'
import { MatchData } from '@/components/sports/MatchCard'
import { useSportsBetSlip } from '@/components/sports/useSportsBetSlip'
import { sportsApi } from '@/services/sportsApi'
import { SPORT_HUB } from '@/lib/sport-hub'
import { formatPlayMoney, usePlayCurrency } from '@/lib/playCurrency'

function toMatch(stored: any): MatchData {
  const score = stored.score || {}
  return {
    id: stored.id,
    sport_key: stored.sportKey || stored.sport,
    sport_title: stored.sport,
    league: stored.league,
    commence_time: stored.startTime || '',
    home_team: stored.teamA,
    away_team: stored.teamB,
    status: stored.status,
    scoreHome: score.teamA || null,
    scoreAway: score.teamB || null,
    scoreDetail: score.detail,
    lastFetchedAt: stored.lastFetchedAt,
    bettingOpen: stored.bettingOpen,
    bookmakers: Array.isArray(stored.bookmakers) ? stored.bookmakers : [],
  }
}

export default function MatchDetailsPage() {
  const params = useParams()
  const matchId = params.id as string
  const slip = useSportsBetSlip()
  const { currency } = usePlayCurrency()
  const [match, setMatch] = useState<MatchData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMatch = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      setError(null)
      const stored = await sportsApi.fetchStoredMatch(matchId)
      if (!stored?.id) {
        setError('This match is currently unavailable.')
        return
      }
      setMatch(toMatch(stored))
    } catch {
      setError('This match is currently unavailable.')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [matchId])

  useEffect(() => {
    loadMatch()
    const timer = window.setInterval(() => {
      if (!document.hidden) loadMatch(true)
    }, 30000)
    return () => window.clearInterval(timer)
  }, [loadMatch])

  const addOdds = useCallback(
    (market: string, outcome: string, odds: number, bookmaker: string, point: number | undefined, bookmakerKey: string) => {
      if (!match) return
      const lineKey = point != null ? `:${point}` : ''
      slip.toggleOdds({
        id: `${match.id}:${market}:${outcome}${lineKey}:${bookmakerKey}`,
        matchId: match.id,
        matchName: `${match.home_team} vs ${match.away_team}`,
        market,
        outcome,
        odds,
        bookmaker,
        bookmakerKey,
        sportKey: match.sport_key,
        ...(point != null ? { line: point } : {}),
      })
    },
    [match, slip],
  )

  return (
    <ErrorBoundary>
      <GameLayout>
        <div className="page-wrap max-w-4xl">
          <Link
            href={
              match
                ? `/sports/${SPORT_HUB.find((item) =>
                    item.groups.some((group) => group.toLowerCase() === String(match.sport_title || '').toLowerCase()),
                  )?.slug || 'cricket'}`
                : '/sports'
            }
            className="text-sm text-ink-2 hover:text-brand-2"
          >
            ← Back to sport
          </Link>
          {slip.loggedIn ? (
            <p className="mt-3 text-sm text-ink-2">
              Balance <span className="odds-num font-semibold text-ink">{formatPlayMoney(slip.balance, currency)}</span>
              <span className="text-ink-3"> ({formatPlayMoney(slip.exposure, currency)})</span>
            </p>
          ) : (
            <p className="mt-3 text-sm text-ink-3">Log in to place a bet.</p>
          )}

          {loading && !match ? (
            <div className="mt-6 animate-pulse space-y-4">
              <div className="h-8 w-1/3 rounded bg-elevated" />
              <div className="h-40 rounded-2xl bg-elevated" />
            </div>
          ) : error || !match ? (
            <div className="mt-6 rounded-2xl border border-line bg-card p-6 text-center shadow-panel">
              <p className="text-ink-2">{error || 'This match is currently unavailable.'}</p>
              <button
                type="button"
                onClick={() => loadMatch()}
                className="mt-3 rounded-xl bg-brand px-4 py-2 text-sm text-white"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="mt-4">
              <MatchDetails match={match} onOddsClick={addOdds} />
            </div>
          )}
        </div>

        {!slip.isOpen && slip.items.length > 0 && (
          <button
            type="button"
            onClick={() => slip.setIsOpen(true)}
            className="fixed bottom-4 right-4 z-40 rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white shadow-lift"
          >
            Bets · {slip.items.length} · {formatPlayMoney(slip.items.reduce((sum, item) => sum + Number(item.stake || 0), 0), currency)}
          </button>
        )}

        <BetSlip
          isOpen={slip.isOpen}
          onClose={() => slip.setIsOpen(false)}
          items={slip.items}
          onUpdateItem={slip.updateStake}
          onRemoveItem={slip.remove}
          onPlaceBets={slip.placeBets}
          isPlacing={slip.isPlacing}
          balance={slip.balance}
          exposure={slip.exposure}
        />
      </GameLayout>
    </ErrorBoundary>
  )
}
