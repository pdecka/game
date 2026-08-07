'use client'

import { useMemo } from 'react'
import TowerRow from './TowerRow'
import type { TowerBoard, Tile } from '@/utils/towerConfig'

interface TowerGridProps {
  board: TowerBoard | null
  currentStep: number
  onTileClick: (column: number) => void
  revealedTile?: Tile | null
  gameState: 'idle' | 'playing' | 'step_won' | 'lost' | 'cashed_out'
}

export default function TowerGrid({ 
  board, 
  currentStep, 
  onTileClick, 
  revealedTile,
  gameState
}: TowerGridProps) {
  const displayRows = useMemo(() => {
    if (!board) return []
    
    // Show all rows, but highlight the current one
    return board.rows.map((row, index) => ({
      ...row,
      isActive: index === currentStep && gameState === 'playing',
      isCompleted: index < currentStep || (gameState === 'lost' && index < currentStep),
      isCurrent: index === currentStep
    }))
  }, [board, currentStep, gameState])
  
  const getGridClasses = () => {
    let classes = 'space-y-3 transition-all duration-500'
    
    if (gameState === 'lost') {
      classes += ' opacity-75'
    } else if (gameState === 'cashed_out') {
      classes += ' opacity-90'
    }
    
    return classes
  }
  
  const getTowerHeader = () => {
    if (!board) return null
    
    const config = board.rows[0]?.tiles.length || 4
    const maxHeight = board.rows.length
    
    return (
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">Dragon Tower</h3>
        <div className="flex items-center justify-center gap-4 text-sm text-slate-400">
          <span>Height: {maxHeight} levels</span>
          <span>â¢</span>
          <span>Width: {config} tiles</span>
          <span>â¢</span>
          <span>Difficulty: <span className="capitalize text-white">{board.difficulty}</span></span>
        </div>
      </div>
    )
  }
  
  const getProgressIndicator = () => {
    if (!board) return null
    
    const progress = (currentStep / board.rows.length) * 100
    
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
          <span>Progress</span>
          <span>{currentStep} / {board.rows.length}</span>
        </div>
        <div className="w-full bg-[#1a2c38] rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              gameState === 'lost' ? 'bg-red-500' :
              gameState === 'cashed_out' ? 'bg-emerald-500' :
              'bg-blue-500'
            }`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    )
  }
  
  const getGameOverMessage = () => {
    if (gameState === 'lost') {
      return (
        <div className="text-center p-6 bg-red-500/20 border border-red-500/50 rounded-lg mb-6">
          <div className="text-3xl mb-2">ð¹</div>
          <h4 className="text-xl font-bold text-red-400 mb-2">Game Over!</h4>
          <p className="text-slate-300">You hit a monster! Better luck next time.</p>
        </div>
      )
    }
    
    if (gameState === 'cashed_out') {
      return (
        <div className="text-center p-6 bg-emerald-500/20 border border-emerald-500/50 rounded-lg mb-6">
          <div className="text-3xl mb-2">ð</div>
          <h4 className="text-xl font-bold text-emerald-400 mb-2">Cashed Out!</h4>
          <p className="text-slate-300">You successfully secured your winnings!</p>
        </div>
      )
    }
    
    return null
  }
  
  if (!board) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">ð</div>
        <h3 className="text-xl font-semibold text-white mb-2">Ready to Climb?</h3>
        <p className="text-slate-400">Start a game to begin your tower adventure!</p>
      </div>
    )
  }
  
  return (
    <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
      {getTowerHeader()}
      {getProgressIndicator()}
      {getGameOverMessage()}
      
      <div className={getGridClasses()}>
        {displayRows.map((row, index) => (
          <div
            key={row.id}
            className={`transition-all duration-300 ${
              row.isCurrent ? 'scale-105' : ''
            } ${index > currentStep + 1 ? 'opacity-30' : ''}`}
          >
            <TowerRow
              row={row}
              isActive={row.isActive}
              isCompleted={row.isCompleted}
              currentStep={currentStep}
              onTileClick={onTileClick}
              revealedTile={revealedTile}
              showPath={true}
            />
          </div>
        ))}
      </div>
      
      {/* Tower Legend */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center text-xs">ð¥</div>
            <span className="text-slate-400">Safe Egg</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center text-xs">ð¹</div>
            <span className="text-slate-400">Danger Monster</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center text-xs">â</div>
            <span className="text-slate-400">Your Path</span>
          </div>
        </div>
      </div>
    </div>
  )
}
