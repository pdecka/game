'use client'

import { useState } from 'react'
import MiniScratchCard from './ScratchCard'
import type { ScratchResult, ScratchRound } from '@/utils/scratchEngine'
import { formatGameResult } from '@/utils/scratchEngine'
import { formatTimestamp, formatDate } from '@/utils/scratchEngine'

interface ScratchHistoryProps {
  history: ScratchRound[]
  currentResult: ScratchResult | null
}

export default function ScratchHistory({ history, currentResult }: ScratchHistoryProps) {
  const [showHistory, setShowHistory] = useState(false)
  const [filter, setFilter] = useState<'all' | 'wins' | 'losses' | 'jackpot'>('all')
  
  const getFilteredHistory = () => {
    switch (filter) {
      case 'wins':
        return history.filter(round => round.result.isWin)
      case 'losses':
        return history.filter(round => !round.result.isWin)
      case 'jackpot':
        return history.filter(round => round.result.cardType === 'jackpot')
      default:
        return history
    }
  }
  
  const getStats = () => {
    if (history.length === 0) {
      return {
        totalGames: 0,
        totalWins: 0,
        totalLosses: 0,
        winRate: 0,
        totalBet: 0,
        totalPayout: 0,
        totalProfit: 0,
        averageBet: 0,
        biggestWin: 0,
        biggestLoss: 0,
        averageMultiplier: 0,
        jackpotWins: 0,
        volatilityBreakdown: { low: 0, medium: 0, high: 0 },
        cardTypeBreakdown: { classic: 0, multiplier: 0, bonus: 0, jackpot: 0 }
      }
    }
    
    const wins = history.filter(round => round.result.isWin)
    const losses = history.filter(round => !round.result.isWin)
    const jackpotWins = history.filter(round => round.result.cardType === 'jackpot')
    
    const totalBet = history.reduce((sum, round) => sum + round.betAmount, 0)
    const totalPayout = history.reduce((sum, round) => sum + round.result.totalPayout, 0)
    const totalProfit = totalPayout - totalBet
    const averageBet = totalBet / history.length
    const biggestWin = Math.max(...history.map(round => round.result.totalPayout - round.betAmount))
    const biggestLoss = Math.min(...history.map(round => round.result.totalPayout - round.betAmount))
    
    const averageMultiplier = wins.length > 0 
      ? wins.reduce((sum, round) => sum + round.result.multiplier, 0) / wins.length 
      : 0
    
    const volatilityBreakdown = { low: 0, medium: 0, high: 0 }
    const cardTypeBreakdown = { classic: 0, multiplier: 0, bonus: 0, jackpot: 0 }
    
    history.forEach(round => {
      volatilityBreakdown[round.result.volatility]++
      cardTypeBreakdown[round.result.cardType]++
    })
    
    return {
      totalGames: history.length,
      totalWins: wins.length,
      totalLosses: losses.length,
      winRate: (wins.length / history.length) * 100,
      totalBet,
      totalPayout,
      totalProfit,
      averageBet,
      biggestWin,
      biggestLoss,
      averageMultiplier,
      jackpotWins: jackpotWins.length,
      volatilityBreakdown,
      cardTypeBreakdown
    }
  }
  
  const stats = getStats()
  const filteredHistory = getFilteredHistory()
  
  const getResultColor = (result: ScratchResult) => {
    if (!result.isWin) return 'text-red-400'
    if (result.cardType === 'jackpot') return 'text-yellow-400'
    if (result.cardType === 'multiplier') return 'text-purple-400'
    return 'text-emerald-400'
  }
  
  const getResultEmoji = (result: ScratchResult) => {
    if (!result.isWin) return 'â'
    if (result.cardType === 'jackpot') return 'ð'
    if (result.cardType === 'multiplier') return 'â'
    return 'ð'
  }
  
  // Get recent results for display
  const recentResults = filteredHistory.slice(0, 10)
  
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
            <div className="text-2xl font-bold text-emerald-400">{stats.totalWins}</div>
            <div className="text-xs text-slate-400">Total Wins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{stats.totalLosses}</div>
            <div className="text-xs text-slate-400">Total Losses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.jackpotWins}</div>
            <div className="text-xs text-slate-400">Jackpot Wins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{stats.averageMultiplier.toFixed(1)}x</div>
            <div className="text-xs text-slate-400">Avg Multiplier</div>
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
              <div className="text-slate-400">Win Rate</div>
              <div className="text-white font-medium">{stats.winRate.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filter Controls */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-white">Filter History</h4>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            {showHistory ? 'Hide' : 'Show'} Details
          </button>
        </div>
        <div className="flex gap-2">
          {(['all', 'wins', 'losses', 'jackpot'] as const).map(filterType => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filter === filterType 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-[#1a2c38] hover:bg-[#2a3c48] text-white border border-white/20'
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Recent Results */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Results</h3>
        <div className="space-y-3">
          {displayResults.length > 0 ? (
            displayResults.map((result, index) => {
              // Handle both ScratchResult and round types
              const isCurrentResult = index === 0 && currentResult
              let gameResult: ScratchResult
              let betAmount = 0
              
              if (isCurrentResult) {
                gameResult = result as ScratchResult
                betAmount = 0
              } else if ('result' in result) {
                // It's a ScratchRound
                const round = result as any
                gameResult = round.result as ScratchResult
                betAmount = round.betAmount || 0
              } else {
                // It's already a ScratchResult
                gameResult = result as ScratchResult
                betAmount = 0
              }
              
              const formattedResult = formatGameResult(gameResult)
              
              return (
                <div
                  key={isCurrentResult ? 'current' : (result as any)?.id}
                  className={`p-4 bg-[#1a2c38] rounded-lg border border-white/10 ${
                    isCurrentResult ? 'ring-2 ring-emerald-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`text-lg font-bold ${getResultColor(gameResult)}`}>
                        {getResultEmoji(gameResult)}
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${getResultColor(gameResult)}`}>
                          {formattedResult.status}
                        </div>
                        <div className="text-xs text-slate-400">
                          {formatTimestamp(gameResult.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${getResultColor(gameResult)}`}>
                        {gameResult.multiplier}x
                      </div>
                      <div className="text-xs text-slate-400">
                        {formattedResult.description}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-slate-400 mb-1">Card Type</div>
                      <div className="text-white font-medium">
                        {gameResult.cardType}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 mb-1">Volatility</div>
                      <div className="text-white font-medium">
                        {gameResult.volatility}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4">
                      <span className="text-slate-400">Bet:</span>
                      <span className="text-white font-medium">
                        {betAmount}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-400">Payout:</span>
                      <span className={`font-medium ${gameResult.isWin ? 'text-emerald-400' : 'text-red-400'}`}>
                        {gameResult.totalPayout.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  {gameResult.isWin && (
                    <div className="mt-2 text-xs text-emerald-400">
                      ð Winning combination revealed!
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="text-center py-8 text-slate-400">
              <div className="text-4xl mb-2">ð</div>
              <p>No games played yet</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Performance Metrics */}
      {history.length > 0 && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-emerald-400">{stats.biggestWin.toFixed(2)}</div>
              <div className="text-xs text-slate-400">Biggest Win</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-red-400">{Math.abs(stats.biggestLoss).toFixed(2)}</div>
              <div className="text-xs text-slate-400">Biggest Loss</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-400">{stats.averageMultiplier.toFixed(1)}x</div>
              <div className="text-xs text-slate-400">Avg Multiplier</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-400">{stats.winRate.toFixed(1)}%</div>
              <div className="text-xs text-slate-400">Win Rate</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Volatility Breakdown */}
      {history.length > 0 && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Volatility Breakdown</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">{stats.volatilityBreakdown.low}</div>
              <div className="text-xs text-slate-400">Low</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">{stats.volatilityBreakdown.medium}</div>
              <div className="text-xs text-slate-400">Medium</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-400">{stats.volatilityBreakdown.high}</div>
              <div className="text-xs text-slate-400">High</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Card Type Breakdown */}
      {history.length > 0 && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Card Type Breakdown</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">{stats.cardTypeBreakdown.classic}</div>
              <div className="text-xs text-slate-400">Classic</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-400">{stats.cardTypeBreakdown.multiplier}</div>
              <div className="text-xs text-slate-400">Multiplier</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-400">{stats.cardTypeBreakdown.bonus}</div>
              <div className="text-xs text-slate-400">Bonus</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-400">{stats.cardTypeBreakdown.jackpot}</div>
              <div className="text-xs text-slate-400">Jackpot</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Detailed History Table */}
      {showHistory && history.length > 0 && (
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
                  <th className="text-left p-4 text-xs font-medium text-slate-400">Bet</th>
                  <th className="text-left p-4 text-xs font-medium text-slate-400">Result</th>
                  <th className="text-left p-4 text-xs font-medium text-slate-400">Multiplier</th>
                  <th className="text-left p-4 text-xs font-medium text-slate-400">Type</th>
                  <th className="text-left p-4 text-xs font-medium text-slate-400">Volatility</th>
                  <th className="text-left p-4 text-xs font-medium text-slate-400">Payout</th>
                  <th className="text-left p-4 text-xs font-medium text-slate-400">Profit</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.slice(0, 20).map((round, index) => (
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
                        {formatTimestamp(round.timestamp)}
                      </div>
                      <div className="text-xs text-slate-400">
                        {formatDate(round.timestamp)}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-white">
                      {round.betAmount}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-lg ${getResultColor(round.result)}`}>
                          {getResultEmoji(round.result)}
                        </span>
                        <span className={`text-sm font-medium ${getResultColor(round.result)}`}>
                          {round.result.isWin ? 'WIN' : 'LOSS'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-white">
                      {round.result.multiplier}x
                    </td>
                    <td className="p-4 text-sm text-white">
                      {round.result.cardType}
                    </td>
                    <td className="p-4 text-sm text-white">
                      {round.result.volatility}
                    </td>
                    <td className="p-4 text-sm text-white">
                      {round.result.totalPayout.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span className={`text-sm font-medium ${getResultColor(round.result)}`}>
                        {round.result.totalPayout - round.betAmount >= 0 ? '+' : ''}
                        {(round.result.totalPayout - round.betAmount).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Session Summary */}
      {history.length > 0 && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Session Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Session Duration:</span>
              <span className="text-white font-medium">
                {history.length > 0 ? `${history.length} games` : 'No games'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Net Result:</span>
              <span className={`font-medium ${stats.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {stats.totalProfit >= 0 ? '+' : ''}{stats.totalProfit.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Return to Player:</span>
              <span className="text-white font-medium">
                {stats.totalBet > 0 ? ((stats.totalPayout / stats.totalBet) * 100).toFixed(1) : '0'}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Average Bet:</span>
              <span className="text-white font-medium">
                {stats.averageBet.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Jackpot Wins:</span>
              <span className="text-white font-medium">
                {stats.jackpotWins}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Compact history for mobile view
export function CompactScratchHistory({ history, currentResult }: ScratchHistoryProps) {
  const getRecentResults = () => {
    return history.slice(0, 5)
  }
  
  const getResultColor = (result: ScratchResult) => {
    if (!result.isWin) return 'text-red-400'
    if (result.cardType === 'jackpot') return 'text-yellow-400'
    return 'text-emerald-400'
  }
  
  const recentResults = getRecentResults()
  
  return (
    <div className="space-y-4">
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
        <h4 className="text-sm font-semibold text-white mb-3">Recent Games</h4>
        <div className="space-y-2">
          {recentResults.length > 0 ? (
            recentResults.map((round) => (
              <div key={round.id} className="flex items-center justify-between p-2 bg-[#1a2c38] rounded">
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${getResultColor(round.result)}`}>
                    {round.result.isWin ? 'ð' : 'â'}
                  </span>
                  <div>
                    <div className="text-xs text-white">
                      {round.result.multiplier}x
                    </div>
                    <div className="text-xs text-slate-400">
                      {round.result.cardType}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${getResultColor(round.result)}`}>
                    {round.result.isWin ? 'WIN' : 'LOSS'}
                  </div>
                  <div className="text-xs text-slate-400">
                    {round.result.totalPayout - round.betAmount >= 0 ? '+' : ''}
                    {(round.result.totalPayout - round.betAmount).toFixed(2)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-slate-400 text-sm">
              No games played yet
            </div>
          )}
        </div>
      </div>
      
      {/* Quick Stats */}
      {history.length > 0 && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
          <h4 className="text-sm font-semibold text-white mb-3">Quick Stats</h4>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-bold text-emerald-400">
                {history.filter(r => r.result.isWin).length}
              </div>
              <div className="text-xs text-slate-400">Wins</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-400">
                {history.filter(r => !r.result.isWin).length}
              </div>
              <div className="text-xs text-slate-400">Losses</div>
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-400">
                {history.filter(r => r.result.cardType === 'jackpot').length}
              </div>
              <div className="text-xs text-slate-400">Jackpot</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
