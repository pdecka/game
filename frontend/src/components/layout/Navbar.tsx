import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
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

  const balance =
    walletLoading || !wallet?.INR ? '₹0.00' : `₹${Number(wallet.INR).toFixed(2)}`

  return (
    <header className="flex h-14 sm:h-16 flex-shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-[#101b26]/95 px-2 sm:px-4 backdrop-blur">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-slate-200 hover:bg-white/10 md:hidden"
        >
          <span className="sr-only">Toggle sidebar</span>
          <span className="flex flex-col gap-1.5">
            <span className="h-0.5 w-4 rounded bg-white" />
            <span className="h-0.5 w-4 rounded bg-white" />
            <span className="h-0.5 w-4 rounded bg-white" />
          </span>
        </button>

        <Link href="/" className="flex min-w-0 items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1475e1] text-lg font-black text-white shadow-lg">
            G
          </span>
          <div className="hidden leading-tight sm:block">
            <p className="text-[10px] uppercase tracking-[0.32em] text-slate-500">
              Gaming Platform
            </p>
            <p className="text-xs font-semibold text-slate-100">Casino • Sports • Crypto</p>
          </div>
        </Link>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-center px-1 sm:px-4">
        <button
          type="button"
          onClick={onOpenWallet}
          className="flex max-w-full items-center gap-1.5 sm:gap-3 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 sm:px-4 py-1.5 text-xs text-emerald-100 shadow-sm transition hover:bg-emerald-500/20"
        >
          <Wallet2 className="h-4 w-4 shrink-0" />
          <span className="truncate font-semibold">{balance}</span>
          <span className="hidden rounded-full bg-emerald-500/40 px-2 py-0.5 text-[10px] uppercase tracking-wide sm:inline">
            Wallet
          </span>
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={onOpenSearch}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-200 hover:bg-white/10"
        >
          <Search className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onToggleNotifications}
          className="relative hidden h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-200 hover:bg-white/10 sm:inline-flex"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-emerald-400 text-[9px] text-black">
            3
          </span>
        </button>

        <button
          type="button"
          onClick={onToggleChat}
          className="hidden h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-200 hover:bg-white/10 sm:inline-flex"
        >
          <MessageCircle className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onToggleBetslip}
          className="hidden h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-200 hover:bg-white/10 md:inline-flex"
        >
          <Ticket className="h-4 w-4" />
        </button>

        {user ? (
          <div className="relative ml-1">
            <button
              ref={buttonRef}
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-2 py-1 text-xs text-slate-100 hover:bg-white/10"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-200">
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
                  className="fixed right-4 top-16 w-56 rounded-xl border border-white/10 bg-[#0f212e] py-2 text-sm text-slate-100 shadow-2xl z-[99999]"
                  style={{ top: dropdownPosition.top, right: dropdownPosition.right }}
                >
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors"
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
                    className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-white/5 transition-colors"
                  >
                    <Wallet2 className="h-4 w-4" />
                    <span>Wallet</span>
                  </button>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <History className="h-4 w-4" />
                    <span>History</span>
                  </Link>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                  <div className="border-t border-white/10 my-1"></div>
                  <button
                    type="button"
                    onClick={() => {
                      logout()
                      setIsUserMenuOpen(false)
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left text-red-300 hover:bg-red-500/10 transition-colors"
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
                className="border-transparent bg-transparent px-2 sm:px-3 text-xs font-medium text-white hover:bg-white/10"
              >
                Login
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button
                size="sm"
                className="bg-[#1475e1] px-2.5 sm:px-4 text-xs font-semibold text-white shadow-lg hover:bg-[#1b82f0]"
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

