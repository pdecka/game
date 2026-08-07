'use client'

import { useState } from 'react'
import GameLayout from '@/components/game/GameLayout'
import GameFooter from '@/components/game/GameFooter'
import TicTacToeGame from '@/components/tic-tac-toe/TicTacToeGame'
import SponsorsSection from '@/components/game/SponsorsSection'

export default function NumberHiLoPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [walletBalance] = useState(5000) // Dummy balance

  return (
    <GameLayout
      sidebarOpen={sidebarOpen}
      onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
      onSidebarClose={() => setSidebarOpen(false)}
      walletBalance={walletBalance}
    >
      <div className="max-w-7xl mx-auto px-4 py-8 overflow-y-auto">
        <TicTacToeGame />
      </div>

      {/* Footer */}
      <GameFooter />
      
      {/* Sponsors Section */}
      <SponsorsSection />
    </GameLayout>
  )
}

