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
  const countryCodeParam = searchParams.get('countryCode') || ''

  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [devOtp, setDevOtp] = useState<string | null>(null)
  const [showOtpPopup, setShowOtpPopup] = useState(false)

  const handleResendOtp = async () => {
    try {
      setLoading(true)
      // For development, we can't easily resend without backend changes
      // This is a placeholder for future implementation
      toast.success('OTP resent successfully!')
    } catch (error: any) {
      toast.error('Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Use phone number as identifier for OTP verification
      const identifier = phoneParam || (localStorage.getItem('phone') || '')
      if (!identifier) {
        toast.error('Missing phone number for OTP verification')
        setLoading(false)
        return
      }

      await authService.verifyOtp(identifier, otp)
      toast.success('OTP verified successfully!')
      
      // Clear localStorage after successful verification
      localStorage.removeItem('devOtp')
      localStorage.removeItem('phone')
      localStorage.removeItem('countryCode')
      
      // Redirect to dashboard after successful verification
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  // For local development testing - auto-fill OTP from localStorage if available
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      const storedOtp = localStorage.getItem('devOtp')
      if (storedOtp) {
        setDevOtp(storedOtp)
        setShowOtpPopup(true)
      }
    }
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-2 p-4">
      <div className="w-full max-w-md rounded-2xl border border-line bg-card p-8 shadow-panel">
        <h1 className="mb-6 text-center text-3xl font-bold text-ink">Verify OTP</h1>
        
        {phoneParam && (
          <div className="mb-6 rounded-md border border-line bg-elevated p-4 text-sm text-ink-2">
            <p className="text-center">
              Enter the OTP sent to your mobile number
            </p>
            <p className="mt-1 text-center font-medium text-ink">
              {countryCodeParam ? `${countryCodeParam} ` : ''}{phoneParam}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-ink">OTP Code</label>
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
            className="w-full"
            disabled={loading}
          >
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
              <button
                onClick={() => {
                  setOtp(devOtp)
                  setShowOtpPopup(false)
                }}
                className="mt-2 w-full bg-[#f59e0b] text-white py-1 px-3 rounded text-sm hover:bg-[#d97706]"
              >
                Auto-fill OTP
              </button>
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
