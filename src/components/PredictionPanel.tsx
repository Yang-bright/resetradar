import { Sparkles } from 'lucide-react'
import type { ProductData } from '../data/resets'
import type { Locale } from '../i18n/translations'
import { translations } from '../i18n/translations'
import { dailyPredictions, lastResetDate } from '../utils/estimates'
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
  const maxP = Math.max(...preds.map((p) => p.probability), 0.01)

  return (
    <section className="flex h-full flex-col rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5 sm:p-7">
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Sparkles className="h-4 w-4" aria-hidden />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            {t.predictionTitle}
          </h3>
          <p className="text-xs text-slate-400">{t.predictionHint}</p>
        </div>
      </div>

      <ul className="flex flex-1 flex-col gap-3">
        {preds.map((p) => {
          const pct = Math.round(p.probability * 100)
          const isPeak = p.probability === maxP
          return (
            <li key={p.dayKey} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span
                  className={`font-medium ${
                    isPeak ? 'text-indigo-700' : 'text-slate-600'
                  }`}
                >
                  {formatDate(p.date, locale)}
                </span>
                <span
                  className={`tabular-nums font-semibold ${
                    isPeak ? 'text-indigo-700' : 'text-slate-500'
                  }`}
                >
                  {pct}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all ${
                    isPeak
                      ? 'bg-gradient-to-r from-indigo-500 to-violet-500'
                      : 'bg-indigo-300'
                  }`}
                  style={{ width: `${Math.max(4, pct)}%` }}
                />
              </div>
            </li>
          )
        })}
      </ul>

      <p className="mt-5 text-xs leading-relaxed text-slate-400">
        {t.methodologyShort}
        {last && (
          <>
            {' '}
            · {locale === 'zh' ? '自最近确认起算' : 'From last confirmation'}
          </>
        )}
      </p>
    </section>
  )
}
