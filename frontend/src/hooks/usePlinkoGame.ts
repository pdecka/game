'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import {
  type PlinkoPath,
  type PlinkoResult
} from '@/utils/plinkoMath'
import {
  getMaxMultiplier,
  type RiskLevel,
  type PlinkoRound
} from '@/utils/plinkoConfig'

export type GameState = 'idle' | 'dropping' | 'animating' | 'completed'

interface UsePlinkoGameReturn {
  // Game state
  gameState: GameState
  currentPath: PlinkoPath | null
  finalSlot: number | null
  currentMultiplier: number | null
  payout: number
  
  // Configuration
  betAmount: number
  rows: number
  risk: RiskLevel
  
  // History
  history: PlinkoRound[]
  
  // Actions
  setBetAmount: (amount: number) => void
  setRows: (rows: number) => void
  setRisk: (risk: RiskLevel) => void
  dropBall: () => void
  resetGame: () => void
  
  // Computed values
  maxMultiplier: number
  potentialMaxWin: number
}

export function usePlinkoGame(): UsePlinkoGameReturn {
  const { user, wallet, refreshWallet } = useAuth() as any
  const [gameState, setGameState] = useState<GameState>('idle')
  const [currentPath, setCurrentPath] = useState<PlinkoPath | null>(null)
  const [finalSlot, setFinalSlot] = useState<number | null>(null)
  const [currentMultiplier, setCurrentMultiplier] = useState<number | null>(null)
  const [payout, setPayout] = useState(0)
  
  const [betAmount, setBetAmount] = useState(0)
  const [rows, setRows] = useState(12)
  const [risk, setRisk] = useState<RiskLevel>('medium')
  const [history, setHistory] = useState<PlinkoRound[]>([])
  
  const animationRef = useRef<number>()
  const currentResultRef = useRef<(PlinkoResult & { sessionId: string }) | null>(null)
  
  const maxMultiplier = getMaxMultiplier(rows, risk)
  const potentialMaxWin = betAmount * maxMultiplier
  
  const resetGame = useCallback(() => {
    setGameState('idle')
    setCurrentPath(null)
    setFinalSlot(null)
    setCurrentMultiplier(null)
    setPayout(0)
    currentResultRef.current = null
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }, [])
  
  const animateBall = useCallback((path: PlinkoPath, targetSlot: number) => {
    let currentStep = 0
    const totalSteps = path.length
    
    const animate = () => {
      currentStep++
      
      if (currentStep >= totalSteps) {
        // Animation complete
        setGameState('completed')
        
        // Add to history
        if (currentResultRef.current) {
          const newRound: PlinkoRound = {
            id: currentResultRef.current.sessionId,
            timestamp: Date.now(),
            betAmount,
            rows,
            risk,
            multiplier: currentResultRef.current.multiplier,
            payout: currentResultRef.current.payout,
            path: currentResultRef.current.path,
            finalSlot: currentResultRef.current.finalSlot
          }
          
          setHistory(prev => [newRound, ...prev].slice(0, 20))
        }
        
        // Auto reset after delay
        setTimeout(() => {
          resetGame()
        }, 3000)
        
        return
      }
      
      // Continue animation
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animationRef.current = requestAnimationFrame(animate)
  }, [betAmount, rows, risk, resetGame])
  
  const dropBall = useCallback(async () => {
    if (gameState !== 'idle' || betAmount <= 0) return
    
    if (!user) {
      toast.error('Login to play')
      return
    }
    
    if (betAmount > Number(wallet?.INR ?? 0)) {
      toast.error('Insufficient balance')
      return
    }
    
    setGameState('dropping')
    
    let session: any
    try {
      const response = await api.post('/games/plinko', {
        betAmount,
        currency: 'INR',
        rows,
        risk,
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
    const path: PlinkoPath = Array.isArray(serverResult.path) ? serverResult.path : []
    const slot = Number(serverResult.slot ?? 0)
    const multiplier = Number(serverResult.multiplier ?? 0)
    const winAmount = Number(session?.winAmount ?? 0)
    
    // Store server result for animation
    currentResultRef.current = {
      path,
      finalSlot: slot,
      multiplier,
      payout: winAmount,
      sessionId: session?.id ?? `plinko-${Date.now()}`
    }
    
    // Set state for animation
    setCurrentPath(path)
    setFinalSlot(slot)
    setCurrentMultiplier(multiplier)
    setPayout(winAmount)
    
    // Start animation after a brief delay
    setTimeout(() => {
      setGameState('animating')
      animateBall(path, slot)
    }, 100)
  }, [gameState, betAmount, rows, risk, user, wallet, refreshWallet, animateBall])
  
  // Prevent changing config during game
  const setBetAmountSafe = useCallback((amount: number) => {
    if (gameState === 'idle') {
      setBetAmount(amount)
    }
  }, [gameState])
  
  const setRowsSafe = useCallback((newRows: number) => {
    if (gameState === 'idle') {
      setRows(newRows)
    }
  }, [gameState])
  
  const setRiskSafe = useCallback((newRisk: RiskLevel) => {
    if (gameState === 'idle') {
      setRisk(newRisk)
    }
  }, [gameState])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])
  
  return {
    gameState,
    currentPath,
    finalSlot,
    currentMultiplier,
    payout,
    betAmount,
    rows,
    risk,
    history,
    setBetAmount: setBetAmountSafe,
    setRows: setRowsSafe,
    setRisk: setRiskSafe,
    dropBall,
    resetGame,
    maxMultiplier,
    potentialMaxWin
  }
}
