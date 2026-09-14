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
    <div className="min-h-dvh bg-[#f4f5f8] text-slate-900">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-violet-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-rose-100/40 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-indigo-700 ring-1 ring-inset ring-indigo-200/60">
                {locale === 'zh' ? 'ResetRadar' : '重置雷达'}
              </span>
              <span className="text-xs text-slate-400">{zoneHint(locale)}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {t.brand}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
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

        <p className="mb-6 max-w-3xl text-sm leading-relaxed text-slate-500">
          {desc}
        </p>

        {caveat && (
          <div className="mb-6 rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-900/90">
            <span className="font-semibold">{t.caveat}: </span>
            {caveat}
          </div>
        )}

        <div className="mb-8 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <StatusHero product={activeProduct} locale={locale} now={now} />
          <PredictionPanel product={activeProduct} locale={locale} now={now} />
        </div>

        <div className="mb-8">
          <ResetCalendar product={activeProduct} locale={locale} />
        </div>

        <section className="mb-8 space-y-5 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5 sm:p-7">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {t.methodologyTitle}
            </h2>
            <pre className="mt-2 whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-500">
              {t.methodology}
            </pre>
          </div>
          <div className="border-t border-slate-100 pt-5">
            <h2 className="text-base font-semibold text-slate-900">
              {t.disclaimerTitle}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              {t.disclaimer}
            </p>
          </div>
        </section>

        <footer className="border-t border-slate-200/80 pt-6 text-center text-xs text-slate-400">
          <p>{t.footerCopy}</p>
          <p className="mt-1 font-mono text-slate-500">{t.footerSite}</p>
        </footer>
      </div>
    </div>
  )
}
