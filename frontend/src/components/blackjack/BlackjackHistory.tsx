'use client'

import { useState } from 'react'
import { MiniBlackjackCard } from './BlackjackCards'
import type { BlackjackRound, BlackjackResult } from '@/utils/blackjackEngine'
import { formatTimestamp, formatDate } from '@/utils/blackjackEngine'

interface BlackjackHistoryProps {
  history: BlackjackRound[]
  currentResult: BlackjackResult | null
}

export default function BlackjackHistory({ history, currentResult }: BlackjackHistoryProps) {
  const [showHistory, setShowHistory] = useState(false)
  const [filter, setFilter] = useState<'all' | 'wins' | 'losses' | 'blackjack'>('all')
  
  const getFilteredHistory = () => {
    switch (filter) {
      case 'wins':
        return history.filter(round => round.result.result === 'win')
      case 'losses':
        return history.filter(round => round.result.result === 'lose')
      case 'blackjack':
        return history.filter(round => round.result.gameData.playerBlackjack)
      default:
        return history
    }
  }
  
  const getStats = () => {
    if (history.length === 0) {
      return {
        totalGames: 0,
        wins: 0,
        losses: 0,
        pushes: 0,
        blackjacks: 0,
        winRate: 0,
        totalBet: 0,
        totalPayout: 0,
        totalProfit: 0,
        averageBet: 0,
        biggestWin: 0,
        biggestLoss: 0
      }
    }
    
    const wins = history.filter(round => round.result.result === 'win').length
    const losses = history.filter(round => round.result.result === 'lose').length
    const pushes = history.filter(round => round.result.result === 'push').length
    const blackjacks = history.filter(round => 
      round.result.gameData.playerBlackjack
    ).length
    
    const totalBet = history.reduce((sum, round) => sum + round.bet.amount, 0)
    const totalPayout = history.reduce((sum, round) => sum + round.result.payout, 0)
    const totalProfit = history.reduce((sum, round) => sum + round.result.profit, 0)
    const averageBet = totalBet / history.length
    const biggestWin = Math.max(...history.filter(round => round.result.profit > 0).map(round => round.result.profit), 0)
    const biggestLoss = Math.min(...history.filter(round => round.result.profit < 0).map(round => round.result.profit), 0)
    
    return {
      totalGames: history.length,
      wins,
      losses,
      pushes,
      blackjacks,
      winRate: (wins / history.length) * 100,
      totalBet,
      totalPayout,
      totalProfit,
      averageBet,
      biggestWin,
      biggestLoss
    }
  }
  
  const stats = getStats()
  const filteredHistory = getFilteredHistory()
  
  const getOutcomeColor = (result: string) => {
    switch (result) {
      case 'win': return 'text-emerald-400'
      case 'lose': return 'text-red-400'
      case 'push': return 'text-yellow-400'
      default: return 'text-slate-400'
    }
  }
  
  const getOutcomeEmoji = (result: string) => {
    switch (result) {
      case 'win': return 'ð'
      case 'lose': return 'ð'
      case 'push': return 'ð'
      default: return 'â'
    }
  }
  
  const getOutcomeText = (result: string) => {
    switch (result) {
      case 'win': return 'WIN'
      case 'lose': return 'LOSE'
      case 'push': return 'PUSH'
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
            <div className="text-2xl font-bold text-emerald-400">{stats.wins}</div>
            <div className="text-xs text-slate-400">Wins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{stats.losses}</div>
            <div className="text-xs text-slate-400">Losses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.winRate.toFixed(1)}%</div>
            <div className="text-xs text-slate-400">Win Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{stats.blackjacks}</div>
            <div className="text-xs text-slate-400">Blackjacks</div>
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
          {(['all', 'wins', 'losses', 'blackjack'] as const).map(filterType => (
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
              // Handle both BlackjackResult and BlackjackRound types
              const isCurrentResult = index === 0 && currentResult
              const round = isCurrentResult ? null : (result as any)
              const gameResult = isCurrentResult ? result as BlackjackResult : round.result
              
              return (
                <div
                  key={isCurrentResult ? 'current' : round.id}
                  className={`p-4 bg-[#1a2c38] rounded-lg border border-white/10 ${
                    isCurrentResult ? 'ring-2 ring-emerald-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`text-lg font-bold ${getOutcomeColor(gameResult.result)}`}>
                        {getOutcomeEmoji(gameResult.result)}
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${getOutcomeColor(gameResult.result)}`}>
                          {getOutcomeText(gameResult.result)}
                        </div>
                        <div className="text-xs text-slate-400">
                          {formatTimestamp(gameResult.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${getOutcomeColor(gameResult.result)}`}>
                        {gameResult.profit >= 0 ? '+' : ''}{gameResult.profit.toFixed(2)}
                      </div>
                      <div className="text-xs text-slate-400">
                        {gameResult.multiplier.toFixed(1)}x
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-slate-400 mb-1">Player Hand(s)</div>
                      <div className="flex flex-wrap gap-1">
                        {gameResult.playerHands.map((hand: any, handIndex: number) => (
                          <div key={handIndex} className="space-y-1">
                            <div className="text-white">
                              {hand.cards.map((card: any) => (
                                <MiniBlackjackCard
                                  key={card.id}
                                  card={card}
                                  size="small"
                                />
                              ))}
                            </div>
                            <div className="text-xs text-slate-400">
                              {hand.value.description}
                              {hand.doubledDown && ' (Doubled)'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 mb-1">Dealer Hand</div>
                      <div className="flex flex-wrap gap-1 mb-1">
                        {gameResult.dealerHand.cards.map((card: any) => (
                          <MiniBlackjackCard
                            key={card.id}
                            card={card}
                            size="small"
                          />
                        ))}
                      </div>
                      <div className="text-xs text-slate-400">
                        {gameResult.dealerHand.value.description}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4">
                      <span className="text-slate-400">Bet:</span>
                      <span className="text-white font-medium">
                        {gameResult.playerHands.reduce((sum: number, hand: any) => sum + hand.bet, 0)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-400">Payout:</span>
                      <span className="text-white font-medium">{gameResult.payout.toFixed(2)}</span>
                    </div>
                    {gameResult.gameData.playerBlackjack && (
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400">â</span>
                        <span className="text-yellow-400">Blackjack!</span>
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
              <div className="text-xl font-bold text-blue-400">{((stats.wins / stats.totalGames) * 100).toFixed(1)}%</div>
              <div className="text-xs text-slate-400">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-400">{((stats.blackjacks / stats.totalGames) * 100).toFixed(1)}%</div>
              <div className="text-xs text-slate-400">Blackjack Rate</div>
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
                  <th className="text-left p-4 text-xs font-medium text-slate-400">Hands</th>
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
                      {round.result.playerHands.length}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-lg ${getOutcomeColor(round.result.result)}`}>
                          {getOutcomeEmoji(round.result.result)}
                        </span>
                        <span className={`text-sm font-medium ${getOutcomeColor(round.result.result)}`}>
                          {getOutcomeText(round.result.result)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-white">
                      {round.result.payout.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span className={`text-sm font-medium ${getOutcomeColor(round.result.result)}`}>
                        {round.result.profit >= 0 ? '+' : ''}
                        {round.result.profit.toFixed(2)}
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
          </div>
        </div>
      )}
    </div>
  )
}

// Compact history for mobile view
export function CompactBlackjackHistory({ history, currentResult }: BlackjackHistoryProps) {
  const getRecentResults = () => {
    return history.slice(0, 5)
  }
  
  const getOutcomeColor = (result: string) => {
    switch (result) {
      case 'win': return 'text-emerald-400'
      case 'lose': return 'text-red-400'
      case 'push': return 'text-yellow-400'
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
                  <span className={`text-sm ${getOutcomeColor(round.result.result)}`}>
                    {round.result.result === 'win' ? 'ð' : 
                     round.result.result === 'lose' ? 'ð' : 'ð'}
                  </span>
                  <div>
                    <div className="text-xs text-white">
                      {round.result.playerHands.reduce((sum, hand) => sum + hand.bet, 0)} bet
                    </div>
                    <div className="text-xs text-slate-400">
                      {round.result.playerHands.length} hand(s)
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${getOutcomeColor(round.result.result)}`}>
                    {round.result.profit >= 0 ? '+' : ''}{round.result.profit.toFixed(2)}
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
                {history.filter(r => r.result.result === 'win').length}
              </div>
              <div className="text-xs text-slate-400">Wins</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-400">
                {history.filter(r => r.result.result === 'lose').length}
              </div>
              <div className="text-xs text-slate-400">Losses</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-400">
                {((history.filter(r => r.result.result === 'win').length / history.length) * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-slate-400">Win Rate</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
