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
    username: '',
    password: '',
    phone: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const cleanedPhone = formData.phone.trim()
      if (!cleanedPhone) {
        toast.error('Mobile number is required')
        return
      }

      const digitsOnly = cleanedPhone.replace(/\D/g, '')
      if (digitsOnly.length < 10) {
        toast.error('Please enter a valid mobile number')
        return
      }

      // Backend currently requires an email field; we derive a synthetic email from the phone.
      const otpEmail = `${digitsOnly}@otp.local`

      const res: any = await authService.register(
        otpEmail,
        formData.username,
        formData.password,
        cleanedPhone,
        refFromUrl,
      )
      if (res?.devOtp) {
        toast.success(`OTP sent to ${cleanedPhone}: ${res.devOtp}`)
      }
      toast.success('Registration successful! Please verify your OTP.')
      router.push(`/auth/verify-otp?phone=${encodeURIComponent(cleanedPhone)}`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(135deg,#020617_0%,#0f172a_50%,#020617_100%)] p-4">
      <div className="w-full max-w-md p-8 bg-[#ffffff] rounded-xl shadow-sm border border-[#e2e8f0]">
        <h1 className="text-3xl font-bold text-center mb-6 text-[#020617]">Register</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <Input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Mobile Number</label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-[#22c55e] hover:opacity-90 text-[#ffffff] font-medium transition-all duration-200"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-[#22c55e] hover:underline">
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
        <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#020617_0%,#0f172a_50%,#020617_100%)] text-slate-200">
          Loading…
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  )
}
