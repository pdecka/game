'use client'

import { 
  getDifficultyDisplayName, 
  getDifficultyColor, 
  formatMultiplier, 
  formatPayout,
  type TowerRound 
} from '@/utils/towerConfig'

interface TowerHistoryProps {
  history: TowerRound[]
}

export default function TowerHistory({ history }: TowerHistoryProps) {
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
      case 'cashed_out': return 'text-emerald-400'
      case 'completed': return 'text-blue-400'
      case 'lost': return 'text-red-400'
      default: return 'text-slate-400'
    }
  }
  
  const getOutcomeText = (outcome: string) => {
    switch (outcome) {
      case 'cashed_out': return 'Cashed Out'
      case 'completed': return 'Completed'
      case 'lost': return 'Lost'
      default: return 'Unknown'
    }
  }
  
  // Calculate statistics
  const totalGames = history.length
  const wins = history.filter(round => round.outcome !== 'lost').length
  const losses = history.filter(round => round.outcome === 'lost').length
  const totalBet = history.reduce((sum, round) => sum + round.betAmount, 0)
  const totalPayout = history.reduce((sum, round) => sum + round.payout, 0)
  const totalProfit = totalPayout - totalBet
  const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0
  const averageSteps = totalGames > 0 ? history.reduce((sum, round) => sum + round.stepsCompleted, 0) / totalGames : 0
  const highestMultiplier = totalGames > 0 ? Math.max(...history.map(round => round.finalMultiplier)) : 0
  
  // Get recent games for display
  const recentGames = history.slice(0, 10)
  
  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">
              {wins}
            </div>
            <div className="text-xs text-slate-400">Wins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {losses}
            </div>
            <div className="text-xs text-slate-400">Losses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {winRate.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-400">Win Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {formatMultiplier(highestMultiplier)}x
            </div>
            <div className="text-xs text-slate-400">Highest Multiplier</div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-slate-400">Total Bet</div>
              <div className="text-white font-medium">{formatPayout(totalBet)}</div>
            </div>
            <div>
              <div className="text-slate-400">Total Payout</div>
              <div className="text-white font-medium">{formatPayout(totalPayout)}</div>
            </div>
            <div>
              <div className="text-slate-400">Net Profit</div>
              <div className={`font-medium ${totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {totalProfit >= 0 ? '+' : ''}{formatPayout(totalProfit)}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Games */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-sm font-semibold text-white">Recent Games</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-xs font-medium text-slate-400">Game</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Time</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Difficulty</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Bet</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Steps</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Multiplier</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Payout</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Result</th>
              </tr>
            </thead>
            <tbody>
              {recentGames.map((round, index) => (
                <tr 
                  key={round.id}
                  className={`border-b border-white/5 ${
                    index % 2 === 0 ? 'bg-white/5' : ''
                  }`}
                >
                  <td className="p-4 text-sm text-white">
                    #{round.id.split('-')[1]?.slice(0, 8)}
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-white">
                      {formatTime(round.timestamp)}
                    </div>
                    <div className="text-xs text-slate-400">
                      {formatDate(round.timestamp)}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(round.difficulty)}`}>
                      {getDifficultyDisplayName(round.difficulty)}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-white">
                    {formatPayout(round.betAmount)}
                  </td>
                  <td className="p-4 text-sm text-white">
                    {round.stepsCompleted} / {round.board.rows.length}
                  </td>
                  <td className="p-4 text-sm text-white">
                    {formatMultiplier(round.finalMultiplier)}x
                  </td>
                  <td className="p-4 text-sm text-white">
                    {formatPayout(round.payout)}
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
        
        {recentGames.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <div className="text-4xl mb-2">ð</div>
            <p>No games played yet</p>
          </div>
        )}
      </div>
      
      {/* Difficulty Breakdown */}
      {totalGames > 0 && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Difficulty Performance</h3>
          <div className="space-y-3">
            {(['easy', 'medium', 'hard', 'expert'] as const).map((diff) => {
              const diffGames = history.filter(round => round.difficulty === diff)
              const diffWins = diffGames.filter(round => round.outcome !== 'lost').length
              const diffWinRate = diffGames.length > 0 ? (diffWins / diffGames.length) * 100 : 0
              const diffAvgSteps = diffGames.length > 0 ? 
                diffGames.reduce((sum, round) => sum + round.stepsCompleted, 0) / diffGames.length : 0
              
              return (
                <div key={diff} className="flex items-center justify-between p-3 bg-[#1a2c38] rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(diff)}`}>
                      {getDifficultyDisplayName(diff)}
                    </span>
                    <span className="text-sm text-slate-400">
                      {diffGames.length} games
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-white">
                      {diffWinRate.toFixed(1)}% WR
                    </span>
                    <span className="text-slate-400">
                      Avg: {diffAvgSteps.toFixed(1)} steps
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
