'use client'

import { type CrashRound } from '@/utils/crashMath'

interface CrashHistoryProps {
  history: CrashRound[]
}

export default function CrashHistory({ history }: CrashHistoryProps) {
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
  
  return (
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
              <th className="text-left p-4 text-xs font-medium text-slate-400">Bet Amount</th>
              <th className="text-left p-4 text-xs font-medium text-slate-400">Multiplier</th>
              <th className="text-left p-4 text-xs font-medium text-slate-400">Payout</th>
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
                  Crash #{round.id.split('-')[1]}
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
                  ¥{(Math.random() * 1000 + 10).toFixed(2)}
                </td>
                <td className="p-4">
                  <span className={`text-sm font-medium ${
                    round.crashPoint >= 2.0 
                      ? 'text-emerald-400'
                      : round.crashPoint < 1.5
                      ? 'text-slate-400'
                      : 'text-white'
                  }`}>
                    {round.crashPoint.toFixed(2)}x
                  </span>
                </td>
                <td className="p-4 text-sm text-white">
                  ¥{(Math.random() * 500 + 50).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
