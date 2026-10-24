'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { authService } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'
import Link from 'next/link'

function VerifyOtpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailParam = searchParams.get('email') || ''

  const [email, setEmail] = useState(emailParam)
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [devOtp, setDevOtp] = useState<string | null>(null)

  useEffect(() => {
    if (!emailParam && typeof window !== 'undefined') {
      setEmail(localStorage.getItem('pendingEmail') || '')
    }
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      const storedOtp = localStorage.getItem('devOtp')
      if (storedOtp) setDevOtp(storedOtp)
    }
  }, [emailParam])

  const handleResendOtp = async () => {
    if (!email) return toast.error('Enter the email used at registration')
    try {
      setLoading(true)
      const res: any = await authService.resendOtp(email)
      if (res?.devOtp) {
        setDevOtp(res.devOtp)
        localStorage.setItem('devOtp', res.devOtp)
      }
      toast.success(res?.mailed ? 'A new OTP was sent to your email.' : 'OTP regenerated. Check your inbox.')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!email) {
        toast.error('Missing email for OTP verification')
        setLoading(false)
        return
      }
      await authService.verifyOtp(email, otp)
      toast.success('Email verified. Log in with your email and password.')
      localStorage.removeItem('devOtp')
      localStorage.removeItem('pendingEmail')
      router.push('/auth/login')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-2 p-4">
      <div className="w-full max-w-md rounded-2xl border border-line bg-card p-8 shadow-panel">
        <div className="mb-6 flex flex-col items-center">
          <img src="/logo-vertical.png" alt="Arena Bet" className="mb-3 h-16 w-auto object-contain" />
          <h1 className="text-center text-2xl font-semibold text-ink">Verify email</h1>
        </div>
        <div className="mb-6 rounded-xl border border-line bg-elevated p-4 text-sm text-ink-2">
          <p className="text-center">Enter the 6-digit OTP sent to</p>
          <p className="mt-1 text-center font-medium text-ink">{email || 'your email'}</p>
          <p className="mt-2 text-center text-xs text-ink-3">The code is valid for 12 minutes.</p>
        </div>
        {devOtp ? (
          <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-center text-sm text-amber-800">
            Development code: <span className="font-mono font-bold">{devOtp}</span>
          </p>
        ) : null}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-ink">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-ink">OTP Code</label>
            <Input
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6-digit code"
              maxLength={6}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </Button>
          <button
            type="button"
            onClick={handleResendOtp}
            className="w-full text-sm font-medium text-brand-2 hover:underline disabled:opacity-50"
            disabled={loading}
          >
            Resend OTP
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-ink-2">
          <Link href="/auth/login" className="font-medium text-brand-2 hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-bg-2 text-ink-2">Loading…</div>}>
      <VerifyOtpForm />
    </Suspense>
  )
}
