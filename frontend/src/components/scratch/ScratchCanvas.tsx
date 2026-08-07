'use client'

import { useRef, useEffect, useCallback, useState } from 'react'

interface ScratchCanvasProps {
  width: number
  height: number
  scratchColor: string
  scratchPattern?: string
  isScratching: boolean
  onScratchProgress: (scratched: number, total: number) => void
  onScratchComplete?: () => void
  brushSize?: number
  hardness?: number
  opacity?: number
  shape?: 'circle' | 'square'
  disabled?: boolean
  className?: string
}

export default function ScratchCanvas({
  width,
  height,
  scratchColor,
  scratchPattern = '',
  isScratching,
  onScratchProgress,
  onScratchComplete,
  brushSize = 30,
  hardness = 0.6,
  opacity = 0.9,
  shape = 'circle',
  disabled = false,
  className = ''
}: ScratchCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null)
  const animationFrameRef = useRef<number>()
  const scratchDataRef = useRef<ImageData | null>(null)

  // Initialize canvas
  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = width
    canvas.height = height

    // Create scratch layer
    ctx.globalCompositeOperation = 'source-over'
    
    // Apply scratch pattern or solid color
    if (scratchPattern) {
      // Create pattern
      const patternCanvas = document.createElement('canvas')
      patternCanvas.width = 20
      patternCanvas.height = 20
      const patternCtx = patternCanvas.getContext('2d')
      
      if (patternCtx) {
        // Draw pattern
        patternCtx.fillStyle = scratchColor
        patternCtx.fillRect(0, 0, 20, 20)
        
        // Add pattern details
        patternCtx.strokeStyle = scratchColor
        patternCtx.lineWidth = 1
        patternCtx.globalAlpha = 0.3
        
        for (let i = 0; i < 20; i += 4) {
          patternCtx.beginPath()
          patternCtx.moveTo(i, 0)
          patternCtx.lineTo(i, 20)
          patternCtx.stroke()
          
          patternCtx.beginPath()
          patternCtx.moveTo(0, i)
          patternCtx.lineTo(20, i)
          patternCtx.stroke()
        }
        
        const pattern = ctx.createPattern(patternCanvas, 'repeat')
        if (pattern) {
          ctx.fillStyle = pattern
        }
      }
    } else {
      ctx.fillStyle = scratchColor
    }
    
    ctx.fillRect(0, 0, width, height)
    
    // Add texture effect
    ctx.globalAlpha = 0.1
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const size = Math.random() * 2
      
      ctx.fillStyle = scratchColor
      ctx.fillRect(x, y, size, size)
    }
    
    // Store initial scratch data for progress calculation
    scratchDataRef.current = ctx.getImageData(0, 0, width, height)
    
    setIsInitialized(true)
  }, [width, height, scratchColor, scratchPattern])

  // Calculate scratch progress
  const calculateProgress = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !scratchDataRef.current) return 0

    const ctx = canvas.getContext('2d')
    if (!ctx) return 0

    const currentData = ctx.getImageData(0, 0, width, height)
    const originalData = scratchDataRef.current
    
    let transparentPixels = 0
    const totalPixels = width * height
    
    for (let i = 3; i < currentData.data.length; i += 4) {
      // Check alpha channel (transparency)
      if (currentData.data[i] < originalData.data[i] * 0.5) {
        transparentPixels++
      }
    }
    
    return transparentPixels
  }, [width, height])

  // Scratch at position
  const scratchAt = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current
    if (!canvas || disabled) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.globalCompositeOperation = 'destination-out'
    ctx.globalAlpha = opacity

    if (shape === 'circle') {
      // Create circular brush with hardness
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, brushSize)
      gradient.addColorStop(0, `rgba(0,0,0,1)`)
      gradient.addColorStop(hardness, `rgba(0,0,0,0.8)`)
      gradient.addColorStop(1, `rgba(0,0,0,0)`)
      
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x, y, brushSize, 0, Math.PI * 2)
      ctx.fill()
    } else {
      // Square brush
      ctx.fillStyle = `rgba(0,0,0,${opacity})`
      ctx.fillRect(x - brushSize / 2, y - brushSize / 2, brushSize, brushSize)
    }

    // Calculate progress
    const scratched = calculateProgress()
    const total = width * height
    onScratchProgress(scratched, total)

    // Check if complete
    const progress = (scratched / total) * 100
    if (progress >= 60 && onScratchComplete) {
      onScratchComplete()
    }
  }, [brushSize, hardness, opacity, shape, disabled, calculateProgress, onScratchProgress, onScratchComplete, width, height])

  // Handle mouse/touch events
  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (!isScratching || disabled || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    setIsDrawing(true)
    lastPositionRef.current = { x, y }
    scratchAt(x, y)
  }, [isScratching, disabled, scratchAt])

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDrawing || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    if (lastPositionRef.current) {
      // Interpolate between last position and current position for smooth scratching
      const dx = x - lastPositionRef.current.x
      const dy = y - lastPositionRef.current.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      const steps = Math.max(Math.floor(distance / 5), 1)

      for (let i = 0; i <= steps; i++) {
        const t = i / steps
        const interpX = lastPositionRef.current.x + dx * t
        const interpY = lastPositionRef.current.y + dy * t
        scratchAt(interpX, interpY)
      }
    }

    lastPositionRef.current = { x, y }
  }, [isDrawing, scratchAt])

  const handleEnd = useCallback(() => {
    setIsDrawing(false)
    lastPositionRef.current = null
  }, [])

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    handleStart(e.clientX, e.clientY)
  }, [handleStart])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY)
  }, [handleMove])

  const handleMouseUp = useCallback(() => {
    handleEnd()
  }, [handleEnd])

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    handleStart(touch.clientX, touch.clientY)
  }, [handleStart])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    handleMove(touch.clientX, touch.clientY)
  }, [handleMove])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    handleEnd()
  }, [handleEnd])

  // Animation loop for smooth scratching
  useEffect(() => {
    if (isDrawing && isScratching) {
      const animate = () => {
        // Animation logic can be added here for particle effects
        animationFrameRef.current = requestAnimationFrame(animate)
      }
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isDrawing, isScratching])

  // Initialize canvas on mount
  useEffect(() => {
    initializeCanvas()
  }, [initializeCanvas])

  // Re-initialize when scratch properties change
  useEffect(() => {
    if (isInitialized) {
      initializeCanvas()
    }
  }, [scratchColor, scratchPattern, isInitialized, initializeCanvas])

  // Auto-reveal effect
  useEffect(() => {
    if (!isScratching && isInitialized && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        // Add subtle shimmer effect when not scratching
        ctx.globalCompositeOperation = 'source-over'
        ctx.globalAlpha = 0.05
        
        const time = Date.now() / 1000
        const shimmerX = (Math.sin(time) + 1) * width / 2
        
        const gradient = ctx.createLinearGradient(shimmerX - 50, 0, shimmerX + 50, 0)
        gradient.addColorStop(0, 'rgba(255,255,255,0)')
        gradient.addColorStop(0.5, 'rgba(255,255,255,0.3)')
        gradient.addColorStop(1, 'rgba(255,255,255,0)')
        
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)
      }
    }
  }, [isScratching, isInitialized, width, height])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 cursor-pointer ${disabled ? 'cursor-not-allowed' : ''} ${className}`}
      style={{
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="button"
      tabIndex={0}
      aria-label="Scratch card surface"
    />
  )
}

// Utility component for scratch card container
interface ScratchCardContainerProps {
  children: React.ReactNode
  width: number
  height: number
  className?: string
}

export function ScratchCardContainer({ 
  children, 
  width, 
  height, 
  className = '' 
}: ScratchCardContainerProps) {
  return (
    <div 
      className={`relative overflow-hidden rounded-lg ${className}`}
      style={{ width, height }}
    >
      {children}
    </div>
  )
}

// Utility for creating scratch particles
export function createScratchParticles(x: number, y: number, count: number = 5) {
  const particles = []
  
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count
    const velocity = 2 + Math.random() * 3
    const size = 2 + Math.random() * 4
    
    particles.push({
      id: `particle-${Date.now()}-${i}`,
      x,
      y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      size,
      lifetime: 1000 + Math.random() * 500,
      opacity: 0.8
    })
  }
  
  return particles
}

// Utility for animating scratch particles
export function animateScratchParticles(
  particles: ReturnType<typeof createScratchParticles>,
  deltaTime: number
) {
  return particles
    .map(particle => ({
      ...particle,
      x: particle.x + particle.vx * deltaTime / 16,
      y: particle.y + particle.vy * deltaTime / 16,
      vy: particle.vy + 0.2 * deltaTime / 16, // Gravity
      opacity: particle.opacity * (1 - deltaTime / particle.lifetime),
      lifetime: particle.lifetime - deltaTime
    }))
    .filter(particle => particle.lifetime > 0 && particle.opacity > 0.01)
}
