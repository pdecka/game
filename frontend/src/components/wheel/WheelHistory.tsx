'use client'

import { 
  formatTime, 
  formatDate, 
  formatAmount,
  formatProfit,
  formatMultiplier,
  calculateStatistics,
  analyzeDifficultyPerformance,
  type WheelRound,
  type WheelResult
} from '@/utils/wheelConfig'
import { 
  analyzeBettingPattern,
  calculateStreaks,
  getDifficultyColor,
  getDifficultyBgColor
} from '@/utils/wheelMath'

interface WheelHistoryProps {
  history: WheelRound[]
  currentResult: WheelResult | null
}

export default function WheelHistory({ history, currentResult }: WheelHistoryProps) {
  const stats = calculateStatistics(history)
  const difficultyPerformance = analyzeDifficultyPerformance(history)
  const pattern = analyzeBettingPattern(history)
  const streaks = calculateStreaks(history)
  
  const getOutcomeColor = (isWin: boolean) => {
    return isWin ? 'text-emerald-400' : 'text-red-400'
  }
  
  const getSegmentColor = (multiplier: number) => {
    if (multiplier === 0) return 'bg-gray-600'
    if (multiplier <= 2) return 'bg-emerald-600'
    if (multiplier <= 5) return 'bg-yellow-600'
    if (multiplier <= 15) return 'bg-orange-600'
    return 'bg-red-600'
  }
  
  // Get recent segments for display
  const recentSegments = history.slice(0, 12).map(round => round.result.segment)
  
  // Add current result to recent segments if available
  const displaySegments = currentResult 
    ? [currentResult.segment, ...recentSegments] 
    : recentSegments
  
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-slate-400">Total Bet</div>
              <div className="text-white font-medium">{formatAmount(stats.totalBet)}</div>
            </div>
            <div>
              <div className="text-slate-400">Total Payout</div>
              <div className="text-white font-medium">{formatAmount(stats.totalPayout)}</div>
            </div>
            <div>
              <div className="text-slate-400">Avg Multiplier</div>
              <div className="text-white font-medium">{formatMultiplier(stats.averageMultiplier)}x</div>
            </div>
            <div>
              <div className="text-slate-400">Games Played</div>
              <div className="text-white font-medium">{stats.totalGames}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Segments */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Recent Segments</h3>
        <div className="grid grid-cols-6 gap-2">
          {displaySegments.length > 0 ? (
            displaySegments.map((segment, index) => {
              const isCurrent = currentResult && currentResult.segment.id === segment.id
              const correspondingRound = history.find(r => r.result.segment.id === segment.id)
              const isWin = correspondingRound?.isWin
              
              return (
                <div
                  key={`${segment.id}-${index}`}
                  className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                    getSegmentColor(segment.multiplier)
                  } ${isCurrent ? 'ring-2 ring-emerald-400 scale-110' : ''}`}
                  title={`${segment.label}${isWin !== undefined ? (isWin ? ' (Win)' : ' (Loss)') : ''}`}
                >
                  <span className="text-white">
                    {segment.multiplier === 0 ? '0x' : `${segment.multiplier}x`}
                  </span>
                </div>
              )
            })
          ) : (
            <div className="col-span-6 text-slate-400 text-sm">No games played yet</div>
          )}
        </div>
      </div>
      
      {/* Difficulty Performance */}
      {stats.totalGames > 0 && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Difficulty Performance</h3>
          <div className="space-y-3">
            {(['easy', 'medium', 'hard', 'expert'] as const).map(difficulty => {
              const performance = difficultyPerformance[difficulty]
              const winRate = performance.winRate
              
              return (
                <div key={difficulty} className="flex items-center justify-between p-3 bg-[#1a2c38] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${getDifficultyBgColor(difficulty)} text-white flex items-center justify-center text-xs font-bold`}>
                      {difficulty.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm text-white capitalize">{difficulty}</div>
                      <div className="text-xs text-slate-400">{performance.games} games</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-white">
                      {performance.wins} wins
                    </span>
                    <span className={`${getDifficultyColor(difficulty)}`}>
                      {winRate.toFixed(1)}%
                    </span>
                    <span className="text-emerald-400">
                      {formatProfit(performance.totalProfit)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      
      {/* Betting Pattern Analysis */}
      {stats.totalGames > 0 && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Betting Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#1a2c38] rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Preferred Difficulty</div>
              <div className="text-xl font-bold text-white capitalize">
                {pattern.preferredDifficulty}
              </div>
            </div>
            <div className="p-4 bg-[#1a2c38] rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Risk Level</div>
              <div className="text-xl font-bold text-white capitalize">
                {pattern.riskLevel}
              </div>
            </div>
            <div className="p-4 bg-[#1a2c38] rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Average Bet</div>
              <div className="text-xl font-bold text-white">
                {formatAmount(pattern.averageBetAmount)}
              </div>
            </div>
            <div className="p-4 bg-[#1a2c38] rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Success Rate</div>
              <div className="text-xl font-bold text-white">
                {stats.winRate.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Streak Information */}
      {stats.totalGames > 0 && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Streak Analysis</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">
                {streaks.longestWinStreak}
              </div>
              <div className="text-xs text-slate-400">Longest Win Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {streaks.longestLossStreak}
              </div>
              <div className="text-xs text-slate-400">Longest Loss Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {streaks.currentStreak}
              </div>
              <div className="text-xs text-slate-400">Current Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {streaks.averageStreakLength.toFixed(1)}
              </div>
              <div className="text-xs text-slate-400">Avg Streak Length</div>
            </div>
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
                <th className="text-left p-4 text-xs font-medium text-slate-400">Difficulty</th>
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
                    <div className={`text-sm font-medium capitalize ${getDifficultyColor(round.bet.difficulty)}`}>
                      {round.bet.difficulty}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold text-white ${getSegmentColor(round.result.segment.multiplier)}`}>
                      {round.result.segment.label}
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
              <div className="text-sm text-slate-400 mb-1">Highest Multiplier</div>
              <div className="text-xl font-bold text-white">
                {formatMultiplier(stats.highestMultiplier)}x
              </div>
            </div>
            <div className="p-4 bg-[#1a2c38] rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Return Rate</div>
              <div className="text-xl font-bold text-white">
                {stats.totalBet > 0 ? ((stats.totalPayout / stats.totalBet) * 100).toFixed(1) : '0'}%
              </div>
            </div>
            <div className="p-4 bg-[#1a2c38] rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Profit per Game</div>
              <div className="text-xl font-bold text-white">
                {formatProfit(stats.totalProfit / stats.totalGames)}
              </div>
            </div>
            <div className="p-4 bg-[#1a2c38] rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Most Played</div>
              <div className="text-xl font-bold text-white capitalize">
                {pattern.preferredDifficulty}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
