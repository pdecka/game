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
    <div className="flex h-full w-full flex-col border-r border-line bg-white">
      <div className="border-b border-line p-4">
        <h2 className="text-lg font-bold text-ink">Sports</h2>
        <p className="mt-1 text-xs text-ink-2">Live & Upcoming</p>
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
                    ? 'bg-brand text-white shadow-lift' 
                    : 'bg-elevated text-ink hover:bg-brand/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category.sport_title}</span>
                  <span className={`rounded-full px-2 py-1 text-xs ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white text-ink-2'
                  }`}>
                    {category.count}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="border-t border-line p-4">
        <Link href="/wallet">
          <button className="w-full rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-brand-2">
            Wallet
          </button>
        </Link>
      </div>
    </div>
  )
}
