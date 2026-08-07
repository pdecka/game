'use client'

import { useState } from 'react'
import type { GameResult, Player, TicTacToeGame } from '@/utils/ticTacToeEngine'
import { formatGameResult, getSymbolInfo } from '@/utils/ticTacToeEngine'
import { Trophy, Target, Brain, Zap, Clock, TrendingUp, DollarSign } from 'lucide-react'

interface TicTacToeStatusProps {
  game: TicTacToeGame | null
  currentResult: GameResult
  isUserTurn: boolean
  isAIThinking: boolean
  moveCount: number
  totalPayout: number
  totalProfit: number
  lastAIMove: any
  className?: string
}

export default function TicTacToeStatus({
  game,
  currentResult,
  isUserTurn,
  isAIThinking,
  moveCount,
  totalPayout,
  totalProfit,
  lastAIMove,
  className = ''
}: TicTacToeStatusProps) {
  const [showDetails, setShowDetails] = useState(false)
  
  const getResultInfo = () => {
    if (!currentResult) return null
    return formatGameResult(currentResult)
  }
  
  const getGamePhaseText = () => {
    if (!game) return 'Ready to play'
    
    switch (game.gameState) {
      case 'idle':
        return 'Waiting to start'
      case 'playing':
        return isUserTurn ? 'Your turn' : 'AI thinking...'
      case 'result':
        return getResultInfo()?.text || 'Game complete'
      default:
        return 'Unknown'
    }
  }
  
  const getGamePhaseColor = () => {
    if (!game) return 'text-slate-400'
    
    switch (game.gameState) {
      case 'idle':
        return 'text-slate-400'
      case 'playing':
        return isUserTurn ? 'text-emerald-400' : 'text-blue-400'
      case 'result':
        return getResultInfo()?.color || 'text-slate-400'
      default:
        return 'text-slate-400'
    }
  }
  
  const getGamePhaseIcon = () => {
    if (!game) return null
    
    switch (game.gameState) {
      case 'idle':
        return <Clock className="h-4 w-4" />
      case 'playing':
        return isUserTurn ? <Target className="h-4 w-4" /> : <Brain className="h-4 w-4" />
      case 'result':
        return getResultInfo()?.emoji || 'ð'
      default:
        return null
    }
  }
  
  const getDifficultyIcon = () => {
    if (!game) return null
    
    switch (game.difficulty) {
      case 'easy':
        return <Brain className="h-4 w-4" />
      case 'medium':
        return <Target className="h-4 w-4" />
      case 'hard':
        return <Trophy className="h-4 w-4" />
      case 'house':
        return <Zap className="h-4 w-4" />
      default:
        return null
    }
  }
  
  const getSymbolIcon = (symbol: Player) => {
    if (!symbol) return null
    const info = getSymbolInfo(symbol)
    return info.emoji
  }
  
  const getProfitColor = () => {
    if (totalProfit > 0) return 'text-emerald-400'
    if (totalProfit < 0) return 'text-red-400'
    return 'text-slate-400'
  }
  
  const getProfitText = () => {
    if (totalProfit > 0) return `+${totalProfit.toFixed(2)}`
    if (totalProfit < 0) return totalProfit.toFixed(2)
    return '0.00'
  }
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Status */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Game Status</h3>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full ${
            game?.gameState === 'idle' ? 'bg-slate-400' : 
            game?.gameState === 'playing' ? (isUserTurn ? 'bg-emerald-400' : 'bg-blue-400') : 
            currentResult === 'win' ? 'bg-emerald-400' : 
            currentResult === 'lose' ? 'bg-red-400' : 
            'bg-yellow-400'
          } ${isAIThinking ? 'animate-pulse' : ''}`}></div>
          
          <div className="flex-1">
            <div className={`text-sm font-medium ${getGamePhaseColor()}`}>
              {getGamePhaseText()}
            </div>
            {game?.gameState === 'playing' && (
              <div className="text-xs text-slate-400 mt-1">
                Move {moveCount} of 9
              </div>
            )}
          </div>
          
          <div className={`text-2xl ${getGamePhaseColor()}`}>
            {getGamePhaseIcon()}
          </div>
        </div>
        
        {/* Result Display */}
        {currentResult && game?.gameState === 'result' && (
          <div className="mt-4 p-4 bg-[#1a2c38] rounded-lg border border-white/10">
            <div className="text-center">
              <div className={`text-2xl font-bold mb-2 ${getResultInfo()?.color}`}>
                {getResultInfo()?.text}
              </div>
              <div className="text-lg text-white mb-2">
                {getResultInfo()?.description}
              </div>
              <div className={`text-xl font-bold ${getProfitColor()}`}>
                {getProfitText()}
              </div>
              <div className="text-sm text-slate-400 mt-2">
                Payout: {totalPayout.toFixed(2)}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Game Details */}
      {showDetails && game && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Game Details</h3>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-slate-400 mb-1">Your Symbol</div>
              <div className="text-white font-medium flex items-center gap-2">
                <span className="text-lg">{getSymbolIcon(game.userSymbol)}</span>
                {game.userSymbol === 'X' ? 'Cross' : 'Circle'}
              </div>
            </div>
            
            <div>
              <div className="text-slate-400 mb-1">AI Symbol</div>
              <div className="text-white font-medium flex items-center gap-2">
                <span className="text-lg">{getSymbolIcon(game.aiSymbol)}</span>
                {game.aiSymbol === 'X' ? 'Cross' : 'Circle'}
              </div>
            </div>
            
            <div>
              <div className="text-slate-400 mb-1">Difficulty</div>
              <div className="text-white font-medium flex items-center gap-2">
                {getDifficultyIcon()}
                {game.difficulty}
              </div>
            </div>
            
            <div>
              <div className="text-slate-400 mb-1">Bet Amount</div>
              <div className="text-white font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                {game.betAmount}
              </div>
            </div>
            
            <div>
              <div className="text-slate-400 mb-1">Moves Made</div>
              <div className="text-white font-medium">{moveCount}</div>
            </div>
            
            <div>
              <div className="text-slate-400 mb-1">Game ID</div>
              <div className="text-white font-medium font-mono text-xs">
                #{game.id.slice(-8).toUpperCase()}
              </div>
            </div>
          </div>
          
          {/* AI Move Analysis */}
          {lastAIMove && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="text-sm text-slate-400 mb-2">Last AI Move</div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-slate-400">Position</div>
                  <div className="text-white font-medium">Cell {lastAIMove.position + 1}</div>
                </div>
                <div>
                  <div className="text-slate-400">Score</div>
                  <div className="text-white font-medium">{lastAIMove.score}</div>
                </div>
                <div>
                  <div className="text-slate-400">Depth</div>
                  <div className="text-white font-medium">{lastAIMove.depth}</div>
                </div>
                <div>
                  <div className="text-slate-400">Thinking Time</div>
                  <div className="text-white font-medium">{lastAIMove.thinkingTime}ms</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Betting Information */}
      {game && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Betting Information</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Bet Amount:</span>
              <span className="text-white font-medium">{game.betAmount}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Potential Win:</span>
              <span className="text-emerald-400 font-medium">{game.betAmount * 2}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Tie Return:</span>
              <span className="text-yellow-400 font-medium">{game.betAmount}</span>
            </div>
            
            {game.gameState === 'result' && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Actual Payout:</span>
                  <span className={`font-medium ${totalPayout > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {totalPayout.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Net Profit:</span>
                  <span className={`font-medium ${getProfitColor()}`}>
                    {getProfitText()}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Turn Indicator */}
      {game?.gameState === 'playing' && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${isUserTurn ? 'bg-emerald-400' : 'bg-blue-400'} ${isAIThinking ? 'animate-pulse' : ''}`}></div>
              <div className="text-sm text-white">
                {isUserTurn ? 'Your turn' : 'AI thinking...'}
              </div>
            </div>
            
            <div className="text-2xl">
              {isUserTurn ? getSymbolIcon(game.userSymbol) : getSymbolIcon(game.aiSymbol)}
            </div>
          </div>
        </div>
      )}
      
      {/* Progress Indicator */}
      {game?.gameState === 'playing' && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Game Progress</span>
            <span className="text-sm text-emerald-400">{moveCount}/9 moves</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(moveCount / 9) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  )
}

// Compact status for mobile view
export function CompactTicTacToeStatus({
  game,
  currentResult,
  isUserTurn,
  isAIThinking,
  moveCount,
  totalPayout,
  totalProfit
}: Omit<TicTacToeStatusProps, 'className' | 'lastAIMove'>) {
  const getGamePhaseText = () => {
    if (!game) return 'Ready to play'
    
    switch (game.gameState) {
      case 'idle':
        return 'Waiting to start'
      case 'playing':
        return isUserTurn ? 'Your turn' : 'AI thinking...'
      case 'result':
        return currentResult === 'win' ? 'You Win!' : currentResult === 'lose' ? 'You Lose' : 'Tie!'
      default:
        return 'Unknown'
    }
  }
  
  const getGamePhaseColor = () => {
    if (!game) return 'text-slate-400'
    
    switch (game.gameState) {
      case 'idle':
        return 'text-slate-400'
      case 'playing':
        return isUserTurn ? 'text-emerald-400' : 'text-blue-400'
      case 'result':
        return currentResult === 'win' ? 'text-emerald-400' : currentResult === 'lose' ? 'text-red-400' : 'text-yellow-400'
      default:
        return 'text-slate-400'
    }
  }
  
  return (
    <div className="space-y-3">
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-3">
        <div className="flex items-center justify-between">
          <div className={`text-sm font-medium ${getGamePhaseColor()}`}>
            {getGamePhaseText()}
          </div>
          {game?.gameState === 'playing' && (
            <div className={`w-2 h-2 rounded-full ${isUserTurn ? 'bg-emerald-400' : 'bg-blue-400'} ${isAIThinking ? 'animate-pulse' : ''}`}></div>
          )}
        </div>
        
        {game?.gameState === 'playing' && (
          <div className="mt-2 text-xs text-slate-400">
            Move {moveCount} of 9
          </div>
        )}
        
        {currentResult && game?.gameState === 'result' && (
          <div className="mt-2">
            <div className={`text-sm font-bold ${getGamePhaseColor()}`}>
              {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2)}
            </div>
          </div>
        )}
      </div>
      
      {game && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-slate-400">Bet</div>
              <div className="text-white font-medium">{game.betAmount}</div>
            </div>
            <div>
              <div className="text-slate-400">Potential</div>
              <div className="text-emerald-400 font-medium">{game.betAmount * 2}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Status indicator for game list
export function GameStatusIndicator({
  result,
  difficulty,
  userSymbol
}: {
  result: GameResult
  difficulty: string
  userSymbol: Player
}) {
  const getStatusInfo = () => {
    switch (result) {
      case 'win':
        return {
          text: 'WIN',
          color: 'text-emerald-400',
          bgColor: 'bg-emerald-600/20',
          borderColor: 'border-emerald-400/50',
          emoji: 'ð'
        }
      case 'lose':
        return {
          text: 'LOSE',
          color: 'text-red-400',
          bgColor: 'bg-red-600/20',
          borderColor: 'border-red-400/50',
          emoji: 'â'
        }
      case 'tie':
        return {
          text: 'TIE',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-600/20',
          borderColor: 'border-yellow-400/50',
          emoji: 'ð'
        }
      default:
        return {
          text: 'READY',
          color: 'text-slate-400',
          bgColor: 'bg-slate-600/20',
          borderColor: 'border-slate-400/50',
          emoji: 'ð'
        }
    }
  }
  
  const statusInfo = getStatusInfo()
  
  return (
    <div className={`
      flex items-center gap-2 px-3 py-1 rounded-full border
      ${statusInfo.bgColor} ${statusInfo.borderColor}
    `}>
      <span className={`text-sm font-medium ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
      <span className="text-sm">{statusInfo.emoji}</span>
    </div>
  )
}
