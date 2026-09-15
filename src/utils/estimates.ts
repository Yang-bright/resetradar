import type { ProductData, ResetEvent } from '../data/resets'
import { headsUpPosts, unfulfilledHeadsUpPosts } from './headsUp'

const MS_PER_DAY = 24 * 60 * 60 * 1000

const MODEL_PRIOR_STRENGTH = 2
const MODEL_PRIOR_ALPHA = 3
const MODEL_PRIOR_LOG_SD = 0.45

function median(values: number[]): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1]! + sorted[mid]!) / 2
  }
  return sorted[mid]!
}
function recentGapDays(product: ProductData, limit = 10): number[] {
  const events = estimateEvents(product)
  const gaps: number[] = []
  for (let i = 0; i < events.length - 1 && gaps.length < limit; i++) {
    const newer = +new Date(events[i]!.date)
    const older = +new Date(events[i + 1]!.date)
    const gap = (newer - older) / MS_PER_DAY
    if (Number.isFinite(gap) && gap > 0) gaps.push(gap)
  }
  return gaps
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
  // Prefer recent cadence (last 10 gaps) when history is long — matches whenreset.dev style
  const recent = recentGapDays(product)
  const m = median(recent)
  return {
    days: m ?? product.documentedMedianDays,
    fromData: m !== null,
    sampleGaps: recent.length,
  }
}

interface IntervalPosterior {
  location: number
  scale: number
  degreesOfFreedom: number
  sampleGaps: number
}

/**
 * Normal-Inverse-Gamma posterior on log reset intervals. The documented
 * median is a weak two-observation prior; observed gaps update both the
 * location and dispersion. Its posterior predictive is Student-t.
 */
function intervalPosterior(product: ProductData): IntervalPosterior {
  const gaps = recentGapDays(product)
  const logs = gaps.map(Math.log)
  const n = logs.length
  const priorMedian = Math.max(0.25, product.documentedMedianDays)
  const mu0 = Math.log(priorMedian)
  const kappa0 = MODEL_PRIOR_STRENGTH
  const alpha0 = MODEL_PRIOR_ALPHA
  const beta0 = MODEL_PRIOR_LOG_SD ** 2 * (alpha0 - 1)

  const mean = n > 0 ? logs.reduce((sum, value) => sum + value, 0) / n : mu0
  const sumSquares = logs.reduce(
    (sum, value) => sum + (value - mean) ** 2,
    0,
  )
  const kappa = kappa0 + n
  const location = (kappa0 * mu0 + n * mean) / kappa
  const alpha = alpha0 + n / 2
  const beta =
    beta0 +
    sumSquares / 2 +
    (kappa0 * n * (mean - mu0) ** 2) / (2 * kappa)

  return {
    location,
    scale: Math.sqrt((beta * (kappa + 1)) / (alpha * kappa)),
    degreesOfFreedom: 2 * alpha,
    sampleGaps: n,
  }
}

const MAX_HEADS_UP_DELAY_DAYS = 3

/**
 * Historical public heads-ups paired to the first reset that landed within
 * 72 hours. On log delays, the Jeffreys-prior posterior predictive is a
 * Student-t distribution; this avoids inventing a fixed probability boost.
 */
function headsUpDelayPosterior(
  product: ProductData,
  now: Date,
): { activeAt: Date; posterior: IntervalPosterior } | null {
  const active = unfulfilledHeadsUpPosts(product)[0]
  if (!active) return null

  const activeTime = +new Date(active.date)
  const resets = estimateEvents(product)
    .map((event) => +new Date(event.date))
    .sort((a, b) => a - b)
  const delays = headsUpPosts(product)
    .filter((post) => +new Date(post.date) < activeTime && +new Date(post.date) < now.getTime())
    .map((post) => {
      const postedAt = +new Date(post.date)
      const landedAt = resets.find(
        (resetAt) =>
          resetAt > postedAt &&
          resetAt - postedAt <= MAX_HEADS_UP_DELAY_DAYS * MS_PER_DAY,
      )
      return landedAt ? (landedAt - postedAt) / MS_PER_DAY : null
    })
    .filter((delay): delay is number => delay !== null && delay > 0)

  if (delays.length < 2) return null
  const logs = delays.map(Math.log)
  const mean = logs.reduce((sum, value) => sum + value, 0) / logs.length
  const sampleVariance =
    logs.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
    (logs.length - 1)

  return {
    activeAt: new Date(activeTime),
    posterior: {
      location: mean,
      scale: Math.sqrt(Math.max(0.015, sampleVariance) * (1 + 1 / logs.length)),
      degreesOfFreedom: logs.length - 1,
      sampleGaps: logs.length,
    },
  }
}

