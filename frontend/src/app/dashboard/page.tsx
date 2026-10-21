'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export default function DashboardPage() {
  const router = useRouter()
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const { ready, user, wallet, walletLoading, logout } = useAuth() as any

  useEffect(() => {
    if (!ready) return
    if (!user) router.push('/auth/login')
  }, [ready, user, router])

  if (!ready || (user && walletLoading)) {
    return <div className="flex min-h-screen items-center justify-center bg-bg-2 text-ink-2">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-bg-2">
      <nav className="border-b border-line bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold text-ink">Gaming Platform</h1>
          <div className="flex items-center gap-4">
            <div className="hidden rounded-lg bg-elevated px-3 py-2 md:block">
              <p className="text-xs text-ink-3">Balance</p>
              <p className="odds-num text-base font-semibold text-ink">
                ₹{wallet?.INR?.toFixed(2) || '0.00'}
              </p>
            </div>

            <div className="relative">
              <button
                type="button"
                      onClick={() => setProfileMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-xl border border-line bg-elevated px-3 py-2 transition-all duration-200 hover:bg-brand/10"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/15 font-semibold text-brand-2">
                  {String(user?.username || 'U').slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden max-w-[140px] truncate text-sm font-medium text-ink sm:inline">
                  {user?.username}
                </span>
              </button>

              {profileMenuOpen ? (
                <div className="absolute right-0 z-10 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-white shadow-panel">
                  <div className="border-b border-line px-4 py-3 text-sm font-medium text-ink">
                    {user?.username}
                  </div>
                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setProfileMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-ink hover:bg-brand/10"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setProfileMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-ink hover:bg-brand/10"
                    >
                      Wallet
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false)
                        logout()
                      }}
                      className="block w-full px-4 py-2 text-left text-sm text-ink hover:bg-brand/10"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="rounded-2xl border border-line bg-white p-6 shadow-panel">
            <h3 className="mb-2 text-ink-2">INR Balance</h3>
            <p className="odds-num text-3xl font-bold text-ink">₹{wallet?.INR?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="rounded-2xl border border-line bg-white p-6 shadow-panel">
            <h3 className="mb-2 text-ink-2">USDT Balance</h3>
            <p className="odds-num text-3xl font-bold text-ink">{wallet?.USDT?.toFixed(2) || '0.00'} USDT</p>
          </div>
          <div className="rounded-2xl border border-line bg-white p-6 shadow-panel">
            <h3 className="mb-2 text-ink-2">BTC Balance</h3>
            <p className="odds-num text-3xl font-bold text-ink">{wallet?.BTC?.toFixed(8) || '0.00000000'} BTC</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/games/dice">
            <div className="rounded-2xl border border-line bg-white p-6 shadow-panel transition hover:border-brand/40 hover:shadow-lift">
              <h3 className="mb-2 text-xl font-bold text-ink">Dice</h3>
              <p className="text-ink-2">Roll the dice and win big!</p>
            </div>
          </Link>
          <Link href="/games/crash">
            <div className="rounded-2xl border border-line bg-white p-6 shadow-panel transition hover:border-brand/40 hover:shadow-lift">
              <h3 className="mb-2 text-xl font-bold text-ink">Crash</h3>
              <p className="text-ink-2">Cash out before it crashes!</p>
            </div>
          </Link>
          <Link href="/games/mines">
            <div className="rounded-2xl border border-line bg-white p-6 shadow-panel transition hover:border-brand/40 hover:shadow-lift">
              <h3 className="mb-2 text-xl font-bold text-ink">Mines</h3>
              <p className="text-ink-2">Find the gems, avoid the mines!</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
