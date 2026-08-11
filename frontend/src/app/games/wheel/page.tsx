'use client'

import { GameLayout } from '@/components/layout/GameLayout'
import WheelGame from '@/components/wheel/WheelGame'

export default function WheelPage() {
  return (
    <GameLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 overflow-y-auto">
        <WheelGame />
      </div>
    </GameLayout>
  )
}

