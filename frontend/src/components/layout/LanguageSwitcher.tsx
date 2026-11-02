'use client'

import { useEffect, useRef, useState } from 'react'
import { Globe } from 'lucide-react'
import { LOCALES } from '@/lib/i18n/messages'
import { useLanguage } from '@/context/LanguageContext'

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { locale, setLocale, t } = useLanguage()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const current = LOCALES.find((item) => item.id === locale) || LOCALES[0]

  useEffect(() => {
    const onDoc = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-brand/35 bg-white px-2.5 text-xs font-semibold text-brand-2 hover:border-brand hover:bg-brand hover:text-white"
        aria-label={t('Language')}
        aria-expanded={open}
      >
        <Globe className="h-4 w-4" />
        <span>{current.short}</span>
      </button>
      {open ? (
        <div className="absolute end-0 top-12 z-[80] w-44 overflow-hidden rounded-xl border border-line bg-white py-1 text-sm text-ink shadow-panel">
          {LOCALES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setLocale(item.id)
                setOpen(false)
              }}
              className={`flex w-full items-center justify-between px-3 py-2 text-start hover:bg-brand/10 ${item.id === locale ? 'font-semibold text-brand-2' : ''}`}
            >
              <span>{item.id === 'en' ? t('English') : item.label}</span>
              <span className="text-[11px] text-ink-3">{item.short}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
