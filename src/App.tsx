import { useMemo, useState } from 'react'
import { LocaleToggle } from './components/LocaleToggle'
import { PredictionPanel } from './components/PredictionPanel'
import { ProductTabs } from './components/ProductTabs'
import { ResetCalendar } from './components/ResetCalendar'
import { StatusHero } from './components/StatusHero'
import { products, type ProductId } from './data/resets'
import { useLocale } from './hooks/useLocale'
import { useNow } from './hooks/useNow'
import { zoneHint } from './utils/time'

export default function App() {
  const { locale, toggle, t } = useLocale()
  const now = useNow()
  const [active, setActive] = useState<ProductId>('codex')

  const activeProduct = useMemo(
    () => products.find((p) => p.id === active) ?? products[0]!,
    [active],
  )

  const caveat =
    locale === 'zh' ? activeProduct.caveatZh : activeProduct.caveat
  const desc =
    locale === 'zh' ? activeProduct.descriptionZh : activeProduct.description

  return (
    <div className="rr-radar-grid relative min-h-dvh overflow-hidden bg-[#07090d] text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="rr-scanline absolute inset-x-0 top-0 h-40 opacity-40" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-cyan-400/35 bg-cyan-500/10 px-2.5 py-0.5 rr-mono text-[10px] font-semibold tracking-[0.22em] text-cyan-300">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
                </span>
                RESETRADAR
              </span>
              <span className="rr-mono text-xs text-slate-500">
                {zoneHint(locale)}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t.brand}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">
              {t.tagline}
            </p>
          </div>
          <LocaleToggle
            locale={locale}
            onToggle={toggle}
            label={locale === 'zh' ? t.switchToEn : t.switchToZh}
          />
        </header>

        <div className="mb-6">
          <ProductTabs active={active} locale={locale} onChange={setActive} />
        </div>

        <p className="mb-6 max-w-3xl text-sm leading-relaxed text-slate-400">
          {desc}
        </p>

        {caveat && (
          <div className="mb-6 rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
            <span className="font-semibold">{t.caveat}: </span>
            {caveat}
          </div>
        )}

        <div className="mb-8 grid gap-5 lg:grid-cols-[1.45fr_1fr]">
          <StatusHero product={activeProduct} locale={locale} now={now} />
          <PredictionPanel product={activeProduct} locale={locale} now={now} />
        </div>

        <div className="mb-8">
          <ResetCalendar product={activeProduct} locale={locale} />
        </div>

        <section className="mb-8 space-y-5 rounded-3xl border border-white/10 bg-[#0c1119] p-5 sm:p-7">
          <div>
            <h2 className="text-base font-semibold text-white">
              {t.methodologyTitle}
            </h2>
            <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-400">
              {t.methodology}
            </pre>
          </div>
          <div className="border-t border-white/5 pt-5">
            <h2 className="text-base font-semibold text-white">
              {t.disclaimerTitle}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              {t.disclaimer}
            </p>
          </div>
        </section>

        <footer className="border-t border-white/5 pt-6 text-center text-xs text-slate-600">
          <p>{t.footerCopy}</p>
          <p className="mt-1 rr-mono text-slate-500">{t.footerSite}</p>
        </footer>
      </div>
    </div>
  )
}
