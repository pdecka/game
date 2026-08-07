'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import type { GameConfig, BetType, AndarBaharRound, GameResult } from '@/utils/andarBaharEngine'
import {
  DEFAULT_CONFIG,
  type AndarBaharGameState,
  type AndarBaharBet,
  type PayoutInfo
} from '@/utils/andarBaharEngine'
import { createCard, type Card, type Rank, type Suit } from '@/utils/andarBaharDeck'
import { parseServerCard } from '@/utils/serverCards'

function serverCardToCard(code: string, index: number = 0): Card {
  const { rank, suit } = parseServerCard(code)
  return createCard(suit as Suit, rank as Rank, index)
}

// Interleave the server's andar/bahar piles back into a single dealing order,
// finishing on the winning side's matching card.
function buildSequence(
  andarCodes: string[],
  baharCodes: string[],
  winner: 'andar' | 'bahar'
): Array<{ card: Card; side: 'andar' | 'bahar' }> {
  const andar = andarCodes.map((code, i) => serverCardToCard(code, i))
  const bahar = baharCodes.map((code, i) => serverCardToCard(code, i + 100))
  
  let firstSide: 'andar' | 'bahar'
  if (andar.length > bahar.length) firstSide = 'andar'
  else if (bahar.length > andar.length) firstSide = 'bahar'
  else firstSide = winner === 'andar' ? 'bahar' : 'andar'
  
  const sequence: Array<{ card: Card; side: 'andar' | 'bahar' }> = []
  const max = Math.max(andar.length, bahar.length)
  for (let i = 0; i < max; i++) {
    const firstCard = firstSide === 'andar' ? andar[i] : bahar[i]
    const secondCard = firstSide === 'andar' ? bahar[i] : andar[i]
    if (firstCard) sequence.push({ card: firstCard, side: firstSide })
    if (secondCard) sequence.push({ card: secondCard, side: firstSide === 'andar' ? 'bahar' : 'andar' })
  }
  return sequence
}

interface UseAndarBaharGameReturn {
  // Game state
  gameState: AndarBaharGameState['state']
  jokerCard: AndarBaharGameState['jokerCard']
  currentBets: AndarBaharGameState['currentBets']
  result: GameResult | null
  payouts: AndarBaharGameState['payouts']
  gameHistory: AndarBaharRound[]
  config: GameConfig
  sequence: AndarBaharGameState['sequence']
  cardsDealt: number
  
  // Computed values
  canBet: boolean
  canStartFirstDeal: boolean
  canStartSecondDeal: boolean
  canFinishGame: boolean
  gameProgress: number
  totalPayout: number
  totalProfit: number
  hasFirstBet: boolean
  hasSecondBet: boolean
  
  // Actions
  placeBet: (amount: number, betType: BetType) => void
  startFirstDeal: (amount?: number, betType?: BetType) => void
  dealFirstCards: () => void
  startSecondDeal: () => void
  dealRemainingCards: () => void
  reset: () => void
}

