import { useCallback, useEffect, useState } from 'react'
import type { Locale } from '../i18n/translations'
import { translations } from '../i18n/translations'

const STORAGE_KEY = 'resetradar-locale'

function readInitial(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'en' || stored === 'zh') return stored
  } catch {
    /* ignore */
  }
  return 'zh'
}

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(readInitial)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, locale)
    } catch {
      /* ignore */
    }
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en'
  }, [locale])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
  }, [])

  const toggle = useCallback(() => {
    setLocaleState((prev) => (prev === 'zh' ? 'en' : 'zh'))
  }, [])

  const t = translations[locale]

  return { locale, setLocale, toggle, t }
}
