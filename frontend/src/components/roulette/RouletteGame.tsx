'use client'

import { useRouletteGame } from '@/hooks/useRouletteGame'
import RouletteWheel from './RouletteWheel'
import RouletteTable from './RouletteTable'
import RouletteControls from './RouletteControls'
import RouletteHistory from './RouletteHistory'
import { Button } from '@/components/ui/button'
import { Trophy, Shield, BarChart, Settings } from 'lucide-react'

export default function RouletteGame() {
  const {
    gamePhase,
    currentResult,
    currentRound,
    countdown,
    roundNumber,
    bets,
    selectedBetType,
    selectedNumbers,
    betAmount,
    history,
    isSpinning,
    wheelRotation,
    ballRotation,
    placeBet,
    removeBet,
    clearAllBets,
    spin,
    reset,
    setBetAmount,
    setSelectedBetType,
    setSelectedNumbers,
    totalBetAmount,
    totalPayout,
    isWin,
    canBet,
    canSpin
  } = useRouletteGame()
  
  return (
    <div className="space-y-6">
      {/* Game Title */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">Roulette</h1>
        <p className="text-slate-400">Classic Casino Wheel Game</p>
      </div>

      {/* Main Game Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Controls */}
        <div className="lg:col-span-1">
          <RouletteControls
            gamePhase={gamePhase}
            countdown={countdown}
            roundNumber={roundNumber}
            bets={bets}
            betAmount={betAmount}
            totalBetAmount={totalBetAmount}
            totalPayout={totalPayout}
            canBet={canBet}
            canSpin={canSpin}
            onBetAmountChange={setBetAmount}
            onSpin={spin}
            onClearAllBets={clearAllBets}
            onRemoveBet={removeBet}
          />
        </div>

        {/* Right Panel - Wheel and Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Wheel */}
          <div className="flex justify-center">
            <RouletteWheel
              result={currentResult}
              isSpinning={isSpinning}
              wheelRotation={wheelRotation}
              ballRotation={ballRotation}
            />
          </div>
          
          {/* Betting Table */}
          <RouletteTable
            bets={bets}
            onPlaceBet={placeBet}
            onRemoveBet={removeBet}
            selectedBetAmount={betAmount}
            canBet={canBet}
          />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden space-y-6">
        {/* Mobile Wheel */}
        <div className="flex justify-center">
          <RouletteWheel
            result={currentResult}
            isSpinning={isSpinning}
            wheelRotation={wheelRotation}
            ballRotation={ballRotation}
          />
        </div>
        
        {/* Mobile Controls */}
        <RouletteControls
          gamePhase={gamePhase}
          countdown={countdown}
          roundNumber={roundNumber}
          bets={bets}
          betAmount={betAmount}
          totalBetAmount={totalBetAmount}
          totalPayout={totalPayout}
          canBet={canBet}
          canSpin={canSpin}
          onBetAmountChange={setBetAmount}
          onSpin={spin}
          onClearAllBets={clearAllBets}
          onRemoveBet={removeBet}
        />
        
        {/* Mobile Table */}
        <RouletteTable
          bets={bets}
          onPlaceBet={placeBet}
          onRemoveBet={removeBet}
          selectedBetAmount={betAmount}
          canBet={canBet}
        />
      </div>

      {/* Current Round Result */}
      {currentRound && gamePhase === 'result' && currentResult && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-4">
              {isWin ? 'â You Won! â' : 'â No Win This Round â'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#1a2c38] rounded-lg p-4">
                <div className="text-sm text-slate-400 mb-1">Winning Number</div>
                <div className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    currentResult.color === 'red' ? 'bg-red-600 text-white' :
                    currentResult.color === 'black' ? 'bg-gray-900 text-white' :
                    'bg-green-600 text-white'
                  }`}>
                    {currentResult.number}
                  </div>
                  <span className="capitalize">{currentResult.color}</span>
                </div>
              </div>
              <div className="bg-[#1a2c38] rounded-lg p-4">
                <div className="text-sm text-slate-400 mb-1">Total Bet</div>
                <div className="text-2xl font-bold text-white">
                  {totalBetAmount.toFixed(2)}
                </div>
              </div>
              <div className="bg-[#1a2c38] rounded-lg p-4">
                <div className="text-sm text-slate-400 mb-1">Payout</div>
                <div className={`text-2xl font-bold ${isWin ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {totalPayout.toFixed(2)}
                </div>
              </div>
            </div>
            
            {/* Winning Bets */}
            {currentRound.bets.filter(bet => bet.won).length > 0 && (
              <div className="mt-6 space-y-2">
                <h4 className="text-sm font-medium text-white">Winning Bets</h4>
                <div className="space-y-1">
                  {currentRound.bets.filter(bet => bet.won).map(bet => (
                    <div key={bet.id} className="flex items-center justify-between text-sm bg-[#1a2c38] rounded p-2">
                      <span className="text-white capitalize">{bet.type}</span>
                      <span className="text-emerald-400 font-medium">
                        {bet.amount} â {bet.winAmount}
                      </span>
                    </div>
                  ))}
                </div>
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
        <RouletteHistory history={history} currentResult={currentResult} />
      </div>
    </div>
  )
}
