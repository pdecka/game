'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import StatCard from '../components/StatCard'
import { adminAuthService } from '../../services/adminAuthService'
import { adminFinanceService, type PaymentRequestRow } from '../../services/adminFinanceService'
import { useAdminDateRange } from '../components/DateRangeCalendar'
import DateRangePicker from '../components/DateRangePicker'
import CreatePlayerModal from '../components/CreatePlayerModal'
import { istDayBounds } from '../../lib/istDates'

function fmtINR(n: number) {
  if (n == null || Number.isNaN(n)) return '—'
  return `₹${Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

function formatWhen(value?: string | Date) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
}

function LiveQueue({
  title,
  href,
  rows,
  empty,
}: {
  title: string
  href: string
  rows: PaymentRequestRow[]
  empty: string
}) {
  return (
    <div className="rounded-xl border border-[#bbf7d0] bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-[#14532d]">{title}</h2>
        <Link href={href} className="text-xs font-semibold text-[#16a34a] hover:underline">
          Open
        </Link>
      </div>
      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[#e2e8f0] px-3 py-6 text-center text-sm text-[#64748b]">{empty}</p>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-[#e2e8f0] text-left text-[#64748b]">
                <th className="py-2 pr-3 font-medium">User</th>
                <th className="py-2 pr-3 font-medium">Amount</th>
                <th className="py-2 pr-3 font-medium">Method</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 font-medium">Created (IST)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-[#e2e8f0] text-[#020617]">
                  <td className="py-2 pr-3 whitespace-nowrap">{row.username || row.userId}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">{fmtINR(Number(row.amount))}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">{row.method}</td>
                  <td className="py-2 pr-3 whitespace-nowrap capitalize">{row.status}</td>
                  <td className="py-2 whitespace-nowrap">{formatWhen(row.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function DashboardEnhanced() {
  const { range, setRange } = useAdminDateRange('today')
  const [addOpen, setAddOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [data, setData] = useState<Awaited<ReturnType<typeof adminAuthService.getDashboard>> | null>(null)
  const [pendingDeposits, setPendingDeposits] = useState<PaymentRequestRow[]>([])
  const [pendingWithdrawals, setPendingWithdrawals] = useState<PaymentRequestRow[]>([])

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true)
      setErr(null)
      try {
        const bounds = istDayBounds(range.from, range.to)
        const [d, deposits, withdrawals] = await Promise.all([
          adminAuthService.getDashboard(bounds),
          adminFinanceService.getDeposits({ status: 'pending', limit: 20, offset: 0 }),
          adminFinanceService.getWithdrawals({ status: 'pending', limit: 20, offset: 0 }),
        ])
        setData(d)
        setPendingDeposits(deposits.items || [])
        setPendingWithdrawals(withdrawals.items || [])
      } catch (e: any) {
        if (!silent) setErr(e?.response?.data?.message || e?.message || 'Failed to load dashboard')
      } finally {
        if (!silent) setLoading(false)
      }
    },
    [range.from, range.to],
  )

  useEffect(() => {
    void load()
    const timer = window.setInterval(() => {
      if (document.hidden) return
      void load(true)
    }, 5000)
    return () => window.clearInterval(timer)
  }, [load])

  const cards = data
    ? [
        { title: 'Total Users', value: String(data.totalUsers), trend: `${data.activeUsers} active` },
        { title: 'Deposits (range)', value: fmtINR(data.totalDeposits), trend: `${data.pendingDeposits} pending` },
        { title: 'Withdrawals (range)', value: fmtINR(data.totalWithdrawals), trend: `${data.pendingWithdrawals} pending` },
        { title: 'Profit / Loss', value: fmtINR(data.profitLoss), trend: `Bets ${fmtINR(data.totalBets)}` },
        { title: 'Pending deposits', value: String(data.pendingDeposits), trend: `${pendingDeposits.length} in queue` },
        { title: 'Pending withdrawals', value: String(data.pendingWithdrawals), trend: `${pendingWithdrawals.length} in queue` },
        { title: 'Pending KYC', value: String(data.pendingKYC), trend: 'Live count' },
        { title: 'Wins / Losses', value: `${fmtINR(data.totalWins)} / ${fmtINR(data.totalLosses)}`, trend: 'Ledger' },
      ]
    : [
        { title: 'Total Users', value: loading ? '...' : '—' },
        { title: 'Deposits (range)', value: loading ? '...' : '—' },
        { title: 'Withdrawals (range)', value: loading ? '...' : '—' },
        { title: 'Profit / Loss', value: loading ? '...' : '—' },
        { title: 'Pending deposits', value: loading ? '...' : '—' },
        { title: 'Pending withdrawals', value: loading ? '...' : '—' },
        { title: 'Pending KYC', value: loading ? '...' : '—' },
        { title: 'Wins / Losses', value: loading ? '...' : '—' },
      ]

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-2xl font-semibold text-[#14532d]">Dashboard</h1>
        <div className="flex flex-wrap items-center gap-3">
          <DateRangePicker from={range.from} to={range.to} onChange={setRange} />
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="self-start rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold px-5 py-2.5 shadow-sm"
          >
            Add User
          </button>
        </div>
      </div>
      {err ? <p className="text-sm text-red-600">{err}</p> : null}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <LiveQueue
          title="Pending deposits"
          href="/admin/deposits"
          rows={pendingDeposits}
          empty="No pending deposits"
        />
        <LiveQueue
          title="Pending withdrawals"
          href="/admin/withdrawals"
          rows={pendingWithdrawals}
          empty="No pending withdrawals"
        />
      </div>

      <CreatePlayerModal open={addOpen} onClose={() => setAddOpen(false)} onCreated={() => void load(true)} />
    </section>
  )
}
