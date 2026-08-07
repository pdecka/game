'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  DICE_CONFIG,
  getWinningZone,
  getLosingZone,
  getZoneColor,
  getZoneTextColor,
  type RollType
} from '@/utils/diceConfig'

interface DiceSliderProps {
  target: number
  rollType: RollType
  isDisabled: boolean
  onTargetChange: (target: number) => void
}

export default function DiceSlider({ 
  target, 
  rollType, 
  isDisabled, 
  onTargetChange 
}: DiceSliderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)
  const [hoveredValue, setHoveredValue] = useState<number | null>(null)
  
  const winningZone = getWinningZone(target, rollType)
  const losingZone = getLosingZone(target, rollType)
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isDisabled) return
    setIsDragging(true)
    updateTarget(e.clientX)
  }
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || isDisabled) return
    updateTarget(e.clientX)
  }
  
  const handleMouseUp = () => {
    setIsDragging(false)
  }
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isDisabled) return
    setIsDragging(true)
    updateTarget(e.touches[0].clientX)
  }
  
  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || isDisabled) return
    updateTarget(e.touches[0].clientX)
  }
  
  const updateTarget = (clientX: number) => {
    if (!sliderRef.current) return
    
    const rect = sliderRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(1, x / rect.width))
    const value = Math.round(percentage * 100)
    
    // Clamp to valid range
    const clampedValue = Math.max(DICE_CONFIG.MIN_TARGET, Math.min(DICE_CONFIG.MAX_TARGET, value))
    onTargetChange(clampedValue)
  }
  
  const handleClick = (e: React.MouseEvent) => {
    if (isDisabled) return
    updateTarget(e.clientX)
  }
  
  const handleMouseEnter = (value: number) => {
    setHoveredValue(value)
  }
  
  const handleMouseLeave = () => {
    setHoveredValue(null)
  }
  
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove)
      document.addEventListener('touchend', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleMouseUp)
      }
    }
  }, [isDragging, isDisabled])
  
  const getMarkerPosition = (value: number): string => {
    return `${value}%`
  }
  
  const getZonePosition = (zone: { start: number; end: number }): string => {
    return `${zone.start}% ${zone.end}%`
  }
  
  const renderZoneGradient = () => {
    const zones = []
    
    // Add losing zone
    if (losingZone.size > 0) {
      zones.push(`${getZoneColor(false)} ${getZonePosition(losingZone)}`)
    }
    
    // Add winning zone
    if (winningZone.size > 0) {
      zones.push(`${getZoneColor(true)} ${getZonePosition(winningZone)}`)
    }
    
    return `linear-gradient(to right, ${zones.join(', ')})`
  }
  
  return (
    <div className="space-y-4">
      {/* Slider Track */}
      <div
        ref={sliderRef}
        className={`relative h-8 rounded-lg cursor-pointer transition-all duration-200 ${
          isDisabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        style={{
          background: renderZoneGradient(),
          boxShadow: isDragging ? '0 0 20px rgba(34, 197, 94, 0.3)' : 'none'
        }}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
      >
        {/* Zone Labels */}
        <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
          <div className={`text-xs font-bold ${getZoneTextColor(winningZone.start > 0)}`}>
            {losingZone.size > 0 && 'LOSE'}
          </div>
          <div className={`text-xs font-bold ${getZoneTextColor(true)}`}>
            {winningZone.size > 0 && 'WIN'}
          </div>
        </div>
        
        {/* Target Marker */}
        <div
          className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 transition-all duration-200 ${
            isDragging ? 'scale-125' : 'scale-100'
          }`}
          style={{ left: getMarkerPosition(target) }}
        >
          <div className={`w-6 h-6 rounded-full border-2 border-white shadow-lg ${
            isDisabled ? 'bg-gray-400' : 'bg-emerald-500'
          }`}>
            <div className="w-full h-full rounded-full bg-emerald-400 animate-pulse"></div>
          </div>
          {/* Target Value */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
            {target}
          </div>
        </div>
        
        {/* Hover Indicator */}
        {hoveredValue !== null && !isDisabled && (
          <div
            className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 pointer-events-none"
            style={{ left: getMarkerPosition(hoveredValue) }}
          >
            <div className="w-4 h-4 rounded-full bg-white opacity-50"></div>
          </div>
        )}
      </div>
      
      {/* Scale Markers */}
      <div className="relative h-6">
        <div className="absolute inset-0 flex justify-between px-1">
          {[0, 25, 50, 75, 100].map(value => (
            <div
              key={value}
              className="relative flex flex-col items-center"
              onMouseEnter={() => handleMouseEnter(value)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="w-0.5 h-3 bg-slate-600"></div>
              <div className="text-xs text-slate-400 mt-1">{value}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Zone Information */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded ${getZoneColor(false)}`}></div>
          <div className="text-sm">
            <span className={getZoneTextColor(false)}>Losing Zone</span>
            <span className="text-slate-400 ml-1">
              ({losingZone.start.toFixed(0)}-{losingZone.end.toFixed(0)})
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded ${getZoneColor(true)}`}></div>
          <div className="text-sm">
            <span className={getZoneTextColor(true)}>Winning Zone</span>
            <span className="text-slate-400 ml-1">
              ({winningZone.start.toFixed(0)}-{winningZone.end.toFixed(0)})
            </span>
          </div>
        </div>
      </div>
      
      {/* Roll Type Indicator */}
      <div className="text-center">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
          rollType === 'over' ? 'bg-blue-600/20 text-blue-400' : 'bg-purple-600/20 text-purple-400'
        }`}>
          <span className="text-lg">
            {rollType === 'over' ? 'â' : 'â'}
          </span>
          <span className="capitalize">
            Roll {rollType} {target}
          </span>
        </div>
      </div>
      
      {/* Visual Probability Bar */}
      <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            rollType === 'over' ? 'bg-blue-500' : 'bg-purple-500'
          }`}
          style={{
            width: rollType === 'over' 
              ? `${winningZone.size}%` 
              : `${winningZone.size}%`
          }}
        ></div>
      </div>
    </div>
  )
}
