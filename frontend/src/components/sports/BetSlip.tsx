'use client'

import { useState, useMemo } from 'react'

interface BetSlipItem {
  id: string
  matchId: string
  matchName: string
  market: string
  outcome: string
  odds: number
  bookmaker: string
  stake: number
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
}

export default function BetSlip({ 
  isOpen, 
  onClose, 
  items, 
  onUpdateItem, 
  onRemoveItem, 
  onPlaceBets, 
  isPlacing,
  balance 
}: BetSlipProps) {
  const [quickStake, setQuickStake] = useState('100')

  const { totalStake, totalPotentialWin, totalLiability } = useMemo(() => {
    const stake = items.reduce((sum, item) => sum + item.stake, 0)
    const potentialWin = items.reduce((sum, item) => {
      if (item.type === 'back') {
        return sum + (item.stake * (item.odds - 1))
      }
      return sum // Lay bets don't have potential win, just liability
    }, 0)
    const liability = items.reduce((sum, item) => {
      if (item.type === 'lay') {
        return sum + (item.stake * (item.odds - 1))
      }
      return 0
    }, 0)

    return {
      totalStake: stake,
      totalPotentialWin: potentialWin,
      totalLiability: liability
    }
  }, [items])

  const getMarketDisplayName = (market: string) => {
    switch (market) {
      case 'h2h':
        return 'Match Winner'
      case 'h2h_lay':
        return 'Lay Betting'
      default:
        return market.charAt(0).toUpperCase() + market.slice(1).replace(/_/g, ' ')
    }
  }

  const handleQuickStake = (amount: number) => {
    items.forEach(item => {
      onUpdateItem(item.id, amount)
    })
  }

  const handlePlaceBets = () => {
    if (totalStake > balance) {
      alert('Insufficient balance')
      return
    }
    if (items.length === 0) {
      alert('No bets selected')
      return
    }
    onPlaceBets()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f212e] rounded-2xl border border-white/10 w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Bet Slip</h2>
          <button
            onClick={onClose}
            className="rounded-lg bg-white/5 hover:bg-white/10 p-2 transition-all"
          >
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">No bets selected</p>
              <p className="text-xs text-slate-500 mt-1">Click on odds to add bets</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-xs text-slate-400">{item.matchName}</p>
                      <p className="text-sm font-medium text-white">{getMarketDisplayName(item.market)}</p>
                      <p className="text-xs text-slate-300 mt-1">{item.outcome}</p>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="rounded-lg bg-white/5 hover:bg-white/10 p-1 transition-all"
                    >
                      <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full ${
                        item.type === 'lay' 
                          ? 'bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444]'
                          : 'bg-[#3b82f6]/10 border border-[#3b82f6]/30 text-[#3b82f6]'
                      }`}>
                        {item.type.toUpperCase()}
                      </span>
                      <span className="text-slate-400">{item.bookmaker}</span>
                    </div>
                    <span className={`font-bold ${
                      item.type === 'lay' ? 'text-[#ef4444]' : 'text-[#3b82f6]'
                    }`}>
                      {item.odds.toFixed(2)}
                    </span>
                  </div>

                  <div className="mt-2">
                    <label className="text-xs text-slate-400">Stake</label>
                    <input
                      type="number"
                      value={item.stake}
                      onChange={(e) => onUpdateItem(item.id, Number(e.target.value))}
                      className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a2c38] px-2 py-1 text-sm text-white outline-none focus:ring-2 focus:ring-[#22c55e]"
                      min="1"
                    />
                  </div>

                  <div className="mt-2 text-xs">
                    {item.type === 'back' ? (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Potential Win:</span>
                        <span className="text-[#22c55e] font-medium">
                          +{(item.stake * (item.odds - 1)).toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Liability:</span>
                        <span className="text-[#ef4444] font-medium">
                          {(item.stake * (item.odds - 1)).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-white/10 p-4 space-y-3">
            {/* Quick Stake */}
            <div>
              <label className="text-xs text-slate-400">Quick Stake</label>
              <div className="flex gap-2 mt-1">
                {['50', '100', '250', '500', '1000'].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleQuickStake(Number(amount))}
                    className="rounded-lg bg-white/5 hover:bg-white/10 px-3 py-1 text-xs text-slate-200 transition-all"
                  >
                    {amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Stake:</span>
                <span className="text-white font-medium">{totalStake.toFixed(2)}</span>
              </div>
              {totalPotentialWin > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Potential Win:</span>
                  <span className="text-[#22c55e] font-medium">+{totalPotentialWin.toFixed(2)}</span>
                </div>
              )}
              {totalLiability > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Liability:</span>
                  <span className="text-[#ef4444] font-medium">{totalLiability.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-white/10">
                <span className="text-slate-400">Balance:</span>
                <span className="text-white font-medium">{balance.toFixed(2)}</span>
              </div>
            </div>

            {/* Place Bet Button */}
            <button
              onClick={handlePlaceBets}
              disabled={isPlacing || totalStake > balance || totalStake === 0}
              className="w-full rounded-xl bg-[#22c55e] hover:bg-[#22c55e]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 transition-all"
            >
              {isPlacing ? 'Placing Bets...' : `Place Bets (${items.length})`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
