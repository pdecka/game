'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { Sidebar } from '@/components/layout/Sidebar'
import { Navbar } from '@/components/layout/Navbar'
import { WalletModal } from '@/components/layout/WalletModal'
import { SearchOverlay } from '@/components/layout/SearchOverlay'
import { Bell, MessageCircle, Ticket, ChevronLeft, ChevronRight, Star, Info, MessageSquare, Phone, Facebook, Twitter, Instagram, Youtube, Send, ChevronUp, Globe } from 'lucide-react'

export default function Home() {
  const { user, wallet, walletLoading } = useAuth() as any

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [isWalletOpen, setIsWalletOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showBetslip, setShowBetslip] = useState(false)
  
  // Game slider state
  const [currentGameIndex, setCurrentGameIndex] = useState(0)
  const [lastVisitedGame, setLastVisitedGame] = useState<string | null>(null)
  const [visibleCards, setVisibleCards] = useState(6)

  // Sports slider state
  const [currentSportIndex, setCurrentSportIndex] = useState(0)

  // Footer state
  const [btcPrice, setBtcPrice] = useState<string>('Loading...')
  const [selectedLanguage, setSelectedLanguage] = useState('English')
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false)

  // Fetch BTC price
  useEffect(() => {
    const fetchBtcPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
        const data = await response.json()
        if (data.bitcoin?.usd) {
          setBtcPrice(`$${data.bitcoin.usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
        }
      } catch (error) {
        // Fallback to Binance API
        try {
          const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT')
          const data = await response.json()
          if (data.price) {
            setBtcPrice(`$${parseFloat(data.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
          }
        } catch (binanceError) {
          setBtcPrice('$95,000.00') // Fallback price
        }
      }
    }

    fetchBtcPrice()
    const interval = setInterval(fetchBtcPrice, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  // Responsive card count
  useEffect(() => {
    const updateVisibleCards = () => {
      const width = window.innerWidth
      if (width < 480) setVisibleCards(1)
      else if (width < 640) setVisibleCards(2)
      else if (width < 768) setVisibleCards(3)
      else if (width < 1024) setVisibleCards(4)
      else if (width < 1280) setVisibleCards(5)
      else setVisibleCards(6)
    }

    updateVisibleCards()
    window.addEventListener('resize', updateVisibleCards)
    return () => window.removeEventListener('resize', updateVisibleCards)
  }, [])

  const walletLabel =
    walletLoading || !wallet?.INR ? '₹0.00' : `₹${Number(wallet.INR).toFixed(2)}`

  // Sample games for slider
  const sliderGames = [
    { name: 'Crash', href: '/games/crash', image: '/games/crash-thumb.jpeg' },
    { name: 'Mines', href: '/games/mines', image: '/games/mines-thumb.jpeg' },
    { name: 'Dice', href: '/games/dice', image: '/games/dice-thumb.jpeg' },
    { name: 'Plinko', href: '/games/plinko', image: '/games/plinko-thumb.png' },
    { name: 'Coinflip', href: '/games/coinflip', image: '/games/coinflip-thumb.png' },
    { name: 'Limbo', href: '/games/limbo', image: '/games/limbo-thumb.png' },
    { name: 'Wheel', href: '/games/wheel', image: '/games/wheel-thumb.png' },
    { name: 'Roulette', href: '/games/roulette', image: '/games/roulette-thumb.jpeg' },
    { name: 'Slots', href: '/games/slots', image: '/games/slots-thumb.jpeg' },
    { name: 'Blackjack', href: '/games/blackjack', image: '/games/blackjack-thumb.jpeg' },
    { name: 'Baccarat', href: '/games/baccarat', image: '/games/baccarat-thumb.png' },
    { name: 'HiLo', href: '/games/hilo', image: '/games/hilo-thumb.jpeg' },
    { name: 'Tower', href: '/games/tower', image: '/games/tower-thumb.jpeg' },
    { name: 'Keno', href: '/games/keno', image: '/games/keno-thumb.jpeg' },
    { name: 'Scratch', href: '/games/scratch', image: '/games/scratch-thumb.jpeg' },
    { name: 'Dragon Tiger', href: '/games/dragon-tiger', image: '/games/dragontower-thumb.jpeg' },
    { name: 'Andar Bahar', href: '/games/andar-bahar', image: '/games/andarbahar-thumb.jpeg' },
    { name: 'Poker', href: '/games/poker', image: '/games/poker-thumb.jpeg' },
    { name: 'Color Prediction', href: '/games/color-prediction', image: '/games/color-thumb.jpeg' },
    { name: 'Tic Tac Toe', href: '/games/number-hilo', image: '/games/tictactoe-thumb.jpeg' },
  ]

  const handlePrevGame = () => {
    setCurrentGameIndex((prev) => (prev === 0 ? sliderGames.length - 1 : prev - 1))
  }

  const handleNextGame = () => {
    setCurrentGameIndex((prev) => (prev === sliderGames.length - 1 ? 0 : prev + 1))
  }

  const handlePrevSport = () => {
    setCurrentSportIndex((prev) => (prev === 0 ? sliderGames.length - 1 : prev - 1))
  }

  const handleNextSport = () => {
    setCurrentSportIndex((prev) => (prev === sliderGames.length - 1 ? 0 : prev + 1))
  }

  const handleGameClick = (gameName: string, href: string) => {
    setLastVisitedGame(gameName)
    // Navigate to game
    window.location.href = href
  }

  // Create infinite loop array for smooth carousel
  const infiniteGames = useMemo(() => {
    const games = [...sliderGames]
    // Add games at the beginning and end for infinite loop effect
    return [...games.slice(-visibleCards), ...games, ...games.slice(0, visibleCards)]
  }, [sliderGames, visibleCards])

  // Calculate the display index for infinite loop
  const displayIndex = useMemo(() => {
    return currentGameIndex + visibleCards
  }, [currentGameIndex, visibleCards])

  // Calculate the display index for sports slider
  const sportDisplayIndex = useMemo(() => {
    return currentSportIndex + visibleCards
  }, [currentSportIndex, visibleCards])

  // Get visible games for current position
  const getVisibleGames = () => {
    return infiniteGames.slice(displayIndex, displayIndex + visibleCards)
  }

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setMobileNavOpen((prev) => !prev)
      return
    }
    setIsSidebarCollapsed((prev) => !prev)
  }

  return (
    <main className="flex h-screen overflow-hidden bg-gradient-to-br from-[#0f212e] to-[#1a2c38] text-slate-100">
      <Sidebar
        collapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed((prev) => !prev)}
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
          <div className="mx-auto w-full max-w-6xl px-3 sm:px-4 py-5 sm:py-6 lg:py-8">
            
            {/* First Section - VIP Progress and Casino/Sports Thumbnails */}
            <section className="mb-8 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
              {/* VIP Progress */}
              <div className="min-w-0">
                {/* Top Label */}
                <p className="text-white font-semibold mb-4">Your VIP Progress</p>
                
                {/* VIP Progress Card */}
                <div className="border-2 border-[#d9b98c] rounded-[14px] p-3 lg:p-4 bg-gradient-to-br from-[#0f212e] to-[#1a2c38] h-[155px] relative w-full max-w-none md:max-w-[300px]">
                  {/* Top Row */}
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-white font-bold text-[30px]">
                      Ro7744
                    </div>
                    <ChevronRight className="text-white w-5 h-5" />
                  </div>
                  
                  {/* Right Side Star Icon */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Star className="w-9 h-9 text-[#d9b98c] stroke-current fill-none" strokeWidth={2} />
                  </div>
                  
                  {/* Middle Section */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-white font-bold">4.94%</span>
                    <Info className="text-gray-400 w-4 h-4" />
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#d9b98c] to-[#f4e4c1] rounded-full" 
                      style={{ width: '4.94%' }}
                    ></div>
                  </div>
                  
                  {/* Bottom Text */}
                  <p className="text-gray-500 text-sm">Next level: Silver</p>
                </div>
              </div>

              {/* Casino Thumbnail */}
              <div className="min-w-0">
                <Link href="/casino" className="group relative block overflow-hidden rounded-2xl bg-[#1a2c38] shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
                  <div className="aspect-video lg:aspect-[16/10]">
                    <img 
                      src="/games/casino-thumb.jpeg" 
                      alt="Casino"
                      className="h-full w-full object-cover rounded-2xl"
                    />
                    <div className="absolute inset-0 bg-black/25 md:bg-black/20 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-white font-semibold text-lg lg:text-xl">Casino</span>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Sports Thumbnail */}
              <div className="min-w-0">
                <Link href="/sports" className="group relative block overflow-hidden rounded-2xl bg-[#1a2c38] shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
                  <div className="aspect-video lg:aspect-[16/10]">
                    <img 
                      src="/games/sports-thumb.jpeg" 
                      alt="Sports"
                      className="h-full w-full object-cover rounded-2xl"
                    />
                    <div className="absolute inset-0 bg-black/25 md:bg-black/20 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-white font-semibold text-lg lg:text-xl">Sports</span>
                    </div>
                  </div>
                </Link>
              </div>
            </section>

            {/* Second Section - Mega Search Bar */}
            <section className="mb-8">
              <div className="flex items-center gap-2 sm:gap-4 rounded-xl bg-[#1a2c38] px-3 sm:px-6 py-3 sm:py-4 shadow-lg">
                <button className="flex shrink-0 items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-slate-100 transition duration-300 ease-in-out hover:bg-slate-700">
                  <span>Casino</span>
                  <span className="text-[10px] text-slate-400">▼</span>
                </button>
                <div className="h-7 w-px shrink-0 bg-white/10" />
                <input
                  type="text"
                  placeholder="Search your game"
                  className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
                />
              </div>
            </section>

            {/* Third Section - Game Slider */}
            <section className="mb-8">
              <div className="mb-4 flex items-center justify-between gap-3 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-white">Continue Playing</h2>
                <div className="truncate text-xs sm:text-sm text-slate-300">
                  {lastVisitedGame ? `Last: ${lastVisitedGame}` : 'All Casino Games'}
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center gap-2 sm:gap-4">
                  {/* Left Arrow */}
                  <button 
                    onClick={handlePrevGame}
                    className="absolute left-1 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-600 bg-gradient-to-r from-slate-800 to-slate-700 text-slate-300 transition-all duration-300 hover:scale-110 hover:from-slate-700 hover:to-slate-600 hover:text-white hover:shadow-lg hover:shadow-emerald-500/20 sm:static sm:h-12 sm:w-12 sm:shrink-0 sm:translate-y-0"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Game Slider Container */}
                  <div className="flex-1 overflow-hidden">
                    <div 
                      className="flex gap-3 transition-transform duration-500 ease-out"
                      style={{ 
                        transform: `translateX(-${displayIndex * 172}px)`,
                        width: `${infiniteGames.length * 172}px`
                      }}
                    >
                      {infiniteGames.map((game, index) => (
                        <div
                          key={`${game.name}-${index}`}
                          className="flex-shrink-0"
                          style={{ width: '160px' }}
                        >
                          <button
                            onClick={() => handleGameClick(game.name, game.href)}
                            className="relative w-40 h-40 overflow-hidden rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 group"
                          >
                            <img 
                              src={game.image} 
                              alt={game.name}
                              className="h-full w-full object-contain"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gray-900">
                              <p className="text-gray-900 text-xl uppercase font-bold text-center">
                                <span className="bg-gradient-to-r from-gray-200 via-white to-gray-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                                  {game.name}
                                </span>
                              </p>
                            </div>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Arrow */}
                  <button 
                    onClick={handleNextGame}
                    className="absolute right-1 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-600 bg-gradient-to-r from-slate-800 to-slate-700 text-slate-300 transition-all duration-300 hover:scale-110 hover:from-slate-700 hover:to-slate-600 hover:text-white hover:shadow-lg hover:shadow-emerald-500/20 sm:static sm:h-12 sm:w-12 sm:shrink-0 sm:translate-y-0"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </section>

            {/* Fourth Section - Sports Slider */}
            <section className="mb-8">
              <div className="mb-4 flex items-center justify-between gap-3 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-white">Popular Sports</h2>
                <div className="truncate text-xs sm:text-sm text-slate-300">
                  Live & Upcoming Matches
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center gap-2 sm:gap-4">
                  {/* Left Arrow */}
                  <button 
                    onClick={handlePrevSport}
                    className="absolute left-1 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-600 bg-gradient-to-r from-slate-800 to-slate-700 text-slate-300 transition-all duration-300 hover:scale-110 hover:from-slate-700 hover:to-slate-600 hover:text-white hover:shadow-lg hover:shadow-emerald-500/20 sm:static sm:h-12 sm:w-12 sm:shrink-0 sm:translate-y-0"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Sports Slider Container */}
                  <div className="flex-1 overflow-hidden">
                    <div 
                      className="flex gap-3 transition-transform duration-500 ease-out"
                      style={{ 
                        transform: `translateX(-${sportDisplayIndex * 172}px)`,
                        width: `${infiniteGames.length * 172}px`
                      }}
                    >
                      {infiniteGames.map((game, index) => (
                        <div
                          key={`sports-${index}`}
                          className="flex-shrink-0"
                          style={{ width: '160px' }}
                        >
                          <button
                            onClick={() => handleGameClick(game.name, game.href)}
                            className="relative w-40 h-40 overflow-hidden rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 group"
                          >
                            <div className="h-full w-full bg-gradient-to-br from-emerald-600 to-blue-600 flex items-center justify-center">
                              <div className="text-center p-4">
                                <div className="text-2xl mb-2">⚽</div>
                                <p className="text-white text-sm font-semibold">Football</p>
                                <p className="text-white/70 text-xs">Live Now</p>
                              </div>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gray-900">
                              <p className="text-gray-900 text-xl uppercase font-bold text-center">
                                <span className="bg-gradient-to-r from-gray-200 via-white to-gray-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                                  Football
                                </span>
                              </p>
                            </div>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Arrow */}
                  <button 
                    onClick={handleNextSport}
                    className="absolute right-1 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-600 bg-gradient-to-r from-slate-800 to-slate-700 text-slate-300 transition-all duration-300 hover:scale-110 hover:from-slate-700 hover:to-slate-600 hover:text-white hover:shadow-lg hover:shadow-emerald-500/20 sm:static sm:h-12 sm:w-12 sm:shrink-0 sm:translate-y-0"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </section>

            
          </div>
          {/* Fifth Section - Footer */}
          <footer className="bg-[#0f212e] border-t border-white/10">
              {/* First Row - 6 Columns */}
              <div className="w-full py-12 px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-8">
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
                      {['Deposit & Withdrawals', 'Currency Guide', 'Crypto Guide', 'Supported Crypto', 'How to Use the Vault', 'How Much to Bet With'].map((link) => (
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
              </div>

              {/* Second Row - Social Icons */}
              <div className="max-w-7xl mx-auto px-4 pb-8">
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
              <div className="max-w-7xl mx-auto px-4 py-6">
                <p className="text-slate-400 text-sm text-center">
                  © 2026 Stake.com | All Rights Reserved.
                </p>
              </div>

              {/* Fifth Row - Legal / Company Info */}
              <div className="max-w-5xl mx-auto px-4 pb-6">
                <div className="text-slate-400 text-sm leading-7 space-y-2">
                  <p>Stake is owned and operated by Medium Rare N.V., registration number: 145353, registered address: Seru Loraweg 17 B, Curaçao.</p>
                  <p>Payment agent companies are Medium Rare Limited and MRS Tech Limited.</p>
                  <p>Contact us at <a href="mailto:support@stake.com" className="hover:text-white transition-colors">support@stake.com</a></p>
                  <p>Stake is committed to responsible gambling, for more information visit <a href="https://Gamblingtherapy.org" className="underline hover:text-white transition-colors">Gamblingtherapy.org</a></p>
                </div>
              </div>

              {/* Sixth Row - Live BTC Price */}
              <div className="max-w-7xl mx-auto px-4 pb-6">
                <p className="text-slate-400 text-sm text-center font-mono">
                  1 BTC = {btcPrice}
                </p>
              </div>

              {/* Seventh Row - Language Dropdown */}
              <div className="max-w-7xl mx-auto px-4 pb-8">
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
                        {['English', ' Hindi', ' Gujarati', 'Español', 'Português', 'Français', 'Deutsch', 'Italiano', 'Türkçe', 'Russian'].map((lang) => (
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
          </footer>
        </div>

      </div>

      <WalletModal open={isWalletOpen} onClose={() => setIsWalletOpen(false)} balanceLabel={walletLabel} />
      <SearchOverlay open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </main>
  )
}
