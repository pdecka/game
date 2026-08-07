'use client'

import React, { ReactNode } from 'react'
import GameHeader from './GameHeader'
import GameSidebar from './GameSidebar'

interface GameLayoutProps {
  children: ReactNode
  sidebarOpen: boolean
  onSidebarToggle: () => void
  onSidebarClose: () => void
  walletBalance?: number
}

export default function GameLayout({ 
  children, 
  sidebarOpen, 
  onSidebarToggle, 
  onSidebarClose,
  walletBalance = 0 
}: GameLayoutProps) {
  return (
    <div className="h-screen bg-gradient-to-br from-[#0f212e] to-[#1a2c38] text-white">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-[70]">
        <GameHeader
          onSidebarToggle={onSidebarToggle}
          walletBalance={walletBalance}
          showSidebar={sidebarOpen}
        />
      </div>

      {/* Sidebar - Fixed positioning */}
      <div className="fixed top-0 left-0 z-[60]">
        <GameSidebar isOpen={sidebarOpen} onClose={onSidebarClose} />
      </div>

      {/* Main Content Area - Properly offset for sidebar */}
      <div className="pt-20">
        <div className="lg:pl-64">
          <div className="h-full overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
