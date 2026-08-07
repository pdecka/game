'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DollarSign, PlayCircle, Info, BarChart, Shield, TrendingUp, Zap, Plus, Minus } from 'lucide-react'

interface BlackjackControlsProps {
  betAmount: number
  canStartGame: boolean
  canHit: boolean
  canStand: boolean
  canDouble: boolean
  canSplit: boolean
  canTakeInsurance: boolean
  isGameActive: boolean
  gameState: string
  onBetAmountChange: (amount: number) => void
  onStartGame: () => void
  onHit: () => void
  onStand: () => void
  onDouble: () => void
  onSplit: () => void
  onInsurance: () => void
  onQuickBet: (amount: number) => void
  quickBetAmounts: number[]
}

export default function BlackjackControls({
  betAmount,
  canStartGame,
  canHit,
  canStand,
  canDouble,
  canSplit,
  canTakeInsurance,
  isGameActive,
  gameState,
  onBetAmountChange,
  onStartGame,
  onHit,
  onStand,
  onDouble,
  onSplit,
  onInsurance,
  onQuickBet,
  quickBetAmounts
}: BlackjackControlsProps) {
  
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
      case 'betting': return 'Place Your Bet'
      case 'dealing': return 'Dealing Cards'
      case 'playerTurn': return 'Your Turn'
      case 'dealerTurn': return 'Dealer Turn'
      case 'result': return 'Game Complete'
      default: return 'Ready to Play'
    }
  }
  
  const getGameStateColor = () => {
    switch (gameState) {
      case 'betting': return 'text-blue-400'
      case 'dealing': return 'text-orange-400'
      case 'playerTurn': return 'text-emerald-400'
      case 'dealerTurn': return 'text-purple-400'
      case 'result': return 'text-red-400'
      default: return 'text-slate-400'
    }
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
        
        {/* Player Actions */}
        {gameState === 'playerTurn' && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={onHit}
                disabled={!canHit}
                className="py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all"
              >
                Hit
              </Button>
              <Button
                onClick={onStand}
                disabled={!canStand}
                className="py-3 px-4 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all"
              >
                Stand
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={onDouble}
                disabled={!canDouble}
                className="py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all"
              >
                Double
              </Button>
              <Button
                onClick={onSplit}
                disabled={!canSplit}
                className="py-3 px-4 bg-pink-600 hover:bg-pink-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all"
              >
                Split
              </Button>
            </div>
            
            {/* Insurance */}
            {canTakeInsurance && (
              <div className="mt-3">
                <Button
                  onClick={onInsurance}
                  className="w-full py-3 px-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-all"
                >
                  Take Insurance (50% of bet)
                </Button>
              </div>
            )}
          </div>
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
            {betAmount > 0 && (
              <div className="text-sm text-slate-400">
                Bet: {betAmount}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Action Availability */}
      {gameState === 'playerTurn' && (
        <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
          <h4 className="text-sm font-semibold text-white mb-3">Available Actions</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`flex items-center gap-2 ${
              canHit ? 'text-emerald-400' : 'text-slate-600'
            }`}>
              <div className={`w-2 h-2 rounded-full ${canHit ? 'bg-emerald-400' : 'bg-slate-600'}`}></div>
              <span>Hit</span>
            </div>
            <div className={`flex items-center gap-2 ${
              canStand ? 'text-emerald-400' : 'text-slate-600'
            }`}>
              <div className={`w-2 h-2 rounded-full ${canStand ? 'bg-emerald-400' : 'bg-slate-600'}`}></div>
              <span>Stand</span>
            </div>
            <div className={`flex items-center gap-2 ${
              canDouble ? 'text-emerald-400' : 'text-slate-600'
            }`}>
              <div className={`w-2 h-2 rounded-full ${canDouble ? 'bg-emerald-400' : 'bg-slate-600'}`}></div>
              <span>Double</span>
            </div>
            <div className={`flex items-center gap-2 ${
              canSplit ? 'text-emerald-400' : 'text-slate-600'
            }`}>
              <div className={`w-2 h-2 rounded-full ${canSplit ? 'bg-emerald-400' : 'bg-slate-600'}`}></div>
              <span>Split</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Game Rules */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Game Rules</h4>
        <div className="text-sm text-slate-400 space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">â</span>
            <span>Get as close to 21 as possible without going over</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">â</span>
            <span>Face cards (J, Q, K) = 10, Ace = 1 or 11</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">â</span>
            <span>Dealer must hit on 16 or less, stand on 17+</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">â</span>
            <span>Blackjack (Ace + 10-value) pays 3:2</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">â</span>
            <span>Regular win pays 1:1, push returns bet</span>
          </div>
        </div>
      </div>
      
      {/* Action Descriptions */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Action Guide</h4>
        <div className="space-y-3 text-sm">
          <div>
            <div className="font-medium text-blue-400 mb-1">Hit</div>
            <div className="text-slate-400">Draw another card</div>
          </div>
          <div>
            <div className="font-medium text-orange-400 mb-1">Stand</div>
            <div className="text-slate-400">Keep current hand and end turn</div>
          </div>
          <div>
            <div className="font-medium text-purple-400 mb-1">Double</div>
            <div className="text-slate-400">Double bet, draw one card, then stand</div>
          </div>
          <div>
            <div className="font-medium text-pink-400 mb-1">Split</div>
            <div className="text-slate-400">Split pair into two separate hands</div>
          </div>
          <div>
            <div className="font-medium text-yellow-400 mb-1">Insurance</div>
            <div className="text-slate-400">Bet against dealer's Blackjack (2:1)</div>
          </div>
        </div>
      </div>
      
      {/* Strategy Tips */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">
          <Info className="h-4 w-4 inline mr-2" />
          Basic Strategy Tips
        </h4>
        <div className="text-sm text-slate-400 space-y-2">
          <div>â Always hit on 11 or less</div>
          <div>â Stand on 17 or more (unless soft)</div>
          <div>â Double on 11 against dealer 2-10</div>
          <div>â Split Aces and 8s</div>
          <div>â Never split 10s or face cards</div>
          <div>â Take insurance only when counting cards</div>
        </div>
      </div>
      
      {/* House Rules */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">House Rules</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-slate-400">Decks:</div>
            <div className="text-white font-medium">6</div>
          </div>
          <div>
            <div className="text-slate-400">Hit on Soft 17:</div>
            <div className="text-white font-medium">No</div>
          </div>
          <div>
            <div className="text-slate-400">Blackjack Payout:</div>
            <div className="text-white font-medium">3:2</div>
          </div>
          <div>
            <div className="text-slate-400">Insurance:</div>
            <div className="text-white font-medium">2:1</div>
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
export function CompactBlackjackControls({
  betAmount,
  canStartGame,
  canHit,
  canStand,
  canDouble,
  canSplit,
  canTakeInsurance,
  isGameActive,
  gameState,
  onBetAmountChange,
  onStartGame,
  onHit,
  onStand,
  onDouble,
  onSplit,
  onInsurance,
  onQuickBet,
  quickBetAmounts
}: BlackjackControlsProps) {
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
      
      {/* Game Actions */}
      <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
        <Button
          onClick={onStartGame}
          disabled={!canStartGame || isGameActive}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-bold"
        >
          {isGameActive ? 'Playing...' : 'Deal Cards'}
        </Button>
        
        {/* Player Actions */}
        {gameState === 'playerTurn' && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button
              onClick={onHit}
              disabled={!canHit}
              className="py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium"
            >
              Hit
            </Button>
            <Button
              onClick={onStand}
              disabled={!canStand}
              className="py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium"
            >
              Stand
            </Button>
            <Button
              onClick={onDouble}
              disabled={!canDouble}
              className="py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium"
            >
              Double
            </Button>
            <Button
              onClick={onSplit}
              disabled={!canSplit}
              className="py-2 bg-pink-600 hover:bg-pink-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium"
            >
              Split
            </Button>
          </div>
        )}
        
        {/* Insurance */}
        {canTakeInsurance && (
          <Button
            onClick={onInsurance}
            className="w-full mt-2 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium"
          >
            Insurance
          </Button>
        )}
      </div>
    </div>
  )
}
