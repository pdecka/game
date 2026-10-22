'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import { GameLayout } from '@/components/layout/GameLayout'
import { PageHeader } from '@/components/ui/page-header'

export default function AffiliatePage() {
  const router = useRouter()
  const { ready, user } = useAuth() as any
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const link = useMemo(() => {
    if (!data?.referralCode || !origin) return ''
    return `${origin}/auth/register?ref=${encodeURIComponent(data.referralCode)}`
  }, [data?.referralCode, origin])

  useEffect(() => {
    if (!ready) return
    if (!user) router.push('/auth/login')
  }, [ready, user, router])

  useEffect(() => {
    if (!user) return
    let c = false
    ;(async () => {
      try {
        setLoading(true)
        const res = await api.get('/affiliate/me')
        if (!c) setData(res.data)
      } catch (e: any) {
        toast.error(e?.response?.data?.message || 'Failed to load affiliate data')
      } finally {
        if (!c) setLoading(false)
      }
    })()
    return () => {
      c = true
    }
  }, [user])

  if (!ready || !user) {
    return <div className="flex min-h-screen items-center justify-center bg-bg-2 text-ink-2">Loading…</div>
  }

  return (
    <GameLayout>
      <div className="page-wrap max-w-3xl">
        <PageHeader title="Affiliate" description="Share your code and earn commission on referred players' bets." />

        {loading ? (
          <p className="mt-8 text-ink-3">Loading…</p>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="rounded-2xl border border-line bg-white p-6 shadow-panel">
              <p className="text-sm text-ink-2">Your referral code</p>
              <p className="mt-2 font-mono text-2xl font-bold tracking-widest text-ink">{data?.referralCode ?? '—'}</p>
              {link ? (
                <div className="mt-4">
                  <p className="text-xs text-ink-3">Share link</p>
                  <p className="mt-1 break-all text-sm text-brand-2">{link}</p>
                  <button
                    type="button"
                    className="mt-3 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-2"
                    onClick={() => {
                      void navigator.clipboard.writeText(link)
                      toast.success('Copied')
                    }}
                  >
                    Copy link
                  </button>
                </div>
              ) : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-line bg-white p-5 shadow-panel">
                <p className="text-sm text-ink-2">Total referrals</p>
                <p className="mt-2 text-2xl font-bold text-ink">{data?.totalReferrals ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-line bg-white p-5 shadow-panel">
                <p className="text-sm text-ink-2">Total earnings (commission credited)</p>
                <p className="mt-2 text-2xl font-bold text-ink">₹{Number(data?.totalEarnings ?? 0).toFixed(2)}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-white p-5 shadow-panel">
              <p className="font-semibold text-ink">Recent commission</p>
              {!data?.history?.length ? (
                <p className="mt-3 text-sm text-ink-3">No history yet.</p>
              ) : (
                <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto text-sm">
                  {data.history.map((h: any) => (
                    <li key={h.id} className="flex justify-between border-b border-line py-2 text-ink">
                      <span>₹{Number(h.commissionAmount).toFixed(2)}</span>
                      <span className="text-ink-3">{new Date(h.createdAt).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  )
}
