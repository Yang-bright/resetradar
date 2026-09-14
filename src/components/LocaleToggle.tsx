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
      className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm font-medium text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-200"
      aria-label={label}
    >
      {locale === 'zh' ? 'EN' : '中文'}
    </button>
  )
}
