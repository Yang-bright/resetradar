import type { ResetEvent, ResetKind } from '../data/resets'
import type { Locale } from '../i18n/translations'
import { translations } from '../i18n/translations'

/** Calendar display categories (distinct colors) */
export type EventCategory =
  | 'all_reset'
  | 'affected_reset'
  | 'reset_card'
  | 'special'
  | 'other'

/** ResetRadar accent: cyan all-user, orange affected, magenta cards, amber special */
export function kindLabel(kind: ResetKind, locale: Locale): string {
  const t = translations[locale]
  switch (kind) {
    case 'usage_reset':
      return t.kindUsageReset
    case 'reset_card':
      return t.kindResetCard
    case 'token_reset':
      return t.kindTokenReset
    case 'special':
      return t.kindSpecial
    default:
      return t.kindOther
  }
}

export function kindChipClass(kind: ResetKind): string {
  switch (kind) {
    case 'usage_reset':
      return 'bg-cyan-50 text-cyan-800 ring-cyan-400/40'
    case 'reset_card':
      return 'bg-fuchsia-50 text-fuchsia-800 ring-fuchsia-400/40'
    case 'token_reset':
      return 'bg-violet-50 text-violet-800 ring-violet-400/40'
    case 'special':
      return 'bg-amber-50 text-amber-800 ring-amber-400/45'
    default:
      return 'bg-slate-100 text-slate-700 ring-slate-300/60'
  }
}

export function kindDotClass(kind: ResetKind): string {
  switch (kind) {
    case 'usage_reset':
      return 'bg-cyan-500'
    case 'reset_card':
      return 'bg-fuchsia-500'
    case 'token_reset':
      return 'bg-violet-500'
    case 'special':
      return 'bg-amber-500'
    default:
      return 'bg-slate-400'
  }
}

export function kindSpineClass(kind: ResetKind): string {
  switch (kind) {
    case 'usage_reset':
      return 'border-cyan-400/70 bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.55)]'
    case 'reset_card':
      return 'border-fuchsia-400/70 bg-fuchsia-400 shadow-[0_0_12px_rgba(232,121,249,0.5)]'
    case 'token_reset':
      return 'border-violet-400/70 bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.5)]'
    case 'special':
      return 'border-amber-300/70 bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.45)]'
    default:
      return 'border-slate-400/50 bg-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.35)]'
  }
}

/**
 * Honest mapping for month summary / calendar colors:
 * - usage_reset (all-users / all paid) → 全员重置
 * - usage_reset / token_reset that apply to a subset → 受影响用户重置
 * - reset_card / banked issuance → 发重置卡
 * - special / pricing → 特殊事件
 */
export function isAllAudience(event: ResetEvent): boolean {
  const blob = `${event.scope} ${event.scopeZh}`.toLowerCase()
  if (
    /affected|subset|failed|without|尚未|受影响|仅\s|only\b|max weekly|compensation/i.test(
      blob,
    )
  ) {
    return false
  }
  if (/all|全体|全用户|全员|everyone|全体付费/.test(blob)) return true
  if (/\bpaid\b/.test(blob) && !/without|尚未/.test(blob)) return true
  // Default usage-class resets to all-user when scope is ambiguous
  return true
}

export function eventCategory(event: ResetEvent): EventCategory {
  if (event.kind === 'special') return 'special'
  if (event.kind === 'reset_card') return 'reset_card'
  if (event.kind === 'usage_reset' || event.kind === 'token_reset') {
    return isAllAudience(event) ? 'all_reset' : 'affected_reset'
  }
  return 'other'
}

export function categoryLabel(cat: EventCategory, locale: Locale): string {
  const t = translations[locale]
  switch (cat) {
    case 'all_reset':
      return t.catAllReset
    case 'affected_reset':
      return t.catAffectedReset
    case 'reset_card':
      return t.catResetCard
    case 'special':
      return t.catSpecial
    default:
      return t.kindOther
  }
}

export function categoryDotClass(cat: EventCategory): string {
  switch (cat) {
    case 'all_reset':
      return 'bg-cyan-500'
    case 'affected_reset':
      return 'bg-orange-500'
    case 'reset_card':
      return 'bg-fuchsia-500'
    case 'special':
      return 'bg-amber-500'
    default:
      return 'bg-slate-400'
  }
}

export function categoryChipClass(cat: EventCategory): string {
  switch (cat) {
    case 'all_reset':
      return 'bg-cyan-50 text-cyan-800 ring-cyan-400/40'
    case 'affected_reset':
      return 'bg-orange-50 text-orange-800 ring-orange-400/40'
    case 'reset_card':
      return 'bg-fuchsia-50 text-fuchsia-800 ring-fuchsia-400/40'
    case 'special':
      return 'bg-amber-50 text-amber-800 ring-amber-400/45'
    default:
      return 'bg-slate-100 text-slate-700 ring-slate-300/60'
  }
}

/** Priority for day cell primary marker */
const CAT_PRIORITY: EventCategory[] = [
  'special',
  'all_reset',
  'affected_reset',
  'reset_card',
  'other',
]

export function primaryCategory(events: ResetEvent[]): EventCategory | null {
  if (events.length === 0) return null
  let best: EventCategory | null = null
  let bestIdx = CAT_PRIORITY.length
  for (const e of events) {
    const cat = eventCategory(e)
    const idx = CAT_PRIORITY.indexOf(cat)
    if (idx >= 0 && idx < bestIdx) {
      best = cat
      bestIdx = idx
    }
  }
  return best
}

export function statusTitle(
  kind: ResetKind,
  productName: string,
  locale: Locale,
): string {
  const t = translations[locale]
  switch (kind) {
    case 'usage_reset':
      return `${productName} · ${t.statusResetComplete}`
    case 'reset_card':
      return `${productName} · ${t.statusCardIssued}`
    case 'token_reset':
      return `${productName} · ${t.statusTokenReset}`
    case 'special':
      return `${productName} · ${t.statusSpecial}`
    default:
      return `${productName} · ${t.statusOther}`
  }
}
