'use client'

import { useMemo } from 'react'
import Link from 'next/link'

interface SportCategory {
  sport_title: string
  count: number
}

interface SportsSidebarProps {
  categories: SportCategory[]
  selectedCategory?: string
  onCategorySelect?: (category: string) => void
}

export default function SportsSidebar({ categories, selectedCategory, onCategorySelect }: SportsSidebarProps) {
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => b.count - a.count)
  }, [categories])

  return (
    <div className="flex h-full w-full flex-col border-r border-white/10 bg-[#0f212e]/90">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-lg font-bold text-white">Sports</h2>
        <p className="text-xs text-slate-400 mt-1">Live & Upcoming</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {sortedCategories.map((category) => {
            const isActive = selectedCategory === category.sport_title
            return (
              <button
                key={category.sport_title}
                onClick={() => onCategorySelect?.(category.sport_title)}
                className={`w-full rounded-xl px-3 py-2 text-left transition-all ${
                  isActive 
                    ? 'bg-[#22c55e] text-white shadow-sm' 
                    : 'bg-white/5 text-slate-200 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category.sport_title}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-400'
                  }`}>
                    {category.count}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="p-4 border-t border-white/10">
        <Link href="/wallet">
          <button className="w-full rounded-xl bg-[#22c55e] hover:opacity-90 text-white px-4 py-2 text-sm font-semibold transition-all">
            Wallet
          </button>
        </Link>
      </div>
    </div>
  )
}
