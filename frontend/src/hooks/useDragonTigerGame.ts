'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import type { GameConfig, BetType, DragonTigerRound, GameResult } from '@/utils/dragonTigerEngine'
import {
  DEFAULT_CONFIG,
  type DragonTigerGameState,
  type DragonTigerBet,
  type PayoutInfo
} from '@/utils/dragonTigerEngine'
import { createCard, getShoeId, type Card, type Rank, type Suit } from '@/utils/dragonTigerDeck'
import { parseServerCard } from '@/utils/serverCards'

function serverCardToCard(code: string): Card {
  const { rank, suit } = parseServerCard(code)
  return createCard(suit as Suit, rank as Rank, 0)
}

interface UseDragonTigerGameReturn {
  // Game state
  gameState: DragonTigerGameState['state']
  dragonCard: DragonTigerGameState['dragonCard']
  tigerCard: DragonTigerGameState['tigerCard']
  currentBet: DragonTigerGameState['currentBet']
  result: GameResult | null
  payouts: DragonTigerGameState['payouts']
  gameHistory: DragonTigerRound[]
  config: GameConfig
  shoeId: string
  gameNumber: number
  
  // Computed values
  canBet: boolean
  canStart: boolean
  canFinish: boolean
  gameProgress: number
  totalPayout: number
  totalProfit: number
  
  // Actions
  placeBet: (amount: number, betType: BetType) => void
  startGame: (amount?: number, betType?: BetType) => void
  finishGame: () => void
  reset: () => void
}

export function useDragonTigerGame(config: GameConfig = DEFAULT_CONFIG): UseDragonTigerGameReturn {
  const { user, refreshWallet } = useAuth() as any
  
  const [gameState, setGameState] = useState<DragonTigerGameState['state']>('betting')
  const [dragonCard, setDragonCard] = useState<Card | null>(null)
  const [tigerCard, setTigerCard] = useState<Card | null>(null)
  const [currentBet, setCurrentBet] = useState<DragonTigerBet | null>(null)
  const [result, setResult] = useState<GameResult | null>(null)
  const [payouts, setPayouts] = useState<PayoutInfo[]>([])
  const [gameHistory, setGameHistory] = useState<DragonTigerRound[]>([])
  const [gameNumber, setGameNumber] = useState(0)
  const [loading, setLoading] = useState(false)
  const [shoeId] = useState(() => getShoeId())
  
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [])
  
  const placeBetAction = useCallback((amount: number, betType: BetType) => {
    setCurrentBet({ amount, betType, timestamp: Date.now() })
  }, [])
  
  const startGameAction = useCallback(async (amount?: number, betType?: BetType) => {
    if (gameState !== 'betting' || loading) return
    if (!user) {
      toast.error('Login to play')
      return
    }
    
    const betAmount = amount ?? currentBet?.amount ?? 0
    const betOn = betType ?? currentBet?.betType
    if (betAmount <= 0 || !betOn) {
      toast.error('Place a bet first')
      return
    }
    
    setLoading(true)
    setGameState('dealing')
    setDragonCard(null)
    setTigerCard(null)
    setResult(null)
    setPayouts([])
    
    try {
      const response = await api.post('/games/dragon-tiger', {
        betAmount,
        currency: 'INR',
        betOn,
        clientSeed: Date.now().toString()
      })
      
      const data = response.data
      const res = data?.result || {}
      const winAmount = Number(data?.winAmount ?? 0)
      
      const newDragonCard = serverCardToCard(res.dragon)
      const newTigerCard = serverCardToCard(res.tiger)
      
      const gameResult: GameResult = {
        id: String(data?.id ?? `dt-${Date.now()}`),
        dragonCard: newDragonCard,
        tigerCard: newTigerCard,
        winner: res.outcome,
        timestamp: Date.now(),
        shoeId,
        gameNumber: gameNumber + 1
      }
      
      const roundPayouts: PayoutInfo[] = [
        {
          betType: betOn,
          won: !!res.win,
          payout: winAmount,
          profit: winAmount - betAmount
        }
      ]
      
      // Reveal cards after a short dealing animation.
      animationTimeoutRef.current = setTimeout(() => {
        setDragonCard(newDragonCard)
        setTigerCard(newTigerCard)
        setResult(gameResult)
        setPayouts(roundPayouts)
        setGameState('result')
        setGameNumber(prev => prev + 1)
        setGameHistory(prev => [
          {
            id: gameResult.id,
            bet: { amount: betAmount, betType: betOn, timestamp: Date.now() },
            result: gameResult,
            payouts: roundPayouts,
            timestamp: Date.now()
          },
          ...prev.slice(0, 49)
        ])
        refreshWallet?.()
      }, 1500)
    } catch (err: any) {
      setGameState('betting')
      toast.error(err.response?.data?.message || 'Bet failed')
    } finally {
      setLoading(false)
    }
  }, [gameState, loading, user, currentBet, shoeId, gameNumber, refreshWallet])
  
  // The server resolves the round in a single call.
  const finishGameAction = useCallback(() => {}, [])
  
  const resetAction = useCallback(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
      animationTimeoutRef.current = null
    }
    
    setGameState('betting')
    setDragonCard(null)
    setTigerCard(null)
    setResult(null)
    setPayouts([])
  }, [])
  
  // Computed values
  const canBetValue = gameState === 'betting' && !loading
  const canStartValue = gameState === 'betting' && !loading && !!currentBet
  const gameProgressValue = gameState === 'betting' ? 0 : gameState === 'result' ? 100 : 50
  const totalPayoutValue = payouts.reduce((sum, payout) => sum + payout.payout, 0)
  const totalProfitValue = payouts.reduce((sum, payout) => sum + payout.profit, 0)
  
  return {
    // Game state
    gameState,
    dragonCard,
    tigerCard,
    currentBet,
    result,
    payouts,
    gameHistory,
    config,
    shoeId,
    gameNumber,
    
    // Computed values
    canBet: canBetValue,
    canStart: canStartValue,
    canFinish: false,
    gameProgress: gameProgressValue,
    totalPayout: totalPayoutValue,
    totalProfit: totalProfitValue,
    
    // Actions
    placeBet: placeBetAction,
    startGame: (amount?: number, betType?: BetType) => {
      void startGameAction(amount, betType)
    },
    finishGame: finishGameAction,
    reset: resetAction
  }
}

