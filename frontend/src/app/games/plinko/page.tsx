'use client'

import { GameLayout } from '@/components/layout/GameLayout'
import PlinkoGame from '@/components/plinko/PlinkoGame'

export default function PlinkoPage() {
  return (
    <GameLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 overflow-y-auto">
        <PlinkoGame />
      </div>
    </GameLayout>
  )
}

