'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import type { Volatility, CardType, GameState, ScratchResult, ScratchRound } from '@/utils/scratchEngine'
import {
  calculateScratchPercentage,
  shouldAutoReveal,
  validateScratchResult,
  getGameStatistics
} from '@/utils/scratchEngine'
import { useScratchConfig } from '@/utils/scratchConfig'

interface UseScratchGameReturn {
  // Game state
  gameState: GameState
  currentResult: ScratchResult | null
  gameHistory: ScratchRound[]
  betAmount: number
  volatility: Volatility
  cardType: CardType
  
  // Scratch state
  isScratching: boolean
  scratchPercentage: number
  scratchedPixels: number
  totalPixels: number
  
  // Computed values
  canPlay: boolean
  canScratch: boolean
  isAutoReveal: boolean
  totalPayout: number
  totalProfit: number
  winRate: number
  
  // Actions
  playGame: (amount: number, vol: Volatility) => void
  startScratching: () => void
  updateScratchProgress: (scratched: number, total: number) => void
  revealAll: () => void
  reset: () => void
  setVolatility: (vol: Volatility) => void
  setCardType: (type: CardType) => void
  
  // Utilities
  validateGame: () => { isValid: boolean; errors: string[] }
  getStatistics: () => ReturnType<typeof getGameStatistics>
}

