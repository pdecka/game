'use client'

import { useState, useEffect } from 'react'
import type { Card } from '@/utils/andarBaharDeck'
import { 
  getCardDisplay, 
  getCardColor, 
  getCardBackground,
  getCardUnicode,
  isFaceCard,
  isAce,
  getRankValue
} from '@/utils/andarBaharDeck'

interface AndarBaharCardProps {
  card: Card | null
  isHidden: boolean
  isAnimating?: boolean
  animationDelay?: number
  size?: 'small' | 'medium' | 'large'
  showValue?: boolean
  isWinner?: boolean
  isLoser?: boolean
  side: 'andar' | 'bahar'
  position?: 'left' | 'right' | 'center'
  isJoker?: boolean
  isMatch?: boolean
}

export default function AndarBaharCard({
  card,
  isHidden,
  isAnimating = false,
  animationDelay = 0,
  size = 'medium',
  showValue = false,
  isWinner = false,
  isLoser = false,
  side = 'andar',
  position = 'left',
  isJoker = false,
  isMatch = false
}: AndarBaharCardProps) {
  const [isRevealed, setIsRevealed] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  
  // Handle reveal animation
  useEffect(() => {
    if (isAnimating && !isHidden && !isRevealed) {
      const timer = setTimeout(() => {
        setIsRevealed(true)
        setIsFlipped(true)
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
        return 'w-12 h-16 text-xs'
      case 'medium':
        return 'w-16 h-20 text-sm'
      case 'large':
        return 'w-20 h-24 text-base'
      default:
        return 'w-16 h-20 text-sm'
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
      shadow-xl
      ${isPressed ? 'scale-95' : 'hover:scale-105'}
      ${isWinner ? 'ring-4 ring-emerald-400 ring-opacity-50' : ''}
      ${isLoser ? 'ring-4 ring-red-400 ring-opacity-50' : ''}
      ${isMatch ? 'ring-4 ring-yellow-400 ring-opacity-75 animate-pulse' : ''}
      ${side === 'andar' ? 'border-purple-400' : 'border-orange-400'}
      ${isJoker ? 'ring-4 ring-yellow-400 ring-opacity-75' : ''}
    `
    
    if (isHidden) {
      return `${baseStyles} bg-gradient-to-br from-purple-800 to-purple-900 border-purple-700`
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
        <div className={`text-lg ${getCardColor(card)}`}>
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
        
        {isFaceCard(card.rank) && (
          <div className="absolute bottom-1 right-1 text-xs bg-orange-500/20 px-1 rounded text-orange-300">
            F
          </div>
        )}
        
        {/* Side indicator */}
        <div className={`absolute top-1 left-1 text-xs px-1 rounded ${
          side === 'andar' 
            ? 'bg-purple-500/20 text-purple-300' 
            : 'bg-orange-500/20 text-orange-300'
        }`}>
          {side === 'andar' ? 'ð' : 'ð'}
        </div>
        
        {/* Joker indicator */}
        {isJoker && (
          <div className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold animate-pulse">
            JOKER
          </div>
        )}
        
        {/* Match indicator */}
        {isMatch && (
          <div className="absolute inset-0 bg-yellow-500/20 rounded-lg flex items-center justify-center">
            <div className="text-yellow-500 text-2xl font-bold">â</div>
          </div>
        )}
      </div>
    )
  }
  
  const getCardBack = () => {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-purple-800 to-purple-900 rounded-lg border-2 border-purple-700 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">
          ?
        </div>
        {/* Card back pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-3 gap-1 p-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-white/10 rounded-full w-full aspect-square"></div>
            ))}
          </div>
        </div>
        
        {/* Side indicator on back */}
        <div className={`absolute top-1 left-1 text-xs px-1 rounded ${
          side === 'andar' 
            ? 'bg-purple-500/20 text-purple-300' 
            : 'bg-orange-500/20 text-orange-300'
        }`}>
          {side === 'andar' ? 'ð' : 'ð'}
        </div>
      </div>
    )
  }
  
  // Get side-specific styling
  const getSideColor = () => {
    if (side === 'andar') {
      return 'border-purple-400 shadow-purple-500/50'
    }
    return 'border-orange-400 shadow-orange-500/50'
  }
  
  return (
    <div
      className={`${getCardStyles()} ${getSideColor()} ${
        isFlipped ? 'animate-flip' : ''
      }`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={isHidden ? 'Hidden card' : card ? `Card ${card.rank} of ${card.suit}` : 'Empty card'}
      style={{
        animationDelay: `${animationDelay}ms`,
        transform: position === 'left' ? 'translateX(-5px)' : position === 'right' ? 'translateX(5px)' : 'translateX(0)'
      }}
    >
      {getCardContent()}
      
      {/* Card back overlay for hidden cards */}
      {isHidden && getCardBack()}
      
      {/* Shine effect */}
      {!isHidden && card && (
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent transform -translate-x-full hover:translate-x-full transition-transform duration-700"></div>
        </div>
      )}
      
      {/* Inner shadow for depth */}
      <div className="absolute inset-0 rounded-lg shadow-inner pointer-events-none"></div>
      
      {/* Winner overlay */}
      {isWinner && (
        <div className="absolute inset-0 bg-emerald-500/20 rounded-lg flex items-center justify-center">
          <div className="text-emerald-500 text-3xl font-bold animate-pulse">â</div>
        </div>
      )}
      
      {/* Loser overlay */}
      {isLoser && (
        <div className="absolute inset-0 bg-red-500/20 rounded-lg flex items-center justify-center">
          <div className="text-red-500 text-3xl font-bold">â</div>
        </div>
      )}
      
      {/* Flip animation styles */}
      <style jsx>{`
        @keyframes flip {
          0% {
            transform: rotateY(0deg) scale(1);
          }
          50% {
            transform: rotateY(90deg) scale(0.8);
          }
          100% {
            transform: rotateY(0deg) scale(1);
          }
        }
        
        .animate-flip {
          animation: flip 0.6s ease-in-out;
        }
      `}</style>
    </div>
  )
}

// Component for displaying a single card with side branding
export function AndarBaharCardWithLabel({
  card,
  isHidden,
  isAnimating,
  side,
  showValue = false,
  isWinner = false,
  isLoser = false,
  isJoker = false,
  isMatch = false
}: {
  card: Card | null
  isHidden: boolean
  isAnimating: boolean
  side: 'andar' | 'bahar'
  showValue?: boolean
  isWinner?: boolean
  isLoser?: boolean
  isJoker?: boolean
  isMatch?: boolean
}) {
  const getSideColor = () => {
    return side === 'andar' ? 'text-purple-400' : 'text-orange-400'
  }
  
  const getSideEmoji = () => {
    return side === 'andar' ? 'ð' : 'ð'
  }
  
  const getSideName = () => {
    return side === 'andar' ? 'ANDAR' : 'BAHAR'
  }
  
  return (
    <div className="flex flex-col items-center space-y-2">
      {/* Side Label */}
      <div className={`text-sm font-bold ${getSideColor()} flex items-center gap-2`}>
        <span className="text-lg">{getSideEmoji()}</span>
        <span>{getSideName()}</span>
      </div>
      
      {/* Card */}
      <AndarBaharCard
        card={card}
        isHidden={isHidden}
        isAnimating={isAnimating}
        animationDelay={side === 'bahar' ? 0 : 200}
        size="medium"
        showValue={showValue}
        isWinner={isWinner}
        isLoser={isLoser}
        side={side}
        position={side === 'bahar' ? 'right' : 'left'}
        isJoker={isJoker}
        isMatch={isMatch}
      />
      
      {/* Card Value */}
      {card && !isHidden && (
        <div className="text-center">
          <div className={`text-lg font-bold ${getSideColor()}`}>
            {card.rank}
          </div>
          <div className="text-xs text-slate-400">
            Value: {card.value}
          </div>
        </div>
      )}
    </div>
  )
}

// Mini card for history display
export function MiniAndarBaharCard({
  card,
  isHidden = false,
  side = 'andar',
  isJoker = false,
  isMatch = false
}: {
  card: Card | null
  isHidden?: boolean
  side?: 'andar' | 'bahar'
  isJoker?: boolean
  isMatch?: boolean
}) {
  const getSizeClasses = () => {
    return 'w-8 h-10 text-xs'
  }
  
  const getSideColor = () => {
    if (side === 'andar') {
      return 'border-purple-400'
    }
    return 'border-orange-400'
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
      ${getSideColor()}
      ${isHidden ? 'bg-purple-800' : 'bg-white'}
      ${isJoker ? 'ring-2 ring-yellow-400' : ''}
      ${isMatch ? 'ring-2 ring-green-400' : ''}
    `}>
      {isHidden ? (
        <div className="text-white text-sm">?</div>
      ) : card ? (
        <>
          <div className={`text-xs ${getCardColor(card)}`}>
            {card.rank}
          </div>
          <div className={`text-xs ${getCardColor(card)}`}>
            {card.symbol}
          </div>
        </>
      ) : (
        <div className="text-gray-400 text-sm">?</div>
      )}
    </div>
  )
}

// Card stack component for displaying multiple cards
export function AndarBaharCardStack({
  cards,
  side = 'andar',
  maxVisible = 3
}: {
  cards: Card[]
  side: 'andar' | 'bahar'
  maxVisible?: number
}) {
  const getSideColor = () => {
    return side === 'andar' ? 'border-purple-400' : 'border-orange-400'
  }
  
  const visibleCards = cards.slice(0, maxVisible)
  
  return (
    <div className="relative">
      {/* Stack effect */}
      {visibleCards.map((card, index) => (
        <div
          key={card.id}
          className={`
            absolute
            w-8 h-10
            rounded
            border
            bg-white
            ${getSideColor()}
            shadow-md
            transform
            transition-all
            duration-200
            flex
            items-center
            justify-center
          `}
          style={{
            top: `${index * 2}px`,
            left: `${index * 2}px`,
            zIndex: maxVisible - index
          }}
        >
          <div className={`text-xs ${getCardColor(card)}`}>
            {card.rank}
          </div>
          <div className={`text-xs ${getCardColor(card)}`}>
            {card.symbol}
          </div>
        </div>
      ))}
      
      {/* Card count indicator */}
      {cards.length > maxVisible && (
        <div className="absolute top-1 right-1 bg-black/50 text-white text-xs px-1 rounded">
          +{cards.length - maxVisible}
        </div>
      )}
    </div>
  )
}

// Joker card component for center display
export function JokerCard({
  card,
  isRevealed = false,
  isAnimating = false
}: {
  card: Card | null
  isRevealed?: boolean
  isAnimating?: boolean
}) {
  return (
    <div className="flex flex-col items-center space-y-2">
      {/* Joker Label */}
      <div className="text-sm font-bold text-yellow-400 flex items-center gap-2">
        <span className="text-lg">â</span>
        <span>JOKER</span>
      </div>
      
      {/* Joker Card */}
      <div className="relative">
        <AndarBaharCard
          card={card}
          isHidden={!isRevealed}
          isAnimating={isAnimating}
          size="large"
          position="center"
          isJoker={true}
          side="andar"
        />
        
        {/* Joker glow effect */}
        {isRevealed && card && (
          <div className="absolute inset-0 rounded-lg pointer-events-none">
            <div className="absolute inset-0 bg-yellow-500/20 rounded-lg animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/10 via-transparent to-transparent transform -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
          </div>
        )}
      </div>
      
      {/* Card value */}
      {card && isRevealed && (
        <div className="text-center">
          <div className="text-lg font-bold text-yellow-400">
            {card.rank}
          </div>
          <div className="text-xs text-slate-400">
            {card.symbol} ({card.value})
          </div>
        </div>
      )}
    </div>
  )
}

// Dealing sequence component
export function DealingSequence({
  sequence,
  currentIndex,
  winner,
  isAnimating
}: {
  sequence: Array<{ card: Card; side: 'andar' | 'bahar' }>
  currentIndex: number
  winner: 'andar' | 'bahar' | null
  isAnimating: boolean
}) {
  const getSideColor = (side: 'andar' | 'bahar') => {
    return side === 'andar' ? 'text-purple-400' : 'text-orange-400'
  }
  
  return (
    <div className="flex justify-center gap-4">
      {sequence.map((item, index) => {
        const isRevealed = index < currentIndex
        const isWinner = winner === item.side
        const isLoser = winner ? winner !== item.side : false
        const isMatch = index === currentIndex - 1 && winner === item.side
        
        return (
          <div key={`${item.card.id}-${index}`} className="flex flex-col items-center space-y-1">
            <AndarBaharCard
              card={item.card}
              isHidden={!isRevealed}
              isAnimating={isAnimating && isRevealed}
              animationDelay={index * 300}
              size="small"
              side={item.side}
              position={item.side === 'bahar' ? 'right' : 'left'}
              isWinner={isWinner}
              isLoser={isLoser}
              isMatch={isMatch}
            />
            
            {/* Side label */}
            <div className={`text-xs font-medium ${getSideColor(item.side)}`}>
              {item.side.toUpperCase()}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Card comparison component
export function CardComparison({
  jokerCard,
  dealtCard,
  isRevealing = false
}: {
  jokerCard: Card | null
  dealtCard: Card | null
  isRevealing?: boolean
}) {
  const isMatch = !!(jokerCard && dealtCard && 
    jokerCard.rank === dealtCard.rank && 
    jokerCard.suit === dealtCard.suit)
  
  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="text-sm text-slate-400">Card Comparison</div>
      <div className="flex items-center gap-4">
        {/* Joker */}
        <div className="flex flex-col items-center">
          <div className="text-xs text-yellow-400 mb-1">JOKER</div>
          <AndarBaharCard
            card={jokerCard}
            isHidden={false}
            size="small"
            side="andar"
            position="left"
            isJoker={true}
          />
        </div>
        
        {/* VS */}
        <div className="text-lg font-bold text-slate-400">VS</div>
        
        {/* Dealt Card */}
        <div className="flex flex-col items-center">
          <div className="text-xs text-slate-400 mb-1">Dealt</div>
          <AndarBaharCard
            card={dealtCard}
            isHidden={!isRevealing}
            isAnimating={isRevealing}
            size="small"
            side="bahar"
            position="right"
            isMatch={isMatch}
          />
        </div>
      </div>
      
      {/* Result */}
      {isRevealing && (
        <div className={`text-center mt-2 ${
          isMatch ? 'text-green-400 font-bold' : 'text-slate-400'
        }`}>
          {isMatch ? 'MATCH!' : 'No Match'}
        </div>
      )}
    </div>
  )
}
