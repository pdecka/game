'use client'

import { useEffect, useState } from 'react'

export type PlayCurrency = 'INR' | 'USDT' | 'BTC'

const STORAGE_KEY = 'play-currency'
const EVENT = 'play-currency'

export function getPlayCurrency(): PlayCurrency {
  if (typeof window === 'undefined') return 'INR'
  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (saved === 'USDT' || saved === 'BTC' || saved === 'INR') return saved
  return 'INR'
}

export function setPlayCurrency(currency: PlayCurrency) {
  window.localStorage.setItem(STORAGE_KEY, currency)
  window.dispatchEvent(new Event(EVENT))
}

export function availablePlayCurrencies(wallet?: { INR?: number; USDT?: number; BTC?: number; locked?: { INR?: number; USDT?: number; BTC?: number } } | null): PlayCurrency[] {
  const options: PlayCurrency[] = ['INR']
  for (const code of ['USDT', 'BTC'] as const) {
    const balance = Number(wallet?.[code] || 0)
    const locked = Number(wallet?.locked?.[code] || 0)
    if (balance > 0 || locked > 0) options.push(code)
  }
  return options
}

export function playBalance(wallet?: { INR?: number; USDT?: number; BTC?: number } | null, currency: PlayCurrency = getPlayCurrency()) {
  return Number(wallet?.[currency] || 0)
}

export function formatPlayMoney(amount: number, currency: PlayCurrency = getPlayCurrency()) {
  const value = Number.isFinite(amount) ? amount : 0
  if (currency === 'INR') {
    return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  if (currency === 'BTC') {
    const text = value.toFixed(8).replace(/\.?0+$/, '')
    return `${text || '0'} BTC`
  }
  return `${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
}

export function usePlayCurrency(wallet?: { INR?: number; USDT?: number; BTC?: number; locked?: { INR?: number; USDT?: number; BTC?: number } } | null) {
  const [currency, setCurrencyState] = useState<PlayCurrency>('INR')

  useEffect(() => {
    const sync = () => {
      const saved = getPlayCurrency()
      if (!wallet) {
        setCurrencyState(saved)
        return
      }
      const options = availablePlayCurrencies(wallet)
      const next = options.includes(saved) ? saved : 'INR'
      if (next !== saved) setPlayCurrency(next)
      setCurrencyState(next)
    }
    sync()
    window.addEventListener(EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [wallet?.INR, wallet?.USDT, wallet?.BTC, wallet?.locked?.INR, wallet?.locked?.USDT, wallet?.locked?.BTC])

  const setCurrency = (next: PlayCurrency) => {
    setPlayCurrency(next)
    setCurrencyState(next)
  }

  return { currency, setCurrency, options: availablePlayCurrencies(wallet) }
}
