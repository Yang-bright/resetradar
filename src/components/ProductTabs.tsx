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
      className="inline-flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
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
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              isActive
                ? 'bg-gradient-to-r from-cyan-50 to-fuchsia-50 text-cyan-800 ring-1 ring-cyan-400/50'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            {name}
          </button>
        )
      })}
    </div>
  )
}