export function useAndarBaharGame(config: GameConfig = DEFAULT_CONFIG): UseAndarBaharGameReturn {
  const { user, refreshWallet } = useAuth() as any
  
  const [gameState, setGameState] = useState<AndarBaharGameState['state']>('betting1')
  const [jokerCard, setJokerCard] = useState<Card | null>(null)
  const [currentBets, setCurrentBets] = useState<AndarBaharBet[]>([])
  const [result, setResult] = useState<GameResult | null>(null)
  const [payouts, setPayouts] = useState<PayoutInfo[]>([])
  const [gameHistory, setGameHistory] = useState<AndarBaharRound[]>([])
  const [fullSequence, setFullSequence] = useState<Array<{ card: Card; side: 'andar' | 'bahar' }>>([])
  const [cardsDealt, setCardsDealt] = useState(0)
  const [loading, setLoading] = useState(false)
  
  const dealingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (dealingIntervalRef.current) {
        clearInterval(dealingIntervalRef.current)
      }
    }
  }, [])
  
  const placeBetAction = useCallback((amount: number, betType: BetType) => {
    setCurrentBets([{ amount, betType, timestamp: Date.now(), round: 1 }])
  }, [])
  
  const startFirstDealAction = useCallback(
    async (amount?: number, betType?: BetType) => {
      if (gameState !== 'betting1' || loading) return
      if (!user) {
        toast.error('Login to play')
        return
      }
      
      const firstBet = currentBets.find(b => b.round === 1)
      const betAmount = amount ?? firstBet?.amount ?? 0
      const selectedType = betType ?? firstBet?.betType
      if (betAmount <= 0 || !selectedType) {
        toast.error('Place a bet first')
        return
      }
      // The backend supports andar/bahar bets only.
      const betOn: 'andar' | 'bahar' = selectedType === 'andar' ? 'andar' : 'bahar'
      
      setLoading(true)
      try {
        const response = await api.post('/games/andar-bahar', {
          betAmount,
          currency: 'INR',
          betOn,
          clientSeed: Date.now().toString()
        })
        
        const data = response.data
        const res = data?.result || {}
        const winAmount = Number(data?.winAmount ?? 0)
        
        const newJokerCard = serverCardToCard(res.joker, 200)
        const newSequence = buildSequence(res.andar || [], res.bahar || [], res.winner)
        
        const gameResult: GameResult = {
          id: String(data?.id ?? `ab-${Date.now()}`),
          jokerCard: newJokerCard,
          winner: res.winner,
          position: Math.max(newSequence.length - 1, 0),
          isEarlyWin: newSequence.length === 1 && res.winner === 'bahar',
          payoutType: 'normal',
          timestamp: Date.now(),
          sequence: newSequence
        }
        
        const roundPayouts: PayoutInfo[] = [
          {
            betType: betOn,
            won: !!res.win,
            payout: winAmount,
            profit: winAmount - betAmount,
            multiplier: Number(res.payoutMultiplier ?? 2)
          }
        ]
        
        setCurrentBets([{ amount: betAmount, betType: betOn, timestamp: Date.now(), round: 1 }])
        setJokerCard(newJokerCard)
        setFullSequence(newSequence)
        setCardsDealt(0)
        setResult(null)
        setPayouts([])
        setGameState('dealing2')
        
        // Animate dealing the server's sequence card by card.
        let dealt = 0
        dealingIntervalRef.current = setInterval(() => {
          dealt += 1
          if (dealt >= newSequence.length) {
            if (dealingIntervalRef.current) {
              clearInterval(dealingIntervalRef.current)
              dealingIntervalRef.current = null
            }
            setCardsDealt(newSequence.length)
            setResult(gameResult)
            setPayouts(roundPayouts)
            setGameState('result')
            setGameHistory(prev => [
              {
                id: gameResult.id,
                bets: [{ amount: betAmount, betType: betOn, timestamp: Date.now(), round: 1 }],
                result: gameResult,
                payouts: roundPayouts,
                timestamp: Date.now()
              },
              ...prev.slice(0, 49)
            ])
            refreshWallet?.()
          } else {
            setCardsDealt(dealt)
          }
        }, 600)
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Bet failed')
      } finally {
        setLoading(false)
      }
    },
    [gameState, loading, user, currentBets, refreshWallet]
  )
  
  // The server resolves the whole round in one call; these phases no longer exist.
  const dealFirstCardsAction = useCallback(() => {}, [])
  const startSecondDealAction = useCallback(() => {}, [])
  const dealRemainingCardsAction = useCallback(() => {}, [])
  
  const resetAction = useCallback(() => {
    if (dealingIntervalRef.current) {
      clearInterval(dealingIntervalRef.current)
      dealingIntervalRef.current = null
    }
    
    setGameState('betting1')
    setJokerCard(null)
    setCurrentBets([])
    setResult(null)
    setPayouts([])
    setFullSequence([])
    setCardsDealt(0)
  }, [])
  
  // Computed values
  const canBetValue = gameState === 'betting1' && !loading
  const canStartFirstDealValue = gameState === 'betting1' && !loading
  const gameProgressValue =
    gameState === 'betting1'
      ? 0
      : gameState === 'result'
        ? 100
        : fullSequence.length > 0
          ? Math.min(10 + (cardsDealt / fullSequence.length) * 85, 95)
          : 10
  const totalPayoutValue = payouts.reduce((sum, payout) => sum + payout.payout, 0)
  const totalProfitValue = payouts.reduce((sum, payout) => sum + payout.profit, 0)
  const hasFirstBetValue = currentBets.some(bet => bet.round === 1)
  
  return {
    // Game state
    gameState,
    jokerCard,
    currentBets,
    result,
    payouts,
    gameHistory,
    config,
    sequence: fullSequence.slice(0, cardsDealt),
    cardsDealt,
    
    // Computed values
    canBet: canBetValue,
    canStartFirstDeal: canStartFirstDealValue,
    canStartSecondDeal: false,
    canFinishGame: false,
    gameProgress: gameProgressValue,
    totalPayout: totalPayoutValue,
    totalProfit: totalProfitValue,
    hasFirstBet: hasFirstBetValue,
    hasSecondBet: false,
    
    // Actions
    placeBet: placeBetAction,
    startFirstDeal: (amount?: number, betType?: BetType) => {
      void startFirstDealAction(amount, betType)
    },
    dealFirstCards: dealFirstCardsAction,
    startSecondDeal: startSecondDealAction,
    dealRemainingCards: dealRemainingCardsAction,
    reset: resetAction
  }
}

