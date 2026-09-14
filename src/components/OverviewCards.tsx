import type { ProductData } from '../data/resets'
import type { Locale } from '../i18n/translations'
import { translations } from '../i18n/translations'
import {
  estimatedNextReset,
  isOverdue,
  lastResetDate,
  probability24h,
} from '../utils/estimates'
import { formatDateTime, zoneLabel } from '../utils/time'

const accentBorder: Record<ProductData['accent'], string> = {
  codex: 'border-emerald-500/40 hover:border-emerald-400/70',
  claude: 'border-amber-500/40 hover:border-amber-400/70',
  grok: 'border-zinc-400/40 hover:border-zinc-200/70',
}

const accentDot: Record<ProductData['accent'], string> = {
  codex: 'bg-emerald-400',
  claude: 'bg-amber-400',
  grok: 'bg-zinc-200',
}

interface Props {
  products: ProductData[]
  locale: Locale
  now: Date
  onSelect: (id: ProductData['id']) => void
}

export function OverviewCards({ products, locale, now, onSelect }: Props) {
  const t = translations[locale]
  const zl = zoneLabel(locale)

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => {
        const last = lastResetDate(p)
        const next = estimatedNextReset(p)
        const prob = probability24h(p, now)
        const overdue = isOverdue(p, now)
        const name = locale === 'zh' ? p.nameZh : p.name

        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            className={`group rounded-2xl border bg-zinc-900/80 p-5 text-left shadow-lg shadow-black/20 transition ${accentBorder[p.accent]}`}
          >
            <div className="mb-4 flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${accentDot[p.accent]}`} />
              <h2 className="text-lg font-semibold text-white">{name}</h2>
            </div>

            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-zinc-500">{t.lastReset}</dt>
                <dd className="font-medium text-zinc-100">
                  {last ? `${formatDateTime(last, locale)} ${zl}` : t.unknown}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">{t.estimatedNext}</dt>
                <dd className="font-medium text-zinc-100">
                  {next ? (
                    <>
                      {formatDateTime(next, locale)} {zl}
                      {overdue && (
                        <span className="ml-2 rounded bg-rose-500/20 px-1.5 py-0.5 text-xs text-rose-300">
                          {t.overdue}
                        </span>
                      )}
                    </>
                  ) : (
                    t.unknown
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">{t.prob24h}</dt>
                <dd className="flex items-center gap-2 font-medium text-zinc-100">
                  <span className="tabular-nums">{Math.round(prob * 100)}%</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
                    <span
                      className={`block h-full rounded-full ${
                        p.accent === 'codex'
                          ? 'bg-emerald-400'
                          : p.accent === 'claude'
                            ? 'bg-amber-400'
                            : 'bg-zinc-300'
                      }`}
                      style={{ width: `${Math.round(prob * 100)}%` }}
                    />
                  </span>
                </dd>
              </div>
            </dl>
          </button>
        )
      })}
    </div>
  )
}
