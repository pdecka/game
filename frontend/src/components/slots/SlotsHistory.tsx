'use client'

import { type SlotsRound } from '@/utils/slotsConfig'

interface SlotsHistoryProps {
  history: SlotsRound[]
  currentMultiplier?: number | null
}

export default function SlotsHistory({ history, currentMultiplier }: SlotsHistoryProps) {
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

  const getMultiplierColor = (multiplier: number) => {
    if (multiplier >= 100) return 'text-red-500'
    if (multiplier >= 50) return 'text-purple-500'
    if (multiplier >= 10) return 'text-yellow-500'
    if (multiplier >= 5) return 'text-blue-500'
    if (multiplier >= 1) return 'text-emerald-500'
    return 'text-slate-400'
  }

  const getResultIcon = (round: SlotsRound) => {
    if (round.isJackpot) return 'ð'
    if (round.isBigWin) return 'â¨'
    if (round.totalMultiplier > 0) return 'â'
    return 'â'
  }

  const getResultColor = (round: SlotsRound) => {
    if (round.isJackpot) return 'text-red-500'
    if (round.isBigWin) return 'text-purple-500'
    if (round.totalMultiplier > 0) return 'text-emerald-500'
    return 'text-slate-400'
  }

  // Recent multipliers for horizontal display
  const recentMultipliers = history.slice(0, 10).map(round => round.totalMultiplier)

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
                    : getMultiplierColor(multiplier) === 'text-red-500'
                    ? 'bg-red-500/20 border-red-500/50 text-red-400'
                    : getMultiplierColor(multiplier) === 'text-purple-500'
                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                    : getMultiplierColor(multiplier) === 'text-yellow-500'
                    ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
                    : getMultiplierColor(multiplier) === 'text-blue-500'
                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                    : getMultiplierColor(multiplier) === 'text-emerald-500'
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
                <th className="text-left p-4 text-xs font-medium text-slate-400">Result</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Multiplier</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Payout</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Lines</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Clusters</th>
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
                    <div className="flex items-center gap-2">
                      <span className={getResultColor(round)}>
                        {getResultIcon(round)}
                      </span>
                      <span>Slots #{round.id.split('-')[1]}</span>
                    </div>
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
                  <td className="p-4">
                    <span className={`text-sm font-medium ${getResultColor(round)}`}>
                      {round.isJackpot ? 'JACKPOT!' : round.isBigWin ? 'BIG WIN!' : round.totalMultiplier > 0 ? 'WIN' : 'NO WIN'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-sm font-medium ${getMultiplierColor(round.totalMultiplier)}`}>
                      {round.totalMultiplier.toFixed(1)}x
                    </span>
                  </td>
                  <td className="p-4 text-sm text-white">
                    {round.payout.toFixed(2)}
                  </td>
                  <td className="p-4 text-sm text-white">
                    {round.winLines.length}
                  </td>
                  <td className="p-4 text-sm text-white">
                    {round.clusterWins.length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Session Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">
              {history.filter(r => r.totalMultiplier > 0).length}
            </div>
            <div className="text-xs text-slate-400">Wins</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400">
              {history.length > 0 ? (history.filter(r => r.totalMultiplier > 0).length / history.length * 100).toFixed(1) : 0}%
            </div>
            <div className="text-xs text-slate-400">Win Rate</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">
              {history.filter(r => r.isBigWin).length}
            </div>
            <div className="text-xs text-slate-400">Big Wins</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-500">
              {history.filter(r => r.isJackpot).length}
            </div>
            <div className="text-xs text-slate-400">Jackpots</div>
          </div>
        </div>
      </div>
    </div>
  )
}
