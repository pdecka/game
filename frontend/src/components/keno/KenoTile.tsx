'use client'

import { useState, useEffect } from 'react'
import { getNumberStatus, getNumberStatusColor, getNumberStatusHoverColor } from '@/utils/kenoEngine'

interface KenoTileProps {
  number: number
  selectedNumbers: number[]
  drawnNumbers: number[]
  isDisabled: boolean
  isAnimating: boolean
  animationDelay: number
  onClick: (number: number) => void
}

export default function KenoTile({
  number,
  selectedNumbers,
  drawnNumbers,
  isDisabled,
  isAnimating,
  animationDelay,
  onClick
}: KenoTileProps) {
  const [isRevealed, setIsRevealed] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  
  const status = getNumberStatus(number, selectedNumbers, drawnNumbers)
  const statusColor = getNumberStatusColor(status)
  const hoverColor = getNumberStatusHoverColor(status)
  
  // Handle reveal animation during draw
  useEffect(() => {
    if (drawnNumbers.includes(number) && !isRevealed) {
      const timer = setTimeout(() => {
        setIsRevealed(true)
      }, animationDelay)
      
      return () => clearTimeout(timer)
    }
  }, [drawnNumbers, number, animationDelay, isRevealed])
  
  const handleClick = () => {
    if (!isDisabled && !isAnimating) {
      setIsPressed(true)
      setTimeout(() => setIsPressed(false), 150)
      onClick(number)
    }
  }
  
  const getTileStyles = () => {
    const baseStyles = `
      relative
      w-full
      aspect-square
      rounded-lg
      border-2
      font-bold
      text-lg
      transition-all
      duration-200
      transform-gpu
      cursor-pointer
      select-none
      flex
      items-center
      justify-center
      ${statusColor}
      ${hoverColor}
      ${isPressed ? 'scale-95' : 'hover:scale-105'}
      ${isDisabled ? 'cursor-not-allowed opacity-60' : ''}
    `
    
    // Animation styles
    if (isRevealed && status === 'drawn') {
      return `${baseStyles} animate-pulse ring-2 ring-red-400 ring-opacity-50`
    }
    
    if (isRevealed && status === 'match') {
      return `${baseStyles} animate-bounce ring-2 ring-emerald-400 ring-opacity-50`
    }
    
    if (isAnimating && status === 'selected') {
      return `${baseStyles} animate-pulse ring-2 ring-purple-400 ring-opacity-50`
    }
    
    return baseStyles
  }
  
  const getTileContent = () => {
    // Show number with appropriate styling
    return (
      <span className="relative z-10">
        {number}
      </span>
    )
  }
  
  const getTileOverlay = () => {
    // Add overlay effects for different states
    if (isRevealed && status === 'match') {
      return (
        <div className="absolute inset-0 bg-emerald-400 opacity-20 rounded-lg animate-pulse"></div>
      )
    }
    
    if (isRevealed && status === 'drawn') {
      return (
        <div className="absolute inset-0 bg-red-400 opacity-20 rounded-lg animate-pulse"></div>
      )
    }
    
    return null
  }
  
  const getTileBadge = () => {
    // Show badges for special states
    if (status === 'match') {
      return (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
          <span className="text-xs text-white">â</span>
        </div>
      )
    }
    
    if (status === 'drawn') {
      return (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-xs text-white">â</span>
        </div>
      )
    }
    
    return null
  }
  
  return (
    <div
      className={getTileStyles()}
      onClick={handleClick}
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      aria-label={`Keno tile number ${number}`}
      aria-pressed={status === 'selected'}
      aria-disabled={isDisabled}
    >
      {/* Tile content */}
      {getTileContent()}
      
      {/* Overlay effects */}
      {getTileOverlay()}
      
      {/* Badge indicator */}
      {getTileBadge()}
      
      {/* Inner shadow for depth */}
      <div className="absolute inset-0 rounded-lg shadow-inner"></div>
      
      {/* Number label for accessibility */}
      <div className="sr-only">
        Number {number}, Status: {status}
      </div>
    </div>
  )
}

