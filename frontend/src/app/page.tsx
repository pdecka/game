'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { GameLayout } from '@/components/layout/GameLayout'
import { ChevronLeft, ChevronRight, Star, Info } from 'lucide-react'

export default function Home() {
  // Game slider state
  const [currentGameIndex, setCurrentGameIndex] = useState(0)
  const [lastVisitedGame, setLastVisitedGame] = useState<string | null>(null)
  const [visibleCards, setVisibleCards] = useState(6)

  // Sports slider state
  const [currentSportIndex, setCurrentSportIndex] = useState(0)

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

  return (
    <GameLayout>
          <div className="page-wrap">
            
            {/* First Section - VIP Progress and Casino/Sports Thumbnails */}
            <section className="mb-8 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
              {/* VIP Progress */}
              <div className="min-w-0">
                {/* Top Label */}
                <p className="mb-4 font-semibold text-ink">Your VIP Progress</p>
                
                {/* VIP Progress Card */}
                <div className="relative h-[155px] w-full max-w-none rounded-[14px] border-2 border-brand/40 bg-white p-3 md:max-w-[300px] lg:p-4">
                  {/* Top Row */}
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-[30px] font-bold text-ink">
                      Ro7744
                    </div>
                    <ChevronRight className="h-5 w-5 text-ink" />
                  </div>
                  
                  {/* Right Side Star Icon */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Star className="h-9 w-9 fill-none text-brand stroke-current" strokeWidth={2} />
                  </div>
                  
                  {/* Middle Section */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-ink">4.94%</span>
                    <Info className="text-gray-400 w-4 h-4" />
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-elevated">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-brand to-brand-2" 
                      style={{ width: '4.94%' }}
                    ></div>
                  </div>
                  
                  {/* Bottom Text */}
                  <p className="text-sm text-ink-3">Next level: Silver</p>
                </div>
              </div>

              {/* Casino Thumbnail */}
              <div className="min-w-0">
                <Link href="/casino" className="group relative block overflow-hidden rounded-2xl border border-line bg-white shadow-panel transition-all duration-300 hover:shadow-lift">
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
                <Link href="/sports" className="group relative block overflow-hidden rounded-2xl border border-line bg-white shadow-panel transition-all duration-300 hover:shadow-lift">
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
              <div className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-3 shadow-panel sm:gap-4 sm:px-6 sm:py-4">
                <button className="flex shrink-0 items-center gap-2 rounded-lg bg-elevated px-3 py-2 text-xs font-medium text-ink transition duration-300 ease-in-out hover:bg-brand/10">
                  <span>Casino</span>
                  <span className="text-[10px] text-ink-3">▼</span>
                </button>
                <div className="h-7 w-px shrink-0 bg-white/10" />
                <input
                  type="text"
                  placeholder="Search your game"
                  className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-3"
                />
              </div>
            </section>

            {/* Third Section - Game Slider */}
            <section className="mb-8">
              <div className="mb-4 flex items-center justify-between gap-3 sm:mb-6">
                <h2 className="text-lg font-semibold text-ink sm:text-xl">Continue Playing</h2>
                <div className="truncate text-xs text-ink-2 sm:text-sm">
                  {lastVisitedGame ? `Last: ${lastVisitedGame}` : 'All Casino Games'}
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center gap-2 sm:gap-4">
                  {/* Left Arrow */}
                  <button 
                    onClick={handlePrevGame}
                    className="absolute left-1 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white text-ink-2 shadow-panel transition-all duration-300 hover:border-brand/40 hover:text-brand-2 sm:static sm:h-12 sm:w-12 sm:shrink-0 sm:translate-y-0"
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
                            className="relative w-40 h-40 overflow-hidden rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand group"
                          >
                            <img 
                              src={game.image} 
                              alt={game.name}
                              className="h-full w-full object-contain"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="absolute inset-x-0 bottom-0 translate-y-full bg-ink/80 p-2 transition-transform duration-300 group-hover:translate-y-0">
                              <p className="text-center text-xs font-semibold text-white">{game.name}</p>
                            </div>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Arrow */}
                  <button 
                    onClick={handleNextGame}
                    className="absolute right-1 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white text-ink-2 shadow-panel transition-all duration-300 hover:border-brand/40 hover:text-brand-2 sm:static sm:h-12 sm:w-12 sm:shrink-0 sm:translate-y-0"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </section>

            {/* Fourth Section - Sports Slider */}
            <section className="mb-8">
              <div className="mb-4 flex items-center justify-between gap-3 sm:mb-6">
                <h2 className="text-lg font-semibold text-ink sm:text-xl">Popular Sports</h2>
                <div className="truncate text-xs text-ink-2 sm:text-sm">
                  Live & Upcoming Matches
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center gap-2 sm:gap-4">
                  {/* Left Arrow */}
                  <button 
                    onClick={handlePrevSport}
                    className="absolute left-1 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white text-ink-2 shadow-panel transition-all duration-300 hover:border-brand/40 hover:text-brand-2 sm:static sm:h-12 sm:w-12 sm:shrink-0 sm:translate-y-0"
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
                            className="relative w-40 h-40 overflow-hidden rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand group"
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
                    className="absolute right-1 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white text-ink-2 shadow-panel transition-all duration-300 hover:border-brand/40 hover:text-brand-2 sm:static sm:h-12 sm:w-12 sm:shrink-0 sm:translate-y-0"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </section>

            
          </div>

    </GameLayout>
  )
}
