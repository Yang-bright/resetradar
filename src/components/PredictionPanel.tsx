import type { Post, ProductData } from '../data/resets'
import type { Locale } from '../i18n/translations'
import { translations } from '../i18n/translations'
import {
  futureResetEstimates,
  lastResetDate,
  probability24h,
  type EstimateKind,
} from '../utils/estimates'
import { formatCountdown, formatDateTime } from '../utils/time'
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

function estimateKindLabel(kind: EstimateKind, locale: Locale): string {
  const t = translations[locale]
  switch (kind) {
    case 'documented':
      return t.estimateDocumented
    case 'rolled':
      return t.estimateRolled
    default:
      return t.estimateMedian
  }
}

/**
 * Next-reset window(s) + compact 24h probability.
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
  const futures = futureResetEstimates(product, now, 2)
  const p24 = probability24h(product, now)

  if (!last) return null

  const pct = Math.round(p24 * 100)
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
          {futures.map((est, i) => {
            const countdown = formatCountdown(est.date, now, locale)
            return (
              <li key={`${est.kind}-${est.date.toISOString()}`}>
                {futures.length > 1 && (
                  <div className="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    {estimateKindLabel(est.kind, locale)}
                    {i === 0 ? ' · 1' : ' · 2'}
                  </div>
                )}
                <div className="text-base font-semibold text-slate-800 sm:text-lg">
                  {formatDateTime(est.date, locale)}
                </div>
                {countdown && !countdown.overdue && (
                  <p className="mt-1 text-xs text-slate-500">{countdown.text}</p>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <div className="mt-3 border-t border-slate-200 pt-3">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            {t.prob24h}
          </span>
          <span className="rr-mono text-xl font-semibold tabular-nums text-cyan-700">
            {pct}%
          </span>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500"
            style={{ width: `${Math.max(4, pct)}%` }}
          />
        </div>
      </div>

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
