import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import {
  Bell,
  MessageCircle,
  Search,
  User,
  Wallet2,
  MessageSquareText,
  Ticket,
  ChevronDown,
  LogOut,
  Settings,
  History,
} from 'lucide-react'

type NavbarProps = {
  onToggleSidebar: () => void
  onOpenWallet: () => void
  onOpenSearch: () => void
  onToggleNotifications: () => void
  onToggleChat: () => void
  onToggleBetslip: () => void
  showNotifications: boolean
  showChat: boolean
  showBetslip: boolean
}

export function Navbar({
  onToggleSidebar,
  onOpenWallet,
  onOpenSearch,
  onToggleNotifications,
  onToggleChat,
  onToggleBetslip,
  showNotifications,
  showChat,
  showBetslip,
}: NavbarProps) {
  const { user, wallet, walletLoading, logout } = useAuth() as any
  const pathname = usePathname()
  const onSports = Boolean(pathname?.startsWith('/sports'))
  const [exposure, setExposure] = useState(0)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 })
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    const updatePosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        setDropdownPosition({
          top: rect.bottom,
          right: window.innerWidth - rect.right
        })
      }
    }

    if (isUserMenuOpen) {
      updatePosition()
      window.addEventListener('resize', updatePosition)
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      window.removeEventListener('resize', updatePosition)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isUserMenuOpen])

  useEffect(() => {
    if (!onSports || !user) {
      setExposure(0)
      return
    }
    let cancelled = false
    api
      .get('/sports/bets/my')
      .then((response) => {
        const rows = Array.isArray(response.data) ? response.data : []
        const openStake = rows
          .filter((bet: { status?: string; stake?: number }) => String(bet?.status || '').toLowerCase() === 'pending')
          .reduce((sum: number, bet: { stake?: number }) => sum + Number(bet?.stake || 0), 0)
        if (!cancelled) setExposure(openStake)
      })
      .catch(() => {
        if (!cancelled) setExposure(0)
      })
    return () => {
      cancelled = true
    }
  }, [onSports, user, wallet?.INR])

  const available = Number(wallet?.INR ?? 0)
  const balance =
    onSports && user
      ? `₹${available.toFixed(2)} (₹${exposure.toFixed(2)})`
      : walletLoading || !wallet?.INR
        ? '₹0.00'
        : `₹${available.toFixed(2)}`

  return (
    <header className="flex h-14 flex-shrink-0 items-center justify-between gap-2 border-b border-line bg-white/95 px-2 backdrop-blur sm:h-header sm:px-4">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="icon-btn md:hidden"
          aria-label="Open menu"
        >
          <span className="flex flex-col gap-1.5">
            <span className="h-0.5 w-4 rounded bg-ink" />
            <span className="h-0.5 w-4 rounded bg-ink" />
            <span className="h-0.5 w-4 rounded bg-ink" />
          </span>
        </button>

        <Link href="/" className="hidden min-w-0 items-center sm:flex">
          <p className="text-sm font-semibold text-ink">Casino • Sports</p>
        </Link>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-center px-1 sm:px-4">
        <button
          type="button"
          onClick={onOpenWallet}
          className="flex max-w-full items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-2.5 py-1.5 text-xs text-brand-2 transition hover:bg-brand/20 sm:gap-3 sm:px-4"
        >
          <Wallet2 className="h-4 w-4 shrink-0" />
          <span className="odds-num truncate font-semibold text-ink" title={onSports && user ? 'Balance (exposure)' : 'Balance'}>
            {balance}
          </span>
          <span className="hidden rounded-full bg-brand/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-brand sm:inline">
            Wallet
          </span>
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <button type="button" onClick={onOpenSearch} className="icon-btn" aria-label="Search">
          <Search className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onToggleNotifications}
          className="icon-btn relative hidden sm:inline-flex"
          aria-label="Notifications"
          aria-pressed={showNotifications}
        >
          <Bell className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onToggleChat}
          className="icon-btn hidden sm:inline-flex"
          aria-label="Chat"
          aria-pressed={showChat}
        >
          <MessageCircle className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onToggleBetslip}
          className="icon-btn hidden md:inline-flex"
          aria-label="Bet slip"
          aria-pressed={showBetslip}
        >
          <Ticket className="h-4 w-4" />
        </button>

        {user ? (
          <div className="relative ml-1">
            <button
              ref={buttonRef}
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 rounded-full border border-line bg-elevated px-2 py-1 text-xs text-ink hover:bg-brand/10"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/15 text-brand">
                {String(user?.username || 'U').slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden max-w-[120px] truncate sm:inline">
                {user?.username}
              </span>
              <ChevronDown className="h-3 w-3" />
            </button>
            {isUserMenuOpen &&
              createPortal(
                <div
                  className="fixed right-4 top-16 z-[99999] w-56 rounded-xl border border-line bg-card py-2 text-sm text-ink shadow-panel"
                  style={{ top: dropdownPosition.top, right: dropdownPosition.right }}
                >
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-2 transition-colors hover:bg-brand/10"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenWallet()
                      setIsUserMenuOpen(false)
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-brand/10"
                  >
                    <Wallet2 className="h-4 w-4" />
                    <span>Wallet</span>
                  </button>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-2 transition-colors hover:bg-brand/10"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <History className="h-4 w-4" />
                    <span>History</span>
                  </Link>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-2 transition-colors hover:bg-brand/10"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                  <div className="my-1 border-t border-line"></div>
                  <button
                    type="button"
                    onClick={() => {
                      logout()
                      setIsUserMenuOpen(false)
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left text-danger transition-colors hover:bg-danger-muted"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>,
                document.body
              )}
          </div>
        ) : (
          <>
            <Link href="/auth/login">
              <Button
                variant="outline"
                size="sm"
                className="border-transparent bg-transparent px-2 text-xs font-medium text-ink-2 hover:bg-brand/10 hover:text-ink sm:px-3"
              >
                Login
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button
                size="sm"
                className="px-2.5 text-xs sm:px-4"
              >
                Register
              </Button>
            </Link>
          </>
        )}
      </div>
    </header>
  )
}

