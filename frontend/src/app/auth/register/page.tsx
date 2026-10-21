'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { authService } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'
import Link from 'next/link'
import CountryCodeSelector from '@/components/auth/CountryCodeSelector'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const refFromUrl = searchParams.get('ref')?.trim() || undefined

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    phone: '',
    countryCode: '+91', // Default to India
    countryCodeIso: 'IN',
  })
  const [loading, setLoading] = useState(false)
  const [devOtp, setDevOtp] = useState<string | null>(null)
  const [showOtpPopup, setShowOtpPopup] = useState(false)

  const handleCountryCodeChange = (dialCode: string, countryCode: string) => {
    setFormData({ ...formData, countryCode: dialCode, countryCodeIso: countryCode })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
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

      if (!formData.phone || formData.phone.length < 10) {
        toast.error('Please enter a valid mobile number (at least 10 digits)')
        setLoading(false)
        return
      }

      // Call registration API without email
      const res: any = await authService.register(
        undefined, // No email required
        formData.username,
        formData.password,
        formData.phone,
        formData.countryCode,
        refFromUrl,
      )
      
      if (res?.devOtp) {
        setDevOtp(res.devOtp)
        setShowOtpPopup(true)
        // Store OTP in localStorage for verify-otp page
        if (typeof window !== 'undefined') {
          localStorage.setItem('devOtp', res.devOtp)
          localStorage.setItem('phone', formData.phone)
          localStorage.setItem('countryCode', formData.countryCode)
        }
        // Auto-redirect after 8 seconds
        setTimeout(() => {
          setShowOtpPopup(false)
          router.push(`/auth/verify-otp?phone=${encodeURIComponent(formData.phone)}&countryCode=${encodeURIComponent(formData.countryCode)}`)
        }, 8000)
      } else {
        toast.success('Registration successful! Please verify your OTP.')
        router.push(`/auth/verify-otp?phone=${encodeURIComponent(formData.phone)}&countryCode=${encodeURIComponent(formData.countryCode)}`)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-2 p-4">
      <div className="w-full max-w-md rounded-2xl border border-line bg-card p-8 shadow-panel">
        <h1 className="mb-6 text-center text-3xl font-bold text-ink">Create Account</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
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
              placeholder="Create a password"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-ink">Mobile Number</label>
            <div className="flex">
              <CountryCodeSelector
                value={formData.countryCode}
                onChange={handleCountryCodeChange}
                disabled={loading}
              />
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                placeholder="Mobile number"
                className="flex-1 rounded-l-none border-l-0"
              />
            </div>
            <p className="mt-1 text-xs text-ink-3">
              We'll send you an OTP to verify your number
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
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

      {/* OTP Popup for Local Development */}
      {showOtpPopup && devOtp && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-[#fef3c7] border-2 border-[#f59e0b] rounded-lg p-4 shadow-lg z-50 max-w-sm">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-[#92400e] mb-1">Development OTP</h3>
              <p className="text-[#b45309] text-sm mb-2">Your OTP code:</p>
              <p className="text-2xl font-mono font-bold text-[#92400e] bg-[#fffbeb] p-2 rounded border border-[#fcd34d]">
                {devOtp}
              </p>
            </div>
            <button
              onClick={() => setShowOtpPopup(false)}
              className="text-[#92400e] hover:text-[#78350f] ml-4"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-[#b45309] mt-2">
            This is for development only. In production, OTP will be sent via SMS.
          </p>
        </div>
      )}
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
