'use client'

import { useState, useEffect } from 'react'
import { BlackjackHand, CardStack } from './BlackjackCards'
import type { Card, Deck } from '@/utils/blackjackDeck'
import type { Hand } from '@/utils/blackjackHands'
import type { BlackjackResult } from '@/utils/blackjackEngine'
import { getDeckDescription, getCardCount } from '@/utils/blackjackDeck'

interface BlackjackTableProps {
  playerHands: Hand[]
  dealerHand: Hand
  currentHandIndex: number
  deck: Deck
  result: BlackjackResult | null
  gameState: string
  isRevealing: boolean
}

export default function BlackjackTable({
  playerHands,
  dealerHand,
  currentHandIndex,
  deck,
  result,
  gameState,
  isRevealing
}: BlackjackTableProps) {
  const [showDealerValue, setShowDealerValue] = useState(false)
  
  // Show dealer value when appropriate
  useEffect(() => {
    if (gameState === 'dealerTurn' || gameState === 'result') {
      setShowDealerValue(true)
    } else if (gameState === 'betting') {
      setShowDealerValue(false)
    }
  }, [gameState])
  
  const getCurrentPlayerHand = () => {
    return playerHands[currentHandIndex] || null
  }
  
  const getTableStatus = () => {
    switch (gameState) {
      case 'betting':
        return 'Place Your Bet'
      case 'dealing':
        return 'Dealing Cards'
      case 'playerTurn':
        return 'Your Turn'
      case 'dealerTurn':
        return 'Dealer Turn'
      case 'result':
        return result ? result.result.toUpperCase() : 'Game Complete'
      default:
        return 'Ready to Play'
    }
  }
  
  const getTableStatusColor = () => {
    switch (gameState) {
      case 'betting':
        return 'text-blue-400'
      case 'dealing':
        return 'text-orange-400'
      case 'playerTurn':
        return 'text-emerald-400'
      case 'dealerTurn':
        return 'text-purple-400'
      case 'result':
        return result?.result === 'win' ? 'text-green-400' : 
               result?.result === 'lose' ? 'text-red-400' : 'text-yellow-400'
      default:
        return 'text-slate-400'
    }
  }
  
  const getResultEmoji = () => {
    if (!result) return ''
    switch (result.result) {
      case 'win':
        return 'ð'
      case 'lose':
        return 'ð'
      case 'push':
        return 'ð'
      default:
        return ''
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Table Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Blackjack Table</h2>
        <div className="flex items-center justify-center gap-2">
          <div className={`text-lg font-medium ${getTableStatusColor()}`}>
            {getTableStatus()}
          </div>
          {result && (
            <span className="text-2xl">{getResultEmoji()}</span>
          )}
        </div>
      </div>
      
      {/* Main Table */}
      <div className="relative">
        {/* Table Surface */}
        <div className="relative bg-gradient-to-br from-green-800 to-green-900 rounded-3xl border-4 border-amber-900 shadow-2xl overflow-hidden">
          {/* Table Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="grid grid-cols-8 gap-1 p-4">
              {Array.from({ length: 64 }).map((_, i) => (
                <div key={i} className="bg-amber-900/30 rounded-full w-full aspect-square"></div>
              ))}
            </div>
          </div>
          
          {/* Table Content */}
          <div className="relative z-10 p-8">
            {/* Dealer Section */}
            <div className="text-center mb-8">
              <div className="text-sm font-medium text-amber-200 mb-2">Dealer</div>
              
              {/* Dealer Cards */}
              <div className="flex justify-center mb-4">
                <BlackjackHand
                  cards={dealerHand.cards as any}
                  isDealer={true}
                  hideSecondCard={gameState !== 'dealerTurn' && gameState !== 'result'}
                  isRevealing={isRevealing}
                  showValues={showDealerValue}
                  isBust={dealerHand.status === 'bust'}
                  isBlackjack={dealerHand.status === 'blackjack'}
                  size="large"
                />
              </div>
              
              {/* Dealer Value */}
              {showDealerValue && dealerHand.cards.length > 0 && (
                <div className="text-lg font-bold text-white">
                  {dealerHand.value.description}
                </div>
              )}
            </div>
            
            {/* Table Divider */}
            <div className="border-t-2 border-amber-800/50 my-8"></div>
            
            {/* Player Section */}
            <div className="space-y-6">
              {/* Multiple Hands (for splits) */}
              {playerHands.length > 1 ? (
                <div className="space-y-4">
                  {playerHands.map((hand, index) => (
                    <div
                      key={index}
                      className={`text-center p-4 rounded-lg ${
                        index === currentHandIndex 
                          ? 'bg-amber-900/30 ring-2 ring-amber-600' 
                          : 'bg-transparent'
                      }`}
                    >
                      <div className="text-sm font-medium text-amber-200 mb-2">
                        Hand {index + 1} {index === currentHandIndex && '(Current)'}
                      </div>
                      
                      <BlackjackHand
                        cards={hand.cards as any}
                        isDealer={false}
                        showValues={true}
                        isBust={hand.status === 'bust'}
                        isBlackjack={hand.status === 'blackjack'}
                        isActive={index === currentHandIndex}
                        size="large"
                      />
                      
                      <div className="text-lg font-bold text-white">
                        {hand.value.description}
                      </div>
                      
                      <div className="text-sm text-amber-200">
                        Bet: {hand.bet}
                        {hand.doubledDown && ' (Doubled)'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Single Hand */
                <div className="text-center">
                  <div className="text-sm font-medium text-amber-200 mb-2">Player</div>
                  
                  <BlackjackHand
                    cards={getCurrentPlayerHand()?.cards || [] as any}
                    isDealer={false}
                    showValues={true}
                    isBust={getCurrentPlayerHand()?.status === 'bust'}
                    isBlackjack={getCurrentPlayerHand()?.status === 'blackjack'}
                    isActive={true}
                    size="large"
                  />
                  
                  {getCurrentPlayerHand() && (
                    <div className="text-lg font-bold text-white">
                      {getCurrentPlayerHand()?.value.description}
                    </div>
                  )}
                  
                  {getCurrentPlayerHand() && (
                    <div className="text-sm text-amber-200">
                      Bet: {getCurrentPlayerHand()?.bet}
                      {getCurrentPlayerHand()?.doubledDown && ' (Doubled)'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Table Edge Shadow */}
          <div className="absolute inset-0 rounded-3xl pointer-events-none">
            <div className="absolute inset-0 rounded-3xl shadow-inner bg-black/20"></div>
          </div>
        </div>
        
        {/* Deck Stack */}
        <div className="absolute top-4 right-4">
          <div className="text-xs text-amber-200 mb-1">Deck</div>
          <CardStack count={getCardCount(deck)} size="small" />
          <div className="text-xs text-amber-200 mt-1 text-center">
            {getCardCount(deck)} left
          </div>
        </div>
        
        {/* Shoe Indicator */}
        <div className="absolute top-4 left-4">
          <div className="text-xs text-amber-200 mb-1">Shoe</div>
          <div className="w-12 h-16 bg-gradient-to-br from-amber-800 to-amber-900 rounded-lg border-2 border-amber-700 flex items-center justify-center">
            <div className="text-amber-200 text-xs font-bold">6D</div>
          </div>
        </div>
      </div>
      
      {/* Game Result Display */}
      {result && gameState === 'result' && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <div className="text-center">
            <div className={`text-3xl font-bold mb-2 ${
              result.result === 'win' ? 'text-emerald-400' :
              result.result === 'lose' ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {result.result.toUpperCase()}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-slate-400">Your Hand</div>
                <div className="text-white font-medium">
                  {result.playerHands.map((hand: Hand) => hand.value.description).join(' | ')}
                </div>
              </div>
              <div>
                <div className="text-slate-400">Dealer Hand</div>
                <div className="text-white font-medium">
                  {result.dealerHand.value.description}
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-slate-400">Total Bet</div>
                  <div className="text-white font-medium">
                    {result.playerHands.reduce((sum: number, hand: Hand) => sum + hand.bet, 0)}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Payout</div>
                  <div className={`font-medium ${
                    result.profit > 0 ? 'text-emerald-400' : 
                    result.profit < 0 ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {result.payout.toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div className="mt-2">
                <div className="text-slate-400">Profit</div>
                <div className={`text-lg font-bold ${
                  result.profit > 0 ? 'text-emerald-400' : 
                  result.profit < 0 ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {result.profit >= 0 ? '+' : ''}{result.profit.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Insurance Offer */}
      {gameState === 'playerTurn' && dealerHand.cards.length > 0 && dealerHand.cards[0].rank === 'A' && (
        <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-4">
          <div className="text-center">
            <div className="text-yellow-400 font-bold mb-2">Insurance Offered!</div>
            <div className="text-sm text-yellow-200">
              Dealer shows Ace. Insurance pays 2:1 if dealer has Blackjack.
            </div>
          </div>
        </div>
      )}
      
      {/* Game Statistics */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="text-slate-400">Deck Status</div>
            <div className="text-white font-medium">
              {getCardCount(deck)}/{deck.total}
            </div>
          </div>
          <div>
            <div className="text-slate-400">Penetration</div>
            <div className="text-white font-medium">
              {((deck.total - getCardCount(deck)) / deck.total * 100).toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-slate-400">Game State</div>
            <div className={`font-medium ${getTableStatusColor()}`}>
              {getTableStatus()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Compact table for mobile view
export function CompactBlackjackTable({
  playerHands,
  dealerHand,
  currentHandIndex,
  deck,
  result,
  gameState,
  isRevealing
}: BlackjackTableProps) {
  const getCurrentPlayerHand = () => {
    return playerHands[currentHandIndex] || null
  }
  
  return (
    <div className="space-y-4">
      {/* Dealer */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
        <div className="text-sm font-medium text-amber-200 mb-2">Dealer</div>
        <BlackjackHand
          cards={dealerHand.cards as any}
          isDealer={true}
          hideSecondCard={gameState !== 'dealerTurn' && gameState !== 'result'}
          isRevealing={isRevealing}
          showValues={gameState === 'dealerTurn' || gameState === 'result'}
          isBust={dealerHand.status === 'bust'}
          isBlackjack={dealerHand.status === 'blackjack'}
          size="small"
        />
      </div>
      
      {/* Player */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
        <div className="text-sm font-medium text-amber-200 mb-2">
          Player {playerHands.length > 1 && `(Hand ${currentHandIndex + 1}/${playerHands.length})`}
        </div>
        <BlackjackHand
          cards={getCurrentPlayerHand()?.cards || [] as any}
          isDealer={false}
          showValues={true}
          isBust={getCurrentPlayerHand()?.status === 'bust'}
          isBlackjack={getCurrentPlayerHand()?.status === 'blackjack'}
          size="small"
        />
        {getCurrentPlayerHand() && (
          <div className="text-center mt-2">
            <div className="text-white font-medium">
              {getCurrentPlayerHand()?.value.description}
            </div>
            <div className="text-xs text-amber-200">
              Bet: {getCurrentPlayerHand()?.bet}
              {getCurrentPlayerHand()?.doubledDown && ' (Doubled)'}
            </div>
          </div>
        )}
      </div>
      
      {/* Result */}
      {result && gameState === 'result' && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
          <div className="text-center">
            <div className={`text-xl font-bold mb-2 ${
              result.result === 'win' ? 'text-emerald-400' :
              result.result === 'lose' ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {result.result.toUpperCase()}
            </div>
            <div className={`text-lg font-bold ${
              result.profit > 0 ? 'text-emerald-400' : 
              result.profit < 0 ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {result.profit >= 0 ? '+' : ''}{result.profit.toFixed(2)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
