'use client'

import { useState } from 'react'
import { usePokerGame } from '@/hooks/usePokerGame'
import PokerTable from './PokerTable'
import PokerControls from './PokerControls'
import PokerHistory from './PokerHistory'

export default function PokerGame() {
  const [showHistory, setShowHistory] = useState(false)
  
  const {
    gameState,
    betAmount,
    playerCards,
    dealerCards,
    communityCards,
    currentResult,
    gameHistory,
    canBet,
    isGameActive,
    canShowCards,
    gameProgress,
    setBetAmount,
    deal,
    reset
  } = usePokerGame()
  
  const isWin = currentResult?.winner === 'player'
  const isTie = currentResult?.winner === 'tie'
  const isLoss = currentResult?.winner === 'dealer'
  
  return (
    <div className="min-h-screen bg-[#0f212e] text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Texas Hold'em Poker</h1>
          <p className="text-slate-400">Heads-Up vs Dealer - Best 5-Card Hand Wins</p>
        </div>

        {/* Main Game Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1">
            <PokerControls
              betAmount={betAmount}
              canBet={canBet}
              isGameActive={isGameActive}
              onBetAmountChange={setBetAmount}
              onDeal={deal}
            />
          </div>

          {/* Right Column - Table and History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Poker Table */}
            <PokerTable
              gameState={gameState}
              playerCards={playerCards}
              dealerCards={dealerCards}
              communityCards={communityCards}
              currentResult={currentResult}
              gameProgress={gameProgress}
              isGameActive={isGameActive}
              canShowCards={canShowCards}
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
              <PokerHistory
                history={gameHistory}
                currentResult={currentResult}
              />
            )}
          </div>
        </div>

        {/* Mobile Layout - Stacked */}
        <div className="lg:hidden space-y-6">
          {/* Poker Table */}
          <PokerTable
            gameState={gameState}
            playerCards={playerCards}
            dealerCards={dealerCards}
            communityCards={communityCards}
            currentResult={currentResult}
            gameProgress={gameProgress}
            isGameActive={isGameActive}
            canShowCards={canShowCards}
          />

          {/* Controls */}
          <PokerControls
            betAmount={betAmount}
            canBet={canBet}
            isGameActive={isGameActive}
            onBetAmountChange={setBetAmount}
            onDeal={deal}
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
            <PokerHistory
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
                  {isWin ? 'You Won!' : isTie ? 'Push!' : 'You Lost!'}
                </h2>
                
                <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold ${
                  isWin ? 'bg-emerald-600 text-white' : 
                  isTie ? 'bg-yellow-600 text-white' : 
                  'bg-red-600 text-white'
                }`}>
                  {isWin ? 'ð' : isTie ? 'ð' : 'ð'}
                </div>
                
                <div className="space-y-2">
                  <div className="text-slate-400">Your Hand:</div>
                  <div className="text-lg font-bold text-white">
                    {currentResult.playerHand.description}
                  </div>
                  <div className="text-slate-400">Dealer Hand:</div>
                  <div className="text-lg font-bold text-white">
                    {currentResult.dealerHand.description}
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="text-slate-400">Result:</div>
                  <div className={`text-2xl font-bold ${
                    isWin ? 'text-emerald-400' : 
                    isTie ? 'text-yellow-400' : 
                    'text-red-400'
                  }`}>
                    {isWin ? 'WIN' : isTie ? 'PUSH' : 'LOSS'}
                  </div>
                  <div className="text-white">
                    {currentResult.profit >= 0 ? '+' : ''}
                    {currentResult.profit.toFixed(2)}
                  </div>
                  <div className="text-sm text-slate-400">
                    Payout: {currentResult.payout.toFixed(2)}
                  </div>
                  <div className="text-sm text-slate-400">
                    Bet: {currentResult.playerCards.length > 0 ? betAmount.toFixed(2) : '0.00'}
                  </div>
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
                isGameActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
              }`}></div>
              <div className="text-sm text-white">
                {gameState === 'idle' ? 'Ready to Play' :
                 gameState === 'dealing' ? 'Dealing Cards' :
                 gameState === 'flop' ? 'Flop' :
                 gameState === 'turn' ? 'Turn' :
                 gameState === 'river' ? 'River' :
                 gameState === 'showdown' ? 'Showdown' :
                 gameState === 'result' ? 'Complete' : 'Unknown'}
              </div>
            </div>
            
            {betAmount > 0 && (
              <div className="text-sm text-slate-400">
                Bet: {betAmount.toFixed(2)}
              </div>
            )}
          </div>
          
          {/* Progress Bar */}
          {isGameActive && (
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
