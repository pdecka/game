'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { Sidebar } from '@/components/layout/Sidebar'
import { Navbar } from '@/components/layout/Navbar'
import { WalletModal } from '@/components/layout/WalletModal'
import { SearchOverlay } from '@/components/layout/SearchOverlay'
import { Bell, MessageCircle, Ticket } from 'lucide-react'

export default function Home() {
  const { user, wallet, walletLoading } = useAuth() as any

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isWalletOpen, setIsWalletOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showBetslip, setShowBetslip] = useState(false)

  const walletLabel =
    walletLoading || !wallet?.INR ? '₹0.00' : `₹${Number(wallet.INR).toFixed(2)}`

  return (
    <main className="flex h-screen overflow-hidden bg-gradient-to-br from-[#0f212e] to-[#1a2c38] text-slate-100">
      <div className="hidden md:block">
        <Sidebar
          collapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed((prev) => !prev)}
        />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
          onOpenWallet={() => setIsWalletOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onToggleNotifications={() => setShowNotifications((v) => !v)}
          onToggleChat={() => setShowChat((v) => !v)}
          onToggleBetslip={() => setShowBetslip((v) => !v)}
          showNotifications={showNotifications}
          showChat={showChat}
          showBetslip={showBetslip}
        />

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:py-8">
              {/* Hero section */}
              <section className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-stretch">
                {/* Left column */}
                <div className="flex flex-col justify-center space-y-6">
                  <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-black/30 px-3 py-1 text-xs font-medium text-emerald-100">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                    Live 24/7 • Instant deposits & withdrawals
                  </p>
                  <div>
                    <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-5xl">
                      The World&apos;s Largest Online Casino and Sportsbook
                    </h1>
                  </div>
                  <p className="max-w-xl text-sm text-slate-300 sm:text-base">
                    Play provably fair games, bet on live sports, and manage a multi-currency wallet with INR,
                    USDT and BTC — all in one secure platform built for high‑volume players.
                  </p>

                  <div className="space-y-4">
                    {user ? (
                      <div className="rounded-2xl border border-white/10 bg-[#1a2c38]/60 p-4 shadow-lg">
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                          Welcome
                        </p>
                        <p className="text-lg font-bold text-white">
                          {user?.username}
                        </p>
                        <div className="mt-2 flex items-end justify-between gap-4">
                          <div>
                            <p className="text-[11px] text-slate-400">INR Balance</p>
                            <p className="text-3xl font-bold text-white">
                              ₹
                              {walletLoading
                                ? '0.00'
                                : wallet?.INR
                                  ? Number(wallet.INR).toFixed(2)
                                  : '0.00'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-2 rounded-lg bg-[#22c55e]/15 border border-[#22c55e]/30 px-3 py-2 text-xs text-emerald-200">
                              <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
                              Live
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    <div className="flex flex-wrap items-center gap-4">
                      {user ? (
                        <>
                          <Link href="/wallet">
                            <Button className="rounded-lg bg-[#22c55e] px-6 py-3 text-sm font-semibold text-[#ffffff] shadow-lg transition duration-300 ease-in-out hover:opacity-90">
                              Deposit
                            </Button>
                          </Link>
                          <Link href="/wallet">
                            <Button
                              variant="outline"
                              className="rounded-lg border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white transition duration-300 ease-in-out hover:bg-white/10"
                            >
                              Withdraw
                            </Button>
                          </Link>
                          <Link href="/games/dice">
                            <Button
                              variant="outline"
                              className="rounded-lg border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white transition duration-300 ease-in-out hover:bg-white/10"
                            >
                              Play Games
                            </Button>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link href="/auth/register">
                            <Button className="rounded-lg bg-[#1475e1] px-6 py-3 text-sm font-semibold text-white shadow-lg transition duration-300 ease-in-out hover:bg-[#1b82f0]">
                              Register
                            </Button>
                          </Link>
                          <Link href="/auth/login">
                            <Button
                              variant="outline"
                              className="rounded-lg border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white transition duration-300 ease-in-out hover:bg-white/10"
                            >
                              I already have an account
                            </Button>
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs">
                      <Button className="h-10 rounded-lg bg-slate-800 px-4 text-xs font-medium text-slate-100 transition duration-300 ease-in-out hover:bg-slate-700">
                        Continue with Google
                      </Button>
                      <Button className="h-10 rounded-lg bg-slate-800 px-4 text-xs font-medium text-slate-100 transition duration-300 ease-in-out hover:bg-slate-700">
                        Continue with Facebook
                      </Button>
                    </div>
                  </div>

                  {/* Platform info tiles (preserved) */}
                  <div className="grid grid-cols-2 gap-4 pt-2 text-xs sm:grid-cols-3 sm:text-sm">
                    <div className="rounded-xl border border-white/10 bg-[#1a2c38] px-4 py-3 shadow-lg">
                      <p className="mb-1 text-xs text-slate-400">Wallet</p>
                      <p className="font-semibold text-white">Multi‑currency support</p>
                      <p className="text-[11px] text-slate-400">INR • USDT • BTC</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-[#1a2c38] px-4 py-3 shadow-lg">
                      <p className="mb-1 text-xs text-slate-400">Security</p>
                      <p className="font-semibold text-white">2FA &amp; session control</p>
                      <p className="text-[11px] text-slate-400">Secure account protection</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-[#1a2c38] px-4 py-3 shadow-lg">
                      <p className="mb-1 text-xs text-slate-400">Games</p>
                      <p className="font-semibold text-white">Crash, Dice &amp; Mines</p>
                      <p className="text-[11px] text-slate-400">Instant on-chain style results</p>
                    </div>
                  </div>
                </div>

                {/* Right column cards */}
                <div className="relative">
                  <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-tr from-sky-500/20 via-emerald-400/10 to-transparent blur-3xl" />
                  <div className="relative grid gap-4 sm:grid-cols-2">
                    {/* Casino card */}
                    <div className="group relative overflow-hidden rounded-2xl bg-[#1a2c38] shadow-lg transition duration-300 ease-in-out hover:scale-[1.03]">
                      <img 
                        src="/games/casino-thumb.jpeg"
                        alt="Casino"
                        className="h-32 w-full object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/40 px-4 py-3 text-sm text-white backdrop-blur-sm">
                        <div>
                          <p className="text-xs text-slate-300">Category</p>
                          <p className="text-sm font-semibold">Casino</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-emerald-300">
                          <span className="h-2 w-2 rounded-full bg-emerald-400" />
                          <span>40,052 players</span>
                        </div>
                      </div>
                    </div>

                    {/* Sports card */}
                    <div className="group relative overflow-hidden rounded-2xl bg-[#1a2c38] shadow-lg transition duration-300 ease-in-out hover:scale-[1.03]">
                      <img 
                        src="/games/sports-thumb.jpeg"
                        alt="Sports"
                        className="h-32 w-full object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/40 px-4 py-3 text-sm text-white backdrop-blur-sm">
                        <div>
                          <p className="text-xs text-slate-300">Category</p>
                          <p className="text-sm font-semibold">Sports</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-emerald-300">
                          <span className="h-2 w-2 rounded-full bg-emerald-400" />
                          <span>13,303 players</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preserve featured game cards below main hero cards */}
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-[#1a2c38] p-5 shadow-lg">
                      <p className="mb-2 text-[11px] uppercase tracking-[0.15em] text-purple-200">
                        Featured Game
                      </p>
                      <h3 className="mb-1 text-lg font-semibold text-white">Crash</h3>
                      <p className="mb-4 text-xs text-slate-200">
                        Watch the multiplier climb and cash out before it crashes.
                      </p>
                      <p className="mb-3 text-xs text-slate-400">Typical multiplier: 1.10× – 50×+</p>
                      <Link href="/games/crash">
                        <Button size="sm" className="bg-purple-500 text-xs hover:bg-purple-600">
                          Play Crash
                        </Button>
                      </Link>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-2xl border border-white/10 bg-[#1a2c38] p-4 shadow-lg">
                        <h3 className="mb-1 text-sm font-semibold text-white">Dice</h3>
                        <p className="mb-3 text-xs text-slate-200">
                          Choose your side, roll, and let the odds work for you.
                        </p>
                        <Link href="/games/dice">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/40 text-xs text-white hover:bg-white/10"
                          >
                            Play Dice
                          </Button>
                        </Link>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-[#1a2c38] p-4 shadow-lg">
                        <h3 className="mb-1 text-sm font-semibold text-white">Mines</h3>
                        <p className="mb-3 text-xs text-slate-200">
                          Reveal gems on the board and dodge the mines for bigger payouts.
                        </p>
                        <Link href="/games/mines">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/40 text-xs text-white hover:bg-white/10"
                          >
                            Play Mines
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Search bar section */}
              <section className="mt-8">
                <div className="flex items-center gap-4 rounded-xl bg-[#1a2c38] px-6 py-4 shadow-lg">
                  <button className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-slate-100 transition duration-300 ease-in-out hover:bg-slate-700">
                    <span>Casino</span>
                    <span className="text-[10px] text-slate-400">▼</span>
                  </button>
                  <div className="h-7 w-px bg-white/10" />
                  <input
                    type="text"
                    placeholder="Search your game"
                    className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
                  />
                </div>
              </section>

              {/* Trending games section */}
              <section className="mt-10 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-xl font-semibold text-white">Trending Games</h2>
                  <div className="flex items-center gap-2">
                    <button className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition duration-300 ease-in-out hover:bg-white/10">
                      ‹
                    </button>
                    <button className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition duration-300 ease-in-out hover:bg-white/10">
                      ›
                    </button>
                  </div>
                </div>

                <div className="-mx-1 flex space-x-4 overflow-x-auto pb-2">
                  {[
                    { name: 'Crash', href: '/games/crash' },
                    { name: 'Dice', href: '/games/dice' },
                    { name: 'Mines', href: '/games/mines' },
                    { name: 'Live Casino', href: '/games/dice' },
                    { name: 'Slots', href: '/games/mines' },
                  ].map((game) => (
                    <Link
                      key={game.name}
                      href={game.href}
                      className="group relative h-56 w-44 flex-shrink-0 overflow-hidden rounded-xl bg-[#1a2c38] shadow-lg transition duration-300 ease-in-out hover:scale-105"
                    >
                      <div className="h-32 bg-gradient-to-br from-sky-500 via-emerald-500 to-slate-900" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-6">
                        <p className="text-sm font-semibold text-white">{game.name}</p>
                        <p className="mt-1 text-[11px] text-slate-300">High RTP • Fast rounds</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          </div>

          <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center px-4">
            <div className="pointer-events-auto flex w-full max-w-4xl flex-col gap-3 rounded-lg border border-white/10 bg-slate-800/95 px-6 py-4 text-sm text-slate-200 shadow-lg md:flex-row md:items-center md:justify-between">
              <p className="text-xs md:text-sm">
                We use cookies for functional and analytical purposes.
              </p>
              <div className="flex justify-end">
                <Button className="rounded-lg bg-slate-600 px-4 py-2 text-xs font-medium text-white transition duration-300 ease-in-out hover:bg-slate-500">
                  Accept
                </Button>
              </div>
            </div>
          </div>

          {showNotifications && (
            <div className="fixed right-4 top-20 z-30 w-80 rounded-2xl border border-white/10 bg-[#0f212e] p-4 text-sm text-slate-100 shadow-2xl">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-emerald-300" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Notifications
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Clear
                </button>
              </div>
              <ul className="space-y-2 text-xs">
                <li className="rounded-lg bg-white/5 px-3 py-2">
                  Welcome to the platform! Your account is ready to play.
                </li>
                <li className="rounded-lg bg-white/5 px-3 py-2">
                  New promotion available in the Casino section.
                </li>
                <li className="rounded-lg bg-white/5 px-3 py-2">
                  Check out live sports markets in the Sports tab.
                </li>
              </ul>
            </div>
          )}

          {showChat && (
            <div className="fixed bottom-4 right-4 z-30 w-80 rounded-2xl border border-white/10 bg-[#0f212e] p-3 text-xs text-slate-100 shadow-2xl">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-emerald-300" />
                  <span className="font-semibold">Live Chat</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowChat(false)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  ✕
                </button>
              </div>
              <div className="mb-2 h-32 rounded-lg bg-black/30 p-2 text-[11px] text-slate-300">
                Chat coming soon. For now, contact support via email.
              </div>
              <input
                type="text"
                className="h-8 w-full rounded-lg bg-black/40 px-2 text-[11px] text-white outline-none placeholder:text-slate-500"
                placeholder="Type a message..."
              />
            </div>
          )}

          {showBetslip && (
            <div className="fixed right-4 top-20 z-30 w-80 rounded-2xl border border-white/10 bg-[#0f212e] p-4 text-xs text-slate-100 shadow-2xl">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-emerald-300" />
                  <span className="font-semibold">Bet Slip</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBetslip(false)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  ✕
                </button>
              </div>
              <p className="mb-2 text-[11px] text-slate-300">
                Your bets will appear here as you add selections from the Sports section.
              </p>
              <Button className="w-full bg-emerald-500 text-xs font-semibold text-white hover:bg-emerald-600">
                Browse Sports
              </Button>
            </div>
          )}
        </div>
      </div>

      <WalletModal open={isWalletOpen} onClose={() => setIsWalletOpen(false)} balanceLabel={walletLabel} />
      <SearchOverlay open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </main>
  )
}
