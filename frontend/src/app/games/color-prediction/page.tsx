'use client'

import { GameLayout } from '@/components/layout/GameLayout'
import ColorGame from '@/components/color/ColorGame'

export default function ColorPredictionPage() {
  return (
    <GameLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 overflow-y-auto">
        <ColorGame />
      </div>
    </GameLayout>
  )
}

