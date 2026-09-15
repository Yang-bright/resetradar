import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  HISTORY_CUTOFF,
  type Post,
  type ProductData,
  type ResetEvent,
} from '../data/resets'
import type { Locale } from '../i18n/translations'
import { translations } from '../i18n/translations'
import {
  categoryChipClass,
  categoryDotClass,
  categoryLabel,
  eventCategory,
  kindChipClass,
  kindLabel,
  primaryCategory,
  statusTitle,
  type EventCategory,
} from '../utils/kinds'
import { lastResetDate } from '../utils/estimates'
import {
  calendarDayKey,
  formatDate,
  formatDateTime,
  formatMonthTitle,
  parseDayKey,
  zoneHint,
} from '../utils/time'
import { feedTitle } from '../utils/feedTitle'
import { PostCard } from './PostCard'

interface Props {
  product: ProductData
  locale: Locale
}

function postsForSelection(
  product: ProductData,
  dayKey: string,
  dayEvents: ResetEvent[],
  locale: Locale,
): Post[] {
  const byId = new Map(product.posts.map((p) => [p.id, p]))
  const seen = new Set<string>()
  const specialPosts: Post[] = []
  const otherPosts: Post[] = []

  // Special-event posts first so the $200 Pro pause quote is never buried
  // under a same-day banked-compensation tweet (common in Beijing TZ).
  const orderedEvents = [...dayEvents].sort((a, b) => {
    if (a.kind === 'special' && b.kind !== 'special') return -1
    if (b.kind === 'special' && a.kind !== 'special') return 1
    return +new Date(b.date) - +new Date(a.date)
  })

  for (const e of orderedEvents) {
    for (const id of e.postIds ?? []) {
      if (seen.has(id)) continue
      const post = byId.get(id)
      if (!post) continue
      seen.add(id)
      if (e.kind === 'special') specialPosts.push(post)
      else otherPosts.push(post)
    }
  }

  if (seen.size > 0) return [...specialPosts, ...otherPosts]

  return product.posts
    .filter((p) => calendarDayKey(p.date, locale) === dayKey)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
}

/** Visible history from HISTORY_CUTOFF */
function historyEvents(product: ProductData): ResetEvent[] {
  const cut = +new Date(HISTORY_CUTOFF)
  return product.events.filter((e) => +new Date(e.date) >= cut)
}

function dayMarkerLabels(
  events: ResetEvent[],
  locale: Locale,
): string[] {
  if (events.length === 0) return []
  const t = translations[locale]
  const labels: string[] = []
  for (const e of events) {
    const label =
      locale === 'zh'
        ? e.markerLabelZh ?? e.markerLabel
        : e.markerLabel ?? e.markerLabelZh
    if (label && !labels.includes(label)) labels.push(label)
  }

  const categories = [...new Set(events.map(eventCategory))]
  for (const cat of categories) {
    const label =
      cat === 'special'
        ? t.catSpecial
        : cat === 'all_reset'
          ? t.markerAllReset
          : cat === 'reset_card'
            ? t.markerCard
            : cat === 'affected_reset'
              ? t.markerAffected
              : null
    if (label && !labels.includes(label)) labels.push(label)
  }
  return labels.slice(0, 2)
}

const LEGEND_CATS: EventCategory[] = [
  'all_reset',
  'affected_reset',
  'reset_card',
  'special',
]

