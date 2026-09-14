import type { ResetKind } from '../data/resets'
import type { Locale } from '../i18n/translations'
import { translations } from '../i18n/translations'

/** ResetRadar accent: indigo for full reset, rose for cards, violet for tokens */
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
      return 'bg-indigo-50 text-indigo-700 ring-indigo-200/80'
    case 'reset_card':
      return 'bg-rose-50 text-rose-700 ring-rose-200/80'
    case 'token_reset':
      return 'bg-violet-50 text-violet-700 ring-violet-200/80'
    default:
      return 'bg-slate-50 text-slate-600 ring-slate-200/80'
  }
}

export function kindDotClass(kind: ResetKind): string {
  switch (kind) {
    case 'usage_reset':
      return 'bg-indigo-500'
    case 'reset_card':
      return 'bg-rose-400'
    case 'token_reset':
      return 'bg-violet-500'
    default:
      return 'bg-slate-400'
  }
}

export function statusTitle(
  kind: ResetKind,
  productName: string,
  locale: Locale,
): string {
  const t = translations[locale]
  if (locale === 'zh') {
    switch (kind) {
      case 'usage_reset':
        return `${productName} ${t.statusResetComplete}`
      case 'reset_card':
        return `${productName} ${t.statusCardIssued}`
      case 'token_reset':
        return `${productName} ${t.statusTokenReset}`
      default:
        return `${productName} ${t.statusOther}`
    }
  }
  switch (kind) {
    case 'usage_reset':
      return `${productName} ${t.statusResetComplete}`
    case 'reset_card':
      return `${productName} ${t.statusCardIssued}`
    case 'token_reset':
      return `${productName} ${t.statusTokenReset}`
    default:
      return `${productName} ${t.statusOther}`
  }
}
