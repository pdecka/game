'use client'

import { useState, useEffect } from 'react'
import type { Card } from '@/utils/dragonTigerDeck'
import { 
  getCardDisplay, 
  getCardColor, 
  getCardBackground,
  getCardUnicode,
  isFaceCard,
  isAce,
  getRankValue
} from '@/utils/dragonTigerDeck'

interface DragonTigerCardProps {
  card: Card | null
  isHidden: boolean
  isAnimating?: boolean
  animationDelay?: number
  size?: 'small' | 'medium' | 'large'
  showValue?: boolean
  isWinner?: boolean
  isLoser?: boolean
  side: 'dragon' | 'tiger'
  position?: 'left' | 'right'
}

export default function DragonTigerCard({
  card,
  isHidden,
  isAnimating = false,
  animationDelay = 0,
  size = 'medium',
  showValue = false,
  isWinner = false,
  isLoser = false,
  side = 'dragon',
  position = 'left'
}: DragonTigerCardProps) {
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
        return 'w-16 h-20 text-sm'
      case 'medium':
        return 'w-20 h-24 text-base'
      case 'large':
        return 'w-24 h-28 text-lg'
      default:
        return 'w-20 h-24 text-base'
    }
  }
  
  const getCardStyles = () => {
    const baseStyles = `
      relative
      ${getSizeClasses()}
      rounded-xl
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
      ${side === 'dragon' ? 'border-blue-400' : 'border-red-400'}
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
        <div className="text-white text-3xl font-bold">
          ?
        </div>
      )
    }
    
    if (!card) {
      return (
        <div className="text-gray-400 text-3xl">
          ?
        </div>
      )
    }
    
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {/* Rank */}
        <div className={`text-3xl font-bold ${getCardColor(card)}`}>
          {card.rank}
        </div>
        
        {/* Suit */}
        <div className={`text-2xl ${getCardColor(card)}`}>
          {card.symbol}
        </div>
        
        {/* Value indicator */}
        {showValue && (
          <div className="absolute top-2 right-2 text-xs bg-black/20 px-2 py-1 rounded">
            {card.value}
          </div>
        )}
        
        {/* Special indicators */}
        {isAce(card.rank) && (
          <div className="absolute bottom-2 left-2 text-xs bg-purple-500/20 px-2 py-1 rounded text-purple-300">
            A
          </div>
        )}
        
        {isFaceCard(card.rank) && (
          <div className="absolute bottom-2 right-2 text-xs bg-orange-500/20 px-2 py-1 rounded text-orange-300">
            F
          </div>
        )}
        
        {/* Side indicator */}
        <div className={`absolute top-2 left-2 text-xs px-2 py-1 rounded ${
          side === 'dragon' 
            ? 'bg-blue-500/20 text-blue-300' 
            : 'bg-red-500/20 text-red-300'
        }`}>
          {side === 'dragon' ? 'ð' : 'ð'}
        </div>
      </div>
    )
  }
  
  const getCardBack = () => {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-purple-800 to-purple-900 rounded-xl border-2 border-purple-700 flex items-center justify-center">
        <div className="text-white text-4xl font-bold">
          ?
        </div>
        {/* Card back pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-4 gap-1 p-2">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="bg-white/10 rounded-full w-1 h-1"></div>
            ))}
          </div>
        </div>
        
        {/* Side indicator on back */}
        <div className={`absolute top-2 left-2 text-xs px-2 py-1 rounded ${
          side === 'dragon' 
            ? 'bg-blue-500/20 text-blue-300' 
            : 'bg-red-500/20 text-red-300'
        }`}>
          {side === 'dragon' ? 'ð' : 'ð'}
        </div>
      </div>
    )
  }
  
  // Get side-specific styling
  const getSideColor = () => {
    if (side === 'dragon') {
      return 'border-blue-400 shadow-blue-500/50'
    }
    return 'border-red-400 shadow-red-500/50'
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
        transform: position === 'left' ? 'translateX(-10px)' : 'translateX(10px)'
      }}
    >
      {getCardContent()}
      
      {/* Card back overlay for hidden cards */}
      {isHidden && getCardBack()}
      
      {/* Shine effect */}
      {!isHidden && card && (
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent transform -translate-x-full hover:translate-x-full transition-transform duration-700"></div>
        </div>
      )}
      
      {/* Inner shadow for depth */}
      <div className="absolute inset-0 rounded-xl shadow-inner pointer-events-none"></div>
      
      {/* Winner overlay */}
      {isWinner && (
        <div className="absolute inset-0 bg-emerald-500/20 rounded-xl flex items-center justify-center">
          <div className="text-emerald-500 text-4xl font-bold animate-pulse">â</div>
        </div>
      )}
      
      {/* Loser overlay */}
      {isLoser && (
        <div className="absolute inset-0 bg-red-500/20 rounded-xl flex items-center justify-center">
          <div className="text-red-500 text-4xl font-bold">â</div>
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
export function DragonTigerCardWithLabel({
  card,
  isHidden,
  isAnimating,
  side,
  showValue = false,
  isWinner = false,
  isLoser = false
}: {
  card: Card | null
  isHidden: boolean
  isAnimating: boolean
  side: 'dragon' | 'tiger'
  showValue?: boolean
  isWinner?: boolean
  isLoser?: boolean
}) {
  const getSideColor = () => {
    return side === 'dragon' ? 'text-blue-400' : 'text-red-400'
  }
  
  const getSideEmoji = () => {
    return side === 'dragon' ? 'ð' : 'ð'
  }
  
  const getSideName = () => {
    return side === 'dragon' ? 'DRAGON' : 'TIGER'
  }
  
  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Side Label */}
      <div className={`text-sm font-bold ${getSideColor()} flex items-center gap-2`}>
        <span className="text-xl">{getSideEmoji()}</span>
        <span>{getSideName()}</span>
      </div>
      
      {/* Card */}
      <DragonTigerCard
        card={card}
        isHidden={isHidden}
        isAnimating={isAnimating}
        animationDelay={side === 'dragon' ? 0 : 200}
        size="large"
        showValue={showValue}
        isWinner={isWinner}
        isLoser={isLoser}
        side={side}
        position={side === 'dragon' ? 'left' : 'right'}
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
export function MiniDragonTigerCard({
  card,
  isHidden = false,
  side = 'dragon'
}: {
  card: Card | null
  isHidden?: boolean
  side?: 'dragon' | 'tiger'
}) {
  const getSizeClasses = () => {
    return 'w-10 h-12 text-xs'
  }
  
  const getSideColor = () => {
    if (side === 'dragon') {
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
      ${getSideColor()}
      ${isHidden ? 'bg-purple-800' : 'bg-white'}
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

// Card comparison component
export function CardComparison({
  dragonCard,
  tigerCard,
  winner,
  isRevealing = false
}: {
  dragonCard: Card | null
  tigerCard: Card | null
  winner: 'dragon' | 'tiger' | 'tie'
  isRevealing?: boolean
}) {
  const getComparisonResult = () => {
    if (!dragonCard || !tigerCard) return null
    
    if (winner === 'tie') {
      return {
        text: 'TIE!',
        color: 'text-green-400',
        emoji: 'ð'
      }
    }
    
    const winnerCard = winner === 'dragon' ? dragonCard : tigerCard
    const loserCard = winner === 'dragon' ? tigerCard : dragonCard
    
    return {
      text: `${winner.toUpperCase()} WINS!`,
      color: winner === 'dragon' ? 'text-blue-400' : 'text-red-400',
      emoji: winner === 'dragon' ? 'ð' : 'ð',
      description: `${winnerCard.rank} (${winnerCard.value}) beats ${loserCard.rank} (${loserCard.value})`
    }
  }
  
  const comparison = getComparisonResult()
  
  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Cards */}
      <div className="flex items-center gap-8">
        <DragonTigerCard
          card={dragonCard}
          isHidden={!isRevealing}
          isAnimating={isRevealing}
          side="dragon"
          isWinner={winner === 'dragon'}
          isLoser={winner === 'tiger'}
        />
        
        {/* VS indicator */}
        <div className="text-2xl font-bold text-slate-400">
          VS
        </div>
        
        <DragonTigerCard
          card={tigerCard}
          isHidden={!isRevealing}
          isAnimating={isRevealing}
          side="tiger"
          isWinner={winner === 'tiger'}
          isLoser={winner === 'dragon'}
        />
      </div>
      
      {/* Result */}
      {comparison && isRevealing && (
        <div className="text-center space-y-2">
          <div className={`text-3xl font-bold ${comparison.color} flex items-center gap-2`}>
            <span className="text-4xl">{comparison.emoji}</span>
            <span>{comparison.text}</span>
          </div>
          <div className="text-sm text-slate-400">
            {comparison.description}
          </div>
        </div>
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
        return 'w-16 h-20'
      case 'medium':
        return 'w-20 h-24'
      case 'large':
        return 'w-24 h-28'
      default:
        return 'w-20 h-24'
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
            rounded-xl
            border-2
            bg-gradient-to-br from-purple-800 to-purple-900
            border-purple-700
            shadow-xl
            transform
            transition-all
            duration-200
          `}
          style={{
            top: `${index * 3}px`,
            left: `${index * 3}px`,
            zIndex: 5 - index
          }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white text-sm font-bold">
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

// Result indicator component
export function ResultIndicator({
  winner,
  dragonCard,
  tigerCard,
  isRevealing = false
}: {
  winner: 'dragon' | 'tiger' | 'tie'
  dragonCard: Card | null
  tigerCard: Card | null
  isRevealing?: boolean
}) {
  const getResultColor = () => {
    switch (winner) {
      case 'dragon': return 'text-blue-400'
      case 'tiger': return 'text-red-400'
      case 'tie': return 'text-green-400'
      default: return 'text-slate-400'
    }
  }
  
  const getResultEmoji = () => {
    switch (winner) {
      case 'dragon': return 'ð'
      case 'tiger': return 'ð'
      case 'tie': return 'ð'
      default: return 'â'
    }
  }
  
  const getResultText = () => {
    switch (winner) {
      case 'dragon': return 'DRAGON WINS'
      case 'tiger': return 'TIGER WINS'
      case 'tie': return 'TIE'
      default: return 'UNKNOWN'
    }
  }
  
  if (!isRevealing) return null
  
  return (
    <div className="text-center space-y-2">
      <div className={`text-4xl font-bold ${getResultColor()} flex items-center justify-center gap-3`}>
        <span className="text-5xl">{getResultEmoji()}</span>
        <span>{getResultText()}</span>
      </div>
      
      {dragonCard && tigerCard && (
        <div className="text-sm text-slate-400">
          Dragon {dragonCard.rank} ({dragonCard.value}) vs Tiger {tigerCard.rank} ({tigerCard.value})
        </div>
      )}
    </div>
  )
}
