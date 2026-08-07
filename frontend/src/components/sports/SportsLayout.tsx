'use client'

import { ReactNode, useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

interface SportsLayoutProps {
  children: ReactNode
  sidebar: ReactNode
  header: ReactNode
}

export default function SportsLayout({ children, sidebar, header }: SportsLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileOpen])

  return (
    <main className="min-h-screen overflow-x-hidden bg-gradient-to-br from-[#0f212e] to-[#1a2c38] text-slate-100">
      <div className="relative flex h-screen">
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
        )}

        {/* Sidebar: drawer on mobile, fixed column on lg+ */}
        <div
          className={`
            fixed left-0 top-0 z-50 h-full w-64 transform transition-transform duration-300 ease-in-out
            ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0
          `}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-white/10 bg-[#0f212e] px-4 py-3 lg:hidden">
              <span className="text-sm font-semibold text-white">Sports</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-slate-200"
                aria-label="Close sports menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto" onClick={() => setMobileOpen(false)}>
              {sidebar}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex min-w-0 flex-1 flex-col lg:ml-64">
          <div className="sticky top-0 z-30 border-b border-white/10 bg-[#0f212e]/95 backdrop-blur">
            <div className="flex items-start gap-2 px-3 pt-3 lg:hidden">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-slate-200"
                aria-label="Open sports menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0 flex-1">{header}</div>
            </div>
            <div className="hidden lg:block">{header}</div>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden">{children}</div>
        </div>
      </div>
    </main>
  )
}
