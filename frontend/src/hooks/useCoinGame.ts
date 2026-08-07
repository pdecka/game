'use client'

import { useState, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import {
  type CoinSide,
  type CoinRound,
  type CoinResult,
  type GameState
} from '@/utils/coinConfig'

interface UseCoinGameReturn {
  // Game state
  gameState: GameState
  selectedSide: CoinSide | null
  betAmount: number
  currentResult: CoinResult | null
  currentRound: CoinRound | null
  
  // History
  history: CoinRound[]
  
  // Computed values
  canFlip: boolean
  isAnimating: boolean
  showResult: boolean
  potentialPayout: number
  
  // Actions
  setSelectedSide: (side: CoinSide) => void
  setBetAmount: (amount: number) => void
  flip: () => void
  reset: () => void
}

export function useCoinGame(): UseCoinGameReturn {
  const { user, wallet, refreshWallet } = useAuth() as any
  const [gameState, setGameState] = useState<GameState>('idle')
  const [selectedSide, setSelectedSide] = useState<CoinSide | null>(null)
  const [betAmount, setBetAmount] = useState(10)
  const [currentResult, setCurrentResult] = useState<CoinResult | null>(null)
  const [currentRound, setCurrentRound] = useState<CoinRound | null>(null)
  const [history, setHistory] = useState<CoinRound[]>([])
  
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const resultTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const flip = useCallback(async () => {
    if (!selectedSide || betAmount <= 0 || gameState !== 'idle') return
    
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
    
    setGameState('flipping')
    
    let session: any
    try {
      const response = await api.post('/games/coinflip', {
        betAmount,
        currency: 'INR',
        choice: selectedSide,
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
    const flipSide: CoinSide = serverResult.flip === 'tails' ? 'tails' : 'heads'
    const isWin = Boolean(serverResult.win)
    const winAmount = Number(session?.winAmount ?? 0)
    
    const result: CoinResult = {
      side: flipSide,
      timestamp: Date.now(),
      gameId: session?.id ?? `coin-${Date.now()}`,
    }
    
    const round: CoinRound = {
      id: session?.id ?? `round-${Date.now()}`,
      gameId: result.gameId,
      bet: {
        id: `bet-${Date.now()}`,
        side: selectedSide,
        amount: betAmount,
        timestamp: Date.now(),
      },
      result,
      payout: winAmount,
      profit: winAmount - betAmount,
      isWin,
      timestamp: Date.now(),
    }
    
    setCurrentResult(result)
    
    // Animation duration (2 seconds)
    animationTimeoutRef.current = setTimeout(() => {
      setGameState('result')
      
      // Show result for 2 seconds
      resultTimeoutRef.current = setTimeout(() => {
        setCurrentRound(round)
        setHistory(prev => [round, ...prev].slice(0, 20))
        setGameState('payout')
        
        // Reset after payout display
        setTimeout(() => {
          setGameState('idle')
          setCurrentResult(null)
          setCurrentRound(null)
        }, 1500)
      }, 2000)
    }, 2000)
  }, [selectedSide, betAmount, gameState, user, wallet, refreshWallet])
  
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
  }, [])
  
  // Computed values
  const canFlip = gameState === 'idle' && selectedSide !== null && betAmount > 0
  const isAnimating = gameState === 'flipping'
  const showResult = gameState === 'result' || gameState === 'payout'
  const potentialPayout = betAmount * 2
  
  return {
    // Game state
    gameState,
    selectedSide,
    betAmount,
    currentResult,
    currentRound,
    
    // History
    history,
    
    // Computed values
    canFlip,
    isAnimating,
    showResult,
    potentialPayout,
    
    // Actions
    setSelectedSide,
    setBetAmount,
    flip,
    reset
  }
}
