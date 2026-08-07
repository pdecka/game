'use client'

import { 
  formatTime, 
  formatDate, 
  formatAmount,
  formatProfit,
  calculateStatistics,
  type CoinRound,
  type CoinResult
} from '@/utils/coinConfig'

interface CoinHistoryProps {
  history: CoinRound[]
  currentResult: CoinResult | null
}

export default function CoinHistory({ history, currentResult }: CoinHistoryProps) {
  const stats = calculateStatistics(history)
  
  const getOutcomeColor = (isWin: boolean) => {
    return isWin ? 'text-emerald-400' : 'text-red-400'
  }
  
  const getSideEmoji = (side: 'heads' | 'tails') => {
    return side === 'heads' ? 'ð' : 'ð'
  }
  
  const getSideColor = (side: 'heads' | 'tails') => {
    return side === 'heads' ? 'text-yellow-400' : 'text-blue-400'
  }
  
  // Get recent games for display
  const recentGames = history.slice(0, 10)
  
  // Add current result to recent games if available
  const displayResults = currentResult 
    ? [currentResult, ...recentGames.map(r => r.result)] 
    : recentGames.map(r => r.result)
  
  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">
              {stats.wins}
            </div>
            <div className="text-xs text-slate-400">Wins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {stats.losses}
            </div>
            <div className="text-xs text-slate-400">Losses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {stats.winRate.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-400">Win Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {formatProfit(stats.totalProfit)}
            </div>
            <div className="text-xs text-slate-400">Net Profit</div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-slate-400">Total Bet</div>
              <div className="text-white font-medium">{formatAmount(stats.totalBet)}</div>
            </div>
            <div>
              <div className="text-slate-400">Total Payout</div>
              <div className="text-white font-medium">{formatAmount(stats.totalPayout)}</div>
            </div>
            <div>
              <div className="text-slate-400">Games Played</div>
              <div className="text-white font-medium">{stats.totalGames}</div>
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
              const side = result.side
              
              return (
                <div
                  key={`${result.gameId}-${index}`}
                  className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                    side === 'heads' ? 'bg-yellow-600 text-white' :
                    side === 'tails' ? 'bg-blue-600 text-white' :
                    'bg-gray-600 text-white'
                  } ${isCurrent ? 'ring-2 ring-emerald-400 scale-110' : ''}`}
                >
                  {getSideEmoji(side)}
                </div>
              )
            })
          ) : (
            <div className="text-slate-400 text-sm">No games played yet</div>
          )}
        </div>
      </div>
      
      {/* Side Distribution */}
      {stats.totalGames > 0 && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Side Distribution</h3>
          <div className="space-y-3">
            {(['heads', 'tails'] as const).map((side) => {
              const sideCount = side === 'heads' ? stats.headsWins : stats.tailsWins
              const sidePercentage = stats.totalGames > 0 ? (sideCount / stats.totalGames) * 100 : 0
              
              return (
                <div key={side} className="flex items-center justify-between p-3 bg-[#1a2c38] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      side === 'heads' ? 'bg-yellow-600 text-white' : 'bg-blue-600 text-white'
                    }`}>
                      {getSideEmoji(side)}
                    </div>
                    <span className="text-sm text-white capitalize">{side}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-white">
                      {sideCount} wins
                    </span>
                    <span className="text-slate-400">
                      {sidePercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      
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
                <th className="text-left p-4 text-xs font-medium text-slate-400">Choice</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Result</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Payout</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Profit</th>
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
                  <td className="p-4 text-sm text-white font-mono">
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
                  <td className="p-4 text-sm text-white">
                    {formatAmount(round.bet.amount)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg ${getSideColor(round.bet.side)}`}>
                        {getSideEmoji(round.bet.side)}
                      </span>
                      <span className="text-sm text-white capitalize">{round.bet.side}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg ${getSideColor(round.result.side)}`}>
                        {getSideEmoji(round.result.side)}
                      </span>
                      <span className="text-sm text-white capitalize">{round.result.side}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-white">
                    {formatAmount(round.payout)}
                  </td>
                  <td className="p-4">
                    <span className={`text-sm font-medium ${getOutcomeColor(round.isWin)}`}>
                      {formatProfit(round.profit)}
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
      
      {/* Performance Metrics */}
      {stats.totalGames > 0 && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#1a2c38] rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Average Bet</div>
              <div className="text-xl font-bold text-white">
                {formatAmount(stats.totalBet / stats.totalGames)}
              </div>
            </div>
            <div className="p-4 bg-[#1a2c38] rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Return Rate</div>
              <div className="text-xl font-bold text-white">
                {stats.totalBet > 0 ? ((stats.totalPayout / stats.totalBet) * 100).toFixed(1) : '0'}%
              </div>
            </div>
            <div className="p-4 bg-[#1a2c38] rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Best Streak</div>
              <div className="text-xl font-bold text-emerald-400">
                {Math.max(stats.headsWins, stats.tailsWins)} wins
              </div>
            </div>
            <div className="p-4 bg-[#1a2c38] rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Profit per Game</div>
              <div className="text-xl font-bold text-white">
                {formatAmount(stats.totalProfit / stats.totalGames)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
