'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Navbar } from '@/components/layout/Navbar'
import { WalletModal } from '@/components/layout/WalletModal'
import { SearchOverlay } from '@/components/layout/SearchOverlay'
import { useAuth } from '@/context/AuthContext'
import MinesGrid from '@/components/game/MinesGrid'
import GameControls from '@/components/game/GameControls'
import HistoryTable, { dummyHistory } from '@/components/game/HistoryTable'
import SponsorsSection from '@/components/game/SponsorsSection'
import { useMinesGame } from '@/components/game/useMinesGame'
import ProvablyFairModal from '@/components/game/ProvablyFairModal'
import { Button } from '@/components/ui/button'
import { Shield, RefreshCw, Trophy, MessageSquare, Phone, Facebook, Twitter, Instagram, Youtube, Send, Globe, ChevronUp } from 'lucide-react'

export default function MinesPage() {
  const { user, wallet, walletLoading, refreshWallet } = useAuth() as any
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [isWalletOpen, setIsWalletOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showBetslip, setShowBetslip] = useState(false)
  const [walletBalance] = useState(5000) // Dummy balance
  const [selectedLanguage, setSelectedLanguage] = useState('English')
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false)
  const [showProvablyFair, setShowProvablyFair] = useState(false)
  
  const walletLabel =
    walletLoading || !wallet?.INR ? '₹0.00' : `₹${Number(wallet.INR).toFixed(2)}`

  const {
    gameState,
    betAmount,
    setBetAmount,
    minesCount,
    setMinesCount,
    gameData,
    startGame,
    handleTileClick,
    cashout,
    randomPick,
    resetGame,
    loading,
    error
  } = useMinesGame()

  const handleBet = async () => {
    const success = await startGame()
    if (success) {
      // Refresh wallet balance after successful bet
      refreshWallet()
    }
  }

  const handleCashout = async () => {
    await cashout()
    // Refresh wallet balance after cashout
    refreshWallet()
  }

  // Refresh wallet when a round ends (e.g. a mine was hit).
  useEffect(() => {
    if (gameState === 'lost' || gameState === 'cashed_out') {
      refreshWallet()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState])

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setMobileNavOpen((prev) => !prev)
      return
    }
    setSidebarCollapsed((prev) => !prev)
  }

  return (
    <main className="flex h-screen overflow-hidden bg-gradient-to-br from-[#0f212e] to-[#1a2c38] text-slate-100">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar
          onToggleSidebar={handleToggleSidebar}
          onOpenWallet={() => setIsWalletOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onToggleNotifications={() => setShowNotifications((v) => !v)}
          onToggleChat={() => setShowChat((v) => !v)}
          onToggleBetslip={() => setShowBetslip((v) => !v)}
          showNotifications={showNotifications}
          showChat={showChat}
          showBetslip={showBetslip}
        />

        <div className="flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-4">
          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Game Area */}
          <div className="space-y-6 mb-8">
            {/* Mobile: Controls First */}
            <div className="lg:hidden">
              <GameControls
                gameState={gameState}
                betAmount={betAmount}
                minesCount={minesCount}
                currentMultiplier={gameData.currentMultiplier}
                potentialWin={gameData.potentialWin}
                revealedCount={gameData.revealedCount}
                onBetAmountChange={setBetAmount}
                onMinesChange={setMinesCount}
                onBet={handleBet}
                onCashout={handleCashout}
                onRandomPick={randomPick}
                disabled={gameState === 'playing'}
                loading={loading}
              />
            </div>

            {/* Desktop: Side by side */}
            <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6">
              {/* Left Panel - Controls */}
              <div className="lg:col-span-1">
                <GameControls
                  gameState={gameState}
                  betAmount={betAmount}
                  minesCount={minesCount}
                  currentMultiplier={gameData.currentMultiplier}
                  potentialWin={gameData.potentialWin}
                  revealedCount={gameData.revealedCount}
                  onBetAmountChange={setBetAmount}
                  onMinesChange={setMinesCount}
                  onBet={handleBet}
                  onCashout={handleCashout}
                  onRandomPick={randomPick}
                  disabled={gameState === 'playing'}
                />
              </div>

              {/* Right Panel - Game Grid */}
              <div className="lg:col-span-2">
                <MinesGrid
                  gameState={gameState}
                  revealedTiles={gameData.revealedTiles}
                  minePositions={gameData.minePositions}
                  onTileClick={handleTileClick}
                  disabled={gameState !== 'playing'}
                />
              </div>
            </div>

            {/* Mobile: Game Grid */}
            <div className="lg:hidden">
              <MinesGrid
                gameState={gameState}
                revealedTiles={gameData.revealedTiles}
                minePositions={gameData.minePositions}
                onTileClick={handleTileClick}
                disabled={gameState !== 'playing'}
              />
            </div>
          </div>

          {/* Post Game Section */}
          <div className="space-y-8">
            {/* Action Buttons */}
            <div className="p-6 bg-[#0f212e] rounded-lg border border-white/10">
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white min-w-[120px]"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  New Game
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white min-w-[120px]"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Leaderboard
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white min-w-[120px]"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Statistics
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white min-w-[120px]"
                  onClick={() => setShowProvablyFair(true)}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Fairness
                </Button>
              </div>
            </div>

            {/* History Table */}
            <HistoryTable history={dummyHistory} />
          </div>
        </div>

        {/* Provably Fair Modal */}
        <ProvablyFairModal
          isOpen={showProvablyFair}
          onClose={() => setShowProvablyFair(false)}
          sessionId={gameData.sessionId}
          gameCompleted={gameState === 'lost' || gameState === 'cashed_out'}
          serverSeedHash={gameData.serverSeedHash}
          clientSeed={gameData.clientSeed}
          nonce={gameData.nonce}
          algorithmVersion={gameData.algorithmVersion}
        />

        {/* Footer - From Main Page */}
        <footer className="bg-[#0f212e] border-t border-white/10">
            {/* First Row - 6 Columns */}
            <div className="w-full py-12 px-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-8 max-w-7xl mx-auto">
                {/* Column 1 - Casino */}
                <div>
                  <h3 className="text-white font-bold text-lg mb-4">Casino</h3>
                  <ul className="space-y-2">
                    {['Casino Games', 'Slots', 'Live Casino', 'Roulette', 'Blackjack', 'Poker', 'Publishers', 'Promos & Competitions', 'Stake Engine', 'Stake Vendors'].map((link) => (
                      <li key={link}>
                        <button className="text-slate-400 hover:text-white hover:translate-x-1 duration-200 text-sm cursor-pointer transition-all">
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 2 - Sports */}
                <div>
                  <h3 className="text-white font-bold text-lg mb-4">Sports</h3>
                  <ul className="space-y-2">
                    {['Sportsbook', 'Live Sports', 'Soccer', 'Basketball', 'Tennis', 'eSports', 'Bet Bonuses', 'Sports Rules', 'Racing Rules'].map((link) => (
                      <li key={link}>
                        <button className="text-slate-400 hover:text-white hover:translate-x-1 duration-200 text-sm cursor-pointer transition-all">
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 3 - Support */}
                <div>
                  <h3 className="text-white font-bold text-lg mb-4">Support</h3>
                  <ul className="space-y-2">
                    {['Help Center', 'Fairness', 'Responsible Gambling', 'Gambling Helpline', 'Live Support', 'Self Exclusion', 'Law Enforcement Request'].map((link) => (
                      <li key={link}>
                        <button className="text-slate-400 hover:text-white hover:translate-x-1 duration-200 text-sm cursor-pointer transition-all">
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 4 - About Us */}
                <div>
                  <h3 className="text-white font-bold text-lg mb-4">About Us</h3>
                  <ul className="space-y-2">
                    {['VIP Club', 'Affiliate', 'Privacy Policy', 'AML Policy', 'Terms of Service'].map((link) => (
                      <li key={link}>
                        <button className="text-slate-400 hover:text-white hover:translate-x-1 duration-200 text-sm cursor-pointer transition-all">
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 5 - Payment Info */}
                <div>
                  <h3 className="text-white font-bold text-lg mb-4">Payment Info</h3>
                  <ul className="space-y-2">
                    {['Deposit & Withdrawals', 'Currency Guide', 'Crypto Guide', 'Supported Crypto', 'How to Use Vault', 'How Much to Bet With'].map((link) => (
                      <li key={link}>
                        <button className="text-slate-400 hover:text-white hover:translate-x-1 duration-200 text-sm cursor-pointer transition-all">
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 6 - FAQ */}
                <div>
                  <h3 className="text-white font-bold text-lg mb-4">FAQ</h3>
                  <ul className="space-y-2">
                    {['How-to Guides', 'Online Casino Guide', 'Sports Betting Guide', 'How to Live Stream Sports', 'Stake VIP Guide', 'House Edge Guide'].map((link) => (
                      <li key={link}>
                        <button className="text-slate-400 hover:text-white hover:translate-x-1 duration-200 text-sm cursor-pointer transition-all">
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Second Row - Social Icons */}
              <div className="px-4 pb-8">
                <div className="flex justify-center items-center gap-6 flex-wrap">
                  <MessageSquare className="w-6 h-6 text-slate-400 hover:text-white hover:scale-110 transition-all cursor-pointer" />
                  <Phone className="w-6 h-6 text-slate-400 hover:text-white hover:scale-110 transition-all cursor-pointer" />
                  <Facebook className="w-6 h-6 text-slate-400 hover:text-white hover:scale-110 transition-all cursor-pointer" />
                  <Twitter className="w-6 h-6 text-slate-400 hover:text-white hover:scale-110 transition-all cursor-pointer" />
                  <Instagram className="w-6 h-6 text-slate-400 hover:text-white hover:scale-110 transition-all cursor-pointer" />
                  <Youtube className="w-6 h-6 text-slate-400 hover:text-white hover:scale-110 transition-all cursor-pointer" />
                  <Send className="w-6 h-6 text-slate-400 hover:text-white hover:scale-110 transition-all cursor-pointer" />
                </div>
              </div>

              {/* Third Row - Divider */}
              <div className="border-t border-white/10"></div>

              {/* Fourth Row - Copyright */}
              <div className="px-4 py-6">
                <p className="text-slate-400 text-sm text-center">
                  © 2026 Stake.com | All Rights Reserved.
                </p>
              </div>

              {/* Fifth Row - Legal / Company Info */}
              <div className="px-4 pb-6">
                <div className="text-slate-400 text-sm leading-7 space-y-2">
                  <p>Stake is owned and operated by Medium Rare N.V., registration number: 145353, registered address: Seru Loraweg 17 B, Curaçao.</p>
                  <p>Payment agent companies are Medium Rare Limited and MRS Tech Limited.</p>
                  <p>Contact us at <a href="mailto:support@stake.com" className="hover:text-white transition-colors">support@stake.com</a></p>
                  <p>Stake is committed to responsible gambling, for more information visit <a href="https://Gamblingtherapy.org" className="underline hover:text-white transition-colors">Gamblingtherapy.org</a></p>
                </div>
              </div>

              {/* Sixth Row - Live BTC Price */}
              <div className="px-4 pb-6">
                <p className="text-slate-400 text-sm text-center font-mono">
                  1 BTC = $95,000.00
                </p>
              </div>

              {/* Seventh Row - Language Dropdown */}
              <div className="px-4 pb-8">
                <div className="flex justify-center">
                  <div className="relative">
                    <button
                      onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                      className="bg-[#2f4553] text-white rounded-xl px-5 py-3 min-w-[170px] hover:bg-[#3a5568] transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        <span>{selectedLanguage}</span>
                      </div>
                      <ChevronUp className={`w-4 h-4 transition-transform ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isLanguageDropdownOpen && (
                      <div className="absolute bottom-full left-0 mb-2 bg-[#2f4553] rounded-xl shadow-lg overflow-hidden z-50">
                        {['English', 'Hindi', 'Gujarati', 'Español', 'Português', 'Français', 'Deutsch', 'Italiano', 'Türkçe', 'Russian'].map((lang) => (
                          <button
                            key={lang}
                            onClick={() => {
                              setSelectedLanguage(lang.trim())
                              setIsLanguageDropdownOpen(false)
                            }}
                            className="block w-full text-left px-5 py-3 text-white hover:bg-[#3a5568] transition-colors"
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>

      <WalletModal open={isWalletOpen} onClose={() => setIsWalletOpen(false)} balanceLabel={walletLabel} />
      <SearchOverlay open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </main>
  )
}
