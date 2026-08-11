'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ADMIN_NAV_ITEMS } from '../routes/AdminRoutes'
import { FiHome, FiUsers, FiDollarSign, FiSettings, FiShield, FiBarChart2, FiFileText, FiActivity } from 'react-icons/fi'

type SidebarProps = {
  collapsed?: boolean
}

export default function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname()

  const iconMap: Record<string, React.ElementType> = {
    Dashboard: FiHome,
    Users: FiUsers,
    Payments: FiDollarSign,
    Games: FiActivity,
    Settings: FiSettings,
    Security: FiShield,
    Reports: FiBarChart2,
    Logs: FiFileText,
  }

  return (
    <aside className="h-full bg-[#ffffff] overflow-y-auto">
      <div className="p-3 sm:p-4">
        {/* Logo/Title */}
        {!collapsed && (
          <div className="mb-6">
            <div className="text-lg sm:text-xl font-semibold text-[#020617] mb-1">Admin Panel</div>
            <p className="text-xs text-[#64748b]">Casino Control Center</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="space-y-1 sm:space-y-2">
          {ADMIN_NAV_ITEMS.map((item) => {
            const active = pathname === item.href
            const Icon = iconMap[item.label] || FiHome

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-2 sm:gap-3 rounded-lg px-2 sm:px-3 py-2 sm:py-2.5 font-medium
                  transition-all duration-200 ease-in-out
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22c55e]
                  ${collapsed ? 'justify-center' : ''}
                  ${
                    active
                      ? 'bg-[#22c55e] text-[#ffffff] shadow-sm'
                      : 'text-[#64748b] hover:bg-[#e2e8f0] hover:text-[#020617]'
                  }
                `}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                {!collapsed && <span className="text-xs sm:text-sm">{item.label}</span>}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
