'use client'

import { useEffect, useRef, useState } from 'react'

interface PlinkoBallProps {
  path: number[]
  currentStep: number
  rows: number
  isAnimating: boolean
}

export default function PlinkoBall({ path, currentStep, rows, isAnimating }: PlinkoBallProps) {
  const ballRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  
  useEffect(() => {
    if (!ballRef.current || currentStep >= path.length) return
    
    // Calculate ball position based on current step in path
    const pegSize = 8 // Size of peg
    const pegSpacing = 40 // Space between pegs
    const boardWidth = rows * pegSpacing
    
    // Start position (top center)
    const startX = boardWidth / 2
    const startY = 20
    
    // Calculate current position
    let currentX = startX
    let currentY = startY + (currentStep * pegSpacing)
    
    // Adjust X based on path taken so far
    let xOffset = 0
    for (let i = 0; i < currentStep && i < path.length; i++) {
      if (path[i] === 1) {
        xOffset += pegSpacing / 2
      } else {
        xOffset -= pegSpacing / 2
      }
    }
    
    currentX += xOffset
    
    // Add smooth animation
    if (isAnimating) {
      setPosition({ x: currentX, y: currentY })
    } else {
      setPosition({ x: startX, y: startY })
    }
  }, [path, currentStep, rows, isAnimating])
  
  if (currentStep >= path.length) {
    return null // Ball has landed
  }
  
  return (
    <div
      ref={ballRef}
      className="absolute w-4 h-4 bg-gradient-to-br from-red-500 to-orange-500 rounded-full shadow-lg border border-white/20 z-50 transition-all duration-300 ease-out"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {/* Ball shine effect */}
      <div className="absolute inset-0 bg-white/30 rounded-full blur-sm"></div>
    </div>
  )
}
