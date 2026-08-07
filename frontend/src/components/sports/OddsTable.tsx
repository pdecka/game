'use client'

import { useMemo } from 'react'

interface Outcome {
  name: string
  price: number
}

interface Market {
  key: string
  last_update: string
  outcomes: Outcome[]
}

interface Bookmaker {
  key: string
  title: string
  last_update: string
  markets: Market[]
}

interface OddsTableProps {
  bookmakers: Bookmaker[]
  onOddsClick?: (market: string, outcome: string, odds: number, bookmaker: string) => void
}

export default function OddsTable({ bookmakers, onOddsClick }: OddsTableProps) {
  const { marketsData, uniqueOutcomes } = useMemo(() => {
    const allOutcomes = new Set<string>()
    const marketsMap = new Map<string, Map<string, { price: number; bookmaker: string }>>()

    // Collect all unique outcomes and organize odds by market and outcome
    bookmakers.forEach(bookmaker => {
      bookmaker.markets.forEach(market => {
        if (!marketsMap.has(market.key)) {
          marketsMap.set(market.key, new Map())
        }
        
        const marketData = marketsMap.get(market.key)!
        
        market.outcomes.forEach(outcome => {
          allOutcomes.add(outcome.name)
          marketData.set(outcome.name, {
            price: outcome.price,
            bookmaker: bookmaker.title
          })
        })
      })
    })

    return {
      marketsData: Object.fromEntries(marketsMap),
      uniqueOutcomes: Array.from(allOutcomes)
    }
  }, [bookmakers])

  const getMarketDisplayName = (marketKey: string) => {
    switch (marketKey) {
      case 'h2h':
        return 'Match Winner'
      case 'h2h_lay':
        return 'Lay Betting'
      case 'totals':
        return 'Totals'
      case 'spreads':
        return 'Point Spread'
      default:
        return marketKey.charAt(0).toUpperCase() + marketKey.slice(1).replace(/_/g, ' ')
    }
  }

  const getMarketType = (marketKey: string) => {
    if (marketKey.includes('lay')) return 'lay'
    return 'back'
  }

  const getOddsColor = (price: number, marketType: string) => {
    if (marketType === 'lay') return 'text-[#ef4444]' // Red for lay
    if (price <= 1.5) return 'text-[#22c55e]' // Green for favorable
    if (price >= 3.0) return 'text-[#ef4444]' // Red for risky
    return 'text-[#3b82f6]' // Blue for regular back
  }

  const getOddsButtonColor = (marketType: string) => {
    if (marketType === 'lay') return 'bg-[#ef4444]/10 hover:bg-[#ef4444]/20 border-[#ef4444]/30'
    return 'bg-[#3b82f6]/10 hover:bg-[#3b82f6]/20 border-[#3b82f6]/30'
  }

  if (bookmakers.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
        <p className="text-sm text-slate-300">No odds available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(marketsData).map(([marketKey, marketData]) => {
        const marketType = getMarketType(marketKey)
        
        return (
          <div key={marketKey} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-semibold text-white">{getMarketDisplayName(marketKey)}</h4>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  marketType === 'lay' 
                    ? 'bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444]'
                    : 'bg-[#3b82f6]/10 border border-[#3b82f6]/30 text-[#3b82f6]'
                }`}>
                  {marketType === 'lay' ? 'LAY' : 'BACK'}
                </span>
                <span className="text-xs text-slate-400">
                  {marketData.size} outcomes
                </span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 px-3 text-xs font-medium text-slate-400">Outcome</th>
                    <th className="text-right py-2 px-3 text-xs font-medium text-slate-400">Odds</th>
                    <th className="text-right py-2 px-3 text-xs font-medium text-slate-400">Bookmaker</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-slate-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from(marketData.entries()).map(([outcome, odds]) => (
                    <tr key={outcome} className="border-b border-white/5 last:border-0">
                      <td className="py-3 px-3">
                        <span className="text-sm text-white font-medium">{outcome}</span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className={`text-sm font-bold ${getOddsColor(odds.price, marketType)}`}>
                          {odds.price.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="text-xs text-slate-400">{odds.bookmaker}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => onOddsClick?.(marketKey, outcome, odds.price, odds.bookmaker)}
                          className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${getOddsButtonColor(marketType)}`}
                        >
                          {marketType === 'lay' ? 'Lay' : 'Back'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
      
      {/* Future-ready markets (simulated if not present) */}
      {!marketsData['totals'] && (
        <div className="rounded-2xl border border-white/5 bg-white/3 p-4 opacity-60">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-semibold text-slate-400">Session Markets</h4>
            <span className="text-xs px-2 py-1 rounded-full bg-white/10 border border-white/20 text-slate-400">
              COMING SOON
            </span>
          </div>
          <p className="text-sm text-slate-400 text-center py-4">
            Session betting markets will be available soon
          </p>
        </div>
      )}
    </div>
  )
}
