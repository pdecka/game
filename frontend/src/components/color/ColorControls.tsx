'use client'

import { Button } from '@/components/ui/button'
import { DollarSign, TrendingUp, PlayCircle, X, Shield, BarChart } from 'lucide-react'
import { 
  COLOR_CONFIG,
  formatPayout,
  type Color,
  type Number,
  type ColorBet
} from '@/utils/colorConfig'

interface ColorControlsProps {
  bets: ColorBet[]
  betAmount: number
  selectedColor: Color | null
  selectedNumber: Number | null
  totalBetAmount: number
  totalPayout: number
  canBet: boolean
  onBetAmountChange: (amount: number) => void
  onColorSelect: (color: Color) => void
  onNumberSelect: (number: Number) => void
  onPlaceBet: (type: 'color' | 'number', value: Color | Number, amount: number) => void
  onRemoveBet: (betId: string) => void
  onClearAllBets: () => void
}

export default function ColorControls({
  bets,
  betAmount,
  selectedColor,
  selectedNumber,
  totalBetAmount,
  totalPayout,
  canBet,
  onBetAmountChange,
  onColorSelect,
  onNumberSelect,
  onPlaceBet,
  onRemoveBet,
  onClearAllBets
}: ColorControlsProps) {
  const quickBetAmounts = [10, 25, 50, 100, 250, 500]
  const colors: Color[] = ['red', 'green', 'purple']
  const numbers: Number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as Number[]
  
  const handleColorBet = (color: Color) => {
    if (!canBet || betAmount <= 0) return
    onPlaceBet('color', color, betAmount)
  }
  
  const handleNumberBet = (number: Number) => {
    if (!canBet || betAmount <= 0) return
    onPlaceBet('number', number, betAmount)
  }
  
  const getColorBets = (color: Color) => {
    return bets.filter(bet => bet.type === 'color' && bet.value === color)
  }
  
  const getNumberBets = (number: Number) => {
    return bets.filter(bet => bet.type === 'number' && bet.value === number)
  }
  
  const getPotentialPayout = () => {
    if (totalBetAmount === 0) return 0
    // Simplified calculation for display
    return totalBetAmount * 2 // Average multiplier
  }
  
  return (
    <div className="space-y-6">
      {/* Bet Amount Selection */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Bet Amount</h4>
        
        <div className="grid grid-cols-3 gap-2 mb-4">
          {quickBetAmounts.map(amount => (
            <button
              key={amount}
              onClick={() => onBetAmountChange(amount)}
              disabled={!canBet}
              className={`py-2 px-4 rounded-lg font-medium transition-all ${
                betAmount === amount 
                  ? 'bg-emerald-600 text-white border-emerald-700' 
                  : 'bg-[#1a2c38] hover:bg-[#2a3c48] text-white border-white/20'
              } ${!canBet ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {amount}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={betAmount}
            onChange={(e) => onBetAmountChange(Number(e.target.value))}
            disabled={!canBet}
            className="flex-1 bg-[#1a2c38] border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
            placeholder="Custom amount"
            min="1"
            max="10000"
          />
          <div className="text-white">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>
      </div>
      
      {/* Color Betting */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Color Bets</h4>
        <div className="grid grid-cols-3 gap-3">
          {colors.map((color) => {
            const config = COLOR_CONFIG[color]
            const colorBets = getColorBets(color)
            
            return (
              <button
                key={color}
                onClick={() => handleColorBet(color)}
                disabled={!canBet || betAmount <= 0}
                className={`relative py-4 px-4 rounded-lg font-medium transition-all ${
                  selectedColor === color 
                    ? 'ring-2 ring-emerald-500 transform scale-105' 
                    : ''
                } ${config.bgClass} ${config.hoverClass} text-white ${
                  !canBet || betAmount <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="text-2xl mb-1">{config.emoji}</div>
                <div className="font-bold">{config.name}</div>
                <div className="text-xs opacity-90">2x payout</div>
                
                {/* Bet indicator */}
                {colorBets.length > 0 && (
                  <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-yellow-600">
                    {colorBets.length}
                  </div>
                )}
              </button>
            )
          })}
        </div>
        
        <div className="mt-4 text-center text-sm text-slate-400">
          Click a color to place a {betAmount} bet
        </div>
      </div>
      
      {/* Number Betting */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Number Bets</h4>
        <div className="grid grid-cols-5 gap-2">
          {numbers.map((number) => {
            const color = bets.find(bet => bet.type === 'number' && bet.value === number)?.type === 'number' ? 
              COLOR_CONFIG[COLOR_CONFIG.red.bgClass.includes('red') ? 'red' : 
               COLOR_CONFIG.green.bgClass.includes('green') ? 'green' : 'purple'].name : 'gray'
            const numberBets = getNumberBets(number)
            const isSpecial = number === 0 || number === 5
            
            return (
              <button
                key={number}
                onClick={() => handleNumberBet(number)}
                disabled={!canBet || betAmount <= 0}
                className={`relative py-3 px-2 rounded-lg font-medium transition-all ${
                  selectedNumber === number 
                    ? 'ring-2 ring-emerald-500 transform scale-105' 
                    : ''
                } ${
                  isSpecial 
                    ? 'bg-purple-500 hover:bg-purple-600 text-white border-purple-600'
                    : 'bg-[#1a2c38] hover:bg-[#2a3c48] text-white border-white/20'
                } ${!canBet || betAmount <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="text-lg font-bold">{number}</div>
                <div className="text-xs opacity-90">{isSpecial ? '5x' : '9x'}</div>
                
                {/* Bet indicator */}
                {numberBets.length > 0 && (
                  <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-yellow-600">
                    {numberBets.length}
                  </div>
                )}
              </button>
            )
          })}
        </div>
        
        <div className="mt-4 text-center text-sm text-slate-400">
          Click a number to place a {betAmount} bet
        </div>
      </div>
      
      {/* Current Bets */}
      {bets.length > 0 && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">Current Bets</h4>
            <button
              onClick={onClearAllBets}
              disabled={!canBet}
              className={`px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-all ${!canBet ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Clear All
            </button>
          </div>
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {bets.map((bet) => (
              <div key={bet.id} className="flex items-center justify-between p-2 bg-[#1a2c38] rounded-lg">
                <div className="text-white">
                  <div className="font-medium capitalize">
                    {bet.type === 'color' ? `${bet.value} Color` : `Number ${bet.value}`}
                  </div>
                  <div className="text-xs text-slate-400">
                    {bet.payout}x payout
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-emerald-400 font-medium">{bet.amount}</div>
                  <div className="text-slate-400 text-sm">{bet.payout}:1</div>
                  {canBet && (
                    <button
                      onClick={() => onRemoveBet(bet.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Total Bet:</span>
              <span className="text-emerald-400 font-bold">{totalBetAmount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Potential Payout:</span>
              <span className="text-emerald-400 font-bold">{formatPayout(getPotentialPayout())}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Game Info */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-3">How to Play</h4>
        <div className="text-sm text-slate-400 space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">1.</span>
            <span>Choose your bet amount</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">2.</span>
            <span>Bet on colors (2x) or numbers (5x/9x)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">3.</span>
            <span>Wait for the round result</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">4.</span>
            <span>Win if your bet matches the result</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/10">
          <h5 className="text-sm font-medium text-white mb-2">Payouts</h5>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
            <div>Red/Green: 2x</div>
            <div>Purple: 2x</div>
            <div>0 or 5: 5x</div>
            <div>Other numbers: 9x</div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="border-white/20 text-white min-w-[120px]"
        >
          <BarChart className="h-4 w-4 mr-2" />
          Statistics
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-white/20 text-white min-w-[120px]"
        >
          <Shield className="h-4 w-4 mr-2" />
          Fairness
        </Button>
      </div>
    </div>
  )
}
