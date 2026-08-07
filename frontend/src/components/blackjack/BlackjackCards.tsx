'use client'

import { useState, useEffect } from 'react'
import type { Card } from '@/utils/blackjackDeck'
import { 
  getCardDisplay, 
  getCardColor, 
  getCardBackground,
  getCardUnicode,
  isFaceCard,
  isAce
} from '@/utils/blackjackDeck'

interface BlackjackCardProps {
  card: Card | null
  isHidden: boolean
  isAnimating?: boolean
  animationDelay?: number
  size?: 'small' | 'medium' | 'large'
  showValue?: boolean
  isSelected?: boolean
  isBust?: boolean
  isBlackjack?: boolean
}

export default function BlackjackCard({
  card,
  isHidden,
  isAnimating = false,
  animationDelay = 0,
  size = 'medium',
  showValue = false,
  isSelected = false,
  isBust = false,
  isBlackjack = false
}: BlackjackCardProps) {
  const [isRevealed, setIsRevealed] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  
  // Handle reveal animation
  useEffect(() => {
    if (isAnimating && !isHidden && !isRevealed) {
      const timer = setTimeout(() => {
        setIsRevealed(true)
      }, animationDelay)
      
      return () => clearTimeout(timer)
    }
  }, [isAnimating, isHidden, animationDelay, isRevealed])
  
  const handleClick = () => {
    setIsPressed(true)
    setTimeout(() => setIsPressed(false), 150)
  }
  
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-12 h-16 text-sm'
      case 'medium':
        return 'w-16 h-20 text-base'
      case 'large':
        return 'w-20 h-24 text-lg'
      default:
        return 'w-16 h-20 text-base'
    }
  }
  
  const getCardStyles = () => {
    const baseStyles = `
      relative
      ${getSizeClasses()}
      rounded-lg
      border-2
      font-bold
      transition-all
      duration-300
      transform-gpu
      cursor-pointer
      select-none
      flex
      flex-col
      items-center
      justify-center
      shadow-lg
      ${isPressed ? 'scale-95' : 'hover:scale-105'}
      ${isSelected ? 'ring-2 ring-emerald-400' : ''}
      ${isBust ? 'opacity-60' : ''}
      ${isBlackjack ? 'ring-2 ring-yellow-400' : ''}
    `
    
    if (isHidden) {
      return `${baseStyles} bg-gradient-to-br from-blue-800 to-blue-900 border-blue-700`
    }
    
    if (!card) {
      return `${baseStyles} bg-gray-200 border-gray-300`
    }
    
    return `${baseStyles} ${getCardBackground(card)}`
  }
  
  const getCardContent = () => {
    if (isHidden) {
      return (
        <div className="text-white text-2xl font-bold">
          ?
        </div>
      )
    }
    
    if (!card) {
      return (
        <div className="text-gray-400 text-2xl">
          ?
        </div>
      )
    }
    
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {/* Rank */}
        <div className={`text-2xl font-bold ${getCardColor(card)}`}>
          {card.rank}
        </div>
        
        {/* Suit */}
        <div className={`text-xl ${getCardColor(card)}`}>
          {card.symbol}
        </div>
        
        {/* Value indicator */}
        {showValue && (
          <div className="absolute top-1 right-1 text-xs bg-black/20 px-1 rounded">
            {card.value}
          </div>
        )}
        
        {/* Special indicators */}
        {card && isAce(card.rank) && (
          <div className="absolute bottom-1 left-1 text-xs bg-purple-500/20 px-1 rounded text-purple-300">
            A
          </div>
        )}
        
        {card && isFaceCard(card.rank) && (
          <div className="absolute bottom-1 right-1 text-xs bg-red-500/20 px-1 rounded text-red-300">
            F
          </div>
        )}
      </div>
    )
  }
  
  const getCardBack = () => {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-blue-900 rounded-lg border-2 border-blue-700 flex items-center justify-center">
        <div className="text-white text-3xl font-bold">
          ?
        </div>
        {/* Card back pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-3 gap-1 p-1">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-white/10 rounded-full w-1 h-1"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div
      className={getCardStyles()}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={isHidden ? 'Hidden card' : card ? `Card ${card.rank} of ${card.suit}` : 'Empty card'}
    >
      {getCardContent()}
      
      {/* Card back overlay for hidden cards */}
      {isHidden && getCardBack()}
      
      {/* Shine effect */}
      {!isHidden && card && (
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent transform -translate-x-full hover:translate-x-full transition-transform duration-700"></div>
        </div>
      )}
      
      {/* Inner shadow for depth */}
      <div className="absolute inset-0 rounded-lg shadow-inner pointer-events-none"></div>
      
      {/* Bust overlay */}
      {isBust && (
        <div className="absolute inset-0 bg-red-500/20 rounded-lg flex items-center justify-center">
          <div className="text-red-500 text-2xl font-bold">BUST</div>
        </div>
      )}
      
      {/* Blackjack overlay */}
      {isBlackjack && (
        <div className="absolute inset-0 bg-yellow-500/20 rounded-lg flex items-center justify-center">
          <div className="text-yellow-500 text-2xl font-bold">21</div>
        </div>
      )}
    </div>
  )
}

