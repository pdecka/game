'use client'

import { 
  formatTime, 
  formatDate, 
  formatAmount,
  getWinRate,
  getTotalProfit,
  getAverageBet,
  getMostFrequentHand,
  type PokerRound,
  type PokerResult
} from '@/utils/pokerEngine'
import { 
  formatHandEvaluation,
  getHandStrengthColor,
  type HandRank
} from '@/utils/pokerHands'

interface PokerHistoryProps {
  history: PokerRound[]
  currentResult: PokerResult | null
}

export default function PokerHistory({ history, currentResult }: PokerHistoryProps) {
  const stats = {
    totalGames: history.length,
    wins: history.filter(round => round.result.winner === 'player').length,
    losses: history.filter(round => round.result.winner === 'dealer').length,
    ties: history.filter(round => round.result.winner === 'tie').length,
    totalBet: history.reduce((sum, round) => sum + round.bet.amount, 0),
    totalPayout: history.reduce((sum, round) => sum + round.result.payout, 0),
    totalProfit: getTotalProfit(history),
    averageBet: getAverageBet(history),
    winRate: getWinRate(history),
    mostFrequentHand: getMostFrequentHand(history)
  }
  
  const getOutcomeColor = (winner: 'player' | 'dealer' | 'tie') => {
    switch (winner) {
      case 'player': return 'text-emerald-400'
      case 'dealer': return 'text-red-400'
      case 'tie': return 'text-yellow-400'
      default: return 'text-white'
    }
  }
  
  const getOutcomeEmoji = (winner: 'player' | 'dealer' | 'tie') => {
    switch (winner) {
      case 'player': return 'ð'
      case 'dealer': return 'ð'
      case 'tie': return 'ð'
      default: return 'â'
    }
  }
  
  const getOutcomeText = (winner: 'player' | 'dealer' | 'tie') => {
    switch (winner) {
      case 'player': return 'WIN'
      case 'dealer': return 'LOSS'
      case 'tie': return 'TIE'
      default: return 'UNKNOWN'
    }
  }
  
  const getHandRankColor = (rank: HandRank) => {
    switch (rank) {
      case 'royal-flush': return 'text-purple-400'
      case 'straight-flush': return 'text-purple-400'
      case 'four-of-a-kind': return 'text-red-400'
      case 'full-house': return 'text-orange-400'
      case 'flush': return 'text-emerald-400'
      case 'straight': return 'text-blue-400'
      case 'three-of-a-kind': return 'text-yellow-400'
      case 'two-pair': return 'text-yellow-400'
      case 'pair': return 'text-slate-400'
      case 'high-card': return 'text-slate-400'
      default: return 'text-white'
    }
  }
  
  // Get recent hands for display
  const recentHands = history.slice(0, 12).map(round => round.result.playerHand.rank)
  
  // Add current result to recent hands if available
  const displayHands = currentResult 
    ? [currentResult.playerHand.rank, ...recentHands] 
    : recentHands
  
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
            <div className="text-2xl font-bold text-yellow-400">
              {stats.ties}
            </div>
            <div className="text-xs text-slate-400">Ties</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {stats.winRate.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-400">Win Rate</div>
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
              <div className="text-slate-400">Net Profit</div>
              <div className="text-white font-medium">{formatAmount(stats.totalProfit)}</div>
            </div>
            <div>
              <div className="text-slate-400">Avg Bet</div>
              <div className="text-white font-medium">{formatAmount(stats.averageBet)}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Hands */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Recent Hands</h3>
        <div className="grid grid-cols-6 gap-2">
          {displayHands.length > 0 ? (
            displayHands.map((handRank, index) => {
              const isCurrent = currentResult && currentResult.playerHand.rank === handRank
              const correspondingRound = history.find(r => r.result.playerHand.rank === handRank)
              const isWin = correspondingRound?.result.winner === 'player'
              
              return (
                <div
                  key={`${handRank}-${index}`}
                  className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                    getHandRankColor(handRank).replace('text-', 'bg-')
                  } ${isCurrent ? 'ring-2 ring-emerald-400 scale-110' : ''}`}
                  title={`${handRank}${isWin !== undefined ? (isWin ? ' (Win)' : ' (Loss)') : ''}`}
                >
                  <span className="text-white text-xs">
                    {handRank.split('-')[0].charAt(0).toUpperCase()}
                  </span>
                </div>
              )
            })
          ) : (
            <div className="col-span-6 text-slate-400 text-sm">No hands yet</div>
          )}
        </div>
      </div>
      
      {/* Hand Distribution */}
      {stats.totalGames > 0 && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Hand Distribution</h3>
          <div className="space-y-3">
            {[
              'high-card', 'pair', 'two-pair', 'three-of-a-kind', 'straight', 'flush',
              'full-house', 'four-of-a-kind', 'straight-flush', 'royal-flush'
            ].map((handRank) => {
              const count = history.filter(round => round.result.playerHand.rank === handRank).length
              const percentage = stats.totalGames > 0 ? (count / stats.totalGames) * 100 : 0
              
              return (
                <div key={handRank} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${getHandRankColor(handRank as HandRank).replace('text-', 'bg-')}`}></div>
                    <span className="text-sm text-white capitalize">
                      {handRank.replace('-', ' ')}
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
      
      {/* Performance Metrics */}
      {stats.totalGames > 0 && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#1a2c38] rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Most Frequent Hand</div>
              <div className="text-xl font-bold text-white capitalize">
                {stats.mostFrequentHand ? stats.mostFrequentHand.replace('-', ' ') : 'None'}
              </div>
            </div>
            <div className="p-4 bg-[#1a2c38] rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Profit per Game</div>
              <div className="text-xl font-bold text-white">
                {formatAmount(stats.totalProfit / stats.totalGames)}
              </div>
            </div>
            <div className="p-4 bg-[#1a2c38] rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Win Rate</div>
              <div className="text-xl font-bold text-white">
                {stats.winRate.toFixed(1)}%
              </div>
            </div>
            <div className="p-4 bg-[#1a2c38] rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Total Games</div>
              <div className="text-xl font-bold text-white">
                {stats.totalGames}
              </div>
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
                <th className="text-left p-4 text-xs font-medium text-slate-400">Player Hand</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Dealer Hand</th>
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
                    <div className={`text-sm font-medium capitalize ${getHandRankColor(round.result.playerHand.rank)}`}>
                      {round.result.playerHand.rank.replace('-', ' ')}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`text-sm font-medium capitalize ${getHandRankColor(round.result.dealerHand.rank)}`}>
                      {round.result.dealerHand.rank.replace('-', ' ')}
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
                    {formatAmount(round.result.payout)}
                  </td>
                  <td className="p-4">
                    <span className={`text-sm font-medium ${getOutcomeColor(round.result.winner)}`}>
                      {round.result.profit >= 0 ? '+' : ''}
                      {formatAmount(round.result.profit)}
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
      
      {/* Hand Strength Analysis */}
      {stats.totalGames > 0 && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Hand Strength Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#1a2c38] rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Strong Hands</div>
              <div className="text-xl font-bold text-white">
                {history.filter(round => ['full-house', 'four-of-a-kind', 'straight-flush', 'royal-flush'].includes(round.result.playerHand.rank)).length}
              </div>
            </div>
            <div className="p-4 bg-[#1a2c38] rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Weak Hands</div>
              <div className="text-xl font-bold text-white">
                {history.filter(round => ['high-card', 'pair'].includes(round.result.playerHand.rank)).length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
