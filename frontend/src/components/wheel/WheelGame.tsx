'use client'

import { useState } from 'react'
import { useWheelGame } from '@/hooks/useWheelGame'
import WheelCanvas from './WheelCanvas'
import WheelPointer from './WheelPointer'
import WheelControls from './WheelControls'
import WheelHistory from './WheelHistory'

export default function WheelGame() {
  const [showHistory, setShowHistory] = useState(false)
  
  const {
    gameState,
    betAmount,
    selectedDifficulty,
    currentResult,
    currentRound,
    wheelRotation,
    segments,
    history,
    canSpin,
    isSpinning,
    showResult,
    potentialMaxWin,
    winProbability,
    riskScore,
    setBetAmount,
    setSelectedDifficulty,
    spin,
    reset
  } = useWheelGame()
  
  const isWin = currentRound?.isWin ?? null
  
  return (
    <div className="min-h-screen bg-[#0f212e] text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Wheel of Fortune</h1>
          <p className="text-slate-400">Choose your difficulty and spin to win!</p>
        </div>

        {/* Main Game Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1">
            <WheelControls
              betAmount={betAmount}
              selectedDifficulty={selectedDifficulty}
              potentialMaxWin={potentialMaxWin}
              winProbability={winProbability}
              riskScore={riskScore}
              canSpin={canSpin}
              isSpinning={isSpinning}
              onBetAmountChange={setBetAmount}
              onDifficultyChange={setSelectedDifficulty}
              onSpin={spin}
            />
          </div>

          {/* Right Column - Wheel and History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Wheel Display */}
            <div className="bg-[#0f212e] rounded-lg border border-white/10 p-8">
              <div className="relative flex items-center justify-center">
                {/* Wheel Canvas */}
                <WheelCanvas
                  difficulty={selectedDifficulty}
                  rotation={wheelRotation}
                  currentResult={currentResult}
                  isSpinning={isSpinning}
                  segments={segments}
                />
                
                {/* Pointer */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                  <WheelPointer isSpinning={isSpinning} />
                </div>
              </div>
              
              {/* Result Display */}
              {showResult && currentResult && (
                <div className="mt-6 text-center">
                  <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-lg ${
                    isWin ? 'bg-emerald-600/20 text-emerald-400' : 'bg-red-600/20 text-red-400'
                  }`}>
                    <span className="text-2xl font-bold">
                      {isWin ? 'WIN!' : 'LOSS!'}
                    </span>
                    <span className="text-lg">
                      {currentResult.segment.label}
                    </span>
                  </div>
                </div>
              )}
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
              <WheelHistory
                history={history}
                currentResult={currentResult}
              />
            )}
          </div>
        </div>

        {/* Mobile Layout - Stacked */}
        <div className="lg:hidden space-y-6">
          {/* Wheel Display */}
          <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
            <div className="relative flex items-center justify-center">
              {/* Wheel Canvas */}
              <WheelCanvas
                difficulty={selectedDifficulty}
                rotation={wheelRotation}
                currentResult={currentResult}
                isSpinning={isSpinning}
                segments={segments}
              />
              
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                <WheelPointer isSpinning={isSpinning} />
              </div>
            </div>
            
            {/* Result Display */}
            {showResult && currentResult && (
              <div className="mt-6 text-center">
                <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-lg ${
                  isWin ? 'bg-emerald-600/20 text-emerald-400' : 'bg-red-600/20 text-red-400'
                }`}>
                  <span className="text-2xl font-bold">
                    {isWin ? 'WIN!' : 'LOSS!'}
                  </span>
                  <span className="text-lg">
                    {currentResult.segment.label}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <WheelControls
            betAmount={betAmount}
            selectedDifficulty={selectedDifficulty}
            potentialMaxWin={potentialMaxWin}
            winProbability={winProbability}
            riskScore={riskScore}
            canSpin={canSpin}
            isSpinning={isSpinning}
            onBetAmountChange={setBetAmount}
            onDifficultyChange={setSelectedDifficulty}
            onSpin={spin}
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
            <WheelHistory
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
                
                <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold ${
                  isWin ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                }`}>
                  {isWin ? 'ð' : 'ð'}
                </div>
                
                <div className="text-lg text-white mb-2">
                  Result: <span className="font-bold">{currentResult.segment.label}</span>
                </div>
                
                <div className="text-sm text-slate-400 mb-4">
                  Difficulty: <span className="capitalize font-bold">{selectedDifficulty}</span>
                </div>
                
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
