'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import {
  createBet,
  validateBet,
  getBetNumbers,
  type BetType
} from '@/utils/rouletteMath'
import {
  createRouletteResult,
  WHEEL_NUMBERS,
  type Bet,
  type RouletteResult,
  type RouletteRound,
  type RouletteNumber as ConfigRouletteNumber
} from '@/utils/rouletteConfig'

export type GamePhase = 'betting' | 'spinning' | 'result' | 'resetting'

interface UseRouletteGameReturn {
  // Game state
  gamePhase: GamePhase
  currentResult: RouletteResult | null
  currentRound: RouletteRound | null
  countdown: number
  roundNumber: number
  
  // Betting
  bets: Bet[]
  selectedBetType: BetType
  selectedNumbers: ConfigRouletteNumber[]
  betAmount: number
  
  // History
  history: RouletteRound[]
  
  // Animation state
  isSpinning: boolean
  wheelRotation: number
  ballRotation: number
  
  // Actions
  placeBet: (type: BetType, amount: number, numbers?: ConfigRouletteNumber[]) => boolean
  removeBet: (betId: string) => void
  clearAllBets: () => void
  spin: () => void
  reset: () => void
  setBetAmount: (amount: number) => void
  setSelectedBetType: (type: BetType) => void
  setSelectedNumbers: (numbers: ConfigRouletteNumber[]) => void
  
  // Computed values
  totalBetAmount: number
  totalPayout: number
  isWin: boolean
  canBet: boolean
  canSpin: boolean
}

const BETTING_TIME = 15 // seconds
const SPIN_TIME = 8 // seconds
const RESULT_TIME = 5 // seconds

// The backend resolves a single bet per spin.
const SUPPORTED_BET_TYPES: BetType[] = ['red', 'black', 'odd', 'even', 'straight']

