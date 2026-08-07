'use client'

import { useState, useEffect } from 'react'
import { useDragonTigerGame, useDragonTigerBetting } from '@/hooks/useDragonTigerGame'
import DragonTigerTable from './DragonTigerTable'
import DragonTigerControls from './DragonTigerControls'
import DragonTigerHistory from './DragonTigerHistory'
import { CompactDragonTigerTable } from './DragonTigerTable'
import { CompactDragonTigerControls } from './DragonTigerControls'
import { CompactDragonTigerHistory } from './DragonTigerHistory'

export default function DragonTigerGame() {
  const [showHistory, setShowHistory] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
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
    gameState,
    dragonCard,
    tigerCard,
    currentBet,
    result,
    payouts,
    gameHistory,
    config,
    shoeId,
    gameNumber,
    canBet,
    canStart,
    gameProgress,
    totalPayout,
    totalProfit,
    placeBet: placeBetAction,
    startGame: startGameAction,
    reset: resetAction
  } = useDragonTigerGame()
  
  // Betting hook
  const {
    betAmount,
    selectedBetType,
    quickBetAmounts,
    setBetAmount,
    setQuickBet,
    setBetType,
    clearBets
  } = useDragonTigerBetting()
  
  // Handle bet placement
  const handlePlaceBet = (amount: number, betType: string) => {
    setBetAmount(amount)
    setBetType(betType as any)
    placeBetAction(amount, betType as any)
  }

  // Handle bet amount change only
  const handleBetAmountChange = (amount: number) => {
    setBetAmount(amount)
  }
  
  // Handle game start
  const handleStartGame = () => {
    if (betAmount > 0 && selectedBetType && gameState === 'betting') {
      startGameAction(betAmount, selectedBetType)
    }
  }
  
  // Get game state text
  const getGameStateText = () => {
    switch (gameState) {
      case 'betting': return 'Place Your Bets'
      case 'dealing': return 'Dealing Cards'
      case 'result': return result ? result.winner.toUpperCase() : 'Game Complete'
      default: return 'Ready to Play'
    }
  }
  
  const getGameStateColor = () => {
    switch (gameState) {
      case 'betting': return 'text-blue-400'
      case 'dealing': return 'text-orange-400'
      case 'result': return result?.winner === 'dragon' ? 'text-blue-400' : 
                     result?.winner === 'tiger' ? 'text-red-400' : 'text-green-400'
      default: return 'text-slate-400'
    }
  }
  
  const getResultEmoji = () => {
    if (!result) return ''
    switch (result.winner) {
      case 'dragon': return 'ð'
      case 'tiger': return 'ð'
      case 'tie': return 'ð'
      default: return ''
    }
  }
  
  // Determine if dealer should reveal cards
  const isRevealing = gameState === 'result'
  
  // Check if game can start
  const canStartGame = gameState === 'betting' && betAmount > 0 && !!selectedBetType
  
  return (
    <div className="min-h-screen bg-[#0f212e] text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dragon Tiger</h1>
          <p className="text-slate-400">Fast 1v1 Card Comparison Game</p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <div className={`text-sm font-medium ${getGameStateColor()}`}>
              {getGameStateText()}
            </div>
            {result && (
              <span className="text-2xl">{getResultEmoji()}</span>
            )}
            {gameState === 'dealing' && (
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {gameState !== 'betting' && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Game Progress</span>
              <span className="text-sm text-emerald-400">{gameProgress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${gameProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Desktop Layout */}
        {!isMobile ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Controls */}
            <div className="lg:col-span-1">
              <DragonTigerControls
                betAmount={betAmount}
                selectedBetType={selectedBetType}
                canStartGame={canStartGame}
                isGameActive={gameState !== 'betting'}
                gameState={gameState}
                onBetAmountChange={handleBetAmountChange}
                onBetTypeChange={setBetType}
                onStartGame={handleStartGame}
                onQuickBet={setQuickBet}
                quickBetAmounts={quickBetAmounts}
                clearBets={clearBets}
              />
            </div>

            {/* Right Column - Table and History */}
            <div className="lg:col-span-2 space-y-6">
              {/* Dragon Tiger Table */}
              <DragonTigerTable
                dragonCard={dragonCard}
                tigerCard={tigerCard}
                deck={{ cards: [], remaining: 416, total: 416, deckCount: 8, shuffled: true }} // Mock deck
                result={result}
                gameState={gameState}
                isRevealing={isRevealing}
                shoeId={shoeId}
                gameNumber={gameNumber}
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
                <DragonTigerHistory
                  history={gameHistory}
                  currentResult={result}
                />
              )}
            </div>
          </div>
        ) : (
          /* Mobile Layout - Stacked */
          <div className="space-y-6">
            {/* Dragon Tiger Table */}
            <CompactDragonTigerTable
              dragonCard={dragonCard}
              tigerCard={tigerCard}
              deck={{ cards: [], remaining: 416, total: 416, deckCount: 8, shuffled: true }} // Mock deck
              result={result}
              gameState={gameState}
              isRevealing={isRevealing}
              shoeId={shoeId}
              gameNumber={gameNumber}
            />

            {/* Controls */}
            <CompactDragonTigerControls
              betAmount={betAmount}
              selectedBetType={selectedBetType}
              canStartGame={canStartGame}
              isGameActive={gameState !== 'betting'}
              gameState={gameState}
              onBetAmountChange={handleBetAmountChange}
              onBetTypeChange={setBetType}
              onStartGame={handleStartGame}
              onQuickBet={setQuickBet}
              quickBetAmounts={quickBetAmounts}
              clearBets={clearBets}
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
              <CompactDragonTigerHistory
                history={gameHistory}
                currentResult={result}
              />
            )}
          </div>
        )}

        {/* Game Result Overlay */}
        {result && gameState === 'result' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#0f212e] rounded-lg border border-white/20 p-8 max-w-md mx-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">
                  {result.winner === 'dragon' ? 'Dragon Wins!' : 
                   result.winner === 'tiger' ? 'Tiger Wins!' : 'Tie!'}
                </h2>
                
                <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold ${
                  result.winner === 'dragon' ? 'bg-blue-600 text-white' : 
                  result.winner === 'tiger' ? 'bg-red-600 text-white' : 
                  'bg-green-600 text-white'
                }`}>
                  {getResultEmoji()}
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="text-slate-400">Dragon Card:</div>
                  <div className="text-lg font-bold text-white">
                    {dragonCard?.rank} ({dragonCard?.value})
                  </div>
                  <div className="text-slate-400">Tiger Card:</div>
                  <div className="text-lg font-bold text-white">
                    {tigerCard?.rank} ({tigerCard?.value})
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className={`text-2xl font-bold ${getGameStateColor()}`}>
                    {result.winner.toUpperCase()}
                  </div>
                  <div className="text-white">
                    {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2)}
                  </div>
                  <div className="text-sm text-slate-400">
                    Payout: {totalPayout.toFixed(2)}
                  </div>
                  <div className="text-sm text-slate-400">
                    Bet: {betAmount}
                  </div>
                </div>
                
                <div className="mt-4 text-xs text-slate-400">
                  Game ID: #{result.id.slice(-8).toUpperCase()}
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

        {/* Game Status Bar */}
        <div className="fixed bottom-4 left-4 right-4 bg-[#0f212e] rounded-lg border border-white/10 p-4 max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                gameState === 'betting' ? 'bg-blue-400' : 
                gameState === 'dealing' ? 'bg-orange-400 animate-pulse' : 
                'bg-slate-400'
              }`}></div>
              <div className="text-sm text-white">
                {getGameStateText()}
              </div>
            </div>
            
            {selectedBetType && gameState === 'betting' && (
              <div className="text-sm text-slate-400">
                {selectedBetType}: {betAmount}
              </div>
            )}
            
            {gameNumber > 0 && (
              <div className="text-sm text-slate-400">
                Game #{gameNumber}
              </div>
            )}
          </div>
          
          {/* Progress Bar */}
          {gameState !== 'betting' && (
            <div className="mt-2">
              <div className="w-full bg-slate-700 rounded-full h-1">
                <div 
                  className="bg-emerald-500 h-1 rounded-full transition-all duration-500"
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
