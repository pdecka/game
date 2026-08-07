'use client'

import { Button } from '@/components/ui/button'
import { Clock, DollarSign, TrendingUp, PlayCircle, X } from 'lucide-react'
import type { Bet } from '@/utils/rouletteMath'

interface RouletteControlsProps {
  gamePhase: 'betting' | 'spinning' | 'result' | 'resetting'
  countdown: number
  roundNumber: number
  bets: Bet[]
  betAmount: number
  totalBetAmount: number
  totalPayout: number
  canBet: boolean
  canSpin: boolean
  onBetAmountChange: (amount: number) => void
  onSpin: () => void
  onClearAllBets: () => void
  onRemoveBet: (betId: string) => void
}

export default function RouletteControls({
  gamePhase,
  countdown,
  roundNumber,
  bets,
  betAmount,
  totalBetAmount,
  totalPayout,
  canBet,
  canSpin,
  onBetAmountChange,
  onSpin,
  onClearAllBets,
  onRemoveBet
}: RouletteControlsProps) {
  const quickBetAmounts = [10, 25, 50, 100, 250, 500]
  
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  const getPhaseColor = () => {
    switch (gamePhase) {
      case 'betting': return 'text-emerald-400'
      case 'spinning': return 'text-yellow-400'
      case 'result': return 'text-blue-400'
      case 'resetting': return 'text-slate-400'
      default: return 'text-white'
    }
  }
  
  const getPhaseText = () => {
    switch (gamePhase) {
      case 'betting': return 'Betting Time'
      case 'spinning': return 'Spinning Wheel'
      case 'result': return 'Result'
      case 'resetting': return 'Preparing Next Round'
      default: return 'Unknown'
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Game Status */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Round #{roundNumber}</h3>
            <div className={`text-sm font-medium ${getPhaseColor()}`}>
              {getPhaseText()}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-white">
              <Clock className="h-4 w-4" />
              <span className="text-2xl font-bold">{formatCountdown(countdown)}</span>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-[#1a2c38] rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-1000 ${
              gamePhase === 'betting' ? 'bg-emerald-500' :
              gamePhase === 'spinning' ? 'bg-yellow-500' :
              gamePhase === 'result' ? 'bg-blue-500' :
              'bg-slate-500'
            }`}
            style={{ 
              width: gamePhase === 'betting' ? `${(countdown / 15) * 100}%` :
                      gamePhase === 'spinning' ? `${(countdown / 8) * 100}%` :
                      gamePhase === 'result' ? `${(countdown / 5) * 100}%` :
                      '100%'
            }}
          ></div>
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
              disabled={!canBet}
              className={`py-2 px-4 rounded-lg font-medium transition-all ${
                betAmount === amount 
                  ? 'bg-emerald-600 text-white border-emerald-700' 
                  : 'bg-[#1a2c38] hover:bg-[#2a3c48] text-white border-white/20'
              } ${!canBet ? 'opacity-50 cursor-not-allowed' : ''}`}
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
            disabled={!canBet}
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
      
      {/* Current Bets */}
      {bets.length > 0 && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">Current Bets</h4>
            <button
              onClick={onClearAllBets}
              disabled={!canBet}
              className={`px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-all ${!canBet ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Clear All
            </button>
          </div>
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {bets.map(bet => (
              <div key={bet.id} className="flex items-center justify-between p-2 bg-[#1a2c38] rounded-lg">
                <div className="text-white">
                  <div className="font-medium capitalize">{bet.type}</div>
                  {bet.numbers.length <= 3 && (
                    <div className="text-xs text-slate-400">
                      Numbers: {bet.numbers.join(', ')}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-emerald-400 font-medium">{bet.amount}</div>
                  <div className="text-slate-400 text-sm">({bet.payout}:1)</div>
                  {canBet && (
                    <button
                      onClick={() => onRemoveBet(bet.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Total Bet:</span>
              <span className="text-emerald-400 font-bold">{totalBetAmount}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Spin Button */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <Button
          onClick={onSpin}
          disabled={!canSpin}
          className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg py-4"
          size="lg"
        >
          {gamePhase === 'spinning' ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Spinning...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <PlayCircle className="h-5 w-5" />
              Spin Wheel
            </div>
          )}
        </Button>
        
        {!canSpin && bets.length === 0 && canBet && (
          <div className="mt-3 text-center text-slate-400 text-sm">
            Place bets to spin the wheel
          </div>
        )}
      </div>
      
      {/* Last Result */}
      {totalPayout > 0 && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-white">Last Payout</h4>
              <div className="text-sm text-slate-400">Round completed</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-400">{totalPayout}</div>
              <div className="text-sm text-slate-400">Win</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Game Info */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-3">How to Play</h4>
        <div className="text-sm text-slate-400 space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">1.</span>
            <span>Place your bets on numbers, colors, or groups</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">2.</span>
            <span>Wait for the betting timer to count down</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">3.</span>
            <span>Watch the wheel spin and ball land</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">4.</span>
            <span>Win if your bets match the result</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/10">
          <h5 className="text-sm font-medium text-white mb-2">Payouts</h5>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
            <div>Straight: 35:1</div>
            <div>Split: 17:1</div>
            <div>Street: 11:1</div>
            <div>Corner: 8:1</div>
            <div>Red/Black: 1:1</div>
            <div>Odd/Even: 1:1</div>
            <div>Dozens: 2:1</div>
            <div>Columns: 2:1</div>
          </div>
        </div>
      </div>
    </div>
  )
}
