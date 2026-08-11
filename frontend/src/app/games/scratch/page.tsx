'use client'

import { GameLayout } from '@/components/layout/GameLayout'
import ScratchGame from '@/components/scratch/ScratchGame'

export default function ScratchPage() {
  return (
    <GameLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 overflow-y-auto">
        <ScratchGame />
      </div>
    </GameLayout>
  )
}

