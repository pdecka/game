'use client'

import { 
  formatTime, 
  formatDate, 
  formatAmount,
  formatProfit,
  formatRollValue,
  calculateStatistics,
  analyzeTargetDistribution,
  type DiceRound,
  type DiceResult
} from '@/utils/diceConfig'
import { 
  analyzeBettingPattern,
  calculateStreaks,
  getRollTypeColor,
  getRollTypeBgColor,
  analyzeRollDistribution,
  calculateVolatility,
  getProfitTrend
} from '@/utils/diceMath'

interface DiceHistoryProps {
  history: DiceRound[]
  currentResult: DiceResult | null
}

export default function DiceHistory({ history, currentResult }: DiceHistoryProps) {
  const stats = calculateStatistics(history)
  const targetDistribution = analyzeTargetDistribution(history)
  const pattern = analyzeBettingPattern(history)
  const streaks = calculateStreaks(history)
  const rollAnalysis = analyzeRollDistribution(history)
  const volatility = calculateVolatility(history)
  const profitTrend = getProfitTrend(history)
  
  const getOutcomeColor = (isWin: boolean) => {
    return isWin ? 'text-emerald-400' : 'text-red-400'
  }
  
  const getRollValueColor = (rollValue: number): string => {
    if (rollValue < 25) return 'text-emerald-400'
    if (rollValue < 50) return 'text-green-400'
    if (rollValue < 75) return 'text-yellow-400'
    return 'text-red-400'
  }
  
  // Get recent roll values for display
  const recentRolls = history.slice(0, 12).map(round => round.result.rollValue)
  
  // Add current result to recent rolls if available
  const displayRolls = currentResult 
    ? [currentResult.rollValue, ...recentRolls] 
    : recentRolls
  
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
              <div className="text-slate-400">Avg Roll</div>
              <div className="text-white font-medium">{formatRollValue(stats.averageRollValue)}</div>
            </div>
            <div>
              <div className="text-slate-400">Avg Multiplier</div>
              <div className="text-white font-medium">{stats.averageMultiplier.toFixed(2)}x</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Rolls */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Recent Rolls</h3>
        <div className="grid grid-cols-6 gap-2">
          {displayRolls.length > 0 ? (
            displayRolls.map((rollValue, index) => {
              const isCurrent = currentResult && currentResult.rollValue === rollValue
              const correspondingRound = history.find(r => r.result.rollValue === rollValue)
              const isWin = correspondingRound?.isWin
              
              return (
                <div
                  key={`${rollValue}-${index}`}
                  className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                    getRollValueColor(rollValue).replace('text-', 'bg-')
                  } ${isCurrent ? 'ring-2 ring-emerald-400 scale-110' : ''}`}
                  title={`${formatRollValue(rollValue)}${isWin !== undefined ? (isWin ? ' (Win)' : ' (Loss)') : ''}`}
                >
                  <span className="text-white">
                    {formatRollValue(rollValue)}
                  </span>
                </div>
              )
            })
          ) : (
            <div className="col-span-6 text-slate-400 text-sm">No rolls yet</div>
          )}
        </div>
      </div>
      
      {/* Roll Type Performance */}
      {stats.totalGames > 0 && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Roll Type Performance</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-[#1a2c38] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Over</span>
                <span className={`text-sm font-bold ${getRollTypeColor('over')}`}>
                  {stats.overWins} wins
                </span>
              </div>
              <div className="text-xs text-slate-400">
                {pattern.rollTypeDistribution.over} games
              </div>
              <div className="text-xs text-emerald-400">
                {pattern.successRateByRollType.over.toFixed(1)}% win rate
              </div>
            </div>
            <div className="p-4 bg-[#1a2c38] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Under</span>
                <span className={`text-sm font-bold ${getRollTypeColor('under')}`}>
                  {stats.underWins} wins
                </span>
              </div>
              <div className="text-xs text-slate-400">
                {pattern.rollTypeDistribution.under} games
              </div>
              <div className="text-xs text-emerald-400">
                {pattern.successRateByRollType.under.toFixed(1)}% win rate
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Target Distribution */}
      {stats.totalGames > 0 && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Target Distribution</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[#1a2c38] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                  L
                </div>
                <span className="text-sm text-white">Low (2-33)</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-white">
                  {targetDistribution.lowTargets} hits
                </span>
                <span className="text-slate-400">
                  {stats.totalGames > 0 ? ((targetDistribution.lowTargets / stats.totalGames) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-[#1a2c38] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-600 text-white flex items-center justify-center text-xs font-bold">
                  M
                </div>
                <span className="text-sm text-white">Medium (34-66)</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-white">
                  {targetDistribution.mediumTargets} hits
                </span>
                <span className="text-slate-400">
                  {stats.totalGames > 0 ? ((targetDistribution.mediumTargets / stats.totalGames) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-[#1a2c38] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold">
                  H
                </div>
                <span className="text-sm text-white">High (67-96)</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-white">
                  {targetDistribution.highTargets} hits
                </span>
                <span className="text-slate-400">
                  {stats.totalGames > 0 ? ((targetDistribution.highTargets / stats.totalGames) * 100).toFixed(1) : 0}%
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
              <div className="text-sm text-slate-400 mb-1">Average Target</div>
              <div className="text-xl font-bold text-white">
                {pattern.averageTarget.toFixed(1)}
              </div>
            </div>
            <div className="p-4 bg-[#1a2c38] rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Risk Level</div>
              <div className="text-xl font-bold text-white capitalize">
                {pattern.riskLevel}
              </div>
            </div>
            <div className="p-4 bg-[#1a2c38] rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Preferred Type</div>
              <div className="text-xl font-bold text-white capitalize">
                {pattern.preferredRollType}
              </div>
            </div>
            <div className="p-4 bg-[#1a2c38] rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Avg Bet</div>
              <div className="text-xl font-bold text-white">
                {formatAmount(pattern.averageBetAmount)}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Roll Distribution Analysis */}
      {stats.totalGames > 0 && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Roll Distribution</h3>
          <div className="space-y-3">
            {Object.entries(rollAnalysis.distribution).map(([range, count]) => (
              <div key={range} className="flex items-center justify-between">
                <span className="text-sm text-white">{range}</span>
                <div className="flex items-center gap-4">
                  <div className="w-32 bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(count / stats.totalGames) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-slate-400 w-12 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Fairness Score:</span>
              <span className="text-white font-medium">
                {rollAnalysis.fairness.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Performance Metrics */}
      {stats.totalGames > 0 && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#1a2c38] rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Volatility</div>
              <div className="text-xl font-bold text-white">
                {volatility.toFixed(2)}
              </div>
            </div>
            <div className="p-4 bg-[#1a2c38] rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Profit Trend</div>
              <div className="text-xl font-bold text-white capitalize">
                {profitTrend}
              </div>
            </div>
            <div className="p-4 bg-[#1a2c38] rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Most Common Target</div>
              <div className="text-xl font-bold text-white">
                {targetDistribution.mostCommonTarget}
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
                <th className="text-left p-4 text-xs font-medium text-slate-400">Type</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Result</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Multiplier</th>
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
                  <td className="p-4 text-sm text-white">
                    {round.bet.target}
                  </td>
                  <td className="p-4">
                    <div className={`text-sm font-medium capitalize ${getRollTypeColor(round.bet.rollType)}`}>
                      {round.bet.rollType}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`text-sm font-bold ${getRollValueColor(round.result.rollValue)}`}>
                      {formatRollValue(round.result.rollValue)}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-white">
                    {round.result.multiplier.toFixed(2)}x
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
    </div>
  )
}
