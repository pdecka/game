'use client'

import { GameLayout } from '@/components/layout/GameLayout'
import HiloGame from '@/components/hilo/HiloGame'

export default function HiLoPage() {
  return (
    <GameLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 overflow-y-auto">
        <HiloGame />
      </div>
    </GameLayout>
  )
}

