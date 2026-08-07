'use client'

import { useState } from 'react'
import MiniAndarBaharCard from './AndarBaharCards'
import type { GameResult } from '@/utils/andarBaharEngine'
import { formatTimestamp, formatDate } from '@/utils/andarBaharEngine'

interface AndarBaharHistoryProps {
  history: any[]
  currentResult: GameResult | null
}

export default function AndarBaharHistory({ history, currentResult }: AndarBaharHistoryProps) {
  const [showHistory, setShowHistory] = useState(false)
  const [filter, setFilter] = useState<'all' | 'andar' | 'bahar' | 'early'>('all')
  
  const getFilteredHistory = () => {
    switch (filter) {
      case 'andar':
        return history.filter(round => round.result.winner === 'andar')
      case 'bahar':
        return history.filter(round => round.result.winner === 'bahar')
      case 'early':
        return history.filter(round => round.result.isEarlyWin)
      default:
        return history
    }
  }
  
  const getStats = () => {
    if (history.length === 0) {
      return {
        totalGames: 0,
        andarWins: 0,
        baharWins: 0,
        earlyWins: 0,
        andarWinRate: 0,
        baharWinRate: 0,
        earlyWinRate: 0,
        totalBet: 0,
        totalPayout: 0,
        totalProfit: 0,
        averageBet: 0,
        biggestWin: 0,
        biggestLoss: 0,
        averageCardsDealt: 0,
        superBaharWins: 0
      }
    }
    
    const andarWins = history.filter(round => round.result.winner === 'andar').length
    const baharWins = history.filter(round => round.result.winner === 'bahar').length
    const earlyWins = history.filter(round => round.result.isEarlyWin).length
    const superBaharWins = history.filter(round => 
      round.result.isEarlyWin && 
      round.bets.some((bet: any) => bet.betType === 'superBahar')
    ).length
    
    const totalBet = history.reduce((sum, round) => sum + round.bets.reduce((betSum: number, bet: any) => betSum + bet.amount, 0), 0)
    const totalPayout = history.reduce((sum, round) => sum + round.payouts.reduce((payoutSum: number, payout: any) => payoutSum + payout.payout, 0), 0)
    const totalProfit = history.reduce((sum, round) => sum + round.payouts.reduce((profitSum: number, payout: any) => profitSum + payout.profit, 0), 0)
    const averageBet = totalBet / history.length
    const biggestWin = Math.max(...history.map(round => round.payouts.reduce((max: number, payout: any) => Math.max(max, payout.profit), 0)))
    const biggestLoss = Math.min(...history.map(round => round.payouts.reduce((min: number, payout: any) => Math.min(min, payout.profit), 0)))
    
    const averageCardsDealt = history.reduce((sum, round) => sum + round.result.sequence.length, 0) / history.length
    
    return {
      totalGames: history.length,
      andarWins,
      baharWins,
      earlyWins,
      andarWinRate: (andarWins / history.length) * 100,
      baharWinRate: (baharWins / history.length) * 100,
      earlyWinRate: (earlyWins / history.length) * 100,
      totalBet,
      totalPayout,
      totalProfit,
      averageBet,
      biggestWin,
      biggestLoss,
      averageCardsDealt,
      superBaharWins
    }
  }
  
  const stats = getStats()
  const filteredHistory = getFilteredHistory()
  
  const getOutcomeColor = (result: string) => {
    switch (result) {
      case 'andar': return 'text-purple-400'
      case 'bahar': return 'text-orange-400'
      default: return 'text-slate-400'
    }
  }
  
  const getOutcomeEmoji = (result: string) => {
    switch (result) {
      case 'andar': return 'ð'
      case 'bahar': return 'ð'
      default: return 'â'
    }
  }
  
  const getOutcomeText = (result: string) => {
    switch (result) {
      case 'andar': return 'ANDAR'
      case 'bahar': return 'BAHAR'
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
            <div className="text-2xl font-bold text-purple-400">{stats.andarWins}</div>
            <div className="text-xs text-slate-400">Andar Wins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">{stats.baharWins}</div>
            <div className="text-xs text-slate-400">Bahar Wins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.earlyWins}</div>
            <div className="text-xs text-slate-400">Early Wins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">{stats.superBaharWins}</div>
            <div className="text-xs text-slate-400">Super Bahar</div>
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
              <div className="text-slate-400">Avg Cards</div>
              <div className="text-white font-medium">{stats.averageCardsDealt.toFixed(1)}</div>
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
          {(['all', 'andar', 'bahar', 'early'] as const).map(filterType => (
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
                        Position: #{gameResult.position + 1}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-slate-400 mb-1">Joker Card</div>
                      <div className="flex items-center gap-2 mb-1">
                        <MiniAndarBaharCard
                          card={gameResult.jokerCard}
                          side="andar"
                          isJoker={true}
                          isHidden={false}
                        />
                        <div className="text-white font-medium">
                          {gameResult.jokerCard.rank}
                        </div>
                      </div>
                      <div className="text-xs text-slate-400">
                        Value: {gameResult.jokerCard.value}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 mb-1">Cards Dealt</div>
                      <div className="text-white font-medium">
                        {gameResult.sequence.length}
                      </div>
                      <div className="text-xs text-slate-400">
                        Andar: {gameResult.sequence.filter((item: any) => item.side === 'andar').length} | 
                        Bahar: {gameResult.sequence.filter((item: any) => item.side === 'bahar').length}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4">
                      <span className="text-slate-400">Payout Type:</span>
                      <span className="text-white font-medium">
                        {gameResult.payoutType}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-400">Early Win:</span>
                      <span className={`font-medium ${gameResult.isEarlyWin ? 'text-yellow-400' : 'text-slate-400'}`}>
                        {gameResult.isEarlyWin ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                  
                  {gameResult.isEarlyWin && (
                    <div className="mt-2 text-xs text-yellow-400">
                      â Early win! Joker appeared on first Bahar card
                    </div>
                  )}
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
              <div className="text-xl font-bold text-purple-400">{stats.andarWinRate.toFixed(1)}%</div>
              <div className="text-xs text-slate-400">Andar Win Rate</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-orange-400">{stats.baharWinRate.toFixed(1)}%</div>
              <div className="text-xs text-slate-400">Bahar Win Rate</div>
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
                  <th className="text-left p-4 text-xs font-medium text-slate-400">Joker</th>
                  <th className="text-left p-4 text-xs font-medium text-slate-400">Winner</th>
                  <th className="text-left p-4 text-xs font-medium text-slate-400">Cards</th>
                  <th className="text-left p-4 text-xs font-medium text-slate-400">Position</th>
                  <th className="text-left p-4 text-xs font-medium text-slate-400">Early</th>
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
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <MiniAndarBaharCard
                          card={round.result.jokerCard}
                          side="andar"
                          isJoker={true}
                          isHidden={false}
                        />
                        <div>
                          <div className="text-sm text-white">
                            {round.result.jokerCard.rank}
                          </div>
                          <div className="text-xs text-slate-400">
                            ({round.result.jokerCard.value})
                          </div>
                        </div>
                      </div>
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
                      {round.result.sequence.length}
                    </td>
                    <td className="p-4 text-sm text-white">
                      #{round.result.position + 1}
                    </td>
                    <td className="p-4">
                      <span className={`text-sm font-medium ${
                        round.result.isEarlyWin ? 'text-yellow-400' : 'text-slate-400'
                      }`}>
                        {round.result.isEarlyWin ? 'Yes' : 'No'}
                      </span>
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
              <span className="text-slate-400">Average Cards Dealt:</span>
              <span className="text-white font-medium">
                {stats.averageCardsDealt.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Early Win Rate:</span>
              <span className="text-white font-medium">
                {stats.earlyWinRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Compact history for mobile view
export function CompactAndarBaharHistory({ history, currentResult }: AndarBaharHistoryProps) {
  const getRecentResults = () => {
    return history.slice(0, 5)
  }
  
  const getOutcomeColor = (result: string) => {
    switch (result) {
      case 'andar': return 'text-purple-400'
      case 'bahar': return 'text-orange-400'
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
                    {round.result.winner === 'andar' ? 'ð' : 
                     round.result.winner === 'bahar' ? 'ð' : 'â'}
                  </span>
                  <div>
                    <div className="text-xs text-white">
                      {round.result.jokerCard.rank}
                    </div>
                    <div className="text-xs text-slate-400">
                      Pos: #{round.result.position + 1}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${getOutcomeColor(round.result.winner)}`}>
                    {round.result.winner === 'andar' ? 'Andar' : 
                     round.result.winner === 'bahar' ? 'Bahar' : 'Unknown'}
                  </div>
                  <div className="text-xs text-slate-400">
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
              <div className="text-lg font-bold text-purple-400">
                {history.filter(r => r.result.winner === 'andar').length}
              </div>
              <div className="text-xs text-slate-400">Andar</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-400">
                {history.filter(r => r.result.winner === 'bahar').length}
              </div>
              <div className="text-xs text-slate-400">Bahar</div>
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-400">
                {history.filter(r => r.result.isEarlyWin).length}
              </div>
              <div className="text-xs text-slate-400">Early</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
