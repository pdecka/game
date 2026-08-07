'use client'

import { 
  formatTime, 
  formatDate, 
  formatPayout,
  getColorEmoji,
  type ColorRound 
} from '@/utils/colorConfig'

interface ColorHistoryProps {
  history: ColorRound[]
  currentResult: any
}

export default function ColorHistory({ history, currentResult }: ColorHistoryProps) {
  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'won':
        return 'text-emerald-400'
      case 'lost':
        return 'text-red-400'
      default:
        return 'text-slate-400'
    }
  }
  
  const getOutcomeText = (outcome: boolean) => {
    return outcome ? 'Won' : 'Lost'
  }
  
  // Calculate statistics
  const totalGames = history.length
  const wins = history.filter(round => round.isWin).length
  const losses = history.filter(round => !round.isWin).length
  const totalBet = history.reduce((sum, round) => sum + round.totalBetAmount, 0)
  const totalPayout = history.reduce((sum, round) => sum + round.totalPayout, 0)
  const totalProfit = totalPayout - totalBet
  const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0
  
  // Get recent games for display
  const recentGames = history.slice(0, 10)
  
  // Add current result to recent games if available
  const displayResults = currentResult 
    ? [currentResult, ...recentGames] 
    : recentGames
  
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
              {formatPayout(totalProfit)}
            </div>
            <div className="text-xs text-slate-400">Net Profit</div>
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
              <div className="text-slate-400">Games Played</div>
              <div className="text-white font-medium">{totalGames}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Results */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Recent Results</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {displayResults.length > 0 ? (
            displayResults.map((result, index) => {
              const isCurrent = currentResult && currentResult.gameId === result.gameId
              const color = result.color || (result.result?.color)
              const number = result.number || (result.result?.number)
              
              return (
                <div
                  key={`${result.gameId}-${index}`}
                  className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                    color === 'red' ? 'bg-red-600 text-white' :
                    color === 'green' ? 'bg-green-600 text-white' :
                    color === 'purple' ? 'bg-purple-600 text-white' :
                    'bg-gray-600 text-white'
                  } ${isCurrent ? 'ring-2 ring-yellow-400 scale-110' : ''}`}
                >
                  {number}
                </div>
              )
            })
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
                <th className="text-left p-4 text-xs font-medium text-slate-400">Game ID</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Time</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Result</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Bets</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Bet Amount</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Payout</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Result</th>
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
                    #{round.gameId.slice(-8)}
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
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        round.result.color === 'red' ? 'bg-red-600 text-white' :
                        round.result.color === 'green' ? 'bg-green-600 text-white' :
                        'bg-purple-600 text-white'
                      }`}>
                        {round.result.number}
                      </div>
                      <span className="text-sm text-white capitalize">{round.result.color}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-white">
                    {round.bets.length}
                  </td>
                  <td className="p-4 text-sm text-white">
                    {formatPayout(round.totalBetAmount)}
                  </td>
                  <td className="p-4 text-sm text-white">
                    {formatPayout(round.totalPayout)}
                  </td>
                  <td className="p-4">
                    <span className={`text-sm font-medium ${round.isWin ? 'text-emerald-400' : 'text-red-400'}`}>
                      {getOutcomeText(round.isWin)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {history.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <div className="text-4xl mb-2">ð</div>
            <p>No games played yet</p>
          </div>
        )}
      </div>
      
      {/* Color Distribution */}
      {totalGames > 0 && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Color Distribution</h3>
          <div className="space-y-3">
            {['red', 'green', 'purple'].map((color) => {
              const colorHistory = history.filter(round => round.result.color === color)
              const colorCount = colorHistory.length
              const colorPercentage = totalGames > 0 ? (colorCount / totalGames) * 100 : 0
              
              return (
                <div key={color} className="flex items-center justify-between p-3 bg-[#1a2c38] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      color === 'red' ? 'bg-red-600 text-white' :
                      color === 'green' ? 'bg-green-600 text-white' :
                      'bg-purple-600 text-white'
                    }`}>
                      {getColorEmoji(color as any)}
                    </div>
                    <span className="text-sm text-white capitalize">{color}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-white">
                      {colorCount} games
                    </span>
                    <span className="text-slate-400">
                      {colorPercentage.toFixed(1)}%
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
