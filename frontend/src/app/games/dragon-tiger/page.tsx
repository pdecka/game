'use client'

import { GameLayout } from '@/components/layout/GameLayout'
import DragonTigerGame from '@/components/dragon-tiger/DragonTigerGame'

export default function DragonTigerPage() {
  return (
    <GameLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 overflow-y-auto">
        <DragonTigerGame />
      </div>
    </GameLayout>
  )
}

