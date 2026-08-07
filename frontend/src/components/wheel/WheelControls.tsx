'use client'

import { Button } from '@/components/ui/button'
import { DollarSign, Target, TrendingUp, PlayCircle, Shield, BarChart, Zap, AlertTriangle } from 'lucide-react'
import { 
  QUICK_BET_AMOUNTS,
  WHEEL_CONFIG,
  formatAmount,
  formatMultiplier,
  DIFFICULTY_INFO,
  type Difficulty
} from '@/utils/wheelConfig'
import { getMaxMultiplierForDifficulty } from '@/utils/wheelMath'

interface WheelControlsProps {
  betAmount: number
  selectedDifficulty: Difficulty
  potentialMaxWin: number
  winProbability: number
  riskScore: {
    score: number
    level: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High'
    description: string
  }
  canSpin: boolean
  isSpinning: boolean
  onBetAmountChange: (amount: number) => void
  onDifficultyChange: (difficulty: Difficulty) => void
  onSpin: () => void
}

export default function WheelControls({
  betAmount,
  selectedDifficulty,
  potentialMaxWin,
  winProbability,
  riskScore,
  canSpin,
  isSpinning,
  onBetAmountChange,
  onDifficultyChange,
  onSpin
}: WheelControlsProps) {
  
  const handleQuickBet = (amount: number) => {
    if (!isSpinning) {
      onBetAmountChange(amount)
    }
  }
  
  const getDifficultyButtonClasses = (difficulty: Difficulty) => {
    const info = DIFFICULTY_INFO[difficulty]
    let classes = 'flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex flex-col items-center justify-center gap-1'
    
    if (selectedDifficulty === difficulty) {
      classes += ` ${info.color.replace('text', 'bg')} bg-opacity-20 ${info.color} ring-2 ring-offset-2 ring-offset-[#0f212e] ring-${info.color.replace('text-', '')} transform scale-105`
    } else {
      classes += ' bg-[#1a2c38] hover:bg-[#2a3c48] text-white border border-white/20'
    }
    
    if (isSpinning) {
      classes += ' opacity-50 cursor-not-allowed'
    }
    
    return classes
  }
  
  const getSpinButtonClasses = () => {
    let classes = 'w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3'
    
    if (!canSpin) {
      classes += ' bg-slate-600 text-slate-400 cursor-not-allowed opacity-50'
    } else {
      const difficultyColor = DIFFICULTY_INFO[selectedDifficulty].color
      classes += ` ${difficultyColor.replace('text', 'bg')} hover:opacity-90 text-white shadow-lg hover:shadow-${difficultyColor.replace('text-', '')}/25`
    }
    
    return classes
  }
  
  const getRiskIndicatorClasses = () => {
    const colors = {
      'Very Low': 'text-emerald-400 bg-emerald-400/20',
      'Low': 'text-green-400 bg-green-400/20',
      'Medium': 'text-yellow-400 bg-yellow-400/20',
      'High': 'text-orange-400 bg-orange-400/20',
      'Very High': 'text-red-400 bg-red-400/20'
    }
    
    return `px-3 py-1 rounded-full text-sm font-medium ${colors[riskScore.level]}`
  }
  
  return (
    <div className="space-y-6">
      {/* Difficulty Selection */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Difficulty Level</h4>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          {(['easy', 'medium', 'hard', 'expert'] as Difficulty[]).map(difficulty => {
            const info = DIFFICULTY_INFO[difficulty]
            return (
              <button
                key={difficulty}
                onClick={() => !isSpinning && onDifficultyChange(difficulty)}
                disabled={isSpinning}
                className={getDifficultyButtonClasses(difficulty)}
              >
                <div className="text-lg font-bold capitalize">{info.name}</div>
                <div className="text-xs opacity-75">
                  {info.maxMultiplier}x max
                </div>
              </button>
            )
          })}
        </div>
        
        {/* Selected Difficulty Info */}
        <div className="p-3 bg-[#1a2c38] rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Selected:</span>
            <span className={`text-sm font-bold ${DIFFICULTY_INFO[selectedDifficulty].color}`}>
              {DIFFICULTY_INFO[selectedDifficulty].name}
            </span>
          </div>
          <div className="text-xs text-slate-400">
            {DIFFICULTY_INFO[selectedDifficulty].description}
          </div>
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
              disabled={isSpinning}
              className={`py-2 px-4 rounded-lg font-medium transition-all ${
                betAmount === amount 
                  ? 'bg-emerald-600 text-white border-emerald-700' 
                  : 'bg-[#1a2c38] hover:bg-[#2a3c48] text-white border border-white/20'
              } ${isSpinning ? 'opacity-50 cursor-not-allowed' : ''}`}
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
            onChange={(e) => !isSpinning && onBetAmountChange(Number(e.target.value))}
            disabled={isSpinning}
            className="flex-1 bg-[#1a2c38] border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
            placeholder="Custom amount"
            min={WHEEL_CONFIG.MIN_BET}
            max={WHEEL_CONFIG.MAX_BET}
          />
          <div className="text-white">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>
        
        {/* Bet Limits */}
        <div className="mt-2 text-xs text-slate-400 text-center">
          Min: {WHEEL_CONFIG.MIN_BET} | Max: {WHEEL_CONFIG.MAX_BET}
        </div>
      </div>
      
      {/* Potential Win */}
      {betAmount > 0 && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Potential Win</h4>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400">
              {formatAmount(potentialMaxWin)}
            </div>
            <div className="text-sm text-slate-400 mt-1">
              Max multiplier: {formatMultiplier(getMaxMultiplierForDifficulty(selectedDifficulty))}x
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
      
      {/* Spin Button */}
      <Button
        onClick={onSpin}
        disabled={!canSpin}
        className={getSpinButtonClasses()}
        size="lg"
      >
        {isSpinning ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Spinning...</span>
          </>
        ) : (
          <>
            <Zap className="h-5 w-5" />
            <span>Spin Wheel</span>
          </>
        )}
      </Button>
      
      {/* Game Info */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-3">How to Play</h4>
        <div className="text-sm text-slate-400 space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">1.</span>
            <span>Choose your difficulty level</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">2.</span>
            <span>Set your bet amount</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">3.</span>
            <span>Click "Spin Wheel" to play</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">4.</span>
            <span>Win if the pointer lands on a multiplier segment</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/10">
          <h5 className="text-sm font-medium text-white mb-2">Wheel Distribution</h5>
          <div className="text-xs text-slate-400 space-y-1">
            <div>50% segments: 0x (lose)</div>
            <div>50% segments: Multipliers (win)</div>
            <div>Higher difficulty = Better multipliers</div>
          </div>
        </div>
      </div>
      
      {/* Segment Preview */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-3">Segment Preview</h4>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-gray-600 rounded">
            <div className="text-white font-bold">0x</div>
            <div className="text-xs text-gray-300">Lose</div>
          </div>
          <div className="text-center p-2 bg-emerald-600 rounded">
            <div className="text-white font-bold">1.5x</div>
            <div className="text-xs text-emerald-200">Low</div>
          </div>
          <div className="text-center p-2 bg-yellow-600 rounded">
            <div className="text-white font-bold">3x</div>
            <div className="text-xs text-yellow-200">Medium</div>
          </div>
          <div className="text-center p-2 bg-orange-600 rounded">
            <div className="text-white font-bold">10x</div>
            <div className="text-xs text-orange-200">High</div>
          </div>
          <div className="text-center p-2 bg-purple-600 rounded">
            <div className="text-white font-bold">25x</div>
            <div className="text-xs text-purple-200">Very High</div>
          </div>
          <div className="text-center p-2 bg-red-600 rounded">
            <div className="text-white font-bold">40x</div>
            <div className="text-xs text-red-200">Expert</div>
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
