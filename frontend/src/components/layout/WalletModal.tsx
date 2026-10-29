'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { formatPlayMoney } from '@/lib/playCurrency'

type WalletModalProps = {
  open: boolean
  onClose: () => void
  balanceLabel: string
}

export function WalletModal({ open, onClose, balanceLabel }: WalletModalProps) {
  const { wallet } = useAuth() as any
  if (!open) return null
  const rows = [
    { code: 'INR' as const, amount: Number(wallet?.INR || 0) },
    { code: 'USDT' as const, amount: Number(wallet?.USDT || 0) },
    { code: 'BTC' as const, amount: Number(wallet?.BTC || 0) },
  ]

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-line bg-card p-5 text-ink shadow-panel sm:rounded-2xl sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Wallet</h2>
          <button
            type="button"
            onClick={onClose}
            className="icon-btn"
            aria-label="Close wallet"
          >
            <span aria-hidden>×</span>
          </button>
        </div>

        <div className="mb-6 space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-3">Current balance</p>
          <p className="odds-num text-3xl font-bold text-ink">{balanceLabel}</p>
        </div>

        <div className="mb-4 space-y-3 rounded-xl border border-line bg-elevated p-4 text-sm">
          {rows.map((row) => (
            <div key={row.code} className="flex items-center justify-between">
              <span className="text-ink-2">{row.code}</span>
              <span className="odds-num text-ink">{formatPlayMoney(row.amount, row.code)}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link href="/deposit" onClick={onClose}>
            <Button className="w-full sm:w-auto px-6 text-sm">
              Deposit
            </Button>
          </Link>
          <Link href="/withdrawal" onClick={onClose}>
            <Button
              variant="outline"
              className="w-full px-6 text-sm sm:w-auto"
            >
              Withdraw
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
