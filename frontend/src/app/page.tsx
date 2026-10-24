'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo, useRef } from 'react'
import { GameLayout } from '@/components/layout/GameLayout'
import { ChevronLeft, ChevronRight, Star, Info, Search } from 'lucide-react'
import { SPORT_HUB } from '@/lib/sport-hub'
import { useAuth } from '@/context/AuthContext'
import { vipFromVolume } from '@/lib/vip'

export default function Home() {
  const { user, wallet } = useAuth() as {
    user?: { username?: string } | null
    wallet?: { volumeUsd?: number } | null
  }
  const vip = vipFromVolume(Number(wallet?.volumeUsd) > 0 ? Number(wallet?.volumeUsd) : 0)
  const vipName = user?.username || 'Guest'
  const vipHref = user ? '/dashboard' : '/auth/login'
  const vipPercentLabel = `${vip.percent.toFixed(2)}%`

  // Game slider state
  const [currentGameIndex, setCurrentGameIndex] = useState(0)
  const [lastVisitedGame, setLastVisitedGame] = useState<string | null>(null)
  const [visibleCards, setVisibleCards] = useState(6)

  // Sports slider state
  const [currentSportIndex, setCurrentSportIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchScope, setSearchScope] = useState<'all' | 'casino' | 'sports'>('all')
  const searchBoxRef = useRef<HTMLElement>(null)

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

  const sliderSports = SPORT_HUB.map((sport) => ({
    slug: sport.slug,
    name: sport.name,
    href: `/sports/${sport.slug}`,
    image: sport.image,
  }))

  const handlePrevSport = () => {
    setCurrentSportIndex((prev) => (prev === 0 ? sliderSports.length - 1 : prev - 1))
  }

  const handleNextSport = () => {
    setCurrentSportIndex((prev) => (prev === sliderSports.length - 1 ? 0 : prev + 1))
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

  const infiniteSports = useMemo(() => {
    const sports = [...sliderSports]
    const pad = Math.min(visibleCards, sports.length)
    return [...sports.slice(-pad), ...sports, ...sports.slice(0, pad)]
  }, [sliderSports, visibleCards])

  const sportDisplayIndex = useMemo(() => {
    return currentSportIndex + Math.min(visibleCards, sliderSports.length)
  }, [currentSportIndex, visibleCards, sliderSports.length])

  useEffect(() => {
    if (!searchQuery.trim()) return
    const closeSearch = (event: Event) => {
      const target = event.target as Node
      if (searchBoxRef.current?.contains(target)) return
      setSearchQuery('')
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSearchQuery('')
    }
    document.addEventListener('pointerdown', closeSearch, true)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', closeSearch, true)
      document.removeEventListener('keydown', onKey)
    }
  }, [searchQuery])

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (q.length < 1) return []
    const casinoHits =
      searchScope === 'sports'
        ? []
        : sliderGames
            .filter((game) => game.name.toLowerCase().includes(q))
            .map((game) => ({ kind: 'Casino' as const, name: game.name, href: game.href }))
    const sportHits =
      searchScope === 'casino'
        ? []
        : sliderSports
            .filter((sport) => sport.name.toLowerCase().includes(q) || sport.slug.includes(q))
            .map((sport) => ({ kind: 'Sports' as const, name: sport.name, href: sport.href }))
    return [...sportHits, ...casinoHits].slice(0, 12)
  }, [searchQuery, searchScope, sliderGames, sliderSports])

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
                
                <Link
                  href={vipHref}
                  className="relative block h-[155px] w-full max-w-none rounded-[14px] border-2 border-[#15803d] bg-[#16a34a] p-3 md:max-w-[300px] lg:p-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-2 pr-10">
                    <div className="truncate text-[22px] font-bold leading-tight text-white sm:text-[26px]">
                      {vipName}
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-white" />
                  </div>

                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Star className="h-9 w-9 fill-none text-white stroke-current" strokeWidth={2} />
                  </div>

                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-white/90">
                      {vip.currentName}
                    </span>
                  </div>

                  <div className="mb-2 flex items-center gap-2">
                    <span className="odds-num font-bold text-white">{vipPercentLabel}</span>
                    <Info
                      className="h-4 w-4 text-white/80"
                      aria-label="VIP progress counts 50 percent of real game wagers only. Deposits do not count."
                    />
                  </div>

                  <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-white/25">
                    <div
                      className="h-full rounded-full bg-white"
                      style={{ width: `${vip.percent}%` }}
                    />
                  </div>

                  <p className="text-sm text-white/85">
                    {vip.nextName ? `Next level: ${vip.nextName}` : 'Max level: Diamond'}
                  </p>
                </Link>
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
            <section ref={searchBoxRef} className="relative z-20 mb-8">
              <div className="flex items-center gap-2 rounded-xl border border-[#15803d] bg-[#16a34a] px-3 py-3 sm:gap-4 sm:px-6 sm:py-4">
                <button
                  type="button"
                  onClick={() =>
                    setSearchScope((prev) => (prev === 'all' ? 'casino' : prev === 'casino' ? 'sports' : 'all'))
                  }
                  className="home-live-search flex shrink-0 items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#16a34a] outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none"
                >
                  <span>{searchScope === 'all' ? 'All' : searchScope === 'casino' ? 'Casino' : 'Sports'}</span>
                  <span className="text-[10px]">▼</span>
                </button>
                <div className="h-7 w-px shrink-0 bg-white/30" />
                <Search className="h-4 w-4 shrink-0 text-white" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search games and sports"
                  className="home-live-search min-w-0 flex-1 bg-transparent text-sm font-medium text-white caret-white outline-none ring-0 placeholder:text-white/75 focus:outline-none focus:ring-0 focus-visible:outline-none [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#16a34a] [&:-webkit-autofill]:[-webkit-text-fill-color:#fff]"
                />
              </div>
              {searchQuery.trim() ? (
                <div className="absolute inset-x-0 top-[calc(100%+6px)] overflow-hidden rounded-xl border border-[#15803d] bg-[#16a34a] shadow-panel">
                  {searchResults.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-white/85">No matches</p>
                  ) : (
                    <ul className="max-h-72 overflow-y-auto py-1">
                      {searchResults.map((hit) => (
                        <li key={`${hit.kind}-${hit.href}`}>
                          <Link
                            href={hit.href}
                            onClick={() => setSearchQuery('')}
                            className="home-live-search flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-white outline-none ring-0 hover:bg-white/15 focus:outline-none focus-visible:outline-none"
                          >
                            <span>{hit.name}</span>
                            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#16a34a]">
                              {hit.kind}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}
            </section>

            {/* Third Section - Sports Slider */}
            <section className="mb-8">
              <div className="mb-4 flex items-center justify-between gap-3 sm:mb-6">
                <h2 className="text-lg font-semibold text-ink sm:text-xl">Popular Sports</h2>
                <Link href="/sports" className="truncate text-xs font-medium text-brand-2 hover:underline sm:text-sm">
                  All sports
                </Link>
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
                        width: `${infiniteSports.length * 172}px`
                      }}
                    >
                      {infiniteSports.map((sport, index) => (
                        <div
                          key={`${sport.slug}-${index}`}
                          className="flex-shrink-0"
                          style={{ width: '160px' }}
                        >
                          <Link
                            href={sport.href}
                            className="group relative block h-40 w-40 overflow-hidden rounded-xl border border-line bg-white shadow-panel transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand"
                          >
                            <img
                              src={sport.image}
                              alt={sport.name}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-100 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100" />
                            <div className="absolute inset-x-0 bottom-0 bg-ink/80 p-2 md:translate-y-full md:transition-transform md:duration-300 md:group-hover:translate-y-0">
                              <p className="text-center text-xs font-semibold text-white">{sport.name}</p>
                            </div>
                          </Link>
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

            {/* Fourth Section - Game Slider */}
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

            
          </div>

    </GameLayout>
  )
}
