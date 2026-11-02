'use client'

import React from 'react'
import { useLanguage } from '@/context/LanguageContext'

type PageHeaderProps = {
  title: string
  description?: string
  action?: React.ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  const { t } = useLanguage()
  return (
    <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{t(title)}</h1>
        {description ? <p className="mt-1 text-sm text-ink-2">{t(description)}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
