'use client'

import { GameLayout } from '@/components/layout/GameLayout'
import PokerGame from '@/components/poker/PokerGame'

export default function PokerPage() {
  return (
    <GameLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 overflow-y-auto">
        <PokerGame />
      </div>
    </GameLayout>
  )
}
