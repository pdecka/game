'use client'

import AdminRoute from '@/admin/routes/AdminRoute'
import AdminLayout from '@/admin/components/Layout'

export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminRoute>
      <AdminLayout>{children}</AdminLayout>
    </AdminRoute>
  )
}

