'use client'

import { useState } from 'react'
import MiniBaccaratCard from './BaccaratCards'
import type { GameResult } from '@/utils/baccaratEngine'
import { formatTimestamp, formatDate } from '@/utils/baccaratEngine'

interface BaccaratHistoryProps {
  history: any[]
  currentResult: GameResult | null
}

export default function BaccaratHistory({ history, currentResult }: BaccaratHistoryProps) {
  const [showHistory, setShowHistory] = useState(false)
  const [filter, setFilter] = useState<'all' | 'player' | 'banker' | 'tie'>('all')
  
  const getFilteredHistory = () => {
    switch (filter) {
      case 'player':
        return history.filter(round => round.result.winner === 'player')
      case 'banker':
        return history.filter(round => round.result.winner === 'banker')
      case 'tie':
        return history.filter(round => round.result.winner === 'tie')
      default:
        return history
    }
  }
  
  const getStats = () => {
    if (history.length === 0) {
      return {
        totalGames: 0,
        playerWins: 0,
        bankerWins: 0,
        ties: 0,
        playerWinRate: 0,
        bankerWinRate: 0,
        tieRate: 0,
        totalBet: 0,
        totalPayout: 0,
        totalProfit: 0,
        averageBet: 0,
        biggestWin: 0,
        biggestLoss: 0,
        naturalsCount: 0,
        superSixCount: 0
      }
    }
    
    const playerWins = history.filter(round => round.result.winner === 'player').length
    const bankerWins = history.filter(round => round.result.winner === 'banker').length
    const ties = history.filter(round => round.result.winner === 'tie').length
    
    const totalBet = history.reduce((sum, round) => sum + round.bet.amount, 0)
    const totalPayout = history.reduce((sum, round) => sum + round.payouts.reduce((payoutSum: number, payout: any) => payoutSum + payout.payout, 0), 0)
    const totalProfit = history.reduce((sum, round) => sum + round.payouts.reduce((profitSum: number, payout: any) => profitSum + payout.profit, 0), 0)
    const averageBet = totalBet / history.length
    const biggestWin = Math.max(...history.map(round => round.payouts.reduce((max: number, payout: any) => Math.max(max, payout.profit), 0)))
    const biggestLoss = Math.min(...history.map(round => round.payouts.reduce((min: number, payout: any) => Math.min(min, payout.profit), 0)))
    
    const naturalsCount = history.filter(round => round.result.playerNatural || round.result.bankerNatural).length
    const superSixCount = history.filter(round => round.result.winner === 'banker' && round.result.bankerTotal === 6).length
    
    return {
      totalGames: history.length,
      playerWins,
      bankerWins,
      ties,
      playerWinRate: (playerWins / history.length) * 100,
      bankerWinRate: (bankerWins / history.length) * 100,
      tieRate: (ties / history.length) * 100,
      totalBet,
      totalPayout,
      totalProfit,
      averageBet,
      biggestWin,
      biggestLoss,
      naturalsCount,
      superSixCount
    }
  }
  
  const stats = getStats()
  const filteredHistory = getFilteredHistory()
  
  const getOutcomeColor = (result: string) => {
    switch (result) {
      case 'player': return 'text-blue-400'
      case 'banker': return 'text-red-400'
      case 'tie': return 'text-green-400'
      default: return 'text-slate-400'
    }
  }
  
  const getOutcomeEmoji = (result: string) => {
    switch (result) {
      case 'player': return 'ð'
      case 'banker': return 'ð'
      case 'tie': return 'ð'
      default: return 'â'
    }
  }
  
  const getOutcomeText = (result: string) => {
    switch (result) {
      case 'player': return 'PLAYER'
      case 'banker': return 'BANKER'
      case 'tie': return 'TIE'
      default: return 'UNKNOWN'
    }
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
            <div className="text-2xl font-bold text-blue-400">{stats.playerWins}</div>
            <div className="text-xs text-slate-400">Player Wins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{stats.bankerWins}</div>
            <div className="text-xs text-slate-400">Banker Wins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{stats.ties}</div>
            <div className="text-xs text-slate-400">Ties</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{stats.naturalsCount}</div>
            <div className="text-xs text-slate-400">Naturals</div>
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
          {(['all', 'player', 'banker', 'tie'] as const).map(filterType => (
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
              // Handle both GameResult and round types
              const isCurrentResult = index === 0 && currentResult
              const round = isCurrentResult ? null : result
              const gameResult = isCurrentResult ? result as GameResult : round.result
              
              return (
                <div
                  key={isCurrentResult ? 'current' : round.id}
                  className={`p-4 bg-[#1a2c38] rounded-lg border border-white/10 ${
                    isCurrentResult ? 'ring-2 ring-emerald-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`text-lg font-bold ${getOutcomeColor(gameResult.winner)}`}>
                        {getOutcomeEmoji(gameResult.winner)}
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${getOutcomeColor(gameResult.winner)}`}>
                          {getOutcomeText(gameResult.winner)}
                        </div>
                        <div className="text-xs text-slate-400">
                          {formatTimestamp(gameResult.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${getOutcomeColor(gameResult.winner)}`}>
                        {getOutcomeText(gameResult.winner)}
                      </div>
                      <div className="text-xs text-slate-400">
                        {gameResult.playerTotal} vs {gameResult.bankerTotal}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-slate-400 mb-1">Player Hand</div>
                      <div className="flex flex-wrap gap-1 mb-1">
                        {gameResult.playerHand?.cards.map((card: any) => (
                          <MiniBaccaratCard
                            key={card.id}
                            card={card}
                            isHidden={false}
                            size="small"
                            handType="player"
                          />
                        ))}
                      </div>
                      <div className="text-xs text-slate-400">
                        {gameResult.playerTotal}
                        {gameResult.playerNatural && ' (Natural)'}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 mb-1">Banker Hand</div>
                      <div className="flex flex-wrap gap-1 mb-1">
                        {gameResult.bankerHand?.cards.map((card: any) => (
                          <MiniBaccaratCard
                            key={card.id}
                            card={card}
                            isHidden={false}
                            size="small"
                            handType="banker"
                          />
                        ))}
                      </div>
                      <div className="text-xs text-slate-400">
                        {gameResult.bankerTotal}
                        {gameResult.bankerNatural && ' (Natural)'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4">
                      <span className="text-slate-400">Bet:</span>
                      <span className="text-white font-medium">
                        {isCurrentResult ? 'Current' : round.bet.amount}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-400">Payout:</span>
                      <span className="text-white font-medium">
                        {isCurrentResult ? 'Pending' : round.payouts.reduce((sum: number, p: any) => sum + p.payout, 0).toFixed(2)}
                      </span>
                    </div>
                    {(gameResult.playerNatural || gameResult.bankerNatural) && (
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400">â</span>
                        <span className="text-yellow-400">Natural!</span>
                      </div>
                    )}
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
      
      {/* Performance Metrics */}
      {history.length > 0 && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-orange-400">{stats.biggestWin.toFixed(2)}</div>
              <div className="text-xs text-slate-400">Biggest Win</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-red-400">{Math.abs(stats.biggestLoss).toFixed(2)}</div>
              <div className="text-xs text-slate-400">Biggest Loss</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-400">{stats.playerWinRate.toFixed(1)}%</div>
              <div className="text-xs text-slate-400">Player Win Rate</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-red-400">{stats.bankerWinRate.toFixed(1)}%</div>
              <div className="text-xs text-slate-400">Banker Win Rate</div>
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
                  <th className="text-left p-4 text-xs font-medium text-slate-400">Player</th>
                  <th className="text-left p-4 text-xs font-medium text-slate-400">Banker</th>
                  <th className="text-left p-4 text-xs font-medium text-slate-400">Result</th>
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
                      {round.bet.amount.toFixed(2)}
                    </td>
                    <td className="p-4 text-sm text-white">
                      {round.result.playerTotal}
                      {round.result.playerNatural && '*'}
                    </td>
                    <td className="p-4 text-sm text-white">
                      {round.result.bankerTotal}
                      {round.result.bankerNatural && '*'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-lg ${getOutcomeColor(round.result.winner)}`}>
                          {getOutcomeEmoji(round.result.winner)}
                        </span>
                        <span className={`text-sm font-medium ${getOutcomeColor(round.result.winner)}`}>
                          {getOutcomeText(round.result.winner)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-white">
                      {round.payouts.reduce((sum: number, p: any) => sum + p.payout, 0).toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span className={`text-sm font-medium ${getOutcomeColor(round.result.winner)}`}>
                        {round.payouts.reduce((sum: number, p: any) => sum + p.profit, 0) >= 0 ? '+' : ''}
                        {round.payouts.reduce((sum: number, p: any) => sum + p.profit, 0).toFixed(2)}
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
              <span className="text-slate-400">Natural Rate:</span>
              <span className="text-white font-medium">
                {history.length > 0 ? ((stats.naturalsCount / history.length) * 100).toFixed(1) : '0'}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Compact history for mobile view
export function CompactBaccaratHistory({ history, currentResult }: BaccaratHistoryProps) {
  const getRecentResults = () => {
    return history.slice(0, 5)
  }
  
  const getOutcomeColor = (result: string) => {
    switch (result) {
      case 'player': return 'text-blue-400'
      case 'banker': return 'text-red-400'
      case 'tie': return 'text-green-400'
      default: return 'text-slate-400'
    }
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
                  <span className={`text-sm ${getOutcomeColor(round.result.winner)}`}>
                    {round.result.winner === 'player' ? 'ð' : 
                     round.result.winner === 'banker' ? 'ð' : 'ð'}
                  </span>
                  <div>
                    <div className="text-xs text-white">
                      {round.result.playerTotal} vs {round.result.bankerTotal}
                    </div>
                    <div className="text-xs text-slate-400">
                      Bet: {round.bet.amount}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${getOutcomeColor(round.result.winner)}`}>
                    {round.payouts.reduce((sum: number, p: any) => sum + p.profit, 0) >= 0 ? '+' : ''}
                    {round.payouts.reduce((sum: number, p: any) => sum + p.profit, 0).toFixed(2)}
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
              <div className="text-lg font-bold text-blue-400">
                {history.filter(r => r.result.winner === 'player').length}
              </div>
              <div className="text-xs text-slate-400">Player</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-400">
                {history.filter(r => r.result.winner === 'banker').length}
              </div>
              <div className="text-xs text-slate-400">Banker</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-400">
                {history.filter(r => r.result.winner === 'tie').length}
              </div>
              <div className="text-xs text-slate-400">Ties</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
