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
      className="inline-flex flex-wrap gap-1 rounded-2xl border border-slate-200/80 bg-slate-100/80 p-1.5 shadow-inner"
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
                ? 'bg-white text-indigo-700 shadow-sm shadow-slate-900/10 ring-1 ring-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {name}
          </button>
        )
      })}
    </div>
  )
}
