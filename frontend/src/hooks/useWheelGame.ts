'use client'

import { useState, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import {
  type Difficulty,
  type GameState,
  type WheelRound,
  type WheelResult,
  type WheelSegment
} from '@/utils/wheelConfig'
import {
  calculateWinProbability,
  getDifficultyRiskScore
} from '@/utils/wheelMath'

// Fixed segments defined by the backend wheel game.
export const WHEEL_SEGMENTS: WheelSegment[] = [
  { id: 'seg-0', multiplier: 0.2, weight: 1, color: '#6B7280', label: '0.2x' },
  { id: 'seg-1', multiplier: 0.5, weight: 1, color: '#64748B', label: '0.5x' },
  { id: 'seg-2', multiplier: 1, weight: 1, color: '#10B981', label: '1x' },
  { id: 'seg-3', multiplier: 2, weight: 1, color: '#FCD34D', label: '2x' },
  { id: 'seg-4', multiplier: 5, weight: 1, color: '#A855F7', label: '5x' },
  { id: 'seg-5', multiplier: 10, weight: 1, color: '#EF4444', label: '10x' },
]

function angleForSegment(index: number): number {
  const segmentAngle = 360 / WHEEL_SEGMENTS.length
  const segmentCenter = index * segmentAngle + segmentAngle / 2
  const targetAngle = -90 - segmentCenter // Pointer at top
  const extraRotations = 5 * 360 // 5 extra rotations
  return targetAngle + extraRotations
}

interface UseWheelGameReturn {
  // Game state
  gameState: GameState
  betAmount: number
  selectedDifficulty: Difficulty
  currentResult: WheelResult | null
  currentRound: WheelRound | null
  wheelRotation: number
  segments: WheelSegment[]
  
  // History
  history: WheelRound[]
  
  // Computed values
  canSpin: boolean
  isSpinning: boolean
  showResult: boolean
  potentialMaxWin: number
  winProbability: number
  riskScore: ReturnType<typeof getDifficultyRiskScore>
  
  // Actions
  setBetAmount: (amount: number) => void
  setSelectedDifficulty: (difficulty: Difficulty) => void
  spin: () => void
  reset: () => void
}

export function useWheelGame(): UseWheelGameReturn {
  const { user, wallet, refreshWallet } = useAuth() as any
  const [gameState, setGameState] = useState<GameState>('idle')
  const [betAmount, setBetAmount] = useState(10)
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium')
  const [currentResult, setCurrentResult] = useState<WheelResult | null>(null)
  const [currentRound, setCurrentRound] = useState<WheelRound | null>(null)
  const [wheelRotation, setWheelRotation] = useState(0)
  const [history, setHistory] = useState<WheelRound[]>([])
  
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const resultTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const spin = useCallback(async () => {
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
    
    setGameState('spinning')
    
    let session: any
    try {
      const response = await api.post('/games/wheel', {
        betAmount,
        currency: 'INR',
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
    const index = Math.min(Math.max(Number(serverResult.index ?? 0), 0), WHEEL_SEGMENTS.length - 1)
    const baseSegment = WHEEL_SEGMENTS[index]
    const segment: WheelSegment = {
      ...baseSegment,
      multiplier: Number(serverResult.segment?.multiplier ?? baseSegment.multiplier),
      label: serverResult.segment?.label ?? baseSegment.label,
    }
    const isWin = Boolean(serverResult.win)
    const winAmount = Number(session?.winAmount ?? 0)
    const finalAngle = angleForSegment(index)
    
    const result: WheelResult = {
      segment,
      difficulty: selectedDifficulty,
      timestamp: Date.now(),
      gameId: session?.id ?? `wheel-${Date.now()}`,
      finalAngle,
    }
    
    const round: WheelRound = {
      id: session?.id ?? `round-${Date.now()}`,
      gameId: result.gameId,
      bet: {
        id: `bet-${Date.now()}`,
        amount: betAmount,
        difficulty: selectedDifficulty,
        timestamp: Date.now(),
      },
      result,
      payout: winAmount,
      profit: winAmount - betAmount,
      isWin,
      timestamp: Date.now(),
    }
    
    setCurrentResult(result)
    
    // Start wheel rotation animation toward the server-picked segment
    setWheelRotation(finalAngle)
    
    // Show result after animation
    const spinDuration = 4000 // 4 seconds
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
        setWheelRotation(0)
      }, 2000)
    }, spinDuration)
  }, [betAmount, gameState, selectedDifficulty, user, wallet, refreshWallet])
  
  const reset = useCallback(() => {
    // Clear all timeouts
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
      animationTimeoutRef.current = null
    }
    if (resultTimeoutRef.current) {
      clearTimeout(resultTimeoutRef.current)
      resultTimeoutRef.current = null
    }
    
    // Reset state
    setGameState('idle')
    setCurrentResult(null)
    setCurrentRound(null)
    setWheelRotation(0)
  }, [])
  
  // Computed values
  const canSpin = gameState === 'idle' && betAmount > 0
  const isSpinning = gameState === 'spinning'
  const showResult = gameState === 'result' || gameState === 'payout'
  
  const maxSegmentMultiplier = Math.max(...WHEEL_SEGMENTS.map(s => s.multiplier))
  const potentialMaxWin = betAmount * maxSegmentMultiplier
  const winProbability = calculateWinProbability(selectedDifficulty)
  const riskScore = getDifficultyRiskScore(selectedDifficulty)
  
  return {
    // Game state
    gameState,
    betAmount,
    selectedDifficulty,
    currentResult,
    currentRound,
    wheelRotation,
    segments: WHEEL_SEGMENTS,
    
    // History
    history,
    
    // Computed values
    canSpin,
    isSpinning,
    showResult,
    potentialMaxWin,
    winProbability,
    riskScore,
    
    // Actions
    setBetAmount,
    setSelectedDifficulty,
    spin,
    reset
  }
}
