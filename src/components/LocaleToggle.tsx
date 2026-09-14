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
      className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-zinc-200 transition hover:border-white/30 hover:bg-white/10"
      aria-label={label}
    >
      {locale === 'zh' ? 'EN' : '中文'}
    </button>
  )
}
