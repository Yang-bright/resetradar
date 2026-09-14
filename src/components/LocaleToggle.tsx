import type { Locale } from '../i18n/translations'

interface Props {
  locale: Locale
  onToggle: () => void
  label: string
}

export function LocaleToggle({ locale, onToggle, label }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-600 shadow-sm shadow-slate-900/5 transition hover:border-indigo-200 hover:text-indigo-700"
      aria-label={label}
    >
      {locale === 'zh' ? 'EN' : '中文'}
    </button>
  )
}
