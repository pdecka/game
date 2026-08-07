'use client'

import { useState } from 'react'

interface SportsHeaderProps {
  selectedCategory?: string
  onRefresh?: () => void
  loading?: boolean
  lastUpdated?: Date
}

export default function SportsHeader({ selectedCategory, onRefresh, loading, lastUpdated }: SportsHeaderProps) {
  const [autoRefresh, setAutoRefresh] = useState(true)

  return (
    <div className="bg-[#0f212e]/90 px-3 py-3 sm:px-6 sm:py-4 lg:border-b lg:border-white/10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white">Sportsbook</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300 line-clamp-2">
            {selectedCategory ? `${selectedCategory} - Live odds from multiple bookmakers` : 'All Sports - Real-time betting odds'}
          </p>
          {lastUpdated && (
            <p className="mt-1 text-xs text-slate-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">Auto-refresh</label>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`h-5 w-10 rounded-full transition-colors ${
                autoRefresh ? 'bg-[#22c55e]' : 'bg-white/20'
              }`}
            >
              <div className={`h-4 w-4 rounded-full bg-white transition-transform ${
                autoRefresh ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
          
          <button
            onClick={onRefresh}
            disabled={loading}
            className="rounded-xl bg-white/5 hover:bg-white/10 px-3 sm:px-4 py-2 text-sm text-slate-200 disabled:opacity-50 transition-all"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
    </div>
  )
}
