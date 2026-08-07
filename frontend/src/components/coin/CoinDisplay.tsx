'use client'

import { useState, useEffect } from 'react'
import { 
  COIN_SIDES, 
  getCoinRotation, 
  getCoinAnimationClass,
  type CoinSide,
  type CoinResult,
  type GameState
} from '@/utils/coinConfig'

interface CoinDisplayProps {
  gameState: GameState
  selectedSide: CoinSide | null
  currentResult: CoinResult | null
  isWin: boolean | null
}

export default function CoinDisplay({ 
  gameState, 
  selectedSide, 
  currentResult, 
  isWin 
}: CoinDisplayProps) {
  const [rotation, setRotation] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  
  useEffect(() => {
    if (gameState === 'flipping' && currentResult) {
      setIsAnimating(true)
      const targetRotation = getCoinRotation(currentResult.side)
      
      // Smooth rotation animation
      setRotation(targetRotation)
      
      // Stop animating when result is shown
      const timer = setTimeout(() => {
        setIsAnimating(false)
      }, 2000)
      
      return () => clearTimeout(timer)
    } else if (gameState === 'idle') {
      setRotation(0)
      setIsAnimating(false)
    }
  }, [gameState, currentResult])
  
  const getVisibleSide = (): CoinSide => {
    if (gameState === 'result' || gameState === 'payout') {
      return currentResult?.side || 'heads'
    }
    
    // During animation, determine which side should be visible based on rotation
    const normalizedRotation = rotation % 360
    if (normalizedRotation >= 90 && normalizedRotation < 270) {
      return 'tails'
    }
    return 'heads'
  }
  
  const visibleSide = getVisibleSide()
  const sideConfig = COIN_SIDES[visibleSide]
  
  const getCoinClasses = () => {
    let classes = 'relative w-48 h-48 mx-auto transition-all duration-500 preserve-3d'
    
    if (isAnimating) {
      classes += ' animate-spin'
    }
    
    if (gameState === 'result' && isWin) {
      classes += ' ring-4 ring-emerald-400 ring-opacity-75'
    } else if (gameState === 'result' && isWin === false) {
      classes += ' ring-4 ring-red-400 ring-opacity-75'
    }
    
    return classes
  }
  
  const getCoinFaceClasses = (side: CoinSide) => {
    const config = COIN_SIDES[side]
    let classes = `absolute inset-0 rounded-full flex flex-col items-center justify-center text-white font-bold border-4 transition-all duration-300`
    
    classes += ` ${config.bgColor} ${config.borderColor}`
    
    if (gameState === 'flipping') {
      classes += ' opacity-90'
    }
    
    return classes
  }
  
  const getHeadsTransform = () => {
    if (isAnimating) {
      return `rotateY(${rotation}deg)`
    }
    return visibleSide === 'heads' ? 'rotateY(0deg)' : 'rotateY(180deg)'
  }
  
  const getTailsTransform = () => {
    if (isAnimating) {
      return `rotateY(${rotation + 180}deg)`
    }
    return visibleSide === 'tails' ? 'rotateY(0deg)' : 'rotateY(180deg)'
  }
  
  const getResultOverlay = () => {
    if (gameState !== 'result' && gameState !== 'payout') return null
    if (!currentResult) return null
    
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className={`text-6xl font-bold animate-bounce ${
          isWin ? 'text-emerald-400' : 'text-red-400'
        }`}>
          {isWin ? 'WIN!' : 'LOSS!'}
        </div>
      </div>
    )
  }
  
  const getSelectionIndicator = () => {
    if (!selectedSide || gameState !== 'idle') return null
    
    const config = COIN_SIDES[selectedSide]
    return (
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} text-white`}>
          Selected: {config.name}
        </div>
      </div>
    )
  }
  
  const getAnimationEffects = () => {
    if (!isAnimating) return null
    
    return (
      <div className="absolute inset-0 rounded-full animate-pulse">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-blue-400 opacity-30 animate-spin"></div>
        <div className="absolute inset-2 rounded-full bg-gradient-to-r from-blue-400 to-yellow-400 opacity-30 animate-spin" style={{ animationDirection: 'reverse' }}></div>
      </div>
    )
  }
  
  return (
    <div className="relative">
      {/* Selection Indicator */}
      {getSelectionIndicator()}
      
      {/* Coin Container */}
      <div className="relative perspective-1000">
        <div className={getCoinClasses()} style={{ transformStyle: 'preserve-3d' }}>
          {/* Heads Side */}
          <div 
            className={getCoinFaceClasses('heads')}
            style={{ 
              transform: getHeadsTransform(),
              backfaceVisibility: 'hidden'
            }}
          >
            <div className="text-6xl mb-2">{COIN_SIDES.heads.emoji}</div>
            <div className="text-xl font-bold">HEADS</div>
            <div className="text-sm opacity-75 mt-1">50%</div>
          </div>
          
          {/* Tails Side */}
          <div 
            className={getCoinFaceClasses('tails')}
            style={{ 
              transform: getTailsTransform(),
              backfaceVisibility: 'hidden'
            }}
          >
            <div className="text-6xl mb-2">{COIN_SIDES.tails.emoji}</div>
            <div className="text-xl font-bold">TAILS</div>
            <div className="text-sm opacity-75 mt-1">50%</div>
          </div>
          
          {/* Animation Effects */}
          {getAnimationEffects()}
        </div>
      </div>
      
      {/* Result Overlay */}
      {getResultOverlay()}
      
      {/* Game State Indicator */}
      <div className="text-center mt-6">
        <div className={`text-lg font-medium ${getGameStateColor(gameState)}`}>
          {getGameStateText(gameState)}
        </div>
        
        {gameState === 'result' && currentResult && (
          <div className="mt-2">
            <div className="text-sm text-white">
              Result: <span className="font-bold capitalize">{currentResult.side}</span>
            </div>
            {selectedSide && (
              <div className="text-sm text-slate-400">
                Your choice: <span className="capitalize">{selectedSide}</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* 3D Effect Styles */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  )
}

// Helper functions
function getGameStateColor(gameState: GameState): string {
  switch (gameState) {
    case 'idle':
      return 'text-emerald-400'
    case 'flipping':
      return 'text-yellow-400'
    case 'result':
      return 'text-blue-400'
    case 'payout':
      return 'text-purple-400'
    default:
      return 'text-white'
  }
}

function getGameStateText(gameState: GameState): string {
  switch (gameState) {
    case 'idle':
      return 'Ready to Flip'
    case 'flipping':
      return 'Flipping...'
    case 'result':
      return 'Result!'
    case 'payout':
      return 'Payout'
    default:
      return 'Unknown'
  }
}
