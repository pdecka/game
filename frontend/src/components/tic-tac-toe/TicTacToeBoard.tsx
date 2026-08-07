'use client'

import { useState, useEffect } from 'react'
import TicTacToeCell, { MiniTicTacToeCell, AnimatedTicTacToeCell } from './TicTacToeCell'
import type { Player, Board } from '@/utils/ticTacToeEngine'

interface TicTacToeBoardProps {
  board: Board
  currentPlayer: Player
  winningLine: number[] | null
  isUserTurn: boolean
  isAIThinking: boolean
  onMove: (position: number) => void
  disabled?: boolean
  showHints?: boolean
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export default function TicTacToeBoard({
  board,
  currentPlayer,
  winningLine,
  isUserTurn,
  isAIThinking,
  onMove,
  disabled = false,
  showHints = true,
  size = 'medium',
  className = ''
}: TicTacToeBoardProps) {
  const [focusedCell, setFocusedCell] = useState<number | null>(null)
  
  const getBoardSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'gap-2 p-4'
      case 'medium':
        return 'gap-3 p-6'
      case 'large':
        return 'gap-4 p-8'
      default:
        return 'gap-3 p-6'
    }
  }
  
  const getCellSize = () => {
    switch (size) {
      case 'small':
        return 'small'
      case 'medium':
        return 'medium'
      case 'large':
        return 'large'
      default:
        return 'medium'
    }
  }
  
  const isWinningCell = (position: number) => {
    return winningLine ? winningLine.includes(position) : false
  }
  
  const isAvailableCell = (position: number) => {
    return board[position] === null
  }
  
  const handleCellFocus = (position: number) => {
    setFocusedCell(position)
  }
  
  const handleCellBlur = () => {
    setFocusedCell(null)
  }
  
  const getBoardClasses = () => {
    const baseClasses = `
      bg-[#0f212e] rounded-xl border border-white/10
      grid grid-cols-3
      ${getBoardSizeClasses()}
      ${className}
    `
    
    if (isAIThinking) {
      return `${baseClasses} opacity-90`
    }
    
    return baseClasses
  }
  
  return (
    <div className={getBoardClasses()}>
      {board.map((cell, position) => (
        <TicTacToeCell
          key={position}
          position={position}
          value={cell}
          isWinning={isWinningCell(position)}
          isAvailable={isAvailableCell(position)}
          isUserTurn={isUserTurn}
          isAIThinking={isAIThinking}
          onMove={onMove}
          disabled={disabled}
          showHints={showHints}
          size={getCellSize()}
                    className={focusedCell === position ? 'ring-2 ring-emerald-400 ring-opacity-50' : ''}
        />
      ))}
      
      {/* Board status indicator */}
      <div className="absolute top-2 right-2 flex items-center gap-2">
        {isAIThinking && (
          <div className="flex items-center gap-2 px-2 py-1 bg-blue-600/20 rounded-lg border border-blue-400/50">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-blue-400">AI Thinking</span>
          </div>
        )}
        
        {isUserTurn && !isAIThinking && (
          <div className="flex items-center gap-2 px-2 py-1 bg-emerald-600/20 rounded-lg border border-emerald-400/50">
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            <span className="text-xs text-emerald-400">Your Turn</span>
          </div>
        )}
      </div>
    </div>
  )
}

// Mini board for history display
export function MiniTicTacToeBoard({
  board,
  winningLine = null,
  result = null
}: {
  board: Board
  winningLine: number[] | null
  result: 'win' | 'lose' | 'tie' | null
}) {
  const getBoardClasses = () => {
    if (result === 'win') {
      return 'bg-emerald-900/20 border-emerald-400/50'
    } else if (result === 'lose') {
      return 'bg-red-900/20 border-red-400/50'
    } else if (result === 'tie') {
      return 'bg-yellow-900/20 border-yellow-400/50'
    }
    return 'bg-[#1a2c38] border-white/20'
  }
  
  const isWinningCell = (position: number) => {
    return winningLine ? winningLine.includes(position) : false
  }
  
  return (
    <div className={`
      grid grid-cols-3 gap-1 p-2 rounded border
      ${getBoardClasses()}
    `}>
      {board.map((cell, position) => (
        <MiniTicTacToeCell
          key={position}
          value={cell}
          isWinning={isWinningCell(position)}
          size={24}
        />
      ))}
    </div>
  )
}

