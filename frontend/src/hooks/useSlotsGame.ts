'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import {
  getWinAnimationType,
  type SlotsResult
} from '@/utils/slotsMath'
import {
  type SlotsRound,
  type SymbolType,
  type WinLine
} from '@/utils/slotsConfig'

export type GameState = 'idle' | 'spinning' | 'evaluating' | 'completed'

interface UseSlotsGameReturn {
  // Game state
  gameState: GameState
  currentGrid: SymbolType[][]
  result: SlotsResult | null
  spinCount: number
  
  // Betting
  betAmount: number
  
  // History
  history: SlotsRound[]
  
  // Animation state
  isAnimating: boolean
  winAnimationType: 'none' | 'normal' | 'big' | 'mega' | 'jackpot'
  
  // Actions
  setBetAmount: (amount: number) => void
  spin: () => void
  resetGame: () => void
  
  // Computed values
  lastWin: number
  totalPayout: number
  isWin: boolean
}

// Symbols used by the backend slots game (3 rows x 5 reels)
const SERVER_SYMBOLS: SymbolType[] = ['A', 'K', 'Q', 'J', '10', '9', '★']
const LINE_ROWS: Record<string, number> = { top: 0, mid: 1, bot: 2 }

export function useSlotsGame(): UseSlotsGameReturn {
  const { user, refreshWallet } = useAuth() as any
  
  const [gameState, setGameState] = useState<GameState>('idle')
  const [currentGrid, setCurrentGrid] = useState<SymbolType[][]>([])
  const [result, setResult] = useState<SlotsResult | null>(null)
  const [spinCount, setSpinCount] = useState(0)
  const [betAmount, setBetAmount] = useState(0)
  const [history, setHistory] = useState<SlotsRound[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [winAnimationType, setWinAnimationType] = useState<'none' | 'normal' | 'big' | 'mega' | 'jackpot'>('none')
  
  const animationTimeoutRef = useRef<NodeJS.Timeout>()
  const evaluationTimeoutRef = useRef<NodeJS.Timeout>()
  const resultRef = useRef<SlotsResult | null>(null)
  
  const spin = useCallback(async () => {
    if (gameState !== 'idle' || betAmount <= 0) return
    if (!user) {
      toast.error('Login to play')
      return
    }
    
    // Set initial state
    setGameState('spinning')
    setIsAnimating(true)
    setWinAnimationType('none')
    setResult(null)
    
    let session: any
    try {
      const response = await api.post('/games/slots', {
        betAmount,
        currency: 'INR',
        clientSeed: Date.now().toString()
      })
      session = response.data
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Bet failed')
      setGameState('idle')
      setIsAnimating(false)
      return
    }
    
    const serverResult = session?.result || {}
    const grid = (serverResult.grid || []) as SymbolType[][]
    const winAmount = Number(session?.winAmount ?? 0)
    const totalMultiplier = Number(serverResult.multiplier ?? 0)
    
    const winLines: WinLine[] = (serverResult.wins || []).map((win: any) => {
      const row = LINE_ROWS[win.line] ?? 0
      return {
        lineId: row + 1,
        symbol: win.symbol as SymbolType,
        count: Number(win.count ?? 0),
        multiplier: Number(win.multiplier ?? 0),
        positions: Array.from({ length: Number(win.count ?? 0) }, (_, col) => [row, col] as [number, number])
      }
    })
    
    const finalResult: SlotsResult = {
      grid,
      winLines,
      clusterWins: [],
      totalMultiplier,
      payout: winAmount,
      isBigWin: totalMultiplier >= 50,
      isJackpot: false
    }
    resultRef.current = finalResult
    
    // Start animation; reels stop on the server-provided grid
    startSpinAnimation(finalResult)
  }, [gameState, betAmount, user])
  
  const startSpinAnimation = useCallback((finalResult: SlotsResult) => {
    // Simulate reel spinning animation
    let animationStep = 0
    const maxSteps = 20 // Animation duration
    
    const rows = finalResult.grid.length || 3
    const cols = finalResult.grid[0]?.length || 5
    
    const animate = () => {
      animationStep++
      
      // Generate random grid for spinning effect
      const spinningGrid = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () =>
          SERVER_SYMBOLS[Math.floor(Math.random() * SERVER_SYMBOLS.length)]
        )
      )
      
      setCurrentGrid(spinningGrid)
      
      if (animationStep >= maxSteps) {
        // Animation complete, show final result
        setCurrentGrid(finalResult.grid)
        setGameState('evaluating')
        
        // Brief delay before showing results
        evaluationTimeoutRef.current = setTimeout(() => {
          showResults(finalResult)
        }, 1000)
        
        return
      }
      
      // Continue animation
      animationTimeoutRef.current = setTimeout(animate, 100)
    }
    
    animate()
  }, [])
  
  const showResults = useCallback((finalResult: SlotsResult) => {
    setResult(finalResult)
    setGameState('completed')
    setSpinCount(prev => prev + 1)
    
    // Determine win animation type
    const animationType = getWinAnimationType(finalResult)
    setWinAnimationType(animationType)
    
    // Add to history
    const newRound: SlotsRound = {
      id: `slots-${Date.now()}`,
      timestamp: Date.now(),
      betAmount,
      grid: finalResult.grid,
      winLines: finalResult.winLines,
      clusterWins: finalResult.clusterWins,
      totalMultiplier: finalResult.totalMultiplier,
      payout: finalResult.payout,
      isBigWin: finalResult.isBigWin,
      isJackpot: finalResult.isJackpot
    }
    
    setHistory(prev => [newRound, ...prev].slice(0, 20))
    
    refreshWallet()
    
    // Auto reset after delay
    const resetDelay = finalResult.isJackpot ? 8000 : finalResult.isBigWin ? 5000 : 3000
    setTimeout(() => {
      resetGame()
    }, resetDelay)
  }, [betAmount, refreshWallet])
  
  const resetGame = useCallback(() => {
    setGameState('idle')
    setCurrentGrid([])
    setResult(null)
    setIsAnimating(false)
    setWinAnimationType('none')
    resultRef.current = null
    
    // Clear timeouts
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }
    if (evaluationTimeoutRef.current) {
      clearTimeout(evaluationTimeoutRef.current)
    }
  }, [])
  
  // Prevent changing bet during game
  const setBetAmountSafe = useCallback((amount: number) => {
    if (gameState === 'idle') {
      setBetAmount(amount)
    }
  }, [gameState])
  
  // Computed values
  const lastWin = result?.payout || 0
  const totalPayout = result?.payout || 0
  const isWin = (result?.totalMultiplier || 0) > 0
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
      if (evaluationTimeoutRef.current) {
        clearTimeout(evaluationTimeoutRef.current)
      }
    }
  }, [])
  
  return {
    gameState,
    currentGrid,
    result,
    spinCount,
    betAmount,
    history,
    isAnimating,
    winAnimationType,
    setBetAmount: setBetAmountSafe,
    spin,
    resetGame,
    lastWin,
    totalPayout,
    isWin
  }
}
