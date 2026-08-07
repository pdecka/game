'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import type { Difficulty } from '@/utils/kenoPayout'
import {
  createKenoGameState,
  selectNumber as selectNumberFromEngine,
  clearSelections as clearSelectionsFromEngine,
  quickPick as quickPickFromEngine,
  revealNextNumber as revealNextNumberFromEngine,
  resetGame as resetGameFromEngine,
  canSelectNumbers,
  canStartGame,
  isGameActive,
  getGameProgress,
  type KenoGameState,
  type KenoBet,
  type KenoDraw,
  type KenoResult,
  type KenoRound
} from '@/utils/kenoEngine'

interface UseKenoGameReturn {
  // Game state
  gameState: KenoGameState['state']
  selectedNumbers: number[]
  currentBet: any
  currentDraw: any
  currentResult: KenoResult | null
  gameHistory: KenoRound[]
  drawingNumbers: number[]
  animationIndex: number
  
  // Computed values
  canSelectNumbers: boolean
  canStartGame: boolean
  isGameActive: boolean
  gameProgress: number
  matches: number
  isWin: boolean | null
  
  // Actions
  selectNumber: (number: number) => void
  clearSelections: () => void
  quickPick: (count?: number) => void
  startGame: (betAmount: number, difficulty: Difficulty) => void
  reset: () => void
}

