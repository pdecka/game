'use client'

import { GameLayout } from '@/components/layout/GameLayout'
import TowerGame from '@/components/tower/TowerGame'

export default function TowerPage() {
  return (
    <GameLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 overflow-y-auto">
        <TowerGame />
      </div>
    </GameLayout>
  )
}

