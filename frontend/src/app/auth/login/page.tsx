'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth() as any
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(identifier, password)
      toast.success('Login successful!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-2 p-4">
      <div className="w-full max-w-md rounded-2xl border border-line bg-card p-8 shadow-panel">
        <div className="mb-6 flex flex-col items-center">
          <img src="/logo-vertical.png" alt="Arena Bet" className="mb-3 h-16 w-auto object-contain" />
          <h1 className="text-center text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Welcome back</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-ink">Email</label>
            <Input
              type="email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-ink">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-ink-2">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="font-medium text-brand-2 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
