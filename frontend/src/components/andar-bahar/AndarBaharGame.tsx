'use client'

import { useState, useEffect } from 'react'
import { useAndarBaharGame, useAndarBaharBetting } from '@/hooks/useAndarBaharGame'
import AndarBaharTable from './AndarBaharTable'
import AndarBaharControls from './AndarBaharControls'
import AndarBaharHistory from './AndarBaharHistory'
import { CompactAndarBaharTable } from './AndarBaharTable'
import { CompactAndarBaharControls } from './AndarBaharControls'
import { CompactAndarBaharHistory } from './AndarBaharHistory'

export default function AndarBaharGame() {
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
    jokerCard,
    currentBets,
    result,
    payouts,
    gameHistory,
    config,
    sequence,
    cardsDealt,
    canBet,
    canStartFirstDeal,
    canStartSecondDeal,
    gameProgress,
    totalPayout,
    totalProfit,
    hasFirstBet,
    hasSecondBet,
    placeBet: placeBetAction,
    startFirstDeal: startFirstDealAction,
    dealFirstCards: dealFirstCardsAction,
    startSecondDeal: startSecondDealAction,
    dealRemainingCards: dealRemainingCardsAction,
    reset: resetAction
  } = useAndarBaharGame()
  
  // Betting hook
  const {
    betAmount,
    selectedBetType,
    quickBetAmounts,
    setBetAmount,
    setQuickBet,
    setBetType,
    clearBets
  } = useAndarBaharBetting()
  
  // Handle bet placement
  const handlePlaceBet = (amount: number, betType: string) => {
    setBetAmount(amount)
    setBetType(betType as any)
    
    // Determine round based on game state
    const round = gameState === 'betting1' ? 1 : 2
    placeBetAction(amount, betType as any)
  }

  // Handle bet amount change only
  const handleBetAmountChange = (amount: number) => {
    setBetAmount(amount)
  }
  
  // Handle game start
  const handleStartFirstDeal = () => {
    if (betAmount > 0 && selectedBetType && gameState === 'betting1') {
      startFirstDealAction(betAmount, selectedBetType)
    }
  }
  
  const handleStartSecondDeal = () => {
    if (gameState === 'betting2') {
      startSecondDealAction()
    }
  }
  
  // Get game state text
  const getGameStateText = () => {
    switch (gameState) {
      case 'betting1': return 'Place Your First Bet'
      case 'dealing1': return 'Dealing First Cards'
      case 'betting2': return 'Place Your Second Bet'
      case 'dealing2': return 'Dealing Remaining Cards'
      case 'result': return result ? result.winner.toUpperCase() + ' WINS!' : 'Game Complete'
      default: return 'Ready to Play'
    }
  }
  
  const getGameStateColor = () => {
    switch (gameState) {
      case 'betting1': return 'text-blue-400'
      case 'dealing1': return 'text-orange-400'
      case 'betting2': return 'text-purple-400'
      case 'dealing2': return 'text-orange-400'
      case 'result': return result?.winner === 'andar' ? 'text-purple-400' : 
                     result?.winner === 'bahar' ? 'text-orange-400' : 'text-green-400'
      default: return 'text-slate-400'
    }
  }
  
  const getResultEmoji = () => {
    if (!result) return ''
    switch (result.winner) {
      case 'andar': return 'ð'
      case 'bahar': return 'ð'
      default: return ''
    }
  }
  
  // Determine if dealer should reveal cards
  const isRevealing = gameState === 'dealing1' || gameState === 'dealing2' || gameState === 'result'
  
  // Check if game can start
  const canStartGame = (gameState === 'betting1' && canStartFirstDeal) || 
                       (gameState === 'betting2' && canStartSecondDeal)
  
  const isGameActive = gameState === 'dealing1' || gameState === 'dealing2'
  
  return (
    <div className="min-h-screen bg-[#0f212e] text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Andar Bahar</h1>
          <p className="text-slate-400">Fast Indian Casino Card Game</p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <div className={`text-sm font-medium ${getGameStateColor()}`}>
              {getGameStateText()}
            </div>
            {result && (
              <span className="text-2xl">{getResultEmoji()}</span>
            )}
            {isGameActive && (
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {gameState !== 'betting1' && (
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
              <AndarBaharControls
                betAmount={betAmount}
                selectedBetType={selectedBetType}
                canStartFirstDeal={canStartFirstDeal}
                canStartSecondDeal={canStartSecondDeal}
                isGameActive={isGameActive}
                gameState={gameState}
                hasFirstBet={hasFirstBet}
                hasSecondBet={hasSecondBet}
                onBetAmountChange={handleBetAmountChange}
                onBetTypeChange={setBetType}
                onStartFirstDeal={handleStartFirstDeal}
                onStartSecondDeal={handleStartSecondDeal}
                onQuickBet={setQuickBet}
                quickBetAmounts={quickBetAmounts}
                clearBets={clearBets}
              />
            </div>

            {/* Right Column - Table and History */}
            <div className="lg:col-span-2 space-y-6">
              {/* Andar Bahar Table */}
              <AndarBaharTable
                jokerCard={jokerCard}
                sequence={sequence}
                deck={{ cards: [], remaining: 52, total: 52, shuffled: true }} // Mock deck
                result={result}
                gameState={gameState}
                isRevealing={isRevealing}
                cardsDealt={cardsDealt}
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
                <AndarBaharHistory
                  history={gameHistory}
                  currentResult={result}
                />
              )}
            </div>
          </div>
        ) : (
          /* Mobile Layout - Stacked */
          <div className="space-y-6">
            {/* Andar Bahar Table */}
            <CompactAndarBaharTable
              jokerCard={jokerCard}
              sequence={sequence}
              deck={{ cards: [], remaining: 52, total: 52, shuffled: true }} // Mock deck
              result={result}
              gameState={gameState}
              isRevealing={isRevealing}
              cardsDealt={cardsDealt}
            />

            {/* Controls */}
            <CompactAndarBaharControls
              betAmount={betAmount}
              selectedBetType={selectedBetType}
              canStartFirstDeal={canStartFirstDeal}
              canStartSecondDeal={canStartSecondDeal}
              isGameActive={isGameActive}
              gameState={gameState}
              hasFirstBet={hasFirstBet}
              hasSecondBet={hasSecondBet}
              onBetAmountChange={handleBetAmountChange}
              onBetTypeChange={setBetType}
              onStartFirstDeal={handleStartFirstDeal}
              onStartSecondDeal={handleStartSecondDeal}
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
              <CompactAndarBaharHistory
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
                  {result.winner === 'andar' ? 'Andar Wins!' : 
                   result.winner === 'bahar' ? 'Bahar Wins!' : 'Unknown'}
                </h2>
                
                <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold ${
                  result.winner === 'andar' ? 'bg-purple-600 text-white' : 
                  result.winner === 'bahar' ? 'bg-orange-600 text-white' : 
                  'bg-green-600 text-white'
                }`}>
                  {getResultEmoji()}
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="text-slate-400">Joker Card:</div>
                  <div className="text-lg font-bold text-white">
                    {result.jokerCard.rank} ({result.jokerCard.value})
                  </div>
                  <div className="text-slate-400">Win Position:</div>
                  <div className="text-lg font-bold text-white">
                    #{result.position + 1}
                  </div>
                  <div className="text-slate-400">Cards Dealt:</div>
                  <div className="text-lg font-bold text-white">
                    {result.sequence.length}
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className={`text-2xl font-bold ${getGameStateColor()}`}>
                    {result.winner === 'andar' ? 'ð ANDAR WINS!' : 
                     result.winner === 'bahar' ? 'ð BAHAR WINS!' : 'UNKNOWN'}
                  </div>
                  <div className="text-white">
                    {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2)}
                  </div>
                  <div className="text-sm text-slate-400">
                    Payout: {totalPayout.toFixed(2)}
                  </div>
                  <div className="text-sm text-slate-400">
                    Total Bet: {currentBets.reduce((sum, bet) => sum + bet.amount, 0)}
                  </div>
                </div>
                
                {result.isEarlyWin && (
                  <div className="mt-4 text-xs text-yellow-400">
                    â Early Win! Joker appeared on first Bahar card
                  </div>
                )}
                
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
                gameState === 'betting1' ? 'bg-blue-400' : 
                gameState === 'dealing1' ? 'bg-orange-400 animate-pulse' : 
                gameState === 'betting2' ? 'bg-purple-400' : 
                gameState === 'dealing2' ? 'bg-orange-400 animate-pulse' : 
                'bg-slate-400'
              }`}></div>
              <div className="text-sm text-white">
                {getGameStateText()}
              </div>
            </div>
            
            {selectedBetType && (gameState === 'betting1' || gameState === 'betting2') && (
              <div className="text-sm text-slate-400">
                {selectedBetType}: {betAmount}
              </div>
            )}
            
            {cardsDealt > 0 && (
              <div className="text-sm text-slate-400">
                {cardsDealt} cards
              </div>
            )}
          </div>
          
          {/* Progress Bar */}
          {gameState !== 'betting1' && (
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
