'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { GameLayout } from '@/components/layout/GameLayout'
import { PageHeader } from '@/components/ui/page-header'

const API = process.env.NEXT_PUBLIC_API_URL || '/api'

type Post = {
  id: string
  title: string
  slug: string
  imageUrl?: string
  createdAt: string
}

export default function BlogListPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancel = false
    ;(async () => {
      try {
        const res = await fetch(`${API}/blog/posts`, { cache: 'no-store' })
        const data = await res.json()
        if (!cancel) setPosts(Array.isArray(data) ? data : [])
      } catch {
        if (!cancel) setPosts([])
      } finally {
        if (!cancel) setLoading(false)
      }
    })()
    return () => {
      cancel = true
    }
  }, [])

  return (
    <GameLayout>
      <div className="page-wrap max-w-4xl">
        <PageHeader title="Blog" description="News, updates, and guides." />
        {loading ? (
          <p className="mt-8 text-ink-3">Loading…</p>
        ) : posts.length === 0 ? (
          <p className="mt-8 text-ink-3">No published posts yet.</p>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {posts.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/blog/${encodeURIComponent(p.slug)}`}
                  className="block rounded-2xl border border-line bg-white p-5 shadow-panel transition hover:border-brand/40 hover:shadow-lift"
                >
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt="" className="mb-3 h-36 w-full rounded-lg object-cover" />
                  ) : null}
                  <h2 className="text-lg font-semibold text-ink">{p.title}</h2>
                  <p className="mt-1 text-xs text-ink-3">{new Date(p.createdAt).toLocaleDateString()}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </GameLayout>
  )
}
