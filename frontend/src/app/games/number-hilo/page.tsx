'use client'

import { GameLayout } from '@/components/layout/GameLayout'
import TicTacToeGame from '@/components/tic-tac-toe/TicTacToeGame'

export default function NumberHiLoPage() {
  return (
    <GameLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 overflow-y-auto">
        <TicTacToeGame />
      </div>
    </GameLayout>
  )
}

