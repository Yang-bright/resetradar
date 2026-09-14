import type { Post, ProductData, ResetEvent } from '../data/resets'
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

/** Heads-up / other posts after the last reset (upcoming context). */
function upcomingHeadsUpPosts(
  product: ProductData,
  last: Date | null,
): Post[] {
  if (!last) return []
  const lastMs = last.getTime()
  const byId = new Map(product.posts.map((p) => [p.id, p]))
  const linked = new Map<string, Post>()

  for (const e of product.events) {
    if (e.kind !== 'other') continue
    if (+new Date(e.date) <= lastMs) continue
    for (const id of e.postIds ?? []) {
      const post = byId.get(id)
      if (post && +new Date(post.date) > lastMs) linked.set(post.id, post)
    }
  }

  return [...linked.values()]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 2)
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
  const upcoming = upcomingHeadsUpPosts(product, last)

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-7">
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full border border-cyan-400/25" />
      <div className="pointer-events-none absolute -right-2 -top-2 h-24 w-24 rounded-full border border-fuchsia-400/20" />

      <div className="grid gap-5 lg:grid-cols-2 lg:items-stretch">
        {/* LEFT: 已发生 */}
        <div className="flex min-w-0 flex-col">
          <h2 className="text-lg font-semibold tracking-tight text-slate-800 sm:text-xl">
            <span className="text-cyan-700">{name}</span>
            <span className="mx-2 text-slate-300">·</span>
            <span>{t.lastReset}</span>
          </h2>
          <p className="mt-3 text-xs font-medium uppercase tracking-wider text-slate-500">
            {t.occurred}
          </p>
          {last ? (
            <>
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
            <p className="mt-1 text-3xl font-bold text-slate-400">{t.unknown}</p>
          )}

          {hitPosts.length > 0 && (
            <div className="mt-5 flex-1">
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                {feedTitle(product, locale)}
              </div>
              <div className="space-y-3">
                {hitPosts.map((p) => (
                  <PostCard key={p.id} post={p} locale={locale} />
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
