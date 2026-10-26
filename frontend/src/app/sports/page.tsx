'use client'

import Link from 'next/link'
import { GameLayout } from '@/components/layout/GameLayout'
import { PageHeader } from '@/components/ui/page-header'
import { SPORT_HUB } from '@/lib/sport-hub'
import ErrorBoundary from '@/components/sports/ErrorBoundary'

export default function SportsHubPage() {
  return (
    <ErrorBoundary>
      <GameLayout>
        <div className="page-wrap">
          <div className="mx-auto max-w-6xl">
            <PageHeader
              title="Sports"
              description="Choose a sport. You only see matches for that game — same idea as the casino lobby."
            />

            <div className="mb-6">
              <Link
                href="/sports/live"
                className="inline-flex items-center rounded-full border border-brand/30 bg-brand/10 px-4 py-2 text-sm font-medium text-brand-2 hover:bg-brand/15"
              >
                Live now
              </Link>
            </div>

            <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
              {SPORT_HUB.map((sport) => (
                <Link
                  key={sport.slug}
                  href={`/sports/${sport.slug}`}
                  className="group relative overflow-hidden rounded-2xl border border-line bg-white shadow-panel transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <div className="relative h-48 overflow-hidden sm:h-64">
                    <img
                      src={sport.image}
                      alt={sport.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-100 transition-opacity duration-300 md:bg-transparent md:opacity-0 md:group-hover:bg-black/20 md:group-hover:opacity-100">
                      <div className="rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white shadow-lift sm:px-6 sm:py-3 sm:text-sm">
                        Open
                      </div>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="text-sm font-bold text-ink">{sport.name}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-ink-3">{sport.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </GameLayout>
    </ErrorBoundary>
  )
}
