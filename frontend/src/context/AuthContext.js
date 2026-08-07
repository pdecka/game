'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '@/lib/api'
import { authService } from '@/lib/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [ready, setReady] = useState(false)
  const [user, setUser] = useState(null)
  const [wallet, setWallet] = useState(null)
  const [walletLoading, setWalletLoading] = useState(false)

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
    setReady(true)
  }, [])

  useEffect(() => {
    if (!user) {
      setWallet(null)
      return
    }

    let cancelled = false
    const loadWallet = async () => {
      try {
        setWalletLoading(true)
        const response = await api.get('/wallet/balance')
        if (!cancelled) setWallet(response.data)
      } catch {
        // 401 handling happens via api interceptor.
      } finally {
        if (!cancelled) setWalletLoading(false)
      }
    }

    loadWallet()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  const refreshWallet = async () => {
    if (!user) return
    setWalletLoading(true)
    try {
      const response = await api.get('/wallet/balance')
      setWallet(response.data)
    } catch {
      // ignore
    } finally {
      setWalletLoading(false)
    }
  }

  const login = async (email, password) => {
    const response = await authService.login(email, password)
    setUser(response.user)
    return response
  }

  const logout = () => {
    authService.logout()
  }

  const value = useMemo(
    () => ({
      ready,
      user,
      wallet,
      walletLoading,
      refreshWallet,
      login,
      logout,
    }),
    [ready, user, wallet, walletLoading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

