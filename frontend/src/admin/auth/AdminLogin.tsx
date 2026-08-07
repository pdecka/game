'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { adminAuthService } from '../services/adminAuthService'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await adminAuthService.login(email, password)
      toast.success('Admin login successful')
      router.push('/admin/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Admin login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[linear-gradient(135deg,#020617_0%,#0f172a_50%,#020617_100%)]">
      <div className="w-full max-w-md rounded-xl border border-[#e2e8f0] bg-[#ffffff] p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-[#020617] mb-6">Admin Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full rounded-md border border-[#e2e8f0] bg-[#e2e8f0] px-3 py-2 text-[#020617] placeholder:text-[#64748b] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full rounded-md border border-[#e2e8f0] bg-[#e2e8f0] px-3 py-2 text-[#020617] placeholder:text-[#64748b] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[#22c55e] hover:opacity-90 text-[#ffffff] font-medium py-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-sm text-[#64748b] mt-4">
          Need an admin account?{' '}
          <Link href="/admin/signup" className="text-[#22c55e] hover:underline">
            Signup
          </Link>
        </p>
      </div>
    </div>
  )
}

