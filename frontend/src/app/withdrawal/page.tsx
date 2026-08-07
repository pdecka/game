'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

export default function WithdrawalPage() {
  const { ready, user, wallet, refreshWallet } = useAuth() as any
  const [accounts, setAccounts] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [amount, setAmount] = useState('')
  const [accountId, setAccountId] = useState('')
  const [busy, setBusy] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newType, setNewType] = useState<'bank' | 'upi' | 'crypto'>('bank')
  const [label, setLabel] = useState('')
  const [detailsJson, setDetailsJson] = useState('{"bankName":"","accountHolder":"","accountNumber":"","ifsc":""}')

  const balance = Number(wallet?.INR || 0)

  const load = useCallback(async () => {
    const [a, h] = await Promise.all([
      api.get('/payments/withdrawal-accounts'),
      api.get('/payments/withdrawals', { params: { limit: 100, offset: 0 } }),
    ])
    setAccounts(Array.isArray(a.data) ? a.data : [])
    setHistory(h.data?.items ?? [])
    if (!accountId && a.data?.[0]?.id) setAccountId(a.data[0].id)
  }, [accountId])

  useEffect(() => {
    if (!ready || !user) return
    void load()
    const t = setInterval(() => {
      void load()
      refreshWallet?.()
    }, 10000)
    return () => clearInterval(t)
  }, [ready, user, load, refreshWallet])

  const selected = useMemo(() => accounts.find((a) => a.id === accountId), [accounts, accountId])

  const addAccount = async () => {
    try {
      const details = JSON.parse(detailsJson || '{}')
      await api.post('/payments/withdrawal-accounts', {
        type: newType,
        label: label.trim() || `${newType.toUpperCase()} Account`,
        details,
        isDefault: accounts.length === 0,
      })
      toast.success('Account added')
      setLabel('')
      setAdding(false)
      await load()
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Invalid details JSON')
    }
  }

  const submit = async () => {
    const a = Number(amount)
    if (!a || a <= 0) return toast.error('Enter valid amount')
    if (a > balance) return toast.error('Insufficient balance')
    if (!accountId) return toast.error('Select account')
    try {
      setBusy(true)
      await api.post('/payments/withdrawal', {
        amount: a,
        currency: 'INR',
        method: selected?.type === 'crypto' ? 'usdt' : 'bank_transfer',
        accountId,
      })
      toast.success('Withdrawal request submitted')
      setAmount('')
      await load()
      refreshWallet?.()
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to submit withdrawal')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        <h1 className="text-3xl font-bold">Withdrawal</h1>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Add Account</h2>
            <button onClick={() => setAdding((v) => !v)} className="text-sm text-emerald-400 hover:underline">{adding ? 'Cancel' : 'Add'}</button>
          </div>
          {adding ? (
            <div className="mt-3 grid gap-3">
              <select value={newType} onChange={(e) => setNewType(e.target.value as any)} className="rounded-lg bg-black/40 border border-white/10 px-3 py-2">
                <option value="bank">Bank</option>
                <option value="upi">UPI</option>
                <option value="crypto">Crypto Wallet</option>
              </select>
              <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label" className="rounded-lg bg-black/40 border border-white/10 px-3 py-2" />
              <textarea value={detailsJson} onChange={(e) => setDetailsJson(e.target.value)} className="min-h-[120px] rounded-lg bg-black/40 border border-white/10 px-3 py-2 font-mono text-xs" />
              <button onClick={() => void addAccount()} className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-black">Save Account</button>
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-xl font-semibold">Withdraw Request</h2>
          <p className="text-sm text-slate-400 mt-1">Available balance: ₹{balance.toFixed(2)}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <select className="rounded-lg bg-black/40 border border-white/10 px-3 py-2" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              <option value="">Select account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.label} ({a.type})</option>
              ))}
            </select>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" className="rounded-lg bg-black/40 border border-white/10 px-3 py-2" />
          </div>
          <button disabled={busy} onClick={() => void submit()} className="mt-4 rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-black disabled:opacity-50">
            {busy ? 'Submitting...' : 'Submit Withdrawal'}
          </button>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-xl font-semibold">History</h2>
          <div className="mt-3 overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-white/10">
                  <th className="py-2 pr-3">Amount</th>
                  <th className="py-2 pr-3">Account</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {history.map((r) => (
                  <tr key={r.id} className="border-b border-white/5">
                    <td className="py-2 pr-3">{r.currency} {Number(r.amount).toFixed(2)}</td>
                    <td className="py-2 pr-3">{r.bank?.label || r.bank?.bankName || r.address || '-'}</td>
                    <td className="py-2 pr-3 capitalize">{r.status}</td>
                    <td className="py-2 pr-3">{new Date(r.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}
