'use client'

import { Button } from '@/components/ui/button'
import { DollarSign, TrendingUp, PlayCircle, X, Shield, BarChart } from 'lucide-react'
import { 
  getDifficultyConfig, 
  getDifficultyDisplayName, 
  getDifficultyColor,
  formatMultiplier,
  formatPayout,
  type Difficulty 
} from '@/utils/towerConfig'

interface TowerControlsProps {
  gameState: 'idle' | 'playing' | 'step_won' | 'lost' | 'cashed_out'
  currentStep: number
  maxSteps: number
  currentMultiplier: number
  potentialPayout: number
  betAmount: number
  difficulty: Difficulty
  canPlay: boolean
  canCashout: boolean
  onBetAmountChange: (amount: number) => void
  onDifficultyChange: (diff: Difficulty) => void
  onStartGame: () => void
  onCashout: () => void
}

export default function TowerControls({
  gameState,
  currentStep,
  maxSteps,
  currentMultiplier,
  potentialPayout,
  betAmount,
  difficulty,
  canPlay,
  canCashout,
  onBetAmountChange,
  onDifficultyChange,
  onStartGame,
  onCashout
}: TowerControlsProps) {
  const quickBetAmounts = [10, 25, 50, 100, 250, 500]
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert']
  
  const config = getDifficultyConfig(difficulty)
  
  const getGameStateColor = () => {
    switch (gameState) {
      case 'idle': return 'text-slate-400'
      case 'playing': return 'text-emerald-400'
      case 'step_won': return 'text-blue-400'
      case 'lost': return 'text-red-400'
      case 'cashed_out': return 'text-yellow-400'
      default: return 'text-white'
    }
  }
  
  const getGameStateText = () => {
    switch (gameState) {
      case 'idle': return 'Ready to Play'
      case 'playing': return 'Climbing Tower'
      case 'step_won': return 'Safe Step!'
      case 'lost': return 'Game Over'
      case 'cashed_out': return 'Cashed Out'
      default: return 'Unknown'
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Game Status */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Dragon Tower</h3>
            <div className={`text-sm font-medium ${getGameStateColor()}`}>
              {getGameStateText()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-400">
              {formatMultiplier(currentMultiplier)}x
            </div>
            <div className="text-xs text-slate-400">Multiplier</div>
          </div>
        </div>
        
        {/* Progress */}
        <div className="w-full bg-[#1a2c38] rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              gameState === 'lost' ? 'bg-red-500' :
              gameState === 'cashed_out' ? 'bg-emerald-500' :
              'bg-blue-500'
            }`}
            style={{ width: `${(currentStep / maxSteps) * 100}%` }}
          ></div>
        </div>
        
        <div className="mt-2 text-center text-sm text-slate-400">
          Level {currentStep} / {maxSteps}
        </div>
      </div>
      
      {/* Difficulty Selection */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Difficulty</h4>
        <div className="grid grid-cols-2 gap-2">
          {difficulties.map((diff) => (
            <button
              key={diff}
              onClick={() => onDifficultyChange(diff)}
              disabled={!canPlay}
              className={`py-3 px-4 rounded-lg font-medium transition-all ${
                difficulty === diff 
                  ? 'ring-2 ring-emerald-500 transform scale-105' 
                  : ''
              } ${getDifficultyColor(diff)} ${
                !canPlay ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="font-bold">{getDifficultyDisplayName(diff)}</div>
              <div className="text-xs opacity-90">
                {config.eggs}ð¥ {config.monsters}ð¹
              </div>
              <div className="text-xs opacity-90">
                Max: {formatMultiplier(config.maxMultiplier)}x
              </div>
            </button>
          ))}
        </div>
        
        {/* Difficulty Stats */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-slate-400">Win Chance</div>
              <div className="text-white font-medium">
                {((config.eggs / config.columns) * 100).toFixed(0)}%
              </div>
            </div>
            <div>
              <div className="text-slate-400">Risk Level</div>
              <div className="text-white font-medium capitalize">
                {difficulty === 'easy' ? 'Low' :
                 difficulty === 'medium' ? 'Medium' :
                 difficulty === 'hard' ? 'High' : 'Very High'}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bet Amount Selection */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Bet Amount</h4>
        
        <div className="grid grid-cols-3 gap-2 mb-4">
          {quickBetAmounts.map(amount => (
            <button
              key={amount}
              onClick={() => onBetAmountChange(amount)}
              disabled={!canPlay}
              className={`py-2 px-4 rounded-lg font-medium transition-all ${
                betAmount === amount 
                  ? 'bg-emerald-600 text-white border-emerald-700' 
                  : 'bg-[#1a2c38] hover:bg-[#2a3c48] text-white border-white/20'
              } ${!canPlay ? 'opacity-50 cursor-not-allowed' : ''}`}
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
            disabled={!canPlay}
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
      
      {/* Current Game Info */}
      {(gameState === 'playing' || gameState === 'step_won') && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Current Game</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Bet Amount</span>
              <span className="text-white font-medium">{betAmount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Current Multiplier</span>
              <span className="text-emerald-400 font-medium">{formatMultiplier(currentMultiplier)}x</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Potential Payout</span>
              <span className="text-emerald-400 font-bold text-lg">{formatPayout(potentialPayout)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Profit</span>
              <span className={`font-medium ${
                potentialPayout > betAmount ? 'text-emerald-400' : 'text-slate-400'
              }`}>
                {formatPayout(potentialPayout - betAmount)}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="space-y-3">
        {canPlay && (
          <Button
            onClick={onStartGame}
            disabled={betAmount <= 0}
            className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg py-4"
            size="lg"
          >
            <PlayCircle className="h-5 w-5 mr-2" />
            Start Game
          </Button>
        )}
        
        {canCashout && (
          <Button
            onClick={onCashout}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold text-lg py-4"
            size="lg"
          >
            <DollarSign className="h-5 w-5 mr-2" />
            Cashout {formatPayout(potentialPayout)}
          </Button>
        )}
        
        {gameState === 'lost' && (
          <div className="text-center p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <div className="text-red-400 font-medium">You lost {betAmount}</div>
          </div>
        )}
        
        {gameState === 'cashed_out' && (
          <div className="text-center p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-lg">
            <div className="text-emerald-400 font-medium">
              You won {formatPayout(potentialPayout)}!
            </div>
          </div>
        )}
      </div>
      
      {/* Game Info */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-3">How to Play</h4>
        <div className="text-sm text-slate-400 space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">1.</span>
            <span>Choose difficulty and bet amount</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">2.</span>
            <span>Click Start to begin climbing</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">3.</span>
            <span>Select one tile per level</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">4.</span>
            <span>Egg (ð¥) = Safe, Monster (ð¹) = Lose</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">5.</span>
            <span>Cashout anytime before hitting a monster</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/10">
          <h5 className="text-sm font-medium text-white mb-2">Tips</h5>
          <div className="text-xs text-slate-400 space-y-1">
            <div>â Higher difficulty = Higher rewards</div>
            <div>â Cashout early to secure winnings</div>
            <div>â Each level increases the multiplier</div>
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
