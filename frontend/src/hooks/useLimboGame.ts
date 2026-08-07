'use client'

import { useState, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import {
  getAnimationDuration,
  LIMBO_CONFIG,
  type GameState,
  type LimboRound,
  type LimboResult
} from '@/utils/limboConfig'
import {
  calculateWinProbability,
  getMultiplierRiskScore
} from '@/utils/limboMath'

interface UseLimboGameReturn {
  // Game state
  gameState: GameState
  betAmount: number
  targetMultiplier: number
  currentResult: LimboResult | null
  currentRound: LimboRound | null
  animatedMultiplier: number
  
  // History
  history: LimboRound[]
  
  // Computed values
  canBet: boolean
  isAnimating: boolean
  showResult: boolean
  potentialPayout: number
  winProbability: number
  riskScore: ReturnType<typeof getMultiplierRiskScore>
  
  // Actions
  setBetAmount: (amount: number) => void
  setTargetMultiplier: (multiplier: number) => void
  bet: () => void
  reset: () => void
}

export function useLimboGame(): UseLimboGameReturn {
  const { user, wallet, refreshWallet } = useAuth() as any
  const [gameState, setGameState] = useState<GameState>('idle')
  const [betAmount, setBetAmount] = useState(10)
  const [targetMultiplier, setTargetMultiplier] = useState(2)
  const [currentResult, setCurrentResult] = useState<LimboResult | null>(null)
  const [currentRound, setCurrentRound] = useState<LimboRound | null>(null)
  const [animatedMultiplier, setAnimatedMultiplier] = useState(1)
  const [history, setHistory] = useState<LimboRound[]>([])
  
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const resultTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const animateMultiplier = useCallback((finalMultiplier: number) => {
    const duration = getAnimationDuration(targetMultiplier)
    const steps = 60 // 60 steps for smooth animation
    const stepDuration = duration / steps
    const increment = (finalMultiplier - 1) / steps
    
    let currentStep = 0
    let currentMultiplier = 1
    
    // Clear any existing animation
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current)
    }
    
    animationIntervalRef.current = setInterval(() => {
      currentStep++
      currentMultiplier = 1 + (increment * currentStep)
      
      setAnimatedMultiplier(currentMultiplier)
      
      if (currentStep >= steps) {
        if (animationIntervalRef.current) {
          clearInterval(animationIntervalRef.current)
          animationIntervalRef.current = null
        }
        setAnimatedMultiplier(finalMultiplier)
      }
    }, stepDuration)
  }, [targetMultiplier])
  
  const bet = useCallback(async () => {
    if (betAmount <= 0 || targetMultiplier < 1.01 || gameState !== 'idle') return
    
    if (!user) {
      toast.error('Login to play')
      return
    }
    
    if (betAmount > Number(wallet?.INR ?? 0)) {
      toast.error('Insufficient balance')
      return
    }
    
    // Clear any existing timeouts
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }
    if (resultTimeoutRef.current) {
      clearTimeout(resultTimeoutRef.current)
    }
    
    setGameState('betting')
    
    let session: any
    try {
      const response = await api.post('/games/limbo', {
        betAmount,
        currency: 'INR',
        targetMultiplier,
        clientSeed: Date.now().toString(),
      })
      session = response.data
    } catch (err: any) {
      setGameState('idle')
      toast.error(err.response?.data?.message || 'Bet failed')
      return
    }
    
    refreshWallet()
    
    const serverResult = session?.result || {}
    const resultMultiplier = Number(serverResult.resultMultiplier ?? 1)
    const isWin = Boolean(serverResult.win)
    const winAmount = Number(session?.winAmount ?? 0)
    
    const result: LimboResult = {
      generatedMultiplier: resultMultiplier,
      targetMultiplier,
      timestamp: Date.now(),
      gameId: session?.id ?? `limbo-${Date.now()}`,
      houseEdge: LIMBO_CONFIG.HOUSE_EDGE,
    }
    
    const round: LimboRound = {
      id: session?.id ?? `round-${Date.now()}`,
      gameId: result.gameId,
      bet: {
        id: `bet-${Date.now()}`,
        amount: betAmount,
        targetMultiplier,
        timestamp: Date.now(),
      },
      result,
      payout: winAmount,
      profit: winAmount - betAmount,
      isWin,
      timestamp: Date.now(),
    }
    
    setCurrentResult(result)
    
    // Start animation after brief delay
    animationTimeoutRef.current = setTimeout(() => {
      setGameState('animating')
      animateMultiplier(resultMultiplier)
      
      // Show result after animation
      const animationDuration = getAnimationDuration(targetMultiplier)
      resultTimeoutRef.current = setTimeout(() => {
        setGameState('result')
        
        setCurrentRound(round)
        setHistory(prev => [round, ...prev].slice(0, 20))
        setGameState('payout')
        
        // Reset after payout display
        setTimeout(() => {
          setGameState('idle')
          setCurrentResult(null)
          setCurrentRound(null)
          setAnimatedMultiplier(1)
        }, 2000)
      }, animationDuration + 500)
    }, 500)
  }, [betAmount, targetMultiplier, gameState, animateMultiplier, user, wallet, refreshWallet])
  
  const reset = useCallback(() => {
    // Clear all timeouts and intervals
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
      animationTimeoutRef.current = null
    }
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current)
      animationIntervalRef.current = null
    }
    if (resultTimeoutRef.current) {
      clearTimeout(resultTimeoutRef.current)
      resultTimeoutRef.current = null
    }
    
    // Reset state
    setGameState('idle')
    setCurrentResult(null)
    setCurrentRound(null)
    setAnimatedMultiplier(1)
  }, [])
  
  // Computed values
  const canBet = gameState === 'idle' && betAmount > 0 && targetMultiplier >= 1.01
  const isAnimating = gameState === 'animating'
  const showResult = gameState === 'result' || gameState === 'payout'
  const potentialPayout = betAmount * targetMultiplier
  const winProbability = calculateWinProbability(targetMultiplier)
  const riskScore = getMultiplierRiskScore(targetMultiplier)
  
  return {
    // Game state
    gameState,
    betAmount,
    targetMultiplier,
    currentResult,
    currentRound,
    animatedMultiplier,
    
    // History
    history,
    
    // Computed values
    canBet,
    isAnimating,
    showResult,
    potentialPayout,
    winProbability,
    riskScore,
    
    // Actions
    setBetAmount,
    setTargetMultiplier,
    bet,
    reset
  }
}
