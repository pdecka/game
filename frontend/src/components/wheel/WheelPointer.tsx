'use client'

interface WheelPointerProps {
  isSpinning: boolean
}

export default function WheelPointer({ isSpinning }: WheelPointerProps) {
  return (
    <div className="relative">
      {/* Pointer Triangle */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
        <div className={`w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[40px] border-b-red-600 transition-all duration-200 ${
          isSpinning ? 'animate-bounce' : ''
        }`}></div>
        
        {/* Pointer Glow Effect */}
        <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[40px] border-b-red-400 opacity-50 ${
          isSpinning ? 'animate-pulse' : ''
        }`}></div>
      </div>
      
      {/* Pointer Base */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
        <div className="w-8 h-8 bg-red-700 rounded-full border-2 border-red-800 shadow-lg">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-red-500 to-red-700"></div>
        </div>
      </div>
      
      {/* Pointer Shadow */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 translate-y-1">
        <div className="w-8 h-2 bg-black/20 rounded-full blur-sm"></div>
      </div>
    </div>
  )
}