// Special component for dealer's hidden card
export function DealerHiddenCard({ 
  isRevealing, 
  card, 
  size = 'medium' 
}: { 
  isRevealing: boolean
  card: Card | null
  size?: 'small' | 'medium' | 'large'
}) {
  const [isRevealed, setIsRevealed] = useState(false)
  
  useEffect(() => {
    if (isRevealing && !isRevealed) {
      const timer = setTimeout(() => {
        setIsRevealed(true)
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [isRevealing, isRevealed])
  
  return (
    <div className="relative">
      <BlackjackCard
        card={isRevealed ? card : null}
        isHidden={!isRevealed}
        isAnimating={isRevealing}
        size={size}
      />
      
      {/* Reveal animation */}
      {isRevealing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full bg-gradient-to-br from-blue-800 to-blue-900 rounded-lg border-2 border-blue-700 animate-pulse">
            <div className="text-white text-2xl font-bold animate-spin">?</div>
          </div>
        </div>
      )}
    </div>
  )
}

// Component for displaying a hand of cards
export function BlackjackHand({
  cards,
  isDealer = false,
  hideSecondCard = false,
  isRevealing = false,
  size = 'medium',
  showValues = false,
  isBust = false,
  isBlackjack = false,
  isActive = false
}: {
  cards: Card[]
  isDealer?: boolean
  hideSecondCard?: boolean
  isRevealing?: boolean
  size?: 'small' | 'medium' | 'large'
  showValues?: boolean
  isBust?: boolean
  isBlackjack?: boolean
  isActive?: boolean
}) {
  const getHandValue = () => {
    if (cards.length === 0) return 0
    
    let total = 0
    let aces = 0
    
    for (const card of cards) {
      total += card.value
      if (card.rank === 'A') aces++
    }
    
    // Adjust for aces
    while (total > 21 && aces > 0) {
      total -= 10
      aces--
    }
    
    return total
  }
  
  const isSoft = () => {
    if (cards.length === 0) return false
    
    let total = 0
    let aces = 0
    
    for (const card of cards) {
      total += card.value
      if (card.rank === 'A') aces++
    }
    
    // Adjust for aces
    while (total > 21 && aces > 0) {
      total -= 10
      aces--
    }
    
    return aces > 0 && total <= 21
  }
  
  const handValue = getHandValue()
  const soft = isSoft()
  
  return (
    <div className="space-y-2">
      {/* Cards */}
      <div className="flex gap-2 justify-center">
        {cards.map((card, index) => (
          <div key={card.id} className="relative">
            {isDealer && index === 1 && hideSecondCard ? (
              <DealerHiddenCard
                isRevealing={isRevealing}
                card={card}
                size={size}
              />
            ) : (
              <BlackjackCard
                card={card}
                isHidden={false}
                size={size}
                showValue={showValues}
                isBust={isBust}
                isBlackjack={isBlackjack && index === 0}
                isSelected={isActive && index === cards.length - 1}
              />
            )}
          </div>
        ))}
      </div>
      
      {/* Hand value */}
      {showValues && cards.length > 0 && !hideSecondCard && (
        <div className="text-center">
          <div className={`text-lg font-bold ${
            isBust ? 'text-red-500' : 
            isBlackjack ? 'text-yellow-500' : 
            'text-white'
          }`}>
            {handValue}
            {soft && !isBust && ' (soft)'}
          </div>
          {isBlackjack && (
            <div className="text-sm text-yellow-500">Blackjack!</div>
          )}
          {isBust && (
            <div className="text-sm text-red-500">Bust</div>
          )}
        </div>
      )}
    </div>
  )
}

// Mini card for history display
export function MiniBlackjackCard({
  card,
  isHidden = false,
  size = 'small'
}: {
  card: Card | null
  isHidden?: boolean
  size?: 'small' | 'medium' | 'large'
}) {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-8 h-10 text-xs'
      case 'medium':
        return 'w-10 h-12 text-sm'
      case 'large':
        return 'w-12 h-14 text-base'
      default:
        return 'w-8 h-10 text-xs'
    }
  }
  
  return (
    <div className={`
      ${getSizeClasses()}
      rounded
      border
      flex
      flex-col
      items-center
      justify-center
      font-bold
      ${isHidden ? 'bg-blue-800 border-blue-700' : 'bg-white border-gray-300'}
    `}>
      {isHidden ? (
        <div className="text-white text-lg">?</div>
      ) : card ? (
        <>
          <div className={`text-sm ${getCardColor(card)}`}>
            {card.rank}
          </div>
          <div className={`text-xs ${getCardColor(card)}`}>
            {card.symbol}
          </div>
        </>
      ) : (
        <div className="text-gray-400 text-lg">?</div>
      )}
    </div>
  )
}

// Card stack component for deck visualization
export function CardStack({
  count,
  size = 'medium'
}: {
  count: number
  size?: 'small' | 'medium' | 'large'
}) {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-12 h-16'
      case 'medium':
        return 'w-16 h-20'
      case 'large':
        return 'w-20 h-24'
      default:
        return 'w-16 h-20'
    }
  }
  
  return (
    <div className="relative">
      {/* Stack effect */}
      {Array.from({ length: Math.min(count, 5) }).map((_, index) => (
        <div
          key={index}
          className={`
            absolute
            ${getSizeClasses()}
            rounded-lg
            border-2
            bg-gradient-to-br from-blue-800 to-blue-900
            border-blue-700
            shadow-lg
            transform
            transition-all
            duration-200
          `}
          style={{
            top: `${index * 2}px`,
            left: `${index * 2}px`,
            zIndex: 5 - index
          }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white text-xs font-bold">
              {count > 99 ? '99+' : count}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
