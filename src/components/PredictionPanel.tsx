import type { Post, ProductData } from '../data/resets'
import type { Locale } from '../i18n/translations'
import { translations } from '../i18n/translations'
import {
  estimateSlotProbability,
  futureResetEstimates,
  lastResetDate,
} from '../utils/estimates'
import { formatCountdown, formatEstimateDate } from '../utils/time'
import { PostCard } from './PostCard'

interface Props {
  product: ProductData
  locale: Locale
  now: Date
  /** Compact inline panel for hero right column */
  embedded?: boolean
  /** Optional heads-up / upcoming related posts */
  upcomingPosts?: Post[]
}

/**
 * Next-reset window(s) with each row's own illustrative probability.
 * Never renders a past / overdue datetime — shows 暂无 instead.
 */
export function PredictionPanel({
  product,
  locale,
  now,
  embedded,
  upcomingPosts = [],
}: Props) {
  const t = translations[locale]
  const last = lastResetDate(product)
  // Belt-and-suspenders: never render a past / overdue datetime
  const futures = futureResetEstimates(product, now, 2).filter(
    (f) => f.date.getTime() > now.getTime(),
  )

  if (!last) return null

  const shell = embedded
    ? 'flex h-full min-h-0 flex-col rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 sm:px-5'
    : 'flex flex-col rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm sm:px-5'

  return (
    <section className={shell}>
      <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
        {t.nextEstimate}
      </div>

      {futures.length === 0 ? (
        <p className="mt-2 text-2xl font-bold tracking-tight text-slate-400 sm:text-3xl">
          {t.noneYet}
        </p>
      ) : (
        <ul className="mt-2 space-y-3">
          {futures.map((est) => {
            const countdown = formatCountdown(est.date, now, locale)
            const p = estimateSlotProbability(product, est, now, futures)
            const pct = Math.round(p * 100)
            return (
              <li key={`${est.kind}-${est.date.toISOString()}`}>
                <div className="text-base font-semibold text-slate-800 sm:text-lg">
                  {formatEstimateDate(est.date, locale)}
                </div>
                {countdown && !countdown.overdue && (
                  <p className="mt-1 text-xs text-slate-500">{countdown.text}</p>
                )}
                <div className="mt-2 flex items-baseline justify-between gap-2">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    {t.windowProb}
                  </span>
                  <span className="rr-mono text-sm font-semibold tabular-nums text-cyan-700">
                    {pct}%
                  </span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500"
                    style={{ width: `${Math.max(4, pct)}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {futures.length > 0 && (
        <p className="mt-3 text-[10px] leading-relaxed text-slate-400">
          {t.probDisclaimer}
        </p>
      )}

      {upcomingPosts.length > 0 && (
        <div className="mt-4 border-t border-slate-200 pt-3">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-500">
            {t.headsUpPosts}
          </div>
          <div className="space-y-3">
            {upcomingPosts.map((p) => (
              <PostCard key={p.id} post={p} locale={locale} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
