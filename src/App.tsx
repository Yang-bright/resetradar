import { useMemo, useState } from 'react'
import { LocaleToggle } from './components/LocaleToggle'
import { OverviewCards } from './components/OverviewCards'
import { ProductPanel } from './components/ProductPanel'
import { ProductTabs } from './components/ProductTabs'
import { products, type ProductId } from './data/resets'
import { useLocale } from './hooks/useLocale'
import { useNow } from './hooks/useNow'
import { zoneLabel } from './utils/time'

export default function App() {
  const { locale, toggle, t } = useLocale()
  const now = useNow()
  const [active, setActive] = useState<ProductId>('codex')

  const activeProduct = useMemo(
    () => products.find((p) => p.id === active) ?? products[0]!,
    [active],
  )

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-zinc-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6">
        <header className="mb-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
              {t.brandEn}
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t.brand}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-zinc-400 sm:text-base">
              {t.tagline}
            </p>
            <p className="mt-2 text-xs text-zinc-600">
              {t.timezoneHint} · {zoneLabel(locale)}
            </p>
          </div>
          <LocaleToggle
            locale={locale}
            onToggle={toggle}
            label={locale === 'zh' ? t.switchToEn : t.switchToZh}
          />
        </header>

        <section className="mb-10" aria-label={t.allProducts}>
          <OverviewCards
            products={products}
            locale={locale}
            now={now}
            onSelect={setActive}
          />
        </section>

        <section className="mb-10 space-y-4">
          <ProductTabs active={active} locale={locale} onChange={setActive} />
          <ProductPanel product={activeProduct} locale={locale} now={now} />
        </section>

        <section className="mb-8 space-y-4 rounded-2xl border border-white/10 bg-zinc-900/50 p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {t.disclaimerTitle}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              {t.disclaimer}
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              {t.methodologyTitle}
            </h2>
            <pre className="mt-2 whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-400">
              {t.methodology}
            </pre>
          </div>
        </section>

        <footer className="border-t border-white/5 pt-6 text-center text-xs text-zinc-600">
          <p>{t.footerCopy}</p>
          <p className="mt-1 font-mono text-zinc-500">{t.footerSite}</p>
        </footer>
      </div>
    </div>
  )
}