export function useRouletteGame(): UseRouletteGameReturn {
  const { user, refreshWallet } = useAuth() as any
  
  const [gamePhase, setGamePhase] = useState<GamePhase>('betting')
  const [currentResult, setCurrentResult] = useState<RouletteResult | null>(null)
  const [currentRound, setCurrentRound] = useState<RouletteRound | null>(null)
  const [countdown, setCountdown] = useState(BETTING_TIME)
  const [roundNumber, setRoundNumber] = useState(1)
  const [bets, setBets] = useState<Bet[]>([])
  const [selectedBetType, setSelectedBetType] = useState<BetType>('red')
  const [selectedNumbers, setSelectedNumbers] = useState<ConfigRouletteNumber[]>([])
  const [betAmount, setBetAmount] = useState(10)
  const [history, setHistory] = useState<RouletteRound[]>([])
  const [isSpinning, setIsSpinning] = useState(false)
  const [wheelRotation, setWheelRotation] = useState(0)
  const [ballRotation, setBallRotation] = useState(0)
  
  const countdownRef = useRef<NodeJS.Timeout>()
  const phaseTimeoutRef = useRef<NodeJS.Timeout>()
  const spinInFlightRef = useRef(false)
  
  // Countdown timer
  useEffect(() => {
    if (gamePhase === 'betting') {
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            // Auto-spin when time runs out
            if (bets.length > 0) {
              spin()
            } else {
              // Reset if no bets
              reset()
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }
    }
    
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }
    }
  }, [gamePhase, bets.length])
  
  const placeBet = useCallback((type: BetType, amount: number, numbers?: ConfigRouletteNumber[]): boolean => {
    if (gamePhase !== 'betting') return false
    if (amount <= 0) return false
    if (!user) {
      toast.error('Login to play')
      return false
    }
    if (!SUPPORTED_BET_TYPES.includes(type)) {
      toast.error('Only Red/Black, Odd/Even and single number bets are available')
      return false
    }
    if (type === 'straight') {
      const n = numbers?.[0]
      if (n === undefined || n === '00') {
        toast.error('Pick a single number from 0 to 36')
        return false
      }
    }
    
    const betNumbers = getBetNumbers(type, numbers || [])
    if (!validateBet(type, amount, betNumbers)) return false
    
    const newBet = createBet(type, amount, betNumbers)
    // One bet per spin: placing a new bet replaces the previous one
    setBets([newBet])
    
    return true
  }, [gamePhase, user])
  
  const removeBet = useCallback((betId: string) => {
    if (gamePhase !== 'betting') return
    setBets(prev => prev.filter(bet => bet.id !== betId))
  }, [gamePhase])
  
  const clearAllBets = useCallback(() => {
    if (gamePhase !== 'betting') return
    setBets([])
  }, [gamePhase])
  
  const spin = useCallback(async () => {
    if (gamePhase !== 'betting' || bets.length === 0 || spinInFlightRef.current) return
    if (!user) {
      toast.error('Login to play')
      reset()
      return
    }
    
    const bet = bets[0]
    const payload: Record<string, unknown> = {
      betAmount: bet.amount,
      currency: 'INR',
      betType: bet.type === 'straight' ? 'number' : bet.type,
      clientSeed: Date.now().toString()
    }
    if (bet.type === 'straight') {
      payload.number = Number(bet.numbers[0])
    }
    
    spinInFlightRef.current = true
    let session: any
    try {
      const response = await api.post('/games/roulette', payload)
      session = response.data
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Bet failed')
      spinInFlightRef.current = false
      reset()
      return
    }
    spinInFlightRef.current = false
    
    const spinNumber = Number(session?.result?.spin ?? 0) as ConfigRouletteNumber
    const result = createRouletteResult(spinNumber)
    const winAmount = Number(session?.winAmount ?? 0)
    
    const evaluatedBet: Bet = { ...bet, won: winAmount > 0, winAmount }
    const round: RouletteRound = {
      id: session?.id ?? `roulette-${Date.now()}`,
      timestamp: Date.now(),
      result,
      bets: [evaluatedBet],
      totalBetAmount: bet.amount,
      totalPayout: winAmount,
      profit: winAmount - bet.amount,
      isWin: winAmount > 0
    }
    
    setGamePhase('spinning')
    setIsSpinning(true)
    setCountdown(SPIN_TIME)
    
    // Animate the wheel/ball so the ball lands on the server-provided number
    const wheelIndex = WHEEL_NUMBERS.indexOf(spinNumber)
    const segmentAngle = wheelIndex >= 0 ? (360 / WHEEL_NUMBERS.length) * wheelIndex : 0
    const targetRotation = wheelRotation + (360 * 5) + (Math.random() * 360)
    const targetBallRotation = targetRotation + segmentAngle - (360 * 8)
    
    setWheelRotation(targetRotation)
    setBallRotation(targetBallRotation)
    
    // Move to result phase after spin
    phaseTimeoutRef.current = setTimeout(() => {
      showResults(round)
    }, SPIN_TIME * 1000)
  }, [gamePhase, bets, wheelRotation, user])
  
  const showResults = useCallback((round: RouletteRound) => {
    setCurrentResult(round.result)
    setCurrentRound(round)
    setGamePhase('result')
    setIsSpinning(false)
    setCountdown(RESULT_TIME)
    
    // Add to history
    setHistory(prev => [round, ...prev].slice(0, 20))
    
    refreshWallet()
    
    // Auto-reset after result display
    phaseTimeoutRef.current = setTimeout(() => {
      reset()
    }, RESULT_TIME * 1000)
  }, [refreshWallet])
  
  const reset = useCallback(() => {
    setGamePhase('betting')
    setCurrentResult(null)
    setCurrentRound(null)
    setBets([])
    setSelectedNumbers([])
    setCountdown(BETTING_TIME)
    setRoundNumber(prev => prev + 1)
    setIsSpinning(false)
    setWheelRotation(prev => prev % 360)
    setBallRotation(prev => prev % 360)
    
    // Clear timeouts
    if (phaseTimeoutRef.current) {
      clearTimeout(phaseTimeoutRef.current)
    }
  }, [])
  
  // Computed values
  const totalBetAmount = bets.reduce((total, bet) => total + bet.amount, 0)
  const totalPayout = currentRound?.totalPayout || 0
  const isWin = (currentRound?.isWin || false)
  const canBet = gamePhase === 'betting'
  const canSpin = gamePhase === 'betting' && bets.length > 0
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }
      if (phaseTimeoutRef.current) {
        clearTimeout(phaseTimeoutRef.current)
      }
    }
  }, [])
  
  return {
    gamePhase,
    currentResult,
    currentRound,
    countdown,
    roundNumber,
    bets,
    selectedBetType,
    selectedNumbers,
    betAmount,
    history,
    isSpinning,
    wheelRotation,
    ballRotation,
    placeBet,
    removeBet,
    clearAllBets,
    spin,
    reset,
    setBetAmount,
    setSelectedBetType,
    setSelectedNumbers,
    totalBetAmount,
    totalPayout,
    isWin,
    canBet,
    canSpin
  }
}
