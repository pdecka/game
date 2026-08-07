'use client'

import { useMemo } from 'react'
import { getNumberColor, type RouletteNumber, type RouletteResult } from '@/utils/rouletteConfig'

interface RouletteWheelProps {
  result: RouletteResult | null
  isSpinning: boolean
  wheelRotation: number
  ballRotation: number
}

export default function RouletteWheel({ result, isSpinning, wheelRotation, ballRotation }: RouletteWheelProps) {
  // Wheel numbers in order for visual representation
  const wheelNumbers = useMemo(() => [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26, '00'
  ] as RouletteNumber[], [])

  const getNumberAngle = (index: number) => {
    return (360 / wheelNumbers.length) * index
  }

  const getNumberPosition = (index: number) => {
    const angle = getNumberAngle(index)
    const radius = 120
    const x = Math.cos((angle - 90) * Math.PI / 180) * radius
    const y = Math.sin((angle - 90) * Math.PI / 180) * radius
    return { x, y }
  }

  const getNumberColorClass = (number: RouletteNumber) => {
    const color = getNumberColor(number)
    switch (color) {
      case 'red': return 'bg-red-600 text-white border-red-700'
      case 'black': return 'bg-gray-900 text-white border-gray-800'
      case 'green': return 'bg-green-600 text-white border-green-700'
      default: return 'bg-gray-600 text-white border-gray-700'
    }
  }

  return (
    <div className="relative w-80 h-80 mx-auto">
      {/* Wheel Container */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-900 to-amber-700 border-8 border-amber-800 shadow-2xl">
        {/* Inner wheel */}
        <div 
          className="absolute inset-4 rounded-full bg-gradient-to-br from-amber-800 to-amber-600 border-4 border-amber-700 transition-transform duration-3000 ease-out"
          style={{ transform: `rotate(${wheelRotation}deg)` }}
        >
          {/* Wheel segments */}
          {wheelNumbers.map((number, index) => {
            const { x, y } = getNumberPosition(index)
            const angle = getNumberAngle(index)
            
            return (
              <div
                key={index}
                className="absolute w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300"
                style={{
                  transform: `translate(${x}px, ${y}px) rotate(${angle}deg)`,
                  left: '50%',
                  top: '50%',
                  marginLeft: '-16px',
                  marginTop: '-16px'
                }}
              >
                <div className={`w-full h-full rounded-full flex items-center justify-center ${getNumberColorClass(number)}`}>
                  {number}
                </div>
              </div>
            )
          })}
          
          {/* Center circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-700 to-amber-500 border-4 border-amber-600 shadow-lg flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-amber-400 border-2 border-amber-500"></div>
            </div>
          </div>
        </div>
        
        {/* Ball */}
        <div 
          className="absolute w-6 h-6 rounded-full bg-white border-2 border-gray-300 shadow-lg transition-transform duration-3000 ease-out"
          style={{
            transform: `rotate(${ballRotation}deg) translateY(-120px)`,
            left: '50%',
            top: '50%',
            marginLeft: '-12px',
            marginTop: '-12px'
          }}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-br from-white to-gray-200"></div>
        </div>
      </div>
      
      {/* Result indicator */}
      {result && !isSpinning && (
        <div className="absolute -bottom-16 left-0 right-0 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0f212e] rounded-lg border border-white/20">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getNumberColorClass(result.number)}`}>
              {result.number}
            </div>
            <div className="text-white">
              <div className="text-lg font-bold capitalize">{result.color}</div>
              <div className="text-xs text-slate-400">
                {result.isOdd ? 'Odd' : 'Even'} â¢ {result.isLow ? 'Low' : 'High'}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Spinning indicator */}
      {isSpinning && (
        <div className="absolute -bottom-16 left-0 right-0 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0f212e] rounded-lg border border-white/20">
            <div className="w-4 h-4 rounded-full bg-yellow-400 animate-pulse"></div>
            <div className="text-yellow-400 font-medium animate-pulse">
              Spinning...
            </div>
          </div>
        </div>
      )}
      
      {/* Wheel decoration */}
      <div className="absolute inset-0 rounded-full border-2 border-amber-600 opacity-50"></div>
      <div className="absolute inset-2 rounded-full border border-amber-500 opacity-30"></div>
      
      {/* Pointer */}
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
        <div className="w-0 h-0 border-l-8 border-r-8 border-t-16 border-l-transparent border-r-transparent border-t-yellow-400"></div>
      </div>
    </div>
  )
}
