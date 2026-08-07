'use client'

import { useState, useEffect } from 'react'
import { useBlackjackGame, useBlackjackBetting } from '@/hooks/useBlackjackGame'
import BlackjackTable from './BlackjackTable'
import BlackjackControls from './BlackjackControls'
import BlackjackHistory from './BlackjackHistory'
import { CompactBlackjackTable } from './BlackjackTable'
import { CompactBlackjackControls } from './BlackjackControls'
import { CompactBlackjackHistory } from './BlackjackHistory'

export default function BlackjackGame() {
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
    playerHands,
    dealerHand,
    currentHandIndex,
    bet,
    result,
    gameHistory,
    insuranceOffered,
    insuranceTaken,
    canAct,
    canHit,
    canStand,
    canDouble,
    canSplit,
    canTakeInsurance,
    gameProgress,
    currentHand,
    placeBet: placeBetAction,
    takeInsurance: takeInsuranceAction,
    startGame: startGameAction,
    hit: hitAction,
    stand: standAction,
    doubleDown: doubleDownAction,
    split: splitAction,
    reset: resetAction
  } = useBlackjackGame()
  
  // Betting hook
  const {
    betAmount,
    quickBetAmounts,
    setBetAmount,
    setQuickBet,
    incrementBet,
    decrementBet
  } = useBlackjackBetting()
  
  // Handle bet placement
  const handlePlaceBet = (amount: number) => {
    setBetAmount(amount)
    placeBetAction(amount)
  }
  
  // Handle game start
  const handleStartGame = () => {
    if (betAmount > 0 && gameState === 'betting') {
      startGameAction(betAmount)
    }
  }
  
  // Handle insurance
  const handleInsurance = () => {
    if (canTakeInsurance && bet) {
      const insuranceAmount = Math.floor(bet.amount / 2)
      takeInsuranceAction(insuranceAmount)
    }
  }
  
  // Get game state text
  const getGameStateText = () => {
    switch (gameState) {
      case 'betting': return 'Place Your Bet'
      case 'dealing': return 'Dealing Cards'
      case 'playerTurn': return 'Your Turn'
      case 'dealerTurn': return 'Dealer Turn'
      case 'result': return result ? result.result.toUpperCase() : 'Game Complete'
      default: return 'Ready to Play'
    }
  }
  
  const getGameStateColor = () => {
    switch (gameState) {
      case 'betting': return 'text-blue-400'
      case 'dealing': return 'text-orange-400'
      case 'playerTurn': return 'text-emerald-400'
      case 'dealerTurn': return 'text-purple-400'
      case 'result': return result?.result === 'win' ? 'text-green-400' : 
                     result?.result === 'lose' ? 'text-red-400' : 'text-yellow-400'
      default: return 'text-slate-400'
    }
  }
  
  const getResultEmoji = () => {
    if (!result) return ''
    switch (result.result) {
      case 'win': return 'ð'
      case 'lose': return 'ð'
      case 'push': return 'ð'
      default: return ''
    }
  }
  
  // Determine if dealer should reveal cards
  const isRevealing = gameState === 'dealerTurn' || gameState === 'result'
  
  // Check if game can start
  const canStartGame = gameState === 'betting' && betAmount > 0
  
  return (
    <div className="min-h-screen bg-[#0f212e] text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Blackjack</h1>
          <p className="text-slate-400">Beat the dealer to 21!</p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <div className={`text-sm font-medium ${getGameStateColor()}`}>
              {getGameStateText()}
            </div>
            {result && (
              <span className="text-2xl">{getResultEmoji()}</span>
            )}
            {gameState === 'playerTurn' && (
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            )}
            {gameState === 'dealerTurn' && (
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
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
              <BlackjackControls
                betAmount={betAmount}
                canStartGame={canStartGame}
                canHit={canHit}
                canStand={canStand}
                canDouble={canDouble}
                canSplit={canSplit}
                canTakeInsurance={canTakeInsurance}
                isGameActive={gameState !== 'betting'}
                gameState={gameState}
                onBetAmountChange={handlePlaceBet}
                onStartGame={handleStartGame}
                onHit={hitAction}
                onStand={standAction}
                onDouble={doubleDownAction}
                onSplit={splitAction}
                onInsurance={handleInsurance}
                onQuickBet={setQuickBet}
                quickBetAmounts={quickBetAmounts}
              />
            </div>

            {/* Right Column - Table and History */}
            <div className="lg:col-span-2 space-y-6">
              {/* Blackjack Table */}
              <BlackjackTable
                playerHands={playerHands}
                dealerHand={dealerHand}
                currentHandIndex={currentHandIndex}
                deck={{ cards: [], remaining: 312, total: 312, deckCount: 6, shuffled: true }} // Mock deck
                result={result}
                gameState={gameState}
                isRevealing={isRevealing}
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
                <BlackjackHistory
                  history={gameHistory}
                  currentResult={result}
                />
              )}
            </div>
          </div>
        ) : (
          /* Mobile Layout - Stacked */
          <div className="space-y-6">
            {/* Blackjack Table */}
            <CompactBlackjackTable
              playerHands={playerHands}
              dealerHand={dealerHand}
              currentHandIndex={currentHandIndex}
              deck={{ cards: [], remaining: 312, total: 312, deckCount: 6, shuffled: true }} // Mock deck
              result={result}
              gameState={gameState}
              isRevealing={isRevealing}
            />

            {/* Controls */}
            <CompactBlackjackControls
              betAmount={betAmount}
              canStartGame={canStartGame}
              canHit={canHit}
              canStand={canStand}
              canDouble={canDouble}
              canSplit={canSplit}
              canTakeInsurance={canTakeInsurance}
              isGameActive={gameState !== 'betting'}
              gameState={gameState}
              onBetAmountChange={handlePlaceBet}
              onStartGame={handleStartGame}
              onHit={hitAction}
              onStand={standAction}
              onDouble={doubleDownAction}
              onSplit={splitAction}
              onInsurance={handleInsurance}
              onQuickBet={setQuickBet}
              quickBetAmounts={quickBetAmounts}
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
              <CompactBlackjackHistory
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
                  {result.result === 'win' ? 'You Won!' : 
                   result.result === 'lose' ? 'You Lost!' : 'Push!'}
                </h2>
                
                <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold ${
                  result.result === 'win' ? 'bg-emerald-600 text-white' : 
                  result.result === 'lose' ? 'bg-red-600 text-white' : 
                  'bg-yellow-600 text-white'
                }`}>
                  {getResultEmoji()}
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="text-slate-400">Your Hand(s):</div>
                  <div className="text-xl font-bold text-white">
                    {result.playerHands.map(hand => hand.value.description).join(' | ')}
                  </div>
                  <div className="text-slate-400">Dealer Hand:</div>
                  <div className="text-xl font-bold text-white">
                    {result.dealerHand.value.description}
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className={`text-2xl font-bold ${
                    result.result === 'win' ? 'text-emerald-400' : 
                    result.result === 'lose' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {result.result.toUpperCase()}
                  </div>
                  <div className="text-white">
                    {result.profit >= 0 ? '+' : ''}{result.profit.toFixed(2)}
                  </div>
                  <div className="text-sm text-slate-400">
                    Payout: {result.payout.toFixed(2)}
                  </div>
                  <div className="text-sm text-slate-400">
                    Bet: {result.playerHands.reduce((sum, hand) => sum + hand.bet, 0)}
                  </div>
                </div>
                
                {result.gameData.playerBlackjack && (
                  <div className="mt-4 text-yellow-400 font-bold">
                    BLACKJACK! ð 3:2 Payout
                  </div>
                )}
                
                {result.gameData.insurance && (
                  <div className="mt-4 text-blue-400">
                    Insurance: {result.gameData.insurance.won ? 'Won!' : 'Lost'}
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

        {/* Insurance Offer Modal */}
        {insuranceOffered && !insuranceTaken && gameState === 'playerTurn' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#0f212e] rounded-lg border border-white/20 p-6 max-w-sm mx-4">
              <div className="text-center">
                <h3 className="text-xl font-bold text-yellow-400 mb-4">Insurance Offered!</h3>
                <p className="text-slate-300 mb-6">
                  Dealer shows Ace. Take insurance for 50% of your bet. Pays 2:1 if dealer has Blackjack.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={handleInsurance}
                    className="w-full py-2 px-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-all"
                  >
                    Take Insurance ({Math.floor(bet?.amount! / 2)})
                  </button>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="w-full py-2 px-4 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-all"
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Game Status Bar */}
        <div className="fixed bottom-4 left-4 right-4 bg-[#0f212e] rounded-lg border border-white/10 p-4 max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                gameState === 'playerTurn' ? 'bg-emerald-400 animate-pulse' : 
                gameState === 'dealerTurn' ? 'bg-purple-400 animate-pulse' : 
                'bg-slate-400'
              }`}></div>
              <div className="text-sm text-white">
                {getGameStateText()}
              </div>
            </div>
            
            {betAmount > 0 && gameState === 'betting' && (
              <div className="text-sm text-slate-400">
                Bet: {betAmount}
              </div>
            )}
            
            {currentHand && gameState === 'playerTurn' && (
              <div className="text-sm text-slate-400">
                Hand {currentHandIndex + 1}/{playerHands.length}
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
