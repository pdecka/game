'use client'

import { GameLayout } from '@/components/layout/GameLayout'
import RouletteGame from '@/components/roulette/RouletteGame'

export default function RoulettePage() {
  return (
    <GameLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 overflow-y-auto">
        <RouletteGame />
      </div>
    </GameLayout>
  )
}

