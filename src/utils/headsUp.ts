import type { Post, ProductData } from '../data/resets'

/** Posts explicitly tagged as public reset pre-announcements. */
export function headsUpPosts(product: ProductData): Post[] {
  return product.posts.filter((p) => p.signal === 'heads-up')
}

function estimateEligibleTimestamps(product: ProductData): number[] {
  return product.events
    .filter((e) => e.countsForEstimate)
    .map((e) => +new Date(e.date))
}

/**
 * A heads-up is unfulfilled when no estimate-eligible reset has landed
 * *after* that heads-up's timestamp (strictly later).
 * Fulfilled historical previews stay on the left / calendar, not the right pin.
 */
export function unfulfilledHeadsUpPosts(product: ProductData): Post[] {
  const landed = estimateEligibleTimestamps(product)

  return headsUpPosts(product)
    .filter((p) => {
      const t = +new Date(p.date)
      return !landed.some((et) => et > t)
    })
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
}

export function hasUnfulfilledHeadsUp(product: ProductData): boolean {
  return unfulfilledHeadsUpPosts(product).length > 0
}

/** Illustrative boost when a public heads-up is still open (capped later). */
export const HEADS_UP_PROB_MULT = 1.38
export const HEADS_UP_PROB_ADD = 0.12
