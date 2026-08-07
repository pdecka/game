'use client'

import { useCrashGame } from '@/hooks/useCrashGame'
import CrashControls from './CrashControls'
import CrashGraph from './CrashGraph'
import CrashTopBar from './CrashTopBar'
import CrashHistory from './CrashHistory'
import { Button } from '@/components/ui/button'
import { Trophy, Shield, BarChart, Settings } from 'lucide-react'

export default function CrashGame() {
  const {
    gameState,
    currentMultiplier,
    crashPoint,
    timeElapsed,
    countdown,
    betAmount,
    autoCashout,
    hasActiveBet,
    cashedOutAt,
    activePlayers,
    playerCount,
    history,
    curve,
    setBetAmount,
    setAutoCashout,
    placeBet,
    cashout,
    resetGame
  } = useCrashGame()
  
  return (
    <div className="space-y-6">
      {/* Game Title */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">Crash</h1>
        <p className="text-slate-400">Cash out before the plane crashes!</p>
      </div>

      {/* Top Multiplier Bar */}
      <CrashTopBar history={history} />

      {/* Main Game Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Controls */}
        <div className="lg:col-span-1">
          <CrashControls
            gameState={gameState}
            betAmount={betAmount}
            autoCashout={autoCashout}
            hasActiveBet={hasActiveBet}
            cashedOutAt={cashedOutAt}
            playerCount={playerCount}
            onBetAmountChange={setBetAmount}
            onAutoCashoutChange={setAutoCashout}
            onPlaceBet={placeBet}
            onCashout={cashout}
          />
        </div>

        {/* Right Panel - Graph */}
        <div className="lg:col-span-2">
          <CrashGraph
            curve={curve}
            currentMultiplier={currentMultiplier}
            gameState={gameState}
            crashPoint={crashPoint}
          />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden space-y-6">
        {/* Mobile Graph First */}
        <div className="order-2">
          <CrashGraph
            curve={curve}
            currentMultiplier={currentMultiplier}
            gameState={gameState}
            crashPoint={crashPoint}
          />
        </div>
        
        {/* Mobile Controls */}
        <div className="order-1">
          <CrashControls
            gameState={gameState}
            betAmount={betAmount}
            autoCashout={autoCashout}
            hasActiveBet={hasActiveBet}
            cashedOutAt={cashedOutAt}
            playerCount={playerCount}
            onBetAmountChange={setBetAmount}
            onAutoCashoutChange={setAutoCashout}
            onPlaceBet={placeBet}
            onCashout={cashout}
          />
        </div>
      </div>

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

        {/* History Table */}
        <CrashHistory history={history} />
      </div>
    </div>
  )
}
