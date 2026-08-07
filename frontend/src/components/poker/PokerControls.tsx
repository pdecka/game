'use client'

import { Button } from '@/components/ui/button'
import { DollarSign, PlayCircle, Info, BarChart, Shield, TrendingUp } from 'lucide-react'
import { 
  QUICK_BET_AMOUNTS,
  POKER_CONFIG,
  formatAmount,
  validateBet
} from '@/utils/pokerEngine'

interface PokerControlsProps {
  betAmount: number
  canBet: boolean
  isGameActive: boolean
  onBetAmountChange: (amount: number) => void
  onDeal: () => void
}

export default function PokerControls({
  betAmount,
  canBet,
  isGameActive,
  onBetAmountChange,
  onDeal
}: PokerControlsProps) {
  
  const handleQuickBet = (amount: number) => {
    if (!isGameActive) {
      onBetAmountChange(amount)
    }
  }
  
  const getDealButtonClasses = () => {
    let classes = 'w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3'
    
    if (!canBet || isGameActive) {
      classes += ' bg-slate-600 text-slate-400 cursor-not-allowed opacity-50'
    } else {
      classes += ' bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-emerald-600/25'
    }
    
    return classes
  }
  
  const getBetValidation = () => {
    const validation = validateBet(betAmount)
    return validation
  }
  
  const validation = getBetValidation()
  
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
            min={POKER_CONFIG.minBet}
            max={POKER_CONFIG.maxBet}
          />
          <div className="text-white">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>
        
        {/* Bet Limits */}
        <div className="mt-2 text-xs text-slate-400 text-center">
          Min: {POKER_CONFIG.minBet} | Max: {POKER_CONFIG.maxBet}
        </div>
        
        {/* Validation Error */}
        {!validation.isValid && (
          <div className="mt-2 text-xs text-red-400 text-center">
            {validation.error}
          </div>
        )}
      </div>
      
      {/* Game Info */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">How to Play</h4>
        <div className="text-sm text-slate-400 space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">1.</span>
            <span>Place your bet amount</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">2.</span>
            <span>Click "Deal Cards" to start</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">3.</span>
            <span>Watch as cards are dealt</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">4.</span>
            <span>Best 5-card hand wins</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">5.</span>
            <span>Win 2x your bet on victory</span>
          </div>
        </div>
      </div>
      
      {/* Payout Rules */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Payout Rules</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Win:</span>
            <span className="text-sm text-emerald-400 font-medium">2x Bet</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Tie:</span>
            <span className="text-sm text-yellow-400 font-medium">Push (Return Bet)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Lose:</span>
            <span className="text-sm text-red-400 font-medium">Lose Bet</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="text-xs text-slate-400">
            <div className="flex items-center justify-between mb-1">
              <span>House Edge:</span>
              <span>{(POKER_CONFIG.houseEdge * 100).toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Game Type:</span>
              <span>Heads-Up Texas Hold'em</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hand Rankings */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Hand Rankings</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-purple-400">Royal Flush</span>
            <span className="text-slate-400">A-K-Q-J-10 suited</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-purple-400">Straight Flush</span>
            <span className="text-slate-400">Five consecutive suited</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-purple-400">Four of a Kind</span>
            <span className="text-slate-400">Four same rank</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-purple-400">Full House</span>
            <span className="text-slate-400">Three + Pair</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-purple-400">Flush</span>
            <span className="text-slate-400">Five suited</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-purple-400">Straight</span>
            <span className="text-slate-400">Five consecutive</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-purple-400">Three of a Kind</span>
            <span className="text-slate-400">Three same rank</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-purple-400">Two Pair</span>
            <span className="text-slate-400">Two pairs</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-purple-400">Pair</span>
            <span className="text-slate-400">Two same rank</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-purple-400">High Card</span>
            <span className="text-slate-400">Highest card</span>
          </div>
        </div>
      </div>
      
      {/* Deal Button */}
      <Button
        onClick={onDeal}
        disabled={!canBet || isGameActive || !validation.isValid}
        className={getDealButtonClasses()}
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
      
      {/* Potential Winnings */}
      {betAmount > 0 && validation.isValid && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Potential Winnings</h4>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400">
              {formatAmount(betAmount * POKER_CONFIG.payoutMultiplier)}
            </div>
            <div className="text-sm text-slate-400 mt-1">
              If you win (2x multiplier)
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Risk/Reward:</span>
              <span className="text-white font-medium">Medium</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-slate-400">House Edge:</span>
              <span className="text-white font-medium">{(POKER_CONFIG.houseEdge * 100).toFixed(1)}%</span>
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
          <div>â Texas Hold'em uses community cards</div>
          <div>â Make the best 5-card hand from 7 cards</div>
          <div>â Position matters in real poker (not here)</div>
          <div>â Practice good bankroll management</div>
          <div>â House edge is 2% - fair odds</div>
        </div>
      </div>
    </div>
  )
}
