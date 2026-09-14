import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  HISTORY_CUTOFF,
  type Post,
  type ProductData,
  type ResetEvent,
  type ResetKind,
} from '../data/resets'
import type { Locale } from '../i18n/translations'
import { translations } from '../i18n/translations'
import {
  kindChipClass,
  kindDotClass,
  kindLabel,
  statusTitle,
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

function primaryKind(events: ResetEvent[]): ResetKind | null {
  if (events.some((e) => e.kind === 'usage_reset')) return 'usage_reset'
  if (events.some((e) => e.kind === 'token_reset')) return 'token_reset'
  if (events.some((e) => e.kind === 'reset_card')) return 'reset_card'
  if (events.length > 0) return events[0]!.kind
  return null
}

function postsForSelection(
  product: ProductData,
  dayKey: string,
  dayEvents: ResetEvent[],
  locale: Locale,
): Post[] {
  const byId = new Map(product.posts.map((p) => [p.id, p]))
  const linked = new Map<string, Post>()
  for (const e of dayEvents) {
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
    .filter((p) => calendarDayKey(p.date, locale) === dayKey)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
}

/** Visible history from HISTORY_CUTOFF */
function historyEvents(product: ProductData): ResetEvent[] {
  const cut = +new Date(HISTORY_CUTOFF)
  return product.events.filter((e) => +new Date(e.date) >= cut)
}

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

  const monthCounts = useMemo(() => {
    let usage = 0
    let card = 0
    let token = 0
    for (const list of monthEvents.values()) {
      for (const e of list) {
        if (e.kind === 'usage_reset') usage++
        else if (e.kind === 'reset_card') card++
        else if (e.kind === 'token_reset') token++
      }
    }
    return { usage, card, token }
  }, [monthEvents])

  const selectedEvents = useMemo(() => {
    if (!selected) return []
    return allHistory
      .filter((e) => calendarDayKey(e.date, locale) === selected)
      .sort((a, b) => +new Date(b.date) - +new Date(a.date))
  }, [allHistory, selected, locale])

  const selectedPosts = selected
    ? postsForSelection(product, selected, selectedEvents, locale)
    : []
  const selectedPrimary = primaryKind(selectedEvents)
  const selectedDate = selected ? parseDayKey(selected) : null
  const hasDetail = selected !== null && selectedEvents.length > 0

  const goPrev = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1)
      setViewMonth(11)
    } else setViewMonth((m) => m - 1)
  }
  const goNext = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1)
      setViewMonth(0)
    } else setViewMonth((m) => m + 1)
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

  return (
    <section className="space-y-5">
      {/* Primary: month calendar */}
      <div className="rounded-3xl border border-white/10 bg-[#0c1119] p-5 sm:p-7">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-white">
              {t.calendarTitle}
            </h3>
            <p className="mt-1 text-sm text-slate-500">{t.calendarHint}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={goLatest}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-200"
            >
              {t.backToLatest}
            </button>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={goPrev}
                className="rounded-lg border border-white/10 p-1.5 text-slate-400 transition hover:border-cyan-400/40 hover:text-cyan-200"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-[8rem] text-center text-sm font-semibold text-slate-200">
                {formatMonthTitle(viewYear, viewMonth, locale)}
              </span>
              <button
                type="button"
                onClick={goNext}
                className="rounded-lg border border-white/10 p-1.5 text-slate-400 transition hover:border-cyan-400/40 hover:text-cyan-200"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mb-4 text-xs text-slate-500">
          {t.monthSummary}：
          <span className="ml-1 text-cyan-400/90">
            {monthCounts.usage} {t.globalResetsMonth}
          </span>
          <span className="ml-2 text-fuchsia-400/90">
            · {monthCounts.card} {t.bankedMonth}
          </span>
          {monthCounts.token > 0 && (
            <span className="ml-2 text-violet-400/90">
              · {monthCounts.token} {t.kindTokenReset}
            </span>
          )}
        </div>

        {allHistory.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-slate-500">
            {t.historyEmpty}
          </p>
        ) : (
          <div className="rounded-2xl border border-cyan-500/15 bg-black/35 p-3 sm:p-4">
            <div className="mb-2 grid grid-cols-7 gap-1.5">
              {t.weekdays.map((w) => (
                <div
                  key={w}
                  className="py-1 text-center text-[11px] font-medium text-slate-500"
                >
                  {w}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {cells.map((day, idx) => {
                if (day === null) {
                  return <div key={`e-${idx}`} className="min-h-[3.25rem]" />
                }
                const key = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const dayEvents = monthEvents.get(key) ?? []
                const kind = primaryKind(dayEvents)
                const isSelected = selected === key
                const hasEvents = dayEvents.length > 0
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => selectDay(key)}
                    className={`flex min-h-[3.25rem] flex-col items-center justify-center rounded-xl border text-sm transition ${
                      isSelected
                        ? 'border-cyan-400/70 bg-cyan-500/20 text-cyan-50 shadow-[0_0_20px_rgba(34,211,238,0.18)]'
                        : hasEvents
                          ? 'border-fuchsia-400/20 bg-fuchsia-500/[0.07] text-slate-100 hover:border-cyan-400/40'
                          : 'border-transparent text-slate-600 hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className="rr-mono font-semibold tabular-nums">{day}</span>
                    {kind && (
                      <span
                        className={`mt-1 h-1.5 w-1.5 rounded-full ${kindDotClass(kind)}`}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}
        <p className="mt-3 text-[11px] text-slate-600">{t.beijingNote}</p>
      </div>

      {/* Detail only after a date click / selection with events */}
      {selected && selectedDate && (
        <div className="rounded-3xl border border-white/10 bg-[#0c1119] p-5 sm:p-7">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-white">{t.dayDetail}</h3>
              <p className="mt-0.5 text-sm text-slate-500">
                {formatDate(selectedDate, locale)} · {zoneHint(locale)}
              </p>
            </div>
            {selectedPrimary && (
              <span
                className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset ${kindChipClass(selectedPrimary)}`}
              >
                {kindLabel(selectedPrimary, locale)}
              </span>
            )}
          </div>

          {!hasDetail ? (
            <p className="rounded-xl border border-dashed border-white/10 bg-black/20 px-4 py-8 text-center text-sm text-slate-500">
              {t.noEventsDay}
            </p>
          ) : (
            <>
              <div className="mb-4">
                <div className="text-base font-semibold text-slate-100">
                  {statusTitle(selectedPrimary!, name, locale)}
                </div>
                <ul className="mt-3 space-y-2">
                  {selectedEvents.map((e) => (
                    <li
                      key={`${e.date}-${e.kind}-${e.note}`}
                      className="rounded-xl border border-white/5 bg-black/25 px-3 py-2 text-sm text-slate-300"
                    >
                      <span
                        className={`mr-2 inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${kindChipClass(e.kind)}`}
                      >
                        {kindLabel(e.kind, locale)}
                      </span>
                      {locale === 'zh' ? e.noteZh : e.note}
                      <span className="text-slate-500">
                        {' '}
                        · {locale === 'zh' ? e.scopeZh : e.scope}
                      </span>
                      <div className="mt-1 rr-mono text-[11px] text-slate-600">
                        {formatDateTime(e.date, locale)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                {selectedPosts.length > 0 ? feedTitle(product, locale) : t.linkedPosts}
              </div>
              <div className="space-y-3">
                {selectedPosts.length > 0 ? (
                  selectedPosts.map((p) => (
                    <PostCard key={p.id} post={p} locale={locale} />
                  ))
                ) : (
                  <p className="text-xs text-slate-500">{t.noUrl}</p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  )
}
