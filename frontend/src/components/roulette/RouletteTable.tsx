'use client'

import { useState } from 'react'
import { getNumberColor, RED_NUMBERS, BLACK_NUMBERS, type RouletteNumber, type BetType } from '@/utils/rouletteConfig'
import { getBetChipColor } from '@/utils/rouletteMath'
import type { Bet } from '@/utils/rouletteMath'

interface RouletteTableProps {
  bets: Bet[]
  onPlaceBet: (type: BetType, amount: number, numbers?: RouletteNumber[]) => void
  onRemoveBet: (betId: string) => void
  selectedBetAmount: number
  canBet: boolean
}

export default function RouletteTable({ bets, onPlaceBet, onRemoveBet, selectedBetAmount, canBet }: RouletteTableProps) {
  const [selectedNumbers, setSelectedNumbers] = useState<RouletteNumber[]>([])
  
  // Number grid (3x12 for 0-36 + 00)
  const numberGrid = [
    [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
    [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
    [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34]
  ]
  
  const getNumberColorClass = (number: RouletteNumber) => {
    const color = getNumberColor(number)
    switch (color) {
      case 'red': return 'bg-red-600 hover:bg-red-700 text-white border-red-700'
      case 'black': return 'bg-gray-900 hover:bg-gray-800 text-white border-gray-800'
      case 'green': return 'bg-green-600 hover:bg-green-700 text-white border-green-700'
      default: return 'bg-gray-600 hover:bg-gray-700 text-white border-gray-700'
    }
  }
  
  const handleNumberClick = (number: RouletteNumber) => {
    if (!canBet) return
    
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(prev => prev.filter(n => n !== number))
    } else {
      setSelectedNumbers(prev => [...prev, number])
    }
  }
  
  const handleBet = (type: BetType, numbers?: RouletteNumber[]) => {
    if (!canBet || selectedBetAmount <= 0) return
    onPlaceBet(type, selectedBetAmount, numbers)
    setSelectedNumbers([])
  }
  
  const getBetOnNumber = (number: RouletteNumber) => {
    return bets.filter(bet => bet.numbers.includes(number))
  }
  
  const getBetOnType = (type: BetType) => {
    return bets.filter(bet => bet.type === type)
  }
  
  return (
    <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Betting Table</h3>
      
      {/* Zero section */}
      <div className="mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => handleNumberClick(0)}
            disabled={!canBet}
            className={`w-16 h-16 rounded-lg font-bold text-lg border-2 transition-all ${getNumberColorClass(0)} ${!canBet ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            0
          </button>
          <button
            onClick={() => handleNumberClick('00')}
            disabled={!canBet}
            className={`w-16 h-16 rounded-lg font-bold text-lg border-2 transition-all ${getNumberColorClass('00')} ${!canBet ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            00
          </button>
        </div>
      </div>
      
      {/* Number grid */}
      <div className="mb-6">
        {numberGrid.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1 mb-1">
            {row.map(number => {
              const isSelected = selectedNumbers.includes(number as RouletteNumber)
              const betsOnNumber = getBetOnNumber(number as RouletteNumber)
              
              return (
                <button
                  key={number}
                  onClick={() => handleNumberClick(number as RouletteNumber)}
                  disabled={!canBet}
                  className={`relative flex-1 h-12 rounded font-bold text-sm border-2 transition-all ${getNumberColorClass(number as RouletteNumber)} ${isSelected ? 'ring-2 ring-yellow-400' : ''} ${!canBet ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {number}
                  
                  {/* Bet chips */}
                  {betsOnNumber.map((bet, index) => (
                    <div
                      key={bet.id}
                      className={`absolute -top-1 -right-1 w-6 h-6 rounded-full ${getBetChipColor(bet.amount)} text-white text-xs font-bold flex items-center justify-center border border-white/30`}
                      style={{ zIndex: index + 1 }}
                    >
                      {bet.amount}
                    </div>
                  ))}
                </button>
              )
            })}
          </div>
        ))}
      </div>
      
      {/* Outside bets */}
      <div className="space-y-3">
        {/* Dozens */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleBet('dozen1')}
            disabled={!canBet}
            className={`py-3 px-4 rounded-lg font-medium border-2 transition-all bg-[#1a2c38] hover:bg-[#2a3c48] text-white border-white/20 ${!canBet ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            1st 12
            {getBetOnType('dozen1').map(bet => (
              <div key={bet.id} className={`inline-block ml-1 w-4 h-4 rounded-full ${getBetChipColor(bet.amount)} text-white text-xs`}></div>
            ))}
          </button>
          <button
            onClick={() => handleBet('dozen2')}
            disabled={!canBet}
            className={`py-3 px-4 rounded-lg font-medium border-2 transition-all bg-[#1a2c38] hover:bg-[#2a3c48] text-white border-white/20 ${!canBet ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            2nd 12
            {getBetOnType('dozen2').map(bet => (
              <div key={bet.id} className={`inline-block ml-1 w-4 h-4 rounded-full ${getBetChipColor(bet.amount)} text-white text-xs`}></div>
            ))}
          </button>
          <button
            onClick={() => handleBet('dozen3')}
            disabled={!canBet}
            className={`py-3 px-4 rounded-lg font-medium border-2 transition-all bg-[#1a2c38] hover:bg-[#2a3c48] text-white border-white/20 ${!canBet ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            3rd 12
            {getBetOnType('dozen3').map(bet => (
              <div key={bet.id} className={`inline-block ml-1 w-4 h-4 rounded-full ${getBetChipColor(bet.amount)} text-white text-xs`}></div>
            ))}
          </button>
        </div>
        
        {/* Even money bets */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleBet('red')}
            disabled={!canBet}
            className={`py-3 px-4 rounded-lg font-medium border-2 transition-all bg-red-600 hover:bg-red-700 text-white border-red-700 ${!canBet ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Red
            {getBetOnType('red').map(bet => (
              <div key={bet.id} className={`inline-block ml-1 w-4 h-4 rounded-full ${getBetChipColor(bet.amount)} text-white text-xs`}></div>
            ))}
          </button>
          <button
            onClick={() => handleBet('black')}
            disabled={!canBet}
            className={`py-3 px-4 rounded-lg font-medium border-2 transition-all bg-gray-900 hover:bg-gray-800 text-white border-gray-800 ${!canBet ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Black
            {getBetOnType('black').map(bet => (
              <div key={bet.id} className={`inline-block ml-1 w-4 h-4 rounded-full ${getBetChipColor(bet.amount)} text-white text-xs`}></div>
            ))}
          </button>
          <button
            onClick={() => handleBet('odd')}
            disabled={!canBet}
            className={`py-3 px-4 rounded-lg font-medium border-2 transition-all bg-[#1a2c38] hover:bg-[#2a3c48] text-white border-white/20 ${!canBet ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Odd
            {getBetOnType('odd').map(bet => (
              <div key={bet.id} className={`inline-block ml-1 w-4 h-4 rounded-full ${getBetChipColor(bet.amount)} text-white text-xs`}></div>
            ))}
          </button>
          <button
            onClick={() => handleBet('even')}
            disabled={!canBet}
            className={`py-3 px-4 rounded-lg font-medium border-2 transition-all bg-[#1a2c38] hover:bg-[#2a3c48] text-white border-white/20 ${!canBet ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Even
            {getBetOnType('even').map(bet => (
              <div key={bet.id} className={`inline-block ml-1 w-4 h-4 rounded-full ${getBetChipColor(bet.amount)} text-white text-xs`}></div>
            ))}
          </button>
        </div>
        
        {/* High/Low */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleBet('low')}
            disabled={!canBet}
            className={`py-3 px-4 rounded-lg font-medium border-2 transition-all bg-[#1a2c38] hover:bg-[#2a3c48] text-white border-white/20 ${!canBet ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            1-18
            {getBetOnType('low').map(bet => (
              <div key={bet.id} className={`inline-block ml-1 w-4 h-4 rounded-full ${getBetChipColor(bet.amount)} text-white text-xs`}></div>
            ))}
          </button>
          <button
            onClick={() => handleBet('high')}
            disabled={!canBet}
            className={`py-3 px-4 rounded-lg font-medium border-2 transition-all bg-[#1a2c38] hover:bg-[#2a3c48] text-white border-white/20 ${!canBet ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            19-36
            {getBetOnType('high').map(bet => (
              <div key={bet.id} className={`inline-block ml-1 w-4 h-4 rounded-full ${getBetChipColor(bet.amount)} text-white text-xs`}></div>
            ))}
          </button>
        </div>
      </div>
      
      {/* Selected numbers action */}
      {selectedNumbers.length > 0 && canBet && (
        <div className="mt-4 p-3 bg-[#1a2c38] rounded-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div className="text-sm text-white">
              Selected: {selectedNumbers.join(', ')}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleBet('straight', [selectedNumbers[0]])}
                disabled={selectedNumbers.length !== 1}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm disabled:opacity-50"
              >
                Straight ({selectedNumbers.length === 1 ? '1' : '0'})
              </button>
              <button
                onClick={() => setSelectedNumbers([])}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
