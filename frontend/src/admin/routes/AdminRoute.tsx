'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { adminAuthService } from '../services/adminAuthService'

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const token = adminAuthService.getToken()
    const hasRole = adminAuthService.isAdminRole()

    if (!token || !hasRole) {
      router.replace('/admin/login')
      return
    }

    setAllowed(true)
  }, [pathname, router])

  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-[#e2e8f0]">
        Checking admin session...
      </div>
    )
  }

  return <>{children}</>
}

