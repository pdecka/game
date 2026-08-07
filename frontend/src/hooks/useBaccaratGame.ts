'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import type { GameConfig, BetType, BaccaratRound, GameResult } from '@/utils/baccaratEngine'
import {
  DEFAULT_CONFIG,
  type BaccaratGameState,
  type BaccaratBet
} from '@/utils/baccaratEngine'
import { createBaccaratHand, type PayoutInfo, type BaccaratHand } from '@/utils/baccaratRules'
import { createCard, type Card, type Rank, type Suit } from '@/utils/baccaratDeck'
import { parseServerCard } from '@/utils/serverCards'

function serverCardsToCards(codes: string[]): Card[] {
  return codes.map((code, index) => {
    const { rank, suit } = parseServerCard(code)
    return createCard(suit as Suit, rank as Rank, index)
  })
}

interface UseBaccaratGameReturn {
  // Game state
  gameState: BaccaratGameState['state']
  playerHand: BaccaratGameState['playerHand']
  bankerHand: BaccaratGameState['bankerHand']
  playerThirdCard: BaccaratGameState['playerThirdCard']
  bankerThirdCard: BaccaratGameState['bankerThirdCard']
  bet: BaccaratGameState['bet']
  result: GameResult | null
  payouts: BaccaratGameState['payouts']
  gameHistory: BaccaratRound[]
  config: GameConfig
  shoeId: string
  gameNumber: number
  
  // Computed values
  canBet: boolean
  canStart: boolean
  canProcessCards: boolean
  canFinish: boolean
  gameProgress: number
  totalPayout: number
  totalProfit: number
  
  // Actions
  placeBet: (amount: number, betTypes: BetType[]) => void
  startGame: (amount?: number, betTypes?: BetType[]) => void
  processThirdCards: () => void
  finishGame: () => void
  reset: () => void
}

