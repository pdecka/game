'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { adminAuthService } from '../services/adminAuthService'
import { ADMIN_NAV_ITEMS } from '../routes/AdminRoutes'
import { FiMenu, FiX, FiBell, FiLogOut } from 'react-icons/fi'
import { defaultIstTwoDayRange, istDayBounds } from '../lib/istDates'

type HeaderProps = {
  onToggleMobileSidebar: () => void
  mobileSidebarOpen: boolean
}

export default function Header({ onToggleMobileSidebar, mobileSidebarOpen }: HeaderProps) {
  const admin = adminAuthService.getCurrentAdmin()
  const pathname = usePathname()
  const title = ADMIN_NAV_ITEMS.find((item) => item.href === pathname)?.label || 'Admin'
  const [live, setLive] = useState<{
    activeUsers: number
    pendingDeposits: number
    pendingWithdrawals: number
    profitLoss: number
  } | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const bounds = istDayBounds(defaultIstTwoDayRange().from, defaultIstTwoDayRange().to)
        const data = await adminAuthService.getDashboard(bounds)
        if (mounted) {
          setLive({
            activeUsers: data.activeUsers,
            pendingDeposits: data.pendingDeposits,
            pendingWithdrawals: data.pendingWithdrawals,
            profitLoss: data.profitLoss,
          })
        }
      } catch {
        // keep last known stats
      }
    }
    void load()
    const timer = window.setInterval(() => {
      if (document.hidden) return
      void load()
    }, 8000)
    return () => {
      mounted = false
      window.clearInterval(timer)
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 h-14 sm:h-16 bg-white border-b border-[#bbf7d0] shadow-sm">
      <div className="h-full px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#f0fdf4] text-[#16a34a] hover:bg-[#dcfce7] transition-colors"
            aria-label="Toggle sidebar"
          >
            {mobileSidebarOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
          </button>

          <div className="hidden sm:block">
            <p className="text-[10px] sm:text-xs uppercase tracking-wide text-[#16a34a]">Admin</p>
            <h1 className="text-sm sm:text-base font-semibold text-[#14532d]">{title}</h1>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-2">
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold">
            <span className="rounded-md bg-[#f0fdf4] px-2 py-1 text-[#166534] border border-[#bbf7d0]">
              Players {live ? live.activeUsers : '—'}
            </span>
            <span className="rounded-md bg-[#f0fdf4] px-2 py-1 text-[#166534] border border-[#bbf7d0]">
              Pending D {live ? live.pendingDeposits : '—'}
            </span>
            <span className="rounded-md bg-[#f0fdf4] px-2 py-1 text-[#166534] border border-[#bbf7d0]">
              Pending W {live ? live.pendingWithdrawals : '—'}
            </span>
            <span className="rounded-md bg-[#16a34a] px-2 py-1 text-white">
              P/L {live ? `₹${Number(live.profitLoss).toFixed(0)}` : '—'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button className="relative hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f0fdf4] text-[#16a34a] hover:bg-[#dcfce7] transition-colors">
            <FiBell className="h-4 w-4" />
            {live && live.pendingDeposits + live.pendingWithdrawals > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 px-0.5 items-center justify-center rounded-full bg-[#16a34a] text-[9px] text-white">
                {live.pendingDeposits + live.pendingWithdrawals}
              </span>
            ) : null}
          </button>

          <div className="flex items-center gap-2">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-[#16a34a]" />
            </div>
            <span className="hidden sm:block text-xs sm:text-sm text-[#14532d]">
              {admin?.username || admin?.email?.split('@')[0] || 'Admin'}
            </span>
          </div>

          <button
            onClick={() => adminAuthService.logout()}
            className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-md bg-[#16a34a] hover:bg-[#15803d] text-white text-xs sm:text-sm font-medium transition-all duration-200"
          >
            <FiLogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}
