import { CheckCircle2 } from 'lucide-react'
import type { ProductData } from '../data/resets'
import type { Locale } from '../i18n/translations'
import { translations } from '../i18n/translations'
import {
  estimatedNextReset,
  isOverdue,
  lastResetDate,
  medianGapDays,
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

  const latestPost = last
    ? product.posts
        .filter((p) => calendarDayKey(p.date, locale) === calendarDayKey(last, locale))
        .sort((a, b) => +new Date(b.date) - +new Date(a.date))[0]
    : undefined

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5 sm:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {last ? (
            <>
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-sm font-medium text-emerald-700">{t.resetDone}</span>
            </>
          ) : (
            <span className="text-sm font-medium text-slate-400">{t.resetPending}</span>
          )}
          <span className="text-slate-300">·</span>
          <span className="text-sm font-semibold text-slate-800">{name}</span>
        </div>
        <span className="text-xs text-slate-400">{zoneHint(locale)}</span>
      </div>

      {last ? (
        <>
          <p className="text-sm font-medium text-slate-500">{t.lastReset}</p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            {formatDateTime(last, locale)}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {formatWeekday(last, locale)}
            <span className="mx-2 text-slate-300">·</span>
            {formatElapsed(last, now, locale)}
          </p>
        </>
      ) : (
        <h2 className="text-3xl font-bold text-slate-400">{t.unknown}</h2>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <div className="text-xs font-medium text-slate-400">{t.estimatedNext}</div>
          <div className="mt-1 text-sm font-semibold text-slate-800">
            {next ? (
              <>
                {formatDateTime(next, locale)}
                {overdue && (
                  <span className="ml-2 rounded-md bg-rose-50 px-1.5 py-0.5 text-xs font-medium text-rose-600">
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
                countdown.overdue ? 'text-rose-500' : 'text-slate-500'
              }`}
            >
              {countdown.text}
            </div>
          )}
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <div className="text-xs font-medium text-slate-400">{t.medianGap}</div>
          <div className="mt-1 text-sm font-semibold text-slate-800">
            {gap.days.toFixed(1)} {t.days}{' '}
            <span className="font-normal text-slate-400">
              {gap.fromData ? t.fromData : t.fromSeed}
            </span>
          </div>
          {gap.sampleGaps > 0 && (
            <div className="mt-1 text-xs text-slate-400">n={gap.sampleGaps}</div>
          )}
        </div>
      </div>

      {latestPost && (
        <div className="mt-5">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
            {t.posts}
          </div>
          <PostCard post={latestPost} locale={locale} />
        </div>
      )}
    </section>
  )
}