// Special component for animated reveal
export function AnimatedKenoTile({
  number,
  selectedNumbers,
  drawnNumbers,
  isDisabled,
  isAnimating,
  animationDelay,
  onClick
}: KenoTileProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [scale, setScale] = useState(0)
  
  const status = getNumberStatus(number, selectedNumbers, drawnNumbers)
  const statusColor = getNumberStatusColor(status)
  const hoverColor = getNumberStatusHoverColor(status)
  
  // Handle entrance animation
  useEffect(() => {
    if (drawnNumbers.includes(number) && !isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(true)
        setScale(1)
      }, animationDelay)
      
      return () => clearTimeout(timer)
    }
  }, [drawnNumbers, number, animationDelay, isVisible])
  
  const handleClick = () => {
    if (!isDisabled && !isAnimating) {
      onClick(number)
    }
  }
  
  return (
    <div
      className={`
        relative
        w-full
        aspect-square
        rounded-lg
        border-2
        font-bold
        text-lg
        transition-all
        duration-300
        transform-gpu
        cursor-pointer
        select-none
        flex
        items-center
        justify-center
        ${statusColor}
        ${hoverColor}
        ${isDisabled ? 'cursor-not-allowed opacity-60' : ''}
      `}
      style={{
        transform: `scale(${scale})`,
        opacity: isVisible ? 1 : 0
      }}
      onClick={handleClick}
    >
      <span className="relative z-10">
        {number}
      </span>
      
      {/* Glow effect for matches */}
      {status === 'match' && isVisible && (
        <div className="absolute inset-0 bg-emerald-400 opacity-30 rounded-lg animate-pulse"></div>
      )}
      
      {/* Glow effect for drawn numbers */}
      {status === 'drawn' && isVisible && (
        <div className="absolute inset-0 bg-red-400 opacity-30 rounded-lg animate-pulse"></div>
      )}
      
      <div className="absolute inset-0 rounded-lg shadow-inner"></div>
    </div>
  )
}

// Mini tile for history display
export function MiniKenoTile({
  number,
  status,
  compact = false
}: {
  number: number
  status: 'unselected' | 'selected' | 'drawn' | 'match'
  compact?: boolean
}) {
  const statusColor = getNumberStatusColor(status)
  
  const getSizeClasses = () => {
    if (compact) {
      return 'w-6 h-6 text-xs'
    }
    return 'w-8 h-8 text-sm'
  }
  
  return (
    <div
      className={`
        ${getSizeClasses()}
        rounded
        border
        font-bold
        flex
        items-center
        justify-center
        ${statusColor}
      `}
    >
      {number}
    </div>
  )
}

// Tile for hot/cold numbers display
export function HotColdTile({
  number,
  isHot,
  count,
  compact = false
}: {
  number: number
  isHot: boolean
  count: number
  compact?: boolean
}) {
  const getSizeClasses = () => {
    if (compact) {
      return 'w-6 h-6 text-xs'
    }
    return 'w-8 h-8 text-sm'
  }
  
  const getColorClasses = () => {
    if (isHot) {
      return 'bg-orange-600 text-white border-orange-700'
    }
    return 'bg-blue-600 text-white border-blue-700'
  }
  
  const getIntensity = () => {
    // Higher count = more intense color
    if (count > 10) return 'opacity-100'
    if (count > 5) return 'opacity-80'
    return 'opacity-60'
  }
  
  return (
    <div
      className={`
        ${getSizeClasses()}
        ${getColorClasses()}
        rounded
        border
        font-bold
        flex
        items-center
        justify-center
        relative
        ${getIntensity()}
      `}
      title={`Number ${number}: ${isHot ? 'Hot' : 'Cold'} (${count} times)`}
    >
      {number}
      
      {/* Intensity indicator */}
      {!compact && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full opacity-60"></div>
      )}
    </div>
  )
}

// Tile for pattern selection
export function PatternTile({
  number,
  isInPattern,
  isSelected,
  onClick,
  compact = false
}: {
  number: number
  isInPattern: boolean
  isSelected: boolean
  onClick: (number: number) => void
  compact?: boolean
}) {
  const getSizeClasses = () => {
    if (compact) {
      return 'w-6 h-6 text-xs'
    }
    return 'w-8 h-8 text-sm'
  }
  
  const getColorClasses = () => {
    if (isSelected) {
      return 'bg-purple-600 text-white border-purple-700'
    }
    if (isInPattern) {
      return 'bg-purple-200 text-purple-800 border-purple-300'
    }
    return 'bg-slate-200 text-slate-600 border-slate-300'
  }
  
  return (
    <div
      className={`
        ${getSizeClasses()}
        ${getColorClasses()}
        rounded
        border
        font-bold
        flex
        items-center
        justify-center
        cursor-pointer
        transition-all
        duration-200
        hover:scale-105
      `}
      onClick={() => onClick(number)}
    >
      {number}
    </div>
  )
}
