'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { adminAuthService } from '@/admin/services/adminAuthService'
import { Button } from '@/components/ui/button'

export default function AdminBlogsPage() {
  const [items, setItems] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const load = async () => {
    try {
      const data = await adminAuthService.listBlogs()
      setItems(Array.isArray(data) ? data : [])
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to load blogs')
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const create = async () => {
    if (!title.trim() || !content.trim()) return toast.error('Title and content required')
    try {
      setLoading(true)
      await adminAuthService.createBlog({
        title: title.trim(),
        slug: slug.trim() || undefined,
        content,
        imageUrl: imageUrl.trim() || undefined,
        status: 'published',
      })
      toast.success('Published')
      setTitle('')
      setSlug('')
      setContent('')
      setImageUrl('')
      await load()
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Create failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold text-[#020617]">Blogs</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-[#e2e8f0] bg-[#ffffff] p-5 shadow-sm">
          <h2 className="font-medium text-[#020617]">New post</h2>
          <input
            className="w-full rounded-md border border-[#e2e8f0] px-3 py-2 text-sm"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="w-full rounded-md border border-[#e2e8f0] px-3 py-2 text-sm"
            placeholder="Slug (optional)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
          <input
            className="w-full rounded-md border border-[#e2e8f0] px-3 py-2 text-sm"
            placeholder="Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <textarea
            className="min-h-[140px] w-full rounded-md border border-[#e2e8f0] px-3 py-2 text-sm"
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <Button
            type="button"
            onClick={() => void create()}
            disabled={loading}
            className="bg-[#22c55e] text-white hover:opacity-90"
          >
            {loading ? 'Saving…' : 'Publish'}
          </Button>
        </div>
        <ul className="space-y-2">
          {items.map((b) => (
            <li
              key={b.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-[#e2e8f0] bg-[#ffffff] p-4 text-sm shadow-sm"
            >
              <div>
                <div className="font-medium text-[#020617]">{b.title}</div>
                <div className="text-xs text-[#64748b]">
                  {b.status} · {b.slug}
                </div>
              </div>
              <button
                type="button"
                className="shrink-0 text-red-600 hover:underline"
                onClick={async () => {
                  if (!confirm('Delete this post?')) return
                  try {
                    await adminAuthService.deleteBlog(b.id)
                    toast.success('Deleted')
                    await load()
                  } catch (e: any) {
                    toast.error(e?.response?.data?.message || 'Delete failed')
                  }
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
