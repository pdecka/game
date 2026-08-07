'use client'

import { Button } from '@/components/ui/button'
import { DollarSign, TrendingUp, PlayCircle, Shield, BarChart } from 'lucide-react'
import { 
  COIN_SIDES,
  QUICK_BET_AMOUNTS,
  COIN_CONFIG,
  formatAmount,
  type CoinSide
} from '@/utils/coinConfig'

interface CoinControlsProps {
  selectedSide: CoinSide | null
  betAmount: number
  potentialPayout: number
  canFlip: boolean
  isAnimating: boolean
  onSideSelect: (side: CoinSide) => void
  onBetAmountChange: (amount: number) => void
  onFlip: () => void
}

export default function CoinControls({
  selectedSide,
  betAmount,
  potentialPayout,
  canFlip,
  isAnimating,
  onSideSelect,
  onBetAmountChange,
  onFlip
}: CoinControlsProps) {
  
  const handleQuickBet = (amount: number) => {
    if (!isAnimating) {
      onBetAmountChange(amount)
    }
  }
  
  const getSideButtonClasses = (side: CoinSide) => {
    const config = COIN_SIDES[side]
    let classes = 'flex-1 py-4 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2'
    
    if (selectedSide === side) {
      classes += ` ${config.bgColor} text-white ring-2 ring-offset-2 ring-offset-[#0f212e] ${config.borderColor} transform scale-105`
    } else {
      classes += ` bg-[#1a2c38] hover:bg-[#2a3c48] text-white border border-white/20 ${config.hoverColor}`
    }
    
    if (isAnimating) {
      classes += ' opacity-50 cursor-not-allowed'
    }
    
    return classes
  }
  
  const getFlipButtonClasses = () => {
    let classes = 'w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3'
    
    if (!canFlip) {
      classes += ' bg-slate-600 text-slate-400 cursor-not-allowed opacity-50'
    } else {
      classes += ' bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-emerald-600/25'
    }
    
    return classes
  }
  
  return (
    <div className="space-y-6">
      {/* Side Selection */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Choose Your Side</h4>
        <div className="grid grid-cols-2 gap-4">
          {(['heads', 'tails'] as CoinSide[]).map((side) => {
            const config = COIN_SIDES[side]
            return (
              <button
                key={side}
                onClick={() => !isAnimating && onSideSelect(side)}
                disabled={isAnimating}
                className={getSideButtonClasses(side)}
              >
                <div className="text-3xl">{config.emoji}</div>
                <div className="text-lg font-bold">{config.name}</div>
                <div className="text-sm opacity-90">2x payout</div>
              </button>
            )
          })}
        </div>
        
        <div className="mt-4 text-center text-sm text-slate-400">
          {selectedSide ? (
            <span className="text-emerald-400">Selected: {selectedSide}</span>
          ) : (
            <span>Select a side to continue</span>
          )}
        </div>
      </div>
      
      {/* Bet Amount */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Bet Amount</h4>
        
        {/* Quick Bet Amounts */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {QUICK_BET_AMOUNTS.map(amount => (
            <button
              key={amount}
              onClick={() => handleQuickBet(amount)}
              disabled={isAnimating}
              className={`py-2 px-4 rounded-lg font-medium transition-all ${
                betAmount === amount 
                  ? 'bg-emerald-600 text-white border-emerald-700' 
                  : 'bg-[#1a2c38] hover:bg-[#2a3c48] text-white border border-white/20'
              } ${isAnimating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {amount}
            </button>
          ))}
        </div>
        
        {/* Custom Amount Input */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={betAmount}
            onChange={(e) => !isAnimating && onBetAmountChange(Number(e.target.value))}
            disabled={isAnimating}
            className="flex-1 bg-[#1a2c38] border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
            placeholder="Custom amount"
            min={COIN_CONFIG.MIN_BET}
            max={COIN_CONFIG.MAX_BET}
          />
          <div className="text-white">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>
        
        {/* Bet Limits */}
        <div className="mt-2 text-xs text-slate-400 text-center">
          Min: {COIN_CONFIG.MIN_BET} | Max: {COIN_CONFIG.MAX_BET}
        </div>
      </div>
      
      {/* Potential Payout */}
      {selectedSide && betAmount > 0 && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Potential Payout</h4>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400">
              {formatAmount(potentialPayout)}
            </div>
            <div className="text-sm text-slate-400 mt-1">
              If you win (2x multiplier)
            </div>
          </div>
        </div>
      )}
      
      {/* Flip Button */}
      <Button
        onClick={onFlip}
        disabled={!canFlip}
        className={getFlipButtonClasses()}
        size="lg"
      >
        {isAnimating ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Flipping...</span>
          </>
        ) : (
          <>
            <PlayCircle className="h-5 w-5" />
            <span>Flip Coin</span>
          </>
        )}
      </Button>
      
      {/* Game Info */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-3">How to Play</h4>
        <div className="text-sm text-slate-400 space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">1.</span>
            <span>Choose Heads or Tails</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">2.</span>
            <span>Set your bet amount</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">3.</span>
            <span>Click "Flip Coin" to play</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">4.</span>
            <span>Win 2x your bet if you guess correctly</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/10">
          <h5 className="text-sm font-medium text-white mb-2">Game Rules</h5>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
            <div>Win Probability: 50%</div>
            <div>Payout: 2x</div>
            <div>House Edge: 0%</div>
            <div>Fair: Provably Fair</div>
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
