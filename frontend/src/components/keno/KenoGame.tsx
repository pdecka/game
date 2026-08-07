'use client'

import { useState } from 'react'
import { useKenoGame, useKenoBetting } from '@/hooks/useKenoGame'
import KenoBoard from './KenoBoard'
import KenoControls from './KenoControls'
import KenoHistory from './KenoHistory'

export default function KenoGame() {
  const [showHistory, setShowHistory] = useState(false)
  
  const {
    gameState,
    selectedNumbers,
    currentBet,
    currentDraw,
    currentResult,
    gameHistory,
    drawingNumbers,
    canSelectNumbers,
    canStartGame,
    isGameActive,
    gameProgress,
    matches,
    isWin,
    selectNumber,
    clearSelections,
    quickPick,
    startGame,
    reset
  } = useKenoGame()
  
  const {
    betAmount,
    difficulty,
    setBetAmount,
    setDifficulty,
    quickBetAmounts,
    setQuickBet,
    incrementBet,
    decrementBet
  } = useKenoBetting()
  
  const handleStartGame = () => {
    if (canStartGame && selectedNumbers.length > 0) {
      startGame(betAmount, difficulty)
    }
  }
  
  const handleQuickPick = () => {
    quickPick(10)
  }
  
  const handleClearSelections = () => {
    clearSelections()
  }
  
  const getGameStateText = () => {
    switch (gameState) {
      case 'idle': return 'Select Numbers'
      case 'selecting': return 'Place Your Bet'
      case 'drawing': return 'Drawing Numbers'
      case 'result': return isWin ? 'You Won!' : 'Game Over'
      default: return 'Ready to Play'
    }
  }
  
  const getGameStateColor = () => {
    switch (gameState) {
      case 'idle': return 'text-slate-400'
      case 'selecting': return 'text-blue-400'
      case 'drawing': return 'text-orange-400'
      case 'result': return isWin ? 'text-emerald-400' : 'text-red-400'
      default: return 'text-slate-400'
    }
  }
  
  return (
    <div className="min-h-screen bg-[#0f212e] text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Keno</h1>
          <p className="text-slate-400">Select numbers, draw 10, and win big!</p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <div className={`text-sm font-medium ${getGameStateColor()}`}>
              {getGameStateText()}
            </div>
            {gameState === 'drawing' && (
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
            )}
          </div>
        </div>

        {/* Main Game Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1">
            <KenoControls
              betAmount={betAmount}
              difficulty={difficulty}
              selectedCount={selectedNumbers.length}
              canStartGame={canStartGame}
              isGameActive={isGameActive}
              onBetAmountChange={setBetAmount}
              onDifficultyChange={setDifficulty}
              onQuickPick={handleQuickPick}
              onClearSelections={handleClearSelections}
              onStartGame={handleStartGame}
            />
          </div>

          {/* Right Column - Board and History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Keno Board */}
            <KenoBoard
              selectedNumbers={selectedNumbers}
              drawnNumbers={drawingNumbers}
              isDisabled={!canSelectNumbers}
              isAnimating={isGameActive}
              onNumberClick={selectNumber}
              showHotCold={false}
              hotNumbers={[]}
              coldNumbers={[]}
              history={gameHistory}
            />

            {/* Progress Bar */}
            {isGameActive && (
              <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Drawing Progress</span>
                  <span className="text-sm text-orange-400">{gameProgress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${gameProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

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
              <KenoHistory
                history={gameHistory}
                currentResult={currentResult}
              />
            )}
          </div>
        </div>

        {/* Mobile Layout - Stacked */}
        <div className="lg:hidden space-y-6">
          {/* Keno Board */}
          <KenoBoard
            selectedNumbers={selectedNumbers}
            drawnNumbers={drawingNumbers}
            isDisabled={!canSelectNumbers}
            isAnimating={isGameActive}
            onNumberClick={selectNumber}
            showHotCold={false}
            hotNumbers={[]}
            coldNumbers={[]}
            history={gameHistory}
          />

          {/* Progress Bar */}
          {isGameActive && (
            <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Drawing Progress</span>
                <span className="text-sm text-orange-400">{gameProgress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${gameProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Controls */}
          <KenoControls
            betAmount={betAmount}
            difficulty={difficulty}
            selectedCount={selectedNumbers.length}
            canStartGame={canStartGame}
            isGameActive={isGameActive}
            onBetAmountChange={setBetAmount}
            onDifficultyChange={setDifficulty}
            onQuickPick={handleQuickPick}
            onClearSelections={handleClearSelections}
            onStartGame={handleStartGame}
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
            <KenoHistory
              history={gameHistory}
              currentResult={currentResult}
            />
          )}
        </div>

        {/* Game Result Overlay */}
        {currentResult && gameState === 'result' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#0f212e] rounded-lg border border-white/20 p-8 max-w-md mx-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">
                  {isWin ? 'You Won!' : 'Game Over'}
                </h2>
                
                <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold ${
                  isWin ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                }`}>
                  {isWin ? 'ð' : 'ð'}
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="text-slate-400">Matches:</div>
                  <div className="text-2xl font-bold text-white">
                    {currentResult.matches} / 10
                  </div>
                  <div className="text-slate-400">Multiplier:</div>
                  <div className="text-xl font-bold text-white">
                    {currentResult.multiplier.toFixed(1)}x
                  </div>
                  <div className="text-slate-400">Difficulty:</div>
                  <div className="text-lg font-bold text-white capitalize">
                    {currentResult.bet.difficulty}
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className={`text-2xl font-bold ${
                    isWin ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {isWin ? 'WIN!' : 'LOSS'}
                  </div>
                  <div className="text-white">
                    {currentResult.profit >= 0 ? '+' : ''}
                    {currentResult.profit.toFixed(2)}
                  </div>
                  <div className="text-sm text-slate-400">
                    Payout: {currentResult.payout.toFixed(2)}
                  </div>
                  <div className="text-sm text-slate-400">
                    Bet: {currentResult.bet.amount.toFixed(2)}
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setShowHistory(false)
                    reset()
                  }}
                  className="mt-6 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-200"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game Status Bar */}
        <div className="fixed bottom-4 left-4 right-4 bg-[#0f212e] rounded-lg border border-white/10 p-4 max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                isGameActive ? 'bg-orange-400 animate-pulse' : 'bg-slate-400'
              }`}></div>
              <div className="text-sm text-white">
                {getGameStateText()}
              </div>
            </div>
            
            {selectedNumbers.length > 0 && (
              <div className="text-sm text-slate-400">
                Selected: {selectedNumbers.length}/10
              </div>
            )}
          </div>
          
          {/* Progress Bar */}
          {isGameActive && (
            <div className="mt-2">
              <div className="w-full bg-slate-700 rounded-full h-1">
                <div 
                  className="bg-orange-500 h-1 rounded-full transition-all duration-500"
                  style={{ width: `${gameProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
