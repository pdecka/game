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
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-[#e2e8f0]">
      <nav className="bg-[#ffffff] border-b border-[#e2e8f0] shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#020617]">Gaming Platform</h1>
          <div className="flex gap-4 items-center">
            <div className="hidden md:block rounded-lg bg-[#e2e8f0] px-3 py-2">
              <p className="text-xs text-[#64748b]">Balance</p>
              <p className="text-base font-semibold text-[#020617]">
                ₹{wallet?.INR?.toFixed(2) || '0.00'}
              </p>
            </div>

            <div className="relative">
              <button
                type="button"
                      onClick={() => setProfileMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-xl bg-[#e2e8f0] border border-[#e2e8f0] px-3 py-2 hover:bg-[#e2e8f0]/70 transition-all duration-200"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#22c55e]/15 text-[#22c55e] font-semibold">
                  {String(user?.username || 'U').slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden sm:inline text-sm font-medium text-[#020617] max-w-[140px] truncate">
                  {user?.username}
                </span>
              </button>

              {profileMenuOpen ? (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#ffffff] border border-[#e2e8f0] shadow-md overflow-hidden z-10">
                  <div className="px-4 py-3 border-b border-[#e2e8f0] text-sm font-medium text-[#020617]">
                    {user?.username}
                  </div>
                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setProfileMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-[#020617] hover:bg-[#e2e8f0] transition-colors"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setProfileMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-[#020617] hover:bg-[#e2e8f0] transition-colors"
                    >
                      Wallet
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false)
                        logout()
                      }}
                      className="w-full text-left block px-4 py-2 text-sm text-[#020617] hover:bg-[#e2e8f0] transition-colors"
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
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 mb-2">INR Balance</h3>
            <p className="text-3xl font-bold">₹{wallet?.INR?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 mb-2">USDT Balance</h3>
            <p className="text-3xl font-bold">{wallet?.USDT?.toFixed(2) || '0.00'} USDT</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 mb-2">BTC Balance</h3>
            <p className="text-3xl font-bold">{wallet?.BTC?.toFixed(8) || '0.00000000'} BTC</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/games/dice">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <h3 className="text-xl font-bold mb-2">Dice</h3>
              <p className="text-gray-600">Roll the dice and win big!</p>
            </div>
          </Link>
          <Link href="/games/crash">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <h3 className="text-xl font-bold mb-2">Crash</h3>
              <p className="text-gray-600">Cash out before it crashes!</p>
            </div>
          </Link>
          <Link href="/games/mines">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <h3 className="text-xl font-bold mb-2">Mines</h3>
              <p className="text-gray-600">Find the gems, avoid the mines!</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
