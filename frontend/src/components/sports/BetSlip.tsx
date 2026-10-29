'use client'

import { useMemo } from 'react'
import { formatPlayMoney, usePlayCurrency } from '@/lib/playCurrency'

interface BetSlipItem {
  id: string
  matchId: string
  matchName: string
  market: string
  outcome: string
  odds: number
  bookmaker: string
  stake: number
  line?: number
  type: 'back' | 'lay'
}

interface BetSlipProps {
  isOpen: boolean
  onClose: () => void
  items: BetSlipItem[]
  onUpdateItem: (id: string, stake: number) => void
  onRemoveItem: (id: string) => void
  onPlaceBets: () => void
  isPlacing: boolean
  balance: number
  exposure: number
}

function rupees(value: number, currency: 'INR' | 'USDT' | 'BTC') {
  return formatPlayMoney(value, currency)
}

function marketLabel(market: string) {
  const known: Record<string, string> = {
    h2h: 'Match winner',
    spreads: 'Handicap',
    totals: 'Total',
    btts: 'Both teams to score',
    draw_no_bet: 'Draw no bet',
  }
  if (known[market]) return known[market]
  return market.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

function selectionLabel(item: BetSlipItem) {
  if (item.line == null) return item.outcome
  if (item.outcome === 'Over' || item.outcome === 'Under') return `${item.outcome} ${item.line}`
  return `${item.outcome} ${item.line}`
}

export default function BetSlip({
  isOpen,
  onClose,
  items,
  onUpdateItem,
  onRemoveItem,
  onPlaceBets,
  isPlacing,
  balance,
  exposure,
}: BetSlipProps) {
  const { currency } = usePlayCurrency()
  const { spend, returned } = useMemo(() => {
    const spendTotal = items.reduce((sum, item) => sum + Number(item.stake || 0), 0)
    const back = items.reduce((sum, item) => sum + Number(item.stake || 0) * Number(item.odds || 0), 0)
    return { spend: spendTotal, returned: back }
  }, [items])

  const nextExposure = exposure + spend

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 p-0 sm:items-center sm:p-4">
      <div className="flex max-h-[78vh] w-full max-w-sm flex-col rounded-t-2xl border border-line bg-card shadow-panel sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div>
            <h2 className="text-base font-semibold text-ink">Bet</h2>
            <p className="text-[11px] text-ink-3">Spend becomes exposure until the match settles.</p>
          </div>
          <button type="button" onClick={onClose} className="icon-btn h-8 w-8">
            <svg className="h-4 w-4 text-ink-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {items.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-ink-2">No bet selected</p>
              <p className="mt-1 text-xs text-ink-3">Tap a price to choose what you want to bet on</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const stake = Number(item.stake || 0)
                const winReturn = stake * Number(item.odds || 0)
                return (
                  <div key={item.id} className="rounded-xl border border-line bg-elevated p-3">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-ink-3">{item.matchName}</p>
                        <p className="text-sm font-medium text-ink">{marketLabel(item.market)}</p>
                        <p className="mt-1 text-sm text-ink-2">
                          {selectionLabel(item)} <span className="odds-num font-semibold text-ink">@ {item.odds.toFixed(2)}</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className="rounded-lg p-1 text-ink-3 transition-all hover:bg-white hover:text-ink"
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <label className="text-xs text-ink-3">You spend</label>
                    <input
                      type="number"
                      value={item.stake}
                      onChange={(event) => onUpdateItem(item.id, Number(event.target.value))}
                      className="mt-1 w-full rounded-lg border border-line bg-white px-2 py-1 text-sm text-ink outline-none focus:ring-2 focus:ring-brand"
                      min="1"
                    />
                    <p className="mt-1 text-[11px] text-ink-2">
                      Win credits <span className="odds-num font-semibold text-brand-2">{rupees(winReturn, currency)}</span>
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="space-y-2 border-t border-line px-4 py-3">
            <div className="flex gap-2">
              {[50, 100, 250, 500, 1000].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => items.forEach((item) => onUpdateItem(item.id, amount))}
                  className="rounded-lg border border-line bg-white px-3 py-1 text-xs text-ink-2 transition-all hover:border-brand/40 hover:bg-brand/10"
                >
                  {amount}
                </button>
              ))}
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-3">You spend</span>
                <span className="odds-num font-medium text-ink">{rupees(spend, currency)}</span>
              </div>
              <div className="flex justify-between">
                    <span className="text-ink-3">Win credit</span>
                <span className="odds-num font-medium text-brand-2">{rupees(returned, currency)}</span>
              </div>
              <div className="flex justify-between border-t border-line pt-2">
                <span className="text-ink-3">Balance (exposure)</span>
                <span className="odds-num font-medium text-ink">
                  {rupees(balance, currency)} ({rupees(nextExposure, currency)})
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onPlaceBets}
              disabled={isPlacing || spend > balance || spend < 1}
              className="w-full rounded-xl bg-brand py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPlacing ? 'Placing...' : `Spend ${rupees(spend, currency)}`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
