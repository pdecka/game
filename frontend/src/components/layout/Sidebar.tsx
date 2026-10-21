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

  const casinoActive = pathname === '/casino' || pathname?.startsWith('/games')
  const sportsActive = pathname?.startsWith('/sports')

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm md:hidden"
          onClick={onMobileClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          'flex h-screen flex-col transition-[width,transform] duration-300 ease-in-out',
          'border-r border-line bg-sidebar',
          'fixed inset-y-0 left-0 z-50 max-md:w-[17rem]',
          mobileOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full',
          'md:static md:z-auto md:translate-x-0',
          isCollapsed ? 'md:w-20' : 'md:w-[17rem]',
        )}
      >
        <div
          className={cn(
            'flex items-center gap-2 border-b border-line px-3 py-4',
            isCollapsed ? 'flex-col gap-3' : 'flex-row justify-between',
          )}
        >
          <button
            type="button"
            onClick={() => {
              if (mobileOpen) onMobileClose?.()
              else onToggle()
            }}
            className="icon-btn"
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
                  'rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wide transition duration-200',
                  casinoActive
                    ? 'bg-brand/15 text-brand'
                    : 'bg-elevated text-ink-2 hover:bg-brand/10 hover:text-ink',
                )}
              >
                Casino
              </Link>

              <Link
                href="/sports"
                onClick={handleNavClick}
                className={cn(
                  'rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wide transition duration-200',
                  sportsActive
                    ? 'bg-brand/15 text-brand'
                    : 'bg-elevated text-ink-2 hover:bg-brand/10 hover:text-ink',
                )}
              >
                Sports
              </Link>
            </div>
          )}

          {isCollapsed && (
            <div className="flex flex-col gap-3">
              <Link
                href="/casino"
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold transition duration-200',
                  casinoActive
                    ? 'bg-brand/15 text-brand'
                    : 'bg-elevated text-ink-2 hover:bg-brand/10 hover:text-ink',
                )}
                title="Casino"
              >
                C
              </Link>

              <Link
                href="/sports"
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold transition duration-200',
                  sportsActive
                    ? 'bg-brand/15 text-brand'
                    : 'bg-elevated text-ink-2 hover:bg-brand/10 hover:text-ink',
                )}
                title="Sports"
              >
                S
              </Link>
            </div>
          )}
        </div>

        <div className={cn('flex-1 overflow-y-auto py-4', isCollapsed ? 'px-2' : 'px-3')}>
          {!isCollapsed && (
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">Menu</p>
          )}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = Boolean(item.href && pathname?.startsWith(item.href))
              const content = (
                <>
                  <span
                    className={cn(
                      'inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                      active ? 'bg-brand/15 text-brand' : 'bg-elevated text-ink-2 group-hover:text-ink',
                    )}
                  >
                    <Icon className="text-sm" />
                  </span>
                  {!isCollapsed && (
                    <div className="flex flex-col items-start">
                      <span className={cn('text-[13px] font-medium', active ? 'text-ink' : 'text-ink-2 group-hover:text-ink')}>
                        {item.label}
                      </span>
                      {item.comingSoon && (
                        <span className="text-[10px] font-medium text-ink-3">Coming Soon</span>
                      )}
                    </div>
                  )}
                </>
              )

              const className = cn(
                'group flex w-full items-center gap-3 rounded-xl py-2.5 transition duration-200',
                active ? 'bg-brand/10' : 'hover:bg-elevated',
                isCollapsed && 'justify-center px-0',
                !isCollapsed && 'px-2',
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
      </aside>
    </>
  )
}
