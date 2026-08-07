'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DollarSign, PlayCircle, Info, BarChart, Shield, TrendingUp, Zap, Plus, Minus, Check, X } from 'lucide-react'
import type { BetType } from '@/utils/dragonTigerEngine'

interface DragonTigerControlsProps {
  betAmount: number
  selectedBetType: BetType
  canStartGame: boolean
  isGameActive: boolean
  gameState: string
  onBetAmountChange: (amount: number) => void
  onBetTypeChange: (betType: BetType) => void
  onStartGame: () => void
  onQuickBet: (amount: number) => void
  quickBetAmounts: number[]
  clearBets: () => void
}

export default function DragonTigerControls({
  betAmount,
  selectedBetType,
  canStartGame,
  isGameActive,
  gameState,
  onBetAmountChange,
  onBetTypeChange,
  onStartGame,
  onQuickBet,
  quickBetAmounts,
  clearBets
}: DragonTigerControlsProps) {
  
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
      case 'betting': return 'Place Your Bets'
      case 'dealing': return 'Dealing Cards'
      case 'result': return 'Game Complete'
      default: return 'Ready to Play'
    }
  }
  
  const getGameStateColor = () => {
    switch (gameState) {
      case 'betting': return 'text-blue-400'
      case 'dealing': return 'text-orange-400'
      case 'result': return 'text-red-400'
      default: return 'text-slate-400'
    }
  }
  
  const getBetTypeInfo = (betType: BetType) => {
    const info = {
      dragon: {
        name: 'Dragon',
        emoji: 'ð',
        color: 'text-blue-400',
        bgColor: 'bg-blue-600',
        hoverColor: 'hover:bg-blue-700',
        borderColor: 'border-blue-400',
        payout: '1:1',
        description: 'Bet on Dragon card to be higher'
      },
      tiger: {
        name: 'Tiger',
        emoji: 'ð',
        color: 'text-red-400',
        bgColor: 'bg-red-600',
        hoverColor: 'hover:bg-red-700',
        borderColor: 'border-red-400',
        payout: '1:1',
        description: 'Bet on Tiger card to be higher'
      },
      tie: {
        name: 'Tie',
        emoji: 'ð',
        color: 'text-green-400',
        bgColor: 'bg-green-600',
        hoverColor: 'hover:bg-green-700',
        borderColor: 'border-green-400',
        payout: '10:1',
        description: 'Bet on both cards being equal'
      }
    }
    
    return info[betType] || info.dragon // Fallback to dragon if betType is invalid
  }
  
  const getPlayButtonClasses = () => {
    let classes = 'w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3'
    
    if (!canStartGame || isGameActive) {
      classes += ' bg-slate-600 text-slate-400 cursor-not-allowed opacity-50'
    } else {
      classes += ' bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-lg'
    }
    
    return classes
  }
  
  return (
    <div className="space-y-6">
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
          {(['dragon', 'tiger', 'tie'] as BetType[]).map(betType => {
            const info = getBetTypeInfo(betType)
            const isSelected = selectedBetType === betType
            
            return (
              <button
                key={betType}
                onClick={() => onBetTypeChange(betType)}
                disabled={isGameActive}
                className={`p-4 rounded-lg border-2 transition-all relative overflow-hidden ${
                  isSelected 
                    ? `${info.bgColor} ${info.borderColor} text-white` 
                    : 'bg-[#1a2c38] border-white/20 text-white hover:bg-[#2a3c48]'
                } ${isGameActive ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{info.emoji}</span>
                    <div className="text-left">
                      <div className="font-bold text-lg">{info.name}</div>
                      <div className={`text-sm ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                        {info.payout}
                      </div>
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
        
        {/* Start Game Button */}
        <Button
          onClick={onStartGame}
          disabled={!canStartGame || isGameActive}
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
              <span>Deal Cards</span>
            </>
          )}
        </Button>
        
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
          {(['dragon', 'tiger', 'tie'] as BetType[]).map(betType => {
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
            <span>6-8 decks used, cards dealt from shoe</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">â</span>
            <span>1 card dealt to Dragon, 1 card to Tiger</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">â</span>
            <span>Higher card wins (Ace=1, King=13)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">â</span>
            <span>Tie when both cards have same value</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">â</span>
            <span>50% refund on Dragon/Tiger when Tie occurs</span>
          </div>
        </div>
      </div>
      
      {/* Card Rankings */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Card Rankings</h4>
        <div className="text-sm text-slate-400 space-y-1">
          <div className="flex items-center justify-between">
            <span>Highest:</span>
            <span className="text-white font-medium">K (13)</span>
          </div>
          <div className="flex items-center justify-between">
            <span>High:</span>
            <span className="text-white font-medium">Q (12), J (11), 10 (10)</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Medium:</span>
            <span className="text-white font-medium">9 (9), 8 (8), 7 (7)</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Low:</span>
            <span className="text-white font-medium">6 (6), 5 (5), 4 (4)</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Lowest:</span>
            <span className="text-white font-medium">3 (3), 2 (2), A (1)</span>
          </div>
        </div>
      </div>
      
      {/* House Edge */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">House Edge</h4>
        <div className="grid grid-cols-1 gap-4 text-sm">
          <div>
            <div className="text-slate-400">Dragon/Tiger</div>
            <div className="text-white font-medium">3.73%</div>
          </div>
          <div>
            <div className="text-slate-400">Tie</div>
            <div className="text-white font-medium">18.52%</div>
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
export function CompactDragonTigerControls({
  betAmount,
  selectedBetType,
  canStartGame,
  isGameActive,
  gameState,
  onBetAmountChange,
  onBetTypeChange,
  onStartGame,
  onQuickBet,
  quickBetAmounts,
  clearBets
}: DragonTigerControlsProps) {
  const getBetTypeInfo = (betType: BetType) => {
    const info = {
      dragon: { name: 'Dragon', emoji: 'ð', color: 'text-blue-400', bgColor: 'bg-blue-600' },
      tiger: { name: 'Tiger', emoji: 'ð', color: 'text-red-400', bgColor: 'bg-red-600' },
      tie: { name: 'Tie', emoji: 'ð', color: 'text-green-400', bgColor: 'bg-green-600' }
    }
    return info[betType]
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
          {(['dragon', 'tiger', 'tie'] as BetType[]).map(betType => {
            const info = getBetTypeInfo(betType)
            const isSelected = selectedBetType === betType
            
            return (
              <button
                key={betType}
                onClick={() => onBetTypeChange(betType)}
                disabled={isGameActive}
                className={`py-3 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-between ${
                  isSelected 
                    ? `${info.bgColor} text-white` 
                    : 'bg-[#1a2c38] hover:bg-[#2a3c48] text-white border border-white/20'
                } ${isGameActive ? 'opacity-50 cursor-not-allowed' : ''}`}
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
        <Button
          onClick={onStartGame}
          disabled={!canStartGame || isGameActive}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-bold"
        >
          {isGameActive ? 'Playing...' : 'Deal Cards'}
        </Button>
      </div>
    </div>
  )
}