// Additional hook for managing bet amounts and types
export function useDragonTigerBetting() {
  const [betAmount, setBetAmount] = useState(10)
  const [selectedBetType, setSelectedBetType] = useState<BetType>('dragon')
  
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
    setSelectedBetType('dragon')
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
export function useDragonTigerStats(history: DragonTigerRound[]) {
  const getStats = useCallback(() => {
    if (history.length === 0) {
      return {
        totalGames: 0,
        dragonWins: 0,
        tigerWins: 0,
        ties: 0,
        dragonWinRate: 0,
        tigerWinRate: 0,
        tieRate: 0,
        totalBet: 0,
        totalPayout: 0,
        totalProfit: 0,
        averageBet: 0,
        biggestWin: 0,
        biggestLoss: 0,
        highestCard: 0,
        lowestCard: 0
      }
    }
    
    const dragonWins = history.filter(round => round.result.winner === 'dragon').length
    const tigerWins = history.filter(round => round.result.winner === 'tiger').length
    const ties = history.filter(round => round.result.winner === 'tie').length
    
    const totalBet = history.reduce((sum, round) => sum + round.bet.amount, 0)
    const totalPayout = history.reduce((sum, round) => sum + round.payouts.reduce((payoutSum, payout) => payoutSum + payout.payout, 0), 0)
    const totalProfit = history.reduce((sum, round) => sum + round.payouts.reduce((profitSum, payout) => profitSum + payout.profit, 0), 0)
    const averageBet = totalBet / history.length
    const biggestWin = Math.max(...history.map(round => round.payouts.reduce((max, payout) => Math.max(max, payout.profit), 0)))
    const biggestLoss = Math.min(...history.map(round => round.payouts.reduce((min, payout) => Math.min(min, payout.profit), 0)))
    
    const allCards = history.flatMap(round => [round.result.dragonCard, round.result.tigerCard])
    const highestCard = Math.max(...allCards.map(card => card.value))
    const lowestCard = Math.min(...allCards.map(card => card.value))
    
    return {
      totalGames: history.length,
      dragonWins,
      tigerWins,
      ties,
      dragonWinRate: (dragonWins / history.length) * 100,
      tigerWinRate: (tigerWins / history.length) * 100,
      tieRate: (ties / history.length) * 100,
      totalBet,
      totalPayout,
      totalProfit,
      averageBet,
      biggestWin,
      biggestLoss,
      highestCard,
      lowestCard
    }
  }, [history])
  
  return getStats()
}

// Hook for managing game animations
export function useDragonTigerAnimations() {
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationType, setAnimationType] = useState<string | null>(null)
  
  const startAnimation = useCallback((type: string, duration: number = 1000) => {
    setIsAnimating(true)
    setAnimationType(type)
    
    setTimeout(() => {
      setIsAnimating(false)
      setAnimationType(null)
    }, duration)
  }, [])
  
  return {
    isAnimating,
    animationType,
    startAnimation
  }
}

// Hook for managing game sound effects (placeholder for future implementation)
export function useDragonTigerSounds() {
  const playSound = useCallback((soundType: 'deal' | 'flip' | 'win' | 'lose' | 'shuffle') => {
    // Placeholder for sound effects
    // In a real implementation, this would play actual sound files
    console.log(`Playing sound: ${soundType}`)
  }, [])
  
  return {
    playSound
  }
}

