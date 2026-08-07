'use client'

import { useState, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import {
  type RollType,
  type GameState,
  type DiceRound,
  type DiceResult
} from '@/utils/diceConfig'
import {
  calculateWinChance,
  getTargetRiskScore
} from '@/utils/diceMath'

interface UseDiceGameReturn {
  // Game state
  gameState: GameState
  betAmount: number
  target: number
  rollType: RollType
  currentResult: DiceResult | null
  currentRound: DiceRound | null
  animatedRollValue: number
  
  // History
  history: DiceRound[]
  
  // Computed values
  canRoll: boolean
  isRolling: boolean
  showResult: boolean
  winProbability: number
  multiplier: number
  potentialPayout: number
  riskScore: ReturnType<typeof getTargetRiskScore>
  
  // Actions
  setBetAmount: (amount: number) => void
  setTarget: (target: number) => void
  setRollType: (rollType: RollType) => void
  roll: () => void
  reset: () => void
}

export function useDiceGame(): UseDiceGameReturn {
  const { user, wallet, refreshWallet } = useAuth() as any
  const [gameState, setGameState] = useState<GameState>('idle')
  const [betAmount, setBetAmount] = useState(10)
  const [target, setTarget] = useState(50)
  const [rollType, setRollType] = useState<RollType>('over')
  const [currentResult, setCurrentResult] = useState<DiceResult | null>(null)
  const [currentRound, setCurrentRound] = useState<DiceRound | null>(null)
  const [animatedRollValue, setAnimatedRollValue] = useState(0)
  const [history, setHistory] = useState<DiceRound[]>([])
  
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const resultTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const animateRoll = useCallback((finalValue: number) => {
    const duration = 2000 // 2 seconds
    const steps = 60 // 60 steps for smooth animation
    const stepDuration = duration / steps
    const increment = finalValue / steps
    
    let currentStep = 0
    let currentValue = 0
    
    // Clear any existing animation
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current)
    }
    
    animationIntervalRef.current = setInterval(() => {
      currentStep++
      currentValue = increment * currentStep
      
      setAnimatedRollValue(currentValue)
      
      if (currentStep >= steps) {
        if (animationIntervalRef.current) {
          clearInterval(animationIntervalRef.current)
          animationIntervalRef.current = null
        }
        setAnimatedRollValue(finalValue)
      }
    }, stepDuration)
  }, [])
  
  const roll = useCallback(async () => {
    if (betAmount <= 0 || gameState !== 'idle') return
    
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
    
    setGameState('rolling')
    
    let session: any
    try {
      const response = await api.post('/games/dice', {
        betAmount,
        currency: 'INR',
        multiplier: target,
        target: rollType === 'over' ? 'high' : 'low',
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
    const rollValue = Number(serverResult.rollValue ?? 0)
    const isWin = Boolean(serverResult.win)
    const winAmount = Number(session?.winAmount ?? 0)
    
    const result: DiceResult = {
      rollValue,
      target,
      rollType,
      winChance: calculateWinChance(target, rollType),
      multiplier: Number(serverResult.multiplier ?? target),
      timestamp: Date.now(),
      gameId: session?.id ?? `dice-${Date.now()}`,
    }
    
    const round: DiceRound = {
      id: session?.id ?? `round-${Date.now()}`,
      gameId: result.gameId,
      bet: {
        id: `bet-${Date.now()}`,
        amount: betAmount,
        target,
        rollType,
        timestamp: Date.now(),
      },
      result,
      payout: winAmount,
      profit: winAmount - betAmount,
      isWin,
      timestamp: Date.now(),
    }
    
    setCurrentResult(result)
    
    // Start roll animation toward the server-provided roll value
    animateRoll(rollValue)
    
    // Show result after animation
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
        setAnimatedRollValue(0)
      }, 2000)
    }, 2200) // Animation duration + buffer
  }, [betAmount, target, rollType, gameState, animateRoll, user, wallet, refreshWallet])
  
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
    setAnimatedRollValue(0)
  }, [])
  
  // Computed values
  const canRoll = gameState === 'idle' && betAmount > 0
  const isRolling = gameState === 'rolling'
  const showResult = gameState === 'result' || gameState === 'payout'
  
  // Calculate probability and multiplier based on current settings
  const calculateCurrentWinProbability = (targetValue: number, currentRollType: RollType): number => {
    return calculateWinChance(targetValue, currentRollType)
  }
  
  const calculateCurrentMultiplier = (winChance: number): number => {
    const houseEdge = 0.02 // 2% house edge
    const rawMultiplier = (1 / winChance) * (1 - houseEdge)
    return Math.max(1.01, rawMultiplier)
  }
  
  const winProbability = calculateCurrentWinProbability(target, rollType)
  const multiplier = calculateCurrentMultiplier(winProbability)
  const potentialPayout = betAmount * multiplier
  const riskScore = getTargetRiskScore(target, rollType)
  
  return {
    // Game state
    gameState,
    betAmount,
    target,
    rollType,
    currentResult,
    currentRound,
    animatedRollValue,
    
    // History
    history,
    
    // Computed values
    canRoll,
    isRolling,
    showResult,
    winProbability,
    multiplier,
    potentialPayout,
    riskScore,
    
    // Actions
    setBetAmount,
    setTarget,
    setRollType,
    roll,
    reset
  }
}
