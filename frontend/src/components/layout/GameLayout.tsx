'use client'

import { useState } from 'react'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { WalletModal } from './WalletModal'
import { SearchOverlay } from './SearchOverlay'
import { useAuth } from '@/context/AuthContext'

type GameLayoutProps = {
  children: React.ReactNode
}

export function GameLayout({ children }: GameLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [isWalletOpen, setIsWalletOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showBetslip, setShowBetslip] = useState(false)
  
  const { wallet, walletLoading } = useAuth() as any
  const walletLabel =
    walletLoading || !wallet?.INR ? '₹0.00' : `₹${Number(wallet.INR).toFixed(2)}`

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setMobileNavOpen((prev) => !prev)
      return
    }
    setIsSidebarCollapsed((prev) => !prev)
  }

  return (
    <main className="flex h-screen overflow-hidden bg-gradient-to-br from-[#0f212e] to-[#1a2c38] text-slate-100">
      <Sidebar
        collapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed((prev) => !prev)}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar
          onToggleSidebar={handleToggleSidebar}
          onOpenWallet={() => setIsWalletOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onToggleNotifications={() => setShowNotifications((v) => !v)}
          onToggleChat={() => setShowChat((v) => !v)}
          onToggleBetslip={() => setShowBetslip((v) => !v)}
          showNotifications={showNotifications}
          showChat={showChat}
          showBetslip={showBetslip}
        />

        <div className="flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </div>

      <WalletModal open={isWalletOpen} onClose={() => setIsWalletOpen(false)} balanceLabel={walletLabel} />
      <SearchOverlay open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </main>
  )
}
