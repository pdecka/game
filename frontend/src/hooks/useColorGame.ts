'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { 
  COLOR_NUMBERS_MAPPING,
  getPayoutForBet,
  type ColorBet,
  type ColorRound,
  type RoundResult,
  type BetType,
  type Color,
  type Number
} from '@/utils/colorConfig'
import { 
  RoundEngine,
  type RoundPhase
} from '@/utils/roundEngine'

interface PendingRound {
  bet: ColorBet
  result: RoundResult
  winAmount: number
}

interface UseColorGameReturn {
  // Round state
  gameId: string
  phase: RoundPhase
  countdown: number
  roundNumber: number
  currentResult: RoundResult | null
  
  // Betting state
  bets: ColorBet[]
  betAmount: number
  selectedColor: Color | null
  selectedNumber: Number | null
  
  // History
  history: ColorRound[]
  
  // Computed values
  canBet: boolean
  isLocked: boolean
  isShowingResult: boolean
  isPayout: boolean
  isResetting: boolean
  totalBetAmount: number
  totalPayout: number
  isWin: boolean
  currentRound: ColorRound | null
  
  // Actions
  placeBet: (type: BetType, value: Color | Number, amount: number) => void
  removeBet: (betId: string) => void
  clearAllBets: () => void
  setBetAmount: (amount: number) => void
  setSelectedColor: (color: Color | null) => void
  setSelectedNumber: (number: Number | null) => void
}

export function useColorGame(): UseColorGameReturn {
  const { user, refreshWallet } = useAuth() as any
  
  const [roundEngine] = useState(() => new RoundEngine())
  const [gameId, setGameId] = useState('')
  const [phase, setPhase] = useState<RoundPhase>('betting')
  const [countdown, setCountdown] = useState(30)
  const [roundNumber, setRoundNumber] = useState(1)
  const [currentResult, setCurrentResult] = useState<RoundResult | null>(null)
  const [bets, setBets] = useState<ColorBet[]>([])
  const [betAmount, setBetAmount] = useState(10)
  const [selectedColor, setSelectedColor] = useState<Color | null>(null)
  const [selectedNumber, setSelectedNumber] = useState<Number | null>(null)
  const [history, setHistory] = useState<ColorRound[]>([])
  const [currentRound, setCurrentRound] = useState<ColorRound | null>(null)
  
  const roundEngineRef = useRef(roundEngine)
  // Server-resolved round waiting to be revealed at the result phase
  const pendingRoundRef = useRef<PendingRound | null>(null)
  const betInFlightRef = useRef(false)
  const refreshWalletRef = useRef(refreshWallet)
  refreshWalletRef.current = refreshWallet
  
  // Setup round engine callbacks
  useEffect(() => {
    const engine = roundEngineRef.current
    
    engine.onPhaseChange((newPhase, state) => {
      setPhase(newPhase)
      setCountdown(state.countdown)
      setRoundNumber(state.roundNumber)
      
      // When entering result phase, reveal the server outcome (if the user bet)
      if (newPhase === 'result') {
        const pending = pendingRoundRef.current
        
        if (pending) {
          setCurrentResult(pending.result)
          
          const newRound: ColorRound = {
            id: `round-${Date.now()}`,
            gameId: pending.result.gameId,
            timestamp: Date.now(),
            result: pending.result,
            bets: [pending.bet],
            totalBetAmount: pending.bet.amount,
            totalPayout: pending.winAmount,
            profit: pending.winAmount - pending.bet.amount,
            isWin: pending.winAmount > 0
          }
          
          setCurrentRound(newRound)
          setHistory(prev => [newRound, ...prev].slice(0, 20))
          
          pendingRoundRef.current = null
          setBets([])
          setSelectedColor(null)
          setSelectedNumber(null)
          
          refreshWalletRef.current?.()
        } else if (state.result) {
          // No bet this round: show the engine's neutral result
          setCurrentResult(state.result)
        }
      }
      
      // When entering betting phase for new round
      if (newPhase === 'betting') {
        setGameId(state.gameId)
        setCurrentResult(null)
        setCurrentRound(null)
      }
    })
    
    engine.onCountdownUpdate((newCountdown) => {
      setCountdown(newCountdown)
    })
    
    engine.onNewRound((newGameId) => {
      setGameId(newGameId)
    })
    
    // Start the engine
    engine.start()
    
    // Cleanup
    return () => {
      engine.stop()
    }
  }, [])
  
  const placeBet = useCallback(async (type: BetType, value: Color | Number, amount: number) => {
    if (!roundEngineRef.current.canBet()) return
    if (amount <= 0) return
    if (betInFlightRef.current) return
    
    if (type !== 'color') {
      toast.error('Only color bets are available')
      return
    }
    if (!user) {
      toast.error('Login to play')
      return
    }
    if (pendingRoundRef.current) {
      toast.error('One bet per round')
      return
    }
    
    const color = value as Color
    const apiColor = color === 'purple' ? 'violet' : color
    
    betInFlightRef.current = true
    let session: any
    try {
      const response = await api.post('/games/color-prediction', {
        betAmount: amount,
        currency: 'INR',
        color: apiColor,
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
    const winAmount = Number(session?.winAmount ?? 0)
    const outcomeColor: Color = serverResult.outcome === 'violet' ? 'purple' : (serverResult.outcome as Color) || 'red'
    
    // Derive a display number consistent with the outcome color
    const roll = Math.max(1, Number(serverResult.roll ?? 1))
    const colorNumbers = COLOR_NUMBERS_MAPPING[outcomeColor]
    const number = colorNumbers[roll % colorNumbers.length]
    
    const bet: ColorBet = {
      id: session?.id ?? `bet-${Date.now()}`,
      type: 'color',
      value: color,
      amount,
      payout: Number(serverResult.payoutMultiplier ?? getPayoutForBet('color', color)),
      won: winAmount > 0,
      winAmount
    }
    
    const result: RoundResult = {
      gameId: roundEngineRef.current.getGameId(),
      number,
      color: outcomeColor,
      timestamp: Date.now()
    }
    
    // Keep the server outcome hidden until the round's result phase
    pendingRoundRef.current = { bet, result, winAmount }
    setBets([bet])
  }, [user])
  
  const removeBet = useCallback((betId: string) => {
    if (pendingRoundRef.current) {
      toast.error('Bet already placed for this round')
    }
  }, [])
  
  const clearAllBets = useCallback(() => {
    if (pendingRoundRef.current) {
      toast.error('Bet already placed for this round')
    }
  }, [])
  
  // Computed values
  const canBet = roundEngineRef.current.canBet()
  const isLocked = roundEngineRef.current.isLocked()
  const isShowingResult = roundEngineRef.current.isShowingResult()
  const isPayout = roundEngineRef.current.isPayout()
  const isResetting = roundEngineRef.current.isResetting()
  const totalBetAmount = bets.reduce((sum, bet) => sum + bet.amount, 0)
  const totalPayout = currentRound?.totalPayout || 0
  const isWin = currentRound?.isWin || false
  
  return {
    // Round state
    gameId,
    phase,
    countdown,
    roundNumber,
    currentResult,
    
    // Betting state
    bets,
    betAmount,
    selectedColor,
    selectedNumber,
    
    // History
    history,
    
    // Computed values
    canBet,
    isLocked,
    isShowingResult,
    isPayout,
    isResetting,
    totalBetAmount,
    totalPayout,
    isWin,
    currentRound,
    
    // Actions
    placeBet,
    removeBet,
    clearAllBets,
    setBetAmount,
    setSelectedColor,
    setSelectedNumber
  }
}
