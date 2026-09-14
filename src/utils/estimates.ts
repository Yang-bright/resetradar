import type { ProductData, ResetEvent } from '../data/resets'
import { calendarDayKey, zoneForLocale } from './time'
import type { Locale } from '../i18n/translations'
import { addDays, startOfDay } from 'date-fns'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'

const MS_PER_DAY = 24 * 60 * 60 * 1000

function median(values: number[]): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1]! + sorted[mid]!) / 2
  }
  return sorted[mid]!
}

/** usage_reset / token_reset events that count toward estimate, newest first */
export function estimateEvents(product: ProductData): ResetEvent[] {
  return product.events
    .filter((e) => e.countsForEstimate)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
}

/**
 * Median gap (days) between consecutive estimate events.
 * Falls back to documentedMedianDays when fewer than 2 events.
 */
export function medianGapDays(product: ProductData): {
  days: number
  fromData: boolean
  sampleGaps: number
} {
  const events = estimateEvents(product)
  if (events.length < 2) {
    return {
      days: product.documentedMedianDays,
      fromData: false,
      sampleGaps: 0,
    }
  }
  const gaps: number[] = []
  for (let i = 0; i < events.length - 1; i++) {
    const newer = +new Date(events[i]!.date)
    const older = +new Date(events[i + 1]!.date)
    gaps.push((newer - older) / MS_PER_DAY)
  }
  // Prefer recent cadence (last 10 gaps) when history is long — matches whenreset.dev style
  const recent = gaps.slice(0, 10)
  const m = median(recent)
  return {
    days: m ?? product.documentedMedianDays,
    fromData: m !== null,
    sampleGaps: recent.length,
  }
}

export function lastResetDate(product: ProductData): Date | null {
  const events = estimateEvents(product)
  if (events.length === 0) return null
  return new Date(events[0]!.date)
}

export function estimatedNextReset(product: ProductData): Date | null {
  const last = lastResetDate(product)
  if (!last) return null
  const { days } = medianGapDays(product)
  return new Date(last.getTime() + days * MS_PER_DAY)
}

/**
 * 24h reset probability heuristic:
 * - Before the estimated next: rises from ~5% to ~55% as we approach the median gap.
 * - At/after overdue: climbs toward ~85% (caps), reflecting higher chance soon.
 * Not an official forecast — illustrative only.
 */
export function probability24h(product: ProductData, now: Date = new Date()): number {
  const last = lastResetDate(product)
  const next = estimatedNextReset(product)
  const { days: medianDays } = medianGapDays(product)
  if (!last || !next || medianDays <= 0) return 0.08

  const elapsedDays = (now.getTime() - last.getTime()) / MS_PER_DAY
  const progress = elapsedDays / medianDays // 1.0 = at estimate

  let p: number
  if (progress < 0.35) {
    p = 0.05 + progress * 0.15
  } else if (progress < 1) {
    const t = (progress - 0.35) / 0.65
    p = 0.1 + t * 0.45
  } else {
    const overdueDays = elapsedDays - medianDays
    const t = Math.min(1, overdueDays / Math.max(1, medianDays * 0.5))
    p = 0.55 + t * 0.3
  }

  const events = estimateEvents(product)
  if (events.length < 2) {
    p *= 0.65
  }

  return Math.max(0.03, Math.min(0.9, p))
}

export function isOverdue(product: ProductData, now: Date = new Date()): boolean {
  const next = estimatedNextReset(product)
  if (!next) return false
  return now.getTime() > next.getTime()
}

export interface DayPrediction {
  /** Calendar day key in display TZ */
  dayKey: string
  date: Date
  probability: number
}

/**
 * Spread a soft probability mass across upcoming calendar days, peaking near
 * the estimated next reset. Distinct from the single 24h heuristic — used for
 * the prediction strip in the status area.
 */
export function dailyPredictions(
  product: ProductData,
  now: Date,
  locale: Locale,
  count = 5,
): DayPrediction[] {
  const next = estimatedNextReset(product)
  const { days: medianDays } = medianGapDays(product)
  const events = estimateEvents(product)
  const sparse = events.length < 2
  const tz = zoneForLocale(locale)

  const zonedNow = toZonedTime(now, tz)
  const startLocal = startOfDay(zonedNow)

  const weights: number[] = []
  const dates: Date[] = []

  for (let i = 0; i < count; i++) {
    const localDay = addDays(startLocal, i)
    const utcNoon = fromZonedTime(
      new Date(
        localDay.getFullYear(),
        localDay.getMonth(),
        localDay.getDate(),
        12,
        0,
        0,
      ),
      tz,
    )
    dates.push(utcNoon)

    let w = 0.08
    if (next && medianDays > 0) {
      const distDays =
        (utcNoon.getTime() - next.getTime()) / MS_PER_DAY
      // Gaussian-ish peak around estimated next
      const sigma = Math.max(0.8, medianDays * 0.35)
      w = Math.exp(-(distDays * distDays) / (2 * sigma * sigma))
      // slight boost if overdue and day is today/tomorrow
      if (now.getTime() > next.getTime() && i <= 1) {
        w *= 1.35
      }
    }
    if (sparse) w *= 0.7
    weights.push(Math.max(0.02, w))
  }

  const sum = weights.reduce((a, b) => a + b, 0) || 1
  // Scale so peak day lands in a readable 15–55% band (illustrative)
  const peak = Math.max(...weights)
  const targetPeak = sparse ? 0.22 : 0.38
  const scale = peak > 0 ? targetPeak / peak : 1

  return dates.map((date, i) => {
    const raw = (weights[i]! / sum) * (sum * scale)
    const probability = Math.max(0.02, Math.min(0.55, raw))
    return {
      dayKey: calendarDayKey(date, locale),
      date,
      probability,
    }
  })
}
