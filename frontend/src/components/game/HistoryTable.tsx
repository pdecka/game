'use client'

import { Trophy, Clock, DollarSign, TrendingUp } from 'lucide-react'

interface GameHistoryItem {
  id: string
  game: string
  time: string
  betAmount: number
  multiplier: number
  payout: number
  result: 'win' | 'loss'
}

interface HistoryTableProps {
  history: GameHistoryItem[]
}

export default function HistoryTable({ history }: HistoryTableProps) {
  return (
    <div className="bg-[#0f212e] rounded-lg border border-white/10 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10">
        <h3 className="text-lg font-semibold text-white">Game History</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-6 py-3 text-left">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-medium text-slate-400">Game</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-medium text-slate-400">Time</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-medium text-slate-400">Bet Amount</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-medium text-slate-400">Multiplier</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left">
                <span className="text-xs font-medium text-slate-400">Payout</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center">
                  <p className="text-sm text-slate-400">No games played yet</p>
                </td>
              </tr>
            ) : (
              history.map((game) => (
                <tr key={game.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm text-white font-medium">{game.game}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-300">{game.time}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-300">¥{game.betAmount.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${
                      game.result === 'win' ? 'text-emerald-400' : 'text-slate-400'
                    }`}>
                      {game.multiplier.toFixed(2)}x
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-semibold ${
                      game.result === 'win' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {game.result === 'win' ? '+' : '-'}¥{game.payout.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Dummy data for development
export const dummyHistory: GameHistoryItem[] = [
  {
    id: '1',
    game: 'Mines',
    time: '2 mins ago',
    betAmount: 100,
    multiplier: 1.25,
    payout: 25,
    result: 'win'
  },
  {
    id: '2',
    game: 'Mines',
    time: '5 mins ago',
    betAmount: 50,
    multiplier: 0,
    payout: 50,
    result: 'loss'
  },
  {
    id: '3',
    game: 'Mines',
    time: '8 mins ago',
    betAmount: 200,
    multiplier: 2.15,
    payout: 230,
    result: 'win'
  },
  {
    id: '4',
    game: 'Mines',
    time: '12 mins ago',
    betAmount: 75,
    multiplier: 1.05,
    payout: 3.75,
    result: 'win'
  },
  {
    id: '5',
    game: 'Mines',
    time: '15 mins ago',
    betAmount: 150,
    multiplier: 0,
    payout: 150,
    result: 'loss'
  }
]
