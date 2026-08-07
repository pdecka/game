'use client'

import { useState, useEffect } from 'react'
import KenoTile, { AnimatedKenoTile, HotColdTile } from './KenoTile'
import type { KenoRound } from '@/utils/kenoEngine'

interface KenoBoardProps {
  selectedNumbers: number[]
  drawnNumbers: number[]
  isDisabled: boolean
  isAnimating: boolean
  onNumberClick: (number: number) => void
  showHotCold?: boolean
  hotNumbers?: number[]
  coldNumbers?: number[]
  history?: KenoRound[]
}

export default function KenoBoard({
  selectedNumbers,
  drawnNumbers,
  isDisabled,
  isAnimating,
  onNumberClick,
  showHotCold = false,
  hotNumbers = [],
  coldNumbers = [],
  history = []
}: KenoBoardProps) {
  const [animationProgress, setAnimationProgress] = useState(0)
  const [revealedNumbers, setRevealedNumbers] = useState<number[]>([])
  
  // Track animation progress
  useEffect(() => {
    if (isAnimating && drawnNumbers.length > 0) {
      const interval = setInterval(() => {
        setAnimationProgress(prev => {
          const next = prev + 1
          if (next >= drawnNumbers.length) {
            clearInterval(interval)
            return drawnNumbers.length
          }
          return next
        })
      }, 300) // 300ms between reveals
      
      return () => clearInterval(interval)
    } else {
      setAnimationProgress(0)
      setRevealedNumbers([])
    }
  }, [isAnimating, drawnNumbers])
  
  // Update revealed numbers based on progress
  useEffect(() => {
    if (isAnimating) {
      setRevealedNumbers(drawnNumbers.slice(0, animationProgress))
    }
  }, [animationProgress, drawnNumbers, isAnimating])
  
  // Generate board numbers (1-40)
  const boardNumbers = Array.from({ length: 40 }, (_, i) => i + 1)
  
  // Get number statistics for hot/cold display
  const getNumberStats = (number: number) => {
    if (history.length === 0) return 0
    
    return history.reduce((count, round) => {
      return count + (round.result.draw.numbers.includes(number) ? 1 : 0)
    }, 0)
  }
  
  const getBoardLayout = () => {
    // 5 rows x 8 columns layout
    const rows = []
    for (let row = 0; row < 5; row++) {
      const rowNumbers = []
      for (let col = 0; col < 8; col++) {
        const number = row * 8 + col + 1
        rowNumbers.push(number)
      }
      rows.push(rowNumbers)
    }
    return rows
  }
  
  const boardLayout = getBoardLayout()
  
  const renderTile = (number: number, index: number) => {
    const animationDelay = index * 50 // Stagger animation
    const isRevealed = revealedNumbers.includes(number)
    
    if (showHotCold) {
      const isHot = hotNumbers.includes(number)
      const isCold = coldNumbers.includes(number)
      const count = getNumberStats(number)
      
      if (isHot || isCold) {
        return (
          <HotColdTile
            key={number}
            number={number}
            isHot={isHot}
            count={count}
            compact={false}
          />
        )
      }
    }
    
    if (isAnimating && drawnNumbers.includes(number)) {
      return (
        <AnimatedKenoTile
          key={number}
          number={number}
          selectedNumbers={selectedNumbers}
          drawnNumbers={drawnNumbers}
          isDisabled={isDisabled}
          isAnimating={isAnimating}
          animationDelay={animationDelay}
          onClick={onNumberClick}
        />
      )
    }
    
    return (
      <KenoTile
        key={number}
        number={number}
        selectedNumbers={selectedNumbers}
        drawnNumbers={drawnNumbers}
        isDisabled={isDisabled}
        isAnimating={isAnimating}
        animationDelay={animationDelay}
        onClick={onNumberClick}
      />
    )
  }
  
  const getBoardStats = () => {
    const totalSelected = selectedNumbers.length
    const totalDrawn = drawnNumbers.length
    const matches = selectedNumbers.filter(num => drawnNumbers.includes(num)).length
    
    return {
      totalSelected,
      totalDrawn,
      matches,
      progress: totalDrawn > 0 ? (totalDrawn / 10) * 100 : 0
    }
  }
  
  const stats = getBoardStats()
  
  return (
    <div className="space-y-6">
      {/* Board Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Keno Board</h2>
          <p className="text-sm text-slate-400">Select up to 10 numbers</p>
        </div>
        
        {/* Board Stats */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
            <span className="text-slate-400">Selected: {stats.totalSelected}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span className="text-slate-400">Drawn: {stats.totalDrawn}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-600 rounded-full"></div>
            <span className="text-slate-400">Matches: {stats.matches}</span>
          </div>
        </div>
      </div>
      
      {/* Progress Bar (during animation) */}
      {isAnimating && (
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${stats.progress}%` }}
          ></div>
        </div>
      )}
      
      {/* Main Board */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <div className="grid grid-cols-8 gap-2 max-w-2xl mx-auto">
          {boardLayout.map((row, rowIndex) =>
            row.map((number, colIndex) => (
              <div key={number} className="aspect-square">
                {renderTile(number, rowIndex * 8 + colIndex)}
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-700 border border-slate-600 rounded"></div>
          <span>Unselected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-600 border border-purple-700 rounded"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-600 border border-red-700 rounded"></div>
          <span>Drawn</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-600 border border-emerald-700 rounded"></div>
          <span>Match</span>
        </div>
      </div>
      
      {/* Hot/Cold Numbers Toggle */}
      {history.length > 0 && (
        <div className="flex items-center justify-center">
          <button
            onClick={() => {/* Toggle hot/cold view */}}
            className="px-4 py-2 bg-[#1a2c38] hover:bg-[#2a3c48] border border-white/20 rounded-lg text-white text-sm transition-all duration-200"
          >
            {showHotCold ? 'Hide' : 'Show'} Hot/Cold Numbers
          </button>
        </div>
      )}
      
      {/* Quick Actions */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => {/* Quick pick */}}
          disabled={isDisabled || isAnimating}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-all duration-200"
        >
          Quick Pick (10)
        </button>
        <button
          onClick={() => {/* Clear selections */}}
          disabled={isDisabled || isAnimating}
          className="px-4 py-2 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-all duration-200"
        >
          Clear All
        </button>
      </div>
      
      {/* Board Statistics */}
      {stats.totalDrawn > 0 && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Current Round</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-slate-400">Selections</div>
              <div className="text-white font-medium">{stats.totalSelected}</div>
            </div>
            <div>
              <div className="text-slate-400">Drawn</div>
              <div className="text-white font-medium">{stats.totalDrawn}/10</div>
            </div>
            <div>
              <div className="text-slate-400">Matches</div>
              <div className="text-emerald-400 font-medium">{stats.matches}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Compact board for mobile view
export function CompactKenoBoard({
  selectedNumbers,
  drawnNumbers,
  isDisabled,
  isAnimating,
  onNumberClick
}: Omit<KenoBoardProps, 'showHotCold' | 'hotNumbers' | 'coldNumbers' | 'history'>) {
  const boardNumbers = Array.from({ length: 40 }, (_, i) => i + 1)
  
  const getCompactLayout = () => {
    // 8 rows x 5 columns for mobile
    const rows = []
    for (let row = 0; row < 8; row++) {
      const rowNumbers = []
      for (let col = 0; col < 5; col++) {
        const number = row * 5 + col + 1
        if (number <= 40) {
          rowNumbers.push(number)
        }
      }
      rows.push(rowNumbers)
    }
    return rows
  }
  
  const compactLayout = getCompactLayout()
  
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-bold text-white">Keno Board</h2>
        <p className="text-xs text-slate-400">Select up to 10 numbers</p>
      </div>
      
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
        <div className="grid grid-cols-5 gap-1">
          {compactLayout.map((row, rowIndex) =>
            row.map((number, colIndex) => (
              <div key={number} className="aspect-square">
                <KenoTile
                  number={number}
                  selectedNumbers={selectedNumbers}
                  drawnNumbers={drawnNumbers}
                  isDisabled={isDisabled}
                  isAnimating={isAnimating}
                  animationDelay={rowIndex * 5 + colIndex * 50}
                  onClick={onNumberClick}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// Statistics board component
export function KenoStatsBoard({
  history,
  hotNumbers,
  coldNumbers
}: {
  history: KenoRound[]
  hotNumbers: number[]
  coldNumbers: number[]
}) {
  const getOverallStats = () => {
    if (history.length === 0) {
      return {
        totalGames: 0,
        totalWins: 0,
        winRate: 0,
        avgMatches: 0,
        bestMatch: 0
      }
    }
    
    const totalWins = history.filter(round => round.result.isWin).length
    const totalMatches = history.reduce((sum, round) => sum + round.result.matches, 0)
    const bestMatch = Math.max(...history.map(round => round.result.matches))
    
    return {
      totalGames: history.length,
      totalWins,
      winRate: (totalWins / history.length) * 100,
      avgMatches: totalMatches / history.length,
      bestMatch
    }
  }
  
  const stats = getOverallStats()
  
  return (
    <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-400">{stats.totalGames}</div>
          <div className="text-xs text-slate-400">Games</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.winRate.toFixed(1)}%</div>
          <div className="text-xs text-slate-400">Win Rate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-400">{stats.avgMatches.toFixed(1)}</div>
          <div className="text-xs text-slate-400">Avg Matches</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">{stats.bestMatch}</div>
          <div className="text-xs text-slate-400">Best Match</div>
        </div>
      </div>
      
      {/* Hot Numbers */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-orange-400 mb-2">Hot Numbers</h4>
        <div className="flex flex-wrap gap-2">
          {hotNumbers.slice(0, 10).map(number => (
            <HotColdTile
              key={number}
              number={number}
              isHot={true}
              count={history.filter(round => round.result.draw.numbers.includes(number)).length}
              compact={true}
            />
          ))}
        </div>
      </div>
      
      {/* Cold Numbers */}
      <div>
        <h4 className="text-sm font-medium text-blue-400 mb-2">Cold Numbers</h4>
        <div className="flex flex-wrap gap-2">
          {coldNumbers.slice(0, 10).map(number => (
            <HotColdTile
              key={number}
              number={number}
              isHot={false}
              count={history.filter(round => round.result.draw.numbers.includes(number)).length}
              compact={true}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
