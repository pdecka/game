'use client'

import { GameLayout } from '@/components/layout/GameLayout'
import SlotsGame from '@/components/slots/SlotsGame'

export default function SlotsPage() {
  return (
    <GameLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 overflow-y-auto">
        <SlotsGame />
      </div>
    </GameLayout>
  )
}

