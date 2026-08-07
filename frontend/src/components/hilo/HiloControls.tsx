'use client'

import { Button } from '@/components/ui/button'
import { TrendingUp, Wallet, Zap } from 'lucide-react'

interface HiloControlsProps {
  gameState: 'idle' | 'playing' | 'won_step' | 'lost' | 'cashed_out'
  betAmount: number
  multiplier: number
  streak: number
  onBetAmountChange: (amount: number) => void
  onStartGame: () => void
  onHigher: () => void
  onLower: () => void
  onCashout: () => void
}

export default function HiloControls({
  gameState,
  betAmount,
  multiplier,
  streak,
  onBetAmountChange,
  onStartGame,
  onHigher,
  onLower,
  onCashout
}: HiloControlsProps) {
  const canBet = gameState === 'idle'
  const canPredict = gameState === 'playing'
  const canCashout = (gameState === 'playing' || gameState === 'won_step') && streak > 0
  
  const quickBetAmounts = [10, 50, 100, 500]
  
  const potentialProfit = betAmount * multiplier - betAmount

  return (
    <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
      {/* Game Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Hi-Lo Card Game</h1>
        <p className="text-sm text-slate-400">Guess if the next card is higher or lower</p>
      </div>

      {/* Bet Amount */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Bet Amount (INR)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={betAmount}
              onChange={(e) => onBetAmountChange(Number(e.target.value))}
              disabled={!canBet}
              className="flex-1 bg-[#1a2c38] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
            <div className="flex gap-1">
              {quickBetAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => onBetAmountChange(amount)}
                  disabled={!canBet}
                  className="px-3 py-2 bg-[#1a2c38] border border-white/10 rounded-lg text-white hover:bg-white/10 disabled:opacity-50 text-sm"
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {canBet && (
          <Button
            onClick={onStartGame}
            disabled={betAmount <= 0}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
          >
            Start Game
          </Button>
        )}

        {canPredict && (
          <div className="space-y-3">
            <Button
              onClick={onHigher}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              size="lg"
            >
              Higher or Same
            </Button>
            <Button
              onClick={onLower}
              className="w-full bg-red-500 hover:bg-red-600 text-white"
              size="lg"
            >
              Lower or Same
            </Button>
          </div>
        )}

        {canCashout && (
          <Button
            onClick={onCashout}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
            size="lg"
          >
            Cashout
          </Button>
        )}

        {/* Game State Messages */}
        {gameState === 'won_step' && (
          <div className="text-center p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-lg">
            <p className="text-emerald-400 font-medium">Correct! Keep going or cashout</p>
          </div>
        )}

        {gameState === 'lost' && (
          <div className="text-center p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400 font-medium">Wrong! You lost</p>
          </div>
        )}

        {gameState === 'cashed_out' && (
          <div className="text-center p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-lg">
            <p className="text-emerald-400 font-medium">Cashed out successfully!</p>
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <Wallet className="h-4 w-4" />
              <span className="text-sm">Current Multiplier</span>
            </div>
            <div className="text-lg font-semibold text-white">
              {multiplier.toFixed(2)}x
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <Zap className="h-4 w-4" />
              <span className="text-sm">Current Streak</span>
            </div>
            <div className="text-lg font-semibold text-white">
              {streak}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Potential Profit</span>
            </div>
            <div className="text-lg font-semibold text-emerald-400">
              {potentialProfit.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
