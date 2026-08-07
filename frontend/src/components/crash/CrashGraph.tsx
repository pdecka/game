'use client'

import { useEffect, useRef } from 'react'
import { type CrashPoint } from '@/utils/crashMath'

interface CrashGraphProps {
  curve: CrashPoint[]
  currentMultiplier: number
  gameState: 'waiting' | 'running' | 'crashed' | 'cashed_out'
  crashPoint: number
}

export default function CrashGraph({ 
  curve, 
  currentMultiplier, 
  gameState, 
  crashPoint 
}: CrashGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    
    const drawGraph = () => {
      const rect = canvas.getBoundingClientRect()
      const width = rect.width
      const height = rect.height
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height)
      
      // Draw grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.lineWidth = 1
      
      // Horizontal lines
      for (let i = 1; i <= 10; i++) {
        const y = height - (i * height / 10)
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }
      
      // Vertical lines
      for (let i = 1; i <= 10; i++) {
        const x = i * width / 10
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      
      if (curve.length > 1) {
        // Draw curve
        ctx.strokeStyle = gameState === 'crashed' ? '#ef4444' : '#10b981'
        ctx.lineWidth = 2
        ctx.beginPath()
        
        curve.forEach((point, index) => {
          const x = (point.time / 10000) * width // Scale to canvas width
          const y = height - (point.multiplier / 10) * height // Scale to canvas height
          
          if (index === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        })
        
        ctx.stroke()
        
        // Draw current position dot
        if (gameState === 'running' || gameState === 'cashed_out') {
          const lastPoint = curve[curve.length - 1]
          const x = (lastPoint.time / 10000) * width
          const y = height - (lastPoint.multiplier / 10) * height
          
          ctx.fillStyle = '#10b981'
          ctx.beginPath()
          ctx.arc(x, y, 4, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      
      // Draw crash indicator
      if (gameState === 'crashed') {
        const crashY = height - (crashPoint / 10) * height
        
        ctx.strokeStyle = '#ef4444'
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.moveTo(0, crashY)
        ctx.lineTo(width, crashY)
        ctx.stroke()
        ctx.setLineDash([])
        
        // CRASHED text
        ctx.fillStyle = '#ef4444'
        ctx.font = 'bold 24px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('CRASHED', width / 2, crashY - 10)
      }
      
      // Draw current multiplier
      ctx.fillStyle = gameState === 'crashed' ? '#ef4444' : '#ffffff'
      ctx.font = 'bold 48px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(
        currentMultiplier.toFixed(2) + 'x', 
        width / 2, 
        height / 2
      )
    }
    
    const animate = () => {
      drawGraph()
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [curve, currentMultiplier, gameState, crashPoint])
  
  return (
    <div className="relative w-full h-full bg-[#0f212e] rounded-lg border border-white/10">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />
      
      {/* Overlay for waiting state */}
      {gameState === 'waiting' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-2">Starting Soon</div>
            <div className="text-slate-400">Place your bets for the next round</div>
          </div>
        </div>
      )}
    </div>
  )
}