export function useKenoGame(): UseKenoGameReturn {
  const { user, refreshWallet } = useAuth() as any
  
  const [gameState, setGameState] = useState<KenoGameState>(createKenoGameState())
  
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const drawTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const betInFlightRef = useRef(false)
  
  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
      if (drawTimeoutRef.current) {
        clearTimeout(drawTimeoutRef.current)
      }
    }
  }, [])
  
  const selectNumber = useCallback((number: number) => {
    setGameState(prev => {
      const updated = selectNumberFromEngine(prev, number)
      return updated
    })
  }, [])
  
  const clearSelections = useCallback(() => {
    setGameState(prev => {
      const updated = clearSelectionsFromEngine(prev)
      return updated
    })
  }, [])
  
  const quickPick = useCallback((count: number = 10) => {
    setGameState(prev => {
      const updated = quickPickFromEngine(prev, count)
      return updated
    })
  }, [])
  
  const startGame = useCallback(async (betAmount: number, difficulty: Difficulty) => {
    if (betInFlightRef.current) return
    if (!['idle', 'selecting'].includes(gameState.state)) return
    
    const picks = gameState.selectedNumbers
    if (picks.length < 1 || picks.length > 10) {
      toast.error('Select 1 to 10 numbers')
      return
    }
    if (!betAmount || betAmount <= 0) {
      toast.error('Invalid bet amount')
      return
    }
    if (!user) {
      toast.error('Login to play')
      return
    }
    
    // Clear any existing timeouts
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }
    if (drawTimeoutRef.current) {
      clearTimeout(drawTimeoutRef.current)
    }
    
    betInFlightRef.current = true
    let session: any
    try {
      const response = await api.post('/games/keno', {
        betAmount,
        currency: 'INR',
        picks,
        clientSeed: Date.now().toString()
      })
      session = response.data
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Bet failed')
      betInFlightRef.current = false
      return
    }
    betInFlightRef.current = false
    
    const serverResult = session?.result || {}
    const drawNumbers: number[] = serverResult.draw || []
    const winAmount = Number(session?.winAmount ?? 0)
    
    const bet: KenoBet = {
      id: session?.id ?? `bet-${Date.now()}`,
      amount: betAmount,
      selectedNumbers: [...picks],
      difficulty,
      timestamp: Date.now()
    }
    const draw: KenoDraw = {
      id: `draw-${session?.id ?? Date.now()}`,
      numbers: drawNumbers,
      timestamp: Date.now()
    }
    const finalResult: KenoResult = {
      id: session?.id ?? `result-${Date.now()}`,
      bet,
      draw,
      matches: Number(serverResult.matches ?? 0),
      payout: winAmount,
      profit: winAmount - betAmount,
      multiplier: Number(serverResult.payoutMultiplier ?? 0),
      isWin: winAmount > 0,
      timestamp: Date.now()
    }
    
    setGameState(prev => ({
      ...prev,
      currentBet: bet,
      currentDraw: draw,
      currentResult: null,
      state: 'drawing',
      drawingNumbers: [],
      animationIndex: 0
    }))
    
    // Reveal the server-drawn numbers one by one
    let currentIndex = 0
    
    const revealNext = () => {
      if (currentIndex < drawNumbers.length) {
        setGameState(prev => {
          const updated = revealNextNumberFromEngine(prev)
          return updated
        })
        currentIndex++
        
        // Continue animation with delay
        drawTimeoutRef.current = setTimeout(revealNext, 300) // 300ms between reveals
      } else {
        // Animation complete, show the server result
        const round: KenoRound = {
          id: finalResult.id,
          result: finalResult,
          timestamp: Date.now()
        }
        setGameState(prev => ({
          ...prev,
          currentResult: finalResult,
          gameHistory: [round, ...prev.gameHistory.slice(0, 49)],
          state: 'result',
          drawingNumbers: drawNumbers,
          animationIndex: drawNumbers.length
        }))
        refreshWallet()
      }
    }
    
    // Start animation after initial delay
    animationTimeoutRef.current = setTimeout(revealNext, 1000)
  }, [gameState, user, refreshWallet])
  
  const reset = useCallback(() => {
    // Clear all timeouts
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
      animationTimeoutRef.current = null
    }
    if (drawTimeoutRef.current) {
      clearTimeout(drawTimeoutRef.current)
      drawTimeoutRef.current = null
    }
    
    // Reset game state
    setGameState(prev => {
      const updated = resetGameFromEngine(prev)
      return updated
    })
  }, [])
  
  // Computed values
  const canSelectNumbersValue = canSelectNumbers(gameState)
  const canStartGameValue = canStartGame(gameState)
  const isGameActiveValue = isGameActive(gameState)
  const gameProgressValue = getGameProgress(gameState)
  const matchesValue = gameState.currentResult?.matches || 0
  const isWinValue = gameState.currentResult?.isWin || null
  
  return {
    // Game state
    gameState: gameState.state,
    selectedNumbers: gameState.selectedNumbers,
    currentBet: gameState.currentBet,
    currentDraw: gameState.currentDraw,
    currentResult: gameState.currentResult,
    gameHistory: gameState.gameHistory,
    drawingNumbers: gameState.drawingNumbers,
    animationIndex: gameState.animationIndex,
    
    // Computed values
    canSelectNumbers: canSelectNumbersValue,
    canStartGame: canStartGameValue,
    isGameActive: isGameActiveValue,
    gameProgress: gameProgressValue,
    matches: matchesValue,
    isWin: isWinValue,
    
    // Actions
    selectNumber,
    clearSelections,
    quickPick,
    startGame,
    reset
  }
}

// Additional hook for managing bet amount
export function useKenoBetting() {
  const [betAmount, setBetAmount] = useState(10)
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  
  const quickBetAmounts = [10, 25, 50, 100, 250, 500]
  
  const setQuickBet = useCallback((amount: number) => {
    setBetAmount(amount)
  }, [])
  
  const incrementBet = useCallback(() => {
    setBetAmount(prev => Math.min(prev + 10, 10000))
  }, [])
  
  const decrementBet = useCallback(() => {
    setBetAmount(prev => Math.max(prev - 10, 1))
  }, [])
  
  return {
    betAmount,
    difficulty,
    quickBetAmounts,
    setBetAmount,
    setDifficulty,
    setQuickBet,
    incrementBet,
    decrementBet
  }
}

