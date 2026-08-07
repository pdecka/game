'use client'

import { useCallback, useEffect, useState } from 'react'
import EnhancedPage from './EnhancedPage'
import { adminAuthService } from '../../services/adminAuthService'

function fmtINR(n: number) {
  if (n == null || Number.isNaN(n)) return '—'
  return `₹${Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

export default function DashboardEnhanced() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [data, setData] = useState<Awaited<ReturnType<typeof adminAuthService.getDashboard>> | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const d = await adminAuthService.getDashboard({
        from: from || undefined,
        to: to || undefined,
      })
      setData(d)
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [from, to])

  useEffect(() => {
    void load()
  }, [load])

  const cards = data
    ? [
        { title: 'Total Users', value: String(data.totalUsers), trend: `${data.activeUsers} active` },
        { title: 'Total Deposits', value: fmtINR(data.totalDeposits), trend: `${data.pendingDeposits} pending` },
        { title: 'Total Withdrawals', value: fmtINR(data.totalWithdrawals), trend: `${data.pendingWithdrawals} pending` },
        { title: 'Profit / Loss (ledger)', value: fmtINR(data.profitLoss), trend: `Bets ${fmtINR(data.totalBets)}` },
      ]
    : [
        { title: 'Total Users', value: '—' },
        { title: 'Total Deposits', value: '—' },
        { title: 'Total Withdrawals', value: '—' },
        { title: 'Profit / Loss (ledger)', value: '—' },
      ]

  const rows: string[][] = data
    ? [
        ['Summary', 'Pending deposits', '—', fmtINR(0), String(data.pendingDeposits), 'now'],
        ['Summary', 'Pending withdrawals', '—', fmtINR(0), String(data.pendingWithdrawals), 'now'],
        ['Summary', 'Total wins (ledger)', '—', fmtINR(data.totalWins), 'settled', 'now'],
        ['Summary', 'Total losses (ledger)', '—', fmtINR(data.totalLosses), 'settled', 'now'],
        ['Summary', 'Pending KYC', '—', '—', String(data.pendingKYC), 'now'],
      ]
    : []

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#ffffff]">Dashboard</h1>
          <p className="text-[#64748b] mt-1">Live metrics from your database. Filter by completed-ledger date range.</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs text-[#94a3b8] flex flex-col gap-1">
            From
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="text-xs text-[#94a3b8] flex flex-col gap-1">
            To
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="rounded-md bg-emerald-500/90 px-4 py-2 text-sm font-medium text-black hover:bg-emerald-400 disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </div>
      {err ? <p className="text-sm text-red-400">{err}</p> : null}
      <EnhancedPage
        title=""
        description=""
        ctaLabel="Reports"
        cards={cards}
        columns={['Segment', 'Metric', 'User', 'Amount', 'Count / status', 'Time']}
        rows={rows}
      />
    </section>
  )
}
