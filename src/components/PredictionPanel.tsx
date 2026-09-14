import { Activity } from 'lucide-react'
import type { ProductData } from '../data/resets'
import type { Locale } from '../i18n/translations'
import { translations } from '../i18n/translations'
import { dailyPredictions, lastResetDate, medianGapDays } from '../utils/estimates'
import { formatDate } from '../utils/time'

interface Props {
  product: ProductData
  locale: Locale
  now: Date
}

export function PredictionPanel({ product, locale, now }: Props) {
  const t = translations[locale]
  const preds = dailyPredictions(product, now, locale, 5)
  const last = lastResetDate(product)
  const gap = medianGapDays(product)
  const maxP = Math.max(...preds.map((p) => p.probability), 0.01)
  const sparse = gap.sampleGaps < 3

  return (
    <section className="flex h-full flex-col rounded-3xl border border-white/10 bg-[#0c1119] p-5 sm:p-7">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-300">
            <Activity className="h-4 w-4" aria-hidden />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              {t.predictionTitle}
            </h3>
            <p className="text-xs text-slate-500">{t.predictionHint}</p>
          </div>
        </div>
        <span className="shrink-0 rounded-md border border-cyan-400/25 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
          {t.illustrative}
        </span>
      </div>

      {sparse && (
        <div className="mb-4 rounded-xl border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-100/90">
          {t.sampleWarn} · n={gap.sampleGaps}
        </div>
      )}

      <ul className="flex flex-1 flex-col gap-3">
        {preds.map((p) => {
          const pct = Math.round(p.probability * 100)
          const isPeak = p.probability === maxP
          return (
            <li key={p.dayKey} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span
                  className={`font-medium ${
                    isPeak ? 'text-cyan-200' : 'text-slate-400'
                  }`}
                >
                  {formatDate(p.date, locale)}
                </span>
                <span
                  className={`rr-mono tabular-nums font-semibold ${
                    isPeak ? 'text-cyan-200' : 'text-slate-500'
                  }`}
                >
                  {pct}%
                  <span className="ml-1 text-[10px] font-normal uppercase tracking-wide text-slate-600">
                    {t.illustrative}
                  </span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className={`h-full rounded-full transition-all ${
                    isPeak
                      ? 'bg-gradient-to-r from-cyan-400 via-sky-400 to-fuchsia-400'
                      : 'bg-cyan-700/70'
                  }`}
                  style={{ width: `${Math.max(4, pct)}%` }}
                />
              </div>
            </li>
          )
        })}
      </ul>

      <p className="mt-5 text-xs leading-relaxed text-slate-500">
        {t.methodologyShort}
        {last && (
          <>
            {' '}
            · {locale === 'zh' ? '自最近确认起算' : 'From last confirmation'}
          </>
        )}
        {' '}
        · n={gap.sampleGaps}
      </p>
    </section>
  )
}
