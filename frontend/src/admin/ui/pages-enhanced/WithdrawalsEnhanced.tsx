'use client'

import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import StatCard from '../components/StatCard'
import { adminFinanceService, type PaymentRequestRow } from '../../services/adminFinanceService'

type WithdrawalFilter = {
  status?: string
  username?: string
  from?: string
  to?: string
}

function formatMoney(amount: number, currency: string) {
  if (currency === 'INR') return `₹${Number(amount).toFixed(2)}`
  return `${currency} ${Number(amount).toFixed(2)}`
}

export default function WithdrawalsEnhanced() {
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<PaymentRequestRow[]>([])

  const [filter, setFilter] = useState<WithdrawalFilter>({
    status: 'pending',
  })

  const stats = useMemo(() => {
    const total = rows.length
    const pending = rows.filter((r) => r.status === 'pending' || r.status === 'processing').length
    const completed = rows.filter((r) => r.status === 'completed').length
    const failed = rows.filter((r) => r.status === 'failed').length
    return [
      { title: 'Requests in View', value: total ? String(total) : '-', trend: `Pending: ${pending}` },
      { title: 'Pending', value: String(pending), trend: `${pending > 0 ? pending : 0} need approval` },
      { title: 'Approved', value: String(completed), trend: `${completed > 0 ? completed : 0} completed` },
      { title: 'Rejected', value: String(failed), trend: `${failed > 0 ? failed : 0} failed`, trendUp: failed === 0 },
    ]
  }, [rows])

  const load = async () => {
    try {
      setLoading(true)
      const data = await adminFinanceService.getWithdrawals({
        status: filter.status,
        username: filter.username,
        from: filter.from,
        to: filter.to,
        limit: 30,
        offset: 0,
      })
      setRows(data.items || [])
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load withdrawals')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const t = setInterval(() => {
      void load()
    }, 12000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter.status, filter.from, filter.to, filter.username])

  const canReview = (status: string) => status === 'pending' || status === 'processing'

  const onApprove = async (paymentId: string) => {
    try {
      const payoutReference = window.prompt('Enter payout reference / UTR (required for INR):') ?? ''
      const payoutScreenshotUrl = window.prompt('Enter payout screenshot URL (required for INR):') ?? ''
      await adminFinanceService.approveWithdrawal(paymentId, {
        payoutReference: payoutReference.trim() || undefined,
        payoutScreenshotUrl: payoutScreenshotUrl.trim() || undefined,
      })
      toast.success('Withdrawal approved')
      await load()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Approve failed')
    }
  }

  const onReject = async (paymentId: string) => {
    try {
      await adminFinanceService.rejectWithdrawal(paymentId, 'Rejected by admin')
      toast.success('Withdrawal rejected')
      await load()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Reject failed')
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#ffffff]">Withdrawals</h1>
        <p className="text-[#64748b] mt-1">Approve or reject withdrawal requests stored in the database.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.title} title={s.title} value={loading ? '...' : s.value} trend={s.trend} trendUp={s.trendUp} />
        ))}
      </div>

      <div className="rounded-xl bg-[#ffffff] border border-[#e2e8f0] p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-end lg:justify-between">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="min-w-[170px]">
              <label className="text-xs text-[#64748b]">From</label>
              <input
                type="date"
                className="mt-1 w-full rounded-md bg-[#e2e8f0] border border-[#e2e8f0] px-3 py-2 text-[#020617] focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
                value={filter.from ?? ''}
                onChange={(e) => setFilter((f) => ({ ...f, from: e.target.value || undefined }))}
              />
            </div>
            <div className="min-w-[170px]">
              <label className="text-xs text-[#64748b]">To</label>
              <input
                type="date"
                className="mt-1 w-full rounded-md bg-[#e2e8f0] border border-[#e2e8f0] px-3 py-2 text-[#020617] focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
                value={filter.to ?? ''}
                onChange={(e) => setFilter((f) => ({ ...f, to: e.target.value || undefined }))}
              />
            </div>
            <div className="min-w-[220px]">
              <label className="text-xs text-[#64748b]">User (username)</label>
              <input
                className="mt-1 w-full rounded-md bg-[#e2e8f0] border border-[#e2e8f0] px-3 py-2 text-[#020617] placeholder:text-[#64748b] focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
                placeholder="e.g. romil"
                value={filter.username ?? ''}
                onChange={(e) => setFilter((f) => ({ ...f, username: e.target.value || undefined }))}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFilter((f) => ({ ...f, status: undefined }))} className="rounded-lg border border-[#e2e8f0] bg-[#ffffff] hover:bg-[#e2e8f0]/40 text-[#020617] px-4 py-2 text-xs font-semibold transition-all">
              All
            </button>
            <button onClick={() => setFilter((f) => ({ ...f, status: 'pending' }))} className="rounded-lg bg-[#22c55e] hover:opacity-90 text-[#ffffff] px-4 py-2 text-xs font-semibold shadow-sm">
              Pending
            </button>
            <button onClick={() => setFilter((f) => ({ ...f, status: 'completed' }))} className="rounded-lg border border-[#e2e8f0] bg-[#ffffff] hover:bg-[#e2e8f0]/40 text-[#020617] px-4 py-2 text-xs font-semibold transition-all">
              Approved
            </button>
            <button onClick={() => setFilter((f) => ({ ...f, status: 'failed' }))} className="rounded-lg border border-[#e2e8f0] bg-[#ffffff] hover:bg-[#e2e8f0]/40 text-[#020617] px-4 py-2 text-xs font-semibold transition-all">
              Rejected
            </button>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={load}
            disabled={loading}
            className="rounded-lg bg-[#22c55e] hover:opacity-90 disabled:opacity-50 text-[#ffffff] px-5 py-2 text-sm font-semibold transition-all"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-[#ffffff] border border-[#e2e8f0] p-4 shadow-sm overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-[#64748b] border-b border-[#e2e8f0] bg-[#e2e8f0]">
              <th className="py-3 pr-4 font-medium">User</th>
              <th className="py-3 pr-4 font-medium">Amount</th>
              <th className="py-3 pr-4 font-medium">Status</th>
              <th className="py-3 pr-4 font-medium">Method</th>
              <th className="py-3 pr-4 font-medium">Bank</th>
              <th className="py-3 pr-4 font-medium">Created</th>
              <th className="py-3 pr-4 font-medium">Payout Proof</th>
              <th className="py-3 pr-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="rounded-lg border border-dashed border-[#e2e8f0] p-8 text-center text-[#64748b] bg-[#ffffff]">
                    No withdrawal requests found
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const reviewable = canReview(r.status)
                return (
                  <tr key={r.id} className="border-b border-[#e2e8f0] hover:bg-[#e2e8f0]/40 text-[#020617] transition-all duration-200">
                    <td className="py-3 pr-4 whitespace-nowrap">{r.username || r.userId}</td>
                    <td className="py-3 pr-4 whitespace-nowrap">{formatMoney(r.amount, r.currency)}</td>
                    <td className="py-3 pr-4 whitespace-nowrap capitalize">{r.status}</td>
                    <td className="py-3 pr-4 whitespace-nowrap">{r.method}</td>
                    <td className="py-3 pr-4 whitespace-nowrap">
                      {r.bank?.bankName || r.bank?.bank || r.bank?.bank_name || '-'}
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap">{r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}</td>
                    <td className="py-3 pr-4 whitespace-nowrap">
                      {r.payoutReference ? (
                        <div className="flex flex-col">
                          <span>{r.payoutReference}</span>
                          {r.payoutScreenshotUrl ? (
                            <a className="text-xs text-emerald-600 hover:underline" href={r.payoutScreenshotUrl} target="_blank" rel="noreferrer">
                              View proof
                            </a>
                          ) : null}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          disabled={!reviewable}
                          onClick={() => onApprove(r.id)}
                          className="rounded-md px-3 py-1 bg-[#22c55e] hover:opacity-90 disabled:opacity-50 text-[#ffffff] text-xs transition-all duration-200"
                        >
                          Approve
                        </button>
                        <button
                          disabled={!reviewable}
                          onClick={() => onReject(r.id)}
                          className="rounded-md px-3 py-1 bg-[#020617] hover:opacity-90 disabled:opacity-50 text-[#ffffff] text-xs transition-all duration-200 border border-[#e2e8f0]"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

