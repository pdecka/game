'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { localeFromCountry, localeFromNavigator, translate, type Locale } from '@/lib/i18n/messages'

const STORAGE_KEY = 'user-locale'
const CHOSEN_KEY = 'user-locale-chosen'

type LanguageValue = {
  locale: Locale
  setLocale: (next: Locale) => void
  t: (text: string) => string
}

const LanguageContext = createContext<LanguageValue | null>(null)

function readSaved(): Locale | null {
  if (typeof window === 'undefined') return null
  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (saved === 'pt' || saved === 'es' || saved === 'ar' || saved === 'en') return saved
  return null
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = Boolean(pathname?.startsWith('/admin'))
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    const saved = readSaved()
    if (saved) {
      setLocaleState(saved)
      return
    }
    const fromBrowser = localeFromNavigator(window.navigator.language)
    setLocaleState(fromBrowser)
    let cancelled = false
    ;(async () => {
      try {
        const response = await fetch('https://ipapi.co/json/')
        const data = await response.json()
        if (cancelled || window.localStorage.getItem(CHOSEN_KEY) === '1') return
        const fromCountry = localeFromCountry(data?.country_code)
        if (fromCountry) {
          setLocaleState(fromCountry)
          window.localStorage.setItem(STORAGE_KEY, fromCountry)
        } else {
          window.localStorage.setItem(STORAGE_KEY, fromBrowser)
        }
      } catch {
        if (!cancelled) window.localStorage.setItem(STORAGE_KEY, fromBrowser)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const active: Locale = isAdmin ? 'en' : locale
    document.documentElement.lang = active === 'pt' ? 'pt-BR' : active === 'es' ? 'es-419' : active === 'ar' ? 'ar' : 'en'
    document.documentElement.dir = active === 'ar' ? 'rtl' : 'ltr'
  }, [isAdmin, locale])

  const setLocale = (next: Locale) => {
    setLocaleState(next)
    window.localStorage.setItem(STORAGE_KEY, next)
    window.localStorage.setItem(CHOSEN_KEY, '1')
  }

  const value = useMemo<LanguageValue>(
    () => ({
      locale: isAdmin ? 'en' : locale,
      setLocale,
      t: (text: string) => translate(isAdmin ? 'en' : locale, text),
    }),
    [isAdmin, locale],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const value = useContext(LanguageContext)
  if (!value) {
    return {
      locale: 'en' as Locale,
      setLocale: () => {},
      t: (text: string) => text,
    }
  }
  return value
}
