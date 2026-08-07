'use client'

import { type Card, SUIT_SYMBOLS, SUIT_COLORS } from '@/utils/deck'

interface HiloCardProps {
  card: Card | null
  isSmall?: boolean
  isRevealed?: boolean
}

export default function HiloCard({ card, isSmall = false, isRevealed = true }: HiloCardProps) {
  if (!card) {
    return (
      <div className={`${isSmall ? 'w-12 h-16' : 'w-24 h-32'} bg-[#1a2c38] rounded-lg border border-white/20 flex items-center justify-center`}>
        <span className={`${isSmall ? 'text-lg' : 'text-2xl'} text-white/50`}>?</span>
      </div>
    )
  }

  const isRed = SUIT_COLORS[card.suit] === 'red'
  const suitSymbol = SUIT_SYMBOLS[card.suit]

  return (
    <div className={`${isSmall ? 'w-12 h-16' : 'w-24 h-32'} bg-white rounded-lg border border-white/20 shadow-lg flex flex-col items-center justify-center transition-all duration-300 ${!isRevealed ? 'transform rotate-y-180' : ''}`}>
      <div className={`${isSmall ? 'text-lg' : 'text-2xl'} font-bold ${isRed ? 'text-red-500' : 'text-black'}`}>
        {card.rank}
      </div>
      <div className={`${isSmall ? 'text-sm' : 'text-lg'} ${isRed ? 'text-red-500' : 'text-black'}`}>
        {suitSymbol}
      </div>
    </div>
  )
}
