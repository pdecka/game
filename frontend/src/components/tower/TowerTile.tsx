'use client'

import { getTileEmoji, getTileColor, getRevealedTileColor, type Tile } from '@/utils/towerConfig'

interface TowerTileProps {
  tile: Tile
  isActive: boolean
  isClickable: boolean
  onClick: () => void
  isRevealing?: boolean
  showPath?: boolean
}

export default function TowerTile({ 
  tile, 
  isActive, 
  isClickable, 
  onClick, 
  isRevealing = false,
  showPath = false
}: TowerTileProps) {
  const getTileClasses = () => {
    let classes = 'relative w-full h-full rounded-lg border-2 transition-all duration-300 flex items-center justify-center text-2xl font-bold'
    
    if (tile.isRevealed) {
      classes += ` ${getRevealedTileColor(tile.type)}`
      if (tile.type === 'egg') {
        classes += ' animate-pulse ring-2 ring-emerald-400 ring-opacity-50'
      } else if (tile.type === 'monster') {
        classes += ' animate-bounce'
      }
    } else if (isActive && isClickable) {
      classes += ` ${getTileColor('egg')} hover:scale-105 cursor-pointer shadow-lg`
    } else if (isActive) {
      classes += ' bg-[#1a2c38] border-white/20 cursor-not-allowed opacity-60'
    } else {
      classes += ' bg-[#0f212e] border-white/10 opacity-40'
    }
    
    // Show path highlight
    if (showPath && tile.isSelected && tile.type === 'egg') {
      classes += ' ring-2 ring-emerald-400 ring-opacity-75'
    }
    
    return classes
  }
  
  const getTileContent = () => {
    if (tile.isRevealed) {
      return (
        <div className="flex flex-col items-center">
          <span className="text-3xl">{getTileEmoji(tile.type)}</span>
          {tile.type === 'egg' && (
            <span className="text-xs mt-1 font-medium">SAFE</span>
          )}
          {tile.type === 'monster' && (
            <span className="text-xs mt-1 font-medium">LOST!</span>
          )}
        </div>
      )
    }
    
    if (isActive && isClickable) {
      return (
        <div className="flex flex-col items-center">
          <span className="text-lg opacity-50">?</span>
          <span className="text-xs opacity-50">Click</span>
        </div>
      )
    }
    
    return <span className="text-lg opacity-30">?</span>
  }
  
  const getRevealAnimation = () => {
    if (!isRevealing) return ''
    
    if (tile.type === 'egg') {
      return 'animate-pulse'
    } else if (tile.type === 'monster') {
      return 'animate-bounce'
    }
    
    return ''
  }
  
  return (
    <div
      className={getTileClasses()}
      onClick={isClickable ? onClick : undefined}
      style={{
        minHeight: '60px',
        aspectRatio: '1'
      }}
    >
      <div className={`transition-all duration-500 ${getRevealAnimation()}`}>
        {getTileContent()}
      </div>
      
      {/* Selection indicator */}
      {tile.isSelected && !tile.isRevealed && (
        <div className="absolute inset-0 rounded-lg border-2 border-yellow-400 border-opacity-75 animate-pulse"></div>
      )}
      
      {/* Hover effect for clickable tiles */}
      {isActive && isClickable && !tile.isRevealed && (
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
      )}
    </div>
  )
}
