'use client'

import { useState, useEffect, useRef } from 'react'
import ScratchCanvas, { ScratchCardContainer, createScratchParticles, animateScratchParticles } from './ScratchCanvas'
import type { ScratchResult, CardType } from '@/utils/scratchEngine'
import { getCardTypeConfig } from '@/utils/scratchEngine'
import { CARD_THEMES } from '@/utils/scratchConfig'

interface ScratchCardProps {
  result: ScratchResult | null
  isScratching: boolean
  scratchPercentage: number
  onScratchProgress: (scratched: number, total: number) => void
  onScratchComplete: () => void
  onRevealAll: () => void
  width?: number
  height?: number
  cardType?: CardType
  theme?: string
  disabled?: boolean
  showParticles?: boolean
}

export default function ScratchCard({
  result,
  isScratching,
  scratchPercentage,
  onScratchProgress,
  onScratchComplete,
  onRevealAll,
  width = 300,
  height = 200,
  cardType = 'classic',
  theme = 'gold',
  disabled = false,
  showParticles = true
}: ScratchCardProps) {
  const [particles, setParticles] = useState<any[]>([])
  const [isRevealed, setIsRevealed] = useState(false)
  const [winAnimation, setWinAnimation] = useState(false)
  const animationFrameRef = useRef<number>()
  const lastTimeRef = useRef<number>(Date.now())
  
  const cardTheme = CARD_THEMES.find(t => t.id === theme) || CARD_THEMES[0]
  const cardTypeConfig = getCardTypeConfig(cardType)
  
  // Handle scratch progress
  useEffect(() => {
    if (scratchPercentage >= 60 && !isRevealed) {
      setIsRevealed(true)
      if (result?.isWin) {
        setWinAnimation(true)
        setTimeout(() => setWinAnimation(false), 2000)
      }
    }
  }, [scratchPercentage, isRevealed, result])
  
  // Handle particle animation
  useEffect(() => {
    if (!showParticles || !isScratching) return
    
    const animate = () => {
      const currentTime = Date.now()
      const deltaTime = currentTime - lastTimeRef.current
      lastTimeRef.current = currentTime
      
      // Update existing particles
      setParticles(prev => animateScratchParticles(prev, deltaTime))
      
      animationFrameRef.current = requestAnimationFrame(animate)
    }
    
    animationFrameRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isScratching, showParticles])
  
  // Add particles on scratch
  const handleScratch = (x: number, y: number, total: number) => {
    if (!showParticles || !isScratching) return
    
    // Add new particles occasionally
    if (Math.random() < 0.3) {
      const newParticles = createScratchParticles(x, y, 3)
      setParticles(prev => [...prev, ...newParticles])
    }
    
    onScratchProgress(x, total)
  }
  
  // Render symbol grid
  const renderSymbolGrid = () => {
    if (!result) return null
    
    const rows = result.symbolGrid.length
    const cols = result.symbolGrid[0]?.length || 0
    
    return (
      <div 
        className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`
        }}
      >
        {result.symbolGrid.flat().map((symbol, index) => {
          const isWinning = result.winningSymbols.includes(symbol)
          
          return (
            <div
              key={index}
              className={`
                flex items-center justify-center text-3xl font-bold
                transition-all duration-500 transform
                ${isRevealed ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
                ${isWinning && winAnimation ? 'animate-pulse' : ''}
                ${isWinning ? 'text-emerald-400 drop-shadow-lg' : 'text-white'}
              `}
              style={{
                animationDelay: isRevealed ? `${index * 50}ms` : '0ms',
                textShadow: isWinning ? '0 0 20px rgba(52, 211, 153, 0.8)' : 'none'
              }}
            >
              {symbol}
            </div>
          )
        })}
      </div>
    )
  }
  
  // Render scratch overlay
  const renderScratchOverlay = () => {
    if (isRevealed) return null
    
    return (
      <ScratchCanvas
        width={width}
        height={height}
        scratchColor={cardTheme.scratchColor}
        scratchPattern={cardTheme.scratchPattern}
        isScratching={isScratching}
        onScratchProgress={onScratchProgress}
        onScratchComplete={onScratchComplete}
        disabled={disabled}
      />
    )
  }
  
  // Render particles
  const renderParticles = () => {
    if (!showParticles || particles.length === 0) return null
    
    return (
      <div className="absolute inset-0 pointer-events-none">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: cardTheme.scratchColor,
              opacity: particle.opacity,
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}
      </div>
    )
  }
  
  // Render win effect
  const renderWinEffect = () => {
    if (!result?.isWin || !winAnimation) return null
    
    return (
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-emerald-500/20 animate-pulse rounded-lg"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-6xl font-bold text-emerald-400 animate-bounce">
            ð
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <ScratchCardContainer width={width} height={height}>
      {/* Card background */}
      <div 
        className={`
          absolute inset-0 rounded-lg
          ${cardTheme.bgColor}
          ${cardTheme.borderColor}
          border-2
        `}
      >
        {/* Background pattern */}
        <div 
          className="absolute inset-0 rounded-lg"
          style={{ background: cardTheme.backgroundPattern }}
        />
        
        {/* Card content */}
        {result && renderSymbolGrid()}
        
        {/* Loading state */}
        {!result && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white/50 text-center">
              <div className="text-4xl mb-2">ð</div>
              <div className="text-sm">Loading...</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Scratch overlay */}
      {renderScratchOverlay()}
      
      {/* Particles */}
      {renderParticles()}
      
      {/* Win effect */}
      {renderWinEffect()}
      
      {/* Card frame */}
      <div className="absolute inset-0 rounded-lg border-2 border-white/20 pointer-events-none"></div>
      
      {/* Card shine effect */}
      <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent transform -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
      </div>
      
      {/* Reveal all button */}
      {isScratching && !isRevealed && (
        <div className="absolute bottom-2 right-2">
          <button
            onClick={onRevealAll}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs rounded-lg backdrop-blur-sm transition-all"
          >
            Reveal All
          </button>
        </div>
      )}
      
      {/* Scratch progress indicator */}
      {isScratching && (
        <div className="absolute top-2 left-2">
          <div className="px-2 py-1 bg-black/50 text-white text-xs rounded-lg backdrop-blur-sm">
            {Math.round(scratchPercentage)}%
          </div>
        </div>
      )}
      
      {/* Card type indicator */}
      {result && (
        <div className="absolute top-2 right-2">
          <div className={`px-2 py-1 ${cardTypeConfig.bgColor} ${cardTypeConfig.color} text-xs rounded-lg`}>
            {cardTypeConfig.name}
          </div>
        </div>
      )}
    </ScratchCardContainer>
  )
}

// Mini scratch card for history
export function MiniScratchCard({
  result,
  size = 60
}: {
  result: ScratchResult
  size?: number
}) {
  const cardTypeConfig = getCardTypeConfig(result.cardType)
  
  return (
    <div 
      className={`
        relative rounded border-2
        ${result.isWin ? 'border-emerald-400' : 'border-gray-400'}
        ${result.isWin ? 'bg-emerald-900/20' : 'bg-gray-800/20'}
      `}
      style={{ width: size, height: size * 0.67 }}
    >
      {/* Symbol preview */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className={`text-lg font-bold ${result.isWin ? 'text-emerald-400' : 'text-gray-400'}`}>
            {result.symbolGrid[0][0]}
          </div>
          <div className="text-xs text-gray-400">
            {result.multiplier}x
          </div>
        </div>
      </div>
      
      {/* Win indicator */}
      {result.isWin && (
        <div className="absolute top-1 right-1">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
        </div>
      )}
      
      {/* Card type indicator */}
      <div className="absolute bottom-1 left-1">
        <div className={`text-xs ${cardTypeConfig.color}`}>
          {cardTypeConfig.name.charAt(0)}
        </div>
      </div>
    </div>
  )
}

// Scratch card stack for showing multiple cards
export function ScratchCardStack({
  cards,
  maxVisible = 3
}: {
  cards: ScratchResult[]
  maxVisible?: number
}) {
  const visibleCards = cards.slice(0, maxVisible)
  
  return (
    <div className="relative">
      {visibleCards.map((card, index) => (
        <div
          key={card.id}
          className="absolute"
          style={{
            top: `${index * 2}px`,
            left: `${index * 2}px`,
            zIndex: maxVisible - index
          }}
        >
          <MiniScratchCard result={card} size={80} />
        </div>
      ))}
      
      {/* Card count indicator */}
      {cards.length > maxVisible && (
        <div className="absolute top-1 right-1 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          +{cards.length - maxVisible}
        </div>
      )}
    </div>
  )
}

// Scratch card preview for game selection
export function ScratchCardPreview({
  cardType,
  theme,
  onClick,
  selected = false
}: {
  cardType: CardType
  theme: string
  onClick?: () => void
  selected?: boolean
}) {
  const cardTheme = CARD_THEMES.find(t => t.id === theme) || CARD_THEMES[0]
  const cardTypeConfig = getCardTypeConfig(cardType)
  
  return (
    <div
      onClick={onClick}
      className={`
        relative cursor-pointer transition-all duration-200
        ${selected ? 'transform scale-105' : 'hover:transform scale-102'}
      `}
    >
      <div 
        className={`
          w-32 h-20 rounded-lg border-2
          ${cardTheme.bgColor}
          ${cardTheme.borderColor}
          ${selected ? 'ring-2 ring-emerald-400' : ''}
        `}
      >
        {/* Card preview content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl mb-1">ð</div>
            <div className={`text-xs ${cardTypeConfig.color}`}>
              {cardTypeConfig.name}
            </div>
          </div>
        </div>
        
        {/* Shine effect */}
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent transform -translate-x-full"></div>
        </div>
      </div>
      
      {/* Selection indicator */}
      {selected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
          <div className="text-white text-xs">â</div>
        </div>
      )}
    </div>
  )
}
