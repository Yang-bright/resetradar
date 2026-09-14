import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Crosshair } from 'lucide-react'
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
  kindSpineClass,
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
  return product.events
    .filter((e) => +new Date(e.date) >= cut)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
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
  const [selected, setSelected] = useState(latestKey)
  /** null = show all months in timeline */
  const [monthFilter, setMonthFilter] = useState<string | null>(null)

  useEffect(() => {
    setSelected(latestKey)
    setViewYear(latestParts[0]!)
    setViewMonth(latestParts[1]! - 1)
    setMonthFilter(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id, locale, latestKey])

  const monthChips = useMemo(() => {
    const keys = new Set<string>()
    for (const e of allHistory) {
      const k = calendarDayKey(e.date, locale)
      keys.add(k.slice(0, 7))
    }
    return [...keys].sort()
  }, [allHistory, locale])

  const timeline = useMemo(() => {
    if (!monthFilter) return allHistory
    return allHistory.filter(
      (e) => calendarDayKey(e.date, locale).slice(0, 7) === monthFilter,
    )
  }, [allHistory, monthFilter, locale])

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDow = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7

  const monthEvents = useMemo(() => {
    const map = new Map<string, ResetEvent[]>()
    for (const e of product.events) {
      const key = calendarDayKey(e.date, locale)
      const [y, m] = key.split('-').map(Number)
      if (y === viewYear && m === viewMonth + 1) {
        const list = map.get(key) ?? []
        list.push(e)
        map.set(key, list)
      }
    }
    return map
  }, [product.events, locale, viewYear, viewMonth])

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

  const selectedEvents = useMemo(
    () =>
      product.events
        .filter((e) => calendarDayKey(e.date, locale) === selected)
        .sort((a, b) => +new Date(b.date) - +new Date(a.date)),
    [product.events, selected, locale],
  )
  const selectedPosts = postsForSelection(
    product,
    selected,
    selectedEvents,
    locale,
  )
  const selectedPrimary = primaryKind(selectedEvents)
  const selectedDate = parseDayKey(selected)

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
    setMonthFilter(null)
  }

  const selectDay = (key: string) => {
    setSelected(key)
    const [y, m] = key.split('-').map(Number)
    if (y && m) {
      setViewYear(y)
      setViewMonth(m - 1)
    }
  }

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <section className="space-y-6">
      {/* ——— Primary: vertical timeline spine ——— */}
      <div className="rounded-3xl border border-white/10 bg-[#0c1119] p-5 sm:p-7">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-white">
              {t.timelineTitle}
            </h3>
            <p className="mt-1 text-sm text-slate-500">{t.timelineHint}</p>
          </div>
          <button
            type="button"
            onClick={goLatest}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-200"
          >
            {t.backToLatest}
          </button>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMonthFilter(null)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              monthFilter === null
                ? 'bg-cyan-500/20 text-cyan-200 ring-1 ring-cyan-400/40'
                : 'bg-white/5 text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.monthChipAll}
          </button>
          {monthChips.map((ym) => {
            const [y, m] = ym.split('-').map(Number)
            const label =
              locale === 'zh'
                ? `${y}年${m}月`
                : formatMonthTitle(y!, m! - 1, locale)
            return (
              <button
                key={ym}
                type="button"
                onClick={() => {
                  setMonthFilter(ym)
                  setViewYear(y!)
                  setViewMonth(m! - 1)
                }}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  monthFilter === ym
                    ? 'bg-fuchsia-500/20 text-fuchsia-200 ring-1 ring-fuchsia-400/40'
                    : 'bg-white/5 text-slate-400 hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>

        {timeline.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-slate-500">
            {t.historyEmpty}
          </p>
        ) : (
          <ol className="relative space-y-0 border-l border-cyan-500/25 pl-6 sm:pl-8">
            {timeline.map((e) => {
              const dayKey = calendarDayKey(e.date, locale)
              const isSelected = selected === dayKey
              return (
                <li key={`${e.date}-${e.kind}-${e.note}`} className="relative pb-6 last:pb-0">
                  <span
                    className={`absolute -left-[1.55rem] top-1.5 h-3 w-3 rounded-full border-2 sm:-left-[2.05rem] ${kindSpineClass(e.kind)}`}
                  />
                  <button
                    type="button"
                    onClick={() => selectDay(dayKey)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                      isSelected
                        ? 'border-cyan-400/50 bg-cyan-500/10 shadow-[0_0_24px_rgba(34,211,238,0.12)]'
                        : 'border-white/5 bg-black/20 hover:border-white/15 hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rr-mono text-xs text-slate-500">
                        {formatDateTime(e.date, locale)}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${kindChipClass(e.kind)}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${kindDotClass(e.kind)}`}
                        />
                        {kindLabel(e.kind, locale)}
                      </span>
                      {isSelected && (
                        <Crosshair className="ml-auto h-3.5 w-3.5 text-cyan-400" aria-hidden />
                      )}
                    </div>
                    <div className="mt-1.5 text-sm font-medium text-slate-100">
                      {locale === 'zh' ? e.noteZh : e.note}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {locale === 'zh' ? e.scopeZh : e.scope}
                    </div>
                  </button>
                </li>
              )
            })}
          </ol>
        )}
      </div>

      {/* ——— Day detail + Tibo posts ——— */}
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

        {selectedEvents.length === 0 ? (
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
              {t.linkedPosts}
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

      {/* ——— Secondary: compact month slice (not the primary two-pane clone) ——— */}
      <div className="rounded-3xl border border-dashed border-white/10 bg-[#0a0e14] p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              {t.calendarTitle}
            </h3>
            <p className="mt-0.5 text-xs text-slate-600">{t.calendarHint}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={goPrev}
              className="rounded-lg border border-white/10 p-1.5 text-slate-400 transition hover:text-cyan-200"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[7rem] text-center text-sm font-medium text-slate-300">
              {formatMonthTitle(viewYear, viewMonth, locale)}
            </span>
            <button
              type="button"
              onClick={goNext}
              className="rounded-lg border border-white/10 p-1.5 text-slate-400 transition hover:text-cyan-200"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mb-3 text-xs text-slate-500">
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

        <div className="rounded-2xl border border-white/5 bg-black/30 p-2">
          <div className="mb-1 grid grid-cols-7 gap-1">
            {t.weekdays.map((w) => (
              <div
                key={w}
                className="py-1 text-center text-[10px] font-medium text-slate-600"
              >
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, idx) => {
              if (day === null) {
                return <div key={`e-${idx}`} className="min-h-[2.75rem]" />
              }
              const key = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const dayEvents = monthEvents.get(key) ?? []
              const kind = primaryKind(dayEvents)
              const isSelected = selected === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => selectDay(key)}
                  className={`flex min-h-[2.75rem] flex-col items-center justify-center rounded-lg border text-xs transition ${
                    isSelected
                      ? 'border-cyan-400/60 bg-cyan-500/15 text-cyan-100'
                      : dayEvents.length > 0
                        ? 'border-transparent bg-white/[0.04] text-slate-200 hover:border-white/15'
                        : 'border-transparent text-slate-600 hover:bg-white/[0.03]'
                  }`}
                >
                  <span className="rr-mono font-semibold tabular-nums">{day}</span>
                  {kind && (
                    <span
                      className={`mt-0.5 h-1 w-1 rounded-full ${kindDotClass(kind)}`}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>
        <p className="mt-3 text-[11px] text-slate-600">{t.beijingNote}</p>
      </div>
    </section>
  )
}
