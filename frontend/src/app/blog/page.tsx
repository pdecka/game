'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://game-20eg.onrender.com/api'

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
    <main className="min-h-screen bg-gradient-to-b from-[#0b1220] to-[#111827] text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold text-white">Blog</h1>
        <p className="mt-2 text-slate-400">News, updates, and guides.</p>
        {loading ? (
          <p className="mt-8 text-slate-500">Loading…</p>
        ) : posts.length === 0 ? (
          <p className="mt-8 text-slate-500">No published posts yet.</p>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {posts.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/blog/${encodeURIComponent(p.slug)}`}
                  className="block rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition hover:border-emerald-400/40 hover:bg-white/10"
                >
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt="" className="mb-3 h-36 w-full rounded-lg object-cover" />
                  ) : null}
                  <h2 className="text-lg font-semibold text-white">{p.title}</h2>
                  <p className="mt-1 text-xs text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
