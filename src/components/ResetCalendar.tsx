import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ProductData, ResetEvent, ResetKind } from '../data/resets'
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
import { PostCard } from './PostCard'

interface Props {
  product: ProductData
  locale: Locale
}

function eventsForDay(
  events: ResetEvent[],
  dayKey: string,
  locale: Locale,
): ResetEvent[] {
  return events
    .filter((e) => calendarDayKey(e.date, locale) === dayKey)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
}

function primaryKind(events: ResetEvent[]): ResetKind | null {
  if (events.some((e) => e.kind === 'usage_reset')) return 'usage_reset'
  if (events.some((e) => e.kind === 'token_reset')) return 'token_reset'
  if (events.some((e) => e.kind === 'reset_card')) return 'reset_card'
  if (events.length > 0) return events[0]!.kind
  return null
}

export function ResetCalendar({ product, locale }: Props) {
  const t = translations[locale]
  const name = locale === 'zh' ? product.nameZh : product.name
  const last = lastResetDate(product)

  const latestKey = useMemo(() => {
    if (!last) {
      // default to Sep 2026 for seed demo when no last reset
      const first = product.events[0]
      return first
        ? calendarDayKey(first.date, locale)
        : calendarDayKey(new Date('2026-09-12T12:00:00.000Z'), locale)
    }
    return calendarDayKey(last, locale)
  }, [last, locale, product.events])

  const latestParts = latestKey.split('-').map(Number)
  const [viewYear, setViewYear] = useState(latestParts[0]!)
  const [viewMonth, setViewMonth] = useState(latestParts[1]! - 1)
  const [selected, setSelected] = useState(latestKey)

  useEffect(() => {
    setSelected(latestKey)
    setViewYear(latestParts[0]!)
    setViewMonth(latestParts[1]! - 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id, locale, latestKey])

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  // Monday-first: JS getDay Sun=0 → convert
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

  const selectedEvents = eventsForDay(product.events, selected, locale)
  const selectedPosts = product.posts
    .filter((p) => calendarDayKey(p.date, locale) === selected)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
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
  }

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5 sm:p-7">
      <div className="mb-6">
        <h3 className="text-xl font-bold tracking-tight text-slate-900">
          {t.calendarTitle}
        </h3>
        <p className="mt-1 text-sm text-slate-500">{t.calendarHint}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        {/* Calendar */}
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-base font-semibold text-slate-900">
                {formatMonthTitle(viewYear, viewMonth, locale)}
              </div>
              <div className="mt-0.5 text-xs text-slate-400">
                {t.monthSummary}：
                {monthCounts.usage > 0 && (
                  <span className="ml-1 text-indigo-600">
                    {monthCounts.usage} {t.kindUsageReset}
                  </span>
                )}
                {monthCounts.card > 0 && (
                  <span className="ml-1 text-rose-600">
                    · {monthCounts.card} {t.kindResetCard}
                  </span>
                )}
                {monthCounts.token > 0 && (
                  <span className="ml-1 text-violet-600">
                    · {monthCounts.token} {t.kindTokenReset}
                  </span>
                )}
                {monthCounts.usage === 0 &&
                  monthCounts.card === 0 &&
                  monthCounts.token === 0 && (
                    <span className="ml-1">{locale === 'zh' ? '暂无事件' : 'no events'}</span>
                  )}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={goLatest}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-white hover:text-indigo-700"
              >
                {t.backToLatest}
              </button>
              <button
                type="button"
                onClick={goPrev}
                className="rounded-xl border border-slate-200 p-1.5 text-slate-500 transition hover:bg-slate-50"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="rounded-xl border border-slate-200 p-1.5 text-slate-500 transition hover:bg-slate-50"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50/80 p-2 sm:p-3">
            <div className="mb-1 grid grid-cols-7 gap-1">
              {t.weekdays.map((w) => (
                <div
                  key={w}
                  className="py-1.5 text-center text-xs font-medium text-slate-400"
                >
                  {w}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, idx) => {
                if (day === null) {
                  return <div key={`e-${idx}`} className="min-h-[4.5rem]" />
                }
                const key = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const dayEvents = monthEvents.get(key) ?? []
                const kind = primaryKind(dayEvents)
                const isSelected = selected === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelected(key)}
                    className={`flex min-h-[4.5rem] flex-col items-start rounded-xl border p-1.5 text-left transition sm:p-2 ${
                      isSelected
                        ? 'border-indigo-300 bg-indigo-50/90 shadow-sm ring-1 ring-indigo-200'
                        : dayEvents.length > 0
                          ? 'border-transparent bg-white hover:border-slate-200'
                          : 'border-transparent bg-white/60 hover:bg-white'
                    }`}
                  >
                    <span
                      className={`text-sm font-semibold tabular-nums ${
                        isSelected ? 'text-indigo-800' : 'text-slate-700'
                      }`}
                    >
                      {day}
                    </span>
                    {kind && (
                      <span
                        className={`mt-auto inline-flex max-w-full items-center gap-1 truncate rounded-md px-1 py-0.5 text-[10px] font-medium ring-1 ring-inset ${kindChipClass(kind)}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${kindDotClass(kind)}`}
                        />
                        <span className="truncate">{kindLabel(kind, locale)}</span>
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              {t.kindUsageReset}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-400" />
              {t.kindResetCard}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-violet-500" />
              {t.kindTokenReset}
            </span>
            <span className="w-full sm:w-auto">{t.beijingNote}</span>
          </div>
        </div>

        {/* Detail pane */}
        <div className="flex flex-col rounded-2xl border border-slate-100 bg-slate-50/50 p-4 sm:p-5">
          <div className="mb-4 flex items-baseline justify-between gap-2">
            <h4 className="text-lg font-bold text-slate-900">
              {formatDate(selectedDate, locale)}
            </h4>
            <span className="text-sm text-slate-400">
              {selected.split('-')[0]}
            </span>
          </div>

          {selectedEvents.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-400">
              {t.noEventsDay}
            </p>
          ) : (
            <>
              <div className="mb-4 flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                <div>
                  <div className="text-sm font-medium text-emerald-700">
                    {t.resetDone}
                  </div>
                  <div className="mt-0.5 text-base font-semibold text-slate-900">
                    {statusTitle(selectedPrimary!, name, locale)}
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    {formatDateTime(selectedEvents[0]!.date, locale)} ·{' '}
                    {zoneHint(locale)}
                  </div>
                  <ul className="mt-2 space-y-1">
                    {selectedEvents.map((e) => (
                      <li
                        key={`${e.date}-${e.kind}`}
                        className="text-xs text-slate-500"
                      >
                        <span
                          className={`mr-1.5 inline-flex rounded-md px-1.5 py-0.5 font-medium ring-1 ring-inset ${kindChipClass(e.kind)}`}
                        >
                          {kindLabel(e.kind, locale)}
                        </span>
                        {locale === 'zh' ? e.noteZh : e.note}
                        <span className="text-slate-400">
                          {' '}
                          · {locale === 'zh' ? e.scopeZh : e.scope}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                {selectedPosts.length > 0 ? (
                  selectedPosts.map((p, i) => (
                    <PostCard key={`${p.date}-${i}`} post={p} locale={locale} />
                  ))
                ) : (
                  <p className="text-xs text-slate-400">{t.noUrl}</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
