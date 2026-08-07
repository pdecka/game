'use client'

import { useState, useEffect } from 'react'
import { useTicTacToeGame, useTicTacToeBetting } from '@/hooks/useTicTacToeGame'
import TicTacToeBoard from './TicTacToeBoard'
import TicTacToeControls from './TicTacToeControls'
import TicTacToeStatus from './TicTacToeStatus'
import { CompactTicTacToeControls } from './TicTacToeControls'
import { CompactTicTacToeStatus } from './TicTacToeStatus'
import type { Player } from '@/utils/ticTacToeEngine'

export default function TicTacToeGame() {
  const [showHistory, setShowHistory] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [autoReset, setAutoReset] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  
  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Game hook
  const {
    game,
    gameState,
    currentResult,
    gameHistory,
    betAmount,
    userSymbol,
    difficulty,
    board,
    currentPlayer,
    winningLine,
    moveCount,
    isAIThinking,
    lastAIMove,
    canPlay,
    canMove,
    isUserTurn,
    availableMoves,
    totalPayout,
    totalProfit,
    startGame,
    makePlayerMove,
    reset,
    setDifficulty,
    setUserSymbol,
    setBetAmount,
    validateGame,
    getStatistics,
    getGamePhase
  } = useTicTacToeGame()
  
  // Betting hook
  const {
    quickBetAmounts,
    setQuickBet,
    clearBets
  } = useTicTacToeBetting()
  
  // Handle game start
  const handleStartGame = () => {
    if (canPlay && betAmount > 0 && userSymbol) {
      startGame(betAmount, userSymbol, difficulty)
    }
  }
  
  // Handle player move
  const handlePlayerMove = (position: number) => {
    if (canMove) {
      makePlayerMove(position)
    }
  }
  
  // Handle reset
  const handleReset = () => {
    reset()
  }
  
  // Auto-reset after game completion
  useEffect(() => {
    if (gameState === 'result' && autoReset) {
      const timer = setTimeout(() => {
        reset()
      }, 3000) // Auto-reset after 3 seconds
      
      return () => clearTimeout(timer)
    }
  }, [gameState, autoReset, reset])
  
  // Get game phase text
  const getPhaseText = () => {
    return getGamePhase()
  }
  
  const getPhaseColor = () => {
    if (!game) return 'text-slate-400'
    
    switch (gameState) {
      case 'idle':
        return 'text-slate-400'
      case 'playing':
        return isUserTurn ? 'text-emerald-400' : 'text-blue-400'
      case 'result':
        return currentResult === 'win' ? 'text-emerald-400' : currentResult === 'lose' ? 'text-red-400' : 'text-yellow-400'
      default:
        return 'text-slate-400'
    }
  }
  
  const getPhaseIcon = () => {
    if (!game) return null
    
    switch (gameState) {
      case 'idle':
        return 'ð'
      case 'playing':
        return isUserTurn ? 'ð' : 'ð'
      case 'result':
        return currentResult === 'win' ? 'ð' : currentResult === 'lose' ? 'â' : 'ð'
      default:
        return 'ð'
    }
  }
  
  // Get result emoji
  const getResultEmoji = () => {
    if (!currentResult) return ''
    switch (currentResult) {
      case 'win': return 'ð'
      case 'lose': return 'â'
      case 'tie': return 'ð'
      default: return ''
    }
  }
  
  return (
    <div className="min-h-screen bg-[#0f212e] text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Tic Tac Toe</h1>
          <p className="text-slate-400">Classic Game vs AI with Betting System</p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <div className={`text-sm font-medium ${getPhaseColor()}`}>
              {getPhaseText()}
            </div>
            <span className="text-2xl">{getPhaseIcon()}</span>
            {isAIThinking && (
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {gameState === 'playing' && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Game Progress</span>
              <span className="text-sm text-emerald-400">{moveCount}/9 moves</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(moveCount / 9) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Desktop Layout */}
        {!isMobile ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Controls */}
            <div className="lg:col-span-1">
              <TicTacToeControls
                betAmount={betAmount}
                userSymbol={userSymbol}
                difficulty={difficulty}
                canPlay={canPlay}
                isPlaying={gameState === 'playing'}
                onBetAmountChange={setBetAmount}
                onUserSymbolChange={setUserSymbol}
                onDifficultyChange={setDifficulty}
                onPlay={handleStartGame}
                onReset={handleReset}
                quickBetAmounts={quickBetAmounts}
                clearBets={clearBets}
              />
            </div>

            {/* Right Column - Board and Status */}
            <div className="lg:col-span-2 space-y-6">
              {/* Game Board */}
              <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 text-center">Game Board</h3>
                
                <div className="flex justify-center">
                  <TicTacToeBoard
                    board={board}
                    currentPlayer={currentPlayer}
                    winningLine={winningLine}
                    isUserTurn={isUserTurn}
                    isAIThinking={isAIThinking}
                    onMove={handlePlayerMove}
                    disabled={!canMove}
                    showHints={true}
                    size="large"
                  />
                </div>
                
                {/* Board Actions */}
                {gameState === 'playing' && (
                  <div className="flex justify-center mt-4 gap-2">
                    <div className="text-sm text-slate-400">
                      {isUserTurn ? 'Your turn - click any cell' : 'AI is thinking...'}
                    </div>
                  </div>
                )}
                
                {/* Result Display */}
                {currentResult && gameState === 'result' && (
                  <div className="mt-4 p-4 bg-[#1a2c38] rounded-lg border border-white/10">
                    <div className="text-center">
                      <div className={`text-2xl font-bold mb-2 ${
                        currentResult === 'win' ? 'text-emerald-400' : 
                        currentResult === 'lose' ? 'text-red-400' : 
                        'text-yellow-400'
                      }`}>
                        {currentResult === 'win' ? 'You Win!' : 
                         currentResult === 'lose' ? 'You Lose!' : 
                         'It\'s a Tie!'}
                      </div>
                      <div className="text-lg text-white mb-2">
                        {getResultEmoji()}
                      </div>
                      <div className="text-sm text-slate-400 mb-2">
                        Bet: {betAmount} | Payout: {totalPayout.toFixed(2)}
                      </div>
                      <div className={`text-lg font-bold ${
                        totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {totalProfit >= 0 ? '+' : ''}{(totalProfit).toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Game Status */}
              <TicTacToeStatus
                game={game}
                currentResult={currentResult}
                isUserTurn={isUserTurn}
                isAIThinking={isAIThinking}
                moveCount={moveCount}
                totalPayout={totalPayout}
                totalProfit={totalProfit}
                lastAIMove={lastAIMove}
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
                <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Game History</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {gameHistory.length > 0 ? (
                      gameHistory.slice(0, 10).map((historyItem, index) => (
                        <div key={historyItem.id} className="flex items-center justify-between p-3 bg-[#1a2c38] rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`text-sm font-medium ${
                              (historyItem.result === 'win') ? 'text-emerald-400' : 
                              (historyItem.result === 'lose') ? 'text-red-400' : 
                              'text-yellow-400'
                            }`}>
                              {historyItem.result?.toUpperCase() || 'UNKNOWN'}
                            </div>
                            <div className="text-sm text-white">
                              {historyItem.difficulty}
                            </div>
                            <div className="text-sm text-slate-400">
                              {historyItem.userSymbol === 'X' ? 'â' : 'ð'}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-white">
                              {historyItem.betAmount}
                            </div>
                            <div className={`text-sm font-medium ${
                              historyItem.payout > historyItem.betAmount ? 'text-emerald-400' : 
                              historyItem.payout === historyItem.betAmount ? 'text-yellow-400' : 
                              'text-red-400'
                            }`}>
                              {historyItem.payout}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-400">
                        <div className="text-4xl mb-2">ð</div>
                        <p>No games played yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Mobile Layout - Stacked */
          <div className="space-y-6">
            {/* Game Board */}
            <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
              <h3 className="text-lg font-semibold text-white mb-4 text-center">Game Board</h3>
              
              <div className="flex justify-center">
                <TicTacToeBoard
                  board={board}
                  currentPlayer={currentPlayer}
                  winningLine={winningLine}
                  isUserTurn={isUserTurn}
                  isAIThinking={isAIThinking}
                  onMove={handlePlayerMove}
                  disabled={!canMove}
                  showHints={true}
                  size="medium"
                />
              </div>
              
              {/* Result Display */}
              {currentResult && gameState === 'result' && (
                <div className="mt-4 p-3 bg-[#1a2c38] rounded-lg border border-white/10">
                  <div className="text-center">
                    <div className={`text-lg font-bold mb-1 ${
                      currentResult === 'win' ? 'text-emerald-400' : 
                      currentResult === 'lose' ? 'text-red-400' : 
                      'text-yellow-400'
                    }`}>
                      {currentResult === 'win' ? 'Win!' : 
                       currentResult === 'lose' ? 'Lose!' : 
                       'Tie!'}
                    </div>
                    <div className={`text-sm font-bold ${
                      totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {totalProfit >= 0 ? '+' : ''}{(totalProfit).toFixed(2)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <CompactTicTacToeControls
              betAmount={betAmount}
              userSymbol={userSymbol}
              difficulty={difficulty}
              canPlay={canPlay}
              isPlaying={gameState === 'playing'}
              onBetAmountChange={setBetAmount}
              onUserSymbolChange={setUserSymbol}
              onDifficultyChange={setDifficulty}
              onPlay={handleStartGame}
              onReset={handleReset}
              quickBetAmounts={quickBetAmounts}
              clearBets={clearBets}
            />

            {/* Status */}
            <CompactTicTacToeStatus
              game={game}
              currentResult={currentResult}
              isUserTurn={isUserTurn}
              isAIThinking={isAIThinking}
              moveCount={moveCount}
              totalPayout={totalPayout}
              totalProfit={totalProfit}
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
              <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Game History</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {gameHistory.length > 0 ? (
                    gameHistory.slice(0, 5).map((historyItem, index) => (
                      <div key={historyItem.id} className="flex items-center justify-between p-2 bg-[#1a2c38] rounded">
                        <div className="flex items-center gap-2">
                          <div className={`text-xs font-medium ${
                            historyItem.result === 'win' ? 'text-emerald-400' : 
                            historyItem.result === 'lose' ? 'text-red-400' : 
                            'text-yellow-400'
                          }`}>
                            {historyItem.result?.toUpperCase() || 'UNKNOWN'}
                          </div>
                          <div className="text-xs text-slate-400">
                            {historyItem.difficulty}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xs font-medium ${
                            historyItem.payout > historyItem.betAmount ? 'text-emerald-400' : 
                            historyItem.payout === historyItem.betAmount ? 'text-yellow-400' : 
                            'text-red-400'
                          }`}>
                            {historyItem.payout}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-slate-400 text-sm">
                      No games played yet
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Game Status Bar */}
        <div className="fixed bottom-4 left-4 right-4 bg-[#0f212e] rounded-lg border border-white/10 p-4 max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                gameState === 'idle' ? 'bg-slate-400' : 
                gameState === 'playing' ? (isUserTurn ? 'bg-emerald-400' : 'bg-blue-400') : 
                currentResult === 'win' ? 'bg-emerald-400' : 
                currentResult === 'lose' ? 'bg-red-400' : 
                'bg-yellow-400'
              } ${isAIThinking ? 'animate-pulse' : ''}`}></div>
              <div className="text-sm text-white">
                {getPhaseText()}
              </div>
            </div>
            
            {gameState === 'playing' && (
              <div className="text-sm text-slate-400">
                Move {moveCount}/9
              </div>
            )}
            
            {currentResult && (
              <div className="text-sm text-slate-400">
                {getResultEmoji()}
              </div>
            )}
          </div>
          
          {/* Progress Bar */}
          {gameState === 'playing' && (
            <div className="mt-2">
              <div className="w-full bg-slate-700 rounded-full h-1">
                <div 
                  className="bg-emerald-500 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${(moveCount / 9) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Game Result Overlay */}
        {currentResult && gameState === 'result' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#0f212e] rounded-lg border border-white/20 p-8 max-w-md mx-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">
                  {currentResult === 'win' ? 'You Win!' : 
                   currentResult === 'lose' ? 'You Lose!' : 
                   'It\'s a Tie!'}
                </h2>
                
                <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold ${
                  currentResult === 'win' ? 'bg-emerald-600 text-white' : 
                  currentResult === 'lose' ? 'bg-red-600 text-white' : 
                  'bg-yellow-600 text-white'
                }`}>
                  {getResultEmoji()}
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="text-slate-400">Your Symbol:</div>
                  <div className="text-lg font-bold text-white">
                    {userSymbol === 'X' ? 'Cross (â)' : 'Circle (ð)'}
                  </div>
                  <div className="text-slate-400">Difficulty:</div>
                  <div className="text-lg font-bold text-white">
                    {difficulty}
                  </div>
                  <div className="text-slate-400">Moves:</div>
                  <div className="text-lg font-bold text-white">
                    {moveCount}
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className={`text-2xl font-bold ${
                    currentResult === 'win' ? 'text-emerald-400' : 
                    currentResult === 'lose' ? 'text-red-400' : 
                    'text-yellow-400'
                  }`}>
                    {currentResult === 'win' ? 'WIN!' : 
                     currentResult === 'lose' ? 'LOSE!' : 
                     'TIE!'}
                  </div>
                  <div className="text-white">
                    {totalProfit >= 0 ? '+' : ''}{(totalProfit).toFixed(2)}
                  </div>
                  <div className="text-sm text-slate-400">
                    Payout: {totalPayout.toFixed(2)}
                  </div>
                  <div className="text-sm text-slate-400">
                    Total Bet: {betAmount}
                  </div>
                </div>
                
                <div className="mt-4 text-xs text-slate-400">
                  Game ID: #{game?.id.slice(-8).toUpperCase()}
                </div>
                
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
