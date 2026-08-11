'use client'

import { GameLayout } from '@/components/layout/GameLayout'
import CoinGame from '@/components/coin/CoinGame'

export default function CoinflipPage() {
  return (
    <GameLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 overflow-y-auto">
        <CoinGame />
      </div>
    </GameLayout>
  )
}

