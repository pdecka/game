'use client'

import { useMemo } from 'react'
import SlotCell from './SlotCell'
import SlotsReel from './SlotsReel'
import { type SymbolType } from '@/utils/slotsConfig'

interface SlotsGridProps {
  grid: SymbolType[][]
  isSpinning: boolean
  winLines: any[]
  clusterWins: any[]
  winAnimationType: 'none' | 'normal' | 'big' | 'mega' | 'jackpot'
}

export default function SlotsGrid({ 
  grid, 
  isSpinning, 
  winLines, 
  clusterWins, 
  winAnimationType 
}: SlotsGridProps) {
  // Create winning positions for highlighting
  const winningPositions = useMemo(() => {
    const positions = new Set<string>()
    
    // Add payline winning positions
    winLines.forEach(line => {
      line.positions.forEach(([row, col]: [number, number]) => {
        positions.add(`${row}-${col}`)
      })
    })
    
    // Add cluster winning positions
    clusterWins.forEach(cluster => {
      cluster.positions.forEach(([row, col]: [number, number]) => {
        positions.add(`${row}-${col}`)
      })
    })
    
    return positions
  }, [winLines, clusterWins])
  
  // Check if a position is winning
  const isWinningPosition = (row: number, col: number) => {
    return winningPositions.has(`${row}-${col}`)
  }
  
  // Get animation classes based on win type
  const getGridAnimationClass = () => {
    switch (winAnimationType) {
      case 'jackpot':
        return 'animate-pulse ring-8 ring-yellow-400 ring-opacity-50'
      case 'mega':
        return 'animate-pulse ring-4 ring-purple-400 ring-opacity-50'
      case 'big':
        return 'animate-pulse ring-2 ring-blue-400 ring-opacity-50'
      case 'normal':
        return 'ring-1 ring-green-400 ring-opacity-30'
      default:
        return ''
    }
  }
  
  // Transpose grid for reel-based rendering (columns first)
  const reels = useMemo(() => {
    if (grid.length === 0) return []
    
    const transposed: SymbolType[][] = []
    for (let col = 0; col < (grid[0]?.length || 0); col++) {
      const reel: SymbolType[] = []
      for (let row = 0; row < grid.length; row++) {
        reel.push(grid[row][col])
      }
      transposed.push(reel)
    }
    return transposed
  }, [grid])
  
  return (
    <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
      <div className="text-center mb-4">
        <h2 className="text-lg font-semibold text-white">3x5 Slots Grid</h2>
        <div className="flex items-center justify-center gap-4 text-sm text-slate-400 mt-2">
          <span>5 Reels</span>
          <span>â¢</span>
          <span>15 Symbols</span>
          <span>â¢</span>
          <span>3 Paylines</span>
        </div>
      </div>
      
      {/* Grid Container */}
      <div className={`relative flex justify-center ${getGridAnimationClass()}`}>
        <div className="grid grid-cols-5 gap-3">
          {grid.length > 0 ? (
            // Render individual cells for precise control
            grid.map((row, rowIndex) =>
              row.map((symbol, colIndex) => (
                <SlotCell
                  key={`${rowIndex}-${colIndex}`}
                  symbol={symbol}
                  isSpinning={isSpinning}
                  isWinning={isWinningPosition(rowIndex, colIndex)}
                  isHighlighted={winAnimationType !== 'none' && isWinningPosition(rowIndex, colIndex)}
                  size="medium"
                />
              ))
            )
          ) : (
            // Empty state
            Array.from({ length: 15 }).map((_, index) => {
              const row = Math.floor(index / 5)
              const col = index % 5
              return (
                <div
                  key={`empty-${row}-${col}`}
                  className="w-16 h-16 rounded-lg border-2 border-dashed border-white/20 bg-[#1a2c38] flex items-center justify-center"
                >
                  <span className="text-white/30 text-2xl font-bold">?</span>
                </div>
              )
            })
          )}
        </div>
        
        {/* Win Animation Overlay */}
        {winAnimationType !== 'none' && (
          <div className="absolute inset-0 pointer-events-none">
            {winAnimationType === 'jackpot' && (
              <div className="flex items-center justify-center h-full">
                <div className="text-6xl font-bold text-yellow-400 animate-bounce">
                  JACKPOT!
                </div>
              </div>
            )}
            {winAnimationType === 'mega' && (
              <div className="flex items-center justify-center h-full">
                <div className="text-5xl font-bold text-purple-400 animate-pulse">
                  MEGA WIN!
                </div>
              </div>
            )}
            {winAnimationType === 'big' && (
              <div className="flex items-center justify-center h-full">
                <div className="text-4xl font-bold text-blue-400 animate-pulse">
                  BIG WIN!
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Winning Lines Display */}
      {winLines.length > 0 && (
        <div className="mt-6 p-4 bg-[#1a2c38] rounded-lg border border-white/10">
          <h3 className="text-sm font-semibold text-white mb-3">Winning Lines</h3>
          <div className="space-y-2">
            {winLines.map((line, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-slate-400">
                  Line {line.lineId} â¢ {line.symbol} ×{line.count}
                </span>
                <span className="text-emerald-400 font-medium">
                  {line.multiplier}x
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Cluster Wins Display */}
      {clusterWins.length > 0 && (
        <div className="mt-4 p-4 bg-[#1a2c38] rounded-lg border border-white/10">
          <h3 className="text-sm font-semibold text-white mb-3">Cluster Wins</h3>
          <div className="space-y-2">
            {clusterWins.map((cluster, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-slate-400">
                  {cluster.symbol} Cluster ×{cluster.count}
                </span>
                <span className="text-emerald-400 font-medium">
                  {cluster.multiplier}x
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Game State Indicator */}
      <div className="mt-4 text-center">
        {isSpinning && (
          <div className="text-sm text-yellow-400 animate-pulse">
            Spinning...
          </div>
        )}
        {!isSpinning && grid.length > 0 && winLines.length === 0 && clusterWins.length === 0 && (
          <div className="text-sm text-slate-400">
            No winning combinations
          </div>
        )}
      </div>
    </div>
  )
}
