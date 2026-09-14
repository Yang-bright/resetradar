import type { ProductData } from '../data/resets'
import type { Locale } from '../i18n/translations'
import { translations } from '../i18n/translations'
import { lastResetDate } from '../utils/estimates'
import {
  calendarDayKey,
  formatDateTime,
  formatElapsed,
  formatWeekday,
} from '../utils/time'
import { feedTitle } from '../utils/feedTitle'
import { PostCard } from './PostCard'
import { PredictionPanel } from './PredictionPanel'

interface Props {
  product: ProductData
  locale: Locale
  now: Date
}

export function StatusHero({ product, locale, now }: Props) {
  const t = translations[locale]
  const last = lastResetDate(product)
  const name = locale === 'zh' ? product.nameZh : product.name

  const latestPost = last
    ? product.posts
        .filter((p) => calendarDayKey(p.date, locale) === calendarDayKey(last, locale))
        .sort((a, b) => +new Date(b.date) - +new Date(a.date))[0]
    : undefined

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-7">
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full border border-cyan-400/25" />
      <div className="pointer-events-none absolute -right-2 -top-2 h-24 w-24 rounded-full border border-fuchsia-400/20" />

      {/* Title: product + 最近重置 — no SCAN clutter */}
      <h2 className="text-lg font-semibold tracking-tight text-slate-800 sm:text-xl">
        <span className="text-cyan-700">{name}</span>
        <span className="mx-2 text-slate-300">·</span>
        <span>{t.lastReset}</span>
      </h2>

      {/* Same row: left = last reset; right = next window + probability */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2 lg:items-stretch">
        <div className="min-w-0">
          {last ? (
            <>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                {t.lastReset}
              </p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-[2.75rem]">
                {formatDateTime(last, locale)}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                {formatWeekday(last, locale)}
                <span className="mx-2 text-slate-300">·</span>
                {formatElapsed(last, now, locale)}
              </p>
            </>
          ) : (
            <p className="text-3xl font-bold text-slate-400">{t.unknown}</p>
          )}
        </div>

        <PredictionPanel product={product} locale={locale} now={now} embedded />
      </div>

      {latestPost && (
        <div className="mt-6">
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
            {feedTitle(product, locale)}
          </div>
          <PostCard post={latestPost} locale={locale} />
        </div>
      )}
    </section>
  )
}
