'use client'

import { useState } from 'react'
import { Diamond, Bomb } from 'lucide-react'

interface MinesGridProps {
  gameState: 'idle' | 'playing' | 'lost' | 'cashed_out'
  revealedTiles: boolean[]
  minePositions: boolean[]
  onTileClick: (index: number) => void
  disabled: boolean
}

export default function MinesGrid({ 
  gameState, 
  revealedTiles, 
  minePositions, 
  onTileClick, 
  disabled 
}: MinesGridProps) {
  const getTileContent = (index: number) => {
    if (!revealedTiles[index]) {
      return (
        <div className="w-full h-full bg-[#1a2c38] hover:bg-[#2a3c48] border-2 border-[#2a3c48] rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center">
          <span className="text-[10px] text-slate-500"></span>
        </div>
      )
    }

    if (minePositions[index]) {
      return (
        <div className="w-full h-full border-2 border-red-500 rounded-lg flex items-center justify-center overflow-hidden bg-red-500/10">
          <img 
            src="/games/mine.jpeg" 
            alt="Mine" 
            className="w-full h-full object-cover"
          />
        </div>
      )
    }

    return (
      <div className="w-full h-full border-2 border-emerald-500 rounded-lg flex items-center justify-center overflow-hidden bg-emerald-500/10">
        <img 
          src="/games/diamond.jpeg" 
          alt="Diamond" 
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  const getTileClass = (index: number) => {
    if (disabled && !revealedTiles[index]) return 'cursor-not-allowed opacity-50'
    if (revealedTiles[index]) return 'cursor-default'
    return 'cursor-pointer hover:scale-105'
  }

  return (
    <div className="grid grid-cols-5 gap-3 p-3 bg-[#0f212e] rounded-lg border border-white/10 max-w-xl mx-auto">
      {Array.from({ length: 25 }, (_, index) => (
        <button
          key={index}
          onClick={() => onTileClick(index)}
          disabled={disabled || revealedTiles[index] || gameState !== 'playing'}
          className={`
            aspect-square rounded-lg transition-all duration-200 text-sm
            ${getTileClass(index)}
          `}
        >
          {getTileContent(index)}
        </button>
      ))}
    </div>
  )
}
