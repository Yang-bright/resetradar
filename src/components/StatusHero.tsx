import { Radar } from 'lucide-react'
import type { ProductData } from '../data/resets'
import type { Locale } from '../i18n/translations'
import { translations } from '../i18n/translations'
import { lastResetDate } from '../utils/estimates'
import {
  calendarDayKey,
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
  const name = locale === 'zh' ? product.nameZh : product.name

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

      {latestPost && (
        <div className="mt-6">
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
            {t.posts}
          </div>
          <PostCard post={latestPost} locale={locale} />
        </div>
      )}
    </section>
  )
}
