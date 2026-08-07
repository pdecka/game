'use client'

import { useState } from 'react'
import ColorTimer from './ColorTimer'
import ColorGrid from './ColorGrid'
import ColorControls from './ColorControls'
import ColorHistory from './ColorHistory'
import { useColorGame } from '@/hooks/useColorGame'
import type { Number } from '@/utils/colorConfig'

export default function ColorGame() {
  const [selectedNumber, setSelectedNumber] = useState<Number | null>(null)
  
  const {
    gameId,
    phase,
    countdown,
    roundNumber,
    currentResult,
    bets,
    betAmount,
    selectedColor,
    history,
    canBet,
    isLocked,
    isShowingResult,
    isPayout,
    isResetting,
    totalBetAmount,
    totalPayout,
    isWin,
    currentRound,
    placeBet,
    removeBet,
    clearAllBets,
    setBetAmount,
    setSelectedColor
  } = useColorGame()

  const handleNumberClick = (number: Number) => {
    if (canBet && betAmount > 0) {
      placeBet('number', number, betAmount)
      setSelectedNumber(number)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f212e] text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Color Prediction</h1>
          <p className="text-slate-400">Predict the color or number and win!</p>
        </div>

        {/* Main Game Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Controls and Timer */}
          <div className="lg:col-span-1 space-y-6">
            {/* Timer */}
            <ColorTimer
              gameId={gameId}
              phase={phase}
              countdown={countdown}
              roundNumber={roundNumber}
            />
            
            {/* Controls */}
            <ColorControls
              bets={bets}
              betAmount={betAmount}
              selectedColor={selectedColor}
              selectedNumber={selectedNumber}
              totalBetAmount={totalBetAmount}
              totalPayout={totalPayout}
              canBet={canBet}
              onBetAmountChange={setBetAmount}
              onColorSelect={setSelectedColor}
              onNumberSelect={setSelectedNumber}
              onPlaceBet={placeBet}
              onRemoveBet={removeBet}
              onClearAllBets={clearAllBets}
            />
          </div>

          {/* Right Column - Grid and History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Game Grid */}
            <ColorGrid
              currentResult={currentResult}
              bets={bets}
              isRevealed={isShowingResult}
              isLocked={isLocked}
              onNumberClick={handleNumberClick}
            />

            {/* History */}
            <ColorHistory
              history={history}
              currentResult={currentResult}
            />
          </div>
        </div>

        {/* Mobile Layout - Stacked */}
        <div className="lg:hidden space-y-6">
          {/* Timer */}
          <ColorTimer
            gameId={gameId}
            phase={phase}
            countdown={countdown}
            roundNumber={roundNumber}
          />
          
          {/* Grid */}
          <ColorGrid
            currentResult={currentResult}
            bets={bets}
            isRevealed={isShowingResult}
            isLocked={isLocked}
            onNumberClick={handleNumberClick}
          />
          
          {/* Controls */}
          <ColorControls
            bets={bets}
            betAmount={betAmount}
            selectedColor={selectedColor}
            selectedNumber={selectedNumber}
            totalBetAmount={totalBetAmount}
            totalPayout={totalPayout}
            canBet={canBet}
            onBetAmountChange={setBetAmount}
            onColorSelect={setSelectedColor}
            onNumberSelect={setSelectedNumber}
            onPlaceBet={placeBet}
            onRemoveBet={removeBet}
            onClearAllBets={clearAllBets}
          />
          
          {/* History */}
          <ColorHistory
            history={history}
            currentResult={currentResult}
          />
        </div>

        {/* Game Status Overlay */}
        {isShowingResult && currentResult && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#0f212e] rounded-lg border border-white/20 p-8 max-w-md mx-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Result!</h2>
                <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold ${
                  currentResult.color === 'red' ? 'bg-red-600 text-white' :
                  currentResult.color === 'green' ? 'bg-green-600 text-white' :
                  'bg-purple-600 text-white'
                }`}>
                  {currentResult.number}
                </div>
                <div className="text-lg text-white mb-2">
                  {currentResult.color.toUpperCase()}
                </div>
                {currentRound && (
                  <div className="space-y-2">
                    <div className="text-slate-400">Your Result:</div>
                    <div className={`text-2xl font-bold ${currentRound.isWin ? 'text-emerald-400' : 'text-red-400'}`}>
                      {currentRound.isWin ? 'WON!' : 'LOST'}
                    </div>
                    <div className="text-white">
                      {currentRound.isWin ? '+' : '-'}
                      {Math.abs(currentRound.profit).toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
