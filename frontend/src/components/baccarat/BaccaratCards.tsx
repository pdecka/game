'use client'

import { useState, useEffect } from 'react'
import type { Card } from '@/utils/baccaratDeck'
import { 
  getCardDisplay, 
  getCardColor, 
  getCardBackground,
  getCardUnicode,
  isZeroValue,
  isAce,
  getRankValue
} from '@/utils/baccaratDeck'

interface BaccaratCardProps {
  card: Card | null
  isHidden: boolean
  isAnimating?: boolean
  animationDelay?: number
  size?: 'small' | 'medium' | 'large'
  showValue?: boolean
  isWinner?: boolean
  isLoser?: boolean
  isNatural?: boolean
  handType?: 'player' | 'banker'
}

export default function BaccaratCard({
  card,
  isHidden,
  isAnimating = false,
  animationDelay = 0,
  size = 'medium',
  showValue = false,
  isWinner = false,
  isLoser = false,
  isNatural = false,
  handType = 'player'
}: BaccaratCardProps) {
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
      ${isWinner ? 'ring-2 ring-emerald-400' : ''}
      ${isLoser ? 'ring-2 ring-red-400 opacity-75' : ''}
      ${isNatural ? 'ring-2 ring-yellow-400' : ''}
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
        {isAce(card.rank) && (
          <div className="absolute bottom-1 left-1 text-xs bg-purple-500/20 px-1 rounded text-purple-300">
            A
          </div>
        )}
        
        {isZeroValue(card.rank) && (
          <div className="absolute bottom-1 right-1 text-xs bg-red-500/20 px-1 rounded text-red-300">
            0
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
  
  // Get hand-specific styling
  const getHandColor = () => {
    if (handType === 'player') {
      return 'border-blue-400'
    }
    return 'border-red-400'
  }
  
  return (
    <div
      className={`${getCardStyles()} ${getHandColor()}`}
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
      
      {/* Winner overlay */}
      {isWinner && (
        <div className="absolute inset-0 bg-emerald-500/20 rounded-lg flex items-center justify-center">
          <div className="text-emerald-500 text-2xl font-bold">â</div>
        </div>
      )}
      
      {/* Loser overlay */}
      {isLoser && (
        <div className="absolute inset-0 bg-red-500/20 rounded-lg flex items-center justify-center">
          <div className="text-red-500 text-2xl font-bold">â</div>
        </div>
      )}
      
      {/* Natural overlay */}
      {isNatural && (
        <div className="absolute inset-0 bg-yellow-500/20 rounded-lg flex items-center justify-center">
          <div className="text-yellow-500 text-2xl font-bold">â</div>
        </div>
      )}
    </div>
  )
}

// Component for displaying a hand of cards
export function BaccaratHand({
  cards,
  handType = 'player',
  isHidden = false,
  isRevealing = false,
  size = 'medium',
  showValues = false,
  isWinner = false,
  isLoser = false,
  isNatural = false
}: {
  cards: Card[]
  handType?: 'player' | 'banker'
  isHidden?: boolean
  isRevealing?: boolean
  size?: 'small' | 'medium' | 'large'
  showValues?: boolean
  isWinner?: boolean
  isLoser?: boolean
  isNatural?: boolean
}) {
  const getHandTotal = () => {
    if (cards.length === 0) return 0
    
    const sum = cards.reduce((total, card) => total + card.value, 0)
    return sum % 10 // Only the last digit matters in Baccarat
  }
  
  const handTotal = getHandTotal()
  
  return (
    <div className="space-y-2">
      {/* Cards */}
      <div className="flex gap-2 justify-center">
        {cards.map((card, index) => (
          <div key={card.id} className="relative">
            <BaccaratCard
              card={card}
              isHidden={isHidden && index === 1} // Hide second card by default
              isAnimating={isRevealing}
              size={size}
              showValue={showValues}
              isWinner={isWinner}
              isLoser={isLoser}
              isNatural={isNatural}
              handType={handType}
            />
          </div>
        ))}
      </div>
      
      {/* Hand value */}
      {showValues && cards.length > 0 && !isHidden && (
        <div className="text-center">
          <div className={`text-lg font-bold ${
            isWinner ? 'text-emerald-400' : 
            isLoser ? 'text-red-400' : 
            isNatural ? 'text-yellow-400' : 
            'text-white'
          }`}>
            {handTotal}
            {isNatural && ' (Natural)'}
          </div>
        </div>
      )}
    </div>
  )
}

// Mini card for history display
export function MiniBaccaratCard({
  card,
  isHidden = false,
  size = 'small',
  handType = 'player'
}: {
  card: Card | null
  isHidden?: boolean
  size?: 'small' | 'medium' | 'large'
  handType?: 'player' | 'banker'
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
  
  const getHandColor = () => {
    if (handType === 'player') {
      return 'border-blue-400'
    }
    return 'border-red-400'
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
      ${getHandColor()}
      ${isHidden ? 'bg-blue-800' : 'bg-white'}
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

// Shoe indicator component
export function ShoeIndicator({
  cardsRemaining,
  totalCards,
  gameNumber
}: {
  cardsRemaining: number
  totalCards: number
  gameNumber: number
}) {
  const penetration = ((totalCards - cardsRemaining) / totalCards) * 100
  
  return (
    <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
      <div className="text-center">
        <div className="text-sm font-medium text-white mb-2">Shoe #{gameNumber}</div>
        <div className="text-xs text-slate-400 mb-2">8-Deck Shoe</div>
        
        <div className="mb-3">
          <div className="text-xs text-slate-400 mb-1">Cards Remaining</div>
          <div className="text-lg font-bold text-white">
            {cardsRemaining}
          </div>
        </div>
        
        <div className="mb-3">
          <div className="text-xs text-slate-400 mb-1">Penetration</div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${penetration}%` }}
            ></div>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {penetration.toFixed(1)}%
          </div>
        </div>
        
        {penetration >= 85 && (
          <div className="text-xs text-orange-400">
            Reshuffle Soon
          </div>
        )}
      </div>
    </div>
  )
}

// Third card indicator
export function ThirdCardIndicator({
  hasThirdCard,
  isPlayer = true,
  cardValue
}: {
  hasThirdCard: boolean
  isPlayer?: boolean
  cardValue?: number
}) {
  if (!hasThirdCard) return null
  
  return (
    <div className="flex items-center gap-2 text-xs">
      <div className={`w-2 h-2 rounded-full ${
        isPlayer ? 'bg-blue-400' : 'bg-red-400'
      }`}></div>
      <span className="text-slate-400">
        {isPlayer ? 'Player' : 'Banker'} drew {cardValue !== undefined ? cardValue : 'third'}
      </span>
    </div>
  )
}

// Natural indicator
export function NaturalIndicator({
  isNatural,
  handType
}: {
  isNatural: boolean
  handType: 'player' | 'banker'
}) {
  if (!isNatural) return null
  
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-bold ${
      handType === 'player' 
        ? 'bg-blue-500/20 text-blue-400 border border-blue-400' 
        : 'bg-red-500/20 text-red-400 border border-red-400'
    }`}>
      <span>â</span>
      <span>NATURAL 8/9</span>
    </div>
  )
}
