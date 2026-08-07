'use client'

import { useMemo } from 'react'
import ColorTile from './ColorTile'
import { GRID_LAYOUT, type RoundResult, type ColorBet } from '@/utils/colorConfig'

interface ColorGridProps {
  currentResult: RoundResult | null
  bets: ColorBet[]
  isRevealed: boolean
  isLocked: boolean
  onNumberClick: (number: any) => void
}

export default function ColorGrid({ 
  currentResult, 
  bets, 
  isRevealed, 
  isLocked, 
  onNumberClick 
}: ColorGridProps) {
  const getBetsForNumber = (number: any) => {
    return bets.filter(bet => bet.type === 'number' && bet.value === number).length
  }
  
  const isWinningNumber = (number: any) => {
    return !!(currentResult && currentResult.number === number)
  }
  
  const getGridClasses = () => {
    let classes = 'bg-[#0f212e] rounded-lg border border-white/10 p-6 transition-all duration-300'
    
    if (isRevealed && currentResult) {
      classes += ' ring-2 ring-yellow-400 ring-opacity-50'
    } else if (isLocked) {
      classes += ' opacity-75'
    }
    
    return classes
  }
  
  const getHeaderClasses = () => {
    let classes = 'text-center mb-6'
    
    if (!!isRevealed && currentResult) {
      classes += ' animate-pulse'
    }
    
    return classes
  }
  
  const getResultDisplay = () => {
    if (!currentResult || !isRevealed) return null
    
    const colorConfig = {
      red: { bgClass: 'bg-red-500', emoji: 'ð' },
      green: { bgClass: 'bg-green-500', emoji: 'ð' },
      purple: { bgClass: 'bg-purple-500', emoji: 'ð' }
    }[currentResult.color]
    
    return (
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#1a2c38] rounded-lg border border-white/20">
          <div className={`w-12 h-12 rounded-full ${colorConfig.bgClass} flex items-center justify-center text-2xl font-bold text-white`}>
            {currentResult.number}
          </div>
          <div className="text-left">
            <div className="text-white font-bold text-lg">{colorConfig.emoji} {currentResult.color}</div>
            <div className="text-slate-400 text-sm">Winning Number</div>
          </div>
        </div>
      </div>
    )
  }
  
  const getLegend = () => {
    return (
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-slate-400">Red (2x)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-slate-400">Green (2x)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-slate-400">Purple (5x)</span>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className={getGridClasses()}>
      <div className={getHeaderClasses()}>
        <h3 className="text-2xl font-bold text-white mb-2">Color Prediction Grid</h3>
        <p className="text-slate-400 text-sm">
          Click on numbers to place bets
        </p>
      </div>
      
      {/* Result Display */}
      {getResultDisplay()}
      
      {/* Grid */}
      <div className="space-y-4">
        {GRID_LAYOUT.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-5 gap-3">
            {row.map((number) => (
              <div
                key={number}
                className="relative"
              >
                <ColorTile
                  number={number}
                  isWinning={isWinningNumber(number)}
                  isRevealed={!!isRevealed}
                  isDisabled={isLocked || !!isRevealed}
                  onClick={() => onNumberClick(number)}
                  bets={getBetsForNumber(number)}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
      
      {/* Legend */}
      {getLegend()}
      
      {/* Grid Stats */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-red-400">4</div>
            <div className="text-xs text-slate-400">Red Numbers</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">4</div>
            <div className="text-xs text-slate-400">Green Numbers</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">2</div>
            <div className="text-xs text-slate-400">Purple Numbers</div>
          </div>
        </div>
      </div>
      
      {/* Payout Info */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="text-center">
          <h4 className="text-sm font-medium text-white mb-2">Payout Multipliers</h4>
          <div className="flex items-center justify-center gap-4 text-xs">
            <span className="text-red-400">Red/Green: 2x</span>
            <span className="text-purple-400">Purple: 5x</span>
            <span className="text-blue-400">Exact Number: 9x</span>
          </div>
        </div>
      </div>
    </div>
  )
}
