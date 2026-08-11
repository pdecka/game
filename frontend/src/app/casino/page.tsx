'use client'

import Link from 'next/link'
import { GameLayout } from '@/components/layout/GameLayout'

const GAMES: { name: string; href: string; desc: string; image?: string }[] = [
  { name: 'Crash', href: '/games/crash', desc: 'Real-time style multiplier cashout.', image: '/games/crash-thumb.jpeg' },
  { name: 'Mines', href: '/games/mines', desc: 'Pick tiles, avoid mines.', image: '/games/mines-thumb.jpeg' },
  { name: 'Dice', href: '/games/dice', desc: 'Roll under/over targets.', image: '/games/dice-thumb.jpeg' },
  { name: 'Plinko', href: '/games/plinko', desc: 'Drop ball, hit multiplier slots.', image: '/games/plinko-thumb.png' },
  { name: 'Coinflip', href: '/games/coinflip', desc: 'Heads or tails, instant.', image: '/games/coinflip-thumb.png' },
  { name: 'Limbo', href: '/games/limbo', desc: 'Target multiplier game.', image: '/games/limbo-thumb.png' },
  { name: 'Wheel', href: '/games/wheel', desc: 'Spin for segment multipliers.', image: '/games/wheel-thumb.png' },
  { name: 'Roulette', href: '/games/roulette', desc: 'Red/black, odd/even, number.', image: '/games/roulette-thumb.jpeg' },
  { name: 'Slots', href: '/games/slots', desc: '3×5 reels with paylines.', image: '/games/slots-thumb.jpeg' },
  { name: 'Blackjack', href: '/games/blackjack', desc: 'Interactive hit/stand.', image: '/games/blackjack-thumb.jpeg' },
  { name: 'Baccarat', href: '/games/baccarat', desc: 'Player/Banker/Tie.', image: '/games/baccarat-thumb.png' },
  { name: 'HiLo', href: '/games/hilo', desc: 'Higher/lower card progression.', image: '/games/hilo-thumb.jpeg' },
  { name: 'Tower', href: '/games/tower', desc: 'Climb levels safely.', image: '/games/tower-thumb.jpeg' },
  { name: 'Keno', href: '/games/keno', desc: 'Pick numbers, draw matches.', image: '/games/keno-thumb.jpeg' },
  { name: 'Scratch', href: '/games/scratch', desc: 'Reveal 3 symbols.', image: '/games/scratch-thumb.jpeg' },
  { name: 'Dragon Tiger', href: '/games/dragon-tiger', desc: 'Compare 2 cards.', image: '/games/dragontower-thumb.jpeg' },
  { name: 'Andar Bahar', href: '/games/andar-bahar', desc: 'Joker rank chase.', image: '/games/andarbahar-thumb.jpeg' },
  { name: 'Poker', href: '/games/poker', desc: 'Hold & draw once.', image: '/games/poker-thumb.jpeg' },
  { name: 'Color Prediction', href: '/games/color-prediction', desc: 'Pick red/green/violet.', image: '/games/color-thumb.jpeg' },
  { name: 'Tic Tac Toe', href: '/games/number-hilo', desc: 'Classic 3-in-a-row vs AI.', image: '/games/tictactoe-thumb.jpeg' },
  { name: 'Video Poker', href: '/games/video-poker', desc: 'Jacks or Better, hold & draw.', image: '/games/poker-thumb.jpeg' },
]

export default function CasinoPage() {
  return (
    <GameLayout>
      <div className="p-3 sm:p-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Casino</h1>
            <p className="mt-1 text-sm text-[#64748b]">All games — fully playable with wallet + history.</p>
          </div>

          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
            {GAMES.map((g) => (
              <Link
                key={g.href}
                href={g.href}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-black shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
              >
                <div className="relative h-36 overflow-hidden sm:h-48">
                  {g.image ? (
                    <img
                      src={g.image}
                      alt={g.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-500/20 to-sky-500/20">
                      <span className="text-2xl font-bold text-white/50">{g.name.charAt(0)}</span>
                    </div>
                  )}

                  {/* Always visible on touch; hover-reveal on desktop */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-100 transition-opacity duration-300 md:bg-transparent md:opacity-0 md:group-hover:bg-black/20 md:group-hover:opacity-100">
                    <div className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white shadow-lg sm:px-6 sm:py-3 sm:text-sm">
                      Play Now
                    </div>
                  </div>
                </div>
                
                <div className="p-3 sm:p-4">
                  <h3 className="text-sm font-bold text-white">{g.name}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-gray-400">{g.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </GameLayout>
  )
}

