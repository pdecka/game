'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { adminAuthService } from '../services/adminAuthService'

export default function AdminSignup() {
  const router = useRouter()
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    signupCode: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Client-side validation
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }
    
    if (form.username.length < 3) {
      toast.error('Username must be at least 3 characters long')
      return
    }
    
    setLoading(true)
    try {
      await adminAuthService.signup(form.email, form.username, form.password, undefined, form.signupCode || undefined)
      toast.success('Admin signup successful')
      router.push('/admin/login')
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Admin signup failed'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[linear-gradient(135deg,#020617_0%,#0f172a_50%,#020617_100%)]">
      <div className="w-full max-w-md rounded-xl border border-[#e2e8f0] bg-[#ffffff] p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-[#020617] mb-6">Admin Signup</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full rounded-md border border-[#e2e8f0] bg-[#e2e8f0] px-3 py-2 text-[#020617] placeholder:text-[#64748b] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            className="w-full rounded-md border border-[#e2e8f0] bg-[#e2e8f0] px-3 py-2 text-[#020617] placeholder:text-[#64748b] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
            type="text"
            placeholder="Username (min 3 characters)"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
          <input
            className="w-full rounded-md border border-[#e2e8f0] bg-[#e2e8f0] px-3 py-2 text-[#020617] placeholder:text-[#64748b] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
            type="password"
            placeholder="Password (min 8 characters)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <input
            className="w-full rounded-md border border-[#e2e8f0] bg-[#e2e8f0] px-3 py-2 text-[#020617] placeholder:text-[#64748b] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
            type="password"
            placeholder="Admin signup code (required after first admin)"
            value={form.signupCode}
            onChange={(e) => setForm({ ...form, signupCode: e.target.value })}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[#22c55e] hover:opacity-90 text-[#ffffff] py-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Admin'}
          </button>
        </form>
        <p className="text-sm text-[#64748b] mt-4">
          Already have admin account?{' '}
          <Link href="/admin/login" className="text-[#22c55e] hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