// Hook for managing game settings
export function useDragonTigerSettings() {
  const [settings, setSettings] = useState({
    deckCount: 8,
    dragonPayout: 1,
    tigerPayout: 1,
    tiePayout: 10,
    tieRefundPercentage: 0.5,
    soundEnabled: true,
    animationsEnabled: true,
    autoDeal: false,
    showHints: true
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
export function useDragonTigerHistory(history: DragonTigerRound[]) {
  const [filter, setFilter] = useState<'all' | 'dragon' | 'tiger' | 'tie'>('all')
  
  const filteredHistory = history.filter(round => {
    switch (filter) {
      case 'dragon':
        return round.result.winner === 'dragon'
      case 'tiger':
        return round.result.winner === 'tiger'
      case 'tie':
        return round.result.winner === 'tie'
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

// Hook for managing shoe statistics
export function useDragonTigerShoe(gameState: DragonTigerGameState) {
  const getShoeStats = useCallback(() => {
    const cardsRemaining = gameState.deck.remaining
    const cardsDealt = gameState.deck.total - cardsRemaining
    const penetration = (cardsDealt / gameState.deck.total) * 100
    
    return {
      shoeId: gameState.shoeId,
      gameNumber: gameState.gameNumber,
      cardsRemaining,
      cardsDealt,
      penetration,
      needsReshuffle: penetration >= 85
    }
  }, [gameState])
  
  return getShoeStats()
}

// Hook for managing betting limits
export function useDragonTigerLimits() {
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
export function useDragonTigerPersistence() {
  const saveGameState = useCallback((gameState: DragonTigerGameState) => {
    try {
      const stateToSave = {
        gameHistory: gameState.gameHistory,
        config: gameState.config,
        shoeId: gameState.shoeId,
        gameNumber: gameState.gameNumber
      }
      localStorage.setItem('dragonTigerGameState', JSON.stringify(stateToSave))
    } catch (error) {
      console.error('Failed to save game state:', error)
    }
  }, [])
  
  const loadGameState = useCallback(() => {
    try {
      const saved = localStorage.getItem('dragonTigerGameState')
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
      localStorage.removeItem('dragonTigerGameState')
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
export function useDragonTigerStrategy(history: DragonTigerRound[]) {
  const getStrategy = useCallback((type: 'martingale' | 'fibonacci' | 'paroli' | 'dalembert') => {
    if (history.length === 0) return { nextBet: 10, reasoning: 'No history available' }
    
    const lastRound = history[0]
    const won = lastRound.payouts.some(payout => payout.won)
    const lastBet = lastRound.bet.amount
    
    switch (type) {
      case 'martingale':
        if (won) {
          return { nextBet: 10, reasoning: 'Won, reset to base bet' }
        } else {
          return { nextBet: Math.min(lastBet * 2, 1000), reasoning: 'Lost, double bet' }
        }
      case 'fibonacci':
        // Simplified fibonacci sequence
        const sequence = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55]
        const currentIndex = Math.min(history.length, sequence.length - 1)
        if (won) {
          return { nextBet: sequence[Math.max(0, currentIndex - 2)], reasoning: 'Won, step back in sequence' }
        } else {
          return { nextBet: sequence[currentIndex], reasoning: 'Lost, advance in sequence' }
        }
      case 'paroli':
        if (won) {
          return { nextBet: Math.min(lastBet * 2, 500), reasoning: 'Won, double bet (positive progression)' }
        } else {
          return { nextBet: 10, reasoning: 'Lost, reset to base bet' }
        }
      case 'dalembert':
        if (won) {
          return { nextBet: Math.max(lastBet - 10, 10), reasoning: 'Won, decrease bet' }
        } else {
          return { nextBet: lastBet + 10, reasoning: 'Lost, increase bet' }
        }
      default:
        return { nextBet: 10, reasoning: 'Unknown strategy' }
    }
  }, [history])
  
  return {
    getStrategy
  }
}

// Hook for managing hot/cold tracking
export function useDragonTigerTrends(history: DragonTigerRound[]) {
  const getTrends = useCallback(() => {
    if (history.length === 0) {
      return {
        dragon: { wins: 0, losses: 0, streak: 0, trend: 'neutral' as const },
        tiger: { wins: 0, losses: 0, streak: 0, trend: 'neutral' as const },
        tie: { wins: 0, losses: 0, streak: 0, trend: 'neutral' as const }
      }
    }
    
    const recentRounds = history.slice(0, 10)
    
    const getSideTrend = (side: 'dragon' | 'tiger' | 'tie') => {
      const wins = recentRounds.filter(round => round.result.winner === side).length
      const losses = recentRounds.filter(round => round.result.winner !== side && round.result.winner !== 'tie').length
      
      // Calculate current streak
      let streak = 0
      for (const round of recentRounds) {
        if (round.result.winner === side) {
          streak++
        } else if (round.result.winner !== 'tie') {
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
    
    return {
      dragon: getSideTrend('dragon'),
      tiger: getSideTrend('tiger'),
      tie: getSideTrend('tie')
    }
  }, [history])
  
  return {
    getTrends
  }
}
