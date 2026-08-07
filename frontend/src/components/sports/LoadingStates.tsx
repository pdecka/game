'use client'

import React from 'react'

export function SkeletonMatchCard() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 animate-pulse">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="h-3 bg-white/10 rounded w-20 mb-2"></div>
          <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-white/10 rounded w-32"></div>
        </div>
        <div className="w-16 h-6 bg-white/10 rounded-full"></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#1a2c38] rounded-lg px-3 py-2">
          <div className="h-3 bg-white/10 rounded w-3/4 mb-1"></div>
          <div className="h-2 bg-white/10 rounded w-1/2"></div>
        </div>
        <div className="bg-[#1a2c38] rounded-lg px-3 py-2">
          <div className="h-3 bg-white/10 rounded w-3/4 mb-1"></div>
          <div className="h-2 bg-white/10 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonSidebar() {
  return (
    <div className="w-64 bg-[#0f212e]/90 border-r border-white/10 flex flex-col">
      <div className="p-4 border-b border-white/10">
        <div className="h-6 bg-white/10 rounded w-20 mb-1"></div>
        <div className="h-3 bg-white/10 rounded w-32"></div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-xl bg-white/5 p-3 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-white/10 rounded w-24"></div>
                <div className="w-8 h-4 bg-white/10 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SkeletonOddsTable() {
  return (
    <div className="space-y-6">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-white/10 rounded w-32"></div>
            <div className="h-3 bg-white/10 rounded w-20"></div>
          </div>
          <div className="space-y-2">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="border-b border-white/5 pb-2">
                <div className="flex items-center justify-between">
                  <div className="h-3 bg-white/10 rounded w-24"></div>
                  <div className="h-3 bg-white/10 rounded w-12"></div>
                  <div className="h-3 bg-white/10 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-white/20 border-t-white`}></div>
  )
}

export function EmptyState({ 
  title, 
  description, 
  action 
}: { 
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-300 mb-4">{description}</p>
      {action}
    </div>
  )
}

export function ErrorState({ 
  error, 
  onRetry 
}: { 
  error: string
  onRetry: () => void 
}) {
  return (
    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
      <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Error</h3>
      <p className="text-sm text-slate-300 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="rounded-xl bg-red-500/20 hover:bg-red-500/30 px-4 py-2 text-sm text-red-300 transition-all"
      >
        Try Again
      </button>
    </div>
  )
}
