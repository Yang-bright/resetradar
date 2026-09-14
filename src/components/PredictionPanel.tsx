import type { ProductData } from '../data/resets'
import type { Locale } from '../i18n/translations'
import { translations } from '../i18n/translations'
import { estimatedNextReset, lastResetDate, medianGapDays } from '../utils/estimates'
import { formatDate } from '../utils/time'

interface Props {
  product: ProductData
  locale: Locale
  now: Date
}

/**
 * Minimal next-window hint — no daily fake bars.
 * Hidden when there is no last reset to anchor from.
 */
export function PredictionPanel({ product, locale }: Props) {
  const t = translations[locale]
  const last = lastResetDate(product)
  const next = estimatedNextReset(product)
  const gap = medianGapDays(product)

  if (!last || !next) return null

  const dateLabel = formatDate(next, locale)
  const line =
    locale === 'zh'
      ? `下次窗口示意：约 ${dateLabel}（中位间隔 ${gap.days.toFixed(1)} ${t.days}）`
      : `Next window (illustrative): ~${dateLabel} (median gap ${gap.days.toFixed(1)} ${t.days})`

  return (
    <p className="rounded-2xl border border-white/5 bg-[#0c1119]/80 px-4 py-3 text-sm text-slate-400">
      <span className="mr-2 rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-300/90">
        {t.illustrative}
      </span>
      {line}
    </p>
  )
}
