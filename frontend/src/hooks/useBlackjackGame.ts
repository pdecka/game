'use client'

import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import type { GameConfig } from '@/utils/blackjackEngine'
import {
  DEFAULT_CONFIG,
  type BlackjackGameState,
  type BlackjackBet,
  type BlackjackRound,
  type BlackjackResult
} from '@/utils/blackjackEngine'
import { createCard, type Card, type Rank, type Suit } from '@/utils/blackjackDeck'
import { calculateHandValue, type Hand } from '@/utils/blackjackHands'
import { parseServerCard } from '@/utils/serverCards'

interface UseBlackjackGameReturn {
  // Game state
  gameState: BlackjackGameState['state']
  playerHands: BlackjackGameState['playerHands']
  dealerHand: BlackjackGameState['dealerHand']
  currentHandIndex: number
  bet: BlackjackGameState['bet']
  result: BlackjackResult | null
  gameHistory: BlackjackRound[]
  config: GameConfig
  insuranceOffered: boolean
  insuranceTaken: boolean
  
  // Computed values
  canAct: boolean
  canHit: boolean
  canStand: boolean
  canDouble: boolean
  canSplit: boolean
  canTakeInsurance: boolean
  gameProgress: number
  currentHand: BlackjackGameState['playerHands'][0] | undefined
  
  // Actions
  placeBet: (amount: number) => void
  takeInsurance: (amount: number) => void
  startGame: (amount?: number) => void
  hit: () => void
  stand: () => void
  doubleDown: () => void
  split: () => void
  reset: () => void
}

function serverCardsToCards(codes: string[]): Card[] {
  return codes.map((code, index) => {
    const { rank, suit } = parseServerCard(code)
    return createCard(suit as Suit, rank as Rank, index)
  })
}

function buildHand(codes: string[], bet: number, finished: boolean): Hand {
  const cards = serverCardsToCards(codes)
  const value = calculateHandValue(cards)
  let status: Hand['status'] = finished ? 'stand' : 'active'
  if (value.bust) status = 'bust'
  else if (value.blackjack) status = 'blackjack'
  return { cards, value, bet, status }
}

// Face-down placeholder so the dealer shows a hole card while the round is live.
const HOLE_CARD: Card = createCard('spades', 'A', 99)

