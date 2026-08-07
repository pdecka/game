'use client'

import { Button } from '@/components/ui/button'
import { DollarSign, Target, TrendingUp, PlayCircle, Shield, BarChart, Info } from 'lucide-react'
import { 
  QUICK_MULTIPLIERS,
  QUICK_BET_AMOUNTS,
  LIMBO_CONFIG,
  formatAmount,
  formatMultiplier,
  getRiskLevel,
  getRiskColor,
  type GameState
} from '@/utils/limboConfig'

interface LimboControlsProps {
  betAmount: number
  targetMultiplier: number
  potentialPayout: number
  winProbability: number
  riskScore: {
    score: number
    level: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High'
    description: string
  }
  canBet: boolean
  isAnimating: boolean
  onBetAmountChange: (amount: number) => void
  onTargetMultiplierChange: (multiplier: number) => void
  onBet: () => void
}

export default function LimboControls({
  betAmount,
  targetMultiplier,
  potentialPayout,
  winProbability,
  riskScore,
  canBet,
  isAnimating,
  onBetAmountChange,
  onTargetMultiplierChange,
  onBet
}: LimboControlsProps) {
  
  const handleQuickBet = (amount: number) => {
    if (!isAnimating) {
      onBetAmountChange(amount)
    }
  }
  
  const handleQuickMultiplier = (multiplier: number) => {
    if (!isAnimating) {
      onTargetMultiplierChange(multiplier)
    }
  }
  
  const getMultiplierButtonClasses = (multiplier: number) => {
    let classes = 'flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex flex-col items-center justify-center gap-1'
    
    if (targetMultiplier === multiplier) {
      classes += ' bg-blue-600 text-white ring-2 ring-offset-2 ring-offset-[#0f212e] ring-blue-600 transform scale-105'
    } else {
      classes += ' bg-[#1a2c38] hover:bg-[#2a3c48] text-white border border-white/20'
    }
    
    if (isAnimating) {
      classes += ' opacity-50 cursor-not-allowed'
    }
    
    return classes
  }
  
  const getBetButtonClasses = () => {
    let classes = 'w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3'
    
    if (!canBet) {
      classes += ' bg-slate-600 text-slate-400 cursor-not-allowed opacity-50'
    } else {
      classes += ' bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-emerald-600/25'
    }
    
    return classes
  }
  
  const getRiskIndicatorClasses = () => {
    const riskLevel = getRiskLevel(targetMultiplier)
    return `px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(riskLevel)} bg-opacity-20 ${getRiskColor(riskLevel).replace('text', 'bg')}`
  }
  
  return (
    <div className="space-y-6">
      {/* Target Multiplier Selection */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Target Multiplier</h4>
        
        {/* Quick Multiplier Buttons */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {QUICK_MULTIPLIERS.map(multiplier => (
            <button
              key={multiplier}
              onClick={() => handleQuickMultiplier(multiplier)}
              disabled={isAnimating}
              className={getMultiplierButtonClasses(multiplier)}
            >
              <div className="text-lg font-bold">{formatMultiplier(multiplier)}x</div>
              <div className="text-xs opacity-75">
                {((1 / multiplier) * 100).toFixed(1)}% win
              </div>
            </button>
          ))}
        </div>
        
        {/* Custom Multiplier Input */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={targetMultiplier}
            onChange={(e) => !isAnimating && onTargetMultiplierChange(Number(e.target.value))}
            disabled={isAnimating}
            className="flex-1 bg-[#1a2c38] border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            placeholder="Custom multiplier"
            min={LIMBO_CONFIG.MIN_MULTIPLIER}
            max={LIMBO_CONFIG.MAX_MULTIPLIER}
            step="0.01"
          />
          <div className="text-white">
            <Target className="h-5 w-5" />
          </div>
        </div>
        
        {/* Multiplier Limits */}
        <div className="mt-2 text-xs text-slate-400 text-center">
          Min: {LIMBO_CONFIG.MIN_MULTIPLIER}x | Max: {LIMBO_CONFIG.MAX_MULTIPLIER}x
        </div>
        
        {/* Risk Indicator */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Risk Level:</span>
            <div className={getRiskIndicatorClasses()}>
              {riskScore.level}
            </div>
          </div>
          <div className="text-xs text-slate-400">
            Score: {riskScore.score}/100
          </div>
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
            min={LIMBO_CONFIG.MIN_BET}
            max={LIMBO_CONFIG.MAX_BET}
          />
          <div className="text-white">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>
        
        {/* Bet Limits */}
        <div className="mt-2 text-xs text-slate-400 text-center">
          Min: {LIMBO_CONFIG.MIN_BET} | Max: {LIMBO_CONFIG.MAX_BET}
        </div>
      </div>
      
      {/* Potential Payout */}
      {betAmount > 0 && targetMultiplier >= LIMBO_CONFIG.MIN_MULTIPLIER && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Potential Payout</h4>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400">
              {formatAmount(potentialPayout)}
            </div>
            <div className="text-sm text-slate-400 mt-1">
              If you win at {formatMultiplier(targetMultiplier)}x
            </div>
          </div>
          
          {/* Win Probability */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Win Probability:</span>
              <span className="text-white font-medium">{(winProbability * 100).toFixed(2)}%</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-slate-400">Risk Description:</span>
              <span className="text-white text-xs">{riskScore.description}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Bet Button */}
      <Button
        onClick={onBet}
        disabled={!canBet}
        className={getBetButtonClasses()}
        size="lg"
      >
        {isAnimating ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Flying...</span>
          </>
        ) : (
          <>
            <PlayCircle className="h-5 w-5" />
            <span>Bet</span>
          </>
        )}
      </Button>
      
      {/* Game Info */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-3">How to Play</h4>
        <div className="text-sm text-slate-400 space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">1.</span>
            <span>Set your target multiplier</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">2.</span>
            <span>Choose your bet amount</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">3.</span>
            <span>Click "Bet" to start the flight</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">4.</span>
            <span>Win if result multiplier reaches your target</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/10">
          <h5 className="text-sm font-medium text-white mb-2">Game Rules</h5>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
            <div>Min Multiplier: 1.01x</div>
            <div>Max Multiplier: 1,000,000x</div>
            <div>House Edge: 1%</div>
            <div>Fair: Provably Fair</div>
          </div>
        </div>
      </div>
      
      {/* Risk Analysis */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Info className="h-4 w-4" />
          Risk Analysis
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Risk Level:</span>
            <span className={`text-sm font-medium ${getRiskColor(getRiskLevel(targetMultiplier))}`}>
              {riskScore.level}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Win Chance:</span>
            <span className="text-sm font-medium text-white">
              {(winProbability * 100).toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Expected Value:</span>
            <span className="text-sm font-medium text-white">
              {((winProbability * targetMultiplier) - (1 - winProbability)).toFixed(3)}
            </span>
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