export function useScratchGame(): UseScratchGameReturn {
  const config = useScratchConfig()
  
  // Game state
  const [gameState, setGameState] = useState<GameState>('idle')
  const [currentResult, setCurrentResult] = useState<ScratchResult | null>(null)
  const [gameHistory, setGameHistory] = useState<ScratchRound[]>([])
  const [betAmount, setBetAmount] = useState(10)
  const [volatility, setVolatility] = useState<Volatility>('medium')
  const [cardType, setCardType] = useState<CardType>('classic')
  
  // Scratch state
  const [isScratching, setIsScratching] = useState(false)
  const [scratchPercentage, setScratchPercentage] = useState(0)
  const [scratchedPixels, setScratchedPixels] = useState(0)
  const [totalPixels, setTotalPixels] = useState(0)
  
  // Refs for managing state
  const gameResultRef = useRef<ScratchResult | null>(null)
  const autoRevealTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const betInFlightRef = useRef(false)
  
  const { user, refreshWallet } = useAuth() as any
  
  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoRevealTimeoutRef.current) {
        clearTimeout(autoRevealTimeoutRef.current)
      }
    }
  }, [])
  
  // Play game - the backend debits the bet and pre-determines the outcome
  const playGame = useCallback(async (amount: number, vol: Volatility) => {
    if (gameState !== 'idle' || betInFlightRef.current) {
      return
    }
    
    if (!amount || amount < config.minBet || amount > config.maxBet) {
      toast.error('Invalid bet amount')
      return
    }
    
    if (!user) {
      toast.error('Login to play')
      return
    }
    
    betInFlightRef.current = true
    let session: any
    try {
      const response = await api.post('/games/scratch', {
        betAmount: amount,
        currency: 'INR',
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
    const revealed: string[] = serverResult.revealed || []
    const winAmount = Number(session?.winAmount ?? 0)
    
    const result: ScratchResult = {
      id: session?.id ?? Date.now().toString(),
      isWin: winAmount > 0,
      multiplier: Number(serverResult.payoutMultiplier ?? 0),
      totalPayout: winAmount,
      symbolGrid: [revealed],
      winningSymbols: winAmount > 0 ? [...revealed] : [],
      timestamp: Date.now(),
      volatility: vol,
      cardType: 'classic'
    }
    
    // Store result for later use
    gameResultRef.current = result
    setCurrentResult(result)
    setBetAmount(amount)
    setVolatility(vol)
    setCardType(result.cardType)
    
    // Update game state
    setGameState('generated')
    
    // Reset scratch state
    setScratchPercentage(0)
    setScratchedPixels(0)
    setTotalPixels(0)
    setIsScratching(false)
    
    // Clear any existing auto-reveal timeout
    if (autoRevealTimeoutRef.current) {
      clearTimeout(autoRevealTimeoutRef.current)
      autoRevealTimeoutRef.current = null
    }
  }, [gameState, config, user])
  
  // Start scratching
  const startScratching = useCallback(() => {
    if (gameState !== 'generated') {
      console.warn('Cannot scratch - game not generated')
      return
    }
    
    setIsScratching(true)
    setGameState('scratching')
    
    // Set up auto-reveal timeout
    autoRevealTimeoutRef.current = setTimeout(() => {
      revealAll()
    }, 5000) // Auto-reveal after 5 seconds
  }, [gameState])
  
  // Update scratch progress
  const updateScratchProgress = useCallback((scratched: number, total: number) => {
    if (!isScratching) return
    
    setScratchedPixels(scratched)
    setTotalPixels(total)
    
    const percentage = calculateScratchPercentage(scratched, total)
    setScratchPercentage(percentage)
    
    // Check if should auto-reveal
    if (shouldAutoReveal(percentage, config.autoRevealThreshold)) {
      revealAll()
    }
  }, [isScratching, config.autoRevealThreshold])
  
  // Reveal all
  const revealAll = useCallback(() => {
    if (!gameResultRef.current) return
    
    // Clear auto-reveal timeout
    if (autoRevealTimeoutRef.current) {
      clearTimeout(autoRevealTimeoutRef.current)
      autoRevealTimeoutRef.current = null
    }
    
    setIsScratching(false)
    setScratchPercentage(100)
    setGameState('revealed')
    
    refreshWallet()
    
    // Add to history after a short delay
    setTimeout(() => {
      if (gameResultRef.current) {
        const round: ScratchRound = {
          id: gameResultRef.current.id,
          betAmount,
          result: gameResultRef.current,
          timestamp: Date.now()
        }
        
        setGameHistory(prev => [round, ...prev.slice(0, 49)]) // Keep last 50 rounds
        setGameState('result')
      }
    }, 1000)
  }, [betAmount, refreshWallet])
  
  // Reset game
  const reset = useCallback(() => {
    // Clear timeouts
    if (autoRevealTimeoutRef.current) {
      clearTimeout(autoRevealTimeoutRef.current)
      autoRevealTimeoutRef.current = null
    }
    
    // Reset state
    setGameState('idle')
    setCurrentResult(null)
    gameResultRef.current = null
    setScratchPercentage(0)
    setScratchedPixels(0)
    setTotalPixels(0)
    setIsScratching(false)
  }, [])
  
  // Computed values
  const canPlay = gameState === 'idle'
  const canScratch = gameState === 'generated' || gameState === 'scratching'
  const isAutoReveal = shouldAutoReveal(scratchPercentage, config.autoRevealThreshold)
  const totalPayout = currentResult?.totalPayout || 0
  const totalProfit = totalPayout - betAmount
  const winRate = gameHistory.length > 0 
    ? (gameHistory.filter(round => round.result.isWin).length / gameHistory.length) * 100 
    : 0
  
  // Validate current game
  const validateGame = useCallback(() => {
    if (!currentResult) {
      return { isValid: false, errors: ['No game result'] }
    }
    
    return validateScratchResult(currentResult, config)
  }, [currentResult, config])
  
  // Get statistics
  const getStatistics = useCallback(() => {
    return getGameStatistics(gameHistory)
  }, [gameHistory])
  
  return {
    // Game state
    gameState,
    currentResult,
    gameHistory,
    betAmount,
    volatility,
    cardType,
    
    // Scratch state
    isScratching,
    scratchPercentage,
    scratchedPixels,
    totalPixels,
    
    // Computed values
    canPlay,
    canScratch,
    isAutoReveal,
    totalPayout,
    totalProfit,
    winRate,
    
    // Actions
    playGame,
    startScratching,
    updateScratchProgress,
    revealAll,
    reset,
    setVolatility,
    setCardType,
    
    // Utilities
    validateGame,
    getStatistics
  }
}

// Hook for managing bet amounts
export function useScratchBetting() {
  const [betAmount, setBetAmount] = useState(10)
  const [quickBetAmounts] = useState([1, 5, 10, 25, 50, 100])
  
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
    quickBetAmounts,
    setBetAmount,
    setQuickBet,
    incrementBet,
    decrementBet
  }
}

// Hook for managing game settings
export function useScratchSettings() {
  const [volatility, setVolatility] = useState<Volatility>('medium')
  const [cardTheme, setCardTheme] = useState('gold')
  const [autoReveal, setAutoReveal] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [vibrationEnabled, setVibrationEnabled] = useState(true)
  
  return {
    volatility,
    setVolatility,
    cardTheme,
    setCardTheme,
    autoReveal,
    setAutoReveal,
    soundEnabled,
    setSoundEnabled,
    vibrationEnabled,
    setVibrationEnabled
  }
}

// Hook for managing animations
export function useScratchAnimations() {
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

// Hook for managing sound effects
export function useScratchSounds() {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [volume, setVolume] = useState(0.5)
  
  const playSound = useCallback((soundType: 'scratch' | 'reveal' | 'win' | 'lose' | 'coin') => {
    if (!soundEnabled) return
    
    // Placeholder for actual sound implementation
    console.log(`Playing sound: ${soundType} at volume ${volume}`)
    
    // In a real implementation, this would play actual sound files
    // const audio = new Audio(`/sounds/${soundType}.mp3`)
    // audio.volume = volume
    // audio.play().catch(err => console.warn('Failed to play sound:', err))
  }, [soundEnabled, volume])
  
  return {
    soundEnabled,
    setSoundEnabled,
    volume,
    setVolume,
    playSound
  }
}

// Hook for managing mobile touch interactions
export function useScratchTouch() {
  const [isTouching, setIsTouching] = useState(false)
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 })
  
  const handleTouchStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    setIsTouching(true)
    
    if ('touches' in e) {
      setTouchPosition({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      })
    } else {
      setTouchPosition({
        x: e.clientX,
        y: e.clientY
      })
    }
  }, [])
  
  const handleTouchMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isTouching) return
    
    if ('touches' in e) {
      setTouchPosition({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      })
    } else {
      setTouchPosition({
        x: e.clientX,
        y: e.clientY
      })
    }
  }, [isTouching])
  
  const handleTouchEnd = useCallback(() => {
    setIsTouching(false)
  }, [])
  
  return {
    isTouching,
    touchPosition,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  }
}

