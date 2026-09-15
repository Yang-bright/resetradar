import { useMemo, useState } from 'react'
import { LocaleToggle } from './components/LocaleToggle'
import { ProductTabs } from './components/ProductTabs'
import { ResetCalendar } from './components/ResetCalendar'
import { StatusHero } from './components/StatusHero'
import { AdSlot } from './components/AdSlot'
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

  return (
    <div className="rr-radar-grid relative min-h-dvh overflow-hidden bg-[#f4f5f8] text-slate-800">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="rr-scanline absolute inset-x-0 top-0 h-40 opacity-30" />
      </div>

      <div className="relative mx-auto max-w-7xl px-3 pb-10 pt-5 sm:px-5">
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-cyan-500/30 bg-cyan-50 px-2.5 py-0.5 rr-mono text-[10px] font-semibold tracking-[0.22em] text-cyan-700">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-500 opacity-50" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-500" />
                </span>
                RESETRADAR
              </span>
              <span className="rr-mono text-xs text-slate-500">
                {zoneHint(locale)}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {t.brand}
            </h1>
            <p className="mt-1 max-w-2xl text-xs text-slate-600 sm:text-sm">
              {t.tagline}
            </p>
          </div>
          <LocaleToggle
            locale={locale}
            onToggle={toggle}
            label={locale === 'zh' ? t.switchToEn : t.switchToZh}
          />
        </header>

        <div className="mb-4">
          <ProductTabs active={active} locale={locale} onChange={setActive} />
        </div>

        {/* Hero: last reset | next prediction (same row) + related posts */}
        <div className="mb-4">
          <StatusHero product={activeProduct} locale={locale} now={now} />
        </div>

        {/* Calendar → click for day detail + related posts */}
        <div className="mb-6">
          <ResetCalendar product={activeProduct} locale={locale} />
        </div>

        <AdSlot locale={locale} />

        <footer className="border-t border-slate-200 pt-4 text-center text-[11px] text-slate-500">
          <p className="mx-auto max-w-2xl leading-relaxed text-slate-500">
            {t.disclaimerShort}
          </p>
          <p className="mt-3">{t.footerCopy}</p>
          <p className="mt-1 rr-mono text-slate-400">{t.footerSite}</p>
        </footer>
      </div>
    </div>
  )
}
