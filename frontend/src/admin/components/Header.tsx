'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { adminAuthService } from '../services/adminAuthService'
import { ADMIN_NAV_ITEMS } from '../routes/AdminRoutes'
import { FiMenu, FiX, FiSearch, FiBell, FiLogOut } from 'react-icons/fi'

type HeaderProps = {
  onToggleMobileSidebar: () => void
  mobileSidebarOpen: boolean
}

export default function Header({ onToggleMobileSidebar, mobileSidebarOpen }: HeaderProps) {
  const admin = adminAuthService.getCurrentAdmin()
  const pathname = usePathname()
  const title = ADMIN_NAV_ITEMS.find((item) => item.href === pathname)?.label || 'Admin'
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 h-14 sm:h-16 bg-[#ffffff] border-b border-[#e2e8f0] shadow-sm">
      <div className="h-full px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Mobile Menu Toggle */}
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#e2e8f0] text-[#64748b] hover:bg-[#cbd5e1] transition-colors"
            aria-label="Toggle sidebar"
          >
            {mobileSidebarOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
          </button>

          {/* Title */}
          <div className="hidden sm:block">
            <p className="text-[10px] sm:text-xs uppercase tracking-wide text-[#64748b]">Admin</p>
            <h1 className="text-sm sm:text-base font-semibold text-[#020617]">{title}</h1>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 flex items-center justify-center px-2">
          <div className="flex items-center gap-2 w-full max-w-xl">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748b]" />
              <input
                placeholder="Global search..."
                className="w-full rounded-lg bg-[#e2e8f0] border border-[#e2e8f0] pl-10 pr-3 py-2 text-sm text-[#020617] placeholder:text-[#64748b] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
              />
            </div>
            <input
              type="date"
              className="w-24 sm:w-40 rounded-lg bg-[#e2e8f0] border border-[#e2e8f0] px-2 sm:px-3 py-2 text-sm text-[#020617] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] hidden md:block"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Stats - Hidden on small screens */}
          <div className="hidden lg:flex items-center gap-2">
            <span className="rounded-md bg-[#e2e8f0] px-2 py-1 text-xs text-[#64748b] border border-[#e2e8f0]">
              Live Users 3,292
            </span>
            <span className="rounded-md bg-[#22c55e]/15 px-2 py-1 text-xs text-[#22c55e] border border-[#22c55e]/30">
              Revenue +5.1%
            </span>
          </div>

          {/* Notification Bell */}
          <button className="relative hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#e2e8f0] text-[#64748b] hover:bg-[#cbd5e1] transition-colors">
            <FiBell className="h-4 w-4" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#22c55e] text-[9px] text-white">
              3
            </span>
          </button>

          {/* User Info */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-[#22c55e]/15 border border-[#e2e8f0] flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-[#22c55e]" />
            </div>
            <span className="hidden sm:block text-xs sm:text-sm text-[#64748b]">
              {admin?.email?.split('@')[0] || 'Admin'}
            </span>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => adminAuthService.logout()}
            className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-md bg-[#22c55e] hover:opacity-90 text-[#ffffff] text-xs sm:text-sm font-medium transition-all duration-200"
          >
            <FiLogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}

