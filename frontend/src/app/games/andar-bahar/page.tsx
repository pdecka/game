'use client'

import { GameLayout } from '@/components/layout/GameLayout'
import AndarBaharGame from '@/components/andar-bahar/AndarBaharGame'

export default function AndarBaharPage() {
  return (
    <GameLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 overflow-y-auto">
        <AndarBaharGame />
      </div>
    </GameLayout>
  )
}

