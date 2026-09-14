import type { ProductData, ResetEvent } from '../data/resets'

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
  const m = median(gaps)
  return {
    days: m ?? product.documentedMedianDays,
    fromData: m !== null,
    sampleGaps: gaps.length,
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
    // approach estimate: 0.1 → ~0.55
    const t = (progress - 0.35) / 0.65
    p = 0.1 + t * 0.45
  } else {
    // overdue: 0.55 → 0.85
    const overdueDays = elapsedDays - medianDays
    const t = Math.min(1, overdueDays / Math.max(1, medianDays * 0.5))
    p = 0.55 + t * 0.3
  }

  // Sparse data dampener (Grok etc.)
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
