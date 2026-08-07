'use client'

import { useMemo, useState, useEffect } from 'react'
import PlinkoBall from './PlinkoBall'
import { getMultiplierForSlot, getSlotColorClass, getMaxMultiplier, type RiskLevel } from '@/utils/plinkoConfig'

interface PlinkoBoardProps {
  rows: number
  risk: RiskLevel
  path: number[] | null
  finalSlot: number | null
  gameState: 'idle' | 'dropping' | 'animating' | 'completed'
}

export default function PlinkoBoard({ rows, risk, path, finalSlot, gameState }: PlinkoBoardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const maxMultiplier = getMaxMultiplier(rows, risk)
  
  // Generate peg positions
  const pegs = useMemo(() => {
    return Array.from({ length: rows }, (_, rowIndex) => 
      Array.from({ length: rowIndex + 1 }, (_, pegIndex) => ({
        row: rowIndex,
        peg: pegIndex,
        x: (rows * 20) - (rowIndex * 10) + (pegIndex * 20),
        y: 40 + (rowIndex * 35)
      }))
    )
  }, [rows])
  
  // Generate slot multipliers
  const slots = useMemo(() => {
    return Array.from({ length: rows + 1 }, (_, slotIndex) => ({
      index: slotIndex,
      multiplier: getMultiplierForSlot(rows, risk, slotIndex),
      x: (rows * 20) - (rows * 10) + (slotIndex * 20),
      y: 40 + (rows * 35) + 40
    }))
  }, [rows, risk])
  
  // Animation logic
  useEffect(() => {
    if (gameState === 'animating' && path) {
      const interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= path.length - 1) {
            clearInterval(interval)
            return prev
          }
          return prev + 1
        })
      }, 300) // Animation speed
      
      return () => clearInterval(interval)
    } else if (gameState === 'idle') {
      setCurrentStep(0)
    }
  }, [gameState, path])
  
  const isAnimating = gameState === 'animating'
  const showBall = gameState === 'dropping' || gameState === 'animating'
  
  return (
    <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
      <div className="text-center mb-4">
        <h2 className="text-lg font-semibold text-white">Plinko Board</h2>
        <div className="flex items-center justify-center gap-4 text-sm text-slate-400 mt-2">
          <span>Rows: <span className="text-white font-medium">{rows}</span></span>
          <span>Risk: <span className="text-white font-medium capitalize">{risk}</span></span>
          <span>Max: <span className="text-white font-medium">{maxMultiplier}x</span></span>
        </div>
      </div>
      
      {/* Board Container */}
      <div className="relative flex justify-center">
        <div 
          className="relative"
          style={{ 
            width: `${rows * 40}px`, 
            height: `${rows * 35 + 120}px`,
            minHeight: '400px'
          }}
        >
          {/* Pegs */}
          {pegs.map((row, rowIndex) => (
            <div key={rowIndex} className="absolute">
              {row.map((peg) => (
                <div
                  key={`${rowIndex}-${peg.peg}`}
                  className="absolute w-2 h-2 bg-white/30 rounded-full border border-white/20"
                  style={{
                    left: `${peg.x}px`,
                    top: `${peg.y}px`,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              ))}
            </div>
          ))}
          
          {/* Slots */}
          <div className="absolute bottom-0 left-0 right-0">
            {slots.map((slot) => {
              const isActive = finalSlot === slot.index
              const colorClass = getSlotColorClass(risk, slot.multiplier, maxMultiplier)
              
              return (
                <div
                  key={slot.index}
                  className={`absolute w-8 h-10 rounded-lg border-2 flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                    isActive 
                      ? `${colorClass} text-white border-white scale-110 shadow-lg` 
                      : 'bg-[#1a2c38] border-white/20 text-white/70'
                  }`}
                  style={{
                    left: `${slot.x - 16}px`,
                    bottom: '0px'
                  }}
                  title={`Slot ${slot.index} - ${slot.multiplier}x`}
                >
                  {slot.multiplier.toFixed(1)}x
                </div>
              )
            })}
          </div>
          
          {/* Ball */}
          {showBall && path && (
            <PlinkoBall
              path={path}
              currentStep={currentStep}
              rows={rows}
              isAnimating={isAnimating}
            />
          )}
          
          {/* Drop indicator */}
          {gameState === 'idle' && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
              <div className="w-4 h-4 bg-gradient-to-br from-red-500 to-orange-500 rounded-full shadow-lg border border-white/20 animate-pulse" />
              <div className="text-xs text-white/60 mt-2 text-center">Drop Here</div>
            </div>
          )}
        </div>
      </div>
      
      {/* Path Display */}
      {path && gameState !== 'idle' && (
        <div className="mt-6 p-3 bg-[#1a2c38] rounded-lg border border-white/10">
          <div className="text-sm text-slate-400 mb-1">Path:</div>
          <div className="text-xs font-mono text-white">
            {path.slice(0, currentStep + 1).map(p => p === 1 ? 'R' : 'L').join(' ')}
            {currentStep < path.length - 1 && ' ...'}
          </div>
        </div>
      )}
    </div>
  )
}
