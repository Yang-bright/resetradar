import type { ResetKind } from '../data/resets'
import type { Locale } from '../i18n/translations'
import { translations } from '../i18n/translations'

/** ResetRadar accent: cyan for usage, magenta for banked cards, violet for tokens */
export function kindLabel(kind: ResetKind, locale: Locale): string {
  const t = translations[locale]
  switch (kind) {
    case 'usage_reset':
      return t.kindUsageReset
    case 'reset_card':
      return t.kindResetCard
    case 'token_reset':
      return t.kindTokenReset
    default:
      return t.kindOther
  }
}

export function kindChipClass(kind: ResetKind): string {
  switch (kind) {
    case 'usage_reset':
      return 'bg-cyan-500/15 text-cyan-300 ring-cyan-400/30'
    case 'reset_card':
      return 'bg-fuchsia-500/15 text-fuchsia-300 ring-fuchsia-400/30'
    case 'token_reset':
      return 'bg-violet-500/15 text-violet-300 ring-violet-400/30'
    default:
      return 'bg-amber-500/10 text-amber-200/90 ring-amber-400/25'
  }
}

export function kindDotClass(kind: ResetKind): string {
  switch (kind) {
    case 'usage_reset':
      return 'bg-cyan-400'
    case 'reset_card':
      return 'bg-fuchsia-400'
    case 'token_reset':
      return 'bg-violet-400'
    default:
      return 'bg-amber-300'
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
    default:
      return 'border-amber-300/60 bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.4)]'
  }
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
    default:
      return `${productName} · ${t.statusOther}`
  }
}
