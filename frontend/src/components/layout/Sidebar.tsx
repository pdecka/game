'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FiMenu, FiX, FiUsers, FiFileText, FiTrendingUp, FiShield, FiMessageCircle, FiStar } from 'react-icons/fi'

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

type SidebarProps = {
  collapsed: boolean
  onToggle: () => void
  /** Off-canvas open state for viewports below `md`. */
  mobileOpen?: boolean
  onMobileClose?: () => void
}

const menuItems = [
  { label: 'Affiliate', href: '/affiliate', icon: FiUsers },
  { label: 'VIP Club', comingSoon: true, icon: FiStar },
  { label: 'Blog', href: '/blog', icon: FiFileText },
  { label: 'Sponsorships', comingSoon: true, icon: FiTrendingUp },
  { label: 'Responsible Gambling', icon: FiShield },
  { label: 'Live Support', icon: FiMessageCircle },
]

export function Sidebar({ collapsed, onToggle, mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  // On mobile drawer, always show the expanded layout for usability.
  const isCollapsed = mobileOpen ? false : collapsed

  // Close the mobile drawer after route changes.
  useEffect(() => {
    if (mobileOpen) onMobileClose?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileOpen])

  const handleNavClick = () => {
    if (mobileOpen) onMobileClose?.()
  }

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onMobileClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          'flex h-screen flex-col transition-[width,transform] duration-300 ease-in-out',
          'bg-gradient-to-b from-slate-900 to-slate-800',
          'border border-white/5 inner-shadow-[inset_0_0_40px_rgba(255,255,255,0.16)]',
          // Mobile: off-canvas drawer. Desktop: static column.
          'fixed inset-y-0 left-0 z-50 max-md:w-[17rem]',
          mobileOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full',
          'md:static md:z-auto md:translate-x-0',
          isCollapsed ? 'md:w-20' : 'md:w-[17rem]',
        )}
      >
        {/* Top Row Layout */}
        <div
          className={cn(
            'flex items-center gap-2 px-4 py-4',
            isCollapsed ? 'flex-col gap-3' : 'flex-row justify-between',
          )}
        >
          <button
            type="button"
            onClick={() => {
              if (mobileOpen) onMobileClose?.()
              else onToggle()
            }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-slate-200 hover:bg-white/20 hover:scale-105 transition-all duration-200 shadow-lg"
            aria-label={mobileOpen || !isCollapsed ? 'Close sidebar' : 'Open sidebar'}
          >
            {mobileOpen || !isCollapsed ? <FiX className="text-lg" /> : <FiMenu className="text-lg" />}
          </button>

          {!isCollapsed && (
            <div className="flex gap-2">
              <Link
                href="/casino"
                onClick={handleNavClick}
                className={cn(
                  'px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 relative overflow-hidden',
                  'hover:scale-105',
                  'bg-gradient-to-r from-emerald-600/20 to-sky-600/20',
                  'border border-emerald-500/30 hover:border-emerald-500/50',
                  pathname === '/casino'
                    ? 'bg-gradient-to-r from-emerald-500 to-sky-500 text-white'
                    : 'text-white hover:text-white',
                )}
              >
                <span className="relative z-10 uppercase">Casino</span>
                <div
                  className={cn(
                    'absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-emerald-400/60 to-emerald-400/0',
                    'animate-shimmer opacity-100',
                  )}
                />
              </Link>

              <Link
                href="/sports"
                onClick={handleNavClick}
                className={cn(
                  'px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 relative overflow-hidden',
                  'hover:scale-105',
                  'bg-gradient-to-r from-orange-600/20 to-red-600/20',
                  'border border-orange-500/30 hover:border-orange-500/50',
                  pathname === '/sports'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                    : 'text-white hover:text-white',
                )}
              >
                <span className="relative z-10 uppercase">Sports</span>
                <div
                  className={cn(
                    'absolute inset-0 bg-gradient-to-r from-orange-400/0 via-orange-400/60 to-orange-400/0',
                    'animate-shimmer opacity-100',
                  )}
                />
              </Link>
            </div>
          )}

          {isCollapsed && (
            <div className="flex flex-col gap-3">
              <Link
                href="/casino"
                className={cn(
                  'h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300 relative overflow-hidden',
                  'hover:scale-105',
                  'bg-gradient-to-r from-emerald-600/20 to-sky-600/20',
                  'border border-emerald-500/30 hover:border-emerald-500/50',
                  pathname === '/casino'
                    ? 'bg-gradient-to-r from-emerald-500 to-sky-500 text-white'
                    : 'text-white hover:text-white',
                )}
                title="Casino"
              >
                <span className="relative z-10 font-bold text-sm">C</span>
                <div
                  className={cn(
                    'absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-emerald-400/100 to-emerald-400/0',
                    'animate-shimmer opacity-100',
                  )}
                />
              </Link>

              <Link
                href="/sports"
                className={cn(
                  'h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300 relative overflow-hidden',
                  'hover:scale-105',
                  'bg-gradient-to-r from-orange-600/20 to-red-600/20',
                  'border border-orange-500/30 hover:border-orange-500/50',
                  pathname === '/sports'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                    : 'text-white hover:text-white',
                )}
                title="Sports"
              >
                <span className="relative z-10 font-bold text-sm">S</span>
                <div
                  className={cn(
                    'absolute inset-0 bg-gradient-to-r from-orange-400/0 via-orange-400/100 to-orange-400/0',
                    'animate-shimmer opacity-100',
                  )}
                />
              </Link>
            </div>
          )}
        </div>

        <div className={cn('flex-1 overflow-y-auto px-3 py-4', isCollapsed ? 'px-2' : 'px-3')}>
          <div className={cn('bg-white/[0.03] border border-white/5 rounded-2xl p-3', isCollapsed ? 'p-2' : 'p-3')}>
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const content = (
                  <>
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-slate-300 group-hover:bg-white/20 transition-colors">
                      <Icon className="text-sm" />
                    </span>
                    {!isCollapsed && (
                      <div className="flex flex-col items-start">
                        <span className="text-[13px] font-medium text-slate-200 group-hover:text-white transition-colors">
                          {item.label}
                        </span>
                        {item.comingSoon && (
                          <span className="text-[10px] text-gray-400 font-medium">Coming Soon</span>
                        )}
                      </div>
                    )}
                  </>
                )

                const className = cn(
                  'group flex items-center gap-3 rounded-xl py-2.5 w-full transition-all duration-300',
                  'hover:bg-white/5 hover:translate-x-1 hover:shadow-lg',
                  'text-slate-300 hover:text-white',
                  isCollapsed && 'justify-center',
                )

                if (item.href) {
                  return (
                    <Link key={item.label} href={item.href} className={className} onClick={handleNavClick}>
                      {content}
                    </Link>
                  )
                }

                return (
                  <button key={item.label} type="button" className={className} onClick={handleNavClick}>
                    {content}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>
      </aside>
    </>
  )
}
