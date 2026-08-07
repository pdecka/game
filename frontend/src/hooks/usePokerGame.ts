'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { POKER_CARD_VALUES, type Card, type CardRank, type CardSuit } from '@/utils/pokerDeck'
import type { HandEvaluation, HandRank } from '@/utils/pokerHands'
import type { GameState, PokerResult, PokerRound } from '@/utils/pokerEngine'

interface UsePokerGameReturn {
  // Game state
  gameState: GameState
  betAmount: number
  playerCards: Card[]
  dealerCards: Card[]
  communityCards: Card[]
  currentResult: PokerResult | null
  gameHistory: PokerRound[]

  // Computed values
  canBet: boolean
  isGameActive: boolean
  canShowCards: boolean
  gameProgress: number

  // Actions
  setBetAmount: (amount: number) => void
  deal: () => void
  nextPhase: () => void
  reset: () => void
}

const SUIT_BY_LETTER: Record<string, CardSuit> = {
  S: 'spades',
  H: 'hearts',
  D: 'diamonds',
  C: 'clubs',
}

const RANK_BY_SERVER: Record<string, HandRank> = {
  high_card: 'high-card',
  pair: 'pair',
  two_pair: 'two-pair',
  three_kind: 'three-of-a-kind',
  straight: 'straight',
  flush: 'flush',
  full_house: 'full-house',
  four_kind: 'four-of-a-kind',
  straight_flush: 'straight-flush',
}

function parseServerCard(card: string, idx: number): Card {
  const suitLetter = card.slice(-1)
  const rank = card.slice(0, -1) as CardRank
  return {
    id: `${card}-${idx}`,
    suit: SUIT_BY_LETTER[suitLetter] || 'spades',
    rank,
    value: POKER_CARD_VALUES[rank] ?? 2,
  }
}

function toHandEvaluation(hand: { rank: string; description: string }, cards: Card[]): HandEvaluation {
  return {
    rank: RANK_BY_SERVER[hand.rank] || 'high-card',
    score: 0,
    cards,
    description: hand.description,
  }
}

export function usePokerGame(): UsePokerGameReturn {
  const { user, refreshWallet } = useAuth() as any

  const [phase, setPhase] = useState<GameState>('idle')
  const [betAmount, setBetAmount] = useState(10)
  const [playerCards, setPlayerCards] = useState<Card[]>([])
  const [dealerCards, setDealerCards] = useState<Card[]>([])
  const [communityCards, setCommunityCards] = useState<Card[]>([])
  const [currentResult, setCurrentResult] = useState<PokerResult | null>(null)
  const [gameHistory, setGameHistory] = useState<PokerRound[]>([])

  const timeoutsRef = useRef<NodeJS.Timeout[]>([])

  const clearTimers = useCallback(() => {
    timeoutsRef.current.forEach((t) => clearTimeout(t))
    timeoutsRef.current = []
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  const schedule = useCallback((fn: () => void, ms: number) => {
    timeoutsRef.current.push(setTimeout(fn, ms))
  }, [])

  const deal = useCallback(async () => {
    if (betAmount <= 0 || phase !== 'idle') return
    if (!user) {
      toast.error('Login to play')
      return
    }

    clearTimers()
    setCurrentResult(null)
    setPlayerCards([])
    setDealerCards([])
    setCommunityCards([])
    setPhase('dealing')

    try {
      const response = await api.post('/games/poker', {
        betAmount,
        currency: 'INR',
        clientSeed: Date.now().toString(),
      })

      const session = response.data
      const result = session.result || {}

      const player = (result.playerCards || []).map(parseServerCard)
      const dealer = (result.dealerCards || []).map(parseServerCard)
      const community = (result.communityCards || []).map(parseServerCard)

      const payout = Number(session.winAmount ?? 0)
      const pokerResult: PokerResult = {
        gameId: session.id,
        playerHand: toHandEvaluation(result.playerHand || { rank: 'high_card', description: 'High Card' }, player),
        dealerHand: toHandEvaluation(result.dealerHand || { rank: 'high_card', description: 'High Card' }, dealer),
        winner: result.winner || 'dealer',
        payout,
        profit: payout - betAmount,
        timestamp: Date.now(),
        playerCards: player,
        dealerCards: dealer,
        communityCards: community,
      }

      // Staged reveal: hole cards -> flop -> turn -> river -> showdown -> result.
      setPlayerCards(player)
      setDealerCards(dealer)

      schedule(() => {
        setPhase('flop')
        setCommunityCards(community.slice(0, 3))
      }, 1000)
      schedule(() => {
        setPhase('turn')
        setCommunityCards(community.slice(0, 4))
      }, 2500)
      schedule(() => {
        setPhase('river')
        setCommunityCards(community)
      }, 4000)
      schedule(() => {
        setPhase('showdown')
      }, 5200)
      schedule(() => {
        setPhase('result')
        setCurrentResult(pokerResult)
        setGameHistory((prev) => [
          {
            id: session.id,
            gameId: session.id,
            bet: { id: session.id, amount: betAmount, timestamp: Date.now() },
            result: pokerResult,
            timestamp: Date.now(),
          },
          ...prev.slice(0, 49),
        ])
        refreshWallet()
      }, 6400)
      schedule(() => {
        setPhase('idle')
        setPlayerCards([])
        setDealerCards([])
        setCommunityCards([])
      }, 9500)
    } catch (err: any) {
      clearTimers()
      setPhase('idle')
      toast.error(err.response?.data?.message || 'Bet failed')
    }
  }, [betAmount, phase, user, clearTimers, schedule, refreshWallet])

  const reset = useCallback(() => {
    clearTimers()
    setPhase('idle')
    setPlayerCards([])
    setDealerCards([])
    setCommunityCards([])
    setCurrentResult(null)
  }, [clearTimers])

  const nextPhase = useCallback(() => {
    if (phase === 'idle') {
      deal()
    }
  }, [phase, deal])

  // Computed values
  const canBet = phase === 'idle'
  const isGameActive = ['dealing', 'flop', 'turn', 'river', 'showdown', 'result'].includes(phase)
  const canShowCards = phase === 'showdown' || phase === 'result'
  const gameProgress = getGameProgress(phase)

  function getGameProgress(state: GameState): number {
    const progress: Record<GameState, number> = {
      idle: 0,
      dealing: 10,
      flop: 30,
      turn: 60,
      river: 85,
      showdown: 95,
      result: 100,
    }
    return progress[state]
  }

  return {
    gameState: phase,
    betAmount,
    playerCards,
    dealerCards,
    communityCards,
    currentResult,
    gameHistory,

    canBet,
    isGameActive,
    canShowCards,
    gameProgress,

    setBetAmount,
    deal,
    nextPhase,
    reset,
  }
}
