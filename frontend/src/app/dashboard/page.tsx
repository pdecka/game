'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { GameLayout } from '@/components/layout/GameLayout'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const router = useRouter()
  const { ready, user, wallet, walletLoading, logout } = useAuth() as {
    ready: boolean
    user: { username?: string } | null
    wallet: { INR?: number; USDT?: number; BTC?: number } | null
    walletLoading: boolean
    logout: () => void
  }

  useEffect(() => {
    if (!ready) return
    if (!user) router.push('/auth/login')
  }, [ready, user, router])

  if (!ready || (user && walletLoading)) {
    return <div className="flex min-h-screen items-center justify-center bg-bg-2 text-ink-2">Loading...</div>
  }

  return (
    <GameLayout>
      <div className="page-wrap">
        <PageHeader
          title="Dashboard"
          description={`Signed in as ${user?.username ?? 'player'}`}
          action={
            <Button variant="outline" size="sm" type="button" onClick={() => logout()}>
              Logout
            </Button>
          }
        />

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <p className="text-sm text-ink-2">INR Balance</p>
            <p className="odds-num mt-2 text-2xl font-bold text-ink">₹{wallet?.INR?.toFixed(2) || '0.00'}</p>
          </Card>
          <Card>
            <p className="text-sm text-ink-2">USDT Balance</p>
            <p className="odds-num mt-2 text-2xl font-bold text-ink">{wallet?.USDT?.toFixed(2) || '0.00'} USDT</p>
          </Card>
          <Card>
            <p className="text-sm text-ink-2">BTC Balance</p>
            <p className="odds-num mt-2 text-2xl font-bold text-ink">{wallet?.BTC?.toFixed(8) || '0.00000000'} BTC</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/games/dice" className="block">
            <Card className="h-full transition hover:border-brand/40 hover:shadow-lift">
              <h3 className="text-lg font-semibold text-ink">Dice</h3>
              <p className="mt-1 text-sm text-ink-2">Roll the dice and win big!</p>
            </Card>
          </Link>
          <Link href="/games/crash" className="block">
            <Card className="h-full transition hover:border-brand/40 hover:shadow-lift">
              <h3 className="text-lg font-semibold text-ink">Crash</h3>
              <p className="mt-1 text-sm text-ink-2">Cash out before it crashes!</p>
            </Card>
          </Link>
          <Link href="/games/mines" className="block">
            <Card className="h-full transition hover:border-brand/40 hover:shadow-lift">
              <h3 className="text-lg font-semibold text-ink">Mines</h3>
              <p className="mt-1 text-sm text-ink-2">Find the gems, avoid the mines!</p>
            </Card>
          </Link>
        </div>
      </div>
    </GameLayout>
  )
}
