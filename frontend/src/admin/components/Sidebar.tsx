'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ADMIN_NAV_ITEMS } from '../routes/AdminRoutes'
import { FiHome, FiUsers, FiDollarSign, FiSettings, FiShield, FiBarChart2, FiFileText, FiActivity, FiClock } from 'react-icons/fi'

type SidebarProps = {
  collapsed?: boolean
  onNavigate?: () => void
}

export default function Sidebar({ collapsed = false, onNavigate }: SidebarProps) {
  const pathname = usePathname()

  const iconMap: Record<string, React.ElementType> = {
    Dashboard: FiHome,
    Users: FiUsers,
    'Bet History': FiClock,
    Payments: FiDollarSign,
    Games: FiActivity,
    Settings: FiSettings,
    Security: FiShield,
    Reports: FiBarChart2,
    Logs: FiFileText,
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#16a34a]">
      <nav className="admin-sidebar-scroll min-h-0 flex-1 space-y-1.5 px-3 py-3">
        {ADMIN_NAV_ITEMS.map((item) => {
          const active = pathname === item.href
          const Icon = iconMap[item.label] || FiHome

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`
                flex items-center gap-3 rounded-lg px-3 py-2.5 font-semibold
                transition-all duration-200 ease-in-out
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white
                ${collapsed ? 'justify-center' : ''}
                ${
                  active
                    ? 'bg-[#14532d] text-white shadow-sm'
                    : 'bg-white text-[#14532d] hover:bg-[#f0fdf4]'
                }
              `}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="text-sm leading-none">{item.label}</span>}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