// Lanczos log-gamma approximation, sufficient for the small t-CDF used here.
function logGamma(value: number): number {
  const coefficients = [
    676.5203681218851,
    -1259.1392167224028,
    771.3234287776531,
    -176.6150291621406,
    12.507343278686905,
    -0.13857109526572012,
    9.984369578019572e-6,
    1.5056327351493116e-7,
  ]
  if (value < 0.5) {
    return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * value)) - logGamma(1 - value)
  }
  let x = 0.9999999999998099
  const shifted = value - 1
  for (let i = 0; i < coefficients.length; i++) {
    x += coefficients[i]! / (shifted + i + 1)
  }
  const t = shifted + coefficients.length - 0.5
  return (
    0.5 * Math.log(2 * Math.PI) +
    (shifted + 0.5) * Math.log(t) -
    t +
    Math.log(x)
  )
}

function studentTCdf(value: number, degreesOfFreedom: number): number {
  if (value === 0) return 0.5
  if (value >= 12) return 1
  if (value <= -12) return 0

  const upper = Math.abs(value)
  const steps = 160
  const width = upper / steps
  const logConstant =
    logGamma((degreesOfFreedom + 1) / 2) -
    logGamma(degreesOfFreedom / 2) -
    0.5 * Math.log(degreesOfFreedom * Math.PI)
  const density = (x: number) =>
    Math.exp(
      logConstant -
        ((degreesOfFreedom + 1) / 2) *
          Math.log1p((x * x) / degreesOfFreedom),
    )

  let area = density(0) + density(upper)
  for (let i = 1; i < steps; i++) {
    area += density(i * width) * (i % 2 === 0 ? 2 : 4)
  }
  const fromZero = (area * width) / 3
  return Math.max(0, Math.min(1, value > 0 ? 0.5 + fromZero : 0.5 - fromZero))
}

function studentTQuantile(probability: number, degreesOfFreedom: number): number {
  let low = -12
  let high = 12
  for (let i = 0; i < 48; i++) {
    const middle = (low + high) / 2
    if (studentTCdf(middle, degreesOfFreedom) < probability) low = middle
    else high = middle
  }
  return (low + high) / 2
}

function intervalCdf(days: number, posterior: IntervalPosterior): number {
  if (days <= 0) return 0
  const standardized =
    (Math.log(days) - posterior.location) / Math.max(0.05, posterior.scale)
  return studentTCdf(standardized, posterior.degreesOfFreedom)
}

/** Conditional median landing time after an active public heads-up. */
function headsUpExpectedReset(product: ProductData, now: Date): Date | null {
  const evidence = headsUpDelayPosterior(product, now)
  if (!evidence) return null

  const elapsedDays = Math.max(
    1 / 1440,
    (now.getTime() - evidence.activeAt.getTime()) / MS_PER_DAY,
  )
  const elapsedCdf = intervalCdf(elapsedDays, evidence.posterior)
  const conditionalMedianCdf = elapsedCdf + (1 - elapsedCdf) * 0.5
  const quantile = studentTQuantile(
    conditionalMedianCdf,
    evidence.posterior.degreesOfFreedom,
  )
  const delayDays = Math.exp(
    evidence.posterior.location + evidence.posterior.scale * quantile,
  )
  const predicted = new Date(
    evidence.activeAt.getTime() + delayDays * MS_PER_DAY,
  )
  return predicted > now ? predicted : new Date(now.getTime() + 60 * 60 * 1000)
}

export interface WindowProbability {
  probability: number
  sampleGaps: number
  basis: 'cadence' | 'heads-up'
}

/**
 * Posterior probability that the current reset interval ends inside a future
 * time window, conditional on no reset having occurred by `now`.
 */