export function useBlackjackGame(config: GameConfig = DEFAULT_CONFIG): UseBlackjackGameReturn {
  const { user, refreshWallet } = useAuth() as any
  
  const [gameState, setGameState] = useState<BlackjackGameState['state']>('betting')
  const [playerHands, setPlayerHands] = useState<Hand[]>([])
  const [dealerHand, setDealerHand] = useState<Hand>(() => ({
    cards: [],
    value: calculateHandValue([]),
    bet: 0,
    status: 'active'
  }))
  const [bet, setBet] = useState<BlackjackBet | null>(null)
  const [result, setResult] = useState<BlackjackResult | null>(null)
  const [gameHistory, setGameHistory] = useState<BlackjackRound[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const placeBetAction = useCallback((amount: number) => {
    setBet({ amount, timestamp: Date.now() })
  }, [])
  
  const finalizeRound = useCallback(
    (data: any, betAmount: number) => {
      const res = data?.result || {}
      const winAmount = Number(data?.winAmount ?? 0)
      const outcome: 'win' | 'lose' | 'push' =
        res.outcome === 'win' ? 'win' : res.outcome === 'push' ? 'push' : 'lose'
      
      const finalPlayerHands = [buildHand(res.player || [], betAmount, true)]
      const finalDealerHand = buildHand(res.dealer || [], 0, true)
      
      const blackjackResult: BlackjackResult = {
        playerHands: finalPlayerHands,
        dealerHand: finalDealerHand,
        result: outcome,
        payout: winAmount,
        profit: winAmount - betAmount,
        multiplier: Number(res.payoutMultiplier ?? (betAmount > 0 ? winAmount / betAmount : 0)),
        timestamp: Date.now(),
        gameData: {
          playerBlackjack: finalPlayerHands[0]?.value.blackjack ?? false,
          dealerBlackjack: finalDealerHand.value.blackjack,
          immediateResult: null
        }
      }
      
      setPlayerHands(finalPlayerHands)
      setDealerHand(finalDealerHand)
      setResult(blackjackResult)
      setGameState('result')
      setGameHistory(prev => [
        {
          id: String(data?.id ?? `round-${Date.now()}`),
          bet: { amount: betAmount, timestamp: Date.now() },
          result: blackjackResult,
          timestamp: Date.now()
        },
        ...prev.slice(0, 49)
      ])
      refreshWallet?.()
    },
    [refreshWallet]
  )
  
  const startGameAction = useCallback(async (amount?: number) => {
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
    setBet({ amount: betAmount, timestamp: Date.now() })
    
    setLoading(true)
    try {
      const response = await api.post('/games/blackjack/start', {
        betAmount,
        currency: 'INR',
        clientSeed: Date.now().toString()
      })
      
      const data = response.data
      const res = data?.result || {}
      
      setSessionId(data?.id ?? null)
      setResult(null)
      refreshWallet?.()
      
      if (data?.status === 'completed' || res.finished) {
        finalizeRound(data, betAmount)
      } else {
        setPlayerHands([buildHand(res.player || [], betAmount, false)])
        const dealerCards = serverCardsToCards(res.dealer || [])
        setDealerHand({
          cards: [...dealerCards, HOLE_CARD],
          value: calculateHandValue(dealerCards),
          bet: 0,
          status: 'active'
        })
        setGameState('playerTurn')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Bet failed')
    } finally {
      setLoading(false)
    }
  }, [gameState, loading, user, bet, finalizeRound, refreshWallet])
  
  const sendAction = useCallback(
    async (action: 'hit' | 'stand') => {
      if (gameState !== 'playerTurn' || loading || !sessionId) return
      const betAmount = bet?.amount ?? 0
      
      setLoading(true)
      try {
        const response = await api.post('/games/blackjack/action', {
          sessionId,
          action
        })
        
        const data = response.data
        const res = data?.result || {}
        
        if (data?.status === 'completed' || res.finished) {
          finalizeRound(data, betAmount)
        } else {
          setPlayerHands([buildHand(res.player || [], betAmount, false)])
          const dealerCards = serverCardsToCards(res.dealer || [])
          setDealerHand({
            cards: [...dealerCards, HOLE_CARD],
            value: calculateHandValue(dealerCards),
            bet: 0,
            status: 'active'
          })
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Action failed')
      } finally {
        setLoading(false)
      }
    },
    [gameState, loading, sessionId, bet, finalizeRound]
  )
  
  const hitAction = useCallback(() => {
    void sendAction('hit')
  }, [sendAction])
  
  const standAction = useCallback(() => {
    void sendAction('stand')
  }, [sendAction])
  
  // Not supported by the backend blackjack game.
  const takeInsuranceAction = useCallback((_amount: number) => {}, [])
  const doubleDownAction = useCallback(() => {}, [])
  const splitAction = useCallback(() => {}, [])
  
  const resetAction = useCallback(() => {
    setGameState('betting')
    setPlayerHands([])
    setDealerHand({ cards: [], value: calculateHandValue([]), bet: 0, status: 'active' })
    setResult(null)
    setSessionId(null)
  }, [])
  
  // Computed values
  const canActValue = gameState === 'playerTurn' && !loading
  const gameProgressValue =
    gameState === 'betting' ? 0 : gameState === 'playerTurn' ? 50 : gameState === 'result' ? 100 : 80
  
  return {
    // Game state
    gameState,
    playerHands,
    dealerHand,
    currentHandIndex: 0,
    bet,
    result,
    gameHistory,
    config,
    insuranceOffered: false,
    insuranceTaken: false,
    
    // Computed values
    canAct: canActValue,
    canHit: canActValue,
    canStand: canActValue,
    canDouble: false,
    canSplit: false,
    canTakeInsurance: false,
    gameProgress: gameProgressValue,
    currentHand: playerHands[0],
    
    // Actions
    placeBet: placeBetAction,
    takeInsurance: takeInsuranceAction,
    startGame: (amount?: number) => {
      void startGameAction(amount)
    },
    hit: hitAction,
    stand: standAction,
    doubleDown: doubleDownAction,
    split: splitAction,
    reset: resetAction
  }
}

// Additional hook for managing bet amount
export function useBlackjackBetting() {
  const [betAmount, setBetAmount] = useState(10)
  
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
  
  return {
    betAmount,
    quickBetAmounts,
    setBetAmount,
    setQuickBet,
    incrementBet,
    decrementBet
  }
}

// Hook for managing game statistics
export function useBlackjackStats(history: BlackjackRound[]) {
  const getStats = useCallback(() => {
    if (history.length === 0) {
      return {
        totalGames: 0,
        wins: 0,
        losses: 0,
        pushes: 0,
        blackjacks: 0,
        winRate: 0,
        totalBet: 0,
        totalPayout: 0,
        totalProfit: 0,
        averageBet: 0,
        biggestWin: 0,
        biggestLoss: 0
      }
    }
    
    const wins = history.filter(round => round.result.result === 'win').length
    const losses = history.filter(round => round.result.result === 'lose').length
    const pushes = history.filter(round => round.result.result === 'push').length
    const blackjacks = history.filter(round => 
      round.result.gameData.playerBlackjack
    ).length
    
    const totalBet = history.reduce((sum, round) => sum + round.bet.amount, 0)
    const totalPayout = history.reduce((sum, round) => sum + round.result.payout, 0)
    const totalProfit = history.reduce((sum, round) => sum + round.result.profit, 0)
    const averageBet = totalBet / history.length
    const biggestWin = Math.max(...history.filter(round => round.result.profit > 0).map(round => round.result.profit), 0)
    const biggestLoss = Math.min(...history.filter(round => round.result.profit < 0).map(round => round.result.profit), 0)
    
    return {
      totalGames: history.length,
      wins,
      losses,
      pushes,
      blackjacks,
      winRate: (wins / history.length) * 100,
      totalBet,
      totalPayout,
      totalProfit,
      averageBet,
      biggestWin,
      biggestLoss
    }
  }, [history])
  
  return getStats()
}

// Hook for managing game animations
export function useBlackjackAnimations() {
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

// Hook for managing game settings
export function useBlackjackSettings() {
  const [settings, setSettings] = useState({
    deckCount: 6,
    hitOnSoft17: false,
    soundEnabled: true,
    animationsEnabled: true,
    autoStandOn20: true,
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
export function useBlackjackHistory(history: BlackjackRound[]) {
  const [filter, setFilter] = useState<'all' | 'wins' | 'losses' | 'blackjack'>('all')
  
  const filteredHistory = history.filter(round => {
    switch (filter) {
      case 'wins':
        return round.result.result === 'win'
      case 'losses':
        return round.result.result === 'lose'
      case 'blackjack':
        return round.result.gameData.playerBlackjack
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
