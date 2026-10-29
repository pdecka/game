'use client'

import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { GameLayout } from '@/components/layout/GameLayout'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type MethodSetting = {
  id: string
  method: string
  currency: string
  network?: string
  displayName?: string
  depositAddress?: string
  upiId?: string
  qrImageUrl?: string
  metadata?: Record<string, any>
}

export default function DepositPage() {
  const { ready, user, refreshWallet } = useAuth() as any
  const [activeTab, setActiveTab] = useState<'INR' | 'CRYPTO'>('INR')
  const [settings, setSettings] = useState<MethodSetting[]>([])
  const [rows, setRows] = useState<any[]>([])
  const [bankDefault, setBankDefault] = useState<any>(null)
  const [amount, setAmount] = useState('')
  const [reference, setReference] = useState('')
  const [screenshotUrl, setScreenshotUrl] = useState('')
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const [txHash, setTxHash] = useState('')
  const [busy, setBusy] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<string>('bank_transfer')

  const load = async () => {
    const [m, d] = await Promise.all([
      api.get('/payments/deposit-methods'),
      api.get('/payments/deposits', { params: { limit: 100, offset: 0 } }),
    ])
    setSettings(Array.isArray(m.data) ? m.data : [])
    const items = d.data?.items ?? []
    setRows(items)
    if (items.some((row: any) => row.status === 'completed')) {
      void refreshWallet?.()
    }
    try {
      const b = await api.get('/wallet/bank-default')
      setBankDefault(b.data ?? null)
    } catch {
      setBankDefault(null)
    }
  }

  useEffect(() => {
    if (!ready || !user) return
    void load()
    const t = setInterval(() => void load(), 10000)
    return () => clearInterval(t)
  }, [ready, user])

  useEffect(() => {
    ;(async () => {
      try {
        const r = await fetch('https://ipapi.co/json/')
        const j = await r.json()
        if (String(j?.country_code || '').toUpperCase() === 'IN') setActiveTab('INR')
        else setActiveTab('CRYPTO')
      } catch {
        setActiveTab('INR')
      }
    })()
  }, [])

  const inrMethod = settings.find((s) => s.currency === 'INR' && s.method === 'bank_transfer')
  const cryptoMethods = settings.filter((s) => s.currency !== 'INR')
  const currentCrypto = useMemo(
    () => cryptoMethods.find((m) => m.method === selectedMethod) || cryptoMethods[0],
    [cryptoMethods, selectedMethod],
  )

  const uploadScreenshotIfNeeded = async () => {
    if (screenshotUrl.trim()) return screenshotUrl.trim()
    if (!screenshotFile) return ''
    const fd = new FormData()
    fd.append('file', screenshotFile)
    const up = await api.post('/payments/upload-screenshot', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return String(up.data?.url || '').trim()
  }

  const submit = async () => {
    const a = Number(amount)
    if (!a || a <= 0) return toast.error('Enter valid amount')
    try {
      setBusy(true)
      const screenshot = await uploadScreenshotIfNeeded()
      if (!screenshot) return toast.error('Payment screenshot is required')
      if (activeTab === 'INR') {
        if (!reference.trim()) return toast.error('UTR / reference is required')
        await api.post('/payments/deposit', {
          amount: a,
          currency: 'INR',
          method: 'bank_transfer',
          reference: reference.trim(),
          screenshotUrl: screenshot,
        })
      } else {
        if (!currentCrypto) return toast.error('No crypto method available')
        if (!txHash.trim()) return toast.error('Transaction hash is required')
        await api.post('/payments/deposit', {
          amount: a,
          currency: currentCrypto.currency,
          method: currentCrypto.method,
          txHash: txHash.trim(),
          network: currentCrypto.network ?? undefined,
          screenshotUrl: screenshot,
        })
      }
      toast.success('Deposit request submitted successfully')
      setAmount('')
      setReference('')
      setScreenshotUrl('')
      setScreenshotFile(null)
      setTxHash('')
      await load()
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to submit deposit request')
    } finally {
      setBusy(false)
    }
  }

  return (
    <GameLayout>
      <div className="page-wrap space-y-6">
        <PageHeader
          title="Deposit"
          description="Send the payment with the details below, then submit amount, reference, and screenshot. Balance is credited after admin approval."
        />
        <div className="flex gap-2">
          <button type="button" className={`rounded-xl px-4 py-2 text-sm font-medium ${activeTab === 'INR' ? 'bg-brand text-white' : 'border border-line bg-white text-ink-2'}`} onClick={() => setActiveTab('INR')}>INR</button>
          <button type="button" className={`rounded-xl px-4 py-2 text-sm font-medium ${activeTab === 'CRYPTO' ? 'bg-brand text-white' : 'border border-line bg-white text-ink-2'}`} onClick={() => setActiveTab('CRYPTO')}>Crypto</button>
        </div>

        <section className="rounded-2xl border border-line bg-white p-5 shadow-panel">
          {activeTab === 'INR' ? (
            <div className="space-y-3">
              <p className="text-sm text-ink-2">Transfer externally then submit proof.</p>
              {bankDefault ? (
                <>
                  <p className="text-sm">Bank: <b>{bankDefault.bankName}</b></p>
                  <p className="text-sm">A/C Holder: <b>{bankDefault.accountHolder}</b></p>
                  <p className="text-sm">A/C Number: <b>{bankDefault.accountNumber}</b></p>
                  <p className="text-sm">IFSC: <b>{bankDefault.ifsc}</b></p>
                </>
              ) : (
                <p className="text-sm">Bank account is not active yet. It appears here as soon as an admin saves one.</p>
              )}
              <div className="flex items-center gap-2">
                <p className="text-sm">UPI: <b>{bankDefault?.upiId || inrMethod?.upiId || inrMethod?.metadata?.upiId || 'N/A'}</b></p>
                {(bankDefault?.upiId || inrMethod?.upiId || inrMethod?.metadata?.upiId) ? (
                  <button
                    className="text-xs text-brand-2 hover:underline"
                    onClick={() => {
                      const val = String(bankDefault?.upiId || inrMethod?.upiId || inrMethod?.metadata?.upiId || '')
                      void navigator.clipboard.writeText(val)
                      toast.success('UPI copied')
                    }}
                  >
                    Copy
                  </button>
                ) : null}
              </div>
              {(bankDefault?.qrImageUrl || inrMethod?.qrImageUrl || inrMethod?.metadata?.qrImageUrl) ? (
                <a href={String(bankDefault?.qrImageUrl || inrMethod?.qrImageUrl || inrMethod?.metadata?.qrImageUrl)} target="_blank" rel="noreferrer" className="text-sm text-brand-2 hover:underline">View QR</a>
              ) : null}
            </div>
          ) : (
            <div className="space-y-3">
              <select
                className="rounded-lg border border-line bg-white px-3 py-2 text-ink"
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
              >
                {cryptoMethods.map((m) => (
                  <option key={m.id} value={m.method}>{m.displayName || `${m.currency} ${m.network || ''}`}</option>
                ))}
              </select>
              <p className="text-sm">Address: <b>{currentCrypto?.depositAddress || currentCrypto?.metadata?.address || 'N/A'}</b></p>
              {(currentCrypto?.depositAddress || currentCrypto?.metadata?.address) ? (
                <button
                  className="text-xs text-brand-2 hover:underline"
                  onClick={() => {
                    const val = String(currentCrypto?.depositAddress || currentCrypto?.metadata?.address || '')
                    void navigator.clipboard.writeText(val)
                    toast.success('Address copied')
                  }}
                >
                  Copy address
                </button>
              ) : null}
              {currentCrypto?.qrImageUrl ? (
                <a href={currentCrypto.qrImageUrl} target="_blank" rel="noreferrer" className="text-sm text-brand-2 hover:underline">View QR</a>
              ) : null}
            </div>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-2">Amount</label>
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="Amount" />
            </div>
            {activeTab === 'INR' ? (
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-2">UTR / Reference</label>
                <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Bank UTR" />
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-2">Transaction hash</label>
                <Input value={txHash} onChange={(e) => setTxHash(e.target.value)} placeholder="On-chain hash" />
              </div>
            )}
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-ink-2">Payment screenshot</label>
              <Input type="file" accept="image/*" onChange={(e) => setScreenshotFile(e.target.files?.[0] ?? null)} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-ink-2">Or paste screenshot URL</label>
              <Input value={screenshotUrl} onChange={(e) => setScreenshotUrl(e.target.value)} placeholder="https://..." />
            </div>
          </div>

          <Button disabled={busy} onClick={() => void submit()} className="mt-4">
            {busy ? 'Submitting...' : 'Submit deposit'}
          </Button>
        </section>

        <section className="rounded-2xl border border-line bg-white p-5 shadow-panel">
          <h2 className="text-xl font-semibold text-ink">My Deposits</h2>
          <div className="mt-3 overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-ink-2">
                  <th className="py-2 pr-3">Amount</th>
                  <th className="py-2 pr-3">Method</th>
                  <th className="py-2 pr-3">UTR / Hash</th>
                  <th className="py-2 pr-3">Screenshot</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-line">
                    <td className="py-2 pr-3">{r.currency} {Number(r.amount).toFixed(2)}</td>
                    <td className="py-2 pr-3">{r.method}</td>
                    <td className="py-2 pr-3">{r.reference || r.txHash || '-'}</td>
                    <td className="py-2 pr-3">{r.screenshotUrl ? <a className="text-brand-2 hover:underline" target="_blank" rel="noreferrer" href={r.screenshotUrl}>View</a> : '-'}</td>
                    <td className="py-2 pr-3 capitalize">
                      <span
                        className={`rounded-md px-2 py-1 text-xs ${
                          r.status === 'pending' || r.status === 'processing'
                            ? 'bg-yellow-100 text-yellow-800'
                            : r.status === 'completed'
                              ? 'bg-brand/15 text-brand-2'
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {r.status === 'completed' ? 'approved' : r.status === 'failed' ? 'rejected' : r.status}
                      </span>
                    </td>
                    <td className="py-2 pr-3">{new Date(r.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </GameLayout>
  )
}