// Hook for managing game persistence
export function useScratchPersistence() {
  const saveGameState = useCallback((gameState: any) => {
    try {
      const stateToSave = {
        gameHistory: gameState.gameHistory.slice(0, 10), // Save last 10 games
        settings: {
          volatility: gameState.volatility,
          cardTheme: gameState.cardTheme,
          autoReveal: gameState.autoReveal,
          soundEnabled: gameState.soundEnabled
        }
      }
      localStorage.setItem('scratchGameState', JSON.stringify(stateToSave))
    } catch (error) {
      console.error('Failed to save game state:', error)
    }
  }, [])
  
  const loadGameState = useCallback(() => {
    try {
      const saved = localStorage.getItem('scratchGameState')
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.error('Failed to load game state:', error)
    }
    return null
  }, [])
  
  const clearGameState = useCallback(() => {
    try {
      localStorage.removeItem('scratchGameState')
    } catch (error) {
      console.error('Failed to clear game state:', error)
    }
  }, [])
  
  return {
    saveGameState,
    loadGameState,
    clearGameState
  }
}

// Hook for managing game analytics
export function useScratchAnalytics() {
  const trackEvent = useCallback((eventName: string, properties: Record<string, any> = {}) => {
    // Placeholder for analytics tracking
    console.log('Analytics Event:', eventName, properties)
    
    // In a real implementation, this would send to analytics service
    // analytics.track(eventName, properties)
  }, [])
  
  const trackGamePlay = useCallback((betAmount: number, volatility: Volatility, result: ScratchResult) => {
    trackEvent('game_played', {
      betAmount,
      volatility,
      isWin: result.isWin,
      multiplier: result.multiplier,
      payout: result.totalPayout,
      cardType: result.cardType
    })
  }, [trackEvent])
  
  const trackScratchProgress = useCallback((percentage: number, duration: number) => {
    trackEvent('scratch_progress', {
      percentage,
      duration,
      isCompleted: percentage >= 100
    })
  }, [trackEvent])
  
  return {
    trackEvent,
    trackGamePlay,
    trackScratchProgress
  }
}

// Hook for managing error handling
export function useScratchErrorHandling() {
  const [error, setError] = useState<string | null>(null)
  const [errorCount, setErrorCount] = useState(0)
  
  const handleError = useCallback((error: string, recover: () => void) => {
    setError(error)
    setErrorCount(prev => prev + 1)
    
    // Auto-recover after 3 seconds
    setTimeout(() => {
      setError(null)
      recover()
    }, 3000)
  }, [])
  
  const clearError = useCallback(() => {
    setError(null)
  }, [])
  
  return {
    error,
    errorCount,
    handleError,
    clearError
  }
}

// Hook for managing accessibility
export function useScratchAccessibility() {
  const [highContrast, setHighContrast] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [screenReader, setScreenReader] = useState(false)
  
  const handleKeyboardNavigation = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        // Handle play/scratch action
        break
      case 'Escape':
        // Handle reset action
        break
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        // Handle navigation
        break
    }
  }, [])
  
  return {
    highContrast,
    setHighContrast,
    reducedMotion,
    setReducedMotion,
    screenReader,
    setScreenReader,
    handleKeyboardNavigation
  }
}
