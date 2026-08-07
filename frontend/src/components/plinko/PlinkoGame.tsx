'use client'

import { usePlinkoGame } from '@/hooks/usePlinkoGame'
import PlinkoControls from './PlinkoControls'
import PlinkoBoard from './PlinkoBoard'
import PlinkoHistory from './PlinkoHistory'
import { Button } from '@/components/ui/button'
import { Trophy, Shield, BarChart, Settings } from 'lucide-react'

export default function PlinkoGame() {
  const {
    gameState,
    currentPath,
    finalSlot,
    currentMultiplier,
    payout,
    betAmount,
    rows,
    risk,
    history,
    setBetAmount,
    setRows,
    setRisk,
    dropBall,
    resetGame,
    maxMultiplier,
    potentialMaxWin
  } = usePlinkoGame()
  
  return (
    <div className="space-y-6">
      {/* Game Title */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">Plinko</h1>
        <p className="text-slate-400">Drop the ball and watch it bounce to win!</p>
      </div>

      {/* Main Game Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Controls */}
        <div className="lg:col-span-1">
          <PlinkoControls
            gameState={gameState}
            betAmount={betAmount}
            rows={rows}
            risk={risk}
            maxMultiplier={maxMultiplier}
            potentialMaxWin={potentialMaxWin}
            onBetAmountChange={setBetAmount}
            onRowsChange={setRows}
            onRiskChange={setRisk}
            onDropBall={dropBall}
          />
        </div>

        {/* Right Panel - Board */}
        <div className="lg:col-span-2">
          <PlinkoBoard
            rows={rows}
            risk={risk}
            path={currentPath}
            finalSlot={finalSlot}
            gameState={gameState}
          />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden space-y-6">
        {/* Mobile Board First */}
        <div className="order-2">
          <PlinkoBoard
            rows={rows}
            risk={risk}
            path={currentPath}
            finalSlot={finalSlot}
            gameState={gameState}
          />
        </div>
        
        {/* Mobile Controls */}
        <div className="order-1">
          <PlinkoControls
            gameState={gameState}
            betAmount={betAmount}
            rows={rows}
            risk={risk}
            maxMultiplier={maxMultiplier}
            potentialMaxWin={potentialMaxWin}
            onBetAmountChange={setBetAmount}
            onRowsChange={setRows}
            onRiskChange={setRisk}
            onDropBall={dropBall}
          />
        </div>
      </div>

      {/* Current Game Result */}
      {gameState === 'completed' && currentMultiplier && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-2">Game Result</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#1a2c38] rounded-lg p-4">
                <div className="text-sm text-slate-400 mb-1">Multiplier</div>
                <div className="text-2xl font-bold text-emerald-400">
                  {currentMultiplier.toFixed(1)}x
                </div>
              </div>
              <div className="bg-[#1a2c38] rounded-lg p-4">
                <div className="text-sm text-slate-400 mb-1">Slot</div>
                <div className="text-2xl font-bold text-white">
                  {finalSlot}
                </div>
              </div>
              <div className="bg-[#1a2c38] rounded-lg p-4">
                <div className="text-sm text-slate-400 mb-1">Payout</div>
                <div className="text-2xl font-bold text-emerald-400">
                  {payout.toFixed(2)}
                </div>
              </div>
            </div>
            {currentPath && (
              <div className="mt-4 text-sm text-slate-400">
                Path: {currentPath.map(p => p === 1 ? 'R' : 'L').join(' ')}
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
        <PlinkoHistory history={history} currentMultiplier={currentMultiplier} />
      </div>
    </div>
  )
}
