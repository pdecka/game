'use client'

import React from 'react'

export function SkeletonMatchCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-line bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex-1">
          <div className="mb-2 h-3 w-20 rounded bg-elevated"></div>
          <div className="mb-2 h-4 w-3/4 rounded bg-elevated"></div>
          <div className="h-3 w-32 rounded bg-elevated"></div>
        </div>
        <div className="h-6 w-16 rounded-full bg-elevated"></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-elevated px-3 py-2">
          <div className="mb-1 h-3 w-3/4 rounded bg-line"></div>
          <div className="h-2 w-1/2 rounded bg-line"></div>
        </div>
        <div className="rounded-lg bg-elevated px-3 py-2">
          <div className="mb-1 h-3 w-3/4 rounded bg-line"></div>
          <div className="h-2 w-1/2 rounded bg-line"></div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonSidebar() {
  return (
    <div className="flex w-64 flex-col border-r border-line bg-white">
      <div className="border-b border-line p-4">
        <div className="mb-1 h-6 w-20 rounded bg-elevated"></div>
        <div className="h-3 w-32 rounded bg-elevated"></div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl bg-elevated p-3">
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 rounded bg-line"></div>
                <div className="h-4 w-8 rounded-full bg-line"></div>
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
        <div key={i} className="animate-pulse rounded-2xl border border-line bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="h-4 w-32 rounded bg-elevated"></div>
            <div className="h-3 w-20 rounded bg-elevated"></div>
          </div>
          <div className="space-y-2">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="border-b border-line pb-2">
                <div className="flex items-center justify-between">
                  <div className="h-3 w-24 rounded bg-elevated"></div>
                  <div className="h-3 w-12 rounded bg-elevated"></div>
                  <div className="h-3 w-20 rounded bg-elevated"></div>
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
    <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-line border-t-brand`}></div>
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
    <div className="rounded-2xl border border-line bg-white p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-elevated">
        <svg className="h-6 w-6 text-ink-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-ink">{title}</h3>
      <p className="mb-4 text-sm text-ink-2">{description}</p>
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
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
        <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-ink">Error</h3>
      <p className="mb-4 text-sm text-ink-2">{error}</p>
      <button
        onClick={onRetry}
        className="rounded-xl bg-red-100 px-4 py-2 text-sm text-red-700 transition-all hover:bg-red-200"
      >
        Try Again
      </button>
    </div>
  )
}
