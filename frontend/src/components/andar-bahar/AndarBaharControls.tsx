'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DollarSign, PlayCircle, Info, BarChart, Shield, TrendingUp, Zap, Plus, Minus, Check, X, Crown, Sparkles } from 'lucide-react'
import type { BetType } from '@/utils/andarBaharEngine'

interface AndarBaharControlsProps {
  betAmount: number
  selectedBetType: BetType
  canStartFirstDeal: boolean
  canStartSecondDeal: boolean
  isGameActive: boolean
  gameState: string
  hasFirstBet: boolean
  hasSecondBet: boolean
  onBetAmountChange: (amount: number) => void
  onBetTypeChange: (betType: BetType) => void
  onStartFirstDeal: () => void
  onStartSecondDeal: () => void
  onQuickBet: (amount: number) => void
  quickBetAmounts: number[]
  clearBets: () => void
}

export default function AndarBaharControls({
  betAmount,
  selectedBetType,
  canStartFirstDeal,
  canStartSecondDeal,
  isGameActive,
  gameState,
  hasFirstBet,
  hasSecondBet,
  onBetAmountChange,
  onBetTypeChange,
  onStartFirstDeal,
  onStartSecondDeal,
  onQuickBet,
  quickBetAmounts,
  clearBets
}: AndarBaharControlsProps) {
  
  const handleQuickBet = (amount: number) => {
    if (!isGameActive) {
      onQuickBet(amount)
    }
  }
  
  const incrementBet = () => {
    if (!isGameActive) {
      onBetAmountChange(Math.min(betAmount + 10, 10000))
    }
  }
  
  const decrementBet = () => {
    if (!isGameActive) {
      onBetAmountChange(Math.max(betAmount - 10, 1))
    }
  }
  
  const getGameStateText = () => {
    switch (gameState) {
      case 'betting1': return 'Place Your First Bet'
      case 'dealing1': return 'Dealing First Cards'
      case 'betting2': return 'Place Your Second Bet'
      case 'dealing2': return 'Dealing Remaining Cards'
      case 'result': return 'Game Complete'
      default: return 'Ready to Play'
    }
  }
  
  const getGameStateColor = () => {
    switch (gameState) {
      case 'betting1': return 'text-blue-400'
      case 'dealing1': return 'text-orange-400'
      case 'betting2': return 'text-purple-400'
      case 'dealing2': return 'text-orange-400'
      case 'result': return 'text-red-400'
      default: return 'text-slate-400'
    }
  }
  
  const getBetTypeInfo = (betType: BetType) => {
    const info = {
      andar: {
        name: 'Andar',
        emoji: 'ð',
        color: 'text-purple-400',
        bgColor: 'bg-purple-600',
        hoverColor: 'hover:bg-purple-700',
        borderColor: 'border-purple-400',
        payout: '1:1',
        description: 'Bet on Joker appearing in Andar side',
        round: 'Both rounds'
      },
      bahar: {
        name: 'Bahar',
        emoji: 'ð',
        color: 'text-orange-400',
        bgColor: 'bg-orange-600',
        hoverColor: 'hover:bg-orange-700',
        borderColor: 'border-orange-400',
        payout: '1:1',
        description: 'Bet on Joker appearing in Bahar side',
        round: 'Both rounds'
      },
      superBahar: {
        name: 'Super Bahar',
        emoji: 'â',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-600',
        hoverColor: 'hover:bg-yellow-700',
        borderColor: 'border-yellow-400',
        payout: '11:1',
        description: 'Bet on Joker appearing on first Bahar card',
        round: 'First round only'
      }
    }
    
    return info[betType] || info.andar // Fallback to andar if betType is invalid
  }
  
  const getPlayButtonClasses = (isFirstDeal: boolean) => {
    let classes = 'w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3'
    
    const canStart = isFirstDeal ? canStartFirstDeal : canStartSecondDeal
    
    if (!canStart || isGameActive) {
      classes += ' bg-slate-600 text-slate-400 cursor-not-allowed opacity-50'
    } else {
      classes += ' bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-lg'
    }
    
    return classes
  }
  
  const getCurrentRound = () => {
    switch (gameState) {
      case 'betting1': return 1
      case 'betting2': return 2
      default: return 0
    }
  }
  
  const currentRound = getCurrentRound()
  
  return (
    <div className="space-y-6">
      {/* Round Indicator */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-white">Current Round</div>
          <div className="flex items-center gap-2">
            {currentRound === 1 && (
              <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                1st Round
              </div>
            )}
            {currentRound === 2 && (
              <div className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                2nd Round
              </div>
            )}
            {hasFirstBet && !hasSecondBet && (
              <div className="text-xs text-slate-400">First bet placed</div>
            )}
            {hasSecondBet && (
              <div className="text-xs text-slate-400">Second bet placed</div>
            )}
          </div>
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
          <button
            onClick={decrementBet}
            disabled={isGameActive}
            className="p-2 bg-[#1a2c38] hover:bg-[#2a3c48] text-white rounded-lg border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Minus className="h-4 w-4" />
          </button>
          
          <input
            type="number"
            value={betAmount}
            onChange={(e) => !isGameActive && onBetAmountChange(Number(e.target.value))}
            disabled={isGameActive}
            className="flex-1 bg-[#1a2c38] border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 text-center"
            placeholder="Custom amount"
            min={1}
            max={10000}
          />
          
          <button
            onClick={incrementBet}
            disabled={isGameActive}
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
      
      {/* Bet Type Selection */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Choose Your Side</h4>
        
        <div className="grid grid-cols-1 gap-3">
          {(['andar', 'bahar', 'superBahar'] as BetType[]).map(betType => {
            const info = getBetTypeInfo(betType)
            const isSelected = selectedBetType === betType
            const isAvailable = betType === 'superBahar' ? currentRound === 1 : true
            
            return (
              <button
                key={betType}
                onClick={() => isAvailable && onBetTypeChange(betType)}
                disabled={isGameActive || !isAvailable}
                className={`p-4 rounded-lg border-2 transition-all relative overflow-hidden ${
                  isSelected 
                    ? `${info.bgColor} ${info.borderColor} text-white` 
                    : 'bg-[#1a2c38] hover:bg-[#2a3c48] text-white border border-white/20'
                } ${isGameActive || !isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{info.emoji}</span>
                    <div className="text-left">
                      <div className="font-bold text-lg">{info.name}</div>
                      <div className={`text-sm ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                        {info.payout}
                      </div>
                      <div className={`text-xs ${isSelected ? 'text-white/60' : 'text-slate-500'}`}>
                        {info.round}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="h-5 w-5" />}
                  {betType === 'superBahar' && (
                    <Crown className="h-5 w-5 text-yellow-400" />
                  )}
                </div>
                
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="grid grid-cols-4 gap-1 p-2">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div key={i} className="bg-white/10 rounded-full w-full aspect-square"></div>
                    ))}
                  </div>
                </div>
                
                {/* Not available indicator */}
                {!isAvailable && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-xs text-white font-medium">2nd Round Only</div>
                  </div>
                )}
              </button>
            )
          })}
        </div>
        
        {/* Bet Type Description */}
        <div className="mt-4 p-3 bg-[#1a2c38] rounded-lg border border-white/10">
          <div className="text-sm text-slate-300">
            {getBetTypeInfo(selectedBetType)?.description || 'Select a bet type'}
          </div>
        </div>
      </div>
      
      {/* Game Actions */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Game Actions</h4>
        
        {/* First Deal Button */}
        {currentRound === 1 && (
          <Button
            onClick={onStartFirstDeal}
            disabled={!canStartFirstDeal || isGameActive}
            className={getPlayButtonClasses(true)}
            size="lg"
          >
            {isGameActive ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Dealing...</span>
              </>
            ) : (
              <>
                <PlayCircle className="h-5 w-5" />
                <span>Start First Deal</span>
              </>
            )}
          </Button>
        )}
        
        {/* Second Deal Button */}
        {currentRound === 2 && (
          <Button
            onClick={onStartSecondDeal}
            disabled={!canStartSecondDeal || isGameActive}
            className={getPlayButtonClasses(false)}
            size="lg"
          >
            {isGameActive ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Dealing...</span>
              </>
            ) : (
              <>
                <PlayCircle className="h-5 w-5" />
                <span>Start Second Deal</span>
              </>
            )}
          </Button>
        )}
        
        {/* Game Status */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getGameStateColor().replace('text-', 'bg-')}`}></div>
              <span className="text-sm text-slate-400">Status:</span>
              <span className={`text-sm font-medium ${getGameStateColor()}`}>
                {getGameStateText()}
              </span>
            </div>
            <div className="text-sm text-slate-400">
              Current Bet: {selectedBetType}
            </div>
          </div>
        </div>
      </div>
      
      {/* Bet Type Guide */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Bet Type Guide</h4>
        <div className="space-y-3 text-sm">
          {(['andar', 'bahar', 'superBahar'] as BetType[]).map(betType => {
            const info = getBetTypeInfo(betType)
            
            return (
              <div key={betType} className="flex items-start gap-3">
                <div className={`w-3 h-3 rounded-full ${info.color.replace('text-', 'bg-')} mt-0.5`}></div>
                <div className="flex-1">
                  <div className={`font-medium ${info.color} mb-1`}>
                    {info.emoji} {info.name} ({info.payout})
                  </div>
                  <div className="text-slate-400">
                    {info.description}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {info.round}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Game Rules */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Game Rules</h4>
        <div className="text-sm text-slate-400 space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">â</span>
            <span>First card drawn becomes the Joker</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">â</span>
            <span>Cards dealt alternately: Bahar â Andar â Bahar...</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">â</span>
            <span>Side where Joker appears wins</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">â</span>
            <span>Early win if Joker appears on first Bahar card</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">â</span>
            <span>Second betting available after first 2 cards</span>
          </div>
        </div>
      </div>
      
      {/* Payout Information */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Payout Information</h4>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Andar / Bahar Win:</span>
            <span className="text-white font-medium">1:1 (2x return)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Early Bahar Win:</span>
            <span className="text-white font-medium">0.25x (25% return)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Super Bahar Win:</span>
            <span className="text-white font-medium">11:1 (12x return)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Second Bet Win:</span>
            <span className="text-white font-medium">1:1 (2x return)</span>
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

// Compact controls for mobile view
export function CompactAndarBaharControls({
  betAmount,
  selectedBetType,
  canStartFirstDeal,
  canStartSecondDeal,
  isGameActive,
  gameState,
  hasFirstBet,
  hasSecondBet,
  onBetAmountChange,
  onBetTypeChange,
  onStartFirstDeal,
  onStartSecondDeal,
  onQuickBet,
  quickBetAmounts,
  clearBets
}: AndarBaharControlsProps) {
  const getBetTypeInfo = (betType: BetType) => {
    const info = {
      andar: { name: 'Andar', emoji: 'ð', color: 'text-purple-400', bgColor: 'bg-purple-600' },
      bahar: { name: 'Bahar', emoji: 'ð', color: 'text-orange-400', bgColor: 'bg-orange-600' },
      superBahar: { name: 'Super', emoji: 'â', color: 'text-yellow-400', bgColor: 'bg-yellow-600' }
    }
    return info[betType]
  }
  
  const getCurrentRound = () => {
    switch (gameState) {
      case 'betting1': return 1
      case 'betting2': return 2
      default: return 0
    }
  }
  
  const currentRound = getCurrentRound()
  
  return (
    <div className="space-y-4">
      {/* Round Indicator */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-white">Round</div>
          <div className="text-sm">
            {currentRound === 1 && (
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                1st
              </span>
            )}
            {currentRound === 2 && (
              <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                2nd
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Bet Controls */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
        <div className="text-sm font-medium text-white mb-2">Bet Amount</div>
        <div className="grid grid-cols-3 gap-2 mb-2">
          {quickBetAmounts.slice(0, 3).map(amount => (
            <button
              key={amount}
              onClick={() => onQuickBet(amount)}
              disabled={isGameActive}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                betAmount === amount 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-[#1a2c38] hover:bg-[#2a3c48] text-white border border-white/20'
              } ${isGameActive ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {amount}
            </button>
          ))}
        </div>
        <input
          type="number"
          value={betAmount}
          onChange={(e) => !isGameActive && onBetAmountChange(Number(e.target.value))}
          disabled={isGameActive}
          className="w-full bg-[#1a2c38] border border-white/20 rounded-lg px-3 py-2 text-white text-center disabled:opacity-50"
          min={1}
          max={10000}
        />
      </div>
      
      {/* Bet Types */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
        <div className="text-sm font-medium text-white mb-2">Choose Side</div>
        <div className="grid grid-cols-1 gap-2">
          {(['andar', 'bahar', 'superBahar'] as BetType[]).map(betType => {
            const info = getBetTypeInfo(betType)
            const isSelected = selectedBetType === betType
            const isAvailable = betType === 'superBahar' ? currentRound === 1 : true
            
            return (
              <button
                key={betType}
                onClick={() => isAvailable && onBetTypeChange(betType)}
                disabled={isGameActive || !isAvailable}
                className={`py-3 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-between ${
                  isSelected 
                    ? `${info.bgColor} text-white` 
                    : 'bg-[#1a2c38] hover:bg-[#2a3c48] text-white border border-white/20'
                } ${isGameActive || !isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{info.emoji}</span>
                  <span>{info.name}</span>
                </div>
                <span className="text-xs">{isSelected ? 'â' : ''}</span>
              </button>
            )
          })}
        </div>
      </div>
      
      {/* Game Actions */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
        {currentRound === 1 && (
          <Button
            onClick={onStartFirstDeal}
            disabled={!canStartFirstDeal || isGameActive}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-bold"
          >
            {isGameActive ? 'Dealing...' : 'Start First Deal'}
          </Button>
        )}
        
        {currentRound === 2 && (
          <Button
            onClick={onStartSecondDeal}
            disabled={!canStartSecondDeal || isGameActive}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-bold"
          >
            {isGameActive ? 'Dealing...' : 'Start Second Deal'}
          </Button>
        )}
      </div>
    </div>
  )
}
