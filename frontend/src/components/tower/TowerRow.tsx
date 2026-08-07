'use client'

import TowerTile from './TowerTile'
import type { TowerRow as TowerRowType, Tile } from '@/utils/towerConfig'

interface TowerRowProps {
  row: TowerRowType
  isActive: boolean
  isCompleted: boolean
  currentStep: number
  onTileClick: (column: number) => void
  revealedTile?: Tile | null
  showPath?: boolean
}

export default function TowerRow({ 
  row, 
  isActive, 
  isCompleted, 
  currentStep, 
  onTileClick, 
  revealedTile,
  showPath = false
}: TowerRowProps) {
  const getRowClasses = () => {
    let classes = 'flex gap-2 p-2 rounded-lg transition-all duration-300'
    
    if (isActive) {
      classes += ' bg-[#1a2c38] border-2 border-emerald-500 shadow-lg'
    } else if (isCompleted) {
      classes += ' bg-[#0f212e] border border-white/10'
    } else {
      classes += ' bg-[#0f212e] border border-white/5 opacity-50'
    }
    
    return classes
  }
  
  const getRowLabel = () => {
    if (isActive) {
      return (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
            {row.rowNumber + 1}
          </div>
          <span className="text-emerald-400 font-medium">Current Level</span>
        </div>
      )
    } else if (isCompleted) {
      return (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
            â
          </div>
          <span className="text-emerald-600 font-medium">Completed</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
            {row.rowNumber + 1}
          </div>
          <span className="text-gray-500">Level {row.rowNumber + 1}</span>
        </div>
      )
    }
  }
  
  const isTileRevealing = (tile: Tile) => {
    return revealedTile?.id === tile.id
  }
  
  const isTileClickable = (tile: Tile) => {
    return isActive && !tile.isRevealed && !isCompleted
  }
  
  return (
    <div className={getRowClasses()}>
      {/* Row Label */}
      <div className="flex items-center justify-center min-w-[120px]">
        {getRowLabel()}
      </div>
      
      {/* Tiles */}
      <div className="flex-1 flex gap-2 justify-center">
        {row.tiles.map((tile) => (
          <div
            key={tile.id}
            className="flex-1 max-w-[80px]"
          >
            <TowerTile
              tile={tile}
              isActive={isActive}
              isClickable={isTileClickable(tile)}
              onClick={() => onTileClick(tile.column)}
              isRevealing={isTileRevealing(tile)}
              showPath={showPath}
            />
          </div>
        ))}
      </div>
      
      {/* Row Status */}
      <div className="flex items-center justify-center min-w-[100px]">
        {isCompleted && (
          <div className="text-emerald-400 text-sm font-medium">
            Safe path taken
          </div>
        )}
        {isActive && (
          <div className="text-yellow-400 text-sm font-medium animate-pulse">
            Choose wisely
          </div>
        )}
        {!isActive && !isCompleted && (
          <div className="text-gray-500 text-sm">
            Waiting...
          </div>
        )}
      </div>
    </div>
  )
}
