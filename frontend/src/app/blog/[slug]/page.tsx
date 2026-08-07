'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://game-20eg.onrender.com/api'

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
    <main className="min-h-screen bg-gradient-to-b from-[#0b1220] to-[#111827] text-slate-100">
      <article className="mx-auto max-w-3xl px-4 py-12">
        <Link href="/blog" className="text-sm text-emerald-400 hover:underline">
          ← Back
        </Link>
        {loading ? (
          <p className="mt-8 text-slate-500">Loading…</p>
        ) : !post ? (
          <p className="mt-8 text-slate-500">Post not found.</p>
        ) : (
          <>
            <h1 className="mt-6 text-3xl font-bold text-white">{post.title}</h1>
            <p className="mt-2 text-sm text-slate-500">{new Date(post.createdAt).toLocaleString()}</p>
            {post.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.imageUrl} alt="" className="mt-6 w-full rounded-2xl border border-white/10" />
            ) : null}
            <div className="prose prose-invert mt-8 max-w-none whitespace-pre-wrap text-slate-200">{post.content}</div>
          </>
        )}
      </article>
    </main>
  )
}
