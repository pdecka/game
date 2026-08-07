'use client'

import { useHiloGame } from '@/hooks/useHiloGame'
import HiloControls from './HiloControls'
import HiloCard from './HiloCard'
import HiloHistory from './HiloHistory'
import { Button } from '@/components/ui/button'
import { Trophy, Shield, BarChart, Settings } from 'lucide-react'

export default function HiloGame() {
  const {
    gameState,
    currentCard,
    previousCards,
    streak,
    multiplier,
    betAmount,
    history,
    setBetAmount,
    startGame,
    makePrediction,
    cashout,
    resetGame
  } = useHiloGame()
  
  return (
    <div className="space-y-6">
      {/* Game Title */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">Hi-Lo Card Game</h1>
        <p className="text-slate-400">Predict if the next card is higher or lower!</p>
      </div>

      {/* Main Game Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Controls */}
        <div className="lg:col-span-1">
          <HiloControls
            gameState={gameState}
            betAmount={betAmount}
            multiplier={multiplier}
            streak={streak}
            onBetAmountChange={setBetAmount}
            onStartGame={startGame}
            onHigher={() => makePrediction('higher')}
            onLower={() => makePrediction('lower')}
            onCashout={cashout}
          />
        </div>

        {/* Right Panel - Card Display */}
        <div className="lg:col-span-2">
          <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-white mb-6">Card Display</h2>
              
              {/* Current Card */}
              <div className="flex justify-center mb-8">
                <HiloCard card={currentCard} isSmall={false} isRevealed={gameState !== 'idle'} />
              </div>
              
              {/* Previous Cards */}
              {previousCards.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-slate-400">Previous Cards</h3>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {previousCards.map((card, index) => (
                      <HiloCard key={index} card={card} isSmall={true} isRevealed={true} />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Game State Messages */}
              {gameState === 'idle' && (
                <div className="mt-8 text-center">
                  <p className="text-slate-400">Place your bet and start the game</p>
                </div>
              )}
              
              {gameState === 'playing' && currentCard && (
                <div className="mt-8 text-center">
                  <p className="text-white text-lg">
                    Is the next card <span className="text-blue-400 font-bold">Higher</span> or{' '}
                    <span className="text-red-400 font-bold">Lower</span> than {currentCard.rank}?
                  </p>
                  <p className="text-slate-400 text-sm mt-2">
                    (Same cards count as correct)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden space-y-6">
        {/* Mobile Card Display First */}
        <div className="order-2">
          <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-white mb-6">Card Display</h2>
              
              {/* Current Card */}
              <div className="flex justify-center mb-8">
                <HiloCard card={currentCard} isSmall={false} isRevealed={gameState !== 'idle'} />
              </div>
              
              {/* Previous Cards */}
              {previousCards.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-slate-400">Previous Cards</h3>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {previousCards.map((card, index) => (
                      <HiloCard key={index} card={card} isSmall={true} isRevealed={true} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile Controls */}
        <div className="order-1">
          <HiloControls
            gameState={gameState}
            betAmount={betAmount}
            multiplier={multiplier}
            streak={streak}
            onBetAmountChange={setBetAmount}
            onStartGame={startGame}
            onHigher={() => makePrediction('higher')}
            onLower={() => makePrediction('lower')}
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
        <HiloHistory history={history} />
      </div>
    </div>
  )
}
