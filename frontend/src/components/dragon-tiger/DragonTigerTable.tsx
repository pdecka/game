'use client'

import { useState, useEffect } from 'react'
import DragonTigerCard, { CardComparison, ShoeIndicator, ResultIndicator } from './DragonTigerCards'
import type { Card, Deck } from '@/utils/dragonTigerDeck'
import type { GameResult } from '@/utils/dragonTigerEngine'
import { getCardCount, getDeckDescription } from '@/utils/dragonTigerDeck'

interface DragonTigerTableProps {
  dragonCard: Card | null
  tigerCard: Card | null
  deck: Deck
  result: GameResult | null
  gameState: string
  isRevealing: boolean
  shoeId: string
  gameNumber: number
}

export default function DragonTigerTable({
  dragonCard,
  tigerCard,
  deck,
  result,
  gameState,
  isRevealing,
  shoeId,
  gameNumber
}: DragonTigerTableProps) {
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
      case 'result':
        return result?.winner === 'dragon' ? 'text-blue-400' : 
               result?.winner === 'tiger' ? 'text-red-400' : 'text-green-400'
      default:
        return 'text-slate-400'
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
  
  const getWinnerColor = (winner: string) => {
    switch (winner) {
      case 'dragon': return 'text-blue-400'
      case 'tiger': return 'text-red-400'
      case 'tie': return 'text-green-400'
      default: return 'text-slate-400'
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Table Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Dragon Tiger Table</h2>
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
            {/* Dragon Section */}
            <div className="text-center mb-8">
              <div className="text-sm font-medium text-blue-400 mb-2">Dragon</div>
              
              {/* Dragon Card */}
              <div className="flex justify-center mb-4">
                <DragonTigerCard
                  card={dragonCard}
                  isHidden={gameState !== 'result'}
                  isAnimating={isRevealing}
                  side="dragon"
                  isWinner={result?.winner === 'dragon'}
                  isLoser={result?.winner === 'tiger'}
                  size="large"
                />
              </div>
              
              {/* Dragon Value */}
              {showDealerValue && dragonCard && (
                <div className="text-lg font-bold text-white">
                  {dragonCard.rank} ({dragonCard.value})
                </div>
              )}
            </div>
            
            {/* VS Section */}
            <div className="text-center py-6">
              <div className="text-3xl font-bold text-slate-400 mb-2">VS</div>
              
              {/* Result Indicator */}
              {result && gameState === 'result' && (
                <ResultIndicator
                  winner={result.winner}
                  dragonCard={dragonCard}
                  tigerCard={tigerCard}
                  isRevealing={true}
                />
              )}
            </div>
            
            {/* Tiger Section */}
            <div className="text-center">
              <div className="text-sm font-medium text-red-400 mb-2">Tiger</div>
              
              {/* Tiger Card */}
              <div className="flex justify-center mb-4">
                <DragonTigerCard
                  card={tigerCard}
                  isHidden={gameState !== 'result'}
                  isAnimating={isRevealing}
                  side="tiger"
                  isWinner={result?.winner === 'tiger'}
                  isLoser={result?.winner === 'dragon'}
                  size="large"
                />
              </div>
              
              {/* Tiger Value */}
              {showDealerValue && tigerCard && (
                <div className="text-lg font-bold text-white">
                  {tigerCard.rank} ({tigerCard.value})
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
          <div className="w-16 h-20 bg-gradient-to-br from-purple-800 to-purple-900 rounded-xl border-2 border-purple-700 flex items-center justify-center">
            <div className="text-white text-sm font-bold">
              {getCardCount(deck)}
            </div>
          </div>
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
                <div className="text-slate-400">Dragon Card</div>
                <div className="text-white font-medium">
                  {dragonCard?.rank} ({dragonCard?.value})
                </div>
              </div>
              <div>
                <div className="text-slate-400">Tiger Card</div>
                <div className="text-white font-medium">
                  {tigerCard?.rank} ({tigerCard?.value})
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-slate-400">Winner</div>
                  <div className="text-white font-medium">
                    {result.winner === 'dragon' ? 'Dragon' : result.winner === 'tiger' ? 'Tiger' : 'Tie'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Game ID</div>
                  <div className="text-white font-medium">
                    #{result.id.slice(-8).toUpperCase()}
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
export function CompactDragonTigerTable({
  dragonCard,
  tigerCard,
  deck,
  result,
  gameState,
  isRevealing,
  shoeId,
  gameNumber
}: DragonTigerTableProps) {
  return (
    <div className="space-y-4">
      {/* Dragon */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
        <div className="text-sm font-medium text-blue-400 mb-2">Dragon</div>
        <div className="flex justify-center mb-2">
          <DragonTigerCard
            card={dragonCard}
            isHidden={gameState !== 'result'}
            isAnimating={isRevealing}
            side="dragon"
            isWinner={result?.winner === 'dragon'}
            isLoser={result?.winner === 'tiger'}
            size="small"
          />
        </div>
        {gameState === 'result' && dragonCard && (
          <div className="text-center">
            <div className="text-white font-medium">
              {dragonCard.rank} ({dragonCard.value})
            </div>
          </div>
        )}
      </div>
      
      {/* VS */}
      <div className="text-center text-slate-400 text-xl font-bold">
        VS
      </div>
      
      {/* Tiger */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
        <div className="text-sm font-medium text-red-400 mb-2">Tiger</div>
        <div className="flex justify-center mb-2">
          <DragonTigerCard
            card={tigerCard}
            isHidden={gameState !== 'result'}
            isAnimating={isRevealing}
            side="tiger"
            isWinner={result?.winner === 'tiger'}
            isLoser={result?.winner === 'dragon'}
            size="small"
          />
        </div>
        {gameState === 'result' && tigerCard && (
          <div className="text-center">
            <div className="text-white font-medium">
              {tigerCard.rank} ({tigerCard.value})
            </div>
          </div>
        )}
      </div>
      
      {/* Result */}
      {result && gameState === 'result' && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
          <div className="text-center">
            <div className={`text-xl font-bold mb-2 ${
              result.winner === 'dragon' ? 'text-blue-400' : 
              result.winner === 'tiger' ? 'text-red-400' : 'text-green-400'
            }`}>
              {result.winner.toUpperCase()}
            </div>
            <div className="text-xs text-slate-400">
              {dragonCard?.rank} vs {tigerCard?.rank}
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

// Enhanced table with comparison view
export function EnhancedDragonTigerTable({
  dragonCard,
  tigerCard,
  deck,
  result,
  gameState,
  isRevealing,
  shoeId,
  gameNumber
}: DragonTigerTableProps) {
  return (
    <div className="space-y-6">
      {/* Table Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Dragon Tiger Table</h2>
        <div className="flex items-center justify-center gap-2">
          <div className={`text-lg font-medium ${
            gameState === 'betting' ? 'text-blue-400' : 
            gameState === 'dealing' ? 'text-orange-400' : 
            'text-slate-400'
          }`}>
            {gameState === 'betting' ? 'Place Your Bets' : 
             gameState === 'dealing' ? 'Dealing Cards' : 
             'Game Complete'}
          </div>
          {result && (
            <span className="text-2xl">
              {result.winner === 'dragon' ? 'ð' : 
               result.winner === 'tiger' ? 'ð' : 'ð'}
            </span>
          )}
        </div>
      </div>
      
      {/* Enhanced Table Surface */}
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
          {/* Card Comparison */}
          <CardComparison
            dragonCard={dragonCard}
            tigerCard={tigerCard}
            winner={result?.winner || 'dragon'}
            isRevealing={isRevealing}
          />
        </div>
        
        {/* Table Edge Shadow */}
        <div className="absolute inset-0 rounded-3xl pointer-events-none">
          <div className="absolute inset-0 rounded-3xl shadow-inner bg-black/20"></div>
        </div>
      </div>
      
      {/* Enhanced Game Result Display */}
      {result && gameState === 'result' && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <div className="text-center">
            <div className={`text-4xl font-bold mb-4 ${
              result.winner === 'dragon' ? 'text-blue-400' : 
              result.winner === 'tiger' ? 'text-red-400' : 'text-green-400'
            }`}>
              {result.winner === 'dragon' ? 'ð DRAGON WINS!' : 
               result.winner === 'tiger' ? 'ð TIGER WINS!' : 'ð TIE!'}
            </div>
            
            <div className="grid grid-cols-2 gap-6 text-sm mb-4">
              <div className="text-center">
                <div className="text-blue-400 font-medium mb-2">Dragon</div>
                <div className="text-white text-2xl font-bold">
                  {dragonCard?.rank}
                </div>
                <div className="text-slate-400">
                  Value: {dragonCard?.value}
                </div>
              </div>
              <div className="text-center">
                <div className="text-red-400 font-medium mb-2">Tiger</div>
                <div className="text-white text-2xl font-bold">
                  {tigerCard?.rank}
                </div>
                <div className="text-slate-400">
                  Value: {tigerCard?.value}
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-white/10">
              <div className="text-xs text-slate-400">
                Game ID: #{result.id.slice(-8).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Enhanced Statistics */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Game Statistics</h3>
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-400">
              {getCardCount(deck)}
            </div>
            <div className="text-xs text-slate-400">Cards Remaining</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-400">
              {((deck.total - getCardCount(deck)) / deck.total * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-slate-400">Penetration</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">
              #{gameNumber}
            </div>
            <div className="text-xs text-slate-400">Game Number</div>
          </div>
        </div>
      </div>
    </div>
  )
}
