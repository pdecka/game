'use client'

import { usePathname } from 'next/navigation'
import { adminAuthService } from '../services/adminAuthService'
import { ADMIN_NAV_ITEMS } from '../routes/AdminRoutes'

export default function Header() {
  const admin = adminAuthService.getCurrentAdmin()
  const pathname = usePathname()
  const title = ADMIN_NAV_ITEMS.find((item) => item.href === pathname)?.label || 'Admin'

  return (
    <header className="sticky top-0 z-10 h-16 bg-[#ffffff] border-b border-[#e2e8f0] shadow-sm">
      <div className="h-full px-6 flex items-center justify-between gap-4">
        <div className="shrink-0">
          <p className="text-xs uppercase tracking-wide text-[#64748b]">Admin</p>
          <h1 className="text-base font-semibold text-[#020617]">{title}</h1>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 w-full max-w-xl">
            <input
              placeholder="Global search..."
              className="flex-1 rounded-lg bg-[#e2e8f0] border border-[#e2e8f0] px-3 py-2 text-[#020617] placeholder:text-[#64748b] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
            />
            <input
              type="date"
              className="w-40 rounded-lg bg-[#e2e8f0] border border-[#e2e8f0] px-3 py-2 text-[#020617] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] hidden md:block"
            />
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2">
            <span className="rounded-md bg-[#e2e8f0] px-2 py-1 text-xs text-[#64748b] border border-[#e2e8f0]">Live Users 3,292</span>
            <span className="rounded-md bg-[#22c55e]/15 px-2 py-1 text-xs text-[#22c55e] border border-[#22c55e]/30">Revenue +5.1%</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#22c55e]/15 border border-[#e2e8f0] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
            </div>
            <span className="text-sm text-[#64748b]">{admin?.email || 'Admin'}</span>
          </div>

          <button
            onClick={() => adminAuthService.logout()}
            className="px-3 py-1.5 rounded-md bg-[#22c55e] hover:opacity-90 text-[#ffffff] text-sm font-medium transition-all duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

