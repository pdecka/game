'use client'

import { useState, useEffect } from 'react'
import { BaccaratHand, CardStack, ShoeIndicator, ThirdCardIndicator, NaturalIndicator } from './BaccaratCards'
import type { Card, Deck } from '@/utils/baccaratDeck'
import type { GameResult } from '@/utils/baccaratEngine'
import { getCardCount, getDeckDescription } from '@/utils/baccaratDeck'

interface BaccaratTableProps {
  playerHand: any
  bankerHand: any
  playerThirdCard: Card | null
  bankerThirdCard: Card | null
  deck: Deck
  result: GameResult | null
  gameState: string
  isRevealing: boolean
  shoeId: string
  gameNumber: number
}

export default function BaccaratTable({
  playerHand,
  bankerHand,
  playerThirdCard,
  bankerThirdCard,
  deck,
  result,
  gameState,
  isRevealing,
  shoeId,
  gameNumber
}: BaccaratTableProps) {
  const [showDealerValue, setShowDealerValue] = useState(false)
  
  // Show dealer value when appropriate
  useEffect(() => {
    if (gameState === 'result') {
      setShowDealerValue(true)
    } else if (gameState === 'betting') {
      setShowDealerValue(false)
    }
  }, [gameState])
  
  const getTableStatus = () => {
    switch (gameState) {
      case 'betting':
        return 'Place Your Bets'
      case 'dealing':
        return 'Dealing Cards'
      case 'thirdCard':
        return 'Drawing Third Cards'
      case 'result':
        return result ? result.winner.toUpperCase() : 'Game Complete'
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
      case 'thirdCard':
        return 'text-purple-400'
      case 'result':
        return result?.winner === 'player' ? 'text-blue-400' : 
               result?.winner === 'banker' ? 'text-red-400' : 'text-green-400'
      default:
        return 'text-slate-400'
    }
  }
  
  const getResultEmoji = () => {
    if (!result) return ''
    switch (result.winner) {
      case 'player': return 'ð'
      case 'banker': return 'ð'
      case 'tie': return 'ð'
      default: return ''
    }
  }
  
  const getWinnerColor = (winner: string) => {
    switch (winner) {
      case 'player': return 'text-blue-400'
      case 'banker': return 'text-red-400'
      case 'tie': return 'text-green-400'
      default: return 'text-slate-400'
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Table Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Baccarat Table</h2>
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
            {/* Banker Section */}
            <div className="text-center mb-8">
              <div className="text-sm font-medium text-red-400 mb-2">Banker</div>
              
              {/* Natural Indicator */}
              {bankerHand?.natural && (
                <div className="mb-2">
                  <NaturalIndicator isNatural={true} handType="banker" />
                </div>
              )}
              
              {/* Banker Cards */}
              <div className="flex justify-center mb-4">
                <BaccaratHand
                  cards={bankerHand?.cards || [] as any}
                  handType="banker"
                  isHidden={gameState !== 'result'}
                  isRevealing={isRevealing}
                  showValues={showDealerValue}
                  isWinner={result?.winner === 'banker'}
                  isLoser={result?.winner === 'player'}
                  isNatural={bankerHand?.natural}
                  size="large"
                />
              </div>
              
              {/* Banker Value */}
              {showDealerValue && bankerHand && (
                <div className="text-lg font-bold text-white">
                  {bankerHand.total}
                  {bankerHand.natural && ' (Natural)'}
                </div>
              )}
              
              {/* Third Card Indicator */}
              {bankerThirdCard && (
                <div className="mt-2">
                  <ThirdCardIndicator 
                    hasThirdCard={true} 
                    isPlayer={false} 
                    cardValue={bankerThirdCard.value}
                  />
                </div>
              )}
            </div>
            
            {/* Table Divider */}
            <div className="border-t-2 border-amber-800/50 my-8"></div>
            
            {/* Player Section */}
            <div className="text-center">
              <div className="text-sm font-medium text-blue-400 mb-2">Player</div>
              
              {/* Natural Indicator */}
              {playerHand?.natural && (
                <div className="mb-2">
                  <NaturalIndicator isNatural={true} handType="player" />
                </div>
              )}
              
              {/* Player Cards */}
              <div className="flex justify-center mb-4">
                <BaccaratHand
                  cards={playerHand?.cards || [] as any}
                  handType="player"
                  showValues={true}
                  isWinner={result?.winner === 'player'}
                  isLoser={result?.winner === 'banker'}
                  isNatural={playerHand?.natural}
                  size="large"
                />
              </div>
              
              {/* Player Value */}
              {playerHand && (
                <div className="text-lg font-bold text-white">
                  {playerHand.total}
                  {playerHand.natural && ' (Natural)'}
                </div>
              )}
              
              {/* Third Card Indicator */}
              {playerThirdCard && (
                <div className="mt-2">
                  <ThirdCardIndicator 
                    hasThirdCard={true} 
                    isPlayer={true} 
                    cardValue={playerThirdCard.value}
                  />
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
          <ShoeIndicator 
            cardsRemaining={getCardCount(deck)}
            totalCards={deck.total}
            gameNumber={gameNumber}
          />
        </div>
      </div>
      
      {/* Game Result Display */}
      {result && gameState === 'result' && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <div className="text-center">
            <div className={`text-3xl font-bold mb-2 ${getWinnerColor(result.winner)}`}>
              {result.winner.toUpperCase()}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-slate-400">Player Hand</div>
                <div className="text-white font-medium">
                  {playerHand?.total}
                  {playerHand?.natural && ' (Natural)'}
                </div>
              </div>
              <div>
                <div className="text-slate-400">Banker Hand</div>
                <div className="text-white font-medium">
                  {bankerHand?.total}
                  {bankerHand?.natural && ' (Natural)'}
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-slate-400">Cards Drawn</div>
                  <div className="text-white font-medium">
                    {playerHand?.cards.length || 0} / {bankerHand?.cards.length || 0}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Third Cards</div>
                  <div className="text-white font-medium">
                    {playerThirdCard ? 'Yes' : 'No'} / {bankerThirdCard ? 'Yes' : 'No'}
                  </div>
                </div>
              </div>
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
export function CompactBaccaratTable({
  playerHand,
  bankerHand,
  playerThirdCard,
  bankerThirdCard,
  deck,
  result,
  gameState,
  isRevealing,
  shoeId,
  gameNumber
}: BaccaratTableProps) {
  return (
    <div className="space-y-4">
      {/* Banker */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
        <div className="text-sm font-medium text-red-400 mb-2">Banker</div>
        <BaccaratHand
          cards={bankerHand?.cards || [] as any}
          handType="banker"
          isHidden={gameState !== 'result'}
          isRevealing={isRevealing}
          showValues={gameState === 'result'}
          isWinner={result?.winner === 'banker'}
          isLoser={result?.winner === 'player'}
          size="small"
        />
        {gameState === 'result' && bankerHand && (
          <div className="text-center mt-2">
            <div className="text-white font-medium">
              {bankerHand.total}
              {bankerHand.natural && ' (Natural)'}
            </div>
          </div>
        )}
      </div>
      
      {/* Player */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
        <div className="text-sm font-medium text-blue-400 mb-2">Player</div>
        <BaccaratHand
          cards={playerHand?.cards || [] as any}
          handType="player"
          showValues={true}
          isWinner={result?.winner === 'player'}
          isLoser={result?.winner === 'banker'}
          size="small"
        />
        {playerHand && (
          <div className="text-center mt-2">
            <div className="text-white font-medium">
              {playerHand.total}
              {playerHand.natural && ' (Natural)'}
            </div>
          </div>
        )}
      </div>
      
      {/* Result */}
      {result && gameState === 'result' && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
          <div className="text-center">
            <div className={`text-xl font-bold mb-2 ${
              result.winner === 'player' ? 'text-blue-400' : 
              result.winner === 'banker' ? 'text-red-400' : 'text-green-400'
            }`}>
              {result.winner.toUpperCase()}
            </div>
            <div className="text-xs text-slate-400">
              {playerHand?.total} vs {bankerHand?.total}
            </div>
          </div>
        </div>
      )}
      
      {/* Deck Info */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <div className="text-slate-400">Cards</div>
            <div className="text-white font-medium">
              {getCardCount(deck)}
            </div>
          </div>
          <div>
            <div className="text-slate-400">Penetration</div>
            <div className="text-white font-medium">
              {((deck.total - getCardCount(deck)) / deck.total * 100).toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="text-slate-400">Game</div>
            <div className="text-white font-medium">
              #{gameNumber}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
