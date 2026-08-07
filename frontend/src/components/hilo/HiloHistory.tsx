'use client'

import { type HiloRound } from '@/utils/deck'

interface HiloHistoryProps {
  history: HiloRound[]
}

export default function HiloHistory({ history }: HiloHistoryProps) {
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

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'won':
        return 'text-emerald-400'
      case 'lost':
        return 'text-red-400'
      case 'cashed_out':
        return 'text-blue-400'
      default:
        return 'text-white'
    }
  }

  const getOutcomeText = (outcome: string) => {
    switch (outcome) {
      case 'won':
        return 'Won'
      case 'lost':
        return 'Lost'
      case 'cashed_out':
        return 'Cashed Out'
      default:
        return outcome
    }
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
              <th className="text-left p-4 text-xs font-medium text-slate-400">Cards</th>
              <th className="text-left p-4 text-xs font-medium text-slate-400">Payout</th>
              <th className="text-left p-4 text-xs font-medium text-slate-400">Outcome</th>
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
                  Hi-Lo #{round.id.split('-')[1]}
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
                  <span className="text-sm font-medium text-white">
                    {round.finalMultiplier.toFixed(2)}x
                  </span>
                </td>
                <td className="p-4 text-sm text-white">
                  {round.cardsDrawn}
                </td>
                <td className="p-4 text-sm text-white">
                  {round.payout.toFixed(2)}
                </td>
                <td className="p-4">
                  <span className={`text-sm font-medium ${getOutcomeColor(round.outcome)}`}>
                    {getOutcomeText(round.outcome)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
