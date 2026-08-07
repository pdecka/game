'use client'

import { useState } from 'react'
import { useCoinGame } from '@/hooks/useCoinGame'
import CoinDisplay from './CoinDisplay'
import CoinControls from './CoinControls'
import CoinHistory from './CoinHistory'

export default function CoinGame() {
  const [showHistory, setShowHistory] = useState(false)
  
  const {
    gameState,
    selectedSide,
    betAmount,
    currentResult,
    currentRound,
    history,
    canFlip,
    isAnimating,
    showResult,
    potentialPayout,
    setSelectedSide,
    setBetAmount,
    flip,
    reset
  } = useCoinGame()
  
  const isWin = currentRound?.isWin ?? null
  
  return (
    <div className="min-h-screen bg-[#0f212e] text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Coin Flip</h1>
          <p className="text-slate-400">Choose heads or tails and double your bet!</p>
        </div>

        {/* Main Game Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1">
            <CoinControls
              selectedSide={selectedSide}
              betAmount={betAmount}
              potentialPayout={potentialPayout}
              canFlip={canFlip}
              isAnimating={isAnimating}
              onSideSelect={setSelectedSide}
              onBetAmountChange={setBetAmount}
              onFlip={flip}
            />
          </div>

          {/* Right Column - Coin Display and History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Coin Display */}
            <div className="bg-[#0f212e] rounded-lg border border-white/10 p-8">
              <CoinDisplay
                gameState={gameState}
                selectedSide={selectedSide}
                currentResult={currentResult}
                isWin={isWin}
              />
            </div>

            {/* History Toggle */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="px-6 py-2 bg-[#1a2c38] hover:bg-[#2a3c48] border border-white/20 rounded-lg text-white transition-all duration-200"
              >
                {showHistory ? 'Hide' : 'Show'} History
              </button>
            </div>

            {/* History Section */}
            {showHistory && (
              <CoinHistory
                history={history}
                currentResult={currentResult}
              />
            )}
          </div>
        </div>

        {/* Mobile Layout - Stacked */}
        <div className="lg:hidden space-y-6">
          {/* Coin Display */}
          <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
            <CoinDisplay
              gameState={gameState}
              selectedSide={selectedSide}
              currentResult={currentResult}
              isWin={isWin}
            />
          </div>

          {/* Controls */}
          <CoinControls
            selectedSide={selectedSide}
            betAmount={betAmount}
            potentialPayout={potentialPayout}
            canFlip={canFlip}
            isAnimating={isAnimating}
            onSideSelect={setSelectedSide}
            onBetAmountChange={setBetAmount}
            onFlip={flip}
          />

          {/* History Toggle */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-6 py-2 bg-[#1a2c38] hover:bg-[#2a3c48] border border-white/20 rounded-lg text-white transition-all duration-200"
            >
              {showHistory ? 'Hide' : 'Show'} History
            </button>
          </div>

          {/* History Section */}
          {showHistory && (
            <CoinHistory
              history={history}
              currentResult={currentResult}
            />
          )}
        </div>

        {/* Game Status Overlay */}
        {showResult && currentResult && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#0f212e] rounded-lg border border-white/20 p-8 max-w-md mx-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">
                  {isWin ? 'You Won!' : 'You Lost!'}
                </h2>
                
                <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-5xl font-bold ${
                  currentResult.side === 'heads' ? 'bg-yellow-600 text-white' : 'bg-blue-600 text-white'
                }`}>
                  {currentResult.side === 'heads' ? 'ð' : 'ð'}
                </div>
                
                <div className="text-lg text-white mb-2">
                  Result: <span className="capitalize font-bold">{currentResult.side}</span>
                </div>
                
                {selectedSide && (
                  <div className="text-sm text-slate-400 mb-4">
                    Your choice: <span className="capitalize">{selectedSide}</span>
                  </div>
                )}
                
                {currentRound && (
                  <div className="space-y-2">
                    <div className="text-slate-400">Your Result:</div>
                    <div className={`text-2xl font-bold ${isWin ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isWin ? 'WON!' : 'LOST'}
                    </div>
                    <div className="text-white">
                      {isWin ? '+' : '-'}
                      {Math.abs(currentRound.profit).toFixed(2)}
                    </div>
                    <div className="text-sm text-slate-400">
                      Payout: {currentRound.payout.toFixed(2)}
                    </div>
                  </div>
                )}
                
                <button
                  onClick={() => setShowHistory(false)}
                  className="mt-6 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-200"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
