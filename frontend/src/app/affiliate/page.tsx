'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'

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
    return <div className="min-h-screen bg-[#0b1220] text-slate-200 flex items-center justify-center">Loading…</div>
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0b1220] to-[#111827] text-slate-100">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Link href="/" className="text-sm text-emerald-400 hover:underline">
          ← Home
        </Link>
        <h1 className="mt-6 text-3xl font-bold text-white">Affiliate</h1>
        <p className="mt-2 text-slate-400">Share your code and earn commission on referred players&apos; bets.</p>

        {loading ? (
          <p className="mt-8 text-slate-500">Loading…</p>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
              <p className="text-sm text-slate-400">Your referral code</p>
              <p className="mt-2 text-2xl font-mono font-bold tracking-widest text-white">{data?.referralCode ?? '—'}</p>
              {link ? (
                <div className="mt-4">
                  <p className="text-xs text-slate-500">Share link</p>
                  <p className="mt-1 break-all text-sm text-emerald-300">{link}</p>
                  <button
                    type="button"
                    className="mt-3 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-black hover:bg-emerald-400"
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
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-400">Total referrals</p>
                <p className="mt-2 text-2xl font-bold text-white">{data?.totalReferrals ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-400">Total earnings (commission credited)</p>
                <p className="mt-2 text-2xl font-bold text-white">₹{Number(data?.totalEarnings ?? 0).toFixed(2)}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="font-semibold text-white">Recent commission</p>
              {!data?.history?.length ? (
                <p className="mt-3 text-sm text-slate-500">No history yet.</p>
              ) : (
                <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto text-sm">
                  {data.history.map((h: any) => (
                    <li key={h.id} className="flex justify-between border-b border-white/5 py-2 text-slate-300">
                      <span>₹{Number(h.commissionAmount).toFixed(2)}</span>
                      <span className="text-slate-500">{new Date(h.createdAt).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
