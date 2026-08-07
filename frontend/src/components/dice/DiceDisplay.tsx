'use client'

import { useState, useEffect } from 'react'
import { 
  formatRollValue,
  getRollAnimationClass,
  type GameState,
  type DiceResult
} from '@/utils/diceConfig'
import { 
  getOutcomeColor,
  getOutcomeEmoji,
  getOutcomeText
} from '@/utils/diceMath'

interface DiceDisplayProps {
  gameState: GameState
  animatedRollValue: number
  currentResult: DiceResult | null
  target: number
  rollType: 'over' | 'under'
}

export default function DiceDisplay({
  gameState,
  animatedRollValue,
  currentResult,
  target,
  rollType
}: DiceDisplayProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [showResult, setShowResult] = useState(false)
  
  useEffect(() => {
    setDisplayValue(animatedRollValue)
    
    if (gameState === 'result' && currentResult) {
      setShowResult(true)
      setTimeout(() => setShowResult(false), 2000)
    }
  }, [animatedRollValue, gameState, currentResult])
  
  const isWin = currentResult ? determineWin(currentResult.rollValue, target, rollType) : null
  
  function determineWin(rollValue: number, targetValue: number, rollTypeValue: 'over' | 'under'): boolean {
    if (rollTypeValue === 'over') {
      return rollValue > targetValue
    } else {
      return rollValue < targetValue
    }
  }
  
  const getDisplayClasses = () => {
    let classes = 'relative text-center'
    
    if (gameState === 'rolling') {
      classes += ' animate-pulse'
    }
    
    return classes
  }
  
  const getValueClasses = () => {
    let classes = 'text-6xl md:text-7xl font-bold transition-all duration-300'
    
    if (gameState === 'rolling') {
      classes += ' text-blue-400'
    } else if (gameState === 'result' || gameState === 'payout') {
      if (isWin === true) {
        classes += ' text-emerald-400 animate-bounce'
      } else if (isWin === false) {
        classes += ' text-red-400 animate-pulse'
      }
    } else {
      classes += ' text-white'
    }
    
    return classes
  }
  
  const getResultClasses = () => {
    if (isWin === true) {
      return 'bg-emerald-600/20 text-emerald-400 border-emerald-600'
    } else if (isWin === false) {
      return 'bg-red-600/20 text-red-400 border-red-600'
    }
    return 'bg-slate-600/20 text-slate-400 border-slate-600'
  }
  
  const getProgressClasses = () => {
    let classes = 'h-2 rounded-full transition-all duration-500'
    
    if (gameState === 'rolling') {
      classes += ' bg-blue-500'
    } else if (gameState === 'result' || gameState === 'payout') {
      if (isWin === true) {
        classes += ' bg-emerald-500'
      } else if (isWin === false) {
        classes += ' bg-red-500'
      }
    } else {
      classes += ' bg-slate-600'
    }
    
    return classes
  }
  
  const getProgressBarWidth = () => {
    if (gameState === 'rolling') {
      return `${(displayValue / 100) * 100}%`
    } else if (currentResult) {
      return `${(currentResult.rollValue / 100) * 100}%`
    }
    return 0
  }
  
  return (
    <div className="space-y-6">
      {/* Main Display */}
      <div className={getDisplayClasses()}>
        <div className="bg-[#1a2c38] rounded-lg border border-white/10 p-8 relative overflow-hidden">
          {/* Background Progress */}
          <div className="absolute inset-0 bg-slate-800/50"></div>
          <div 
            className={`absolute bottom-0 left-0 right-0 ${getProgressClasses()}`}
            style={{ height: '100%', width: getProgressBarWidth() }}
          ></div>
          
          {/* Roll Value */}
          <div className="relative z-10">
            <div className={getValueClasses()}>
              {gameState === 'rolling' ? (
                <span className="inline-block animate-spin">â</span>
              ) : (
                formatRollValue(displayValue)
              )}
            </div>
            
            {/* Game State Indicator */}
            <div className="text-lg font-medium text-slate-400 mt-4">
              {gameState === 'rolling' && 'Rolling...'}
              {gameState === 'idle' && 'Ready to Roll'}
              {gameState === 'result' && 'Result!'}
              {gameState === 'payout' && 'Complete'}
            </div>
          </div>
          
          {/* Dice Animation */}
          {gameState === 'rolling' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-8xl opacity-20 animate-spin">â</div>
            </div>
          )}
          
          {/* Result Overlay */}
          {showResult && currentResult && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className={`text-6xl font-bold animate-bounce ${
                isWin ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {getOutcomeEmoji(isWin ?? false)}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Target Information */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-sm text-slate-400 mb-1">Target</div>
            <div className="text-2xl font-bold text-white">{target}</div>
            <div className="text-xs text-slate-400 capitalize">{rollType}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-slate-400 mb-1">Result</div>
            <div className="text-2xl font-bold text-white">
              {currentResult ? formatRollValue(currentResult.rollValue) : '--'}
            </div>
            <div className="text-xs text-slate-400">
              {currentResult ? (isWin ? 'WIN' : 'LOSS') : '--'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Result Details */}
      {currentResult && gameState !== 'idle' && (
        <div className={`bg-[#0f212e] rounded-lg border ${getResultClasses().replace('bg-', 'border-').replace('/20', '/50')} p-6`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Roll Value:</span>
              <span className="text-lg font-bold text-white">
                {formatRollValue(currentResult.rollValue)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Target:</span>
              <span className="text-lg font-bold text-white">
                {target} ({rollType})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Win Chance:</span>
              <span className="text-lg font-bold text-white">
                {(currentResult.winChance * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Multiplier:</span>
              <span className="text-lg font-bold text-white">
                {currentResult.multiplier.toFixed(2)}x
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Outcome:</span>
              <div className={`text-lg font-bold ${getOutcomeColor(isWin ?? false)}`}>
                {getOutcomeText(isWin ?? false)}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Visual Comparison */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Roll Comparison</h3>
        <div className="relative h-8 bg-slate-700 rounded-full overflow-hidden">
          {/* Target Line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-yellow-400"
            style={{ left: `${target}%` }}
          >
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-xs px-1 rounded">
              {target}
            </div>
          </div>
          
          {/* Roll Value Indicator */}
          {currentResult && (
            <div
              className={`absolute top-1 bottom-1 w-2 rounded-full transition-all duration-500 ${
                (isWin ?? false) ? 'bg-emerald-400' : 'bg-red-400'
              }`}
              style={{ left: `${currentResult.rollValue}%` }}
            >
              <div className={`absolute -top-2 left-1/2 transform -translate-x-1/2 text-xs px-1 rounded ${
                (isWin ?? false) ? 'bg-emerald-400 text-white' : 'bg-red-400 text-white'
              }`}>
                {formatRollValue(currentResult.rollValue)}
              </div>
            </div>
          )}
          
          {/* Animated Roll Value */}
          {gameState === 'rolling' && (
            <div
              className="absolute top-1 bottom-1 w-2 bg-blue-400 rounded-full animate-pulse"
              style={{ left: `${displayValue}%` }}
            ></div>
          )}
        </div>
        
        <div className="mt-4 flex justify-between text-xs text-slate-400">
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
      </div>
      
      {/* Win/Loss Animation */}
      {gameState === 'result' && currentResult && (
        <div className="text-center">
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-lg ${
            (isWin ?? false) ? 'bg-emerald-600/20 text-emerald-400' : 'bg-red-600/20 text-red-400'
          }`}>
            <span className="text-2xl font-bold">
              {(isWin ?? false) ? 'YOU WIN!' : 'YOU LOSE!'}
            </span>
            <span className="text-xl">
              {getOutcomeEmoji(isWin ?? false)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
