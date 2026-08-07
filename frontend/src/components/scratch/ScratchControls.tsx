'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DollarSign, PlayCircle, Info, BarChart, Shield, TrendingUp, Zap, Plus, Minus, Check, X, Sparkles, Crown } from 'lucide-react'
import type { Volatility, CardType } from '@/utils/scratchEngine'
import { getVolatilityConfig, getCardTypeConfig } from '@/utils/scratchEngine'
import { GAME_PRESETS } from '@/utils/scratchConfig'

interface ScratchControlsProps {
  betAmount: number
  volatility: Volatility
  cardType: CardType
  canPlay: boolean
  isScratching: boolean
  gameState: string
  onBetAmountChange: (amount: number) => void
  onVolatilityChange: (volatility: Volatility) => void
  onCardTypeChange: (cardType: CardType) => void
  onPlay: () => void
  onQuickBet: (amount: number) => void
  quickBetAmounts: number[]
  clearBets: () => void
}

export default function ScratchControls({
  betAmount,
  volatility,
  cardType,
  canPlay,
  isScratching,
  gameState,
  onBetAmountChange,
  onVolatilityChange,
  onCardTypeChange,
  onPlay,
  onQuickBet,
  quickBetAmounts,
  clearBets
}: ScratchControlsProps) {
  
  const handleQuickBet = (amount: number) => {
    if (!isScratching) {
      onQuickBet(amount)
    }
  }
  
  const incrementBet = () => {
    if (!isScratching) {
      onBetAmountChange(Math.min(betAmount + 10, 10000))
    }
  }
  
  const decrementBet = () => {
    if (!isScratching) {
      onBetAmountChange(Math.max(betAmount - 10, 1))
    }
  }
  
  const getGameStateText = () => {
    switch (gameState) {
      case 'idle': return 'Ready to Play'
      case 'generated': return 'Card Generated - Start Scratching!'
      case 'scratching': return 'Scratching in Progress...'
      case 'revealed': return 'Revealing...'
      case 'result': return 'Game Complete'
      default: return 'Ready to Play'
    }
  }
  
  const getGameStateColor = () => {
    switch (gameState) {
      case 'idle': return 'text-blue-400'
      case 'generated': return 'text-orange-400'
      case 'scratching': return 'text-purple-400'
      case 'revealed': return 'text-emerald-400'
      case 'result': return 'text-red-400'
      default: return 'text-slate-400'
    }
  }
  
  const getVolatilityInfo = (vol: Volatility) => {
    const volatilityConfig = getVolatilityConfig(vol)
    
    return {
      name: volatilityConfig.name,
      color: volatilityConfig.color,
      bgColor: volatilityConfig.bgColor,
      borderColor: volatilityConfig.borderColor,
      description: volatilityConfig.description,
      winRate: volatilityConfig.winRate,
      multiplierRange: volatilityConfig.multiplierRange
    }
  }
  
  const getCardTypeInfo = (type: CardType) => {
    const config = getCardTypeConfig(type)
    
    return {
      name: config.name,
      color: config.color,
      bgColor: config.bgColor,
      borderColor: config.borderColor,
      description: config.description
    }
  }
  
  const getPlayButtonClasses = () => {
    let classes = 'w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3'
    
    if (!canPlay || isScratching) {
      classes += ' bg-slate-600 text-slate-400 cursor-not-allowed opacity-50'
    } else {
      classes += ' bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-lg'
    }
    
    return classes
  }
  
  return (
    <div className="space-y-6">
      {/* Game Status */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${getGameStateColor().replace('text-', 'bg-')}`}></div>
            <div className="text-sm font-medium text-white">Status:</div>
            <div className={`text-sm font-medium ${getGameStateColor()}`}>
              {getGameStateText()}
            </div>
          </div>
          {isScratching && (
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
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
              disabled={isScratching}
              className={`py-2 px-4 rounded-lg font-medium transition-all ${
                betAmount === amount 
                  ? 'bg-emerald-600 text-white border-emerald-700' 
                  : 'bg-[#1a2c38] hover:bg-[#2a3c48] text-white border border-white/20'
              } ${isScratching ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {amount}
            </button>
          ))}
        </div>
        
        {/* Custom Amount Input */}
        <div className="flex items-center gap-2">
          <button
            onClick={decrementBet}
            disabled={isScratching}
            className="p-2 bg-[#1a2c38] hover:bg-[#2a3c48] text-white rounded-lg border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Minus className="h-4 w-4" />
          </button>
          
          <input
            type="number"
            value={betAmount}
            onChange={(e) => !isScratching && onBetAmountChange(Number(e.target.value))}
            disabled={isScratching}
            className="flex-1 bg-[#1a2c38] border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 text-center"
            placeholder="Custom amount"
            min={1}
            max={10000}
          />
          
          <button
            onClick={incrementBet}
            disabled={isScratching}
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
      
      {/* Volatility Selection */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Volatility</h4>
        
        <div className="grid grid-cols-1 gap-3">
          {(['low', 'medium', 'high'] as Volatility[]).map(vol => {
            const info = getVolatilityInfo(vol)
            const isSelected = volatility === vol
            
            return (
              <button
                key={vol}
                onClick={() => !isScratching && onVolatilityChange(vol)}
                disabled={isScratching}
                className={`p-4 rounded-lg border-2 transition-all relative overflow-hidden ${
                  isSelected 
                    ? `${info.bgColor} ${info.borderColor} text-white` 
                    : 'bg-[#1a2c38] hover:bg-[#2a3c48] text-white border border-white/20'
                } ${isScratching ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="font-bold text-lg">{info.name}</div>
                    <div className={`text-sm ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                      Win Rate: {info.winRate}
                    </div>
                    <div className={`text-xs ${isSelected ? 'text-white/60' : 'text-slate-500'}`}>
                      {info.multiplierRange}
                    </div>
                  </div>
                  {isSelected && <Check className="h-5 w-5" />}
                </div>
                
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="grid grid-cols-4 gap-1 p-2">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div key={i} className="bg-white/10 rounded-full w-full aspect-square"></div>
                    ))}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
        
        {/* Volatility Description */}
        <div className="mt-4 p-3 bg-[#1a2c38] rounded-lg border border-white/10">
          <div className="text-sm text-slate-300">
            {getVolatilityInfo(volatility).description}
          </div>
        </div>
      </div>
      
      {/* Card Type Selection */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Card Type</h4>
        
        <div className="grid grid-cols-2 gap-3">
          {(['classic', 'multiplier', 'bonus', 'jackpot'] as CardType[]).map(type => {
            const info = getCardTypeInfo(type)
            const isSelected = cardType === type
            const isJackpot = type === 'jackpot'
            
            return (
              <button
                key={type}
                onClick={() => !isScratching && onCardTypeChange(type)}
                disabled={isScratching}
                className={`p-3 rounded-lg border-2 transition-all relative overflow-hidden ${
                  isSelected 
                    ? `${info.bgColor} ${info.borderColor} text-white` 
                    : 'bg-[#1a2c38] hover:bg-[#2a3c48] text-white border border-white/20'
                } ${isScratching ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="text-2xl">
                    {isJackpot && <Crown className="h-6 w-6 text-yellow-400" />}
                    {!isJackpot && <Sparkles className="h-6 w-6" />}
                  </div>
                  <div className="text-sm font-medium">{info.name}</div>
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
        
        {/* Card Type Description */}
        <div className="mt-4 p-3 bg-[#1a2c38] rounded-lg border border-white/10">
          <div className="text-sm text-slate-300">
            {getCardTypeInfo(cardType).description}
          </div>
        </div>
      </div>
      
      {/* Game Presets */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Quick Presets</h4>
        
        <div className="grid grid-cols-1 gap-3">
          {GAME_PRESETS.map(preset => {
            const isSelected = volatility === preset.volatility && betAmount >= preset.recommendedBetRange.min && betAmount <= preset.recommendedBetRange.max
            
            return (
              <button
                key={preset.id}
                onClick={() => {
                  if (!isScratching) {
                    onVolatilityChange(preset.volatility)
                    onBetAmountChange(preset.recommendedBetRange.min)
                  }
                }}
                disabled={isScratching}
                className={`p-3 rounded-lg border-2 transition-all ${
                  isSelected 
                    ? 'bg-emerald-600 border-emerald-700 text-white' 
                    : 'bg-[#1a2c38] hover:bg-[#2a3c48] text-white border border-white/20'
                } ${isScratching ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="font-medium">{preset.name}</div>
                    <div className="text-xs text-slate-400">{preset.description}</div>
                    <div className="text-xs text-slate-500">
                      {preset.recommendedBetRange.min} - {preset.recommendedBetRange.max}
                    </div>
                  </div>
                  {isSelected && <Check className="h-4 w-4" />}
                </div>
              </button>
            )
          })}
        </div>
      </div>
      
      {/* Play Button */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <Button
          onClick={onPlay}
          disabled={!canPlay || isScratching}
          className={getPlayButtonClasses()}
          size="lg"
        >
          {isScratching ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Scratching...</span>
            </>
          ) : (
            <>
              <PlayCircle className="h-5 w-5" />
              <span>Play Game</span>
            </>
          )}
        </Button>
        
        {/* Game Info */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-400">Current Bet:</div>
            <div className="text-sm font-medium text-white">{betAmount}</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-400">Volatility:</div>
            <div className="text-sm font-medium text-white">{volatility}</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-400">Card Type:</div>
            <div className="text-sm font-medium text-white">{cardType}</div>
          </div>
        </div>
      </div>
      
      {/* Game Rules */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">How to Play</h4>
        <div className="text-sm text-slate-400 space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">1.</span>
            <span>Select your bet amount and volatility</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">2.</span>
            <span>Click "Play Game" to generate your card</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">3.</span>
            <span>Scratch the card to reveal hidden symbols</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">4.</span>
            <span>Match 3 symbols to win!</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">5.</span>
            <span>Higher volatility = bigger wins, lower chance</span>
          </div>
        </div>
      </div>
      
      {/* Payout Information */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Payout Information</h4>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Low Volatility:</span>
            <span className="text-white font-medium">1.2x - 3x (45% win rate)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Medium Volatility:</span>
            <span className="text-white font-medium">1.5x - 10x (35% win rate)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">High Volatility:</span>
            <span className="text-white font-medium">2x - 100x (20% win rate)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Jackpot Cards:</span>
            <span className="text-white font-medium">Up to 1000x</span>
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
          <BarChart className="h-4 w-4 mr-2" />
          Statistics
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-white/20 text-white"
        >
          <Shield className="h-4 w-4 mr-2" />
          Fairness
        </Button>
      </div>
    </div>
  )
}

// Compact controls for mobile view
export function CompactScratchControls({
  betAmount,
  volatility,
  cardType,
  canPlay,
  isScratching,
  gameState,
  onBetAmountChange,
  onVolatilityChange,
  onCardTypeChange,
  onPlay,
  onQuickBet,
  quickBetAmounts,
  clearBets
}: ScratchControlsProps) {
  const getVolatilityInfo = (vol: Volatility) => {
    const volatilityConfig = getVolatilityConfig(vol)
    
    return {
      name: volatilityConfig.name,
      color: volatilityConfig.color,
      bgColor: volatilityConfig.bgColor
    }
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
              onClick={() => onQuickBet(amount)}
              disabled={isScratching}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                betAmount === amount 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-[#1a2c38] hover:bg-[#2a3c48] text-white border border-white/20'
              } ${isScratching ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {amount}
            </button>
          ))}
        </div>
        <input
          type="number"
          value={betAmount}
          onChange={(e) => !isScratching && onBetAmountChange(Number(e.target.value))}
          disabled={isScratching}
          className="w-full bg-[#1a2c38] border border-white/20 rounded-lg px-3 py-2 text-white text-center disabled:opacity-50"
          min={1}
          max={10000}
        />
      </div>
      
      {/* Volatility */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
        <div className="text-sm font-medium text-white mb-2">Volatility</div>
        <div className="grid grid-cols-3 gap-2">
          {(['low', 'medium', 'high'] as Volatility[]).map(vol => {
            const info = getVolatilityInfo(vol)
            const isSelected = volatility === vol
            
            return (
              <button
                key={vol}
                onClick={() => !isScratching && onVolatilityChange(vol)}
                disabled={isScratching}
                className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                  isSelected 
                    ? `${info.bgColor} text-white` 
                    : 'bg-[#1a2c38] hover:bg-[#2a3c48] text-white border border-white/20'
                } ${isScratching ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {info.name}
              </button>
            )
          })}
        </div>
      </div>
      
      {/* Play Button */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
        <Button
          onClick={onPlay}
          disabled={!canPlay || isScratching}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-bold"
        >
          {isScratching ? 'Scratching...' : 'Play Game'}
        </Button>
      </div>
    </div>
  )
}
