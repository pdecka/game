'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { adminAuthService } from '@/admin/services/adminAuthService'

export default function AdminRootPage() {
  const router = useRouter()

  useEffect(() => {
    if (adminAuthService.isAuthenticated() && adminAuthService.isAdminRole()) {
      router.replace('/admin/dashboard')
      return
    }
    router.replace('/admin/login')
  }, [router])

  return null
}

