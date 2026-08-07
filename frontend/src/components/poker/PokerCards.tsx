'use client'

import { useState, useEffect } from 'react'
import { 
  formatCardForDisplay,
  getCardColor,
  SUIT_SYMBOLS,
  type Card
} from '@/utils/pokerDeck'

interface PokerCardsProps {
  cards: Card[]
  hidden?: boolean
  showCards?: boolean
  label?: string
  isDealer?: boolean
  compact?: boolean
}

export default function PokerCards({ 
  cards, 
  hidden = false, 
  showCards = false,
  label,
  isDealer = false,
  compact = false
}: PokerCardsProps) {
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set())
  const [animatingCards, setAnimatingCards] = useState<Set<number>>(new Set())
  
  useEffect(() => {
    if (showCards && !hidden) {
      // Flip all cards when showCards becomes true
      const newFlipped = new Set<number>()
      cards.forEach((_, index) => {
        setTimeout(() => {
          setFlippedCards(prev => new Set(prev).add(index))
        }, index * 200) // Stagger flip animations
      })
    }
  }, [showCards, hidden, cards])
  
  const handleCardClick = (index: number) => {
    if (!hidden && !isDealer) {
      setAnimatingCards(prev => new Set(prev).add(index))
      
      setTimeout(() => {
        setFlippedCards(prev => {
          const newSet = new Set(prev)
          if (newSet.has(index)) {
            newSet.delete(index)
          } else {
            newSet.add(index)
          }
          return newSet
        })
        setAnimatingCards(prev => {
          const newSet = new Set(prev)
          newSet.delete(index)
          return newSet
        })
      }, 300)
    }
  }
  
  const getCardSize = () => {
    if (compact) return 'w-12 h-16'
    return 'w-16 h-24'
  }
  
  const getCardFontSize = () => {
    if (compact) return 'text-xs'
    return 'text-sm'
  }
  
  const renderCard = (card: Card, index: number) => {
    const isFlipped = flippedCards.has(index)
    const isAnimating = animatingCards.has(index)
    const shouldShow = !hidden || isFlipped
    
    const cardDisplay = formatCardForDisplay(card)
    
    return (
      <div
        key={`${card.id}-${index}`}
        className={`
          ${getCardSize()} 
          relative 
          transition-all 
          duration-300 
          transform-gpu
          ${isAnimating ? 'animate-pulse' : ''}
          ${!hidden && !isDealer ? 'cursor-pointer hover:scale-105' : ''}
          ${index > 0 && !compact ? '-ml-8' : ''}
          ${index > 0 && compact ? '-ml-6' : ''}
          z-${10 - index}
        `}
        onClick={() => handleCardClick(index)}
        style={{
          transformStyle: 'preserve-3d',
          transform: isAnimating ? 'rotateY(180deg)' : isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)'
        }}
      >
        {/* Card Back */}
        <div 
          className={`
            absolute 
            inset-0 
            rounded-lg 
            border-2 
            border-slate-600
            ${shouldShow ? 'opacity-0' : 'opacity-100'}
            transition-opacity 
            duration-300
          `}
          style={{
            backfaceVisibility: 'hidden'
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg flex items-center justify-center">
            <div className="text-slate-500 text-2xl font-bold">â</div>
          </div>
        </div>
        
        {/* Card Front */}
        <div 
          className={`
            absolute 
            inset-0 
            rounded-lg 
            border-2 
            ${getCardColor(card) === 'red' ? 'border-red-600' : 'border-slate-600'}
            ${shouldShow ? 'opacity-100' : 'opacity-0'}
            transition-opacity 
            duration-300
          `}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className="w-full h-full bg-white rounded-lg flex flex-col items-center justify-center">
            {/* Rank */}
            <div className={`font-bold ${getCardFontSize()} ${getCardColor(card) === 'red' ? 'text-red-600' : 'text-black'}`}>
              {card.rank}
            </div>
            
            {/* Suit */}
            <div className={`text-lg ${getCardColor(card) === 'red' ? 'text-red-600' : 'text-black'}`}>
              {SUIT_SYMBOLS[card.suit]}
            </div>
            
            {/* Bottom Rank (for realism) */}
            <div className={`absolute bottom-1 right-1 font-bold text-xs ${getCardColor(card) === 'red' ? 'text-red-600' : 'text-black'}`}>
              {card.rank}
            </div>
          </div>
        </div>
        
        {/* Card Shadow */}
        <div className="absolute -bottom-1 left-1 right-1 h-2 bg-black/20 rounded-lg blur-sm"></div>
      </div>
    )
  }
  
  const renderEmptySlot = (index: number) => (
    <div
      key={`empty-${index}`}
      className={`
        ${getCardSize()} 
        relative 
        border-2 
        border-dashed 
        border-slate-600 
        rounded-lg 
        ${index > 0 && !compact ? '-ml-8' : ''}
        ${index > 0 && compact ? '-ml-6' : ''}
        opacity-30
      `}
    >
      <div className="w-full h-full bg-slate-800/20 rounded-lg flex items-center justify-center">
        <div className="text-slate-600 text-2xl">?</div>
      </div>
    </div>
  )
  
  return (
    <div className="flex flex-col items-center">
      {label && (
        <div className="text-sm font-medium text-slate-400 mb-2">
          {label}
        </div>
      )}
      
      <div className="flex items-center">
        {cards.length === 0 ? (
          <>
            {renderEmptySlot(0)}
            {renderEmptySlot(1)}
          </>
        ) : (
          <>
            {cards.map((card, index) => renderCard(card, index))}
            
            {/* Show empty slots if less than expected */}
            {cards.length < 2 && (
              <>
                {renderEmptySlot(cards.length)}
              </>
            )}
          </>
        )}
      </div>
      
      {/* Card Count Badge */}
      {cards.length > 0 && (
        <div className="mt-2 px-2 py-1 bg-slate-700 rounded-full text-xs text-slate-300">
          {cards.length} card{cards.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}

// Special component for community cards
export function CommunityCards({ 
  cards, 
  stage 
}: { 
  cards: Card[]; 
  stage: 'flop' | 'turn' | 'river' | 'showdown' 
}) {
  const getExpectedCount = () => {
    switch (stage) {
      case 'flop': return 3
      case 'turn': return 4
      case 'river': return 5
      case 'showdown': return 5
      default: return 5
    }
  }
  
  const expectedCount = getExpectedCount()
  const displayCards = cards.slice(0, expectedCount)
  
  return (
    <div className="flex flex-col items-center">
      <div className="text-sm font-medium text-slate-400 mb-2">
        Community Cards
      </div>
      
      <div className="flex items-center">
        {displayCards.map((card, index) => (
          <div
            key={card.id}
            className="w-16 h-24 relative transition-all duration-300 transform-gpu"
            style={{
              marginLeft: index > 0 ? '-2rem' : '0',
              zIndex: 10 - index
            }}
          >
            <div className="w-full h-full bg-white rounded-lg border-2 border-slate-600 flex flex-col items-center justify-center shadow-lg">
              {/* Rank */}
              <div className={`font-bold text-sm ${
                getCardColor(card) === 'red' ? 'text-red-600' : 'text-black'
              }`}>
                {card.rank}
              </div>
              
              {/* Suit */}
              <div className={`text-lg ${
                getCardColor(card) === 'red' ? 'text-red-600' : 'text-black'
              }`}>
                {SUIT_SYMBOLS[card.suit]}
              </div>
              
              {/* Bottom Rank */}
              <div className={`absolute bottom-1 right-1 font-bold text-xs ${
                getCardColor(card) === 'red' ? 'text-red-600' : 'text-black'
              }`}>
                {card.rank}
              </div>
            </div>
            
            {/* Card Shadow */}
            <div className="absolute -bottom-1 left-1 right-1 h-2 bg-black/20 rounded-lg blur-sm"></div>
          </div>
        ))}
        
        {/* Show empty slots for remaining cards */}
        {Array.from({ length: expectedCount - displayCards.length }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="w-16 h-24 relative border-2 border-dashed border-slate-600 rounded-lg opacity-30"
            style={{
              marginLeft: displayCards.length > 0 || index > 0 ? '-2rem' : '0'
            }}
          >
            <div className="w-full h-full bg-slate-800/20 rounded-lg flex items-center justify-center">
              <div className="text-slate-600 text-2xl">?</div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Stage Indicator */}
      <div className="mt-3 flex items-center gap-2">
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          stage === 'flop' ? 'bg-emerald-600/20 text-emerald-400' :
          stage === 'turn' ? 'bg-yellow-600/20 text-yellow-400' :
          stage === 'river' ? 'bg-orange-600/20 text-orange-400' :
          'bg-purple-600/20 text-purple-400'
        }`}>
          {stage.charAt(0).toUpperCase() + stage.slice(1)}
        </div>
        <div className="text-xs text-slate-400">
          {displayCards.length}/{expectedCount} cards
        </div>
      </div>
    </div>
  )
}

