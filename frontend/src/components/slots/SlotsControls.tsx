'use client'

import { Button } from '@/components/ui/button'
import { Wallet, TrendingUp, Zap, Coins } from 'lucide-react'

interface SlotsControlsProps {
  gameState: 'idle' | 'spinning' | 'evaluating' | 'completed'
  betAmount: number
  lastWin: number
  totalPayout: number
  spinCount: number
  onBetAmountChange: (amount: number) => void
  onSpin: () => void
}

export default function SlotsControls({
  gameState,
  betAmount,
  lastWin,
  totalPayout,
  spinCount,
  onBetAmountChange,
  onSpin
}: SlotsControlsProps) {
  const canSpin = gameState === 'idle'
  const isPlaying = gameState === 'spinning' || gameState === 'evaluating'
  
  const quickBetAmounts = [10, 25, 50, 100, 250]
  
  return (
    <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
      {/* Game Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Slots</h1>
        <p className="text-sm text-slate-400">5x5 Grid with 20 Paylines & Cluster Wins!</p>
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
              disabled={!canSpin}
              className="flex-1 bg-[#1a2c38] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
              placeholder="0.00"
              min="0"
              step="1"
            />
            <div className="flex gap-1 flex-wrap">
              {quickBetAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => onBetAmountChange(amount)}
                  disabled={!canSpin}
                  className="px-3 py-2 bg-[#1a2c38] border border-white/10 rounded-lg text-white hover:bg-white/10 disabled:opacity-50 text-sm"
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Spin Button */}
        <Button
          onClick={onSpin}
          disabled={!canSpin || betAmount <= 0}
          className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg py-3"
          size="lg"
        >
          {isPlaying ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Spinning...
            </div>
          ) : (
            'SPIN'
          )}
        </Button>

        {/* Game State Messages */}
        {gameState === 'evaluating' && (
          <div className="text-center p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
            <p className="text-blue-400 font-medium">Evaluating wins...</p>
          </div>
        )}
        
        {gameState === 'completed' && totalPayout > 0 && (
          <div className="text-center p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-lg">
            <p className="text-emerald-400 font-medium">Win! +{totalPayout.toFixed(2)}</p>
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <Wallet className="h-4 w-4" />
              <span className="text-sm">Current Bet</span>
            </div>
            <div className="text-lg font-semibold text-white">
              {betAmount.toFixed(2)}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <Coins className="h-4 w-4" />
              <span className="text-sm">Last Win</span>
            </div>
            <div className="text-lg font-semibold text-emerald-400">
              {lastWin > 0 ? lastWin.toFixed(2) : '0.00'}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <Zap className="h-4 w-4" />
              <span className="text-sm">Total Spins</span>
            </div>
            <div className="text-lg font-semibold text-white">
              {spinCount}
            </div>
          </div>
        </div>
      </div>

      {/* Game Info */}
      <div className="mt-6 p-4 bg-[#1a2c38] rounded-lg border border-white/10">
        <h4 className="text-sm font-medium text-white mb-3">How to Win</h4>
        <div className="text-xs text-slate-400 space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">â¢</span>
            <span>Paylines: Match 3+ symbols across 20 different lines</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-400">â¢</span>
            <span>Clusters: 4+ adjacent matching symbols</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-yellow-400">â¢</span>
            <span>Jackpot: All 25 cells showing &quot;7&quot;</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-400">â¢</span>
            <span>Wild (W) substitutes for any symbol</span>
          </div>
        </div>
      </div>

      {/* Symbol Values */}
      <div className="mt-6 p-4 bg-[#1a2c38] rounded-lg border border-white/10">
        <h4 className="text-sm font-medium text-white mb-3">Symbol Values</h4>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 bg-slate-600 rounded text-slate-400 text-xs flex items-center justify-center font-bold">1</span>
            <span className="text-slate-400">Low</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 bg-orange-600 rounded text-orange-400 text-xs flex items-center justify-center font-bold">6</span>
            <span className="text-slate-400">Med</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 bg-red-600 rounded text-red-500 text-xs flex items-center justify-center font-bold">7</span>
            <span className="text-slate-400">High</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 bg-purple-600 rounded text-purple-400 text-xs flex items-center justify-center font-bold">B</span>
            <span className="text-slate-400">Bonus</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 bg-pink-600 rounded text-pink-400 text-xs flex items-center justify-center font-bold">W</span>
            <span className="text-slate-400">Wild</span>
          </div>
        </div>
      </div>
    </div>
  )
}