export function resetProbabilityInWindow(
  product: ProductData,
  windowStart: Date,
  windowEnd: Date,
  now: Date = new Date(),
): WindowProbability {
  const last = lastResetDate(product)
  const headsUp = headsUpDelayPosterior(product, now)
  const posterior = headsUp?.posterior ?? intervalPosterior(product)
  const origin = headsUp?.activeAt ?? last
  const basis = headsUp ? 'heads-up' : 'cadence'
  if (!origin || windowEnd <= now || windowEnd <= windowStart) {
    return { probability: 0, sampleGaps: posterior.sampleGaps, basis }
  }

  const elapsedDays = Math.max(1 / 1440, (now.getTime() - origin.getTime()) / MS_PER_DAY)
  const lowerDays = Math.max(
    elapsedDays,
    (windowStart.getTime() - origin.getTime()) / MS_PER_DAY,
  )
  const upperDays = (windowEnd.getTime() - origin.getTime()) / MS_PER_DAY
  if (upperDays <= lowerDays) {
    return { probability: 0, sampleGaps: posterior.sampleGaps, basis }
  }

  const survived = Math.max(1e-6, 1 - intervalCdf(elapsedDays, posterior))
  const mass = Math.max(
    0,
    intervalCdf(upperDays, posterior) - intervalCdf(lowerDays, posterior),
  )
  return {
    probability: Math.max(0, Math.min(0.99, mass / survived)),
    sampleGaps: posterior.sampleGaps,
    basis,
  }
}

export function lastResetDate(product: ProductData): Date | null {
  const events = estimateEvents(product)
  if (events.length === 0) return null
  return new Date(events[0]!.date)
}

/** Raw median-gap projection from last reset (may be in the past). */
export function estimatedNextReset(product: ProductData): Date | null {
  const last = lastResetDate(product)
  if (!last) return null
  const { days } = medianGapDays(product)
  return new Date(last.getTime() + days * MS_PER_DAY)
}

export type EstimateKind = 'median' | 'documented' | 'rolled' | 'heads-up'

export interface FutureEstimate {
  date: Date
  kind: EstimateKind
}

/**
 * Roll a cadence forward until the candidate is strictly in the future.
 * Returns null if the gap is invalid.
 */
function rollForward(from: Date, gapDays: number, now: Date, maxRolls = 8): {
  date: Date
  rolls: number
} | null {
  if (gapDays <= 0) return null
  let next = new Date(from.getTime() + gapDays * MS_PER_DAY)
  let rolls = 0
  while (next.getTime() <= now.getTime() && rolls < maxRolls) {
    next = new Date(next.getTime() + gapDays * MS_PER_DAY)
    rolls++
  }
  if (next.getTime() <= now.getTime()) return null
  return { date: next, rolls }
}

/**
 * Up to `limit` credible *future* reset estimates.
 * Never returns past datetimes — overdue raw windows are either rolled
 * forward (when sample is strong enough) or omitted (UI shows 暂无).
 */
export function futureResetEstimates(
  product: ProductData,
  now: Date = new Date(),
  limit = 2,
): FutureEstimate[] {
  const last = lastResetDate(product)
  if (!last) return []

  const headsUpEstimate = headsUpExpectedReset(product, now)
  if (headsUpEstimate) {
    const alertEstimate: FutureEstimate = {
      date: headsUpEstimate,
      kind: 'heads-up',
    }
    return [alertEstimate].slice(0, limit)
  }

  const { days, fromData, sampleGaps } = medianGapDays(product)
  const out: FutureEstimate[] = []

  const primary = rollForward(last, days, now)
  if (primary) {
    // Sparse histories: do not invent many rolled cycles — show 暂无 instead
    const sparse = sampleGaps < 2
    if (primary.rolls === 0) {
      out.push({
        date: primary.date,
        kind: fromData ? 'median' : 'documented',
      })
    } else if (!sparse) {
      out.push({ date: primary.date, kind: 'rolled' })
    }
    // else: overdue + sparse → omit (caller shows 暂无)
  }

  // Secondary: documented median when it yields a distinct future signal
  const docDays = product.documentedMedianDays
  if (
    out.length > 0 &&
    out.length < limit &&
    docDays > 0 &&
    Math.abs(docDays - days) >= 0.45
  ) {
    const secondary = rollForward(last, docDays, now)
    if (secondary && secondary.rolls === 0) {
      const primaryMs = out[0]!.date.getTime()
      if (Math.abs(secondary.date.getTime() - primaryMs) >= 12 * 60 * 60 * 1000) {
        out.push({ date: secondary.date, kind: 'documented' })
      }
    }
  }

  // If primary was omitted (overdue+sparse) but documented still yields a
  // near-term future without rolling, surface that as the only estimate.
  if (out.length === 0 && docDays > 0) {
    const doc = rollForward(last, docDays, now)
    if (doc && doc.rolls === 0) {
      out.push({ date: doc.date, kind: 'documented' })
    }
  }

  // Final guard: UI must never receive a past next-window.
  // Sort chronologically ascending (soonest first).
  return out
    .filter((f) => f.date.getTime() > now.getTime())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, limit)
}
