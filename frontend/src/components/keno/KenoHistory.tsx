'use client'

import { MiniKenoTile } from './KenoTile'
import type { KenoRound, KenoResult } from '@/utils/kenoEngine'
import { 
  formatTime,
  formatDate,
  getWinRate,
  getTotalProfit,
  getAverageBet,
  getAverageMatches,
  getMostSelectedNumbers,
  getMostDrawnNumbers
} from '@/utils/kenoEngine'
import { 
  getDifficultyInfo,
  formatMultiplier,
  formatProbability,
  type Difficulty
} from '@/utils/kenoPayout'

interface KenoHistoryProps {
  history: KenoRound[]
  currentResult: KenoResult | null
}

export default function KenoHistory({ history, currentResult }: KenoHistoryProps) {
  const stats = {
    totalGames: history.length,
    wins: history.filter(round => round.result.isWin).length,
    losses: history.filter(round => !round.result.isWin && round.result.matches > 0).length,
    totalBet: history.reduce((sum, round) => sum + round.result.bet.amount, 0),
    totalPayout: history.reduce((sum, round) => sum + round.result.payout, 0),
    totalProfit: getTotalProfit(history),
    averageBet: getAverageBet(history),
    averageMatches: getAverageMatches(history),
    winRate: getWinRate(history),
    mostSelectedNumbers: getMostSelectedNumbers(history),
    mostDrawnNumbers: getMostDrawnNumbers(history)
  }
  
  const getOutcomeColor = (isWin: boolean) => {
    return isWin ? 'text-emerald-400' : 'text-red-400'
  }
  
  const getOutcomeEmoji = (isWin: boolean) => {
    return isWin ? 'ð' : 'ð'
  }
  
  const getOutcomeText = (isWin: boolean) => {
    return isWin ? 'WIN' : 'LOSS'
  }
  
  const getDifficultyColor = (difficulty: Difficulty) => {
    const config = getDifficultyInfo(difficulty)
    return config.color
  }
  
  // Get recent results for display
  const recentResults = history.slice(0, 10)
  
  // Add current result to recent results if available
  const displayResults = currentResult 
    ? [currentResult, ...recentResults] 
    : recentResults
  
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
            <div className="text-2xl font-bold text-orange-400">
              {stats.averageMatches.toFixed(1)}
            </div>
            <div className="text-xs text-slate-400">Avg Matches</div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-slate-400">Total Bet</div>
              <div className="text-white font-medium">{stats.totalBet.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-slate-400">Total Payout</div>
              <div className="text-white font-medium">{stats.totalPayout.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-slate-400">Net Profit</div>
              <div className={`font-medium ${stats.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {stats.totalProfit >= 0 ? '+' : ''}{stats.totalProfit.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-slate-400">Avg Bet</div>
              <div className="text-white font-medium">{stats.averageBet.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Results */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Results</h3>
        <div className="space-y-3">
          {displayResults.length > 0 ? (
            displayResults.map((item, index) => {
              // Handle both KenoResult and KenoRound types
              const result = 'result' in item ? item.result : item
              const isCurrent = index === 0 && currentResult
              
              return (
                <div
                  key={result.id}
                  className={`p-4 bg-[#1a2c38] rounded-lg border border-white/10 ${
                    isCurrent ? 'ring-2 ring-emerald-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`text-lg font-bold ${getOutcomeColor(result.isWin)}`}>
                        {getOutcomeEmoji(result.isWin)}
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${getOutcomeColor(result.isWin)}`}>
                          {getOutcomeText(result.isWin)}
                        </div>
                        <div className="text-xs text-slate-400">
                          {formatTime(result.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${getOutcomeColor(result.isWin)}`}>
                        {result.isWin ? '+' : ''}{result.profit.toFixed(2)}
                      </div>
                      <div className="text-xs text-slate-400">
                        {formatMultiplier(result.multiplier)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-slate-400 mb-1">Selected ({result.bet.selectedNumbers.length})</div>
                      <div className="flex flex-wrap gap-1">
                        {result.bet.selectedNumbers.slice(0, 10).map((num: number) => (
                          <MiniKenoTile
                            key={num}
                            number={num}
                            status="selected"
                            compact={true}
                          />
                        ))}
                        {result.bet.selectedNumbers.length > 10 && (
                          <span className="text-slate-400">+{result.bet.selectedNumbers.length - 10}</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 mb-1">Drawn ({result.draw.numbers.length})</div>
                      <div className="flex flex-wrap gap-1">
                        {result.draw.numbers.slice(0, 10).map((num: number) => {
                          const isMatch = result.bet.selectedNumbers.includes(num)
                          return (
                            <MiniKenoTile
                              key={num}
                              number={num}
                              status={isMatch ? 'match' : 'drawn'}
                              compact={true}
                            />
                          )
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4">
                      <span className="text-slate-400">Matches:</span>
                      <span className="text-white font-medium">{result.matches}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-400">Difficulty:</span>
                      <span className={`font-medium ${getDifficultyColor(result.bet.difficulty)}`}>
                        {result.bet.difficulty.charAt(0).toUpperCase() + result.bet.difficulty.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-400">Bet:</span>
                      <span className="text-white font-medium">{result.bet.amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-8 text-slate-400">
              <div className="text-4xl mb-2">â</div>
              <p>No games played yet</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Hot/Cold Numbers */}
      {history.length > 0 && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Number Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-orange-400 mb-3">Most Selected</h4>
              <div className="flex flex-wrap gap-2">
                {stats.mostSelectedNumbers.slice(0, 8).map(number => (
                  <MiniKenoTile
                    key={number}
                    number={number}
                    status="selected"
                    compact={true}
                  />
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-400 mb-3">Most Drawn</h4>
              <div className="flex flex-wrap gap-2">
                {stats.mostDrawnNumbers.slice(0, 8).map(number => (
                  <MiniKenoTile
                    key={number}
                    number={number}
                    status="drawn"
                    compact={true}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Performance by Difficulty */}
      {history.length > 0 && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance by Difficulty</h3>
          <div className="space-y-3">
            {['easy', 'medium', 'hard', 'expert'].map(difficulty => {
              const difficultyHistory = history.filter(round => round.result.bet.difficulty === difficulty)
              const wins = difficultyHistory.filter(round => round.result.isWin).length
              const total = difficultyHistory.length
              const winRate = total > 0 ? (wins / total) * 100 : 0
              const profit = difficultyHistory.reduce((sum, round) => sum + round.result.profit, 0)
              
              return (
                <div key={difficulty} className="flex items-center justify-between p-3 bg-[#1a2c38] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getDifficultyInfo(difficulty as Difficulty).bgColor.replace('/20', '/600')}`}></div>
                    <div>
                      <div className={`text-sm font-medium capitalize ${getDifficultyColor(difficulty as Difficulty)}`}>
                        {difficulty}
                      </div>
                      <div className="text-xs text-slate-400">
                        {total} games
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">
                      {winRate.toFixed(1)}% WR
                    </div>
                    <div className={`text-xs ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {profit >= 0 ? '+' : ''}{profit.toFixed(2)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      
      {/* Match Distribution */}
      {history.length > 0 && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Match Distribution</h3>
          <div className="space-y-2">
            {Array.from({ length: 11 }, (_, i) => i).map(matches => {
              const count = history.filter(round => round.result.matches === matches).length
              const percentage = history.length > 0 ? (count / history.length) * 100 : 0
              
              return (
                <div key={matches} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${
                      matches >= 4 ? 'bg-emerald-600' : 'bg-slate-600'
                    }`}></div>
                    <span className="text-sm text-white">
                      {matches} {matches === 1 ? 'Match' : 'Matches'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-white">
                      {count}
                    </span>
                    <span className="text-slate-400">
                      {percentage.toFixed(1)}%
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
          <h3 className="text-sm font-semibold text-white">Complete History</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-xs font-medium text-slate-400">Game</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Time</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Difficulty</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Bet</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Selections</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Matches</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Multiplier</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Result</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Profit</th>
              </tr>
            </thead>
            <tbody>
              {history.slice(0, 20).map((round, index) => (
                <tr 
                  key={round.id}
                  className={`border-b border-white/5 ${
                    index % 2 === 0 ? 'bg-white/5' : ''
                  }`}
                >
                  <td className="p-4 text-sm text-white font-mono">
                    #{round.id.slice(-8)}
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
                    <span className={`text-sm font-medium capitalize ${getDifficultyColor(round.result.bet.difficulty)}`}>
                      {round.result.bet.difficulty}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-white">
                    {round.result.bet.amount.toFixed(2)}
                  </td>
                  <td className="p-4 text-sm text-white">
                    {round.result.bet.selectedNumbers.length}
                  </td>
                  <td className="p-4 text-sm text-white">
                    {round.result.matches}
                  </td>
                  <td className="p-4 text-sm text-white">
                    {formatMultiplier(round.result.multiplier)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg ${getOutcomeColor(round.result.isWin)}`}>
                        {getOutcomeEmoji(round.result.isWin)}
                      </span>
                      <span className={`text-sm font-medium ${getOutcomeColor(round.result.isWin)}`}>
                        {getOutcomeText(round.result.isWin)}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-sm font-medium ${getOutcomeColor(round.result.isWin)}`}>
                      {round.result.profit >= 0 ? '+' : ''}
                      {round.result.profit.toFixed(2)}
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
