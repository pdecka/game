'use client'

import { Button } from '@/components/ui/button'
import { DollarSign, PlayCircle, Info, BarChart, Shield, TrendingUp, Zap } from 'lucide-react'
import type { Difficulty } from '@/utils/kenoPayout'
import {
  QUICK_BET_AMOUNTS,
  KENO_CONFIG,
  formatAmount,
  validateBet,
  getDifficultyInfo,
  getAllDifficulties,
  getWinProbability,
  getExpectedValue,
  getPayoutMultiplier
} from '@/utils/kenoPayout'

interface KenoControlsProps {
  betAmount: number
  difficulty: Difficulty
  selectedCount: number
  canStartGame: boolean
  isGameActive: boolean
  onBetAmountChange: (amount: number) => void
  onDifficultyChange: (difficulty: Difficulty) => void
  onQuickPick: () => void
  onClearSelections: () => void
  onStartGame: () => void
}

export default function KenoControls({
  betAmount,
  difficulty,
  selectedCount,
  canStartGame,
  isGameActive,
  onBetAmountChange,
  onDifficultyChange,
  onQuickPick,
  onClearSelections,
  onStartGame
}: KenoControlsProps) {
  
  const handleQuickBet = (amount: number) => {
    if (!isGameActive) {
      onBetAmountChange(amount)
    }
  }
  
  const getDifficultyButtonClasses = (diff: Difficulty) => {
    const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 border'
    
    if (diff === difficulty) {
      const config = getDifficultyInfo(diff)
      return `${baseClasses} ${config.bgColor} ${config.color} border-current`
    }
    
    return `${baseClasses} bg-[#1a2c38] text-white border-white/20 hover:bg-[#2a3c48]`
  }
  
  const getPlayButtonClasses = () => {
    let classes = 'w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3'
    
    if (!canStartGame || isGameActive) {
      classes += ' bg-slate-600 text-slate-400 cursor-not-allowed opacity-50'
    } else {
      const config = getDifficultyInfo(difficulty)
      classes += ` ${config.bgColor.replace('/20', '/600')} text-white shadow-lg hover:shadow-lg`
    }
    
    return classes
  }
  
  const getBetValidation = () => {
    return validateBet(betAmount, Array.from({ length: selectedCount }, (_, i) => i + 1))
  }
  
  const validation = getBetValidation()
  const difficultyConfig = getDifficultyInfo(difficulty)
  const winProbability = getWinProbability(difficulty, selectedCount)
  const expectedValue = getExpectedValue(difficulty, selectedCount)
  const potentialMultiplier = getPayoutMultiplier(4, difficulty) // Minimum hits to win
  
  return (
    <div className="space-y-6">
      {/* Bet Amount */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Bet Amount</h4>
        
        {/* Quick Bet Amounts */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {QUICK_BET_AMOUNTS.map(amount => (
            <button
              key={amount}
              onClick={() => handleQuickBet(amount)}
              disabled={isGameActive}
              className={`py-2 px-4 rounded-lg font-medium transition-all ${
                betAmount === amount 
                  ? 'bg-emerald-600 text-white border-emerald-700' 
                  : 'bg-[#1a2c38] hover:bg-[#2a3c48] text-white border border-white/20'
              } ${isGameActive ? 'opacity-50 cursor-not-allowed' : ''}`}
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
            onChange={(e) => !isGameActive && onBetAmountChange(Number(e.target.value))}
            disabled={isGameActive}
            className="flex-1 bg-[#1a2c38] border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
            placeholder="Custom amount"
            min={KENO_CONFIG.minBet}
            max={KENO_CONFIG.maxBet}
          />
          <div className="text-white">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>
        
        {/* Bet Limits */}
        <div className="mt-2 text-xs text-slate-400 text-center">
          Min: {KENO_CONFIG.minBet} | Max: {KENO_CONFIG.maxBet}
        </div>
        
        {/* Validation Error */}
        {!validation.isValid && (
          <div className="mt-2 text-xs text-red-400 text-center">
            {validation.error}
          </div>
        )}
      </div>
      
      {/* Difficulty Selection */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Difficulty Level</h4>
        
        <div className="space-y-3">
          {getAllDifficulties().map(diff => {
            const config = getDifficultyInfo(diff)
            const prob = getWinProbability(diff, selectedCount)
            const ev = getExpectedValue(diff, selectedCount)
            
            return (
              <button
                key={diff}
                onClick={() => !isGameActive && onDifficultyChange(diff)}
                disabled={isGameActive}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  diff === difficulty 
                    ? `${config.bgColor} ${config.color} border-current` 
                    : 'bg-[#1a2c38] border-white/20 hover:bg-[#2a3c48]'
                } ${isGameActive ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold capitalize">{config.name}</span>
                  {diff === difficulty && (
                    <div className="w-2 h-2 bg-current rounded-full"></div>
                  )}
                </div>
                <p className="text-xs opacity-80 mb-2">{config.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span>Win Rate: {(prob * 100).toFixed(1)}%</span>
                  <span>RTP: {(ev * 100).toFixed(1)}%</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
      
      {/* Selection Info */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Selections</h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Numbers Selected:</span>
            <span className="text-white font-medium">{selectedCount} / {KENO_CONFIG.maxSelections}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Minimum to Win:</span>
            <span className="text-white font-medium">{4} matches</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Win Probability:</span>
            <span className="text-white font-medium">{(winProbability * 100).toFixed(1)}%</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Expected Return:</span>
            <span className="text-white font-medium">{(expectedValue * 100).toFixed(1)}%</span>
          </div>
        </div>
        
        {/* Selection Actions */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={onQuickPick}
            disabled={isGameActive}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Zap className="h-4 w-4" />
            Quick Pick
          </button>
          <button
            onClick={onClearSelections}
            disabled={isGameActive}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-all duration-200"
          >
            Clear All
          </button>
        </div>
      </div>
      
      {/* Payout Table */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Payout Table ({difficultyConfig.name})</h4>
        
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-4 text-xs text-slate-400 mb-2">
            <span>Matches</span>
            <span>Multiplier</span>
          </div>
          
          {Object.entries(difficultyConfig.payoutTable).map(([matches, multiplier]) => (
            <div key={matches} className="grid grid-cols-2 gap-4">
              <span className="text-white">{matches}</span>
              <span className={`${difficultyConfig.color} font-medium`}>{multiplier}x</span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="text-xs text-slate-400">
            <div className="flex items-center justify-between mb-1">
              <span>House Edge:</span>
              <span>{(difficultyConfig.houseEdge * 100).toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Min Payout:</span>
              <span>{Math.min(...Object.values(difficultyConfig.payoutTable))}x</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Max Payout:</span>
              <span>{Math.max(...Object.values(difficultyConfig.payoutTable))}x</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Game Info */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">How to Play</h4>
        <div className="text-sm text-slate-400 space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">1.</span>
            <span>Select up to 10 numbers from 1-40</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">2.</span>
            <span>Choose your difficulty level</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">3.</span>
            <span>Set your bet amount</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">4.</span>
            <span>Click "Start Game" to draw 10 numbers</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">5.</span>
            <span>Match 4+ numbers to win!</span>
          </div>
        </div>
      </div>
      
      {/* Potential Winnings */}
      {betAmount > 0 && validation.isValid && selectedCount > 0 && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Potential Winnings</h4>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400">
              {formatAmount(betAmount * potentialMultiplier)}
            </div>
            <div className="text-sm text-slate-400 mt-1">
              If you get 4 matches ({potentialMultiplier}x multiplier)
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-slate-400">Risk Level:</div>
                <div className="text-white font-medium capitalize">{difficulty}</div>
              </div>
              <div>
                <div className="text-slate-400">Win Chance:</div>
                <div className="text-white font-medium">{(winProbability * 100).toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Play Button */}
      <Button
        onClick={onStartGame}
        disabled={!canStartGame || isGameActive || !validation.isValid}
        className={getPlayButtonClasses()}
        size="lg"
      >
        {isGameActive ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Game in Progress...</span>
          </>
        ) : (
          <>
            <PlayCircle className="h-5 w-5" />
            <span>Start Game</span>
          </>
        )}
      </Button>
      
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
      
      {/* Game Status */}
      {isGameActive && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-emerald-400">Game Active</span>
            </div>
            <div className="text-sm text-slate-400">
              Current Bet: {formatAmount(betAmount)}
            </div>
          </div>
        </div>
      )}
      
      {/* Tips */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-3">
          <Info className="h-4 w-4 inline mr-2" />
          Tips & Strategy
        </h4>
        <div className="text-sm text-slate-400 space-y-2">
          <div>â Select 4-10 numbers for best odds</div>
          <div>â Higher difficulty = bigger payouts</div>
          <div>â Easy mode has higher win rates</div>
          <div>â Expert mode can pay up to 1200x</div>
          <div>â Expected return varies by difficulty</div>
          <div>â Quick Pick for random selection</div>
        </div>
      </div>
    </div>
  )
}
