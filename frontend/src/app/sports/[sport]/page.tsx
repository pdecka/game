'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { GameLayout } from '@/components/layout/GameLayout'
import ErrorBoundary from '@/components/sports/ErrorBoundary'
import { SportsBoard } from '@/components/sports/SportsBoard'
import { sportBySlug } from '@/lib/sport-hub'

export default function SportMatchesPage() {
  const params = useParams()
  const router = useRouter()
  const slug = typeof params?.sport === 'string' ? params.sport : ''
  const sport = sportBySlug(slug === 'indian-cricket' ? 'cricket' : slug)
  const liveOnly = slug === 'live'

  useEffect(() => {
    if (slug === 'indian-cricket') router.replace('/sports/cricket')
  }, [router, slug])

  if (!liveOnly && !sport) {
    return (
      <GameLayout>
        <div className="page-wrap max-w-xl text-center">
          <p className="text-ink-2">That sport is not on the board yet.</p>
          <Link href="/sports" className="mt-4 inline-block text-sm text-brand-2 hover:underline">
            ← All sports
          </Link>
        </div>
      </GameLayout>
    )
  }

  return (
    <ErrorBoundary>
      <GameLayout>
        <SportsBoard sport={sport} liveOnly={liveOnly} />
      </GameLayout>
    </ErrorBoundary>
  )
}
