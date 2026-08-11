'use client'

import { GameLayout } from '@/components/layout/GameLayout'
import BaccaratGame from '@/components/baccarat/BaccaratGame'

export default function BaccaratPage() {
  return (
    <GameLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 overflow-y-auto">
        <BaccaratGame />
      </div>
    </GameLayout>
  )
}

