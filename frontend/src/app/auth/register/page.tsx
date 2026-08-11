'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { authService } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'
import Link from 'next/link'
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const refFromUrl = searchParams.get('ref')?.trim() || undefined

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    phone: '',
    countryCode: '',
  })
  const [loading, setLoading] = useState(false)
  const [devOtp, setDevOtp] = useState<string | null>(null)
  const [showOtpPopup, setShowOtpPopup] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.phone) {
        toast.error('Mobile number is required')
        setLoading(false)
        return
      }

      if (!isValidPhoneNumber(formData.phone)) {
        toast.error('Please enter a valid mobile number')
        setLoading(false)
        return
      }

      // Extract country code from phone number
      const match = formData.phone.match(/^\+(\d+)/)
      const countryCode = match ? match[1] : ''
      const phoneNumber = formData.phone.replace(/^\+\d+/, '')

      // Backend currently requires an email field; we derive a synthetic email from the phone.
      const otpEmail = `${phoneNumber}@otp.local`

      const res: any = await authService.register(
        otpEmail,
        formData.username,
        formData.password,
        phoneNumber,
        countryCode,
        refFromUrl,
      )
      
      if (res?.devOtp) {
        setDevOtp(res.devOtp)
        setShowOtpPopup(true)
        // Store OTP in localStorage for verify-otp page
        if (typeof window !== 'undefined') {
          localStorage.setItem('devOtp', res.devOtp)
        }
        // Auto-redirect after 5 seconds
        setTimeout(() => {
          setShowOtpPopup(false)
          router.push(`/auth/verify-otp?phone=${encodeURIComponent(phoneNumber)}&countryCode=${encodeURIComponent(countryCode)}`)
        }, 5000)
      } else {
        toast.success('Registration successful! Please verify your OTP.')
        router.push(`/auth/verify-otp?phone=${encodeURIComponent(phoneNumber)}&countryCode=${encodeURIComponent(countryCode)}`)
      }
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
            <PhoneInput
              international
              countryCallingCodeEditable={false}
              value={formData.phone}
              onChange={(phone) => setFormData({ ...formData, phone: phone || '' })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
        <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#020617_0%,#0f172a_50%,#020617_100%)] text-slate-200">
          Loading…
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  )
}
