'use client'

import { Button } from '@/components/ui/button'
import { Wallet, TrendingUp, Zap } from 'lucide-react'
import { ROW_OPTIONS, type RiskLevel } from '@/utils/plinkoConfig'

interface PlinkoControlsProps {
  gameState: 'idle' | 'dropping' | 'animating' | 'completed'
  betAmount: number
  rows: number
  risk: RiskLevel
  maxMultiplier: number
  potentialMaxWin: number
  onBetAmountChange: (amount: number) => void
  onRowsChange: (rows: number) => void
  onRiskChange: (risk: RiskLevel) => void
  onDropBall: () => void
}

export default function PlinkoControls({
  gameState,
  betAmount,
  rows,
  risk,
  maxMultiplier,
  potentialMaxWin,
  onBetAmountChange,
  onRowsChange,
  onRiskChange,
  onDropBall
}: PlinkoControlsProps) {
  const canPlay = gameState === 'idle'
  const isPlaying = gameState === 'dropping' || gameState === 'animating'
  
  const quickBetAmounts = [10, 50, 100, 500]
  
  return (
    <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
      {/* Game Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Plinko</h1>
        <p className="text-sm text-slate-400">Drop the ball and hit a multiplier slot!</p>
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
              disabled={!canPlay}
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
                  disabled={!canPlay}
                  className="px-3 py-2 bg-[#1a2c38] border border-white/10 rounded-lg text-white hover:bg-white/10 disabled:opacity-50 text-sm"
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Risk Level */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Risk Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['low', 'medium', 'high'] as RiskLevel[]).map((riskLevel) => (
              <Button
                key={riskLevel}
                variant={risk === riskLevel ? 'default' : 'outline'}
                onClick={() => onRiskChange(riskLevel)}
                disabled={!canPlay}
                className={`${
                  risk === riskLevel
                    ? riskLevel === 'low' 
                      ? 'bg-emerald-500 hover:bg-emerald-600'
                      : riskLevel === 'medium'
                      ? 'bg-yellow-500 hover:bg-yellow-600'
                      : 'bg-red-500 hover:bg-red-600'
                    : 'border-white/20 text-white hover:bg-white/10'
                } disabled:opacity-50`}
                size="sm"
              >
                {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Rows */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Number of Rows
          </label>
          <div className="grid grid-cols-5 gap-2">
            {ROW_OPTIONS.map((rowCount) => (
              <Button
                key={rowCount}
                variant={rows === rowCount ? 'default' : 'outline'}
                onClick={() => onRowsChange(rowCount)}
                disabled={!canPlay}
                className={`${
                  rows === rowCount
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'border-white/20 text-white hover:bg-white/10'
                } disabled:opacity-50`}
                size="sm"
              >
                {rowCount}
              </Button>
            ))}
          </div>
        </div>

        {/* Drop Ball Button */}
        <Button
          onClick={onDropBall}
          disabled={!canPlay || betAmount <= 0}
          className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          size="lg"
        >
          {isPlaying ? 'Dropping...' : 'Drop Ball'}
        </Button>

        {/* Game State Messages */}
        {gameState === 'completed' && (
          <div className="text-center p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-lg">
            <p className="text-emerald-400 font-medium">Ball landed successfully!</p>
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <Wallet className="h-4 w-4" />
              <span className="text-sm">Max Multiplier</span>
            </div>
            <div className="text-lg font-semibold text-white">
              {maxMultiplier.toFixed(1)}x
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <Zap className="h-4 w-4" />
              <span className="text-sm">Current Risk</span>
            </div>
            <div className="text-lg font-semibold capitalize text-white">
              {risk}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Max Potential Win</span>
            </div>
            <div className="text-lg font-semibold text-emerald-400">
              {potentialMaxWin.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Risk Description */}
      <div className="mt-6 p-4 bg-[#1a2c38] rounded-lg border border-white/10">
        <h4 className="text-sm font-medium text-white mb-2">Risk Level Info</h4>
        <div className="text-xs text-slate-400 space-y-1">
          {risk === 'low' && (
            <>
              <p>â¢ Lower multipliers, higher win rate</p>
              <p>â¢ Safer gameplay with consistent returns</p>
              <p>â¢ Max multiplier: {maxMultiplier}x</p>
            </>
          )}
          {risk === 'medium' && (
            <>
              <p>â¢ Balanced risk and reward</p>
              <p>â¢ Moderate multipliers with fair odds</p>
              <p>â¢ Max multiplier: {maxMultiplier}x</p>
            </>
          )}
          {risk === 'high' && (
            <>
              <p>â¢ High multipliers, lower win rate</p>
              <p>â¢ Extreme risk for big wins</p>
              <p>â¢ Max multiplier: {maxMultiplier}x</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
