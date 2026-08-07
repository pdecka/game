'use client'

import { useState, useEffect } from 'react'
import SlotCell from './SlotCell'
import { type SymbolType } from '@/utils/slotsConfig'

interface SlotsReelProps {
  symbols: SymbolType[]
  isSpinning: boolean
  columnIndex: number
  spinDelay: number
}

export default function SlotsReel({ symbols, isSpinning, columnIndex, spinDelay }: SlotsReelProps) {
  const [displaySymbols, setDisplaySymbols] = useState<SymbolType[]>(symbols)
  const [isAnimating, setIsAnimating] = useState(false)
  
  useEffect(() => {
    if (isSpinning && !isAnimating) {
      setIsAnimating(true)
      
      // Start spinning animation after delay
      const startDelay = columnIndex * spinDelay
      const spinTimeout = setTimeout(() => {
        startSpinning()
      }, startDelay)
      
      return () => clearTimeout(spinTimeout)
    } else if (!isSpinning && isAnimating) {
      // Stop spinning and show final symbols
      setIsAnimating(false)
      setDisplaySymbols(symbols)
    }
  }, [isSpinning, columnIndex, spinDelay, symbols, isAnimating])
  
  const startSpinning = () => {
    const spinDuration = 2000 // 2 seconds
    const spinInterval = 100 // Update every 100ms
    const totalUpdates = spinDuration / spinInterval
    
    let updateCount = 0
    
    const spinIntervalId = setInterval(() => {
      updateCount++
      
      // Generate random symbols for spinning effect
      const randomSymbols: SymbolType[] = []
      const possibleSymbols: SymbolType[] = ['1', '2', '3', '4', '5', '6', '7', 'bonus', 'wild']
      
      for (let i = 0; i < 5; i++) {
        randomSymbols.push(possibleSymbols[Math.floor(Math.random() * possibleSymbols.length)])
      }
      
      setDisplaySymbols(randomSymbols)
      
      if (updateCount >= totalUpdates) {
        clearInterval(spinIntervalId)
        // Show final symbols
        setDisplaySymbols(symbols)
        setIsAnimating(false)
      }
    }, spinInterval)
  }
  
  return (
    <div className="flex flex-col gap-2">
      {displaySymbols.map((symbol, index) => (
        <SlotCell
          key={`${columnIndex}-${index}`}
          symbol={symbol}
          isSpinning={isAnimating}
          size="medium"
        />
      ))}
    </div>
  )
}