export function ResetCalendar({ product, locale }: Props) {
  const t = translations[locale]
  const name = locale === 'zh' ? product.nameZh : product.name
  const last = lastResetDate(product)
  const allHistory = useMemo(() => historyEvents(product), [product])

  const latestKey = useMemo(() => {
    if (!last) {
      const first = allHistory[0]
      return first
        ? calendarDayKey(first.date, locale)
        : calendarDayKey(new Date('2026-09-12T12:00:00.000Z'), locale)
    }
    return calendarDayKey(last, locale)
  }, [last, locale, allHistory])

  const latestParts = latestKey.split('-').map(Number)
  const [viewYear, setViewYear] = useState(latestParts[0]!)
  const [viewMonth, setViewMonth] = useState(latestParts[1]! - 1)
  const [selected, setSelected] = useState<string | null>(latestKey)

  useEffect(() => {
    setSelected(latestKey)
    setViewYear(latestParts[0]!)
    setViewMonth(latestParts[1]! - 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id, locale, latestKey])

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDow = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7

  const monthEvents = useMemo(() => {
    const map = new Map<string, ResetEvent[]>()
    for (const e of allHistory) {
      const key = calendarDayKey(e.date, locale)
      const [y, m] = key.split('-').map(Number)
      if (y === viewYear && m === viewMonth + 1) {
        const list = map.get(key) ?? []
        list.push(e)
        map.set(key, list)
      }
    }
    return map
  }, [allHistory, locale, viewYear, viewMonth])

  // Count normalized event records. Announcements/updates from one issuance are
  // consolidated in the data layer, while separate same-day records stay visible.
  const monthCounts = useMemo(() => {
    let all = 0
    let affected = 0
    let card = 0
    let special = 0
    for (const list of monthEvents.values()) {
      for (const e of list) {
        const cat = eventCategory(e)
        if (cat === 'all_reset') all += 1
        else if (cat === 'affected_reset') affected += 1
        else if (cat === 'reset_card') card += 1
        else if (cat === 'special') special += 1
      }
    }
    return { all, affected, card, special }
  }, [monthEvents])

  /** Latest event day key in a given display month, or null if empty. */
  const pickMonthSelection = (year: number, monthIndex: number): string | null => {
    const keys: string[] = []
    for (const e of allHistory) {
      const key = calendarDayKey(e.date, locale)
      const [y, m] = key.split('-').map(Number)
      if (y === year && m === monthIndex + 1) keys.push(key)
    }
    keys.sort()
    return keys.length > 0 ? keys[keys.length - 1]! : null
  }

  // Safety net: if selection drifts outside the visible month, resync
  useEffect(() => {
    if (selected) {
      const [y, m] = selected.split('-').map(Number)
      if (y === viewYear && m === viewMonth + 1) return
    } else if (monthEvents.size === 0) {
      return
    }
    const keys = [...monthEvents.keys()].sort()
    setSelected(keys.length === 0 ? null : keys[keys.length - 1]!)
    // Only when the visible month (or its events) changes — not on every selectDay
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewYear, viewMonth, monthEvents])

  const selectedEvents = useMemo(() => {
    if (!selected) return []
    return allHistory
      .filter((e) => calendarDayKey(e.date, locale) === selected)
      .sort((a, b) => {
        // Special events (e.g. $200 Pro pause) lead the day detail
        if (a.kind === 'special' && b.kind !== 'special') return -1
        if (b.kind === 'special' && a.kind !== 'special') return 1
        return +new Date(b.date) - +new Date(a.date)
      })
  }, [allHistory, selected, locale])

  const selectedPosts = selected
    ? postsForSelection(product, selected, selectedEvents, locale)
    : []
  const selectedEventPosts = useMemo(() => {
    const byId = new Map(product.posts.map((post) => [post.id, post]))
    const assigned = new Map<string, ResetEvent>()
    const result = new Map<ResetEvent, Post[]>(
      selectedEvents.map((event) => [event, []]),
    )

    // A post may be linked by both a completed reset and its heads-up event.
    // Assign it once, to the event whose timestamp is closest to the post.
    for (const event of selectedEvents) {
      for (const id of event.postIds ?? []) {
        const post = byId.get(id)
        if (!post) continue
        const current = assigned.get(id)
        if (
          !current ||
          Math.abs(+new Date(event.date) - +new Date(post.date)) <
            Math.abs(+new Date(current.date) - +new Date(post.date))
        ) {
          assigned.set(id, event)
        }
      }
    }

    for (const [id, event] of assigned) {
      const post = byId.get(id)
      if (post) result.get(event)?.push(post)
    }
    for (const posts of result.values()) {
      posts.sort((a, b) => +new Date(b.date) - +new Date(a.date))
    }
    return result
  }, [product, selectedEvents])
  const selectedPrimary = primaryCategory(selectedEvents)
  const selectedDate = selected ? parseDayKey(selected) : null
  const hasDetail = selected !== null && selectedEvents.length > 0
  const selectedPrimaryKind = selectedEvents[0]?.kind

  const goPrev = () => {
    const y = viewMonth === 0 ? viewYear - 1 : viewYear
    const m = viewMonth === 0 ? 11 : viewMonth - 1
    setViewYear(y)
    setViewMonth(m)
    setSelected(pickMonthSelection(y, m))
  }
  const goNext = () => {
    const y = viewMonth === 11 ? viewYear + 1 : viewYear
    const m = viewMonth === 11 ? 0 : viewMonth + 1
    setViewYear(y)
    setViewMonth(m)
    setSelected(pickMonthSelection(y, m))
  }
  const goLatest = () => {
    setSelected(latestKey)
    setViewYear(latestParts[0]!)
    setViewMonth(latestParts[1]! - 1)
  }

  const selectDay = (key: string) => {
    setSelected(key)
  }

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const monthSummary =
    locale === 'zh'
      ? `${t.monthSummaryLead}：${monthCounts.all} ${t.countAllReset} · ${monthCounts.affected} ${t.countAffectedReset} · ${monthCounts.card} ${t.countResetCard}${monthCounts.special ? ` · ${monthCounts.special} ${t.catSpecial}` : ''}`
      : `${t.monthSummaryLead}: ${monthCounts.all} ${t.countAllReset} · ${monthCounts.affected} ${t.countAffectedReset} · ${monthCounts.card} ${t.countResetCard}${monthCounts.special ? ` · ${monthCounts.special} ${t.catSpecial}` : ''}`

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-slate-900">
            {t.calendarTitle}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">{t.calendarHint}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={goLatest}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-cyan-400/50 hover:text-cyan-700"
          >
            {t.backToLatest}
          </button>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={goPrev}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-500 transition hover:border-cyan-400/50 hover:text-cyan-700"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[8rem] text-center text-sm font-semibold text-slate-800">
              {formatMonthTitle(viewYear, viewMonth, locale)}
            </span>
            <button
              type="button"
              onClick={goNext}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-500 transition hover:border-cyan-400/50 hover:text-cyan-700"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-cyan-100 bg-cyan-50/55 px-3 py-2 text-xs leading-relaxed text-slate-700 sm:text-sm">
        <div className="font-semibold">{monthSummary}</div>
        <div className="text-[10px] text-slate-500">{t.monthCountNote}</div>
      </div>

      {allHistory.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
          {t.historyEmpty}
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.95fr)] lg:items-start">
          {/* Left: calendar */}
          <div className="min-w-0">
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 sm:p-3">
              <div className="mb-1 grid grid-cols-7 gap-1">
                {t.weekdays.map((w) => (
                  <div
                    key={w}
                    className="py-1 text-center text-[11px] font-medium text-slate-500"
                  >
                    {w}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {cells.map((day, idx) => {
                  if (day === null) {
                    return <div key={`e-${idx}`} className="min-h-[3.5rem]" />
                  }
                  const key = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  const dayEvents = monthEvents.get(key) ?? []
                  const markers = dayMarkerLabels(dayEvents, locale)
                  const categories = [...new Set(dayEvents.map(eventCategory))].filter(
                    (item): item is EventCategory => item !== 'other',
                  )
                  const isSelected = selected === key
                  const hasEvents = dayEvents.length > 0
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => selectDay(key)}
                      className={`relative flex min-h-[3.5rem] flex-col items-center justify-center rounded-lg border px-0.5 py-1 text-xs transition ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-50 text-cyan-900 shadow-[0_0_16px_rgba(6,182,212,0.18)]'
                          : hasEvents
                            ? 'border-slate-200 bg-white text-slate-800 hover:border-cyan-400/60'
                            : 'border-transparent text-slate-400 hover:bg-white/70'
                      }`}
                    >
                      <span className="rr-mono font-semibold tabular-nums">
                        {day}
                      </span>
                      {dayEvents.length > 1 && (
                        <span className="absolute right-1 top-1 rr-mono text-[8px] font-bold text-slate-400">
                          ×{dayEvents.length}
                        </span>
                      )}
                      {markers.map((marker) => (
                        <span key={marker} className="mt-0.5 max-w-full truncate px-0.5 text-center text-[8px] font-semibold leading-tight text-slate-600">
                          {marker}
                        </span>
                      ))}
                      {categories.length > 0 && (
                        <span className="mt-1 flex items-center gap-1">
                          {categories.map((category) => (
                            <span
                              key={category}
                              className={`h-1.5 w-1.5 rounded-full ${categoryDotClass(category)}`}
                            />
                          ))}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Color legend */}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-600">
              <span className="font-medium text-slate-500">{t.legendTitle}</span>
              {LEGEND_CATS.map((cat) => (
                <span key={cat} className="inline-flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${categoryDotClass(cat)}`}
                  />
                  {categoryLabel(cat, locale)}
                </span>
              ))}
            </div>
            <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
              {monthCounts.special > 0
                ? t.specialEventsPresent
                : t.specialEventsNote}
            </p>
            <p className="mt-0.5 text-[10px] text-slate-500">{t.beijingNote}</p>
          </div>

          {/* Right: day detail / 当日信号 */}
          <div className="min-w-0 max-h-[27rem] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4">
            {selected && selectedDate ? (
              <>
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">
                      {t.dayDetail}
                    </h4>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatDate(selectedDate, locale)} · {zoneHint(locale)}
                    </p>
                  </div>
                  {selectedPrimary && (
                    <span
                      className={`inline-flex rounded-md px-2 py-1 text-[11px] font-semibold ring-1 ring-inset ${categoryChipClass(selectedPrimary)}`}
                    >
                      {categoryLabel(selectedPrimary, locale)}
                    </span>
                  )}
                </div>

                {!hasDetail ? (
                  <p className="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-8 text-center text-sm text-slate-500">
                    {t.noEventsDay}
                  </p>
                ) : (
                  <>
                    {selectedPrimaryKind && (
                      <div className="mb-3 text-sm font-semibold text-slate-800">
                        {statusTitle(selectedPrimaryKind, name, locale)}
                      </div>
                    )}
                    <ul className="space-y-2">
                      {selectedEvents.map((e) => {
                        const cat = eventCategory(e)
                        const eventPosts = selectedEventPosts.get(e) ?? []
                        return (
                          <li
                            key={`${e.date}-${e.kind}-${e.note}`}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm leading-relaxed text-slate-700"
                          >
                            <span
                              className={`mr-2 inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${
                                cat === 'all_reset' ||
                                cat === 'affected_reset' ||
                                cat === 'reset_card' ||
                                cat === 'special'
                                  ? categoryChipClass(cat)
                                  : kindChipClass(e.kind)
                              }`}
                            >
                              {cat === 'other'
                                ? kindLabel(e.kind, locale)
                                : categoryLabel(cat, locale)}
                            </span>
                            {locale === 'zh' ? e.noteZh : e.note}
                            <span className="text-slate-500">
                              {' '}
                              · {locale === 'zh' ? e.scopeZh : e.scope}
                            </span>
                            <div className="mt-1.5 rr-mono text-xs text-slate-500">
                              {formatDateTime(e.date, locale)}
                            </div>
                            {eventPosts.length > 0 && (
                              <div className="mt-2 space-y-2 border-t border-slate-100 pt-2">
                                {eventPosts.map((p) => (
                                  <PostCard key={p.id} post={p} locale={locale} compact />
                                ))}
                              </div>
                            )}
                          </li>
                        )
                      })}
                    </ul>

                    {(() => {
                      const nestedIds = new Set(
                        selectedEvents.flatMap((e) => e.postIds ?? []),
                      )
                      const orphans = selectedPosts.filter(
                        (p) => !nestedIds.has(p.id),
                      )
                      if (orphans.length === 0 && selectedPosts.length > 0) {
                        return null
                      }
                      return (
                        <>
                          <div className="mb-2 mt-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                            {orphans.length > 0
                              ? feedTitle(product, locale)
                              : t.linkedPosts}
                          </div>
                          <div className="space-y-3">
                            {orphans.length > 0 ? (
                              orphans.map((p) => (
                                <PostCard key={p.id} post={p} locale={locale} compact />
                              ))
                            ) : selectedPosts.length === 0 ? (
                              <p className="text-xs text-slate-500">{t.noUrl}</p>
                            ) : null}
                          </div>
                        </>
                      )
                    })()}
                  </>
                )}
              </>
            ) : (
              <p className="py-10 text-center text-sm text-slate-500">
                {monthEvents.size === 0 ? t.monthEmpty : t.selectDay}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
