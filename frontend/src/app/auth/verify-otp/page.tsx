'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { authService } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function VerifyOtpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const phoneParam = searchParams.get('phone') || ''
  const derivedEmail = phoneParam ? `${phoneParam.replace(/\D/g, '')}@otp.local` : ''

  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (derivedEmail) setEmail(derivedEmail)
  }, [derivedEmail])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const emailToUse = derivedEmail || email
      if (!emailToUse) {
        toast.error('Missing email for OTP verification')
        return
      }

      await authService.verifyOtp(emailToUse, otp)
      toast.success('OTP verified successfully!')
      router.push('/auth/login')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(135deg,#020617_0%,#0f172a_50%,#020617_100%)] p-4">
      <div className="w-full max-w-md p-8 bg-[#ffffff] rounded-xl shadow-sm border border-[#e2e8f0]">
        <h1 className="text-3xl font-bold text-center mb-6 text-[#020617]">Verify OTP</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {phoneParam ? (
            <div className="rounded-md border border-[#e2e8f0] bg-[#e2e8f0]/20 p-3 text-sm text-[#64748b]">
              Verifying OTP for{' '}
              <span className="font-medium text-[#020617]">{phoneParam}</span>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-2">OTP Code</label>
            <Input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-[#22c55e] hover:opacity-90 text-[#ffffff] font-medium transition-all duration-200"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm">
          <Link href="/auth/login" className="text-[#22c55e] hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  )
}
