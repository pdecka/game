'use client'

import { useSlotsGame } from '@/hooks/useSlotsGame'
import SlotsControls from './SlotsControls'
import SlotsGrid from './SlotsGrid'
import SlotsHistory from './SlotsHistory'
import { Button } from '@/components/ui/button'
import { Trophy, Shield, BarChart, Settings } from 'lucide-react'

export default function SlotsGame() {
  const {
    gameState,
    currentGrid,
    result,
    spinCount,
    betAmount,
    history,
    isAnimating,
    winAnimationType,
    setBetAmount,
    spin,
    resetGame,
    lastWin,
    totalPayout,
    isWin
  } = useSlotsGame()
  
  return (
    <div className="space-y-6">
      {/* Game Title */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">Slots</h1>
        <p className="text-slate-400">5x5 Grid with Multiple Win Ways!</p>
      </div>

      {/* Main Game Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Controls */}
        <div className="lg:col-span-1">
          <SlotsControls
            gameState={gameState}
            betAmount={betAmount}
            lastWin={lastWin}
            totalPayout={totalPayout}
            spinCount={spinCount}
            onBetAmountChange={setBetAmount}
            onSpin={spin}
          />
        </div>

        {/* Right Panel - Grid */}
        <div className="lg:col-span-2">
          <SlotsGrid
            grid={currentGrid}
            isSpinning={gameState === 'spinning'}
            winLines={result?.winLines || []}
            clusterWins={result?.clusterWins || []}
            winAnimationType={winAnimationType}
          />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden space-y-6">
        {/* Mobile Grid First */}
        <div className="order-2">
          <SlotsGrid
            grid={currentGrid}
            isSpinning={gameState === 'spinning'}
            winLines={result?.winLines || []}
            clusterWins={result?.clusterWins || []}
            winAnimationType={winAnimationType}
          />
        </div>
        
        {/* Mobile Controls */}
        <div className="order-1">
          <SlotsControls
            gameState={gameState}
            betAmount={betAmount}
            lastWin={lastWin}
            totalPayout={totalPayout}
            spinCount={spinCount}
            onBetAmountChange={setBetAmount}
            onSpin={spin}
          />
        </div>
      </div>

      {/* Current Game Result */}
      {gameState === 'completed' && result && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-4">
              {result.isJackpot ? 'ð JACKPOT! ð' : result.isBigWin ? 'â¨ BIG WIN! â¨' : isWin ? 'â WIN! â' : 'No Win'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#1a2c38] rounded-lg p-4">
                <div className="text-sm text-slate-400 mb-1">Multiplier</div>
                <div className={`text-2xl font-bold ${
                  result.totalMultiplier >= 100 ? 'text-red-500' :
                  result.totalMultiplier >= 50 ? 'text-purple-500' :
                  result.totalMultiplier >= 10 ? 'text-yellow-500' :
                  result.totalMultiplier >= 5 ? 'text-blue-500' :
                  result.totalMultiplier >= 1 ? 'text-emerald-500' :
                  'text-slate-400'
                }`}>
                  {result.totalMultiplier.toFixed(1)}x
                </div>
              </div>
              <div className="bg-[#1a2c38] rounded-lg p-4">
                <div className="text-sm text-slate-400 mb-1">Payout</div>
                <div className="text-2xl font-bold text-emerald-400">
                  {result.payout.toFixed(2)}
                </div>
              </div>
              <div className="bg-[#1a2c38] rounded-lg p-4">
                <div className="text-sm text-slate-400 mb-1">Win Lines</div>
                <div className="text-2xl font-bold text-white">
                  {result.winLines.length}
                </div>
              </div>
              <div className="bg-[#1a2c38] rounded-lg p-4">
                <div className="text-sm text-slate-400 mb-1">Clusters</div>
                <div className="text-2xl font-bold text-white">
                  {result.clusterWins.length}
                </div>
              </div>
            </div>
            
            {/* Detailed Win Information */}
            {(result.winLines.length > 0 || result.clusterWins.length > 0) && (
              <div className="mt-6 space-y-4">
                {result.winLines.length > 0 && (
                  <div className="bg-[#1a2c38] rounded-lg p-4">
                    <h4 className="text-sm font-medium text-white mb-2">Payline Wins</h4>
                    <div className="space-y-1">
                      {result.winLines.map((line, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">
                            Line {line.lineId} â¢ {line.symbol} ×{line.count}
                          </span>
                          <span className="text-emerald-400 font-medium">
                            {line.multiplier}x
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {result.clusterWins.length > 0 && (
                  <div className="bg-[#1a2c38] rounded-lg p-4">
                    <h4 className="text-sm font-medium text-white mb-2">Cluster Wins</h4>
                    <div className="space-y-1">
                      {result.clusterWins.map((cluster, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">
                            {cluster.symbol} Cluster ×{cluster.count}
                          </span>
                          <span className="text-emerald-400 font-medium">
                            {cluster.multiplier}x
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Post Game Section */}
      <div className="space-y-8">
        {/* Action Buttons */}
        <div className="p-6 bg-[#0f212e] rounded-lg border border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white min-w-[120px]"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Leaderboard
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white min-w-[120px]"
            >
              <BarChart className="h-4 w-4 mr-2" />
              Statistics
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white min-w-[120px]"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white min-w-[120px]"
            >
              <Shield className="h-4 w-4 mr-2" />
              Fairness
            </Button>
          </div>
        </div>

        {/* History */}
        <SlotsHistory history={history} currentMultiplier={result?.totalMultiplier} />
      </div>
    </div>
  )
}
