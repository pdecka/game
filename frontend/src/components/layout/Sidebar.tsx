'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Users,
  FileText,
  TrendingUp,
  Shield,
  Star,
  Dices,
  Trophy,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { clsx } from 'clsx'

type SidebarProps = {
  collapsed: boolean
  onToggle: () => void
  mobileOpen?: boolean
  onMobileClose?: () => void
}

const secondaryItems = [
  { label: 'Affiliate', href: '/affiliate', icon: Users },
  { label: 'VIP Club', comingSoon: true, icon: Star },
  { label: 'Blog', href: '/blog', icon: FileText },
  { label: 'Sponsorships', comingSoon: true, icon: TrendingUp },
  { label: 'Responsible Gambling', comingSoon: true, icon: Shield },
]

function itemClass(active: boolean, collapsed: boolean) {
  return clsx(
    'nav-item',
    active && 'nav-item-active',
    collapsed ? 'justify-center px-0' : 'px-3',
  )
}

export function Sidebar({ collapsed, onToggle, mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const pathRef = useRef(pathname)
  const isCollapsed = mobileOpen ? false : collapsed
  const showCloseRail = mobileOpen || !isCollapsed

  useEffect(() => {
    if (pathRef.current === pathname) return
    pathRef.current = pathname
    onMobileClose?.()
  }, [pathname, onMobileClose])

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

  const handleRailToggle = () => {
    if (mobileOpen) onMobileClose?.()
    else onToggle()
  }

  const casinoActive = pathname === '/casino' || Boolean(pathname?.startsWith('/games'))
  const sportsActive = Boolean(pathname?.startsWith('/sports'))

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/35 backdrop-blur-[6px] lg:hidden"
          onClick={onMobileClose}
          aria-hidden
        />
      )}

      <aside
        className={clsx(
          'site-sidebar flex h-screen flex-col overflow-visible border-r',
          'max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-50 w-[min(18rem,88vw)]',
          mobileOpen && 'is-open',
          'lg:relative lg:z-40',
          isCollapsed ? 'lg:w-sidebar-sm' : 'lg:w-sidebar',
        )}
      >
        <div
          className={clsx(
            'flex items-center justify-center border-b border-line bg-white',
            isCollapsed ? 'px-2 py-4' : 'px-4 py-5',
          )}
        >
          <Link href="/" onClick={handleNavClick} className="flex items-center justify-center">
            <img
              src="/logo-vertical.png"
              alt="Arena Bet"
              className={clsx(
                'w-auto object-contain transition-[height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
                isCollapsed ? 'h-11' : 'h-20',
              )}
            />
          </Link>
        </div>

        <button
          type="button"
          onClick={handleRailToggle}
          className={clsx(
            'absolute top-[4rem] z-[90] flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full',
            'border-2 border-[#16a34a] bg-white text-[#16a34a]',
            'shadow-[0_6px_16px_rgba(11,31,18,0.22)]',
            'transition-all duration-300 hover:bg-[#14532d] hover:text-white',
            'right-0 translate-x-1/2',
            !mobileOpen && 'max-lg:hidden',
          )}
          aria-label={showCloseRail ? 'Collapse sidebar' : 'Expand sidebar'}
          title={showCloseRail ? 'Collapse' : 'Expand'}
        >
          {showCloseRail ? <ChevronsLeft className="h-4 w-4" strokeWidth={2.5} /> : <ChevronsRight className="h-4 w-4" strokeWidth={2.5} />}
        </button>

        <div className={clsx('flex-1 overflow-y-auto overflow-x-hidden py-4', isCollapsed ? 'px-2' : 'px-3')}>
          {!isCollapsed && (
            <p className="mb-2.5 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">Play</p>
          )}
          <nav className="space-y-2">
            <Link
              href="/casino"
              onClick={handleNavClick}
              title="Casino"
              className={itemClass(casinoActive, isCollapsed)}
            >
              <span
                className={clsx(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                  casinoActive ? 'bg-white/15 text-white' : 'bg-brand/10 text-brand-2',
                )}
              >
                <Dices className="h-4 w-4" />
              </span>
              {!isCollapsed && <span>Casino</span>}
            </Link>
            <Link
              href="/sports"
              onClick={handleNavClick}
              title="Sports"
              className={itemClass(sportsActive, isCollapsed)}
            >
              <span
                className={clsx(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                  sportsActive ? 'bg-white/15 text-white' : 'bg-brand/10 text-brand-2',
                )}
              >
                <Trophy className="h-4 w-4" />
              </span>
              {!isCollapsed && <span>Sports</span>}
            </Link>
          </nav>

          <div className="my-4 h-px bg-white/25" />

          {!isCollapsed && (
            <p className="mb-2.5 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">More</p>
          )}
          <nav className="space-y-1.5">
            {secondaryItems.map((item) => {
              const Icon = item.icon
              const active = Boolean(item.href && pathname?.startsWith(item.href))
              const content = (
                <>
                  <span
                    className={clsx(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                      active ? 'bg-white/15 text-white' : 'bg-brand/10 text-brand-2',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  {!isCollapsed && (
                    <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                      <span className="truncate">{item.label}</span>
                      {item.comingSoon ? (
                        <span
                          className={clsx(
                            'shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide',
                            active ? 'bg-white/20 text-white' : 'bg-brand/10 text-brand-2',
                          )}
                        >
                          Soon
                        </span>
                      ) : null}
                    </span>
                  )}
                </>
              )

              if (item.href) {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={itemClass(active, isCollapsed)}
                    onClick={handleNavClick}
                    title={item.label}
                  >
                    {content}
                  </Link>
                )
              }

              return (
                <button
                  key={item.label}
                  type="button"
                  className={itemClass(active, isCollapsed)}
                  onClick={handleNavClick}
                  title={`${item.label} — coming soon`}
                >
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