// Additional hook for managing bet amounts and types
export function useAndarBaharBetting() {
  const [betAmount, setBetAmount] = useState(10)
  const [selectedBetType, setSelectedBetType] = useState<BetType>('andar')
  
  const quickBetAmounts = [10, 25, 50, 100, 250, 500]
  
  const setQuickBet = useCallback((amount: number) => {
    setBetAmount(amount)
  }, [])
  
  const incrementBet = useCallback(() => {
    setBetAmount(prev => Math.min(prev + 10, 10000))
  }, [])
  
  const decrementBet = useCallback(() => {
    setBetAmount(prev => Math.max(prev - 10, 1))
  }, [])
  
  const setBetType = useCallback((betType: BetType) => {
    setSelectedBetType(betType)
  }, [])
  
  const clearBets = useCallback(() => {
    setSelectedBetType('andar')
  }, [])
  
  return {
    betAmount,
    selectedBetType,
    quickBetAmounts,
    setBetAmount,
    setQuickBet,
    incrementBet,
    decrementBet,
    setBetType,
    clearBets
  }
}

// Hook for managing game statistics
export function useAndarBaharStats(history: AndarBaharRound[]) {
  const getStats = useCallback(() => {
    if (history.length === 0) {
      return {
        totalGames: 0,
        andarWins: 0,
        baharWins: 0,
        earlyWins: 0,
        andarWinRate: 0,
        baharWinRate: 0,
        earlyWinRate: 0,
        totalBet: 0,
        totalPayout: 0,
        totalProfit: 0,
        averageBet: 0,
        biggestWin: 0,
        biggestLoss: 0,
        averageCardsDealt: 0,
        superBaharWins: 0
      }
    }
    
    const andarWins = history.filter(round => round.result.winner === 'andar').length
    const baharWins = history.filter(round => round.result.winner === 'bahar').length
    const earlyWins = history.filter(round => round.result.isEarlyWin).length
    const superBaharWins = history.filter(round => 
      round.result.isEarlyWin && 
      round.bets.some(bet => bet.betType === 'superBahar')
    ).length
    
    const totalBet = history.reduce((sum, round) => sum + round.bets.reduce((betSum, bet) => betSum + bet.amount, 0), 0)
    const totalPayout = history.reduce((sum, round) => sum + round.payouts.reduce((payoutSum, payout) => payoutSum + payout.payout, 0), 0)
    const totalProfit = history.reduce((sum, round) => sum + round.payouts.reduce((profitSum, payout) => profitSum + payout.profit, 0), 0)
    const averageBet = totalBet / history.length
    const biggestWin = Math.max(...history.map(round => round.payouts.reduce((max, payout) => Math.max(max, payout.profit), 0)))
    const biggestLoss = Math.min(...history.map(round => round.payouts.reduce((min, payout) => Math.min(min, payout.profit), 0)))
    
    const averageCardsDealt = history.reduce((sum, round) => sum + round.result.sequence.length, 0) / history.length
    
    return {
      totalGames: history.length,
      andarWins,
      baharWins,
      earlyWins,
      andarWinRate: (andarWins / history.length) * 100,
      baharWinRate: (baharWins / history.length) * 100,
      earlyWinRate: (earlyWins / history.length) * 100,
      totalBet,
      totalPayout,
      totalProfit,
      averageBet,
      biggestWin,
      biggestLoss,
      averageCardsDealt,
      superBaharWins
    }
  }, [history])
  
  return getStats()
}

