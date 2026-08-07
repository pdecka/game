'use client'

import { useState } from 'react'
import { type CrashRound } from '@/utils/crashMath'

interface CrashTopBarProps {
  history: CrashRound[]
}

export default function CrashTopBar({ history }: CrashTopBarProps) {
  const [scrollPosition, setScrollPosition] = useState(0)
  
  const scrollLeft = () => {
    setScrollPosition(prev => Math.max(0, prev - 200))
  }
  
  const scrollRight = () => {
    setScrollPosition(prev => Math.min((history.length - 5) * 80, prev + 200))
  }
  
  const visibleHistory = history.slice(0, 20) // Show last 20 rounds
  
  return (
    <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">Previous Rounds</h3>
        <div className="flex gap-2">
          <button
            onClick={scrollLeft}
            disabled={scrollPosition === 0}
            className="p-1 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={scrollRight}
            disabled={scrollPosition >= (visibleHistory.length - 5) * 80}
            className="p-1 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="overflow-hidden">
        <div 
          className="flex gap-4 transition-transform duration-200"
          style={{ transform: `translateX(-${scrollPosition}px)` }}
        >
          {visibleHistory.map((round, index) => {
            const isHighMultiplier = round.crashPoint >= 2.0
            const isLowMultiplier = round.crashPoint < 1.5
            
            return (
              <div
                key={round.id}
                className={`flex-shrink-0 text-center px-3 py-2 rounded-lg border ${
                  isHighMultiplier 
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                    : isLowMultiplier
                    ? 'bg-slate-500/20 border-slate-500/50 text-slate-400'
                    : 'bg-white/5 border-white/10 text-white'
                }`}
              >
                <div className="text-xs font-medium">
                  {round.crashPoint.toFixed(2)}x
                </div>
                <div className="text-[10px] text-slate-500">
                  {new Date(round.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
