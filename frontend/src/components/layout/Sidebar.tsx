'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu,
  X,
  Users,
  FileText,
  TrendingUp,
  Shield,
  MessageCircle,
  Star,
  Dices,
  Trophy,
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
  { label: 'Live Support', comingSoon: true, icon: MessageCircle },
]

export function Sidebar({ collapsed, onToggle, mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const isCollapsed = mobileOpen ? false : collapsed

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

  const casinoActive = pathname === '/casino' || Boolean(pathname?.startsWith('/games'))
  const sportsActive = Boolean(pathname?.startsWith('/sports'))

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
        className={clsx(
          'flex h-screen flex-col border-r border-line bg-sidebar transition-[width,transform] duration-300 ease-in-out',
          'fixed inset-y-0 left-0 z-50 max-md:w-sidebar',
          mobileOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full',
          'md:static md:z-auto md:translate-x-0',
          isCollapsed ? 'md:w-sidebar-sm' : 'md:w-sidebar',
        )}
      >
        <div className={clsx('relative border-b border-line px-3', isCollapsed ? 'py-3' : 'py-4')}>
          <button
            type="button"
            onClick={() => {
              if (mobileOpen) onMobileClose?.()
              else onToggle()
            }}
            className="icon-btn absolute right-2 top-2 h-9 w-9"
            aria-label={mobileOpen || !isCollapsed ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {mobileOpen || !isCollapsed ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          <Link
            href="/"
            onClick={handleNavClick}
            className={clsx('flex items-center justify-center', !isCollapsed && 'pr-8')}
          >
            <img
              src="/logo-vertical.png"
              alt="Arena Bet"
              className={clsx(
                'w-auto object-contain',
                isCollapsed ? 'h-12' : 'h-20',
              )}
            />
          </Link>
        </div>

        <div className={clsx('flex-1 overflow-y-auto py-4', isCollapsed ? 'px-2' : 'px-3')}>
          {!isCollapsed && (
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">Play</p>
          )}
          <nav className="space-y-1">
            <Link
              href="/casino"
              onClick={handleNavClick}
              title="Casino"
              className={clsx('nav-item', casinoActive && 'nav-item-active', isCollapsed && 'justify-center px-0')}
            >
              <Dices className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span>Casino</span>}
            </Link>
            <Link
              href="/sports"
              onClick={handleNavClick}
              title="Sports"
              className={clsx('nav-item', sportsActive && 'nav-item-active', isCollapsed && 'justify-center px-0')}
            >
              <Trophy className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span>Sports</span>}
            </Link>
          </nav>

          <div className="my-4 h-px bg-line" />

          {!isCollapsed && (
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">More</p>
          )}
          <nav className="space-y-1">
            {secondaryItems.map((item) => {
              const Icon = item.icon
              const active = Boolean(item.href && pathname?.startsWith(item.href))
              const className = clsx(
                'nav-item',
                active && 'nav-item-active',
                isCollapsed && 'justify-center px-0',
              )
              const content = (
                <>
                  <Icon className="h-4 w-4 shrink-0" />
                  {!isCollapsed && (
                    <span className="flex min-w-0 flex-col items-start">
                      <span>{item.label}</span>
                      {item.comingSoon ? (
                        <span className="text-[10px] font-medium normal-case tracking-normal text-ink-3">Coming soon</span>
                      ) : null}
                    </span>
                  )}
                </>
              )

              if (item.href) {
                return (
                  <Link key={item.label} href={item.href} className={className} onClick={handleNavClick} title={item.label}>
                    {content}
                  </Link>
                )
              }

              return (
                <button key={item.label} type="button" className={className} onClick={handleNavClick} title={item.label}>
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
