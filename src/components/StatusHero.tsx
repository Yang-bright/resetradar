import type { Post, ProductData, ResetEvent } from '../data/resets'
import type { Locale } from '../i18n/translations'
import { translations } from '../i18n/translations'
import { lastResetDate } from '../utils/estimates'
import { unfulfilledHeadsUpPosts } from '../utils/headsUp'
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

/** Posts linked to the latest estimate-eligible reset (the "hit"). */
function postsForLastHit(product: ProductData, last: Date, locale: Locale): Post[] {
  const lastKey = calendarDayKey(last, locale)
  const byId = new Map(product.posts.map((p) => [p.id, p]))
  const linked = new Map<string, Post>()

  const hitEvents: ResetEvent[] = product.events.filter(
    (e) =>
      e.countsForEstimate &&
      calendarDayKey(e.date, locale) === lastKey,
  )

  for (const e of hitEvents) {
    for (const id of e.postIds ?? []) {
      const post = byId.get(id)
      if (post) linked.set(post.id, post)
    }
  }

  if (linked.size > 0) {
    return [...linked.values()].sort(
      (a, b) => +new Date(b.date) - +new Date(a.date),
    )
  }

  return product.posts
    .filter((p) => calendarDayKey(p.date, locale) === lastKey)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
}

/**
 * Clear two-column hero:
 * LEFT 已发生 — last reset + related official posts for that hit
 * RIGHT 预计下次 — up to 2 future estimates (+ heads-up posts if any)
 */
export function StatusHero({ product, locale, now }: Props) {
  const t = translations[locale]
  const last = lastResetDate(product)
  const name = locale === 'zh' ? product.nameZh : product.name
  const hitPosts = last ? postsForLastHit(product, last, locale) : []
  const upcoming = unfulfilledHeadsUpPosts(product).slice(0, 1)
  const gridClass = upcoming.length > 0
    ? 'grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.55fr)] lg:items-start'
    : 'grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start'

  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-5">
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full border border-cyan-400/25" />
      <div className="pointer-events-none absolute -right-2 -top-2 h-24 w-24 rounded-full border border-fuchsia-400/20" />

      <div className={gridClass}>
        {/* LEFT: 已发生 */}
        <div className="flex min-w-0 flex-col">
          <h2 className="text-lg font-semibold tracking-tight text-slate-800 sm:text-xl">
            <span className="text-cyan-700">{name}</span>
            <span className="mx-2 text-slate-300">·</span>
            <span>{t.lastReset}</span>
          </h2>
          <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-slate-500">
            {t.occurred}
          </p>
          {last ? (
            <>
              <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-[2.4rem]">
                {formatDateTime(last, locale)}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                {formatWeekday(last, locale)}
                <span className="mx-2 text-slate-300">·</span>
                {formatElapsed(last, now, locale)}
              </p>
            </>
          ) : (
            <p className="mt-1 text-3xl font-bold text-slate-400">{t.unknown}</p>
          )}

          {hitPosts.length > 0 && (
            <div className="mt-3 flex-1">
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                {feedTitle(product, locale)}
              </div>
              <div
                className={`grid gap-2 ${hitPosts.length > 1 ? 'sm:grid-cols-2' : ''}`}
              >
                {hitPosts.map((p) => (
                  <PostCard key={p.id} post={p} locale={locale} compact />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: 预计下次 */}
        <PredictionPanel
          product={product}
          locale={locale}
          now={now}
          embedded
          upcomingPosts={upcoming}
        />
      </div>
    </section>
  )
}
