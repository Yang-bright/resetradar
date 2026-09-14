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

  return (
    <div className="rr-radar-grid relative min-h-dvh overflow-hidden bg-[#07090d] text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="rr-scanline absolute inset-x-0 top-0 h-40 opacity-40" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
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

        {caveat && (
          <p className="mb-5 text-xs leading-relaxed text-amber-200/70">
            <span className="font-semibold text-amber-200/90">{t.caveat}: </span>
            {caveat}
          </p>
        )}

        {/* Primary: LAST RESET + Tibo post */}
        <div className="mb-4">
          <StatusHero product={activeProduct} locale={locale} now={now} />
        </div>

        {/* Optional one-line next-window hint — no daily bars */}
        <div className="mb-8">
          <PredictionPanel product={activeProduct} locale={locale} now={now} />
        </div>

        {/* Secondary: calendar → click for day detail + Tibo */}
        <div className="mb-10">
          <ResetCalendar product={activeProduct} locale={locale} />
        </div>

        <footer className="border-t border-white/5 pt-6 text-center text-xs text-slate-600">
          <p className="mx-auto max-w-2xl leading-relaxed text-slate-500">
            {t.disclaimerShort}
          </p>
          <p className="mt-3">{t.footerCopy}</p>
          <p className="mt-1 rr-mono text-slate-500">{t.footerSite}</p>
        </footer>
      </div>
    </div>
  )
}
