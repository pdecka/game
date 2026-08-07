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
    <header className="fixed top-0 left-0 right-0 z-[70] bg-[#0f212e] border-b border-white/10 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side - Logo and Menu */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSidebarToggle}
            className="text-white hover:bg-white/10 lg:hidden"
          >
            {showSidebar ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-to-br from-emerald-400 to-sky-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="text-white font-semibold hidden sm:block">Gaming Platform</span>
          </Link>
        </div>

        {/* Right side - Wallet and Actions */}
        <div className="flex items-center gap-3">
          {/* Wallet Balance */}
          <div className="hidden sm:flex items-center gap-2 bg-[#1a2c38] px-3 py-2 rounded-lg border border-white/10">
            <span className="text-xs text-slate-400">Balance</span>
            <span className="text-sm font-semibold text-white">¥{walletBalance.toFixed(2)}</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              className="text-white hover:bg-white/10 relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-emerald-500 rounded-full"></span>
            </Button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-[#0f212e] border border-white/10 rounded-lg shadow-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">Notifications</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Clear
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-xs text-white">Welcome to the platform!</p>
                    <p className="text-[10px] text-slate-400 mt-1">2 minutes ago</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-xs text-white">New promotion available</p>
                    <p className="text-[10px] text-slate-400 mt-1">1 hour ago</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
