'use client'

import { GameLayout } from '@/components/layout/GameLayout'
import DiceGame from '@/components/dice/DiceGame'

export default function DicePage() {
  return (
    <GameLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 overflow-y-auto">
        <DiceGame />
      </div>
    </GameLayout>
  )
}
