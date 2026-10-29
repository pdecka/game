'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import { GameLayout } from '@/components/layout/GameLayout'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  betStatusLabel,
  formatBetMoney,
  formatBetWhen,
  formatOdds,
  type BetHistoryItem,
  type BetHistoryResponse,
} from '@/lib/betHistory'

const empty: BetHistoryResponse = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 25,
  order: 'desc',
  summary: { total: 0, totalStake: 0, totalPayout: 0, open: 0 },
}

export default function BetHistoryPage() {
  const router = useRouter()
  const { ready, user } = useAuth() as { ready: boolean; user: { username?: string } | null }
  const [source, setSource] = useState<'all' | 'sports' | 'game'>('all')
  const [order, setOrder] = useState<'desc' | 'asc'>('desc')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<BetHistoryResponse>(empty)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!ready) return
    if (!user) router.push('/auth/login')
  }, [ready, user, router])

  useEffect(() => {
    if (!ready || !user) return
    let cancelled = false
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await api.get('/bet-history', {
          params: { page, pageSize: 25, source, order },
        })
        if (!cancelled) setData(response.data)
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.data?.message || 'Could not load bet history')
          setData(empty)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [ready, user, page, source, order])

  if (!ready || !user) {
    return <div className="flex min-h-screen items-center justify-center bg-bg-2 text-ink-2">Loading...</div>
  }

  const pageCount = Math.max(1, Math.ceil(data.total / data.pageSize))

  return (
    <GameLayout>
      <div className="page-wrap">
        <PageHeader
          title="Bet History"
          description="Every play from your first bet, with the newest entry on top. Times are shown in IST."
        />

        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Card className="p-4">
            <p className="text-xs text-ink-2">Total bets</p>
            <p className="odds-num mt-1 text-xl font-semibold text-ink">{data.summary.total}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-ink-2">Total staked</p>
            <p className="odds-num mt-1 text-xl font-semibold text-ink">{formatBetMoney(data.summary.totalStake)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-ink-2">Total returned</p>
            <p className="odds-num mt-1 text-xl font-semibold text-ink">{formatBetMoney(data.summary.totalPayout)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-ink-2">Open bets</p>
            <p className="odds-num mt-1 text-xl font-semibold text-ink">{data.summary.open}</p>
          </Card>
        </div>

        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <select
              value={source}
              onChange={(event) => {
                setSource(event.target.value as 'all' | 'sports' | 'game')
                setPage(1)
              }}
              className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink"
            >
              <option value="all">All bets</option>
              <option value="sports">Sports</option>
              <option value="game">Casino games</option>
            </select>
            <select
              value={order}
              onChange={(event) => {
                setOrder(event.target.value as 'desc' | 'asc')
                setPage(1)
              }}
              className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink"
            >
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
          </div>
          <p className="text-sm text-ink-2">
            {loading ? 'Loading...' : `${data.total} entries`}
          </p>
        </div>

        {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}

        <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-panel">
          <div className="overflow-auto">
            <table className="min-w-[920px] w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-elevated text-left text-ink-2">
                  <th className="px-4 py-3 font-medium">Date & time</th>
                  <th className="px-4 py-3 font-medium">Game</th>
                  <th className="px-4 py-3 font-medium">Prediction</th>
                  <th className="px-4 py-3 font-medium">Result</th>
                  <th className="px-4 py-3 font-medium">Stake</th>
                  <th className="px-4 py-3 font-medium">Odds</th>
                  <th className="px-4 py-3 font-medium">Payout</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {!loading && data.items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-ink-2">
                      No bets yet. Each play will appear here so you can verify the time, stake, and prediction.
                    </td>
                  </tr>
                ) : (
                  data.items.map((row) => <HistoryRow key={`${row.source}-${row.id}`} row={row} />)
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" type="button" disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))}>
            Prev
          </Button>
          <span className="text-sm text-ink-2">
            {page} / {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            type="button"
            disabled={page >= pageCount || loading}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </GameLayout>
  )
}

function HistoryRow({ row }: { row: BetHistoryItem }) {
  return (
    <tr className="border-b border-line align-top text-ink">
      <td className="whitespace-nowrap px-4 py-3">
        <div>{formatBetWhen(row.playedAt)}</div>
        <div className="mt-1 font-mono text-[11px] text-ink-2" title={row.id}>
          {row.id.slice(0, 8)}
        </div>
      </td>
      <td className="whitespace-nowrap px-4 py-3">
        <div className="font-medium">{row.game}</div>
        <div className="text-xs text-ink-2">{row.source === 'sports' ? 'Sports' : 'Casino'}</div>
      </td>
      <td className="px-4 py-3">
        <div>{row.prediction}</div>
        {row.detail ? <div className="mt-1 text-xs text-ink-2">{row.detail}</div> : null}
      </td>
      <td className="px-4 py-3">{row.outcome}</td>
      <td className="whitespace-nowrap px-4 py-3">{formatBetMoney(row.amount, row.currency)}</td>
      <td className="whitespace-nowrap px-4 py-3">{formatOdds(row.odds)}</td>
      <td className="whitespace-nowrap px-4 py-3">{formatBetMoney(row.payout, row.currency)}</td>
      <td className="whitespace-nowrap px-4 py-3">
        <StatusPill status={row.status} />
      </td>
    </tr>
  )
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === 'won'
      ? 'bg-brand/15 text-brand-2'
      : status === 'lost'
        ? 'bg-danger-muted text-danger'
        : status === 'pending'
          ? 'bg-warn-muted text-warn'
          : 'bg-elevated text-ink-2'
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${tone}`}>{betStatusLabel(status)}</span>
}
