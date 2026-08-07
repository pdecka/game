'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DollarSign, PlayCircle, Info, BarChart, Shield, TrendingUp, Zap, Plus, Minus, Check, X } from 'lucide-react'
import type { BetType } from '@/utils/baccaratEngine'

interface BaccaratControlsProps {
  betAmount: number
  selectedBetTypes: BetType[]
  canStartGame: boolean
  isGameActive: boolean
  gameState: string
  onBetAmountChange: (amount: number) => void
  onBetTypeToggle: (betType: BetType) => void
  onStartGame: () => void
  onQuickBet: (amount: number) => void
  quickBetAmounts: number[]
  clearBets: () => void
}

export default function BaccaratControls({
  betAmount,
  selectedBetTypes,
  canStartGame,
  isGameActive,
  gameState,
  onBetAmountChange,
  onBetTypeToggle,
  onStartGame,
  onQuickBet,
  quickBetAmounts,
  clearBets
}: BaccaratControlsProps) {
  
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
      case 'thirdCard': return 'Drawing Third Cards'
      case 'result': return 'Game Complete'
      default: return 'Ready to Play'
    }
  }
  
  const getGameStateColor = () => {
    switch (gameState) {
      case 'betting': return 'text-blue-400'
      case 'dealing': return 'text-orange-400'
      case 'thirdCard': return 'text-purple-400'
      case 'result': return 'text-red-400'
      default: return 'text-slate-400'
    }
  }
  
  const getBetTypeInfo = (betType: BetType) => {
    const info = {
      player: {
        name: 'Player',
        color: 'text-blue-400',
        bgColor: 'bg-blue-600',
        hoverColor: 'hover:bg-blue-700',
        borderColor: 'border-blue-400',
        payout: '1:1',
        description: 'Bet on Player hand to win'
      },
      banker: {
        name: 'Banker',
        color: 'text-red-400',
        bgColor: 'bg-red-600',
        hoverColor: 'hover:bg-red-700',
        borderColor: 'border-red-400',
        payout: '1:1 (5% commission)',
        description: 'Bet on Banker hand to win'
      },
      tie: {
        name: 'Tie',
        color: 'text-green-400',
        bgColor: 'bg-green-600',
        hoverColor: 'hover:bg-green-700',
        borderColor: 'border-green-400',
        payout: '8:1',
        description: 'Bet on a tie between Player and Banker'
      },
      playerPair: {
        name: 'Player Pair',
        color: 'text-purple-400',
        bgColor: 'bg-purple-600',
        hoverColor: 'hover:bg-purple-700',
        borderColor: 'border-purple-400',
        payout: '11:1',
        description: 'Bet on Player\'s first two cards being a pair'
      },
      bankerPair: {
        name: 'Banker Pair',
        color: 'text-orange-400',
        bgColor: 'bg-orange-600',
        hoverColor: 'hover:bg-orange-700',
        borderColor: 'border-orange-400',
        payout: '11:1',
        description: 'Bet on Banker\'s first two cards being a pair'
      },
      superSix: {
        name: 'Super Six',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-600',
        hoverColor: 'hover:bg-yellow-700',
        borderColor: 'border-yellow-400',
        payout: '12:1',
        description: 'Banker wins with exactly 6'
      }
    }
    
    return info[betType]
  }
  
  const getTotalBetAmount = () => {
    return betAmount * selectedBetTypes.length
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
          Min: 1 | Max: 10,000 per bet
        </div>
      </div>
      
      {/* Bet Types */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-white">Bet Types</h4>
          <button
            onClick={clearBets}
            disabled={isGameActive}
            className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear All
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {(['player', 'banker', 'tie', 'playerPair', 'bankerPair', 'superSix'] as BetType[]).map(betType => {
            const info = getBetTypeInfo(betType)
            const isSelected = selectedBetTypes.includes(betType)
            
            return (
              <button
                key={betType}
                onClick={() => onBetTypeToggle(betType)}
                disabled={isGameActive}
                className={`p-3 rounded-lg border-2 transition-all ${
                  isSelected 
                    ? `${info.bgColor} ${info.borderColor} text-white` 
                    : 'bg-[#1a2c38] border-white/20 text-white hover:bg-[#2a3c48]'
                } ${isGameActive ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{info.name}</span>
                  {isSelected && <Check className="h-4 w-4" />}
                </div>
                <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                  {info.payout}
                </div>
              </button>
            )
          })}
        </div>
        
        {/* Total Bet Display */}
        {selectedBetTypes.length > 0 && (
          <div className="mt-4 p-3 bg-[#1a2c38] rounded-lg border border-white/20">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Total Bet:</span>
              <span className="text-lg font-bold text-white">
                {getTotalBetAmount()}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {selectedBetTypes.length} bet{selectedBetTypes.length > 1 ? 's' : ''} selected
            </div>
          </div>
        )}
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
            {selectedBetTypes.length > 0 && (
              <div className="text-sm text-slate-400">
                {selectedBetTypes.length} bet{selectedBetTypes.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Bet Type Descriptions */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Bet Type Guide</h4>
        <div className="space-y-3 text-sm">
          {(['player', 'banker', 'tie', 'playerPair', 'bankerPair', 'superSix'] as BetType[]).map(betType => {
            const info = getBetTypeInfo(betType)
            
            return (
              <div key={betType} className="flex items-start gap-3">
                <div className={`w-3 h-3 rounded-full ${info.color.replace('text-', 'bg-')} mt-0.5`}></div>
                <div className="flex-1">
                  <div className={`font-medium ${info.color} mb-1`}>
                    {info.name} ({info.payout})
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
            <span>8 decks used, cards dealt from shoe</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">â</span>
            <span>Face cards (10, J, Q, K) = 0, Ace = 1</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">â</span>
            <span>Hand total = last digit only (e.g., 15 = 5)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">â</span>
            <span>Natural 8 or 9 wins immediately</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">â</span>
            <span>Third card rules apply to totals 0-5</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">â</span>
            <span>Closest to 9 wins</span>
          </div>
        </div>
      </div>
      
      {/* Third Card Rules */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Third Card Rules</h4>
        <div className="text-sm text-slate-400 space-y-3">
          <div>
            <div className="font-medium text-blue-400 mb-1">Player Rules:</div>
            <div className="space-y-1 ml-4">
              <div>â Draws if total â¤ 5</div>
              <div>â Stands if total â¥ 6</div>
            </div>
          </div>
          
          <div>
            <div className="font-medium text-red-400 mb-1">Banker Rules:</div>
            <div className="space-y-1 ml-4">
              <div>â Always draws with 0-2</div>
              <div>â Complex rules for 3-6 based on player's third card</div>
              <div>â Stands with 7-9</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* House Edge */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">House Edge</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-slate-400">Player</div>
            <div className="text-white font-medium">1.24%</div>
          </div>
          <div>
            <div className="text-slate-400">Banker</div>
            <div className="text-white font-medium">1.06%</div>
          </div>
          <div>
            <div className="text-slate-400">Tie</div>
            <div className="text-white font-medium">14.36%</div>
          </div>
          <div>
            <div className="text-slate-400">Pairs</div>
            <div className="text-white font-medium">11.11%</div>
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
export function CompactBaccaratControls({
  betAmount,
  selectedBetTypes,
  canStartGame,
  isGameActive,
  gameState,
  onBetAmountChange,
  onBetTypeToggle,
  onStartGame,
  onQuickBet,
  quickBetAmounts,
  clearBets
}: BaccaratControlsProps) {
  const getBetTypeInfo = (betType: BetType) => {
    const info = {
      player: { name: 'Player', color: 'text-blue-400', bgColor: 'bg-blue-600' },
      banker: { name: 'Banker', color: 'text-red-400', bgColor: 'bg-red-600' },
      tie: { name: 'Tie', color: 'text-green-400', bgColor: 'bg-green-600' },
      playerPair: { name: 'P Pair', color: 'text-purple-400', bgColor: 'bg-purple-600' },
      bankerPair: { name: 'B Pair', color: 'text-orange-400', bgColor: 'bg-orange-600' },
      superSix: { name: 'Super 6', color: 'text-yellow-400', bgColor: 'bg-yellow-600' }
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
        <div className="text-sm font-medium text-white mb-2">Bet Types</div>
        <div className="grid grid-cols-2 gap-2">
          {(['player', 'banker', 'tie'] as BetType[]).map(betType => {
            const info = getBetTypeInfo(betType)
            const isSelected = selectedBetTypes.includes(betType)
            
            return (
              <button
                key={betType}
                onClick={() => onBetTypeToggle(betType)}
                disabled={isGameActive}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  isSelected 
                    ? `${info.bgColor} text-white` 
                    : 'bg-[#1a2c38] hover:bg-[#2a3c48] text-white border border-white/20'
                } ${isGameActive ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {info.name}
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
