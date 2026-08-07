'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'

type DepositRow = {
  id: string
  amount: number
  currency: string
  method: string
  status: string
  reference?: string | null
  transactionId?: string | null
  createdAt?: string | Date
}

type WithdrawalRow = {
  id: string
  amount: number
  currency: string
  method: string
  status: string
  reference?: string | null
  bank?: any
  address?: string | null
  createdAt?: string | Date
}

type BankDefault = {
  bankName: string
  accountHolder: string
  accountNumber: string
  ifsc: string
  status?: string
}

function formatINR(amount: number) {
  return `₹${Number(amount ?? 0).toFixed(2)}`
}

export default function WalletPage() {
  const router = useRouter()
  const { ready, user, wallet, walletLoading, refreshWallet, logout } = useAuth() as any

  const [deposits, setDeposits] = useState<DepositRow[]>([])
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const [bankDefault, setBankDefault] = useState<BankDefault | null>(null)

  const [depositAmount, setDepositAmount] = useState<string>('') // INR amount
  const [depositRef, setDepositRef] = useState<string>('') // UTR/reference
  const [depositBusy, setDepositBusy] = useState(false)

  const [withdrawAmount, setWithdrawAmount] = useState<string>('')
  const [withdrawBusy, setWithdrawBusy] = useState(false)

  const [withdrawBank, setWithdrawBank] = useState({
    bankName: '',
    accountHolder: '',
    accountNumber: '',
    ifsc: '',
    reference: '',
  })

  const balanceINR = wallet?.INR ? Number(wallet.INR) : 0
  const exposureINR = wallet?.locked?.INR != null ? Number(wallet.locked.INR) : 0

  const loadDefaults = async () => {
    try {
      const res = await api.get('/wallet/bank-default')
      setBankDefault(res.data ?? null)
      if (res.data) {
        setWithdrawBank((b) => ({
          ...b,
          bankName: b.bankName || res.data.bankName || '',
          accountHolder: b.accountHolder || res.data.accountHolder || '',
          accountNumber: b.accountNumber || res.data.accountNumber || '',
          ifsc: b.ifsc || res.data.ifsc || '',
        }))
      }
    } catch {
      // If no default bank accounts exist yet, user can still input manually.
      setBankDefault(null)
    }
  }

  const loadHistory = async () => {
    try {
      setLoadingHistory(true)
      const [depRes, wdRes] = await Promise.all([
        api.get('/payments/deposits', { params: { limit: 50, offset: 0 } }),
        api.get('/payments/withdrawals', { params: { limit: 50, offset: 0 } }),
      ])
      setDeposits(depRes.data?.items ?? [])
      setWithdrawals(wdRes.data?.items ?? [])
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load wallet history')
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    if (!ready) return
    if (!user) router.push('/auth/login')
  }, [ready, user, router])

  useEffect(() => {
    if (!ready || !user) return
    loadDefaults()
    loadHistory()

    const t = setInterval(() => {
      loadHistory()
      refreshWallet?.()
    }, 10000)

    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user?.id])

  const submitDeposit = async () => {
    const amount = Number(depositAmount)
    if (!amount || amount <= 0) return toast.error('Enter a valid deposit amount')
    if (!depositRef.trim()) return toast.error('Enter UTR/reference for deposit')
    if (depositBusy) return

    try {
      setDepositBusy(true)
      await api.post('/payments/deposit', {
        amount,
        currency: 'INR',
        method: 'bank_transfer',
        reference: depositRef.trim(),
      })
      toast.success('Deposit request submitted (pending admin approval)')
      setDepositAmount('')
      setDepositRef('')
      await loadHistory()
      refreshWallet?.()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Deposit request failed')
    } finally {
      setDepositBusy(false)
    }
  }

  const submitWithdrawal = async () => {
    const amount = Number(withdrawAmount)
    if (!amount || amount <= 0) return toast.error('Enter a valid withdrawal amount')
    if (amount > balanceINR) return toast.error('Insufficient wallet balance')

    if (!withdrawBank.bankName.trim()) return toast.error('Bank name is required')
    if (!withdrawBank.accountHolder.trim()) return toast.error('Account holder is required')
    if (!withdrawBank.accountNumber.trim()) return toast.error('Account number is required')
    if (!withdrawBank.ifsc.trim()) return toast.error('IFSC is required')

    if (withdrawBusy) return

    try {
      setWithdrawBusy(true)
      await api.post('/payments/withdrawal', {
        amount,
        currency: 'INR',
        method: 'bank_transfer',
        accountDetails: {
          bankName: withdrawBank.bankName.trim(),
          accountHolder: withdrawBank.accountHolder.trim(),
          accountNumber: withdrawBank.accountNumber.trim(),
          ifsc: withdrawBank.ifsc.trim(),
          reference: withdrawBank.reference.trim() || undefined,
        },
      })
      toast.success('Withdrawal request submitted (pending admin approval)')
      setWithdrawAmount('')
      setWithdrawBank((b) => ({ ...b, reference: '' }))
      await loadHistory()
      refreshWallet?.()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Withdrawal request failed')
    } finally {
      setWithdrawBusy(false)
    }
  }

  const canSubmitWithdrawal = useMemo(() => {
    const amount = Number(withdrawAmount)
    return amount > 0 && amount <= balanceINR
  }, [withdrawAmount, balanceINR])

  if (!ready || walletLoading) {
    return <div className="min-h-screen flex items-center justify-center text-[#e2e8f0]">Loading...</div>
  }

  return (
    <main className="min-h-screen bg-[#020617] text-[#e2e8f0]">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#ffffff]">Wallet</h1>
          <p className="text-[#64748b] mt-1">Manage deposits, withdrawals, and view request history.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <div className="rounded-xl bg-[#ffffff] border border-[#e2e8f0] p-5 shadow-sm">
            <p className="text-[#64748b] text-sm">Available Balance (INR)</p>
            <p className="text-3xl font-bold text-[#020617] mt-2">{formatINR(balanceINR)}</p>
          </div>
          <div className="rounded-xl bg-[#ffffff] border border-[#e2e8f0] p-5 shadow-sm">
            <p className="text-[#64748b] text-sm">Exposure / Locked (INR)</p>
            <p className="text-3xl font-bold text-[#020617] mt-2">{formatINR(exposureINR)}</p>
            <p className="text-xs text-[#64748b] mt-1">Sports & open bets held here until settled.</p>
          </div>
          <div className="rounded-xl bg-[#ffffff] border border-[#e2e8f0] p-5 shadow-sm">
            <p className="text-[#64748b] text-sm">Pending Deposits</p>
            <p className="text-3xl font-bold text-[#020617] mt-2">
              {deposits.filter((d) => d.status === 'pending' || d.status === 'processing').length}
            </p>
          </div>
          <div className="rounded-xl bg-[#ffffff] border border-[#e2e8f0] p-5 shadow-sm">
            <p className="text-[#64748b] text-sm">Pending Withdrawals</p>
            <p className="text-3xl font-bold text-[#020617] mt-2">
              {withdrawals.filter((w) => w.status === 'pending' || w.status === 'processing').length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="rounded-xl bg-[#ffffff] border border-[#e2e8f0] p-5 shadow-sm">
            <h2 className="text-[#020617] text-xl font-semibold">Deposit</h2>
            <p className="text-[#64748b] mt-1 text-sm">Transfer externally, then submit UTR/reference for admin verification.</p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs text-[#64748b]">Amount (INR)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="mt-1 w-full rounded-md bg-[#e2e8f0] border border-[#e2e8f0] px-3 py-2 text-[#020617] placeholder:text-[#64748b] focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
                  placeholder="e.g. 5000"
                />
              </div>
              <div>
                <label className="text-xs text-[#64748b]">UTR / Reference</label>
                <input
                  value={depositRef}
                  onChange={(e) => setDepositRef(e.target.value)}
                  className="mt-1 w-full rounded-md bg-[#e2e8f0] border border-[#e2e8f0] px-3 py-2 text-[#020617] placeholder:text-[#64748b] focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
                  placeholder="Enter bank transfer reference"
                />
              </div>

              <div className="flex items-center justify-between gap-3 mt-2">
                <div className="text-xs text-[#64748b]">
                  Bank details:{' '}
                  {bankDefault ? (
                      <span className="text-[#020617] font-medium">
                        {bankDefault.bankName} • {bankDefault.accountHolder} • {bankDefault.accountNumber} • {bankDefault.ifsc}
                      </span>
                  ) : (
                    <span className="text-[#64748b]">Not configured (ask admin)</span>
                  )}
                </div>
                <Button
                  onClick={submitDeposit}
                  disabled={depositBusy}
                  className="rounded-xl bg-[#22c55e] hover:opacity-90 text-[#ffffff] transition-all"
                >
                  {depositBusy ? 'Submitting...' : 'Submit Deposit'}
                </Button>
              </div>
            </div>
          </section>

          <section className="rounded-xl bg-[#ffffff] border border-[#e2e8f0] p-5 shadow-sm">
            <h2 className="text-[#020617] text-xl font-semibold">Withdraw</h2>
            <p className="text-[#64748b] mt-1 text-sm">Submit bank details. Admin approval triggers payout and updates wallet.</p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs text-[#64748b]">Amount (INR)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="mt-1 w-full rounded-md bg-[#e2e8f0] border border-[#e2e8f0] px-3 py-2 text-[#020617] placeholder:text-[#64748b] focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
                  placeholder="e.g. 1000"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#64748b]">Bank Name</label>
                  <input
                    value={withdrawBank.bankName}
                    onChange={(e) => setWithdrawBank((b) => ({ ...b, bankName: e.target.value }))}
                    className="mt-1 w-full rounded-md bg-[#e2e8f0] border border-[#e2e8f0] px-3 py-2 text-[#020617] placeholder:text-[#64748b] focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#64748b]">IFSC</label>
                  <input
                    value={withdrawBank.ifsc}
                    onChange={(e) => setWithdrawBank((b) => ({ ...b, ifsc: e.target.value }))}
                    className="mt-1 w-full rounded-md bg-[#e2e8f0] border border-[#e2e8f0] px-3 py-2 text-[#020617] placeholder:text-[#64748b] focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#64748b]">Account Holder</label>
                  <input
                    value={withdrawBank.accountHolder}
                    onChange={(e) => setWithdrawBank((b) => ({ ...b, accountHolder: e.target.value }))}
                    className="mt-1 w-full rounded-md bg-[#e2e8f0] border border-[#e2e8f0] px-3 py-2 text-[#020617] placeholder:text-[#64748b] focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#64748b]">Account Number</label>
                  <input
                    value={withdrawBank.accountNumber}
                    onChange={(e) => setWithdrawBank((b) => ({ ...b, accountNumber: e.target.value }))}
                    className="mt-1 w-full rounded-md bg-[#e2e8f0] border border-[#e2e8f0] px-3 py-2 text-[#020617] placeholder:text-[#64748b] focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#64748b]">Reference (optional)</label>
                <input
                  value={withdrawBank.reference}
                  onChange={(e) => setWithdrawBank((b) => ({ ...b, reference: e.target.value }))}
                  className="mt-1 w-full rounded-md bg-[#e2e8f0] border border-[#e2e8f0] px-3 py-2 text-[#020617] placeholder:text-[#64748b] focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
                  placeholder="Add any reference for tracking"
                />
              </div>

              <div className="flex items-center justify-between gap-3 mt-2">
                <div className="text-xs text-[#64748b]">{canSubmitWithdrawal ? 'Ready to withdraw' : 'Check amount vs balance'}</div>
                <Button
                  onClick={submitWithdrawal}
                  disabled={withdrawBusy || !canSubmitWithdrawal}
                  className="rounded-xl bg-[#22c55e] hover:opacity-90 text-[#ffffff] transition-all disabled:opacity-50"
                >
                  {withdrawBusy ? 'Submitting...' : 'Submit Withdrawal'}
                </Button>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-4 rounded-xl bg-[#ffffff] border border-[#e2e8f0] p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-[#020617] text-xl font-semibold">History</h2>
              <p className="text-[#64748b] mt-1 text-sm">
                Deposit/withdraw requests update in near real-time. Status is controlled by admin approvals.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={loadHistory}
                disabled={loadingHistory}
                className="rounded-xl bg-[#e2e8f0] hover:opacity-90 text-[#020617] transition-all"
              >
                {loadingHistory ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-lg border border-[#e2e8f0] overflow-hidden">
              <div className="px-4 py-3 bg-[#e2e8f0] text-[#64748b] text-sm font-medium">Deposit Requests</div>
              <div className="overflow-auto max-h-[360px]">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-[#e2e8f0] bg-[#ffffff]">
                      <th className="py-2 px-4 font-medium">Amount</th>
                      <th className="py-2 px-4 font-medium">Status</th>
                      <th className="py-2 px-4 font-medium">Reference</th>
                      <th className="py-2 px-4 font-medium">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deposits.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 px-4 text-center text-[#64748b]">
                          No deposit requests yet
                        </td>
                      </tr>
                    ) : (
                      deposits.map((d) => (
                        <tr key={d.id} className="border-b border-[#e2e8f0] hover:bg-[#e2e8f0]/40 transition-all">
                          <td className="py-2 px-4 whitespace-nowrap">{formatINR(d.amount)}</td>
                          <td className="py-2 px-4 whitespace-nowrap capitalize">{d.status}</td>
                          <td className="py-2 px-4 whitespace-nowrap">{d.reference ?? '-'}</td>
                          <td className="py-2 px-4 whitespace-nowrap">{d.createdAt ? new Date(d.createdAt).toLocaleString() : '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg border border-[#e2e8f0] overflow-hidden">
              <div className="px-4 py-3 bg-[#e2e8f0] text-[#64748b] text-sm font-medium">Withdrawal Requests</div>
              <div className="overflow-auto max-h-[360px]">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-[#e2e8f0] bg-[#ffffff]">
                      <th className="py-2 px-4 font-medium">Amount</th>
                      <th className="py-2 px-4 font-medium">Status</th>
                      <th className="py-2 px-4 font-medium">Bank</th>
                      <th className="py-2 px-4 font-medium">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 px-4 text-center text-[#64748b]">
                          No withdrawal requests yet
                        </td>
                      </tr>
                    ) : (
                      withdrawals.map((w) => (
                        <tr key={w.id} className="border-b border-[#e2e8f0] hover:bg-[#e2e8f0]/40 transition-all">
                          <td className="py-2 px-4 whitespace-nowrap">{formatINR(w.amount)}</td>
                          <td className="py-2 px-4 whitespace-nowrap capitalize">{w.status}</td>
                          <td className="py-2 px-4 whitespace-nowrap">
                            {w.bank?.bankName ? `${w.bank.bankName} • ${w.bank.ifsc}` : '-'}
                          </td>
                          <td className="py-2 px-4 whitespace-nowrap">{w.createdAt ? new Date(w.createdAt).toLocaleString() : '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

