'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Shuffle, Play, DollarSign, ChevronDown } from 'lucide-react'

interface GameControlsProps {
  gameState: 'idle' | 'playing' | 'lost' | 'cashed_out'
  betAmount: string
  minesCount: number
  currentMultiplier: number
  potentialWin: number
  revealedCount: number
  onBetAmountChange: (amount: string) => void
  onMinesChange: (mines: number) => void
  onBet: () => void
  onCashout: () => void
  onRandomPick: () => void
  disabled: boolean
  loading?: boolean
}

export default function GameControls({
  gameState,
  betAmount,
  minesCount,
  currentMultiplier,
  potentialWin,
  revealedCount,
  onBetAmountChange,
  onMinesChange,
  onBet,
  onCashout,
  onRandomPick,
  disabled,
  loading = false
}: GameControlsProps) {
  const [betMode, setBetMode] = useState<'manual' | 'auto'>('manual')
  const diamondsCount = 25 - minesCount

  const handleQuickBet = (amount: number) => {
    onBetAmountChange(amount.toString())
  }

  return (
    <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6 space-y-6">
      {/* Bet Mode */}
      <div className="flex gap-2">
        <Button
          variant={betMode === 'manual' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setBetMode('manual')}
          className={`flex-1 transition-all duration-300 ${betMode === 'manual' ? 'bg-emerald-500 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/50 text-white' : 'bg-[#1a2c38] hover:bg-[#2a3c48] border border-white/20 text-white hover:border-emerald-500'}`}
        >
          Manual
        </Button>
        <Button
          variant={betMode === 'auto' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setBetMode('auto')}
          className={`flex-1 transition-all duration-300 ${betMode === 'auto' ? 'bg-emerald-500 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/50 text-white' : 'bg-[#1a2c38] hover:bg-[#2a3c48] border border-white/20 text-white hover:border-emerald-500'}`}
        >
          Auto
        </Button>
      </div>

      {/* Bet Amount */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-white">Bet Amount (INR)</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white font-medium">₹</span>
            <Input
              type="number"
              value={betAmount}
              onChange={(e) => onBetAmountChange(e.target.value)}
              placeholder="0.00"
              disabled={gameState === 'playing' || loading}
              className="bg-[#1a2c38] border-white/20 text-white placeholder:text-slate-500 pl-8 shadow-inner shadow-black/30"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBetAmountChange('')}
            disabled={gameState === 'playing' || loading}
            className="border-white/20 text-white shadow-inner shadow-black/30"
          >
            Clear
          </Button>
        </div>
        
        {/* Quick Bet Buttons */}
        <div className="flex gap-2 flex-wrap">
          {[10, 50, 100, 500, 1000].map((amount) => (
            <Button
              key={amount}
              variant="outline"
              size="sm"
              onClick={() => handleQuickBet(amount)}
              disabled={gameState === 'playing' || loading}
              className="border-white/20 text-white text-xs px-3 py-1 shadow-inner shadow-black/30"
            >
              ₹{amount}
            </Button>
          ))}
        </div>
      </div>

      {/* Mines Count */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-white">
          Number of Mines: <span className="text-emerald-400">{minesCount}</span>
        </label>
        <div className="relative">
          <select
            value={minesCount}
            onChange={(e) => onMinesChange(parseInt(e.target.value))}
            disabled={gameState === 'playing' || loading}
            className="w-full bg-[#1a2c38] border border-white/20 text-white rounded-lg px-4 py-2 appearance-none cursor-pointer shadow-inner shadow-black/30 pr-10 h-10 max-h-[100px] overflow-y-auto"
          >
            {Array.from({ length: 23 }, (_, i) => i + 2).map((num) => (
              <option key={num} value={num} className="bg-[#1a2c38] text-white">
                {num} {num === 1 ? 'Mine' : 'Mines'}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
        </div>
        
        {/* Info */}
        <div className="bg-[#1a2c38] rounded-lg p-3 border border-white/10 shadow-inner shadow-black/30">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Diamonds:</span>
            <span className="text-emerald-400 font-medium">{diamondsCount}</span>
          </div>
        </div>
      </div>


      {/* Action Buttons */}
      <div className="space-y-3">
        {gameState === 'idle' && (
          <Button
            onClick={onBet}
            disabled={disabled || loading || !betAmount || parseFloat(betAmount) <= 0}
            className="w-full bg-emerald-500 hover:bg-emerald-600 cursor-pointer text-white font-bold py-4 text-lg shadow-lg shadow-emerald-500/30 flex items-center justify-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
            ) : (
              <Play className="h-6 w-6 mr-3" />
            )}
            {loading ? 'Placing Bet...' : 'Play'}
          </Button>
        )}

        {gameState === 'playing' && (
          <>
            <Button
              onClick={onCashout}
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 cursor-pointer text-white font-bold py-4 text-lg shadow-lg shadow-emerald-500/30 flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
              ) : (
                <DollarSign className="h-6 w-6 mr-3" />
              )}
              {loading ? 'Cashing Out...' : `Cashout ₹${potentialWin.toFixed(2)}`}
            </Button>
            
            <Button
              variant="outline"
              onClick={onRandomPick}
              className="w-full border-white/20 cursor-pointer transition-all duration-300 bg-[#1a2c38] hover:bg-[#243f50] hover:border-emerald-500 text-white hover:shadow-lg hover:shadow-emerald-500/50 flex items-center justify-center py-4"
            >
              <Shuffle className="h-6 w-6 mr-3" />
              Random Pick
            </Button>
          </>
        )}

        {gameState === 'lost' && (
          <div className="text-center">
            <Button
              onClick={onBet}
              disabled={disabled || !betAmount || parseFloat(betAmount) <= 0}
              className="w-full bg-emerald-500 hover:bg-emerald-600 cursor-pointer text-white font-bold py-4 text-lg shadow-lg shadow-emerald-500/30 flex items-center justify-center"
            >
              <Play className="h-6 w-6 mr-3" />
              Play Again
            </Button>
          </div>
        )}

        {gameState === 'cashed_out' && (
          <div className="text-center">
            <p className="text-emerald-400 font-semibold mb-1">Cashed Out!</p>
            <p className="text-white text-lg font-bold mb-3">₹{potentialWin.toFixed(2)}</p>
            <Button
              onClick={onBet}
              disabled={disabled || !betAmount || parseFloat(betAmount) <= 0}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3"
            >
              <Play className="h-4 w-4 mr-2" />
              Play Again
            </Button>
          </div>
        )}
      </div>

      {/* Game Stats */}
      {gameState === 'playing' && (
        <div className="space-y-3">
          <div className="bg-[#1a2c38] rounded-lg p-4 border border-white/10 space-y-2 shadow-inner shadow-black/30">
            <div className="flex justify-between">
              <span className="text-sm text-slate-400">Revealed:</span>
              <span className="text-sm font-medium text-white">{revealedCount}/25</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-400">Multiplier:</span>
              <span className="text-sm font-medium text-emerald-400">{currentMultiplier.toFixed(2)}x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-400">Potential Win:</span>
              <span className="text-sm font-medium text-emerald-400">₹{potentialWin.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
