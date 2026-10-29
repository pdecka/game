'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MatchList from '@/components/sports/MatchList'
import BetSlip from '@/components/sports/BetSlip'
import { ErrorState } from '@/components/sports/LoadingStates'
import { MatchData } from '@/components/sports/MatchCard'
import { useSportsBetSlip } from '@/components/sports/useSportsBetSlip'
import { sportsApi, BoardMatch } from '@/services/sportsApi'
import { SportHubItem } from '@/lib/sport-hub'
import { PageHeader } from '@/components/ui/page-header'
import { formatPlayMoney, usePlayCurrency } from '@/lib/playCurrency'

function mapBoardMatch(match: BoardMatch): MatchData {
  return {
    id: match.id,
    sport_key: match.sportKey || match.sport,
    sport_title: match.sport,
    league: match.league,
    commence_time: match.startTime || '',
    home_team: match.teamA,
    away_team: match.teamB,
    status: match.status,
    scoreHome: match.score?.teamA || null,
    scoreAway: match.score?.teamB || null,
    scoreDetail: match.score?.detail,
    lastFetchedAt: match.lastFetchedAt,
    bettingOpen: match.bettingOpen,
    bookmakers: match.bookmakers?.length
      ? match.bookmakers
      : match.odds
        ? [
            {
              key: match.odds.source,
              title: match.odds.bookmaker,
              markets: [{ key: 'h2h', outcomes: match.odds.outcomes }],
            },
          ]
        : [],
  }
}

type SportsBoardProps = {
  sport?: SportHubItem
  liveOnly?: boolean
}

export function SportsBoard({ sport, liveOnly }: SportsBoardProps) {
  const router = useRouter()
  const slip = useSportsBetSlip()
  const { currency } = usePlayCurrency()
  const [matches, setMatches] = useState<MatchData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedNote, setFeedNote] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'upcoming' | 'finished'>(
    liveOnly ? 'live' : 'all',
  )
  const [league, setLeague] = useState('All')
  const [query, setQuery] = useState('')

  const loadData = useCallback(
    async (signal?: AbortSignal, silent = false) => {
      try {
        if (!silent) setLoading(true)
        setError(null)
        const board = await sportsApi.fetchBoard(signal, {
          slug: liveOnly ? undefined : sport?.slug,
          status: liveOnly ? 'live' : undefined,
        })
        setMatches(board.matches.map(mapBoardMatch))
        const reason = board.oddsStatus?.reason || ''
        if (!board.oddsStatus?.configured && !board.matches.length) {
          setFeedNote('Live scores are still loading. Try again in a moment.')
        } else if (reason && reason !== 'ok') {
          setFeedNote(reason)
        } else {
          setFeedNote('')
        }
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'name' in err && (err as { name?: string }).name === 'AbortError') return
        setError('Sports data is temporarily unavailable.')
      } finally {
        if (!silent) setLoading(false)
      }
    },
    [liveOnly, sport?.slug],
  )

  useEffect(() => {
    const controller = new AbortController()
    loadData(controller.signal)
    const timer = window.setInterval(() => {
      if (!document.hidden) loadData(undefined, true)
    }, 30000)
    return () => {
      controller.abort()
      window.clearInterval(timer)
    }
  }, [loadData])

  const leagues = useMemo(() => {
    const counts = new Map<string, number>()
    matches.forEach((match) => {
      const name = match.league || match.sport_title
      counts.set(name, (counts.get(name) || 0) + 1)
    })
    return [
      { name: 'All', count: matches.length },
      ...[...counts.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
    ]
  }, [matches])

  const visible = useMemo(() => {
    return matches.filter((match) => {
      if (statusFilter === 'all' && match.status === 'finished') return false
      if (statusFilter !== 'all' && match.status !== statusFilter) return false
      if (league !== 'All' && (match.league || match.sport_title) !== league) return false
      if (query.trim()) {
        const q = query.trim().toLowerCase()
        return (
          match.home_team.toLowerCase().includes(q) ||
          match.away_team.toLowerCase().includes(q) ||
          (match.league || '').toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [league, matches, query, statusFilter])

  const addOdds = useCallback(
    (
      market: string,
      outcome: string,
      odds: number,
      bookmaker: string,
      point: number | undefined,
      bookmakerKey: string,
      match: MatchData,
    ) => {
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
    [slip],
  )

  const title = liveOnly ? 'Live' : sport?.name || 'Sports'
  const description = liveOnly
    ? 'Matches in play right now'
    : sport?.desc || 'Pick a match, then tap a price to bet'

  return (
    <>
      <div className="page-wrap max-w-5xl">
        <Link href="/sports" className="mb-3 inline-block text-sm text-ink-2 hover:text-brand-2">
          ← All sports
        </Link>
        <PageHeader
          title={title}
          description={`${description}${typeof visible.length === 'number' ? ` · ${visible.length}` : ''}`}
        />

        {slip.loggedIn ? (
          <p className="mb-4 text-sm text-ink-2">
            Balance <span className="odds-num font-semibold text-ink">{formatPlayMoney(slip.balance, currency)}</span>
            <span className="text-ink-3"> ({formatPlayMoney(slip.exposure, currency)})</span>
          </p>
        ) : (
          <p className="mb-4 text-sm text-ink-3">Log in to place a bet. Prices stay visible either way.</p>
        )}

        {leagues.length > 2 && (
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
            {leagues.map((item) => {
              const active = league === item.name
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setLeague(item.name)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-sm ${
                    active ? 'border-brand bg-brand text-white' : 'border-line bg-white text-ink-2 hover:bg-brand/10'
                  }`}
                >
                  {item.name}
                  <span className="ml-2 text-xs opacity-80">{item.count}</span>
                </button>
              )
            })}
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-center gap-2">
          {(['all', 'live', 'upcoming', 'finished'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`rounded-full border px-3 py-1 text-xs capitalize ${
                statusFilter === filter ? 'border-brand bg-brand/10 text-brand-2' : 'border-line bg-white text-ink-2'
              }`}
            >
              {filter}
            </button>
          ))}
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search teams or leagues"
            className="ml-auto w-full rounded-lg border border-line bg-white px-3 py-1.5 text-sm text-ink outline-none placeholder:text-ink-3 focus:border-brand/50 focus:ring-2 focus:ring-brand/20 sm:w-56"
          />
        </div>

        {feedNote && <p className="mb-4 text-sm text-ink-3">{feedNote}</p>}

        {error ? (
          <ErrorState error={error} onRetry={() => loadData()} />
        ) : (
          <MatchList
            matches={visible}
            onMatchSelect={(match) => router.push(`/sports/match/${match.id}`)}
            onOddsClick={addOdds}
            loading={loading && matches.length === 0}
          />
        )}
      </div>

      {!slip.isOpen && slip.items.length > 0 && (
        <button
          type="button"
          onClick={() => slip.setIsOpen(true)}
          className="fixed bottom-4 right-4 z-40 rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white shadow-lift"
        >
          Bet · {slip.items.length} · {formatPlayMoney(slip.items.reduce((sum, item) => sum + Number(item.stake || 0), 0), currency)}
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
    </>
  )
}
