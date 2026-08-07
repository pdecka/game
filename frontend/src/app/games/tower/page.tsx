'use client'

import { useState } from 'react'
import GameLayout from '@/components/game/GameLayout'
import GameFooter from '@/components/game/GameFooter'
import TowerGame from '@/components/tower/TowerGame'
import SponsorsSection from '@/components/game/SponsorsSection'
import { useAuth } from '@/context/AuthContext'

export default function TowerPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { wallet } = useAuth() as any
  const walletBalance = Number(wallet?.INR ?? 0)

  return (
    <GameLayout
      sidebarOpen={sidebarOpen}
      onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
      onSidebarClose={() => setSidebarOpen(false)}
      walletBalance={walletBalance}
    >
      <div className="max-w-7xl mx-auto px-4 py-8 overflow-y-auto">
        <TowerGame />
      </div>

      {/* Footer */}
      <GameFooter />
      
      {/* Sponsors Section */}
      <SponsorsSection />
    </GameLayout>
  )
}

