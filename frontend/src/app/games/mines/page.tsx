'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Navbar } from '@/components/layout/Navbar'
import { WalletModal } from '@/components/layout/WalletModal'
import { SearchOverlay } from '@/components/layout/SearchOverlay'
import { useAuth } from '@/context/AuthContext'
import { formatPlayMoney, playBalance, usePlayCurrency } from '@/lib/playCurrency'
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
  const { currency } = usePlayCurrency(wallet)
  
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
    walletLoading && !wallet ? formatPlayMoney(0, currency) : formatPlayMoney(playBalance(wallet, currency), currency)

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
    <main className="flex h-screen overflow-hidden bg-bg-2 text-ink">
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
            <div className="rounded-lg border border-line bg-white p-6 shadow-panel">
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  className="min-w-[120px] border-line text-ink"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  New Game
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="min-w-[120px] border-line text-ink"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Leaderboard
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="min-w-[120px] border-line text-ink"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Statistics
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="min-w-[120px] border-line text-ink"
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
        <footer className="border-t border-line bg-white">
            {/* First Row - 6 Columns */}
            <div className="w-full py-12 px-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-8 max-w-7xl mx-auto">
                {/* Column 1 - Casino */}
                <div>
                  <h3 className="mb-4 text-lg font-bold text-ink">Casino</h3>
                  <ul className="space-y-2">
                    {['Casino Games', 'Slots', 'Live Casino', 'Roulette', 'Blackjack', 'Poker', 'Publishers', 'Promos & Competitions', 'Stake Engine', 'Stake Vendors'].map((link) => (
                      <li key={link}>
                        <button className="cursor-pointer text-sm text-ink-2 duration-200 transition-all hover:translate-x-1 hover:text-brand-2">
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 2 - Sports */}
                <div>
                  <h3 className="mb-4 text-lg font-bold text-ink">Sports</h3>
                  <ul className="space-y-2">
                    {['Sportsbook', 'Live Sports', 'Soccer', 'Basketball', 'Tennis', 'eSports', 'Bet Bonuses', 'Sports Rules', 'Racing Rules'].map((link) => (
                      <li key={link}>
                        <button className="cursor-pointer text-sm text-ink-2 duration-200 transition-all hover:translate-x-1 hover:text-brand-2">
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 3 - Support */}
                <div>
                  <h3 className="mb-4 text-lg font-bold text-ink">Support</h3>
                  <ul className="space-y-2">
                    {['Help Center', 'Fairness', 'Responsible Gambling', 'Gambling Helpline', 'Live Support', 'Self Exclusion', 'Law Enforcement Request'].map((link) => (
                      <li key={link}>
                        <button className="cursor-pointer text-sm text-ink-2 duration-200 transition-all hover:translate-x-1 hover:text-brand-2">
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 4 - About Us */}
                <div>
                  <h3 className="mb-4 text-lg font-bold text-ink">About Us</h3>
                  <ul className="space-y-2">
                    {['VIP Club', 'Affiliate', 'Privacy Policy', 'AML Policy', 'Terms of Service'].map((link) => (
                      <li key={link}>
                        <button className="cursor-pointer text-sm text-ink-2 duration-200 transition-all hover:translate-x-1 hover:text-brand-2">
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 5 - Payment Info */}
                <div>
                  <h3 className="mb-4 text-lg font-bold text-ink">Payment Info</h3>
                  <ul className="space-y-2">
                    {['Deposit & Withdrawals', 'Currency Guide', 'Crypto Guide', 'Supported Crypto', 'How to Use Vault', 'How Much to Bet With'].map((link) => (
                      <li key={link}>
                        <button className="cursor-pointer text-sm text-ink-2 duration-200 transition-all hover:translate-x-1 hover:text-brand-2">
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 6 - FAQ */}
                <div>
                  <h3 className="mb-4 text-lg font-bold text-ink">FAQ</h3>
                  <ul className="space-y-2">
                    {['How-to Guides', 'Online Casino Guide', 'Sports Betting Guide', 'How to Live Stream Sports', 'Stake VIP Guide', 'House Edge Guide'].map((link) => (
                      <li key={link}>
                        <button className="cursor-pointer text-sm text-ink-2 duration-200 transition-all hover:translate-x-1 hover:text-brand-2">
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
                  <MessageSquare className="h-6 w-6 cursor-pointer text-ink-2 transition-all hover:scale-110 hover:text-brand-2" />
                  <Phone className="h-6 w-6 cursor-pointer text-ink-2 transition-all hover:scale-110 hover:text-brand-2" />
                  <Facebook className="h-6 w-6 cursor-pointer text-ink-2 transition-all hover:scale-110 hover:text-brand-2" />
                  <Twitter className="h-6 w-6 cursor-pointer text-ink-2 transition-all hover:scale-110 hover:text-brand-2" />
                  <Instagram className="h-6 w-6 cursor-pointer text-ink-2 transition-all hover:scale-110 hover:text-brand-2" />
                  <Youtube className="h-6 w-6 cursor-pointer text-ink-2 transition-all hover:scale-110 hover:text-brand-2" />
                  <Send className="h-6 w-6 cursor-pointer text-ink-2 transition-all hover:scale-110 hover:text-brand-2" />
                </div>
              </div>

              {/* Third Row - Divider */}
              <div className="border-t border-line"></div>

              {/* Fourth Row - Copyright */}
              <div className="px-4 py-6">
                <p className="text-center text-sm text-ink-2">
                  © 2026 Stake.com | All Rights Reserved.
                </p>
              </div>

              {/* Fifth Row - Legal / Company Info */}
              <div className="px-4 pb-6">
                <div className="space-y-2 text-sm leading-7 text-ink-2">
                  <p>Stake is owned and operated by Medium Rare N.V., registration number: 145353, registered address: Seru Loraweg 17 B, Curaçao.</p>
                  <p>Payment agent companies are Medium Rare Limited and MRS Tech Limited.</p>
                  <p>Contact us at <a href="mailto:support@stake.com" className="transition-colors hover:text-brand-2">support@stake.com</a></p>
                  <p>Stake is committed to responsible gambling, for more information visit <a href="https://Gamblingtherapy.org" className="underline transition-colors hover:text-brand-2">Gamblingtherapy.org</a></p>
                </div>
              </div>

              {/* Sixth Row - Live BTC Price */}
              <div className="px-4 pb-6">
                <p className="text-center font-mono text-sm text-ink-2">
                  1 BTC = $95,000.00
                </p>
              </div>

              {/* Seventh Row - Language Dropdown */}
              <div className="px-4 pb-8">
                <div className="flex justify-center">
                  <div className="relative">
                    <button
                      onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                      className="flex min-w-[170px] items-center justify-between rounded-xl border border-line bg-white px-5 py-3 text-ink transition-colors hover:border-brand/40"
                    >
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        <span>{selectedLanguage}</span>
                      </div>
                      <ChevronUp className={`w-4 h-4 transition-transform ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isLanguageDropdownOpen && (
                      <div className="absolute bottom-full left-0 z-50 mb-2 overflow-hidden rounded-xl border border-line bg-white shadow-panel">
                        {['English', 'Hindi', 'Gujarati', 'Español', 'Português', 'Français', 'Deutsch', 'Italiano', 'Türkçe', 'Russian'].map((lang) => (
                          <button
                            key={lang}
                            onClick={() => {
                              setSelectedLanguage(lang.trim())
                              setIsLanguageDropdownOpen(false)
                            }}
                            className="block w-full px-5 py-3 text-left text-ink transition-colors hover:bg-elevated"
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
