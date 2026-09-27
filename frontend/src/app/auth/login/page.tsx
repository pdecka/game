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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f212e] to-[#1a2c38] p-4">
      <div className="w-full max-w-md p-8 bg-[#1a2c38] rounded-xl shadow-2xl border border-white/10">
        <h1 className="text-3xl font-bold text-center mb-6 text-white">Welcome Back</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-white">Username or Email</label>
            <Input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              placeholder="Enter your username or email"
              className="bg-[#0f212e] border-white/20 text-white placeholder:text-white/40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-white">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="bg-[#0f212e] border-white/20 text-white placeholder:text-white/40"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-all duration-200"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-white/60">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-emerald-400 hover:text-emerald-300 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
