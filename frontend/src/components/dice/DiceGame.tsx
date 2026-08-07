'use client'

import { useState } from 'react'
import { useDiceGame } from '@/hooks/useDiceGame'
import DiceSlider from './DiceSlider'
import DiceDisplay from './DiceDisplay'
import DiceControls from './DiceControls'
import DiceHistory from './DiceHistory'

export default function DiceGame() {
  const [showHistory, setShowHistory] = useState(false)
  
  const {
    gameState,
    betAmount,
    target,
    rollType,
    currentResult,
    currentRound,
    animatedRollValue,
    history,
    canRoll,
    isRolling,
    showResult,
    winProbability,
    multiplier,
    potentialPayout,
    riskScore,
    setBetAmount,
    setTarget,
    setRollType,
    roll,
    reset
  } = useDiceGame()
  
  const isWin = currentRound?.isWin ?? null
  
  return (
    <div className="min-h-screen bg-[#0f212e] text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dice Game</h1>
          <p className="text-slate-400">Roll over or under your target to win!</p>
        </div>

        {/* Main Game Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1">
            <DiceControls
              betAmount={betAmount}
              target={target}
              rollType={rollType}
              multiplier={multiplier}
              potentialPayout={potentialPayout}
              winProbability={winProbability}
              riskScore={riskScore}
              canRoll={canRoll}
              isRolling={isRolling}
              onBetAmountChange={setBetAmount}
              onTargetChange={setTarget}
              onRollTypeChange={setRollType}
              onRoll={roll}
            />
          </div>

          {/* Right Column - Slider, Display and History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dice Slider */}
            <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
              <DiceSlider
                target={target}
                rollType={rollType}
                isDisabled={isRolling}
                onTargetChange={setTarget}
              />
            </div>

            {/* Dice Display */}
            <div className="bg-[#0f212e] rounded-lg border border-white/10 p-8">
              <DiceDisplay
                gameState={gameState}
                animatedRollValue={animatedRollValue}
                currentResult={currentResult}
                target={target}
                rollType={rollType}
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
              <DiceHistory
                history={history}
                currentResult={currentResult}
              />
            )}
          </div>
        </div>

        {/* Mobile Layout - Stacked */}
        <div className="lg:hidden space-y-6">
          {/* Dice Slider */}
          <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
            <DiceSlider
              target={target}
              rollType={rollType}
              isDisabled={isRolling}
              onTargetChange={setTarget}
            />
          </div>

          {/* Dice Display */}
          <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
            <DiceDisplay
              gameState={gameState}
              animatedRollValue={animatedRollValue}
              currentResult={currentResult}
              target={target}
              rollType={rollType}
            />
          </div>

          {/* Controls */}
          <DiceControls
            betAmount={betAmount}
            target={target}
            rollType={rollType}
            multiplier={multiplier}
            potentialPayout={potentialPayout}
            winProbability={winProbability}
            riskScore={riskScore}
            canRoll={canRoll}
            isRolling={isRolling}
            onBetAmountChange={setBetAmount}
            onTargetChange={setTarget}
            onRollTypeChange={setRollType}
            onRoll={roll}
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
            <DiceHistory
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
                  Result: <span className="font-bold">{currentResult.rollValue.toFixed(2)}</span>
                </div>
                
                <div className="text-sm text-slate-400 mb-4">
                  Target: <span className="capitalize font-bold">{currentResult.rollType} {currentResult.target}</span>
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
                    <div className="text-sm text-slate-400">
                      Multiplier: {currentResult.multiplier.toFixed(2)}x
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
