import type { ProductId } from '../data/resets'
import type { Locale } from '../i18n/translations'
import { products } from '../data/resets'

interface Props {
  active: ProductId
  locale: Locale
  onChange: (id: ProductId) => void
}

const accentActive: Record<ProductId, string> = {
  codex: 'border-emerald-400 text-emerald-300 bg-emerald-500/10',
  claude: 'border-amber-400 text-amber-300 bg-amber-500/10',
  grok: 'border-zinc-300 text-zinc-100 bg-zinc-500/10',
}

export function ProductTabs({ active, locale, onChange }: Props) {
  return (
    <div
      className="flex flex-wrap gap-2 border-b border-white/10 pb-3"
      role="tablist"
    >
      {products.map((p) => {
        const name = locale === 'zh' ? p.nameZh : p.name
        const isActive = active === p.id
        return (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(p.id)}
            className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
              isActive
                ? accentActive[p.id]
                : 'border-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
            }`}
          >
            {name}
          </button>
        )
      })}
    </div>
  )
}
