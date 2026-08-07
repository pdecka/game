'use client'

import { getSymbol, type SymbolType } from '@/utils/slotsConfig'

interface SlotCellProps {
  symbol: SymbolType
  isSpinning?: boolean
  isWinning?: boolean
  isHighlighted?: boolean
  size?: 'small' | 'medium' | 'large'
}

export default function SlotCell({ 
  symbol, 
  isSpinning = false, 
  isWinning = false, 
  isHighlighted = false,
  size = 'medium'
}: SlotCellProps) {
  const symbolData = getSymbol(symbol)
  
  const sizeClasses = {
    small: 'w-12 h-12 text-lg',
    medium: 'w-16 h-16 text-2xl',
    large: 'w-20 h-20 text-3xl'
  }
  
  const baseClasses = `
    ${sizeClasses[size]}
    rounded-lg border-2 flex items-center justify-center font-bold
    transition-all duration-300 transform
    ${isSpinning ? 'animate-pulse' : ''}
    ${isWinning ? 'scale-110 shadow-lg' : ''}
    ${isHighlighted ? 'ring-4 ring-yellow-400 ring-opacity-50' : ''}
  `
  
  const getCellClasses = () => {
    if (isSpinning) {
      return `${baseClasses} bg-gray-600 border-gray-500 text-gray-400`
    }
    
    if (isWinning) {
      return `${baseClasses} ${symbolData.bgColor} border-yellow-400 ${symbolData.color} shadow-yellow-400/50`
    }
    
    return `${baseClasses} ${symbolData.bgColor} border-white/20 ${symbolData.color}`
  }
  
  return (
    <div className={getCellClasses()}>
      {symbolData.display}
    </div>
  )
}
