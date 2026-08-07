'use client'

import { useTowerGame } from '@/hooks/useTowerGame'
import TowerGrid from './TowerGrid'
import TowerControls from './TowerControls'
import TowerHistory from './TowerHistory'
import { Button } from '@/components/ui/button'
import { Trophy, Shield, BarChart, Settings } from 'lucide-react'

export default function TowerGame() {
  const {
    gameState,
    currentBoard,
    currentStep,
    selectedTile,
    revealedTile,
    currentMultiplier,
    potentialPayout,
    betAmount,
    difficulty,
    history,
    startGame,
    selectTile,
    cashout,
    reset,
    setBetAmount,
    setDifficulty,
    canPlay,
    canSelectTile,
    canCashout,
    isGameOver,
    stepsCompleted,
    maxSteps,
    totalPayout,
    isWin
  } = useTowerGame()
  
  const handleStartGame = () => {
    startGame(betAmount, difficulty)
  }
  
  const handleTileClick = (column: number) => {
    selectTile(column)
  }
  
  const handleCashout = () => {
    cashout()
  }
  
  return (
    <div className="space-y-6">
      {/* Game Title */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">Dragon Tower</h1>
        <p className="text-slate-400">Climb the tower and avoid the monsters!</p>
      </div>

      {/* Main Game Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Controls */}
        <div className="lg:col-span-1">
          <TowerControls
            gameState={gameState}
            currentStep={currentStep}
            maxSteps={maxSteps}
            currentMultiplier={currentMultiplier}
            potentialPayout={potentialPayout}
            betAmount={betAmount}
            difficulty={difficulty}
            canPlay={canPlay}
            canCashout={canCashout}
            onBetAmountChange={setBetAmount}
            onDifficultyChange={setDifficulty}
            onStartGame={handleStartGame}
            onCashout={handleCashout}
          />
        </div>

        {/* Right Panel - Tower Grid */}
        <div className="lg:col-span-2">
          <TowerGrid
            board={currentBoard}
            currentStep={currentStep}
            onTileClick={handleTileClick}
            revealedTile={revealedTile}
            gameState={gameState}
          />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden space-y-6">
        {/* Mobile Controls */}
        <TowerControls
          gameState={gameState}
          currentStep={currentStep}
          maxSteps={maxSteps}
          currentMultiplier={currentMultiplier}
          potentialPayout={potentialPayout}
          betAmount={betAmount}
          difficulty={difficulty}
          canPlay={canPlay}
          canCashout={canCashout}
          onBetAmountChange={setBetAmount}
          onDifficultyChange={setDifficulty}
          onStartGame={handleStartGame}
          onCashout={handleCashout}
        />
        
        {/* Mobile Tower Grid */}
        <TowerGrid
          board={currentBoard}
          currentStep={currentStep}
          onTileClick={handleTileClick}
          revealedTile={revealedTile}
          gameState={gameState}
        />
      </div>

      {/* Game Over Modal */}
      {isGameOver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f212e] rounded-lg border border-white/20 p-8 max-w-md w-full">
            <div className="text-center">
              {gameState === 'lost' ? (
                <>
                  <div className="text-6xl mb-4">ð¹</div>
                  <h3 className="text-2xl font-bold text-red-400 mb-2">Game Over!</h3>
                  <p className="text-slate-300 mb-6">
                    You hit a monster at level {currentStep}!
                  </p>
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
                    <div className="text-sm text-slate-400">Lost Amount</div>
                    <div className="text-2xl font-bold text-red-400">
                      {betAmount}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">ð</div>
                  <h3 className="text-2xl font-bold text-emerald-400 mb-2">
                    {stepsCompleted >= maxSteps ? 'Tower Conquered!' : 'Cashed Out!'}
                  </h3>
                  <p className="text-slate-300 mb-6">
                    {stepsCompleted >= maxSteps
                      ? `You completed all ${maxSteps} levels!`
                      : `You cashed out at level ${currentStep}!`
                    }
                  </p>
                  <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-lg p-4 mb-6">
                    <div className="text-sm text-slate-400">Final Payout</div>
                    <div className="text-2xl font-bold text-emerald-400">
                      {totalPayout}
                    </div>
                    <div className="text-sm text-emerald-300 mt-1">
                      {currentMultiplier.toFixed(2)}x multiplier
                    </div>
                  </div>
                </>
              )}
              
              <div className="bg-[#1a2c38] rounded-lg p-4 mb-6 text-left">
                <h4 className="text-sm font-medium text-white mb-2">Game Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Difficulty</span>
                    <span className="text-white capitalize">{difficulty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Steps Completed</span>
                    <span className="text-white">{stepsCompleted} / {maxSteps}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Final Multiplier</span>
                    <span className="text-white">{currentMultiplier.toFixed(2)}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Profit/Loss</span>
                    <span className={`font-medium ${totalPayout - betAmount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {totalPayout - betAmount >= 0 ? '+' : ''}{totalPayout - betAmount}
                    </span>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={reset}
                className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-semibold"
                size="lg"
              >
                Play Again
              </Button>
            </div>
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
        <TowerHistory history={history} />
      </div>
    </div>
  )
}
