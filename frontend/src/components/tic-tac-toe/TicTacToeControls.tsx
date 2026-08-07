'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DollarSign, Play, RotateCcw, Brain, Trophy, Target, Zap, Plus, Minus, Check, X } from 'lucide-react'
import type { Player, Difficulty } from '@/utils/ticTacToeEngine'
import { getDifficultyConfig } from '@/utils/ticTacToeEngine'

interface TicTacToeControlsProps {
  betAmount: number
  userSymbol: Player
  difficulty: Difficulty
  canPlay: boolean
  isPlaying: boolean
  onBetAmountChange: (amount: number) => void
  onUserSymbolChange: (symbol: Player) => void
  onDifficultyChange: (difficulty: Difficulty) => void
  onPlay: () => void
  onReset: () => void
  quickBetAmounts: number[]
  clearBets: () => void
}

export default function TicTacToeControls({
  betAmount,
  userSymbol,
  difficulty,
  canPlay,
  isPlaying,
  onBetAmountChange,
  onUserSymbolChange,
  onDifficultyChange,
  onPlay,
  onReset,
  quickBetAmounts,
  clearBets
}: TicTacToeControlsProps) {
  
  const handleQuickBet = (amount: number) => {
    if (!isPlaying) {
      onBetAmountChange(amount)
    }
  }
  
  const incrementBet = () => {
    if (!isPlaying) {
      onBetAmountChange(Math.min(betAmount + 10, 10000))
    }
  }
  
  const decrementBet = () => {
    if (!isPlaying) {
      onBetAmountChange(Math.max(betAmount - 10, 1))
    }
  }
  
  const getDifficultyInfo = (diff: Difficulty) => {
    return getDifficultyConfig(diff)
  }
  
  const getPlayButtonClasses = () => {
    let classes = 'w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3'
    
    if (!canPlay || isPlaying) {
      classes += ' bg-slate-600 text-slate-400 cursor-not-allowed opacity-50'
    } else {
      classes += ' bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-lg'
    }
    
    return classes
  }
  
  const getSymbolInfo = (symbol: Player) => {
    switch (symbol) {
      case 'X':
        return {
          emoji: 'â',
          color: 'text-red-400',
          bgColor: 'bg-red-600',
          borderColor: 'border-red-400',
          description: 'Cross - AI starts first'
        }
      case 'O':
        return {
          emoji: 'ð',
          color: 'text-emerald-400',
          bgColor: 'bg-emerald-600',
          borderColor: 'border-emerald-400',
          description: 'Circle - You start first'
        }
      default:
        return {
          emoji: '',
          color: 'text-slate-400',
          bgColor: 'bg-slate-600',
          borderColor: 'border-slate-400',
          description: ''
        }
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Game Status */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${canPlay ? 'bg-emerald-400' : 'bg-slate-400'}`}></div>
            <div className="text-sm font-medium text-white">Status:</div>
            <div className="text-sm font-medium text-emerald-400">
              {canPlay ? 'Ready to Play' : 'Game in Progress'}
            </div>
          </div>
          {isPlaying && (
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          )}
        </div>
      </div>
      
      {/* Bet Amount */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Bet Amount</h4>
        
        {/* Quick Bet Amounts */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {quickBetAmounts.map(amount => (
            <button
              key={amount}
              onClick={() => handleQuickBet(amount)}
              disabled={isPlaying}
              className={`py-2 px-4 rounded-lg font-medium transition-all ${
                betAmount === amount 
                  ? 'bg-emerald-600 text-white border-emerald-700' 
                  : 'bg-[#1a2c38] hover:bg-[#2a3c48] text-white border border-white/20'
              } ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {amount}
            </button>
          ))}
        </div>
        
        {/* Custom Amount Input */}
        <div className="flex items-center gap-2">
          <button
            onClick={decrementBet}
            disabled={isPlaying}
            className="p-2 bg-[#1a2c38] hover:bg-[#2a3c48] text-white rounded-lg border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Minus className="h-4 w-4" />
          </button>
          
          <input
            type="number"
            value={betAmount}
            onChange={(e) => !isPlaying && onBetAmountChange(Number(e.target.value))}
            disabled={isPlaying}
            className="flex-1 bg-[#1a2c38] border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 text-center"
            placeholder="Custom amount"
            min={1}
            max={10000}
          />
          
          <button
            onClick={incrementBet}
            disabled={isPlaying}
            className="p-2 bg-[#1a2c38] hover:bg-[#2a3c48] text-white rounded-lg border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        
        {/* Bet Limits */}
        <div className="mt-2 text-xs text-slate-400 text-center">
          Min: 1 | Max: 10,000
        </div>
      </div>
      
      {/* Symbol Selection */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Choose Your Symbol</h4>
        
        <div className="grid grid-cols-2 gap-4">
          {(['X', 'O'] as Player[]).map(symbol => {
            const symbolInfo = getSymbolInfo(symbol)
            const isSelected = userSymbol === symbol
            
            return (
              <button
                key={symbol}
                onClick={() => !isPlaying && onUserSymbolChange(symbol)}
                disabled={isPlaying}
                className={`p-4 rounded-lg border-2 transition-all relative overflow-hidden ${
                  isSelected 
                    ? `${symbolInfo.bgColor} ${symbolInfo.borderColor} text-white` 
                    : 'bg-[#1a2c38] hover:bg-[#2a3c48] text-white border border-white/20'
                } ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="text-4xl">{symbolInfo.emoji}</div>
                  <div className="text-sm font-medium">{symbol === 'X' ? 'Cross' : 'Circle'}</div>
                  <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                    {symbolInfo.description}
                  </div>
                </div>
                
                {isSelected && <Check className="absolute top-2 right-2 h-4 w-4" />}
                
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="grid grid-cols-3 gap-1 p-2">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="bg-white/10 rounded-full w-full aspect-square"></div>
                    ))}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
        
        {/* Symbol Description */}
        <div className="mt-4 p-3 bg-[#1a2c38] rounded-lg border border-white/10">
          <div className="text-sm text-slate-300">
            {getSymbolInfo(userSymbol).description}
          </div>
        </div>
      </div>
      
      {/* Difficulty Selection */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">AI Difficulty</h4>
        
        <div className="grid grid-cols-2 gap-3">
          {(['easy', 'medium', 'hard', 'house'] as Difficulty[]).map(diff => {
            const diffInfo = getDifficultyInfo(diff)
            const isSelected = difficulty === diff
            
            return (
              <button
                key={diff}
                onClick={() => !isPlaying && onDifficultyChange(diff)}
                disabled={isPlaying}
                className={`p-4 rounded-lg border-2 transition-all relative overflow-hidden ${
                  isSelected 
                    ? `${diffInfo.bgColor} ${diffInfo.borderColor} text-white` 
                    : 'bg-[#1a2c38] hover:bg-[#2a3c48] text-white border border-white/20'
                } ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="text-2xl">
                    {diff === 'easy' && <Brain className="h-6 w-6" />}
                    {diff === 'medium' && <Target className="h-6 w-6" />}
                    {diff === 'hard' && <Trophy className="h-6 w-6" />}
                    {diff === 'house' && <Zap className="h-6 w-6" />}
                  </div>
                  <div className="text-sm font-medium">{diffInfo.name}</div>
                  <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                    {diffInfo.winRate}% win rate
                  </div>
                </div>
                
                {isSelected && <Check className="absolute top-2 right-2 h-4 w-4" />}
                
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="grid grid-cols-3 gap-1 p-1">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="bg-white/10 rounded-full w-full aspect-square"></div>
                    ))}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
        
        {/* Difficulty Description */}
        <div className="mt-4 p-3 bg-[#1a2c38] rounded-lg border border-white/10">
          <div className="text-sm text-slate-300">
            {getDifficultyInfo(difficulty).description}
          </div>
        </div>
      </div>
      
      {/* Game Controls */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Game Controls</h4>
        
        <div className="space-y-3">
          <Button
            onClick={onPlay}
            disabled={!canPlay || isPlaying}
            className={getPlayButtonClasses()}
            size="lg"
          >
            {isPlaying ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Playing...</span>
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                <span>Start Game</span>
              </>
            )}
          </Button>
          
          {isPlaying && (
            <Button
              onClick={onReset}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all"
              size="lg"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Game
            </Button>
          )}
        </div>
        
        {/* Game Info */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-400">Current Bet:</div>
            <div className="text-sm font-medium text-white">{betAmount}</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-400">Your Symbol:</div>
            <div className="text-sm font-medium text-white">
              {userSymbol === 'X' ? 'Cross (â)' : 'Circle (ð)'}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-400">Difficulty:</div>
            <div className="text-sm font-medium text-white">{difficulty}</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-400">Potential Win:</div>
            <div className="text-sm font-medium text-emerald-400">{betAmount * 2}</div>
          </div>
        </div>
      </div>
      
      {/* Payout Information */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Payout Information</h4>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Win:</span>
            <span className="text-white font-medium">2x payout (1x profit)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Tie:</span>
            <span className="text-white font-medium">1x return (refund)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Lose:</span>
            <span className="text-white font-medium">Full bet lost</span>
          </div>
        </div>
      </div>
      
      {/* Game Rules */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">How to Play</h4>
        <div className="text-sm text-slate-400 space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">1.</span>
            <span>Select your bet amount and symbol</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">2.</span>
            <span>Choose AI difficulty level</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">3.</span>
            <span>Click "Start Game" to begin</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">4.</span>
            <span>Take turns placing symbols on the board</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">5.</span>
            <span>Get 3 in a row to win!</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">6.</span>
            <span>Higher difficulty = smarter AI</span>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="border-white/20 text-white"
        >
          <Trophy className="h-4 w-4 mr-2" />
          Statistics
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-white/20 text-white"
        >
          <Brain className="h-4 w-4 mr-2" />
          AI Info
        </Button>
      </div>
    </div>
  )
}

// Compact controls for mobile view
export function CompactTicTacToeControls({
  betAmount,
  userSymbol,
  difficulty,
  canPlay,
  isPlaying,
  onBetAmountChange,
  onUserSymbolChange,
  onDifficultyChange,
  onPlay,
  onReset,
  quickBetAmounts,
  clearBets
}: TicTacToeControlsProps) {
  const getDifficultyInfo = (diff: Difficulty) => {
    return getDifficultyConfig(diff)
  }
  
  return (
    <div className="space-y-4">
      {/* Bet Controls */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
        <div className="text-sm font-medium text-white mb-2">Bet Amount</div>
        <div className="grid grid-cols-3 gap-2 mb-2">
          {quickBetAmounts.slice(0, 3).map(amount => (
            <button
              key={amount}
              onClick={() => onBetAmountChange(amount)}
              disabled={isPlaying}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                betAmount === amount 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-[#1a2c38] hover:bg-[#2a3c48] text-white border border-white/20'
              } ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {amount}
            </button>
          ))}
        </div>
        <input
          type="number"
          value={betAmount}
          onChange={(e) => !isPlaying && onBetAmountChange(Number(e.target.value))}
          disabled={isPlaying}
          className="w-full bg-[#1a2c38] border border-white/20 rounded-lg px-3 py-2 text-white text-center disabled:opacity-50"
          min={1}
          max={10000}
        />
      </div>
      
      {/* Symbol Selection */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
        <div className="text-sm font-medium text-white mb-2">Your Symbol</div>
        <div className="grid grid-cols-2 gap-2">
          {(['X', 'O'] as Player[]).map(symbol => {
            const isSelected = userSymbol === symbol
            
            return (
              <button
                key={symbol}
                onClick={() => !isPlaying && onUserSymbolChange(symbol)}
                disabled={isPlaying}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  isSelected 
                    ? (symbol === 'X' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white') 
                    : 'bg-[#1a2c38] hover:bg-[#2a3c48] text-white border border-white/20'
                } ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {symbol === 'X' ? 'â Cross' : 'ð Circle'}
              </button>
            )
          })}
        </div>
      </div>
      
      {/* Difficulty */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
        <div className="text-sm font-medium text-white mb-2">AI Difficulty</div>
        <div className="grid grid-cols-2 gap-2">
          {(['easy', 'medium', 'hard', 'house'] as Difficulty[]).map(diff => {
            const diffInfo = getDifficultyInfo(diff)
            const isSelected = difficulty === diff
            
            return (
              <button
                key={diff}
                onClick={() => !isPlaying && onDifficultyChange(diff)}
                disabled={isPlaying}
                className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                  isSelected 
                    ? `${diffInfo.bgColor} text-white` 
                    : 'bg-[#1a2c38] hover:bg-[#2a3c48] text-white border border-white/20'
                } ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {diffInfo.name}
              </button>
            )
          })}
        </div>
      </div>
      
      {/* Play Button */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
        <Button
          onClick={onPlay}
          disabled={!canPlay || isPlaying}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-bold"
        >
          {isPlaying ? 'Playing...' : 'Start Game'}
        </Button>
      </div>
    </div>
  )
}
