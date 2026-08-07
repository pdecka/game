'use client'

import { useState, useEffect } from 'react'
import { useScratchGame, useScratchBetting } from '@/hooks/useScratchGame'
import ScratchCard from './ScratchCard'
import ScratchControls from './ScratchControls'
import ScratchHistory from './ScratchHistory'
import { CompactScratchControls } from './ScratchControls'
import { CompactScratchHistory } from './ScratchHistory'
import { CARD_THEMES } from '@/utils/scratchConfig'

export default function ScratchGame() {
  const [showHistory, setShowHistory] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState('gold')
  
  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Game hook
  const {
    gameState,
    currentResult,
    gameHistory,
    volatility,
    cardType,
    isScratching,
    scratchPercentage,
    canPlay,
    canScratch,
    totalPayout,
    totalProfit,
    playGame,
    startScratching,
    updateScratchProgress,
    revealAll,
    reset,
    setVolatility,
    setCardType,
    validateGame,
    getStatistics
  } = useScratchGame()
  
  // Betting hook
  const {
    betAmount,
    quickBetAmounts,
    setBetAmount,
    setQuickBet
  } = useScratchBetting()

  // Clear bets function
  const clearBets = () => {
    setBetAmount(10)
  }
  
  // Handle game play
  const handlePlay = () => {
    if (canPlay && betAmount > 0) {
      playGame(betAmount, volatility)
    }
  }
  
  // Handle scratch start
  const handleScratchStart = () => {
    if (gameState === 'generated') {
      startScratching()
    }
  }
  
  // Handle scratch progress
  const handleScratchProgress = (scratched: number, total: number) => {
    updateScratchProgress(scratched, total)
  }
  
  // Get game state text
  const getGameStateText = () => {
    switch (gameState) {
      case 'idle': return 'Ready to Play'
      case 'generated': return 'Card Generated - Start Scratching!'
      case 'scratching': return 'Scratching in Progress...'
      case 'revealed': return 'Revealing...'
      case 'result': return currentResult ? (currentResult.isWin ? 'You Win!' : 'Try Again') : 'Game Complete'
      default: return 'Ready to Play'
    }
  }
  
  const getGameStateColor = () => {
    switch (gameState) {
      case 'idle': return 'text-blue-400'
      case 'generated': return 'text-orange-400'
      case 'scratching': return 'text-purple-400'
      case 'revealed': return 'text-emerald-400'
      case 'result': return currentResult?.isWin ? 'text-emerald-400' : 'text-red-400'
      default: return 'text-slate-400'
    }
  }
  
  const getResultEmoji = () => {
    if (!currentResult) return ''
    if (!currentResult.isWin) return 'â'
    if (currentResult.cardType === 'jackpot') return 'ð'
    if (currentResult.cardType === 'multiplier') return 'â'
    return 'ð'
  }
  
  // Get current theme
  const currentTheme = CARD_THEMES.find(theme => theme.id === selectedTheme) || CARD_THEMES[0]
  
  // Auto-reveal logic
  useEffect(() => {
    if (gameState === 'generated' && !isScratching) {
      const timer = setTimeout(() => {
        revealAll()
      }, 5000) // Auto-reveal after 5 seconds
      
      return () => clearTimeout(timer)
    }
  }, [gameState, isScratching, revealAll])
  
  // Reset game after result
  useEffect(() => {
    if (gameState === 'result') {
      const timer = setTimeout(() => {
        reset()
      }, 3000) // Auto-reset after 3 seconds
      
      return () => clearTimeout(timer)
    }
  }, [gameState, reset])
  
  return (
    <div className="min-h-screen bg-[#0f212e] text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Scratch Card</h1>
          <p className="text-slate-400">Instant Win Game - Match 3 Symbols to Win!</p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <div className={`text-sm font-medium ${getGameStateColor()}`}>
              {getGameStateText()}
            </div>
            {currentResult && (
              <span className="text-2xl">{getResultEmoji()}</span>
            )}
            {isScratching && (
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {gameState !== 'idle' && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Scratch Progress</span>
              <span className="text-sm text-emerald-400">{Math.round(scratchPercentage)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${scratchPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Desktop Layout */}
        {!isMobile ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Controls */}
            <div className="lg:col-span-1">
              <ScratchControls
                betAmount={betAmount}
                volatility={volatility}
                cardType={cardType}
                canPlay={canPlay}
                isScratching={isScratching}
                gameState={gameState}
                onBetAmountChange={setBetAmount}
                onVolatilityChange={setVolatility}
                onCardTypeChange={setCardType}
                onPlay={handlePlay}
                onQuickBet={setQuickBet}
                quickBetAmounts={quickBetAmounts}
                clearBets={clearBets}
                              />
            </div>

            {/* Right Column - Card and History */}
            <div className="lg:col-span-2 space-y-6">
              {/* Scratch Card */}
              <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 text-center">Scratch Card</h3>
                
                {/* Theme Selector */}
                <div className="flex justify-center gap-2 mb-4">
                  {CARD_THEMES.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        selectedTheme === theme.id 
                          ? `${theme.bgColor} ${theme.borderColor} text-white` 
                          : 'bg-[#1a2c38] hover:bg-[#2a3c48] text-white border border-white/20'
                      }`}
                    >
                      {theme.name}
                    </button>
                  ))}
                </div>
                
                {/* Scratch Card */}
                <div className="flex justify-center">
                  <div 
                    className={`
                      relative rounded-lg
                      ${currentTheme.bgColor}
                      ${currentTheme.borderColor}
                      border-2
                      shadow-2xl
                    `}
                  >
                    <ScratchCard
                      result={currentResult}
                      isScratching={isScratching}
                      scratchPercentage={scratchPercentage}
                      onScratchProgress={handleScratchProgress}
                      onScratchComplete={revealAll}
                      onRevealAll={revealAll}
                      width={300}
                      height={200}
                      cardType={cardType}
                      theme={selectedTheme}
                      disabled={!canScratch}
                      showParticles={true}
                    />
                  </div>
                </div>
                
                {/* Card Actions */}
                {gameState === 'generated' && (
                  <div className="flex justify-center mt-4 gap-2">
                    <button
                      onClick={handleScratchStart}
                      className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all"
                    >
                      Start Scratching
                    </button>
                    <button
                      onClick={revealAll}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
                    >
                      Reveal All
                    </button>
                  </div>
                )}
                
                {/* Result Display */}
                {currentResult && gameState === 'result' && (
                  <div className="mt-4 p-4 bg-[#1a2c38] rounded-lg border border-white/10">
                    <div className="text-center">
                      <div className={`text-2xl font-bold mb-2 ${currentResult.isWin ? 'text-emerald-400' : 'text-red-400'}`}>
                        {currentResult.isWin ? 'You Win!' : 'Try Again'}
                      </div>
                      <div className="text-lg text-white mb-2">
                        {currentResult.multiplier}x Multiplier
                      </div>
                      <div className="text-sm text-slate-400 mb-2">
                        Bet: {betAmount} | Payout: {currentResult.totalPayout.toFixed(2)}
                      </div>
                      <div className={`text-lg font-bold ${currentResult.totalPayout - betAmount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {currentResult.totalPayout - betAmount >= 0 ? '+' : ''}{(currentResult.totalPayout - betAmount).toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* History Toggle */}
              <div className="flex justify-center">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="px-6 py-2 bg-[#1a2c38] hover:bg-[#2a3c48] border border-white/20 rounded-lg text-white transition-all duration-200"
                >
                  {showHistory ? 'Hide' : 'Show'} History
                </button>
              </div>

              {/* History Section */}
              {showHistory && (
                <ScratchHistory
                  history={gameHistory}
                  currentResult={currentResult}
                />
              )}
            </div>
          </div>
        ) : (
          /* Mobile Layout - Stacked */
          <div className="space-y-6">
            {/* Scratch Card */}
            <div className="bg-[#0f212e] rounded-lg border border-white/10 p-4">
              <h3 className="text-lg font-semibold text-white mb-4 text-center">Scratch Card</h3>
              
              {/* Theme Selector */}
              <div className="flex justify-center gap-2 mb-4">
                {CARD_THEMES.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                      selectedTheme === theme.id 
                        ? `${theme.bgColor} ${theme.borderColor} text-white` 
                        : 'bg-[#1a2c38] hover:bg-[#2a3c48] text-white border border-white/20'
                    }`}
                  >
                    {theme.name}
                  </button>
                ))}
              </div>
              
              {/* Scratch Card */}
              <div className="flex justify-center">
                <div 
                  className={`
                    relative rounded-lg
                    ${currentTheme.bgColor}
                    ${currentTheme.borderColor}
                    border-2
                    shadow-2xl
                  `}
                >
                  <ScratchCard
                    result={currentResult}
                    isScratching={isScratching}
                    scratchPercentage={scratchPercentage}
                    onScratchProgress={handleScratchProgress}
                    onScratchComplete={revealAll}
                    onRevealAll={revealAll}
                    width={250}
                    height={170}
                    cardType={cardType}
                    theme={selectedTheme}
                    disabled={!canScratch}
                    showParticles={true}
                  />
                </div>
              </div>
              
              {/* Card Actions */}
              {gameState === 'generated' && (
                <div className="flex justify-center mt-4 gap-2">
                  <button
                    onClick={handleScratchStart}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all text-sm"
                  >
                    Start
                  </button>
                  <button
                    onClick={revealAll}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all text-sm"
                  >
                    Reveal
                  </button>
                </div>
              )}
              
              {/* Result Display */}
              {currentResult && gameState === 'result' && (
                <div className="mt-4 p-3 bg-[#1a2c38] rounded-lg border border-white/10">
                  <div className="text-center">
                    <div className={`text-lg font-bold mb-1 ${currentResult.isWin ? 'text-emerald-400' : 'text-red-400'}`}>
                      {currentResult.isWin ? 'Win!' : 'Try Again'}
                    </div>
                    <div className="text-sm text-white mb-1">
                      {currentResult.multiplier}x
                    </div>
                    <div className={`text-sm font-bold ${currentResult.totalPayout - betAmount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {currentResult.totalPayout - betAmount >= 0 ? '+' : ''}{(currentResult.totalPayout - betAmount).toFixed(2)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <CompactScratchControls
              betAmount={betAmount}
              volatility={volatility}
              cardType={cardType}
              canPlay={canPlay}
              isScratching={isScratching}
              gameState={gameState}
              onBetAmountChange={setBetAmount}
              onVolatilityChange={setVolatility}
              onCardTypeChange={setCardType}
              onPlay={handlePlay}
              onQuickBet={setQuickBet}
              quickBetAmounts={quickBetAmounts}
                clearBets={clearBets}
                          />

            {/* History Toggle */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="px-6 py-2 bg-[#1a2c38] hover:bg-[#2a3c48] border border-white/20 rounded-lg text-white transition-all duration-200"
              >
                {showHistory ? 'Hide' : 'Show'} History
              </button>
            </div>

            {/* History Section */}
            {showHistory && (
              <CompactScratchHistory
                history={gameHistory}
                currentResult={currentResult}
              />
            )}
          </div>
        )}

        {/* Game Status Bar */}
        <div className="fixed bottom-4 left-4 right-4 bg-[#0f212e] rounded-lg border border-white/10 p-4 max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                gameState === 'idle' ? 'bg-blue-400' : 
                gameState === 'generated' ? 'bg-orange-400' : 
                gameState === 'scratching' ? 'bg-purple-400 animate-pulse' : 
                gameState === 'revealed' ? 'bg-emerald-400' : 
                'bg-slate-400'
              }`}></div>
              <div className="text-sm text-white">
                {getGameStateText()}
              </div>
            </div>
            
            {currentResult && (
              <div className="text-sm text-slate-400">
                {currentResult.multiplier}x
              </div>
            )}
            
            {isScratching && (
              <div className="text-sm text-slate-400">
                {Math.round(scratchPercentage)}%
              </div>
            )}
          </div>
          
          {/* Progress Bar */}
          {gameState !== 'idle' && (
            <div className="mt-2">
              <div className="w-full bg-slate-700 rounded-full h-1">
                <div 
                  className="bg-emerald-500 h-1 rounded-full transition-all duration-500"
                  style={{ width: `${scratchPercentage}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Game Result Overlay */}
        {currentResult && gameState === 'result' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#0f212e] rounded-lg border border-white/20 p-8 max-w-md mx-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">
                  {currentResult.isWin ? 'You Win!' : 'Try Again'}
                </h2>
                
                <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold ${
                  currentResult.isWin ? 'bg-emerald-600 text-white' : 
                  'bg-red-600 text-white'
                }`}>
                  {getResultEmoji()}
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="text-slate-400">Multiplier:</div>
                  <div className="text-lg font-bold text-white">
                    {currentResult.multiplier}x
                  </div>
                  <div className="text-slate-400">Card Type:</div>
                  <div className="text-lg font-bold text-white">
                    {currentResult.cardType}
                  </div>
                  <div className="text-slate-400">Volatility:</div>
                  <div className="text-lg font-bold text-white">
                    {currentResult.volatility}
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className={`text-2xl font-bold ${currentResult.isWin ? 'text-emerald-400' : 'text-red-400'}`}>
                    {currentResult.isWin ? 'WIN!' : 'LOSS'}
                  </div>
                  <div className="text-white">
                    {currentResult.totalPayout - betAmount >= 0 ? '+' : ''}{(currentResult.totalPayout - betAmount).toFixed(2)}
                  </div>
                  <div className="text-sm text-slate-400">
                    Payout: {currentResult.totalPayout.toFixed(2)}
                  </div>
                  <div className="text-sm text-slate-400">
                    Total Bet: {betAmount}
                  </div>
                </div>
                
                <div className="mt-4 text-xs text-slate-400">
                  Game ID: #{currentResult.id.slice(-8).toUpperCase()}
                </div>
                
                <button
                  onClick={() => setShowHistory(false)}
                  className="mt-6 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-200"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
