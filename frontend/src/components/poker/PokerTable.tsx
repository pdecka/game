'use client'

import { useState, useEffect } from 'react'
import PokerCards, { CommunityCards } from './PokerCards'
import { 
  getGameStateText,
  getGameStateColor,
  getGameProgress,
  type GameState,
  type PokerResult
} from '@/utils/pokerEngine'
import { 
  formatHandEvaluation,
  getHandStrengthColor,
  type HandEvaluation
} from '@/utils/pokerHands'

interface PokerTableProps {
  gameState: GameState
  playerCards: any[]
  dealerCards: any[]
  communityCards: any[]
  currentResult: PokerResult | null
  gameProgress: number
  isGameActive: boolean
  canShowCards: boolean
}

export default function PokerTable({
  gameState,
  playerCards,
  dealerCards,
  communityCards,
  currentResult,
  gameProgress,
  isGameActive,
  canShowCards
}: PokerTableProps) {
  const [showDealerCards, setShowDealerCards] = useState(false)
  const [animatedProgress, setAnimatedProgress] = useState(0)
  
  useEffect(() => {
    setAnimatedProgress(gameProgress)
  }, [gameProgress])
  
  useEffect(() => {
    setShowDealerCards(canShowCards)
  }, [canShowCards])
  
  const getTableBackground = () => {
    return 'bg-gradient-to-br from-green-800 via-green-700 to-green-900'
  }
  
  const getStageInfo = () => {
    const stages = {
      'idle': { name: 'Ready to Deal', description: 'Place your bet to start' },
      'dealing': { name: 'Dealing Cards', description: 'Cards are being dealt' },
      'flop': { name: 'The Flop', description: 'First three community cards' },
      'turn': { name: 'The Turn', description: 'Fourth community card' },
      'river': { name: 'The River', description: 'Final community card' },
      'showdown': { name: 'Showdown', description: 'Revealing hands' },
      'result': { name: 'Game Complete', description: 'Round finished' }
    }
    
    return stages[gameState] || stages['idle']
  }
  
  const stageInfo = getStageInfo()
  
  return (
    <div className="relative">
      {/* Main Table */}
      <div className={`
        ${getTableBackground()} 
        rounded-2xl 
        border-4 
        border-amber-900 
        shadow-2xl 
        p-8 
        relative 
        overflow-hidden
      `}>
        {/* Table Texture Overlay */}
        <div className="absolute inset-0 bg-green-900/20 rounded-2xl"></div>
        
        {/* Table Content */}
        <div className="relative z-10">
          {/* Dealer Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="text-sm font-medium text-amber-200 mb-2">Dealer</div>
            <PokerCards
              cards={dealerCards}
              hidden={!showDealerCards}
              showCards={showDealerCards}
              isDealer={true}
            />
            
            {/* Dealer Hand Evaluation */}
            {currentResult && showDealerCards && (
              <div className="mt-4 px-4 py-2 bg-black/50 rounded-lg">
                <div className="text-center">
                  <div className="text-xs text-amber-200">
                    {currentResult.dealerHand.description}
                  </div>
                  <div className={`text-sm font-bold ${getHandStrengthColor(formatHandEvaluation(currentResult.dealerHand).strength)}`}>
                    {formatHandEvaluation(currentResult.dealerHand).description}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Community Cards Section */}
          <div className="flex justify-center mb-8">
            <CommunityCards
              cards={communityCards}
              stage={gameState === 'flop' ? 'flop' : 
                     gameState === 'turn' ? 'turn' : 
                     gameState === 'river' || gameState === 'showdown' || gameState === 'result' ? 'river' : 'flop'}
            />
          </div>
          
          {/* Player Section */}
          <div className="flex flex-col items-center">
            <div className="text-sm font-medium text-amber-200 mb-2">Player</div>
            <PokerCards
              cards={playerCards}
              hidden={false}
              showCards={true}
              isDealer={false}
            />
            
            {/* Player Hand Evaluation */}
            {currentResult && communityCards.length >= 3 && (
              <div className="mt-4 px-4 py-2 bg-black/50 rounded-lg">
                <div className="text-center">
                  <div className="text-xs text-amber-200">
                    {currentResult.playerHand.description}
                  </div>
                  <div className={`text-sm font-bold ${getHandStrengthColor(formatHandEvaluation(currentResult.playerHand).strength)}`}>
                    {formatHandEvaluation(currentResult.playerHand).description}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Table Edge Highlight */}
        <div className="absolute inset-0 rounded-2xl border-2 border-amber-700/50 pointer-events-none"></div>
      </div>
      
      {/* Game Status Bar */}
      <div className="mt-6 bg-[#0f212e] rounded-lg border border-white/10 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className={`text-sm font-medium ${getGameStateColor(gameState)}`}>
              {stageInfo.name}
            </div>
            <div className="text-xs text-slate-400">
              {stageInfo.description}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-xs text-slate-400">Progress:</div>
            <div className="w-32 bg-slate-700 rounded-full h-2">
              <div 
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${animatedProgress}%` }}
              ></div>
            </div>
            <div className="text-xs text-emerald-400">
              {animatedProgress}%
            </div>
          </div>
        </div>
        
        {/* Result Display */}
        {currentResult && gameState === 'result' && (
          <div className="mt-4 p-4 bg-slate-800 rounded-lg">
            <div className="text-center">
              <div className={`text-2xl font-bold mb-2 ${
                currentResult.winner === 'player' ? 'text-emerald-400' : 
                currentResult.winner === 'dealer' ? 'text-red-400' : 
                'text-yellow-400'
              }`}>
                {currentResult.winner === 'player' ? 'You Win!' : 
                 currentResult.winner === 'dealer' ? 'Dealer Wins' : 
                 'Push (Tie)'}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-slate-400">Your Hand:</div>
                  <div className="text-white font-medium">
                    {currentResult.playerHand.description}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Dealer Hand:</div>
                  <div className="text-white font-medium">
                    {currentResult.dealerHand.description}
                  </div>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-slate-700">
                <div className="flex items-center justify-center gap-4">
                  <div className="text-slate-400">Payout:</div>
                  <div className={`text-lg font-bold ${
                    currentResult.profit >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {currentResult.profit >= 0 ? '+' : ''}
                    {currentResult.profit.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Table Decorations */}
      <div className="absolute top-4 left-4 w-8 h-8 bg-amber-800 rounded-full opacity-50"></div>
      <div className="absolute top-4 right-4 w-8 h-8 bg-amber-800 rounded-full opacity-50"></div>
      <div className="absolute bottom-4 left-4 w-8 h-8 bg-amber-800 rounded-full opacity-50"></div>
      <div className="absolute bottom-4 right-4 w-8 h-8 bg-amber-800 rounded-full opacity-50"></div>
      
      {/* Chip Stack Animation */}
      {isGameActive && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-12 h-12 bg-amber-600 rounded-full border-2 border-amber-700 shadow-lg animate-bounce"></div>
        </div>
      )}
    </div>
  )
}
