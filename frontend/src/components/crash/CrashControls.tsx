'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Wallet, TrendingUp, Users } from 'lucide-react'

interface CrashControlsProps {
  gameState: 'waiting' | 'running' | 'crashed' | 'cashed_out'
  betAmount: number
  autoCashout: number
  hasActiveBet: boolean
  cashedOutAt?: number
  playerCount: number
  onBetAmountChange: (amount: number) => void
  onAutoCashoutChange: (amount: number) => void
  onPlaceBet: () => void
  onCashout: () => void
}

export default function CrashControls({
  gameState,
  betAmount,
  autoCashout,
  hasActiveBet,
  cashedOutAt,
  playerCount,
  onBetAmountChange,
  onAutoCashoutChange,
  onPlaceBet,
  onCashout
}: CrashControlsProps) {
  const [activeTab, setActiveTab] = useState<'manual' | 'auto'>('manual')
  
  const canBet = gameState === 'waiting' && !hasActiveBet
  const canCashout = gameState === 'running' && hasActiveBet && !cashedOutAt
  
  const quickBetAmounts = [10, 50, 100, 500, 1000]
  
  return (
    <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
      {/* Tabs */}
      <div className="flex mb-6 border-b border-white/10">
        <button
          onClick={() => setActiveTab('manual')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'manual'
              ? 'text-white border-b-2 border-emerald-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Manual
        </button>
        <button
          onClick={() => setActiveTab('auto')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'auto'
              ? 'text-white border-b-2 border-emerald-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Auto
        </button>
      </div>
      
      {activeTab === 'manual' ? (
        <div className="space-y-4">
          {/* Bet Amount */}
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
                    ¥{amount}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Auto Cashout */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Auto Cashout At
            </label>
            <input
              type="number"
              value={autoCashout}
              onChange={(e) => onAutoCashoutChange(Number(e.target.value))}
              disabled={!canBet}
              className="w-full bg-[#1a2c38] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
              placeholder="2.00"
              min="1.01"
              step="0.01"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onPlaceBet}
              disabled={!canBet}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {gameState === 'waiting' ? 'Bet' : 'Next Round'}
            </Button>
            
            <Button
              onClick={onCashout}
              disabled={!canCashout}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cashout
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Auto Mode Settings */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Bet Amount (INR)
            </label>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => onBetAmountChange(Number(e.target.value))}
              disabled={!canBet}
              className="w-full bg-[#1a2c38] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Stop After
            </label>
            <input
              type="number"
              placeholder="Number of rounds"
              className="w-full bg-[#1a2c38] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              min="1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              On Loss
            </label>
            <select className="w-full bg-[#1a2c38] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option>Stop</option>
              <option>Return to Base</option>
              <option>Increase Bet</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              On Win
            </label>
            <select className="w-full bg-[#1a2c38] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option>Return to Base</option>
              <option>Increase Bet</option>
              <option>Keep Same</option>
            </select>
          </div>
          
          <Button
            onClick={onPlaceBet}
            disabled={!canBet}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Auto Betting
          </Button>
        </div>
      )}
      
      {/* Stats Section */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center gap-2 text-slate-400 mb-1">
              <Wallet className="h-4 w-4" />
              <span className="text-xs">Profit on Win</span>
            </div>
            <div className="text-lg font-semibold text-white">
              ¥{hasActiveBet ? (betAmount * (cashedOutAt || 1) - betAmount).toFixed(2) : '0.00'}
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-center gap-2 text-slate-400 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Current Multiplier</span>
            </div>
            <div className="text-lg font-semibold text-white">
              {cashedOutAt ? `${cashedOutAt.toFixed(2)}x` : '1.00x'}
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-center gap-2 text-slate-400 mb-1">
              <Users className="h-4 w-4" />
              <span className="text-xs">Active Players</span>
            </div>
            <div className="text-lg font-semibold text-white">
              {playerCount}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
