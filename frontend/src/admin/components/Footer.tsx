'use client'

import Link from 'next/link'

export default function AdminFooter() {
  return (
    <footer className="bg-[#f8fafc] border-t border-[#e2e8f0] mt-auto">
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#22c55e] text-sm font-bold text-white">
              G
            </div>
            <div>
              <p className="text-xs font-semibold text-[#020617]">Gaming Platform</p>
              <p className="text-[10px] text-[#64748b]">Admin Panel v1.0</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#64748b]">
            <Link href="/admin" className="hover:text-[#22c55e] transition-colors">
              Dashboard
            </Link>
            <Link href="/admin/users" className="hover:text-[#22c55e] transition-colors">
              Users
            </Link>
            <Link href="/admin/payments" className="hover:text-[#22c55e] transition-colors">
              Payments
            </Link>
            <Link href="/admin/games" className="hover:text-[#22c55e] transition-colors">
              Games
            </Link>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#64748b]">
            <span>© {new Date().getFullYear()} Gaming Platform</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">All rights reserved</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
