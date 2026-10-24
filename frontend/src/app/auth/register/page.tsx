'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { authService } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'
import Link from 'next/link'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const refFromUrl = searchParams.get('ref')?.trim() || undefined

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.email || !formData.email.includes('@')) {
        toast.error('Enter a valid email address')
        setLoading(false)
        return
      }
      if (!formData.username || formData.username.length < 3) {
        toast.error('Username must be at least 3 characters')
        setLoading(false)
        return
      }
      if (!formData.password || formData.password.length < 8) {
        toast.error('Password must be at least 8 characters')
        setLoading(false)
        return
      }

      const res: any = await authService.register(
        formData.email.trim().toLowerCase(),
        formData.username,
        formData.password,
        '',
        '',
        refFromUrl,
      )

      if (typeof window !== 'undefined') {
        localStorage.setItem('pendingEmail', formData.email.trim().toLowerCase())
        if (res?.devOtp) localStorage.setItem('devOtp', res.devOtp)
      }

      toast.success(
        res?.mailed
          ? 'Check your email for a 6-digit OTP. It is valid for 12 minutes.'
          : 'Account created. Enter the OTP from your email (or the on-screen code in development).',
      )
      router.push(`/auth/verify-otp?email=${encodeURIComponent(formData.email.trim().toLowerCase())}`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-2 p-4">
      <div className="w-full max-w-md rounded-2xl border border-line bg-card p-8 shadow-panel">
        <div className="mb-6 flex flex-col items-center">
          <img src="/logo-vertical.png" alt="Arena Bet" className="mb-3 h-16 w-auto object-contain" />
          <h1 className="text-center text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Create account</h1>
          <p className="mt-2 text-center text-sm text-ink-3">We will email a 6-digit code to verify your account.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-ink">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="you@email.com"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-ink">Username</label>
            <Input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              placeholder="Choose a username"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-ink">Password</label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="At least 8 characters"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-ink-2">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-brand-2 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-bg-2 text-ink-2">
          Loading…
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  )
}
