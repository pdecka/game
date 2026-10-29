'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { getPlayCurrency, playBalance, usePlayCurrency } from '@/lib/playCurrency'

export type SportsSlipItem = {
  id: string
  matchId: string
  matchName: string
  market: string
  outcome: string
  odds: number
  bookmaker: string
  bookmakerKey: string
  sportKey: string
  line?: number
  stake: number
  type: 'back'
}

const STORAGE_KEY = 'sports-bet-slip'

export function useSportsBetSlip() {
  const { user, wallet, refreshWallet } = useAuth() as any
  const { currency } = usePlayCurrency(wallet)
  const [items, setItems] = useState<SportsSlipItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isPlacing, setIsPlacing] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [exposure, setExposure] = useState(0)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setItems(parsed)
      }
    } catch {
      // Ignore a corrupt slip and start empty.
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items, hydrated])

  const balance = playBalance(wallet, currency)

  const refreshExposure = useCallback(async () => {
    if (!user) {
      setExposure(0)
      return
    }
    try {
      const response = await api.get('/sports/bets/my')
      const rows = Array.isArray(response.data) ? response.data : []
      const openStake = rows
        .filter((bet) => String(bet?.status || '').toLowerCase() === 'pending')
        .filter((bet) => String(bet?.currency || 'INR').toUpperCase() === getPlayCurrency())
        .reduce((sum, bet) => sum + Number(bet?.stake || 0), 0)
      setExposure(openStake)
    } catch {
      // Keep the last exposure figure if the bet list cannot be loaded.
    }
  }, [user])

  useEffect(() => {
    refreshExposure()
  }, [refreshExposure, currency, wallet?.INR, wallet?.USDT, wallet?.BTC])

  const refreshWalletRef = useRef(refreshWallet)
  refreshWalletRef.current = refreshWallet

  useEffect(() => {
    if (!user || exposure <= 0) return
    const timer = window.setInterval(() => {
      void refreshWalletRef.current?.()
      void refreshExposure()
    }, 2000)
    return () => window.clearInterval(timer)
  }, [user, exposure, refreshExposure])

  const toggleOdds = useCallback(
    (item: Omit<SportsSlipItem, 'stake' | 'type'> & { stake?: number }) => {
      setItems((current) => {
        const existing = current.find((bet) => bet.id === item.id)
        if (existing) {
          toast('Removed from bet slip')
          return current.filter((bet) => bet.id !== item.id)
        }
        setIsOpen(true)
        toast.success('Added')
        return [...current, { ...item, stake: item.stake ?? 100, type: 'back' }]
      })
    },
    [],
  )

  const updateStake = useCallback((id: string, stake: number) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, stake } : item)))
  }, [])

  const remove = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id))
  }, [])

  const placeBets = useCallback(async () => {
    if (!user) {
      toast.error('Log in to place a bet')
      return
    }
    if (!items.length) return
    const total = items.reduce((sum, item) => sum + Number(item.stake || 0), 0)
    if (total > balance) {
      toast.error('Insufficient balance')
      return
    }

    setIsPlacing(true)
    const placed: string[] = []
    try {
      for (const item of items) {
        if (!item.stake || item.stake < 1) {
          toast.error('Stake must be at least 1')
          break
        }
        try {
          await api.post('/sports/bets', {
            sport: item.sportKey,
            matchId: item.matchId,
            selection: item.outcome,
            stake: Number(item.stake),
            marketKey: item.market,
            bookmaker: item.bookmakerKey || item.bookmaker,
            odds: item.odds,
            ...(item.line != null ? { line: item.line } : {}),
            currency: getPlayCurrency(),
          })
          placed.push(item.id)
        } catch (error: any) {
          const message = error?.response?.data?.message
          const text = Array.isArray(message) ? message[0] : message
          toast.error(text || 'Could not place that bet')
          break
        }
      }
      if (placed.length) {
        setItems((current) => current.filter((item) => !placed.includes(item.id)))
        toast.success(placed.length === 1 ? 'Bet placed' : `${placed.length} bets placed`)
        await refreshWallet?.()
        await refreshExposure()
      }
    } finally {
      setIsPlacing(false)
    }
  }, [balance, items, refreshExposure, refreshWallet, user])

  return {
    items,
    isOpen,
    setIsOpen,
    isPlacing,
    balance,
    exposure,
    loggedIn: Boolean(user),
    toggleOdds,
    updateStake,
    remove,
    placeBets,
  }
}
