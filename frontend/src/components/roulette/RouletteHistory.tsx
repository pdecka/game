'use client'

import { getNumberColor, type RouletteResult, type RouletteRound, type RouletteNumber } from '@/utils/rouletteConfig'

interface RouletteHistoryProps {
  history: RouletteRound[]
  currentResult: RouletteResult | null
}

export default function RouletteHistory({ history, currentResult }: RouletteHistoryProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  }
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric' 
    })
  }
  
  const getNumberColorClass = (number: RouletteNumber) => {
    const color = getNumberColor(number)
    switch (color) {
      case 'red': return 'bg-red-600 text-white'
      case 'black': return 'bg-gray-900 text-white'
      case 'green': return 'bg-green-600 text-white'
      default: return 'bg-gray-600 text-white'
    }
  }
  
  // Get recent results for display
  const recentResults = history.slice(0, 10).map(round => round.result)
  
  // Add current result if available
  const displayResults = currentResult 
    ? [currentResult, ...recentResults]
    : recentResults
  
  return (
    <div className="space-y-6">
      {/* Recent Results */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Recent Results</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {displayResults.length > 0 ? (
            displayResults.map((result, index) => (
              <div
                key={`${result.number}-${index}`}
                className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                  currentResult && currentResult.number === result.number
                    ? 'ring-2 ring-yellow-400 scale-110'
                    : ''
                } ${getNumberColorClass(result.number)}`}
              >
                {result.number}
              </div>
            ))
          ) : (
            <div className="text-slate-400 text-sm">No games played yet</div>
          )}
        </div>
      </div>
      
      {/* Statistics */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">
              {history.filter(r => r.result.color === 'red').length}
            </div>
            <div className="text-xs text-slate-400">Red</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-400">
              {history.filter(r => r.result.color === 'black').length}
            </div>
            <div className="text-xs text-slate-400">Black</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {history.filter(r => r.result.color === 'green').length}
            </div>
            <div className="text-xs text-slate-400">Green</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">
              {history.filter(r => r.isWin).length}
            </div>
            <div className="text-xs text-slate-400">Wins</div>
          </div>
        </div>
      </div>
      
      {/* Global History Table */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-sm font-semibold text-white">Game History</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-xs font-medium text-slate-400">Round</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Time</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Result</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Bets</th>
                <th className="text-left p-4 text-xs font-medium text-slate-400">Bet Amount</th>
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
                  <td className="p-4 text-sm text-white">
                    #{round.id.split('-')[1]}
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
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getNumberColorClass(round.result.number)}`}>
                        {round.result.number}
                      </div>
                      <span className="text-sm text-white capitalize">{round.result.color}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-white">
                    {round.bets.length}
                  </td>
                  <td className="p-4 text-sm text-white">
                    {round.totalBetAmount.toFixed(2)}
                  </td>
                  <td className="p-4 text-sm text-white">
                    {round.totalPayout.toFixed(2)}
                  </td>
                  <td className="p-4">
                    <span className={`text-sm font-medium ${
                      round.profit > 0 ? 'text-emerald-400' : 
                      round.profit < 0 ? 'text-red-400' : 
                      'text-slate-400'
                    }`}>
                      {round.profit > 0 ? '+' : ''}{round.profit.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Hot & Cold Numbers */}
      {history.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Hot Numbers</h3>
            <div className="flex gap-2 flex-wrap">
              {getHotNumbers().map(number => (
                <div
                  key={number}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getNumberColorClass(number)}`}
                >
                  {number}
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Cold Numbers</h3>
            <div className="flex gap-2 flex-wrap">
              {getColdNumbers().map(number => (
                <div
                  key={number}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold opacity-60 ${getNumberColorClass(number)}`}
                >
                  {number}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
  
  function getHotNumbers() {
    const numberCounts = history.reduce((counts, round) => {
      counts[round.result.number] = (counts[round.result.number] || 0) + 1
      return counts
    }, {} as Record<string, number>)
    
    return Object.entries(numberCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([number]) => number as any)
  }
  
  function getColdNumbers() {
    const allNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, '00'] as RouletteNumber[]
    
    const numberCounts = history.reduce((counts, round) => {
      counts[round.result.number] = (counts[round.result.number] || 0) + 1
      return counts
    }, {} as Record<string, number>)
    
    return allNumbers
      .sort((a, b) => (numberCounts[a] || 0) - (numberCounts[b] || 0))
      .slice(0, 5)
  }
}
