import type { Post, ProductData } from '../data/resets'
import type { Locale } from '../i18n/translations'
import { translations } from '../i18n/translations'
import {
  futureResetEstimates,
  lastResetDate,
  resetProbabilityInWindow,
} from '../utils/estimates'
import { estimateDayWindow, formatEstimateDate } from '../utils/time'
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
  const firstWindow = futures[0] ? estimateDayWindow(futures[0].date, locale) : null
  const primaryProbability = firstWindow
    ? resetProbabilityInWindow(product, firstWindow.start, firstWindow.end, now)
    : null

  if (!last) return null

  const shell = embedded
    ? 'flex min-h-0 flex-col rounded-xl border border-slate-200 bg-slate-50 px-4 py-3'
    : 'flex flex-col rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm sm:px-5'

  return (
    <section className={shell}>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.55)]" />
        <h3 className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
          {t.nextEstimate}
        </h3>
      </div>

      {futures.length === 0 ? (
        <div className="mt-2">
          <p className="text-2xl font-bold tracking-tight text-slate-400 sm:text-3xl">
            {t.noneYet}
          </p>
          {upcomingPosts.length > 0 && (
            <p className="mt-2 text-xs leading-relaxed text-amber-700/90">
              {t.headsUpActiveNote}
            </p>
          )}
        </div>
      ) : (
        <ul className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {futures.map((est) => {
            const window = estimateDayWindow(est.date, locale)
            const result = resetProbabilityInWindow(
              product,
              window.start,
              window.end,
              now,
            )
            const pct = Math.round(result.probability * 100)
            return (
              <li key={`${est.kind}-${est.date.toISOString()}`} className="rounded-lg border border-slate-200 bg-white p-2.5">
                <div className="text-base font-semibold text-slate-800 sm:text-lg">
                  {formatEstimateDate(est.date, locale)}
                </div>
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
                    style={{ width: `${Math.max(2, pct)}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {futures.length > 0 && (
        <details className="group mt-3 text-[10px] leading-relaxed text-slate-500">
          <summary className="cursor-pointer select-none font-medium text-cyan-700 marker:text-slate-400">
            {t.probabilityMethod}
          </summary>
          <p className="mt-1.5 rounded-md border border-slate-200 bg-white/80 p-2">
            {(primaryProbability?.basis === 'heads-up'
              ? t.probabilityHeadsUpDetail
              : t.probabilityMethodDetail
            ).replace(
              '{n}',
              String(primaryProbability?.sampleGaps ?? 0),
            )}
          </p>
        </details>
      )}

      {upcomingPosts.length > 0 && (
        <div className="mt-4 border-t border-slate-200 pt-3">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-500">
            {t.headsUpPosts}
          </div>
          <div className="space-y-2">
            {upcomingPosts.map((p) => (
              <PostCard key={p.id} post={p} locale={locale} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
