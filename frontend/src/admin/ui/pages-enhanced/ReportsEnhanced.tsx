'use client'

import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import StatCard from '../components/StatCard'
import DateRangeCalendar, { useAdminDateRange } from '../components/DateRangeCalendar'
import { istDayBounds } from '../../lib/istDates'
import { adminFinanceService } from '../../services/adminFinanceService'

export default function ReportsEnhanced() {
  const [loading, setLoading] = useState(false)
  const { range, setRange } = useAdminDateRange()
  const [userId, setUserId] = useState<string>('')

  const [report, setReport] = useState<{
    totalDeposits: number
    totalWithdrawals: number
    totalBets: number
    totalWins: number
    totalLosses: number
    profitLoss: number
  } | null>(null)

  const currency = 'INR'

  const formatMoney = (amount: number) => `₹${Number(amount).toFixed(2)}`

  const load = async () => {
    try {
      setLoading(true)
      const bounds = istDayBounds(range.from, range.to)
      const data = await adminFinanceService.getFinancialReport({
        from: bounds.from,
        to: bounds.to,
        userId: userId || undefined,
      })
      setReport(data)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    const t = window.setInterval(() => {
      if (document.hidden) return
      void load()
    }, 12000)
    return () => window.clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.from, range.to, userId])

  const cards = useMemo(() => {
    return [
      {
        title: 'Total Deposits',
        value: loading ? '...' : report ? formatMoney(report.totalDeposits) : '0.00',
        trend: 'Completed deposits',
        trendUp: true,
      },
      {
        title: 'Total Withdrawals',
        value: loading ? '...' : report ? formatMoney(report.totalWithdrawals) : '0.00',
        trend: 'Completed withdrawals',
        trendUp: false,
      },
      {
        title: 'Total Bets',
        value: loading ? '...' : report ? formatMoney(report.totalBets) : '0.00',
        trend: 'Wager volume',
        trendUp: true,
      },
      {
        title: 'Profit/Loss',
        value: loading ? '...' : report ? formatMoney(report.profitLoss) : '0.00',
        trend: report ? (report.profitLoss >= 0 ? 'House P/L positive' : 'House P/L negative') : '',
        trendUp: (report?.profitLoss ?? 0) >= 0,
      },
    ]
  }, [loading, report])

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#14532d]">Reports</h1>
        <p className="text-[#64748b] mt-1">Financial summary from ledger entries. Default last 2 IST days, reset at 12:00 AM India time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((c) => (
          <StatCard key={c.title} title={c.title} value={c.value} trend={c.trend} trendUp={c.trendUp} />
        ))}
      </div>

      <div className="rounded-xl bg-[#ffffff] border border-[#e2e8f0] p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
          <div className="flex flex-col xl:flex-row gap-3">
            <DateRangeCalendar from={range.from} to={range.to} onChange={setRange} />
            <div className="min-w-[220px]">
              <label className="text-xs text-[#64748b]">User ID (optional)</label>
              <input
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="User UUID"
                className="mt-1 w-full rounded-md bg-[#f0fdf4] border border-[#bbf7d0] px-3 py-2 text-[#020617] placeholder:text-[#64748b] focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={load}
              disabled={loading}
              className="rounded-lg bg-[#22c55e] hover:opacity-90 disabled:opacity-50 text-[#ffffff] px-5 py-2 text-sm font-semibold transition-all"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-[#ffffff] border border-[#e2e8f0] p-4 shadow-sm overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-[#64748b] border-b border-[#e2e8f0] bg-[#e2e8f0]">
              <th className="py-3 pr-4 font-medium">Metric</th>
              <th className="py-3 pr-4 font-medium">Value</th>
            </tr>
          </thead>
          <tbody>
            {report ? (
              <>
                <tr className="border-b border-[#e2e8f0] hover:bg-[#e2e8f0]/40 text-[#020617] transition-all duration-200">
                  <td className="py-3 pr-4 whitespace-nowrap">Deposits</td>
                  <td className="py-3 pr-4 whitespace-nowrap">{formatMoney(report.totalDeposits)}</td>
                </tr>
                <tr className="border-b border-[#e2e8f0] hover:bg-[#e2e8f0]/40 text-[#020617] transition-all duration-200">
                  <td className="py-3 pr-4 whitespace-nowrap">Withdrawals</td>
                  <td className="py-3 pr-4 whitespace-nowrap">{formatMoney(report.totalWithdrawals)}</td>
                </tr>
                <tr className="border-b border-[#e2e8f0] hover:bg-[#e2e8f0]/40 text-[#020617] transition-all duration-200">
                  <td className="py-3 pr-4 whitespace-nowrap">Bets</td>
                  <td className="py-3 pr-4 whitespace-nowrap">{formatMoney(report.totalBets)}</td>
                </tr>
                <tr className="border-b border-[#e2e8f0] hover:bg-[#e2e8f0]/40 text-[#020617] transition-all duration-200">
                  <td className="py-3 pr-4 whitespace-nowrap">Wins</td>
                  <td className="py-3 pr-4 whitespace-nowrap">{formatMoney(report.totalWins)}</td>
                </tr>
                <tr className="border-b border-[#e2e8f0] hover:bg-[#e2e8f0]/40 text-[#020617] transition-all duration-200">
                  <td className="py-3 pr-4 whitespace-nowrap">Losses</td>
                  <td className="py-3 pr-4 whitespace-nowrap">{formatMoney(report.totalLosses)}</td>
                </tr>
                <tr className="border-b border-[#e2e8f0] hover:bg-[#e2e8f0]/40 text-[#020617] transition-all duration-200">
                  <td className="py-3 pr-4 whitespace-nowrap font-semibold">Profit/Loss</td>
                  <td className="py-3 pr-4 whitespace-nowrap font-semibold">{formatMoney(report.profitLoss)}</td>
                </tr>
              </>
            ) : (
              <tr>
                <td colSpan={2}>
                  <div className="rounded-lg border border-dashed border-[#e2e8f0] p-8 text-center text-[#64748b] bg-[#ffffff]">
                    No data for the selected range
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

