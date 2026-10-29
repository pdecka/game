'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import StatCard from '../components/StatCard'
import { adminAuthService, type AdminUser } from '../../services/adminAuthService'
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

export default function BetHistoryEnhanced() {
  const searchParams = useSearchParams()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [userId, setUserId] = useState(searchParams.get('userId') || '')
  const [userQuery, setUserQuery] = useState('')
  const [source, setSource] = useState<'all' | 'sports' | 'game'>('all')
  const [order, setOrder] = useState<'desc' | 'asc'>('desc')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<BetHistoryResponse>(empty)

  useEffect(() => {
    let mounted = true
    adminAuthService
      .getUsers()
      .then((rows) => {
        if (mounted) setUsers(rows)
      })
      .catch(() => {
        if (mounted) setUsers([])
      })
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        setLoading(true)
        const query = userQuery.trim().toLowerCase()
        if (query && users.length > 0) {
          const matches = users.filter((user) => user.username.toLowerCase().includes(query))
          const chosen = matches.some((user) => user.id === userId)
          if (matches.length === 0 || (matches.length > 1 && !chosen)) {
            if (!cancelled) setData(empty)
            return
          }
        }
        const rows = await adminAuthService.getBetHistory({
          userId: userId || undefined,
          page,
          pageSize: 25,
          source,
          order,
        })
        if (!cancelled) setData(rows)
      } catch (err: any) {
        if (!cancelled) {
          toast.error(err?.response?.data?.message || 'Failed to load bet history')
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
  }, [userId, page, source, order, userQuery, users])

  const selected = users.find((user) => user.id === userId)
  const pageCount = Math.max(1, Math.ceil((data.total || 0) / (data.pageSize || 25)))
  const userSearch = userQuery.trim().toLowerCase()
  const matchedUsers = useMemo(() => {
    if (!userSearch) return users
    return users.filter((user) => user.username.toLowerCase().includes(userSearch))
  }, [users, userSearch])
  const noUserMatch = Boolean(userSearch) && users.length > 0 && matchedUsers.length === 0

  const onUserSearch = (value: string) => {
    setUserQuery(value)
    setPage(1)
    const query = value.trim().toLowerCase()
    if (!query) {
      setUserId('')
      return
    }
    const matches = users.filter((user) => user.username.toLowerCase().includes(query))
    const exact = matches.find((user) => user.username.toLowerCase() === query)
    if (exact) setUserId(exact.id)
    else if (matches.length === 1) setUserId(matches[0].id)
    else setUserId('')
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#14532d]">Bet History</h1>
          <p className="mt-1 text-[#64748b]">
            {selected
              ? `Every bet placed by ${selected.username}, newest first. Open a player from Users to land here.`
              : 'Every sports and casino bet across players. Newest entries are listed first.'}
          </p>
        </div>
        <Link
          href="/admin/users"
          className="rounded-lg border border-[#16a34a] bg-white px-4 py-2 text-sm font-medium text-[#14532d] hover:bg-[#f0fdf4]"
        >
          Back to users
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Bets in view" value={loading ? '...' : String(data.summary.total)} />
        <StatCard title="Total staked" value={loading ? '...' : formatBetMoney(data.summary.totalStake)} />
        <StatCard title="Total returned" value={loading ? '...' : formatBetMoney(data.summary.totalPayout)} />
        <StatCard title="Open bets" value={loading ? '...' : String(data.summary.open)} />
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-[#bbf7d0] bg-white p-4 shadow-sm lg:flex-row lg:items-center">
        <input
          value={userQuery}
          onChange={(event) => onUserSearch(event.target.value)}
          placeholder="Search username"
          aria-label="Search username"
          className="w-full rounded-md border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2 text-[#020617] outline-none placeholder:text-[#64748b] focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e] lg:max-w-xs"
        />
        <select
          value={matchedUsers.some((user) => user.id === userId) ? userId : ''}
          onChange={(event) => {
            const nextId = event.target.value
            setUserId(nextId)
            setPage(1)
            if (!nextId) setUserQuery('')
          }}
          className="w-full rounded-md border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2 text-[#020617] outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e] lg:max-w-xs"
        >
          <option value="">{userSearch ? 'Matching users' : 'All users'}</option>
          {matchedUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.username}
            </option>
          ))}
        </select>
        <select
          value={source}
          onChange={(event) => {
            setSource(event.target.value as 'all' | 'sports' | 'game')
            setPage(1)
          }}
          className="w-full rounded-md border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2 text-[#020617] outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e] lg:max-w-[180px]"
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
          className="w-full rounded-md border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2 text-[#020617] outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e] lg:max-w-[180px]"
        >
          <option value="desc">Newest first</option>
          <option value="asc">Oldest first</option>
        </select>
        <p className="text-sm text-[#64748b] lg:ml-auto">{loading ? 'Loading...' : `${data.total} entries · IST`}</p>
      </div>

      <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
        <div className="overflow-auto">
          <table className="min-w-[1080px] w-full text-sm">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-[#e2e8f0] text-left text-[#64748b]">
                <th className="py-3 pr-4 font-medium">Date & time</th>
                <th className="py-3 pr-4 font-medium">User</th>
                <th className="py-3 pr-4 font-medium">Game</th>
                <th className="py-3 pr-4 font-medium">Prediction</th>
                <th className="py-3 pr-4 font-medium">Result</th>
                <th className="py-3 pr-4 font-medium">Stake</th>
                <th className="py-3 pr-4 font-medium">Odds</th>
                <th className="py-3 pr-4 font-medium">Payout</th>
                <th className="py-3 pr-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {!loading && noUserMatch ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-[#64748b]">
                    No user found for that username.
                  </td>
                </tr>
              ) : !loading && userSearch && matchedUsers.length > 1 && !selected ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-[#64748b]">
                    Several usernames match. Choose one from the list.
                  </td>
                </tr>
              ) : !loading && data.items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-[#64748b]">
                    No bets found for this view.
                  </td>
                </tr>
              ) : (
                data.items.map((row) => <AdminHistoryRow key={`${row.source}-${row.id}`} row={row} />)
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="rounded-md bg-[#e2e8f0] px-3 py-1.5 text-[#020617] transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm text-[#64748b]">
            {page} / {pageCount}
          </span>
          <button
            type="button"
            disabled={page >= pageCount || loading}
            onClick={() => setPage((current) => current + 1)}
            className="rounded-md bg-[#e2e8f0] px-3 py-1.5 text-[#020617] transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}

function AdminHistoryRow({ row }: { row: BetHistoryItem }) {
  const tone =
    row.status === 'won'
      ? 'text-[#15803d]'
      : row.status === 'lost'
        ? 'text-[#b91c1c]'
        : row.status === 'pending'
          ? 'text-[#a16207]'
          : 'text-[#64748b]'
  return (
    <tr className="border-b border-[#e2e8f0] align-top text-[#020617]">
      <td className="whitespace-nowrap py-3 pr-4">
        <div>{formatBetWhen(row.playedAt)}</div>
        <div className="mt-1 font-mono text-[11px] text-[#64748b]" title={row.id}>
          {row.id.slice(0, 8)}
        </div>
      </td>
      <td className="whitespace-nowrap py-3 pr-4 font-medium">{row.username}</td>
      <td className="whitespace-nowrap py-3 pr-4">
        <div>{row.game}</div>
        <div className="text-xs text-[#64748b]">{row.source === 'sports' ? 'Sports' : 'Casino'}</div>
      </td>
      <td className="py-3 pr-4">
        <div>{row.prediction}</div>
        {row.detail ? <div className="mt-1 text-xs text-[#64748b]">{row.detail}</div> : null}
      </td>
      <td className="py-3 pr-4">{row.outcome}</td>
      <td className="whitespace-nowrap py-3 pr-4">{formatBetMoney(row.amount, row.currency)}</td>
      <td className="whitespace-nowrap py-3 pr-4">{formatOdds(row.odds)}</td>
      <td className="whitespace-nowrap py-3 pr-4">{formatBetMoney(row.payout, row.currency)}</td>
      <td className={`whitespace-nowrap py-3 pr-4 font-semibold uppercase ${tone}`}>{betStatusLabel(row.status)}</td>
    </tr>
  )
}
