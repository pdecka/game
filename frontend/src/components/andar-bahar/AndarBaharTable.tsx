'use client'

import { useState, useEffect } from 'react'
import AndarBaharCard, { JokerCard, DealingSequence, AndarBaharCardWithLabel } from './AndarBaharCards'
import type { Card, Deck } from '@/utils/andarBaharDeck'
import type { GameResult } from '@/utils/andarBaharEngine'
import { getCardCount, getDeckDescription } from '@/utils/andarBaharDeck'

interface AndarBaharTableProps {
  jokerCard: Card | null
  sequence: Array<{ card: Card; side: 'andar' | 'bahar' }>
  deck: Deck
  result: GameResult | null
  gameState: string
  isRevealing: boolean
  cardsDealt: number
}

export default function AndarBaharTable({
  jokerCard,
  sequence,
  deck,
  result,
  gameState,
  isRevealing,
  cardsDealt
}: AndarBaharTableProps) {
  const [showDealerValue, setShowDealerValue] = useState(false)
  
  // Show dealer value when appropriate
  useEffect(() => {
    if (gameState === 'result') {
      setShowDealerValue(true)
    } else if (gameState === 'betting1') {
      setShowDealerValue(false)
    }
  }, [gameState])
  
  const getTableStatus = () => {
    switch (gameState) {
      case 'betting1':
        return 'Place Your First Bet'
      case 'dealing1':
        return 'Dealing First Cards'
      case 'betting2':
        return 'Place Your Second Bet'
      case 'dealing2':
        return 'Dealing Remaining Cards'
      case 'result':
        return result ? `${result.winner.toUpperCase()} WINS!` : 'Game Complete'
      default:
        return 'Ready to Play'
    }
  }
  
  const getTableStatusColor = () => {
    switch (gameState) {
      case 'betting1':
        return 'text-blue-400'
      case 'dealing1':
        return 'text-orange-400'
      case 'betting2':
        return 'text-purple-400'
      case 'dealing2':
        return 'text-orange-400'
      case 'result':
        return result?.winner === 'andar' ? 'text-purple-400' : 
               result?.winner === 'bahar' ? 'text-orange-400' : 'text-green-400'
      default:
        return 'text-slate-400'
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
  
  const getWinnerColor = (winner: string) => {
    switch (winner) {
      case 'andar': return 'text-purple-400'
      case 'bahar': return 'text-orange-400'
      default: return 'text-slate-400'
    }
  }
  
  // Separate cards by side
  const andarCards = sequence.filter(item => item.side === 'andar')
  const baharCards = sequence.filter(item => item.side === 'bahar')
  
  return (
    <div className="space-y-6">
      {/* Table Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Andar Bahar Table</h2>
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
            {/* Center - Joker */}
            <div className="flex justify-center mb-8">
              <JokerCard
                card={jokerCard}
                isRevealed={jokerCard !== null}
                isAnimating={isRevealing}
              />
            </div>
            
            {/* Card Dealing Area */}
            <div className="grid grid-cols-3 gap-8">
              {/* Left - Andar Cards */}
              <div className="text-center">
                <div className="text-sm font-medium text-purple-400 mb-2">Andar</div>
                <div className="flex flex-col items-center space-y-2">
                  {andarCards.length > 0 ? (
                    andarCards.map((item, index) => (
                      <div key={item.card.id} className="relative">
                        <AndarBaharCard
                          card={item.card}
                          isHidden={false}
                          isAnimating={isRevealing}
                          animationDelay={index * 300}
                          side="andar"
                          position="left"
                          isWinner={result?.winner === 'andar' && index === andarCards.length - 1}
                          isLoser={result?.winner === 'bahar'}
                        />
                        
                        {/* Match indicator for winning card */}
                        {result?.winner === 'andar' && index === andarCards.length - 1 && (
                          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                            MATCH!
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="w-16 h-20 bg-[#1a2c38] rounded-lg border-2 border-purple-700 flex items-center justify-center">
                      <div className="text-purple-400 text-lg">â</div>
                    </div>
                  )}
                </div>
                
                {/* Card count */}
                <div className="mt-2 text-xs text-slate-400">
                  {andarCards.length} cards
                </div>
              </div>
              
              {/* Center - VS indicator */}
              <div className="flex items-center justify-center">
                <div className="text-2xl font-bold text-slate-400">VS</div>
              </div>
              
              {/* Right - Bahar Cards */}
              <div className="text-center">
                <div className="text-sm font-medium text-orange-400 mb-2">Bahar</div>
                <div className="flex flex-col items-center space-y-2">
                  {baharCards.length > 0 ? (
                    baharCards.map((item, index) => (
                      <div key={item.card.id} className="relative">
                        <AndarBaharCard
                          card={item.card}
                          isHidden={false}
                          isAnimating={isRevealing}
                          animationDelay={index * 300}
                          side="bahar"
                          position="right"
                          isWinner={result?.winner === 'bahar' && index === baharCards.length - 1}
                          isLoser={result?.winner === 'andar'}
                        />
                        
                        {/* Match indicator for winning card */}
                        {result?.winner === 'bahar' && index === baharCards.length - 1 && (
                          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                            MATCH!
                          </div>
                        )}
                        
                        {/* Early win indicator */}
                        {result?.isEarlyWin && index === 0 && (
                          <div className="absolute -top-2 -left-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                            EARLY!
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="w-16 h-20 bg-[#1a2c38] rounded-lg border-2 border-orange-700 flex items-center justify-center">
                      <div className="text-orange-400 text-lg">â</div>
                    </div>
                  )}
                </div>
                
                {/* Card count */}
                <div className="mt-2 text-xs text-slate-400">
                  {baharCards.length} cards
                </div>
              </div>
            </div>
          </div>
          
          {/* Table Edge Shadow */}
          <div className="absolute inset-0 rounded-3xl pointer-events-none">
            <div className="absolute inset-0 rounded-3xl shadow-inner bg-black/20"></div>
          </div>
        </div>
      </div>
      
      {/* Game Result Display */}
      {result && gameState === 'result' && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <div className="text-center">
            <div className={`text-3xl font-bold mb-2 ${getWinnerColor(result.winner)}`}>
              {result.winner === 'andar' ? 'ð ANDAR WINS!' : 
               result.winner === 'bahar' ? 'ð BAHAR WINS!' : 'UNKNOWN'}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-slate-400">Joker Card</div>
                <div className="text-white font-medium">
                  {result.jokerCard.rank} ({result.jokerCard.value})
                </div>
              </div>
              <div>
                <div className="text-slate-400">Win Position</div>
                <div className="text-white font-medium">
                  Card #{result.position + 1}
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-slate-400">Andar Cards</div>
                  <div className="text-white font-medium">
                    {andarCards.length}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Bahar Cards</div>
                  <div className="text-white font-medium">
                    {baharCards.length}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Total Cards</div>
                  <div className="text-white font-medium">
                    {sequence.length}
                  </div>
                </div>
              </div>
            </div>
            
            {result.isEarlyWin && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-xs text-yellow-400 font-medium">
                  â EARLY WIN! Joker appeared on first Bahar card
                </div>
              </div>
            )}
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
            <div className="text-slate-400">Cards Dealt</div>
            <div className="text-white font-medium">
              {cardsDealt}
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
export function CompactAndarBaharTable({
  jokerCard,
  sequence,
  deck,
  result,
  gameState,
  isRevealing,
  cardsDealt
}: AndarBaharTableProps) {
  // Separate cards by side
  const andarCards = sequence.filter(item => item.side === 'andar')
  const baharCards = sequence.filter(item => item.side === 'bahar')
  
  return (
    <div className="space-y-4">
      {/* Joker */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
        <div className="text-center">
          <div className="text-sm font-medium text-yellow-400 mb-2">JOKER</div>
          <JokerCard
            card={jokerCard}
            isRevealed={jokerCard !== null}
            isAnimating={isRevealing}
          />
        </div>
      </div>
      
      {/* Andar */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
        <div className="text-sm font-medium text-purple-400 mb-2">Andar</div>
        <div className="flex flex-wrap gap-2 justify-center">
          {andarCards.length > 0 ? (
            andarCards.map((item, index) => (
              <AndarBaharCard
                key={item.card.id}
                card={item.card}
                isHidden={false}
                isAnimating={isRevealing}
                side="andar"
                size="small"
                isWinner={result?.winner === 'andar' && index === andarCards.length - 1}
              />
            ))
          ) : (
            <div className="w-12 h-16 bg-[#1a2c38] rounded border-2 border-purple-700 flex items-center justify-center">
              <div className="text-purple-400 text-sm">â</div>
            </div>
          )}
        </div>
        <div className="text-center mt-2 text-xs text-slate-400">
          {andarCards.length} cards
        </div>
      </div>
      
      {/* Bahar */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
        <div className="text-sm font-medium text-orange-400 mb-2">Bahar</div>
        <div className="flex flex-wrap gap-2 justify-center">
          {baharCards.length > 0 ? (
            baharCards.map((item, index) => (
              <AndarBaharCard
                key={item.card.id}
                card={item.card}
                isHidden={false}
                isAnimating={isRevealing}
                side="bahar"
                size="small"
                isWinner={result?.winner === 'bahar' && index === baharCards.length - 1}
              />
            ))
          ) : (
            <div className="w-12 h-16 bg-[#1a2c38] rounded border-2 border-orange-700 flex items-center justify-center">
              <div className="text-orange-400 text-sm">â</div>
            </div>
          )}
        </div>
        <div className="text-center mt-2 text-xs text-slate-400">
          {baharCards.length} cards
        </div>
      </div>
      
      {/* Result */}
      {result && gameState === 'result' && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
          <div className="text-center">
            <div className={`text-xl font-bold mb-2 ${
              result.winner === 'andar' ? 'text-purple-400' : 
              result.winner === 'bahar' ? 'text-orange-400' : 'text-green-400'
            }`}>
              {result.winner === 'andar' ? 'ð ANDAR WINS!' : 
               result.winner === 'bahar' ? 'ð BAHAR WINS!' : 'UNKNOWN'}
            </div>
            <div className="text-xs text-slate-400">
              Joker: {result.jokerCard.rank} | Position: #{result.position + 1}
            </div>
            {result.isEarlyWin && (
              <div className="text-xs text-yellow-400 mt-1">
                â Early Win!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Enhanced table with comparison view
export function EnhancedAndarBaharTable({
  jokerCard,
  sequence,
  deck,
  result,
  gameState,
  isRevealing,
  cardsDealt
}: AndarBaharTableProps) {
  // Separate cards by side
  const andarCards = sequence.filter(item => item.side === 'andar')
  const baharCards = sequence.filter(item => item.side === 'bahar')

  const getTableStatus = () => {
    switch (gameState) {
      case 'betting1':
        return 'Place Your First Bet'
      case 'dealing1':
        return 'Dealing First Cards'
      case 'betting2':
        return 'Place Your Second Bet'
      case 'dealing2':
        return 'Dealing Remaining Cards'
      case 'result':
        return result ? `${result.winner.toUpperCase()} WINS!` : 'Game Complete'
      default:
        return 'Ready to Play'
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Table Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Andar Bahar Table</h2>
        <div className="flex items-center justify-center gap-2">
          <div className={`text-lg font-medium ${
            gameState === 'betting1' ? 'text-blue-400' : 
            gameState === 'dealing1' ? 'text-orange-400' : 
            gameState === 'betting2' ? 'text-purple-400' : 
            gameState === 'dealing2' ? 'text-orange-400' : 
            'text-slate-400'
          }`}>
            {getTableStatus()}
          </div>
          {result && (
            <span className="text-2xl">
              {result.winner === 'andar' ? 'ð' : 
               result.winner === 'bahar' ? 'ð' : ''}
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
          {/* Center - Joker */}
          <div className="flex justify-center mb-8">
            <JokerCard
              card={jokerCard}
              isRevealed={jokerCard !== null}
              isAnimating={isRevealing}
            />
          </div>
          
          {/* Enhanced Card Display */}
          <div className="grid grid-cols-3 gap-8">
            {/* Andar Side */}
            <div className="text-center">
              <div className="text-lg font-bold text-purple-400 mb-4">Andar</div>
              <div className="space-y-2">
                {andarCards.length > 0 ? (
                  andarCards.map((item, index) => (
                    <div key={item.card.id} className="relative">
                      <AndarBaharCard
                        card={item.card}
                        isHidden={false}
                        isAnimating={isRevealing}
                        animationDelay={index * 300}
                        side="andar"
                        position="left"
                        isWinner={result?.winner === 'andar' && index === andarCards.length - 1}
                        isLoser={result?.winner === 'bahar'}
                      />
                      
                      {/* Position indicator */}
                      <div className="absolute -top-1 -right-1 bg-purple-500/20 text-purple-300 text-xs px-1 rounded">
                        {index + 1}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="w-16 h-20 bg-[#1a2c38] rounded-lg border-2 border-purple-700 flex items-center justify-center">
                    <div className="text-purple-400 text-lg">â</div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Center - VS */}
            <div className="flex items-center justify-center">
              <div className="text-3xl font-bold text-slate-400">VS</div>
            </div>
            
            {/* Bahar Side */}
            <div className="text-center">
              <div className="text-lg font-bold text-orange-400 mb-4">Bahar</div>
              <div className="space-y-2">
                {baharCards.length > 0 ? (
                  baharCards.map((item, index) => (
                    <div key={item.card.id} className="relative">
                      <AndarBaharCard
                        card={item.card}
                        isHidden={false}
                        isAnimating={isRevealing}
                        animationDelay={index * 300}
                        side="bahar"
                        position="right"
                        isWinner={result?.winner === 'bahar' && index === baharCards.length - 1}
                        isLoser={result?.winner === 'andar'}
                      />
                      
                      {/* Position indicator */}
                      <div className="absolute -top-1 -right-1 bg-orange-500/20 text-orange-300 text-xs px-1 rounded">
                        {index + 1}
                      </div>
                      
                      {/* Early win indicator */}
                      {result?.isEarlyWin && index === 0 && (
                        <div className="absolute -top-1 -left-1 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                          EARLY!
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="w-16 h-20 bg-[#1a2c38] rounded-lg border-2 border-orange-700 flex items-center justify-center">
                    <div className="text-orange-400 text-lg">â</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Table Edge Shadow */}
        <div className="absolute inset-0 rounded-3xl pointer-events-none">
          <div className="absolute inset-0 rounded-3xl shadow-inner bg-black/20"></div>
        </div>
      </div>
      
      {/* Enhanced Statistics */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Game Statistics</h3>
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-purple-400">
              {andarCards.length}
            </div>
            <div className="text-xs text-slate-400">Andar Cards</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-400">
              {baharCards.length}
            </div>
            <div className="text-xs text-slate-400">Bahar Cards</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">
              {sequence.length}
            </div>
            <div className="text-xs text-slate-400">Total Cards</div>
          </div>
        </div>
      </div>
    </div>
  )
}
