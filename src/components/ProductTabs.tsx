import type { ProductId } from '../data/resets'
import type { Locale } from '../i18n/translations'
import { products } from '../data/resets'

interface Props {
  active: ProductId
  locale: Locale
  onChange: (id: ProductId) => void
}

export function ProductTabs({ active, locale, onChange }: Props) {
  return (
    <div
      className="inline-flex flex-wrap gap-1 rounded-2xl border border-white/10 bg-[#0b1018] p-1.5"
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
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? 'bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 text-cyan-200 ring-1 ring-cyan-400/40'
                : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            {name}
          </button>
        )
      })}
    </div>
  )
}
