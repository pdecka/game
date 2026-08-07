'use client'

import { useState, useEffect } from 'react'
import type { Player } from '@/utils/ticTacToeEngine'

interface TicTacToeCellProps {
  position: number
  value: Player
  isWinning: boolean
  isAvailable: boolean
  isUserTurn: boolean
  isAIThinking: boolean
  onMove: (position: number) => void
  disabled?: boolean
  showHints?: boolean
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export default function TicTacToeCell({
  position,
  value,
  isWinning,
  isAvailable,
  isUserTurn,
  isAIThinking,
  onMove,
  disabled = false,
  showHints = true,
  size = 'medium',
  className = ''
}: TicTacToeCellProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-16 h-16 text-2xl'
      case 'medium':
        return 'w-20 h-20 text-3xl'
      case 'large':
        return 'w-24 h-24 text-4xl'
      default:
        return 'w-20 h-20 text-3xl'
    }
  }
  
  const getSymbolInfo = (symbol: Player) => {
    switch (symbol) {
      case 'X':
        return {
          emoji: 'â',
          color: 'text-red-400',
          bgColor: 'bg-red-600/20',
          borderColor: 'border-red-400/50'
        }
      case 'O':
        return {
          emoji: 'ð',
          color: 'text-emerald-400',
          bgColor: 'bg-emerald-600/20',
          borderColor: 'border-emerald-400/50'
        }
      default:
        return {
          emoji: '',
          color: '',
          bgColor: '',
          borderColor: ''
        }
    }
  }
  
  const symbolInfo = getSymbolInfo(value)
  const canClick = isAvailable && isUserTurn && !isAIThinking && !disabled
  
  const handleClick = () => {
    if (canClick) {
      setIsPressed(true)
      setTimeout(() => setIsPressed(false), 150)
      onMove(position)
    }
  }
  
  const handleMouseEnter = () => {
    if (canClick) {
      setIsHovered(true)
    }
  }
  
  const handleMouseLeave = () => {
    setIsHovered(false)
  }
  
  const getCellClasses = () => {
    const baseClasses = `
      ${getSizeClasses()}
      relative flex items-center justify-center
      border-2 rounded-lg
      transition-all duration-200
      cursor-pointer
      select-none
      ${className}
    `
    
    if (value) {
      // Cell has a symbol
      return `
        ${baseClasses}
        ${symbolInfo.bgColor}
        ${symbolInfo.borderColor}
        ${isWinning ? 'ring-2 ring-yellow-400 ring-opacity-50 bg-yellow-600/20' : ''}
        ${isWinning ? 'animate-pulse' : ''}
      `
    }
    
    if (canClick) {
      // Cell is clickable
      return `
        ${baseClasses}
        bg-[#1a2c38]
        border-white/20
        hover:bg-[#2a3c48]
        hover:border-emerald-400/50
        hover:scale-105
        ${isHovered ? 'bg-[#2a3c48] border-emerald-400/50' : ''}
        ${isPressed ? 'scale-95 bg-emerald-600/20' : ''}
        ${showHints ? 'hover:shadow-lg hover:shadow-emerald-500/20' : ''}
      `
    }
    
    // Cell is not clickable
    return `
      ${baseClasses}
      bg-[#0f212e]
      border-white/10
      cursor-not-allowed
      opacity-60
    `
  }
  
  const getSymbolClasses = () => {
    if (!value) return ''
    
    let classes = `
      ${symbolInfo.color}
      font-bold
      transition-all duration-300
      transform
    `
    
    if (value === 'X') {
      classes += ' rotate-0'
    } else if (value === 'O') {
      classes += ' scale-100'
    }
    
    if (isWinning) {
      classes += ' scale-110 drop-shadow-lg'
    }
    
    return classes
  }
  
  const getHintOverlay = () => {
    if (!showHints || !canClick || isHovered) return null
    
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-2 h-2 bg-emerald-400 rounded-full opacity-30 animate-pulse"></div>
      </div>
    )
  }
  
  const getHoverPreview = () => {
    if (!isHovered || !canClick || value) return null
    
    const previewSymbol = isUserTurn ? 'X' : 'O'
    const previewInfo = getSymbolInfo(previewSymbol as Player)
    
    return (
      <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${previewInfo.color} opacity-30`}>
        <div className="text-2xl font-bold">{previewInfo.emoji}</div>
      </div>
    )
  }
  
  return (
    <div
      data-position={position}
      className={getCellClasses()}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && canClick) {
          e.preventDefault()
          handleClick()
        }
      }}
      role="button"
      tabIndex={canClick ? 0 : -1}
      aria-label={`Cell ${position + 1}${value ? ` with ${value === 'X' ? 'cross' : 'circle'}` : ''}`}
      aria-disabled={!canClick}
    >
      {/* Hint overlay */}
      {getHintOverlay()}
      
      {/* Hover preview */}
      {getHoverPreview()}
      
      {/* Symbol */}
      {value && (
        <div className={getSymbolClasses()}>
          <div className="relative">
            <div className="text-4xl font-bold">{symbolInfo.emoji}</div>
            
            {/* Winning glow effect */}
            {isWinning && (
              <div className="absolute inset-0 blur-xl opacity-50">
                <div className="text-4xl font-bold">{symbolInfo.emoji}</div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Cell number for accessibility */}
      {!value && (
        <div className="absolute top-1 left-1 text-xs text-white/20 font-mono">
          {position + 1}
        </div>
      )}
      
      {/* Loading indicator for AI thinking */}
      {isAIThinking && canClick && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Focus indicator */}
      <div className="absolute inset-0 rounded-lg ring-2 ring-transparent focus-within:ring-emerald-400 focus-within:ring-opacity-50 pointer-events-none"></div>
    </div>
  )
}

// Mini cell for history display
export function MiniTicTacToeCell({
  value,
  isWinning = false,
  size = 40
}: {
  value: Player
  isWinning?: boolean
  size?: number
}) {
  const getSymbolInfo = (symbol: Player) => {
    switch (symbol) {
      case 'X':
        return {
          emoji: 'â',
          color: 'text-red-400'
        }
      case 'O':
        return {
          emoji: 'ð',
          color: 'text-emerald-400'
        }
      default:
        return {
          emoji: '',
          color: 'text-slate-400'
        }
    }
  }
  
  const symbolInfo = getSymbolInfo(value)
  
  return (
    <div
      className={`
        relative flex items-center justify-center
        border rounded
        ${isWinning ? 'border-yellow-400 bg-yellow-600/20' : 'border-white/20 bg-[#1a2c38]'}
      `}
      style={{ width: size, height: size }}
    >
      {value && (
        <div className={`${symbolInfo.color} font-bold`} style={{ fontSize: size * 0.4 }}>
          {symbolInfo.emoji}
        </div>
      )}
      
      {!value && (
        <div className="text-white/10 text-xs">-</div>
      )}
    </div>
  )
}

// Cell for game preview
export function PreviewTicTacToeCell({
  value,
  position,
  isHighlighted = false
}: {
  value: Player
  position: number
  isHighlighted?: boolean
}) {
  const getSymbolInfo = (symbol: Player) => {
    switch (symbol) {
      case 'X':
        return {
          emoji: 'â',
          color: 'text-red-400'
        }
      case 'O':
        return {
          emoji: 'ð',
          color: 'text-emerald-400'
        }
      default:
        return {
          emoji: '',
          color: 'text-slate-400'
        }
    }
  }
  
  const symbolInfo = getSymbolInfo(value)
  
  return (
    <div
      className={`
        relative flex items-center justify-center
        w-8 h-8 border rounded
        ${isHighlighted ? 'border-emerald-400 bg-emerald-600/20' : 'border-white/10 bg-[#0f212e]'}
        transition-all duration-200
      `}
    >
      {value && (
        <div className={`${symbolInfo.color} text-sm font-bold`}>
          {symbolInfo.emoji}
        </div>
      )}
      
      {!value && (
        <div className="text-white/5 text-xs">{position + 1}</div>
      )}
    </div>
  )
}

// Animated cell for win effect
export function AnimatedTicTacToeCell({
  value,
  isWinning,
  delay = 0
}: {
  value: Player
  isWinning: boolean
  delay?: number
}) {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)
    
    return () => clearTimeout(timer)
  }, [delay])
  
  const getSymbolInfo = (symbol: Player) => {
    switch (symbol) {
      case 'X':
        return {
          emoji: 'â',
          color: 'text-red-400'
        }
      case 'O':
        return {
          emoji: 'ð',
          color: 'text-emerald-400'
        }
      default:
        return {
          emoji: '',
          color: 'text-slate-400'
        }
    }
  }
  
  const symbolInfo = getSymbolInfo(value)
  
  return (
    <div
      className={`
        relative flex items-center justify-center
        w-12 h-12 border-2 rounded-lg
        ${isWinning ? 'border-yellow-400 bg-yellow-600/20' : 'border-white/20 bg-[#1a2c38]'}
        transition-all duration-500
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
      `}
    >
      {value && (
        <div className={`
          ${symbolInfo.color} text-2xl font-bold
          transition-all duration-300
          ${isVisible ? 'scale-100' : 'scale-0'}
          ${isWinning ? 'animate-pulse' : ''}
        `}>
          {symbolInfo.emoji}
        </div>
      )}
      
      {isWinning && (
        <div className="absolute inset-0 rounded-lg bg-yellow-400/20 animate-ping"></div>
      )}
    </div>
  )
}