// Hook for managing game animations
export function useAndarBaharAnimations() {
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationType, setAnimationType] = useState<string | null>(null)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  
  const startAnimation = useCallback((type: string, duration: number = 1000) => {
    setIsAnimating(true)
    setAnimationType(type)
    
    setTimeout(() => {
      setIsAnimating(false)
      setAnimationType(null)
    }, duration)
  }, [])
  
  const startCardAnimation = useCallback((totalCards: number) => {
    setCurrentCardIndex(0)
    setIsAnimating(true)
    
    const interval = setInterval(() => {
      setCurrentCardIndex(prev => {
        const next = prev + 1
        if (next >= totalCards) {
          setIsAnimating(false)
          clearInterval(interval)
        }
        return next
      })
    }, 600)
  }, [])
  
  return {
    isAnimating,
    animationType,
    currentCardIndex,
    startAnimation,
    startCardAnimation
  }
}

// Hook for managing game sound effects (placeholder for future implementation)
export function useAndarBaharSounds() {
  const playSound = useCallback((soundType: 'deal' | 'flip' | 'win' | 'lose' | 'shuffle' | 'joker') => {
    // Placeholder for sound effects
    // In a real implementation, this would play actual sound files
    console.log(`Playing sound: ${soundType}`)
  }, [])
  
  return {
    playSound
  }
}

// Hook for managing game settings
export function useAndarBaharSettings() {
  const [settings, setSettings] = useState({
    soundEnabled: true,
    animationsEnabled: true,
    autoDeal: false,
    showHints: true,
    earlyBaharPayout: 0.25,
    superBaharPayout: 11,
    secondBetPayout: 1
  })
  
  const updateSetting = useCallback((key: keyof typeof settings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])
  
  return {
    settings,
    updateSetting
  }
}

// Hook for managing game history filtering
export function useAndarBaharHistory(history: AndarBaharRound[]) {
  const [filter, setFilter] = useState<'all' | 'andar' | 'bahar' | 'early'>('all')
  
  const filteredHistory = history.filter(round => {
    switch (filter) {
      case 'andar':
        return round.result.winner === 'andar'
      case 'bahar':
        return round.result.winner === 'bahar'
      case 'early':
        return round.result.isEarlyWin
      default:
        return true
    }
  })
  
  return {
    filter,
    setFilter,
    filteredHistory
  }
}

// Hook for managing betting limits
export function useAndarBaharLimits() {
  const [limits, setLimits] = useState({
    minBet: 1,
    maxBet: 10000,
    maxTotalBet: 10000
  })
  
  const validateBet = useCallback((amount: number) => {
    if (amount < limits.minBet) {
      return { isValid: false, error: `Minimum bet is ${limits.minBet}` }
    }
    
    if (amount > limits.maxBet) {
      return { isValid: false, error: `Maximum bet is ${limits.maxBet}` }
    }
    
    return { isValid: true }
  }, [limits])
  
  return {
    limits,
    validateBet,
    setLimits
  }
}

