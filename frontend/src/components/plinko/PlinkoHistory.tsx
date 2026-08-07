'use client'

import { type PlinkoRound } from '@/utils/plinkoConfig'

interface PlinkoHistoryProps {
  history: PlinkoRound[]
  currentMultiplier?: number | null
}

export default function PlinkoHistory({ history, currentMultiplier }: PlinkoHistoryProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  }
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-emerald-400'
      case 'medium':
        return 'text-yellow-400'
      case 'high':
        return 'text-red-400'
      default:
        return 'text-white'
    }
  }

  const getMultiplierColor = (multiplier: number) => {
    if (multiplier >= 5) return 'text-red-400'
    if (multiplier >= 2) return 'text-yellow-400'
    if (multiplier >= 1) return 'text-emerald-400'
    return 'text-slate-400'
  }

  // Recent multipliers for horizontal display
  const recentMultipliers = history.slice(0, 10).map(round => round.multiplier)

  return (
    <div className="space-y-6">
      {/* Recent Multipliers */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Recent Results</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {recentMultipliers.length > 0 ? (
            recentMultipliers.map((multiplier, index) => (
              <div
                key={index}
                className={`flex-shrink-0 w-12 h-12 rounded-lg border flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                  currentMultiplier === multiplier
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 scale-110'
                    : getMultiplierColor(multiplier) === 'text-red-400'
                    ? 'bg-red-500/20 border-red-500/50 text-red-400'
                    : getMultiplierColor(multiplier) === 'text-yellow-400'
                    ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
                    : getMultiplierColor(multiplier) === 'text-emerald-400'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                {multiplier.toFixed(1)}x
              </div>
            ))
          ) : (
            <div className="text-slate-400 text-sm">No games played yet</div>
          )}
        </div>
      </div>

      {/* Global History Table */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-sm font-semibold text-white">Game History</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-xs font-medium text-slate-400">Game</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Time</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Bet</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Rows</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Risk</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Multiplier</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Payout</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Slot</th>
              </tr>
            </thead>
            <tbody>
              {history.slice(0, 10).map((round, index) => (
                <tr 
                  key={round.id}
                  className={`border-b border-white/5 ${
                    index % 2 === 0 ? 'bg-white/5' : ''
                  }`}
                >
                  <td className="p-4 text-sm text-white">
                    Plinko #{round.id.split('-')[1]}
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-white">
                      {formatTime(round.timestamp)}
                    </div>
                    <div className="text-xs text-slate-400">
                      {formatDate(round.timestamp)}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-white">
                    {round.betAmount.toFixed(2)}
                  </td>
                  <td className="p-4 text-sm text-white">
                    {round.rows}
                  </td>
                  <td className="p-4">
                    <span className={`text-sm font-medium capitalize ${getRiskColor(round.risk)}`}>
                      {round.risk}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-sm font-medium ${getMultiplierColor(round.multiplier)}`}>
                      {round.multiplier.toFixed(1)}x
                    </span>
                  </td>
                  <td className="p-4 text-sm text-white">
                    {round.payout.toFixed(2)}
                  </td>
                  <td className="p-4 text-sm text-white">
                    {round.finalSlot}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
