'use client'

import { GameLayout } from '@/components/layout/GameLayout'
import BlackjackGame from '@/components/blackjack/BlackjackGame'

export default function BlackjackPage() {
  return (
    <GameLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 overflow-y-auto">
        <BlackjackGame />
      </div>
    </GameLayout>
  )
}

