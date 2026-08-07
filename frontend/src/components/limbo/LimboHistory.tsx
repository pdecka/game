'use client'

import { 
  formatTime, 
  formatDate, 
  formatAmount,
  formatProfit,
  formatMultiplier,
  calculateStatistics,
  analyzeMultiplierDistribution,
  type LimboRound,
  type LimboResult
} from '@/utils/limboConfig'
import { 
  analyzeBettingPattern,
  calculateStreaks,
  getMultiplierRiskScore
} from '@/utils/limboMath'

interface LimboHistoryProps {
  history: LimboRound[]
  currentResult: LimboResult | null
}

export default function LimboHistory({ history, currentResult }: LimboHistoryProps) {
  const stats = calculateStatistics(history)
  const distribution = analyzeMultiplierDistribution(history)
  const pattern = analyzeBettingPattern(history)
  const streaks = calculateStreaks(history)
  
  const getOutcomeColor = (isWin: boolean) => {
    return isWin ? 'text-emerald-400' : 'text-red-400'
  }
  
  const getMultiplierColor = (multiplier: number) => {
    if (multiplier < 2) return 'text-emerald-400'
    if (multiplier < 5) return 'text-yellow-400'
    if (multiplier < 10) return 'text-orange-400'
    return 'text-red-400'
  }
  
  const getMultiplierBgColor = (multiplier: number) => {
    if (multiplier < 2) return 'bg-emerald-600'
    if (multiplier < 5) return 'bg-yellow-600'
    if (multiplier < 10) return 'bg-orange-600'
    return 'bg-red-600'
  }
  
  // Get recent multipliers for display
  const recentMultipliers = history.slice(0, 10).map(round => round.result.generatedMultiplier)
  
  // Add current result to recent multipliers if available
  const displayMultipliers = currentResult 
    ? [currentResult.generatedMultiplier, ...recentMultipliers] 
    : recentMultipliers
  
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
      
      {/* Recent Multipliers */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Recent Multipliers</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {displayMultipliers.length > 0 ? (
            displayMultipliers.map((multiplier, index) => {
              const isCurrent = currentResult && currentResult.generatedMultiplier === multiplier
              const correspondingRound = history.find(r => r.result.generatedMultiplier === multiplier)
              const isWin = correspondingRound?.isWin
              
              return (
                <div
                  key={`${multiplier}-${index}`}
                  className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                    getMultiplierBgColor(multiplier)
                  } ${isCurrent ? 'ring-2 ring-emerald-400 scale-110' : ''}`}
                  title={`${formatMultiplier(multiplier)}x${isWin !== undefined ? (isWin ? ' (Win)' : ' (Loss)') : ''}`}
                >
                  {formatMultiplier(multiplier)}
                </div>
              )
            })
          ) : (
            <div className="text-slate-400 text-sm">No games played yet</div>
          )}
        </div>
      </div>
      
      {/* Multiplier Distribution */}
      {stats.totalGames > 0 && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Multiplier Distribution</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[#1a2c38] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                  {'<2x'}
                </div>
                <span className="text-sm text-white">Low (&lt; 2x)</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-white">
                  {distribution.lowMultiplier} hits
                </span>
                <span className="text-slate-400">
                  {stats.totalGames > 0 ? ((distribution.lowMultiplier / stats.totalGames) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-[#1a2c38] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-600 text-white flex items-center justify-center text-xs font-bold">
                  2-10x
                </div>
                <span className="text-sm text-white">Medium (2x - 10x)</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-white">
                  {distribution.mediumMultiplier} hits
                </span>
                <span className="text-slate-400">
                  {stats.totalGames > 0 ? ((distribution.mediumMultiplier / stats.totalGames) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-[#1a2c38] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold">
                  {'>10x'}
                </div>
                <span className="text-sm text-white">High (&gt; 10x)</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-white">
                  {distribution.highMultiplier} hits
                </span>
                <span className="text-slate-400">
                  {stats.totalGames > 0 ? ((distribution.highMultiplier / stats.totalGames) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Betting Pattern Analysis */}
      {stats.totalGames > 0 && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Betting Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#1a2c38] rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Risk Level</div>
              <div className="text-xl font-bold text-white capitalize">
                {pattern.riskLevel}
              </div>
            </div>
            <div className="p-4 bg-[#1a2c38] rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Multiplier Preference</div>
              <div className="text-xl font-bold text-white capitalize">
                {pattern.multiplierPreference}
              </div>
            </div>
            <div className="p-4 bg-[#1a2c38] rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Average Target</div>
              <div className="text-xl font-bold text-white">
                {formatMultiplier(pattern.averageTargetMultiplier)}x
              </div>
            </div>
            <div className="p-4 bg-[#1a2c38] rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Average Bet</div>
              <div className="text-xl font-bold text-white">
                {formatAmount(pattern.averageBetAmount)}
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
                <th className="text-left p-4 text-xs font-medium text-slate-400">Target</th>
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
                    <div className={`text-sm font-bold ${getMultiplierColor(round.bet.targetMultiplier)}`}>
                      {formatMultiplier(round.bet.targetMultiplier)}x
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`text-sm font-bold ${getMultiplierColor(round.result.generatedMultiplier)}`}>
                      {formatMultiplier(round.result.generatedMultiplier)}x
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
            <div className="text-4xl mb-2">â</div>
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
              <div className="text-sm text-slate-400 mb-1">Lowest Multiplier</div>
              <div className="text-xl font-bold text-white">
                {formatMultiplier(stats.lowestMultiplier)}x
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
          </div>
        </div>
      )}
    </div>
  )
}
