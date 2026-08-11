'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Don't show layout on login page
  if (pathname === '/admin' || pathname === '/admin/') {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc]">
      {/* Header */}
      <Header
        onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        mobileSidebarOpen={mobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`
            ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            ${sidebarCollapsed ? 'w-16' : 'w-64'}
            fixed left-0 top-14 sm:top-16 z-40 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]
            bg-[#ffffff] border-r border-[#e2e8f0]
            transition-all duration-300 ease-in-out
            md:static md:translate-x-0 md:top-0 md:h-screen
            overflow-y-auto
          `}
        >
          <Sidebar collapsed={sidebarCollapsed} />
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#f8fafc]">
          <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

