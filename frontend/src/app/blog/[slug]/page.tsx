'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://lucky-games.onrender.com/api'

type Post = {
  id: string
  title: string
  slug: string
  content: string
  imageUrl?: string
  createdAt: string
}

export default function BlogDetailPage() {
  const params = useParams()
  const slug = typeof params?.slug === 'string' ? params.slug : ''
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    let cancel = false
    ;(async () => {
      try {
        const res = await fetch(`${API}/blog/posts/${encodeURIComponent(slug)}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('not found')
        const data = await res.json()
        if (!cancel) setPost(data)
      } catch {
        if (!cancel) setPost(null)
      } finally {
        if (!cancel) setLoading(false)
      }
    })()
    return () => {
      cancel = true
    }
  }, [slug])

  if (!slug) return null

  return (
    <main className="min-h-screen bg-bg-2 text-ink">
      <article className="mx-auto max-w-3xl px-4 py-12">
        <Link href="/blog" className="text-sm text-brand-2 hover:underline">
          ← Back
        </Link>
        {loading ? (
          <p className="mt-8 text-ink-3">Loading…</p>
        ) : !post ? (
          <p className="mt-8 text-ink-3">Post not found.</p>
        ) : (
          <>
            <h1 className="mt-6 text-3xl font-bold text-ink">{post.title}</h1>
            <p className="mt-2 text-sm text-ink-3">{new Date(post.createdAt).toLocaleString()}</p>
            {post.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.imageUrl} alt="" className="mt-6 w-full rounded-2xl border border-line" />
            ) : null}
            <div className="prose mt-8 max-w-none whitespace-pre-wrap text-ink-2">{post.content}</div>
          </>
        )}
      </article>
    </main>
  )
}
