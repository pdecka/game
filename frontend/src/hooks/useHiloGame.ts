'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import {
  CARD_VALUES,
  type Card,
  type CardRank,
  type CardSuit,
  type HiloRound
} from '@/utils/deck'
import { parseServerCard } from '@/utils/serverCards'

export type GameState = 'idle' | 'playing' | 'won_step' | 'lost' | 'cashed_out'

interface UseHiloGameReturn {
  // Game state
  gameState: GameState
  currentCard: Card | null
  previousCards: Card[]
  streak: number
  multiplier: number
  
  // Betting
  betAmount: number
  
  // History
  history: HiloRound[]
  
  // Actions
  setBetAmount: (amount: number) => void
  startGame: () => void
  makePrediction: (prediction: 'higher' | 'lower') => void
  cashout: () => void
  resetGame: () => void
}

function serverCardToCard(code: string): Card {
  const { rank, suit } = parseServerCard(code)
  return {
    rank: rank as CardRank,
    suit: suit as CardSuit,
    value: CARD_VALUES[rank as CardRank] ?? 0
  }
}

export function useHiloGame(): UseHiloGameReturn {
  const { user, refreshWallet } = useAuth() as any
  
  const [gameState, setGameState] = useState<GameState>('idle')
  const [currentCard, setCurrentCard] = useState<Card | null>(null)
  const [previousCards, setPreviousCards] = useState<Card[]>([])
  const [streak, setStreak] = useState(0)
  const [multiplier, setMultiplier] = useState(1.0)
  const [betAmount, setBetAmount] = useState(0)
  const [history, setHistory] = useState<HiloRound[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const timeoutsRef = useRef<NodeJS.Timeout[]>([])
  
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout)
    }
  }, [])
  
  const schedule = useCallback((fn: () => void, delay: number) => {
    timeoutsRef.current.push(setTimeout(fn, delay))
  }, [])
  
  const resetGame = useCallback(() => {
    setGameState('idle')
    setCurrentCard(null)
    setPreviousCards([])
    setStreak(0)
    setMultiplier(1.0)
    setSessionId(null)
  }, [])
  
  const startGame = useCallback(async () => {
    if (gameState !== 'idle' || loading) return
    if (!user) {
      toast.error('Login to play')
      return
    }
    if (betAmount <= 0) {
      toast.error('Invalid bet amount')
      return
    }
    
    setLoading(true)
    try {
      const response = await api.post('/games/hilo/start', {
        betAmount,
        currency: 'INR',
        clientSeed: Date.now().toString()
      })
      
      const data = response.data
      const res = data?.result || {}
      
      setSessionId(data?.id ?? null)
      setCurrentCard(serverCardToCard(res.current))
      setPreviousCards([])
      setStreak(Number(res.streak ?? 0))
      setMultiplier(Number(res.multiplier ?? 1))
      setGameState('playing')
      refreshWallet?.()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Bet failed')
    } finally {
      setLoading(false)
    }
  }, [gameState, loading, user, betAmount, refreshWallet])
  
  const makePrediction = useCallback(
    async (prediction: 'higher' | 'lower') => {
      if (gameState !== 'playing' || loading || !sessionId || !currentCard) return
      
      setLoading(true)
      try {
        const response = await api.post('/games/hilo/action', {
          sessionId,
          action: prediction
        })
        
        const data = response.data
        const res = data?.result || {}
        
        if (res.win) {
          setPreviousCards(prev => [...prev, currentCard])
          setCurrentCard(serverCardToCard(res.current))
          setStreak(Number(res.streak ?? streak + 1))
          setMultiplier(Number(res.multiplier ?? multiplier))
          setGameState('won_step')
          schedule(() => {
            setGameState(prev => (prev === 'won_step' ? 'playing' : prev))
          }, 1000)
        } else {
          setPreviousCards(prev => [...prev, currentCard])
          if (res.next) {
            setCurrentCard(serverCardToCard(res.next))
          }
          setGameState('lost')
          setHistory(prev =>
            [
              {
                id: String(data?.id ?? `hilo-${Date.now()}`),
                timestamp: Date.now(),
                betAmount,
                finalMultiplier: multiplier,
                payout: 0,
                outcome: 'lost' as const,
                cardsDrawn: previousCards.length + 2
              },
              ...prev
            ].slice(0, 20)
          )
          refreshWallet?.()
          schedule(resetGame, 3000)
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Action failed')
      } finally {
        setLoading(false)
      }
    },
    [gameState, loading, sessionId, currentCard, streak, multiplier, betAmount, previousCards.length, refreshWallet, resetGame, schedule]
  )
  
  const cashout = useCallback(async () => {
    if ((gameState !== 'playing' && gameState !== 'won_step') || loading || !sessionId) return
    
    setLoading(true)
    try {
      const response = await api.post('/games/hilo/action', {
        sessionId,
        action: 'cashout'
      })
      
      const data = response.data
      const res = data?.result || {}
      const winAmount = Number(data?.winAmount ?? betAmount * multiplier)
      
      setMultiplier(Number(res.multiplier ?? multiplier))
      setGameState('cashed_out')
      setHistory(prev =>
        [
          {
            id: String(data?.id ?? `hilo-${Date.now()}`),
            timestamp: Date.now(),
            betAmount,
            finalMultiplier: Number(res.multiplier ?? multiplier),
            payout: winAmount - betAmount,
            outcome: 'cashed_out' as const,
            cardsDrawn: previousCards.length + 1
          },
          ...prev
        ].slice(0, 20)
      )
      refreshWallet?.()
      schedule(resetGame, 3000)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Cashout failed')
    } finally {
      setLoading(false)
    }
  }, [gameState, loading, sessionId, betAmount, multiplier, previousCards.length, refreshWallet, resetGame, schedule])
  
  return {
    gameState,
    currentCard,
    previousCards,
    streak,
    multiplier,
    betAmount,
    history,
    setBetAmount,
    startGame: () => {
      void startGame()
    },
    makePrediction: (prediction: 'higher' | 'lower') => {
      void makePrediction(prediction)
    },
    cashout: () => {
      void cashout()
    },
    resetGame
  }
}
