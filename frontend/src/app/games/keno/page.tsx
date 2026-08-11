'use client'

import { GameLayout } from '@/components/layout/GameLayout'
import KenoGame from '@/components/keno/KenoGame'

export default function KenoPage() {
  return (
    <GameLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 overflow-y-auto">
        <KenoGame />
      </div>
    </GameLayout>
  )
}

