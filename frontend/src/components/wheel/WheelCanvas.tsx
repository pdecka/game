'use client'

import { useEffect, useRef } from 'react'
import { 
  DIFFICULTY_CONFIGS,
  type Difficulty,
  type WheelSegment,
  type WheelResult
} from '@/utils/wheelConfig'
import { calculateSegmentAngles } from '@/utils/wheelMath'

interface WheelCanvasProps {
  difficulty: Difficulty
  rotation: number
  currentResult: WheelResult | null
  isSpinning: boolean
  segments?: WheelSegment[]
}

export default function WheelCanvas({ 
  difficulty, 
  rotation, 
  currentResult, 
  isSpinning,
  segments
}: WheelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const wheelSegments = segments ?? DIFFICULTY_CONFIGS[difficulty].segments
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 20
    
    const drawWheel = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Save context state
      ctx.save()
      
      // Apply rotation
      ctx.translate(centerX, centerY)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.translate(-centerX, -centerY)
      
      // Calculate segment angles
      const segmentAngles = calculateSegmentAngles(wheelSegments)
      
      // Draw segments
      segmentAngles.forEach(({ segment, startAngle, endAngle, midAngle }) => {
        // Draw segment arc
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, radius, (startAngle * Math.PI) / 180, (endAngle * Math.PI) / 180)
        ctx.closePath()
        
        // Fill segment
        ctx.fillStyle = segment.color
        ctx.fill()
        
        // Draw segment border
        ctx.strokeStyle = '#1a2c38'
        ctx.lineWidth = 2
        ctx.stroke()
        
        // Draw segment text
        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate((midAngle * Math.PI) / 180)
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        
        // Text styling
        ctx.fillStyle = segment.multiplier === 0 ? '#ffffff' : '#000000'
        ctx.font = 'bold 16px Arial'
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
        ctx.shadowBlur = 4
        ctx.shadowOffsetX = 1
        ctx.shadowOffsetY = 1
        
        // Draw text
        ctx.fillText(segment.label, radius * 0.7, 0)
        
        // Restore context for text
        ctx.restore()
      })
      
      // Restore main context
      ctx.restore()
      
      // Draw center circle
      ctx.beginPath()
      ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI)
      ctx.fillStyle = '#1a2c38'
      ctx.fill()
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 3
      ctx.stroke()
      
      // Draw center dot
      ctx.beginPath()
      ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI)
      ctx.fillStyle = '#ffffff'
      ctx.fill()
    }
    
    const animate = () => {
      drawWheel()
      
      if (isSpinning) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }
    
    animate()
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [difficulty, rotation, isSpinning, wheelSegments])
  
  // Highlight winning segment
  useEffect(() => {
    if (!currentResult || isSpinning) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 20
    
    // Calculate final position
    const finalRotation = currentResult.finalAngle
    const segmentAngles = calculateSegmentAngles(wheelSegments)
    
    // Find the winning segment
    const winningSegment = currentResult.segment
    const segmentIndex = wheelSegments.findIndex(s => s.id === winningSegment.id)
    
    if (segmentIndex !== -1) {
      const segmentInfo = segmentAngles[segmentIndex]
      
      // Save context
      ctx.save()
      
      // Apply final rotation
      ctx.translate(centerX, centerY)
      ctx.rotate((finalRotation * Math.PI) / 180)
      ctx.translate(-centerX, -centerY)
      
      // Draw highlight
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(
        centerX, 
        centerY, 
        radius + 5, 
        (segmentInfo.startAngle * Math.PI) / 180, 
        (segmentInfo.endAngle * Math.PI) / 180
      )
      ctx.closePath()
      
      // Glow effect
      ctx.strokeStyle = winningSegment.multiplier >= 1 ? '#10b981' : '#ef4444'
      ctx.lineWidth = 4
      ctx.shadowColor = winningSegment.multiplier >= 1 ? '#10b981' : '#ef4444'
      ctx.shadowBlur = 20
      ctx.stroke()
      
      // Restore context
      ctx.restore()
    }
  }, [currentResult, difficulty, isSpinning, wheelSegments])
  
  return (
    <div className="relative flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="max-w-full h-auto"
      />
      
      {/* Spinning indicator */}
      {isSpinning && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-600/20 text-yellow-400 rounded-full">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Spinning...</span>
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}
      
      {/* Result indicator */}
      {currentResult && !isSpinning && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
            currentResult.segment.multiplier >= 1 
              ? 'bg-emerald-600/20 text-emerald-400' 
              : 'bg-red-600/20 text-red-400'
          }`}>
            <span className="text-sm font-bold">
              {currentResult.segment.multiplier >= 1 ? 'WIN!' : 'LOSS'}
            </span>
            <span className="text-sm">
              {currentResult.segment.label}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
