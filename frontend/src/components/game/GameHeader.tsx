'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Bell, User, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GameHeaderProps {
  onSidebarToggle?: () => void
  walletBalance?: number
  showSidebar?: boolean
}

export default function GameHeader({ 
  onSidebarToggle, 
  walletBalance = 0,
  showSidebar = false 
}: GameHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false)

  return (
    <header className="fixed left-0 right-0 top-0 z-[70] border-b border-line bg-white/95 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side - Logo and Menu */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSidebarToggle}
            className="text-ink hover:bg-brand/10 lg:hidden"
          >
            {showSidebar ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
              <span className="text-sm font-bold text-white">G</span>
            </div>
            <span className="hidden font-semibold text-ink sm:block">Arena Bet</span>
          </Link>
        </div>

        {/* Right side - Wallet and Actions */}
        <div className="flex items-center gap-3">
          {/* Wallet Balance */}
          <div className="hidden items-center gap-2 rounded-lg border border-line bg-elevated px-3 py-2 sm:flex">
            <span className="text-xs text-ink-3">Balance</span>
            <span className="odds-num text-sm font-semibold text-ink">₹{walletBalance.toFixed(2)}</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative text-ink hover:bg-brand/10"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-brand"></span>
            </Button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 rounded-lg border border-line bg-white p-4 shadow-panel">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-ink">Notifications</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-ink-3 hover:text-ink"
                  >
                    Clear
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="rounded-lg bg-elevated p-2">
                    <p className="text-xs text-ink">Welcome to the platform!</p>
                    <p className="mt-1 text-[10px] text-ink-3">2 minutes ago</p>
                  </div>
                  <div className="rounded-lg bg-elevated p-2">
                    <p className="text-xs text-ink">New promotion available</p>
                    <p className="mt-1 text-[10px] text-ink-3">1 hour ago</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <Button
            variant="ghost"
            size="sm"
            className="text-ink hover:bg-brand/10"
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