export function useBaccaratGame(config: GameConfig = DEFAULT_CONFIG): UseBaccaratGameReturn {
  const { user, refreshWallet } = useAuth() as any
  
  const [gameState, setGameState] = useState<BaccaratGameState['state']>('betting')
  const [playerHand, setPlayerHand] = useState<BaccaratHand | null>(null)
  const [bankerHand, setBankerHand] = useState<BaccaratHand | null>(null)
  const [playerThirdCard, setPlayerThirdCard] = useState<Card | null>(null)
  const [bankerThirdCard, setBankerThirdCard] = useState<Card | null>(null)
  const [bet, setBet] = useState<BaccaratBet | null>(null)
  const [result, setResult] = useState<GameResult | null>(null)
  const [payouts, setPayouts] = useState<PayoutInfo[]>([])
  const [gameHistory, setGameHistory] = useState<BaccaratRound[]>([])
  const [gameNumber, setGameNumber] = useState(0)
  const [loading, setLoading] = useState(false)
  const [shoeId] = useState(() => `shoe-${Date.now()}`)
  
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [])
  
  const placeBetAction = useCallback((amount: number, betTypes: BetType[]) => {
    setBet({ amount, betTypes, timestamp: Date.now() })
  }, [])
  
  const startGameAction = useCallback(async (amount?: number, betTypes?: BetType[]) => {
    if (gameState !== 'betting' || loading) return
    if (!user) {
      toast.error('Login to play')
      return
    }
    
    const betAmount = amount ?? bet?.amount ?? 0
    if (betAmount <= 0) {
      toast.error('Invalid bet amount')
      return
    }
    
    const betOn = (betTypes ?? bet?.betTypes ?? []).find(
      (type): type is 'player' | 'banker' | 'tie' =>
        type === 'player' || type === 'banker' || type === 'tie'
    )
    if (!betOn) {
      toast.error('Select Player, Banker or Tie')
      return
    }
    
    setLoading(true)
    setGameState('dealing')
    setPlayerHand(null)
    setBankerHand(null)
    setPlayerThirdCard(null)
    setBankerThirdCard(null)
    setResult(null)
    setPayouts([])
    
    try {
      const response = await api.post('/games/baccarat', {
        betAmount,
        currency: 'INR',
        betOn,
        clientSeed: Date.now().toString()
      })
      
      const data = response.data
      const res = data?.result || {}
      const winAmount = Number(data?.winAmount ?? 0)
      
      const playerCards = serverCardsToCards(res.player || [])
      const bankerCards = serverCardsToCards(res.banker || [])
      const finalPlayerHand = createBaccaratHand(playerCards)
      const finalBankerHand = createBaccaratHand(bankerCards)
      
      const gameResult: GameResult = {
        winner: res.outcome,
        playerTotal: Number(res.playerValue ?? finalPlayerHand.total),
        bankerTotal: Number(res.bankerValue ?? finalBankerHand.total),
        playerNatural: finalPlayerHand.natural,
        bankerNatural: finalBankerHand.natural,
        thirdCardDrawn: playerCards.length > 2 || bankerCards.length > 2,
        playerThirdCard: playerCards[2],
        bankerThirdCard: bankerCards[2],
        playerHand: finalPlayerHand,
        bankerHand: finalBankerHand
      }
      
      const roundPayouts: PayoutInfo[] = [
        {
          betType: betOn,
          won: !!res.win,
          payout: winAmount,
          profit: winAmount - betAmount
        }
      ]
      
      // Reveal the hands after a short dealing animation.
      animationTimeoutRef.current = setTimeout(() => {
        setPlayerHand(finalPlayerHand)
        setBankerHand(finalBankerHand)
        setPlayerThirdCard(playerCards[2] ?? null)
        setBankerThirdCard(bankerCards[2] ?? null)
        setResult(gameResult)
        setPayouts(roundPayouts)
        setGameState('result')
        setGameNumber(prev => prev + 1)
        setGameHistory(prev => [
          {
            id: String(data?.id ?? `round-${Date.now()}`),
            bet: { amount: betAmount, betTypes: [betOn], timestamp: Date.now() },
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
  }, [gameState, loading, user, bet, refreshWallet])
  
  // Third card flow is resolved by the server in a single call.
  const processThirdCardsAction = useCallback(() => {}, [])
  const finishGameAction = useCallback(() => {}, [])
  
  const resetAction = useCallback(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
      animationTimeoutRef.current = null
    }
    
    setGameState('betting')
    setPlayerHand(null)
    setBankerHand(null)
    setPlayerThirdCard(null)
    setBankerThirdCard(null)
    setResult(null)
    setPayouts([])
  }, [])
  
  // Computed values
  const canBetValue = gameState === 'betting' && !loading
  const canStartValue = gameState === 'betting' && !loading && !!bet
  const gameProgressValue = gameState === 'betting' ? 0 : gameState === 'result' ? 100 : 50
  const totalPayoutValue = payouts.reduce((sum, payout) => sum + payout.payout, 0)
  const totalProfitValue = payouts.reduce((sum, payout) => sum + payout.profit, 0)
  
  return {
    // Game state
    gameState,
    playerHand,
    bankerHand,
    playerThirdCard,
    bankerThirdCard,
    bet,
    result,
    payouts,
    gameHistory,
    config,
    shoeId,
    gameNumber,
    
    // Computed values
    canBet: canBetValue,
    canStart: canStartValue,
    canProcessCards: false,
    canFinish: false,
    gameProgress: gameProgressValue,
    totalPayout: totalPayoutValue,
    totalProfit: totalProfitValue,
    
    // Actions
    placeBet: placeBetAction,
    startGame: (amount?: number, betTypes?: BetType[]) => {
      void startGameAction(amount, betTypes)
    },
    processThirdCards: processThirdCardsAction,
    finishGame: finishGameAction,
    reset: resetAction
  }
}

// Additional hook for managing bet amounts and types
export function useBaccaratBetting() {
  const [betAmount, setBetAmount] = useState(10)
  const [selectedBetTypes, setSelectedBetTypes] = useState<BetType[]>(['player'])
  
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
  
  // The backend accepts a single bet on player, banker or tie.
  const toggleBetType = useCallback((betType: BetType) => {
    if (betType === 'player' || betType === 'banker' || betType === 'tie') {
      setSelectedBetTypes([betType])
    }
  }, [])
  
  const clearBets = useCallback(() => {
    setSelectedBetTypes(['player'])
  }, [])
  
  return {
    betAmount,
    selectedBetTypes,
    quickBetAmounts,
    setBetAmount,
    setQuickBet,
    incrementBet,
    decrementBet,
    toggleBetType,
    clearBets
  }
}

// Hook for managing game statistics
export function useBaccaratStats(history: BaccaratRound[]) {
  const getStats = useCallback(() => {
    if (history.length === 0) {
      return {
        totalGames: 0,
        playerWins: 0,
        bankerWins: 0,
        ties: 0,
        playerWinRate: 0,
        bankerWinRate: 0,
        tieRate: 0,
        totalBet: 0,
        totalPayout: 0,
        totalProfit: 0,
        averageBet: 0,
        biggestWin: 0,
        biggestLoss: 0,
        naturalsCount: 0,
        superSixCount: 0
      }
    }
    
    const playerWins = history.filter(round => round.result.winner === 'player').length
    const bankerWins = history.filter(round => round.result.winner === 'banker').length
    const ties = history.filter(round => round.result.winner === 'tie').length
    
    const totalBet = history.reduce((sum, round) => sum + round.bet.amount, 0)
    const totalPayout = history.reduce((sum, round) => sum + round.payouts.reduce((payoutSum, payout) => payoutSum + payout.payout, 0), 0)
    const totalProfit = history.reduce((sum, round) => sum + round.payouts.reduce((profitSum, payout) => profitSum + payout.profit, 0), 0)
    const averageBet = totalBet / history.length
    const biggestWin = Math.max(...history.map(round => round.payouts.reduce((max, payout) => Math.max(max, payout.profit), 0)))
    const biggestLoss = Math.min(...history.map(round => round.payouts.reduce((min, payout) => Math.min(min, payout.profit), 0)))
    
    const naturalsCount = history.filter(round => round.result.playerNatural || round.result.bankerNatural).length
    const superSixCount = history.filter(round => round.result.winner === 'banker' && round.result.bankerTotal === 6).length
    
    return {
      totalGames: history.length,
      playerWins,
      bankerWins,
      ties,
      playerWinRate: (playerWins / history.length) * 100,
      bankerWinRate: (bankerWins / history.length) * 100,
      tieRate: (ties / history.length) * 100,
      totalBet,
      totalPayout,
      totalProfit,
      averageBet,
      biggestWin,
      biggestLoss,
      naturalsCount,
      superSixCount
    }
  }, [history])
  
  return getStats()
}

// Hook for managing game animations
export function useBaccaratAnimations() {
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
export function useBaccaratSounds() {
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
export function useBaccaratSettings() {
  const [settings, setSettings] = useState({
    deckCount: 8,
    bankerCommission: 0.05,
    tiePayout: 8,
    pairPayout: 11,
    superSixPayout: 12,
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
export function useBaccaratHistory(history: BaccaratRound[]) {
  const [filter, setFilter] = useState<'all' | 'player' | 'banker' | 'tie'>('all')
  
  const filteredHistory = history.filter(round => {
    switch (filter) {
      case 'player':
        return round.result.winner === 'player'
      case 'banker':
        return round.result.winner === 'banker'
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
export function useBaccaratShoe(gameState: BaccaratGameState) {
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
export function useBaccaratLimits() {
  const [limits, setLimits] = useState({
    minBet: 1,
    maxBet: 10000,
    maxTotalBet: 30000
  })
  
  const validateBet = useCallback((amount: number, betCount: number) => {
    if (amount < limits.minBet) {
      return { isValid: false, error: `Minimum bet is ${limits.minBet}` }
    }
    
    if (amount > limits.maxBet) {
      return { isValid: false, error: `Maximum bet is ${limits.maxBet}` }
    }
    
    if (amount * betCount > limits.maxTotalBet) {
      return { isValid: false, error: `Maximum total bet is ${limits.maxTotalBet}` }
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
export function useBaccaratPersistence() {
  const saveGameState = useCallback((gameState: BaccaratGameState) => {
    try {
      const stateToSave = {
        gameHistory: gameState.gameHistory,
        config: gameState.config,
        shoeId: gameState.shoeId,
        gameNumber: gameState.gameNumber
      }
      localStorage.setItem('baccaratGameState', JSON.stringify(stateToSave))
    } catch (error) {
      console.error('Failed to save game state:', error)
    }
  }, [])
  
  const loadGameState = useCallback(() => {
    try {
      const saved = localStorage.getItem('baccaratGameState')
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
      localStorage.removeItem('baccaratGameState')
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