// Animated board for win celebration
export function AnimatedTicTacToeBoard({
  board,
  winningLine,
  result
}: {
  board: Board
  winningLine: number[] | null
  result: 'win' | 'lose' | 'tie'
}) {
  const [showAnimation, setShowAnimation] = useState(false)
  
  useEffect(() => {
    setShowAnimation(true)
  }, [])
  
  const getResultColor = () => {
    switch (result) {
      case 'win':
        return 'bg-emerald-600/20 border-emerald-400/50'
      case 'lose':
        return 'bg-red-600/20 border-red-400/50'
      case 'tie':
        return 'bg-yellow-600/20 border-yellow-400/50'
      default:
        return 'bg-[#1a2c38] border-white/20'
    }
  }
  
  const isWinningCell = (position: number) => {
    return winningLine ? winningLine.includes(position) : false
  }
  
  return (
    <div className={`
      grid grid-cols-3 gap-2 p-4 rounded-xl border-2
      ${getResultColor()}
      ${showAnimation ? 'animate-bounce' : ''}
    `}>
      {board.map((cell, position) => (
        <AnimatedTicTacToeCell
          key={position}
          value={cell}
          isWinning={isWinningCell(position)}
          delay={position * 100}
        />
      ))}
    </div>
  )
}

// Board preview for game selection
export function PreviewTicTacToeBoard({
  userSymbol = 'X',
  difficulty = 'medium'
}: {
  userSymbol?: Player
  difficulty?: string
}) {
  const previewBoard: Board = [
    userSymbol,
    null,
    userSymbol === 'X' ? 'O' : 'X',
    null,
    userSymbol === 'X' ? 'O' : 'X',
    null,
    userSymbol === 'X' ? 'O' : 'X',
    null,
    userSymbol
  ]
  
  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'easy':
        return 'border-emerald-400/50 bg-emerald-900/10'
      case 'medium':
        return 'border-blue-400/50 bg-blue-900/10'
      case 'hard':
        return 'border-red-400/50 bg-red-900/10'
      case 'house':
        return 'border-purple-400/50 bg-purple-900/10'
      default:
        return 'border-white/20 bg-[#0f212e]'
    }
  }
  
  return (
    <div className={`
      grid grid-cols-3 gap-1 p-3 rounded-lg border-2
      ${getDifficultyColor()}
    `}>
      {previewBoard.map((cell, position) => (
        <div
          key={position}
          className={`
            relative flex items-center justify-center
            w-10 h-10 border rounded
            ${cell ? 'border-white/30 bg-[#1a2c38]' : 'border-white/10 bg-[#0f212e]'}
          `}
        >
          {cell === 'X' && (
            <div className="text-red-400 text-sm font-bold">â</div>
          )}
          {cell === 'O' && (
            <div className="text-emerald-400 text-sm font-bold">ð</div>
          )}
          {!cell && (
            <div className="text-white/5 text-xs">{position + 1}</div>
          )}
        </div>
      ))}
    </div>
  )
}

