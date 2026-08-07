'use client'

import { Button } from '@/components/ui/button'
import { DollarSign, Target, TrendingUp, PlayCircle, Shield, BarChart, Zap, AlertTriangle } from 'lucide-react'
import { 
  QUICK_BET_AMOUNTS,
  DICE_CONFIG,
  formatAmount,
  formatMultiplierForDisplay,
  getRiskLevel,
  getRiskColor,
  getRiskBgColor,
  type RollType
} from '@/utils/diceConfig'
import { 
  getRollTypeColor,
  getRollTypeBgColor,
  getRollTypeEmoji
} from '@/utils/diceMath'

interface DiceControlsProps {
  betAmount: number
  target: number
  rollType: RollType
  multiplier: number
  potentialPayout: number
  winProbability: number
  riskScore: {
    score: number
    level: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High'
    description: string
  }
  canRoll: boolean
  isRolling: boolean
  onBetAmountChange: (amount: number) => void
  onTargetChange: (target: number) => void
  onRollTypeChange: (rollType: RollType) => void
  onRoll: () => void
}

export default function DiceControls({
  betAmount,
  target,
  rollType,
  multiplier,
  potentialPayout,
  winProbability,
  riskScore,
  canRoll,
  isRolling,
  onBetAmountChange,
  onTargetChange,
  onRollTypeChange,
  onRoll
}: DiceControlsProps) {
  
  const handleQuickBet = (amount: number) => {
    if (!isRolling) {
      onBetAmountChange(amount)
    }
  }
  
  const handleQuickTarget = (targetValue: number) => {
    if (!isRolling) {
      onTargetChange(targetValue)
    }
  }
  
  const getRollTypeButtonClasses = (type: RollType) => {
    let classes = 'flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2'
    
    if (rollType === type) {
      classes += ` ${getRollTypeBgColor(type)} text-white ring-2 ring-offset-2 ring-offset-[#0f212e] ring-${getRollTypeColor(type).replace('text-', '')} transform scale-105`
    } else {
      classes += ' bg-[#1a2c38] hover:bg-[#2a3c48] text-white border border-white/20'
    }
    
    if (isRolling) {
      classes += ' opacity-50 cursor-not-allowed'
    }
    
    return classes
  }
  
  const getRollButtonClasses = () => {
    let classes = 'w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3'
    
    if (!canRoll) {
      classes += ' bg-slate-600 text-slate-400 cursor-not-allowed opacity-50'
    } else {
      classes += ' bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-emerald-600/25'
    }
    
    return classes
  }
  
  const getRiskIndicatorClasses = () => {
    return `px-3 py-1 rounded-full text-sm font-medium ${getRiskBgColor(riskScore.level)} ${getRiskColor(riskScore.level)}`
  }
  
  return (
    <div className="space-y-6">
      {/* Roll Type Selection */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Roll Type</h4>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          {(['over', 'under'] as RollType[]).map(type => (
            <button
              key={type}
              onClick={() => !isRolling && onRollTypeChange(type)}
              disabled={isRolling}
              className={getRollTypeButtonClasses(type)}
            >
              <span className="text-lg">{getRollTypeEmoji(type)}</span>
              <span className="capitalize">{type}</span>
            </button>
          ))}
        </div>
        
        {/* Roll Type Info */}
        <div className="p-3 bg-[#1a2c38] rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Selected:</span>
            <span className={`text-sm font-bold ${getRollTypeColor(rollType)}`}>
              {getRollTypeEmoji(rollType)} {rollType.charAt(0).toUpperCase() + rollType.slice(1)}
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {rollType === 'over' 
              ? `Win if roll > ${target}` 
              : `Win if roll < ${target}`
            }
          </div>
        </div>
      </div>
      
      {/* Target Selection */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Target Value</h4>
        
        {/* Quick Target Buttons */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[25, 50, 75].map(targetValue => (
            <button
              key={targetValue}
              onClick={() => handleQuickTarget(targetValue)}
              disabled={isRolling}
              className={`py-2 px-4 rounded-lg font-medium transition-all ${
                target === targetValue 
                  ? 'bg-emerald-600 text-white border-emerald-700' 
                  : 'bg-[#1a2c38] hover:bg-[#2a3c48] text-white border border-white/20'
              } ${isRolling ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {targetValue}
            </button>
          ))}
        </div>
        
        {/* Custom Target Input */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={target}
            onChange={(e) => !isRolling && onTargetChange(Number(e.target.value))}
            disabled={isRolling}
            className="flex-1 bg-[#1a2c38] border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
            placeholder="Custom target"
            min={DICE_CONFIG.MIN_TARGET}
            max={DICE_CONFIG.MAX_TARGET}
          />
          <div className="text-white">
            <Target className="h-5 w-5" />
          </div>
        </div>
        
        {/* Target Limits */}
        <div className="mt-2 text-xs text-slate-400 text-center">
          Min: {DICE_CONFIG.MIN_TARGET} | Max: {DICE_CONFIG.MAX_TARGET}
        </div>
        
        {/* Risk Indicator */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-400" />
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
              disabled={isRolling}
              className={`py-2 px-4 rounded-lg font-medium transition-all ${
                betAmount === amount 
                  ? 'bg-emerald-600 text-white border-emerald-700' 
                  : 'bg-[#1a2c38] hover:bg-[#2a3c48] text-white border border-white/20'
              } ${isRolling ? 'opacity-50 cursor-not-allowed' : ''}`}
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
            onChange={(e) => !isRolling && onBetAmountChange(Number(e.target.value))}
            disabled={isRolling}
            className="flex-1 bg-[#1a2c38] border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
            placeholder="Custom amount"
            min={DICE_CONFIG.MIN_BET}
            max={DICE_CONFIG.MAX_BET}
          />
          <div className="text-white">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>
        
        {/* Bet Limits */}
        <div className="mt-2 text-xs text-slate-400 text-center">
          Min: {DICE_CONFIG.MIN_BET} | Max: {DICE_CONFIG.MAX_BET}
        </div>
      </div>
      
      {/* Potential Win */}
      {betAmount > 0 && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Potential Win</h4>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400">
              {formatAmount(potentialPayout)}
            </div>
            <div className="text-sm text-slate-400 mt-1">
              At {formatMultiplierForDisplay(multiplier)} multiplier
            </div>
          </div>
          
          {/* Win Probability */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Win Probability:</span>
              <span className="text-white font-medium">{(winProbability * 100).toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-slate-400">Risk Description:</span>
              <span className="text-white text-xs">{riskScore.description}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Roll Button */}
      <Button
        onClick={onRoll}
        disabled={!canRoll}
        className={getRollButtonClasses()}
        size="lg"
      >
        {isRolling ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Rolling...</span>
          </>
        ) : (
          <>
            <Zap className="h-5 w-5" />
            <span>Roll Dice</span>
          </>
        )}
      </Button>
      
      {/* Game Info */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-3">How to Play</h4>
        <div className="text-sm text-slate-400 space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">1.</span>
            <span>Choose roll type (Over or Under)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">2.</span>
            <span>Set your target value</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">3.</span>
            <span>Place your bet amount</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">4.</span>
            <span>Click "Roll Dice" to play</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/10">
          <h5 className="text-sm font-medium text-white mb-2">Game Rules</h5>
          <div className="text-xs text-slate-400 space-y-1">
            <div>Range: 0 - 100</div>
            <div>House Edge: 2%</div>
            <div>Precision: 2 decimal places</div>
            <div>Fair: Provably Fair</div>
          </div>
        </div>
      </div>
      
      {/* Multiplier Info */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-3">Multiplier Formula</h4>
        <div className="text-sm text-slate-400 space-y-2">
          <div className="font-mono bg-[#1a2c38] p-2 rounded">
            multiplier = (100 / winChance) × (1 - houseEdge)
          </div>
          <div className="text-xs">
            Lower win chance = Higher multiplier
          </div>
          <div className="text-xs">
            Higher win chance = Lower multiplier
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