// Hook for managing game state persistence
export function useAndarBaharPersistence() {
  const saveGameState = useCallback((gameState: AndarBaharGameState) => {
    try {
      const stateToSave = {
        gameHistory: gameState.gameHistory,
        config: gameState.config
      }
      localStorage.setItem('andarBaharGameState', JSON.stringify(stateToSave))
    } catch (error) {
      console.error('Failed to save game state:', error)
    }
  }, [])
  
  const loadGameState = useCallback(() => {
    try {
      const saved = localStorage.getItem('andarBaharGameState')
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
      localStorage.removeItem('andarBaharGameState')
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

// Hook for managing betting strategies
export function useAndarBaharStrategy(history: AndarBaharRound[]) {
  const getStrategy = useCallback((type: 'trend' | 'anti-trend' | 'balanced') => {
    if (history.length === 0) return { nextBet: 'andar', reasoning: 'No history available' }
      
      const recentRounds = history.slice(0, 10)
      const andarWins = recentRounds.filter(round => round.result.winner === 'andar').length
      const baharWins = recentRounds.filter(round => round.result.winner === 'bahar').length
      
      switch (type) {
        case 'trend':
          if (andarWins > baharWins) {
            return { nextBet: 'andar', reasoning: 'Andar is trending' }
          } else {
            return { nextBet: 'bahar', reasoning: 'Bahar is trending' }
          }
        case 'anti-trend':
          if (andarWins > baharWins) {
            return { nextBet: 'bahar', reasoning: 'Betting against Andar trend' }
          } else {
            return { nextBet: 'andar', reasoning: 'Betting against Bahar trend' }
          }
        case 'balanced':
          if (andarWins < baharWins) {
            return { nextBet: 'andar', reasoning: 'Balanced - Andar needs wins' }
          } else {
            return { nextBet: 'bahar', reasoning: 'Balanced - Bahar needs wins' }
          }
        default:
          return { nextBet: 'andar', reasoning: 'Default strategy' }
      }
    }, [history])
  
  return {
    getStrategy
  }
}

// Hook for managing hot/cold tracking
export function useAndarBaharTrends(history: AndarBaharRound[]) {
  const getTrends = useCallback(() => {
    if (history.length === 0) {
      return {
        andar: { wins: 0, losses: 0, streak: 0, trend: 'neutral' as const },
        bahar: { wins: 0, losses: 0, streak: 0, trend: 'neutral' as const },
        early: { wins: 0, trend: 'neutral' as const }
      }
    }
    
    const recentRounds = history.slice(0, 10)
    
    const getSideTrend = (side: 'andar' | 'bahar') => {
      const wins = recentRounds.filter(round => round.result.winner === side).length
      const losses = recentRounds.filter(round => round.result.winner !== side && !round.result.isEarlyWin).length
      
      // Calculate current streak
      let streak = 0
      for (const round of recentRounds) {
        if (round.result.winner === side) {
          streak++
        } else if (round.result.winner !== 'andar' && round.result.winner !== 'bahar') {
          break
        }
      }
      
      // Determine trend
      const winRate = wins / recentRounds.length
      let trend: 'hot' | 'cold' | 'neutral' = 'neutral'
      if (winRate > 0.6) trend = 'hot'
      else if (winRate < 0.4) trend = 'cold'
      
      return { wins, losses, streak, trend }
    }
    
    const earlyWins = recentRounds.filter(round => round.result.isEarlyWin).length
    const earlyTrend = earlyWins > 5 ? 'hot' : earlyWins < 2 ? 'cold' : 'neutral'
    
    return {
      andar: getSideTrend('andar'),
      bahar: getSideTrend('bahar'),
      early: { wins: earlyWins, trend: earlyTrend as 'hot' | 'cold' | 'neutral' }
    }
  }, [history])
  
  return {
    getTrends
  }
}
