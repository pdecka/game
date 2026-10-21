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
    <div className="space-y-6 rounded-lg border border-line bg-white p-6 shadow-panel">
      {/* Bet Mode */}
      <div className="flex gap-2">
        <Button
          variant={betMode === 'manual' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setBetMode('manual')}
          className={`flex-1 transition-all duration-300 ${betMode === 'manual' ? 'bg-brand text-white hover:bg-brand-2' : 'border border-line bg-elevated text-ink hover:border-brand/40'}`}
        >
          Manual
        </Button>
        <Button
          variant={betMode === 'auto' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setBetMode('auto')}
          className={`flex-1 transition-all duration-300 ${betMode === 'auto' ? 'bg-brand text-white hover:bg-brand-2' : 'border border-line bg-elevated text-ink hover:border-brand/40'}`}
        >
          Auto
        </Button>
      </div>

      {/* Bet Amount */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-ink">Bet Amount (INR)</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-medium text-ink">₹</span>
            <Input
              type="number"
              value={betAmount}
              onChange={(e) => onBetAmountChange(e.target.value)}
              placeholder="0.00"
              disabled={gameState === 'playing' || loading}
              className="border-line bg-white pl-8 text-ink placeholder:text-ink-3"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBetAmountChange('')}
            disabled={gameState === 'playing' || loading}
            className="border-line text-ink"
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
              className="border-line px-3 py-1 text-xs text-ink"
            >
              ₹{amount}
            </Button>
          ))}
        </div>
      </div>

      {/* Mines Count */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-ink">
          Number of Mines: <span className="text-brand-2">{minesCount}</span>
        </label>
        <div className="relative">
          <select
            value={minesCount}
            onChange={(e) => onMinesChange(parseInt(e.target.value))}
            disabled={gameState === 'playing' || loading}
            className="h-10 max-h-[100px] w-full cursor-pointer appearance-none overflow-y-auto rounded-lg border border-line bg-white px-4 py-2 pr-10 text-ink"
          >
            {Array.from({ length: 23 }, (_, i) => i + 2).map((num) => (
              <option key={num} value={num} className="bg-white text-ink">
                {num} {num === 1 ? 'Mine' : 'Mines'}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-2" />
        </div>
        
        {/* Info */}
        <div className="rounded-lg border border-line bg-elevated p-3">
          <div className="flex justify-between text-xs">
            <span className="text-ink-3">Diamonds:</span>
            <span className="font-medium text-brand-2">{diamondsCount}</span>
          </div>
        </div>
      </div>


      {/* Action Buttons */}
      <div className="space-y-3">
        {gameState === 'idle' && (
          <Button
            onClick={onBet}
            disabled={disabled || loading || !betAmount || parseFloat(betAmount) <= 0}
            className="flex w-full cursor-pointer items-center justify-center bg-brand py-4 text-lg font-bold text-white hover:bg-brand-2"
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
              className="flex w-full cursor-pointer items-center justify-center bg-brand py-4 text-lg font-bold text-white hover:bg-brand-2"
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
              className="flex w-full cursor-pointer items-center justify-center border-line bg-elevated py-4 text-ink hover:border-brand/40 hover:bg-brand/10"
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
              className="flex w-full cursor-pointer items-center justify-center bg-brand py-4 text-lg font-bold text-white hover:bg-brand-2"
            >
              <Play className="h-6 w-6 mr-3" />
              Play Again
            </Button>
          </div>
        )}

        {gameState === 'cashed_out' && (
          <div className="text-center">
            <p className="mb-1 font-semibold text-brand-2">Cashed Out!</p>
            <p className="odds-num mb-3 text-lg font-bold text-ink">₹{potentialWin.toFixed(2)}</p>
            <Button
              onClick={onBet}
              disabled={disabled || !betAmount || parseFloat(betAmount) <= 0}
              className="flex w-full items-center justify-center bg-brand py-3 font-semibold text-white hover:bg-brand-2"
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
          <div className="space-y-2 rounded-lg border border-line bg-elevated p-4">
            <div className="flex justify-between">
              <span className="text-sm text-ink-3">Revealed:</span>
              <span className="odds-num text-sm font-medium text-ink">{revealedCount}/25</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-ink-3">Multiplier:</span>
              <span className="odds-num text-sm font-medium text-brand-2">{currentMultiplier.toFixed(2)}x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-ink-3">Potential Win:</span>
              <span className="odds-num text-sm font-medium text-brand-2">₹{potentialWin.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
