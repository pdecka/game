'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import {
  generateMockPlayers,
  type CrashPoint,
  type CrashRound,
  type CrashUser
} from '@/utils/crashMath'

export type GameState = 'waiting' | 'running' | 'crashed' | 'cashed_out'

interface ActiveRound {
  id: string
  crashPoint: number
  cashOutAt: number
  win: boolean
  winAmount: number
}

// Exponential rise so even high crash points resolve in a reasonable time.
const GROWTH_RATE = 0.25

function multiplierAt(elapsedMs: number): number {
  return Math.round(Math.exp((elapsedMs / 1000) * GROWTH_RATE) * 100) / 100
}

interface UseCrashGameReturn {
  // Game state
  gameState: GameState
  currentMultiplier: number
  crashPoint: number
  timeElapsed: number
  countdown: number
  
  // Betting
  betAmount: number
  autoCashout: number
  hasActiveBet: boolean
  cashedOutAt?: number
  
  // Players
  activePlayers: CrashUser[]
  playerCount: number
  
  // History
  history: CrashRound[]
  curve: CrashPoint[]
  
  // Actions
  setBetAmount: (amount: number) => void
  setAutoCashout: (amount: number) => void
  placeBet: () => void
  cashout: () => void
  resetGame: () => void
}

export function useCrashGame(): UseCrashGameReturn {
  const { user, wallet, refreshWallet } = useAuth() as any
  const [gameState, setGameState] = useState<GameState>('waiting')
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00)
  const [crashPoint, setCrashPoint] = useState(1.00)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [countdown] = useState(0)
  
  const [betAmount, setBetAmount] = useState(0)
  const [autoCashout, setAutoCashout] = useState(2.00)
  const [hasActiveBet, setHasActiveBet] = useState(false)
  const [cashedOutAt, setCashedOutAt] = useState<number | undefined>()
  
  const [activePlayers, setActivePlayers] = useState<CrashUser[]>([])
  const [history, setHistory] = useState<CrashRound[]>([])
  const [curve, setCurve] = useState<CrashPoint[]>([])
  
  const gameStartTime = useRef<number>(0)
  const animationFrame = useRef<number>()
  const roundRef = useRef<ActiveRound | null>(null)
  const curveRef = useRef<CrashPoint[]>([])
  
  // Ambient player list (display only)
  useEffect(() => {
    setActivePlayers(generateMockPlayers(50))
  }, [])
  
  const resetGame = useCallback(() => {
    setGameState('waiting')
    setCurrentMultiplier(1.00)
    setCrashPoint(1.00)
    setTimeElapsed(0)
    setHasActiveBet(false)
    setCashedOutAt(undefined)
    setCurve([])
    curveRef.current = []
    roundRef.current = null
    
    setActivePlayers(prev => prev.map(player => ({
      ...player,
      status: 'waiting',
      profit: 0
    })))
  }, [])
  
  // Game loop animation - rises toward the server-provided crash point.
  useEffect(() => {
    if (gameState === 'running') {
      const animate = () => {
        const round = roundRef.current
        if (!round) return
        
        const now = Date.now()
        const elapsed = now - gameStartTime.current
        const multiplier = Math.min(multiplierAt(elapsed), round.crashPoint)
        
        setTimeElapsed(elapsed)
        setCurrentMultiplier(multiplier)
        
        curveRef.current = [...curveRef.current, { time: elapsed, multiplier }]
        setCurve(curveRef.current)
        
        // Auto cashout marker once the curve passes the target on a winning round.
        if (round.win && multiplier >= round.cashOutAt) {
          setCashedOutAt(round.cashOutAt)
        }
        
        // Check for crash
        if (multiplier >= round.crashPoint) {
          setGameState('crashed')
          setCurrentMultiplier(round.crashPoint)
          
          setActivePlayers(prev => prev.map(player => ({
            ...player,
            status: player.status === 'playing' ? 'lost' : player.status
          })))
          
          setHistory(prev => [{
            id: round.id,
            crashPoint: round.crashPoint,
            timestamp: Date.now()
          }, ...prev].slice(0, 20))
          
          // Start next round after delay
          setTimeout(() => {
            resetGame()
          }, 3000)
          
          return
        }
        
        animationFrame.current = requestAnimationFrame(animate)
      }
      
      animationFrame.current = requestAnimationFrame(animate)
    }
    
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current)
      }
    }
  }, [gameState, resetGame])
  
  const placeBet = useCallback(async () => {
    if (gameState !== 'waiting' || hasActiveBet) return
    
    if (!user) {
      toast.error('Login to play')
      return
    }
    
    if (betAmount <= 0) {
      toast.error('Enter a bet amount')
      return
    }
    
    if (autoCashout < 1.01) {
      toast.error('Auto cashout must be at least 1.01x')
      return
    }
    
    if (betAmount > Number(wallet?.INR ?? 0)) {
      toast.error('Insufficient balance')
      return
    }
    
    setHasActiveBet(true)
    
    let session: any
    try {
      const response = await api.post('/games/crash', {
        betAmount,
        currency: 'INR',
        cashOutAt: autoCashout,
        clientSeed: Date.now().toString(),
      })
      session = response.data
    } catch (err: any) {
      setHasActiveBet(false)
      toast.error(err.response?.data?.message || 'Bet failed')
      return
    }
    
    refreshWallet()
    
    const serverResult = session?.result || {}
    roundRef.current = {
      id: session?.id ?? `round-${Date.now()}`,
      crashPoint: Number(serverResult.crashPoint ?? 1),
      cashOutAt: Number(serverResult.cashOutAt ?? autoCashout),
      win: Boolean(serverResult.win),
      winAmount: Number(session?.winAmount ?? 0),
    }
    
    setCrashPoint(roundRef.current.crashPoint)
    setCurrentMultiplier(1.00)
    setTimeElapsed(0)
    setCashedOutAt(undefined)
    setCurve([])
    curveRef.current = []
    gameStartTime.current = Date.now()
    
    setActivePlayers(prev => prev.map(player => ({
      ...player,
      status: player.bet.amount > 0 ? 'playing' : 'waiting'
    })))
    
    setGameState('running')
  }, [gameState, hasActiveBet, betAmount, autoCashout, user, wallet, refreshWallet])
  
  // Rounds resolve on the server at the chosen auto-cashout multiplier,
  // so there is no manual mid-flight cashout.
  const cashout = useCallback(() => {}, [])
  
  return {
    gameState,
    currentMultiplier,
    crashPoint,
    timeElapsed,
    countdown,
    betAmount,
    autoCashout,
    hasActiveBet,
    cashedOutAt,
    activePlayers,
    playerCount: activePlayers.filter(p => p.status !== 'waiting').length,
    history,
    curve,
    setBetAmount,
    setAutoCashout,
    placeBet,
    cashout,
    resetGame
  }
}
