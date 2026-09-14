import type { ProductData } from '../data/resets'
import type { Locale } from '../i18n/translations'
import { translations } from '../i18n/translations'
import {
  estimatedNextReset,
  isOverdue,
  lastResetDate,
  medianGapDays,
  probability24h,
} from '../utils/estimates'
import { formatCountdown, formatDateTime } from '../utils/time'

interface Props {
  product: ProductData
  locale: Locale
  now: Date
}

/**
 * Compact next-reset + 24h probability under the hero.
 * No methodology essay, no 5-day bars, no old 3-card maze.
 */
export function PredictionPanel({ product, locale, now }: Props) {
  const t = translations[locale]
  const last = lastResetDate(product)
  const next = estimatedNextReset(product)
  const gap = medianGapDays(product)
  const overdue = isOverdue(product, now)
  const p24 = probability24h(product, now)
  const countdown = next ? formatCountdown(next, now, locale) : null

  if (!last || !next) return null

  const pct = Math.round(p24 * 100)

  return (
    <section className="rounded-2xl border border-white/8 bg-[#0c1119]/85 px-4 py-3.5 sm:px-5">
      <div className="mb-2.5 flex flex-wrap items-center gap-2">
        <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-300/90">
          {t.illustrative}
        </span>
        <span className="text-xs text-slate-500">
          {locale === 'zh'
            ? `中位间隔 ${gap.days.toFixed(1)} ${t.days}`
            : `median gap ${gap.days.toFixed(1)} ${t.days}`}
          {gap.sampleGaps > 0 && (
            <span className="rr-mono text-slate-600"> · n={gap.sampleGaps}</span>
          )}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="min-w-0">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            {t.estimatedNext}
          </div>
          <div className="mt-1 flex flex-wrap items-baseline gap-2">
            <span className="text-base font-semibold text-slate-200 sm:text-lg">
              {formatDateTime(next, locale)}
            </span>
            {overdue && (
              <span className="rounded-md bg-fuchsia-500/15 px-1.5 py-0.5 text-[11px] font-medium text-fuchsia-300">
                {t.overdue}
              </span>
            )}
          </div>
          {countdown && (
            <p
              className={`mt-1 text-xs ${
                countdown.overdue ? 'text-fuchsia-300/90' : 'text-slate-500'
              }`}
            >
              {countdown.text}
            </p>
          )}
        </div>

        <div className="min-w-0 sm:border-l sm:border-white/5 sm:pl-4">
          <div className="flex items-center justify-between gap-2 text-[11px] font-medium uppercase tracking-wider text-slate-500">
            <span>{t.prob24h}</span>
            <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-semibold normal-case tracking-wide text-cyan-300/80">
              {t.illustrative}
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="rr-mono text-2xl font-semibold tabular-nums text-cyan-200">
              {pct}%
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400/90 to-fuchsia-400/80"
              style={{ width: `${Math.max(4, pct)}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
