'use client'

import { GameLayout } from '@/components/layout/GameLayout'
import LimboGame from '@/components/limbo/LimboGame'

export default function LimboPage() {
  return (
    <GameLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 overflow-y-auto">
        <LimboGame />
      </div>
    </GameLayout>
  )
}

