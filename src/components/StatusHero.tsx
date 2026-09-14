import { Radar } from 'lucide-react'
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
import {
  calendarDayKey,
  formatCountdown,
  formatDateTime,
  formatElapsed,
  formatWeekday,
  zoneHint,
} from '../utils/time'
import { PostCard } from './PostCard'

interface Props {
  product: ProductData
  locale: Locale
  now: Date
}

export function StatusHero({ product, locale, now }: Props) {
  const t = translations[locale]
  const last = lastResetDate(product)
  const next = estimatedNextReset(product)
  const gap = medianGapDays(product)
  const overdue = isOverdue(product, now)
  const countdown = next ? formatCountdown(next, now, locale) : null
  const name = locale === 'zh' ? product.nameZh : product.name
  const p24 = probability24h(product, now)

  const latestPost = last
    ? product.posts
        .filter((p) => calendarDayKey(p.date, locale) === calendarDayKey(last, locale))
        .sort((a, b) => +new Date(b.date) - +new Date(a.date))[0]
    : undefined

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0c1119] p-5 sm:p-7">
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full border border-cyan-400/20" />
      <div className="pointer-events-none absolute -right-2 -top-2 h-24 w-24 rounded-full border border-fuchsia-400/15" />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-cyan-400/30 bg-cyan-500/10 px-2 py-0.5 rr-mono text-[10px] font-semibold tracking-[0.2em] text-cyan-300">
            <Radar className="h-3 w-3" aria-hidden />
            {t.scanLabel}
          </span>
          {last ? (
            <span className="text-sm font-medium text-cyan-300/90">{t.resetDone}</span>
          ) : (
            <span className="text-sm font-medium text-slate-500">{t.resetPending}</span>
          )}
          <span className="text-slate-600">·</span>
          <span className="text-sm font-semibold text-slate-100">{name}</span>
        </div>
        <span className="rr-mono text-xs text-slate-500">{zoneHint(locale)}</span>
      </div>

      {last ? (
        <>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {t.lastReset}
          </p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            {formatDateTime(last, locale)}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {formatWeekday(last, locale)}
            <span className="mx-2 text-slate-600">·</span>
            {formatElapsed(last, now, locale)}
          </p>
        </>
      ) : (
        <h2 className="text-3xl font-bold text-slate-600">{t.unknown}</h2>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/5 bg-black/30 px-4 py-3">
          <div className="text-xs font-medium text-slate-500">{t.estimatedNext}</div>
          <div className="mt-1 text-sm font-semibold text-slate-100">
            {next ? (
              <>
                {formatDateTime(next, locale)}
                {overdue && (
                  <span className="ml-2 rounded-md bg-fuchsia-500/15 px-1.5 py-0.5 text-xs font-medium text-fuchsia-300">
                    {t.overdue}
                  </span>
                )}
              </>
            ) : (
              t.unknown
            )}
          </div>
          {countdown && (
            <div
              className={`mt-1 text-xs ${
                countdown.overdue ? 'text-fuchsia-300' : 'text-slate-500'
              }`}
            >
              {countdown.text}
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-white/5 bg-black/30 px-4 py-3">
          <div className="text-xs font-medium text-slate-500">{t.medianGap}</div>
          <div className="mt-1 text-sm font-semibold text-slate-100">
            {gap.days.toFixed(1)} {t.days}{' '}
            <span className="font-normal text-slate-500">
              {gap.fromData ? t.fromData : t.fromSeed}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="rr-mono">n={gap.sampleGaps}</span>
            {gap.sampleGaps < 3 && (
              <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-amber-200/90">
                {t.sampleWarn}
              </span>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-white/5 bg-black/30 px-4 py-3">
          <div className="flex items-center justify-between gap-2 text-xs font-medium text-slate-500">
            <span>{t.prob24h}</span>
            <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-cyan-300/90">
              {t.illustrative}
            </span>
          </div>
          <div className="mt-1 text-sm font-semibold text-slate-100">
            {Math.round(p24 * 100)}%
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-400"
              style={{ width: `${Math.round(p24 * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {latestPost && (
        <div className="mt-5">
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
            {t.posts}
          </div>
          <PostCard post={latestPost} locale={locale} />
        </div>
      )}
    </section>
  )
}
