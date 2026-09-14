import type { ProductData } from '../data/resets'
import type { Locale } from '../i18n/translations'
import { translations } from '../i18n/translations'

export function feedTitle(product: ProductData, locale: Locale): string {
  const t = translations[locale]
  switch (product.id) {
    case 'codex':
      return t.postsCodex
    case 'claude':
      return t.postsClaude
    case 'grok':
      return t.postsGrok
    default:
      return t.posts
  }
}
