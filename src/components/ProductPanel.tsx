import type { ReactNode } from 'react'
import { HISTORY_CUTOFF, type ProductData } from '../data/resets'
import type { Locale } from '../i18n/translations'
import { translations } from '../i18n/translations'
import {
  estimatedNextReset,
  isOverdue,
  lastResetDate,
  medianGapDays,
  probability24h,
} from '../utils/estimates'
import {
  formatCountdown,
  formatDateTime,
  zoneLabel,
} from '../utils/time'

interface Props {
  product: ProductData
  locale: Locale
  now: Date
}

export function ProductPanel({ product, locale, now }: Props) {
  const t = translations[locale]
  const zl = zoneLabel(locale)
  const last = lastResetDate(product)
  const next = estimatedNextReset(product)
  const gap = medianGapDays(product)
  const prob = probability24h(product, now)
  const overdue = isOverdue(product, now)
  const countdown = next ? formatCountdown(next, now, locale) : null

  const mainHistory = product.events
    .filter((e) => e.inMainHistory && +new Date(e.date) >= +new Date(HISTORY_CUTOFF))
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))

  const background = product.events
    .filter((e) => !e.inMainHistory || +new Date(e.date) < +new Date(HISTORY_CUTOFF))
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))

  const desc = locale === 'zh' ? product.descriptionZh : product.description
  const caveat = locale === 'zh' ? product.caveatZh : product.caveat

  const accentRing =
    product.accent === 'codex'
      ? 'ring-emerald-500/30'
      : product.accent === 'claude'
        ? 'ring-amber-500/30'
        : 'ring-zinc-400/30'

  return (
    <div className={`space-y-8 rounded-2xl ring-1 ring-inset ${accentRing} bg-zinc-900/40 p-5 sm:p-6`}>
      <p className="text-sm leading-relaxed text-zinc-400">{desc}</p>

      {caveat && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-100/90">
          <span className="font-semibold">{t.caveat}: </span>
          {caveat}
        </div>
      )}

      {/* Estimate */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-white">{t.estimate}</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat
            label={t.lastReset}
            value={last ? `${formatDateTime(last, locale)} ${zl}` : t.unknown}
          />
          <Stat
            label={t.estimatedNext}
            value={
              next ? (
                <span>
                  {formatDateTime(next, locale)} {zl}
                  {overdue && (
                    <span className="ml-2 text-xs text-rose-300">{t.overdue}</span>
                  )}
                </span>
              ) : (
                t.unknown
              )
            }
          />
          <Stat
            label={t.countdown}
            value={countdown?.text ?? t.unknown}
            highlight={countdown?.overdue}
          />
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          {t.medianGap}: {gap.days.toFixed(1)} {t.days}{' '}
          {gap.fromData ? t.fromData : t.fromSeed}
          {gap.sampleGaps > 0 ? ` · n=${gap.sampleGaps}` : ''}
        </p>
      </section>

      {/* Probability */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-white">{t.probability}</h3>
        <div className="flex items-center gap-4">
          <div className="text-3xl font-bold tabular-nums text-white">
            {Math.round(prob * 100)}%
          </div>
          <div className="flex-1">
            <div className="mb-1 text-sm text-zinc-400">{t.prob24h}</div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className={`h-full rounded-full transition-all ${
                  product.accent === 'codex'
                    ? 'bg-emerald-400'
                    : product.accent === 'claude'
                      ? 'bg-amber-400'
                      : 'bg-zinc-200'
                }`}
                style={{ width: `${Math.round(prob * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* People */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-white">{t.people}</h3>
        <ul className="space-y-3">
          {product.people.map((person) => (
            <li
              key={person.name}
              className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-xl bg-black/30 px-4 py-3"
            >
              <span className="font-medium text-zinc-100">
                {locale === 'zh' && person.nameZh ? person.nameZh : person.name}
              </span>
              {person.handle && (
                <span className="text-sm text-zinc-500">{person.handle}</span>
              )}
              <span className="w-full text-sm text-zinc-400 sm:w-auto">
                {locale === 'zh' && person.roleZh ? person.roleZh : person.role}
              </span>
              {person.profileUrl && (
                <a
                  href={person.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-sky-400 hover:underline"
                >
                  {t.viewProfile}
                </a>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Posts */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-white">{t.posts}</h3>
        <ul className="space-y-3">
          {product.posts.map((post, i) => (
            <li
              key={`${post.date}-${i}`}
              className="rounded-xl border border-white/5 bg-black/20 px-4 py-3"
            >
              <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                <time dateTime={post.date}>
                  {formatDateTime(post.date, locale)} {zl}
                </time>
                <span>·</span>
                <span>{post.author}</span>
              </div>
              <p className="text-sm text-zinc-200">
                {locale === 'zh' ? post.summaryZh : post.summary}
              </p>
              {post.url ? (
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs text-sky-400 hover:underline"
                >
                  {post.url.replace(/^https?:\/\//, '')}
                </a>
              ) : (
                <span className="mt-2 inline-block text-xs text-zinc-600">
                  {t.noUrl}
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* History */}
      <section>
        <h3 className="mb-1 text-base font-semibold text-white">{t.history}</h3>
        <p className="mb-3 text-xs text-zinc-500">{t.historyNote}</p>
        {mainHistory.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-zinc-500">
            {t.historyEmpty}
          </p>
        ) : (
          <HistoryTable events={mainHistory} locale={locale} />
        )}

        {background.length > 0 && (
          <div className="mt-4">
            <h4 className="mb-2 text-sm font-medium text-zinc-400">
              {t.backgroundEvents}
            </h4>
            <HistoryTable events={background} locale={locale} muted />
          </div>
        )}
      </section>
    </div>
  )
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string
  value: ReactNode
  highlight?: boolean
}) {
  return (
    <div className="rounded-xl bg-black/30 px-4 py-3">
      <div className="text-xs text-zinc-500">{label}</div>
      <div
        className={`mt-1 text-sm font-medium ${
          highlight ? 'text-rose-300' : 'text-zinc-100'
        }`}
      >
        {value}
      </div>
    </div>
  )
}

function HistoryTable({
  events,
  locale,
  muted,
}: {
  events: ProductData['events']
  locale: Locale
  muted?: boolean
}) {
  const t = translations[locale]
  const zl = zoneLabel(locale)
  return (
    <div className="overflow-x-auto rounded-xl border border-white/5">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead className="bg-black/40 text-xs uppercase tracking-wide text-zinc-500">
          <tr>
            <th className="px-3 py-2 font-medium">{t.date}</th>
            <th className="px-3 py-2 font-medium">{t.kind}</th>
            <th className="px-3 py-2 font-medium">{t.scope}</th>
            <th className="px-3 py-2 font-medium">{t.note}</th>
          </tr>
        </thead>
        <tbody className={muted ? 'text-zinc-500' : 'text-zinc-300'}>
          {events.map((e) => (
            <tr key={`${e.date}-${e.kind}`} className="border-t border-white/5">
              <td className="whitespace-nowrap px-3 py-2.5">
                {formatDateTime(e.date, locale)} {zl}
              </td>
              <td className="px-3 py-2.5 font-mono text-xs">{e.kind}</td>
              <td className="px-3 py-2.5">
                {locale === 'zh' ? e.scopeZh : e.scope}
              </td>
              <td className="px-3 py-2.5">
                {locale === 'zh' ? e.noteZh : e.note}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
