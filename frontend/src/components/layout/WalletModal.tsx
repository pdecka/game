import Link from 'next/link'
import { Button } from '@/components/ui/button'

type WalletModalProps = {
  open: boolean
  onClose: () => void
  balanceLabel: string
}

export function WalletModal({ open, onClose, balanceLabel }: WalletModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-white/10 bg-[#0f212e] p-5 text-slate-100 shadow-2xl sm:rounded-2xl sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Wallet</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-300 hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        <div className="mb-6 space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Current balance</p>
          <p className="text-3xl font-bold text-white">{balanceLabel}</p>
        </div>

        <div className="mb-4 space-y-3 rounded-xl border border-white/10 bg-[#122535] p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">BTC</span>
            <span className="text-slate-500">0.00000000</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">LTC</span>
            <span className="text-slate-500">0.00000000</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">DOGE</span>
            <span className="text-slate-500">0.00000000</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">INR</span>
            <span className="text-slate-500">{balanceLabel}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link href="/deposit" onClick={onClose}>
            <Button className="w-full sm:w-auto bg-emerald-500 px-6 text-sm font-semibold text-white hover:bg-emerald-600">
              Deposit
            </Button>
          </Link>
          <Link href="/withdrawal" onClick={onClose}>
            <Button
              variant="outline"
              className="w-full border-white/30 bg-transparent px-6 text-sm font-semibold text-slate-100 hover:bg-white/10 sm:w-auto"
            >
              Withdraw
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

