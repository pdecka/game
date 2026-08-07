'use client'

import { useState, useEffect } from 'react'
import { 
  formatMultiplier,
  getMultiplierColor,
  getMultiplierBgColor,
  getGameStateColor,
  getGameStateText,
  type GameState,
  type LimboResult
} from '@/utils/limboConfig'

interface LimboDisplayProps {
  gameState: GameState
  targetMultiplier: number
  animatedMultiplier: number
  currentResult: LimboResult | null
  isWin: boolean | null
}

export default function LimboDisplay({
  gameState,
  targetMultiplier,
  animatedMultiplier,
  currentResult,
  isWin
}: LimboDisplayProps) {
  const [displayMultiplier, setDisplayMultiplier] = useState(1)
  const [showCrash, setShowCrash] = useState(false)
  
  useEffect(() => {
    setDisplayMultiplier(animatedMultiplier)
    
    if (gameState === 'result' && currentResult && isWin === false) {
      setShowCrash(true)
      setTimeout(() => setShowCrash(false), 1000)
    }
  }, [animatedMultiplier, gameState, currentResult, isWin])
  
  const getDisplayClasses = () => {
    let classes = 'relative w-full max-w-md mx-auto text-center'
    
    if (showCrash) {
      classes += ' animate-pulse'
    }
    
    return classes
  }
  
  const getMultiplierClasses = () => {
    let classes = 'text-6xl md:text-7xl font-bold transition-all duration-300'
    
    if (gameState === 'animating') {
      classes += ' text-blue-400 animate-pulse'
    } else if (gameState === 'result' || gameState === 'payout') {
      classes += ` ${getMultiplierColor(displayMultiplier, targetMultiplier)}`
      if (isWin) {
        classes += ' animate-bounce'
      } else {
        classes += ' animate-pulse'
      }
    } else {
      classes += ' text-white'
    }
    
    return classes
  }
  
  const getTargetLineClasses = () => {
    const isReached = displayMultiplier >= targetMultiplier
    let classes = 'absolute left-0 right-0 border-2 border-dashed transition-all duration-300'
    
    if (isReached && (gameState === 'result' || gameState === 'payout')) {
      classes += ' border-emerald-400 bg-emerald-400/10'
    } else {
      classes += ' border-white/30'
    }
    
    return classes
  }
  
  const getTargetPosition = () => {
    // Calculate position based on logarithmic scale
    const maxDisplay = Math.max(targetMultiplier * 1.5, 10)
    const position = (Math.log(targetMultiplier) / Math.log(maxDisplay)) * 100
    return Math.min(position, 90) // Cap at 90% to stay within container
  }
  
  const getProgressHeight = () => {
    const maxDisplay = Math.max(targetMultiplier * 1.5, 10)
    const progress = (Math.log(displayMultiplier) / Math.log(maxDisplay)) * 100
    return Math.min(progress, 100)
  }
  
  const getProgressClasses = () => {
    let classes = 'absolute bottom-0 left-0 right-0 transition-all duration-200'
    
    if (gameState === 'animating') {
      classes += ' bg-gradient-to-t from-blue-600 to-blue-400'
    } else if (gameState === 'result' || gameState === 'payout') {
      if (isWin) {
        classes += ' bg-gradient-to-t from-emerald-600 to-emerald-400'
      } else {
        classes += ' bg-gradient-to-t from-red-600 to-red-400'
      }
    } else {
      classes += ' bg-gradient-to-t from-slate-600 to-slate-400'
    }
    
    return classes
  }
  
  const getPlaneAnimation = () => {
    if (gameState !== 'animating') return null
    
    return (
      <div 
        className="absolute text-4xl transition-all duration-200"
        style={{ 
          bottom: `${getProgressHeight()}%`,
          left: '50%',
          transform: 'translateX(-50%)'
        }}
      >
        â
      </div>
    )
  }
  
  const getResultOverlay = () => {
    if (gameState !== 'result' && gameState !== 'payout') return null
    if (!currentResult) return null
    
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className={`text-4xl font-bold animate-bounce ${
          isWin ? 'text-emerald-400' : 'text-red-400'
        }`}>
          {isWin ? 'WIN!' : 'CRASH!'}
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Main Multiplier Display */}
      <div className={getDisplayClasses()}>
        <div className="relative bg-[#1a2c38] rounded-lg border border-white/10 p-8 overflow-hidden">
          {/* Progress Bar Background */}
          <div className="absolute inset-0 bg-slate-800/50 rounded-lg"></div>
          
          {/* Progress Bar */}
          <div 
            className={getProgressClasses()}
            style={{ height: `${getProgressHeight()}%` }}
          ></div>
          
          {/* Target Line */}
          <div 
            className={getTargetLineClasses()}
            style={{ top: `${100 - getTargetPosition()}%` }}
          >
            <div className="absolute -top-3 left-0 right-0 text-center">
              <span className="text-xs text-white bg-slate-800 px-2 py-1 rounded">
                Target: {formatMultiplier(targetMultiplier)}x
              </span>
            </div>
          </div>
          
          {/* Plane Animation */}
          {getPlaneAnimation()}
          
          {/* Multiplier Display */}
          <div className="relative z-10">
            <div className={getMultiplierClasses()}>
              {formatMultiplier(displayMultiplier)}x
            </div>
            
            {/* Game State Indicator */}
            <div className={`text-lg font-medium mt-4 ${getGameStateColor(gameState)}`}>
              {getGameStateText(gameState)}
            </div>
            
            {/* Result Details */}
            {gameState === 'result' && currentResult && (
              <div className="mt-4 space-y-2">
                <div className="text-sm text-white">
                  Result: <span className="font-bold">{formatMultiplier(currentResult.generatedMultiplier)}x</span>
                </div>
                <div className="text-sm text-slate-400">
                  Target: <span className="font-bold">{formatMultiplier(targetMultiplier)}x</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Result Overlay */}
          {getResultOverlay()}
        </div>
      </div>
      
      {/* Multiplier Scale */}
      <div className="relative h-8 bg-[#1a2c38] rounded-lg border border-white/10 overflow-hidden">
        {/* Scale markings */}
        <div className="absolute inset-0 flex items-center justify-between px-2">
          <span className="text-xs text-slate-400">1x</span>
          <span className="text-xs text-slate-400">{formatMultiplier(targetMultiplier)}x</span>
          <span className="text-xs text-slate-400">{formatMultiplier(targetMultiplier * 2)}x</span>
        </div>
        
        {/* Current position indicator */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-yellow-400 transition-all duration-200"
          style={{ left: `${getProgressHeight()}%` }}
        ></div>
      </div>
      
      {/* Animation Effects */}
      {gameState === 'animating' && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-blue-400">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Flying...</span>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}
      
      {/* Win/Loss Indicator */}
      {gameState === 'result' && currentResult && (
        <div className="text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
            isWin ? 'bg-emerald-600/20 text-emerald-400' : 'bg-red-600/20 text-red-400'
          }`}>
            {isWin ? (
              <>
                <span className="text-2xl">ð</span>
                <span className="font-bold">You Won!</span>
              </>
            ) : (
              <>
                <span className="text-2xl">ð</span>
                <span className="font-bold">Crashed!</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