// Board with winning line highlight
export function HighlightedTicTacToeBoard({
  board,
  winningLine,
  onMove,
  disabled = false
}: {
  board: Board
  winningLine: number[] | null
  onMove: (position: number) => void
  disabled?: boolean
}) {
  const getLineClasses = (position: number) => {
    if (!winningLine || !winningLine.includes(position)) {
      return ''
    }
    
    // Determine line direction for special effects
    if (winningLine.includes(0) && winningLine.includes(1) && winningLine.includes(2)) {
      return 'border-t-4 border-t-yellow-400' // Top row
    }
    if (winningLine.includes(3) && winningLine.includes(4) && winningLine.includes(5)) {
      return 'border-b-4 border-b-yellow-400' // Middle row
    }
    if (winningLine.includes(6) && winningLine.includes(7) && winningLine.includes(8)) {
      return 'border-b-4 border-b-yellow-400' // Bottom row
    }
    if (winningLine.includes(0) && winningLine.includes(3) && winningLine.includes(6)) {
      return 'border-l-4 border-l-yellow-400' // Left column
    }
    if (winningLine.includes(1) && winningLine.includes(4) && winningLine.includes(7)) {
      return 'border-r-4 border-r-yellow-400' // Middle column
    }
    if (winningLine.includes(2) && winningLine.includes(5) && winningLine.includes(8)) {
      return 'border-r-4 border-r-yellow-400' // Right column
    }
    if (winningLine.includes(0) && winningLine.includes(4) && winningLine.includes(8)) {
      return 'border-t-4 border-t-yellow-400 border-r-4 border-r-yellow-400' // Diagonal
    }
    if (winningLine.includes(2) && winningLine.includes(4) && winningLine.includes(6)) {
      return 'border-t-4 border-t-yellow-400 border-l-4 border-l-yellow-400' // Diagonal
    }
    
    return ''
  }
  
  return (
    <div className="grid grid-cols-3 gap-3 p-6 bg-[#0f212e] rounded-xl border border-white/10">
      {board.map((cell, position) => (
        <div
          key={position}
          className={`
            relative flex items-center justify-center
            w-20 h-20 border-2 rounded-lg
            ${cell ? 'bg-[#1a2c38]' : 'bg-[#0f212e]'}
            ${cell ? 'border-white/30' : 'border-white/20'}
            ${getLineClasses(position)}
            ${winningLine?.includes(position) ? 'animate-pulse' : ''}
          `}
        >
          {cell && (
            <div className={`
              text-3xl font-bold
              ${cell === 'X' ? 'text-red-400' : 'text-emerald-400'}
            `}>
              {cell === 'X' ? 'â' : 'ð'}
            </div>
          )}
          
          {!cell && !disabled && (
            <button
              onClick={() => onMove(position)}
              className="absolute inset-0 flex items-center justify-center bg-emerald-600/20 rounded-lg hover:bg-emerald-600/30 transition-colors"
            >
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

// Compact board for mobile view
export function CompactTicTacToeBoard({
  board,
  winningLine,
  isUserTurn,
  isAIThinking,
  onMove,
  disabled = false
}: {
  board: Board
  winningLine: number[] | null
  isUserTurn: boolean
  isAIThinking: boolean
  onMove: (position: number) => void
  disabled?: boolean
}) {
  return (
    <div className="grid grid-cols-3 gap-2 p-4 bg-[#0f212e] rounded-lg border border-white/10">
      {board.map((cell, position) => (
        <TicTacToeCell
          key={position}
          position={position}
          value={cell}
          isWinning={winningLine?.includes(position) || false}
          isAvailable={cell === null}
          isUserTurn={isUserTurn}
          isAIThinking={isAIThinking}
          onMove={onMove}
          disabled={disabled}
          showHints={false}
          size="small"
        />
      ))}
      
      {/* Status indicator */}
      <div className="col-span-3 flex justify-center mt-2">
        {isAIThinking && (
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-600/20 rounded-full border border-blue-400/50">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-blue-400">AI Thinking</span>
          </div>
        )}
        
        {isUserTurn && !isAIThinking && (
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-600/20 rounded-full border border-emerald-400/50">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
            <span className="text-xs text-emerald-400">Your Turn</span>
          </div>
        )}
      </div>
    </div>
  )
}
