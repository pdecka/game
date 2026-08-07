'use client'

import { getNumberColor, getColorEmoji, COLOR_CONFIG, type Number, type Color } from '@/utils/colorConfig'

interface ColorTileProps {
  number: Number
  isWinning: boolean
  isRevealed: boolean
  isDisabled: boolean
  onClick: () => void
  bets: number
}

export default function ColorTile({ 
  number, 
  isWinning, 
  isRevealed, 
  isDisabled, 
  onClick,
  bets
}: ColorTileProps) {
  const color = getNumberColor(number)
  const colorConfig = COLOR_CONFIG[color]
  
  const getTileClasses = () => {
    let classes = 'relative w-full h-full rounded-lg border-2 transition-all duration-300 flex flex-col items-center justify-center text-white font-bold cursor-pointer'
    
    if (isWinning && isRevealed) {
      classes += ` ${colorConfig.bgClass} ring-4 ring-yellow-400 ring-opacity-75 animate-pulse`
    } else if (isRevealed) {
      classes += ` ${colorConfig.bgClass} opacity-80`
    } else if (isDisabled) {
      classes += ' bg-[#1a2c38] border-white/20 opacity-50 cursor-not-allowed'
    } else {
      classes += ` ${colorConfig.bgClass} ${colorConfig.hoverClass} ${colorConfig.borderClass} hover:scale-105 shadow-lg`
    }
    
    return classes
  }
  
  const getTileContent = () => {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="text-2xl mb-1">{number}</div>
        <div className="text-xl">{colorConfig.emoji}</div>
      </div>
    )
  }
  
  const getBetChips = () => {
    if (bets === 0) return null
    
    return (
      <div className="absolute -top-2 -right-2 flex flex-col items-center">
        <div className="bg-yellow-500 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-yellow-600">
          {bets}
        </div>
        <div className="text-xs text-yellow-400 font-medium mt-1">
          {bets > 1 ? 'bets' : 'bet'}
        </div>
      </div>
    )
  }
  
  const getWinAnimation = () => {
    if (!isWinning || !isRevealed) return ''
    
    return 'animate-bounce'
  }
  
  const getRevealAnimation = () => {
    if (!isRevealed) return ''
    
    return 'animate-pulse'
  }
  
  return (
    <div
      className={getTileClasses()}
      onClick={!isDisabled ? onClick : undefined}
      style={{
        minHeight: '80px',
        aspectRatio: '1'
      }}
    >
      <div className={`transition-all duration-500 ${getWinAnimation()} ${getRevealAnimation()}`}>
        {getTileContent()}
      </div>
      
      {/* Bet chips */}
      {getBetChips()}
      
      {/* Hover effect */}
      {!isDisabled && !isRevealed && (
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
      )}
      
      {/* Selection indicator */}
      {!isDisabled && !isRevealed && (
        <div className="absolute -top-1 -left-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
      )}
      
      {/* Winning indicator */}
      {isWinning && isRevealed && (
        <div className="absolute inset-0 rounded-lg border-4 border-yellow-400 animate-pulse"></div>
      )}
    </div>
  )
}
