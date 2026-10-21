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
    <div className="overflow-hidden rounded-lg border border-line bg-white shadow-panel">
      <div className="border-b border-line px-6 py-4">
        <h3 className="text-lg font-semibold text-ink">Game History</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-line">
              <th className="px-6 py-3 text-left">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-ink-3" />
                  <span className="text-xs font-medium text-ink-3">Game</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-ink-3" />
                  <span className="text-xs font-medium text-ink-3">Time</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-ink-3" />
                  <span className="text-xs font-medium text-ink-3">Bet Amount</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-ink-3" />
                  <span className="text-xs font-medium text-ink-3">Multiplier</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left">
                <span className="text-xs font-medium text-ink-3">Payout</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center">
                  <p className="text-sm text-ink-3">No games played yet</p>
                </td>
              </tr>
            ) : (
              history.map((game) => (
                <tr key={game.id} className="border-b border-line transition-colors hover:bg-elevated">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-ink">{game.game}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-ink-2">{game.time}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="odds-num text-sm text-ink-2">₹{game.betAmount.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`odds-num text-sm font-medium ${
                      game.result === 'win' ? 'text-brand-2' : 'text-ink-3'
                    }`}>
                      {game.multiplier.toFixed(2)}x
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`odds-num text-sm font-semibold ${
                      game.result === 'win' ? 'text-brand-2' : 'text-red-500'
                    }`}>
                      {game.result === 'win' ? '+' : '-'}₹{game.payout.toFixed(2)}
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
