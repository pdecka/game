'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ADMIN_NAV_ITEMS } from '../routes/AdminRoutes'

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-[#ffffff] border-r border-[#e2e8f0] h-screen fixed left-0 top-0 p-4 shadow-sm overflow-y-auto">
      <div className="text-xl font-semibold text-[#020617] mb-1">Admin Panel</div>
      <p className="text-xs text-[#64748b] mb-6">Casino Control Center</p>

      <nav className="space-y-2">
        {ADMIN_NAV_ITEMS.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22c55e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#ffffff] ${
                active
                  ? 'bg-[#22c55e] text-[#ffffff] shadow-sm'
                  : 'text-[#64748b] hover:bg-[#e2e8f0] hover:text-[#020617]'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
