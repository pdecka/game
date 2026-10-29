'use client'

import { useState } from 'react'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { WalletModal } from './WalletModal'
import { SearchOverlay } from './SearchOverlay'
import { SiteFooter } from './SiteFooter'
import { SupportWidget } from './SupportWidget'
import { useAuth } from '@/context/AuthContext'
import { formatPlayMoney, playBalance, usePlayCurrency } from '@/lib/playCurrency'

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
  const { currency } = usePlayCurrency(wallet)
  const walletLabel =
    walletLoading && !wallet ? formatPlayMoney(0, currency) : formatPlayMoney(playBalance(wallet, currency), currency)

  const handleToggleSidebar = () => {
    setMobileNavOpen((prev) => !prev)
  }

  return (
    <main className="flex h-screen overflow-hidden bg-bg-2 text-ink">
      <div className="max-lg:contents lg:relative lg:z-40 lg:h-screen lg:shrink-0 lg:overflow-visible">
        <Sidebar
          collapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed((prev) => !prev)}
          mobileOpen={mobileNavOpen}
          onMobileClose={() => setMobileNavOpen(false)}
        />
      </div>

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
          <SiteFooter />
        </div>
      </div>

      <WalletModal open={isWalletOpen} onClose={() => setIsWalletOpen(false)} balanceLabel={walletLabel} />
      <SearchOverlay open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <SupportWidget />
    </main>
  )
}
