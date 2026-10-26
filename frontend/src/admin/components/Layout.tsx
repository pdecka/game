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

  if (pathname === '/admin' || pathname === '/admin/') {
    return <>{children}</>
  }

  const sidebarWidth = sidebarCollapsed ? 'w-16' : 'w-64'

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[#f8fafc]">
      <Header
        onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        mobileSidebarOpen={mobileSidebarOpen}
      />

      <div className="relative flex min-h-0 flex-1">
        <aside
          className={`
            ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            ${sidebarWidth}
            fixed left-0 top-14 sm:top-16 z-40
            h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]
            bg-[#16a34a] border-r border-[#15803d]
            overflow-hidden
            transition-transform duration-300 ease-in-out
            md:translate-x-0
          `}
        >
          <Sidebar collapsed={sidebarCollapsed} onNavigate={() => setMobileSidebarOpen(false)} />
        </aside>

        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        <div className={`hidden md:block shrink-0 ${sidebarWidth}`} aria-hidden />

        <main className="min-h-0 flex-1 overflow-y-auto bg-[#f8fafc]">
          <div className="p-3 sm:p-4 md:p-6 lg:p-8">{children}</div>
          <Footer />
        </main>
      </div>
    </div>
  )
}
