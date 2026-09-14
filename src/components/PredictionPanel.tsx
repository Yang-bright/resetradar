import type { ProductData } from '../data/resets'
import type { Locale } from '../i18n/translations'
import { translations } from '../i18n/translations'
import {
  estimatedNextReset,
  isOverdue,
  lastResetDate,
  probability24h,
} from '../utils/estimates'
import { formatCountdown, formatDateTime } from '../utils/time'

interface Props {
  product: ProductData
  locale: Locale
  now: Date
  /** Compact inline panel for hero right column */
  embedded?: boolean
}

/**
 * Next-reset window + compact 24h probability (% + thin bar).
 * No methodology chips / essay clutter.
 */
export function PredictionPanel({ product, locale, now, embedded }: Props) {
  const t = translations[locale]
  const last = lastResetDate(product)
  const next = estimatedNextReset(product)
  const overdue = isOverdue(product, now)
  const p24 = probability24h(product, now)
  const countdown = next ? formatCountdown(next, now, locale) : null

  if (!last || !next) return null

  const pct = Math.round(p24 * 100)
  const shell = embedded
    ? 'h-full rounded-2xl border border-white/8 bg-black/30 px-4 py-3.5 sm:px-5'
    : 'rounded-2xl border border-white/8 bg-[#0c1119]/85 px-4 py-3.5 sm:px-5'

  return (
    <section className={shell}>
      <div className="min-w-0">
        <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
          {t.estimatedNext}
        </div>
        <div className="mt-1 flex flex-wrap items-baseline gap-2">
          <span className="text-base font-semibold text-slate-100 sm:text-lg">
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

      <div className="mt-3 border-t border-white/5 pt-3">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            {t.prob24h}
          </span>
          <span className="rr-mono text-xl font-semibold tabular-nums text-cyan-200">
            {pct}%
          </span>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400/90 to-fuchsia-400/80"
            style={{ width: `${Math.max(4, pct)}%` }}
          />
        </div>
      </div>
    </section>
  )
}