// Hook for managing game statistics
export function useKenoStats(history: KenoRound[]) {
  const getStats = useCallback(() => {
    if (history.length === 0) {
      return {
        totalGames: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        totalBet: 0,
        totalPayout: 0,
        totalProfit: 0,
        averageBet: 0,
        averageMatches: 0,
        bestWin: 0,
        worstLoss: 0
      }
    }
    
    const wins = history.filter(round => round.result.isWin).length
    const losses = history.filter(round => !round.result.isWin && round.result.matches > 0).length
    const totalBet = history.reduce((sum, round) => sum + round.result.bet.amount, 0)
    const totalPayout = history.reduce((sum, round) => sum + round.result.payout, 0)
    const totalProfit = history.reduce((sum, round) => sum + round.result.profit, 0)
    const averageBet = totalBet / history.length
    const averageMatches = history.reduce((sum, round) => sum + round.result.matches, 0) / history.length
    const bestWin = Math.max(...history.filter(round => round.result.isWin).map(round => round.result.profit), 0)
    const worstLoss = Math.min(...history.filter(round => round.result.profit < 0).map(round => round.result.profit), 0)
    
    return {
      totalGames: history.length,
      wins,
      losses,
      winRate: (wins / history.length) * 100,
      totalBet,
      totalPayout,
      totalProfit,
      averageBet,
      averageMatches,
      bestWin,
      worstLoss
    }
  }, [history])
  
  return getStats()
}

// Hook for managing number selection patterns
export function useKenoPatterns() {
  const [patterns, setPatterns] = useState<string[]>([])
  
  const addPattern = useCallback((name: string, numbers: number[]) => {
    setPatterns(prev => [...prev, `${name}:${numbers.join(',')}`])
  }, [])
  
  const removePattern = useCallback((index: number) => {
    setPatterns(prev => prev.filter((_, i) => i !== index))
  }, [])
  
  const getPatternNumbers = useCallback((patternString: string) => {
    const [, numbersStr] = patternString.split(':')
    return numbersStr.split(',').map(n => parseInt(n)).filter(n => !isNaN(n))
  }, [])
  
  const applyPattern = useCallback((patternString: string, onSelectNumber: (num: number) => void) => {
    const numbers = getPatternNumbers(patternString)
    numbers.forEach(num => onSelectNumber(num))
  }, [getPatternNumbers])
  
  return {
    patterns,
    addPattern,
    removePattern,
    getPatternNumbers,
    applyPattern
  }
}

// Hook for managing hot/cold numbers
export function useKenoHotCold(history: KenoRound[]) {
  const getHotColdNumbers = useCallback(() => {
    if (history.length === 0) {
      return {
        hotNumbers: [],
        coldNumbers: []
      }
    }
    
    const numberCounts: Record<number, number> = {}
    
    // Initialize all numbers with 0
    for (let i = 1; i <= 40; i++) {
      numberCounts[i] = 0
    }
    
    // Count drawn numbers
    history.forEach(round => {
      round.result.draw.numbers.forEach(num => {
        if (num >= 1 && num <= 40) {
          numberCounts[num]++
        }
      })
    })
    
    // Sort by frequency
    const sortedNumbers = Object.entries(numberCounts)
      .map(([num, count]) => ({ number: parseInt(num), count }))
      .sort((a, b) => b.count - a.count)
    
    // Get top 10 hot numbers and bottom 10 cold numbers
    const hotNumbers = sortedNumbers.slice(0, 10).map(n => n.number)
    const coldNumbers = sortedNumbers.slice(-10).map(n => n.number)
    
    return { hotNumbers, coldNumbers }
  }, [history])
  
  return getHotColdNumbers()
}

// Hook for managing game sound effects (placeholder for future implementation)
export function useKenoSounds() {
  const playSound = useCallback((soundType: 'select' | 'draw' | 'win' | 'lose') => {
    // Placeholder for sound effects
    // In a real implementation, this would play actual sound files
    console.log(`Playing sound: ${soundType}`)
  }, [])
  
  return {
    playSound
  }
}

// Hook for managing game animations
export function useKenoAnimations() {
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationType, setAnimationType] = useState<string | null>(null)
  
  const startAnimation = useCallback((type: string, duration: number = 1000) => {
    setIsAnimating(true)
    setAnimationType(type)
    
    setTimeout(() => {
      setIsAnimating(false)
      setAnimationType(null)
    }, duration)
  }, [])
  
  return {
    isAnimating,
    animationType,
    startAnimation
  }
}
