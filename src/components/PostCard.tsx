import { ExternalLink } from 'lucide-react'
import type { Post } from '../data/resets'
import type { Locale } from '../i18n/translations'
import { translations } from '../i18n/translations'
import { formatPostStamp } from '../utils/time'

interface Props {
  post: Post
  locale: Locale
  compact?: boolean
}

const AVATARS: Record<string, string> = {
  '@thsottiaux': '/tibo-avatar.jpg',
  '@elonmusk': '/elon-avatar.jpg',
  '@AnthropicAI': '/anthropic-avatar.jpg',
  '@claudeai': '/anthropic-avatar.jpg',
  '@bcherny': '/bcherny-avatar.jpg',
}

function avatarSrc(post: Post): string | undefined {
  if (post.avatarUrl) return post.avatarUrl
  if (post.handle && AVATARS[post.handle]) return AVATARS[post.handle]
  return undefined
}

/** Prefer summaryZh in zh locale; fall back to English if Zh missing/blank. */
function primarySummary(post: Post, locale: Locale): string {
  if (locale === 'zh') {
    const zh = post.summaryZh?.trim()
    if (zh) return zh
  }
  return post.summary
}

export function PostCard({ post, locale, compact = false }: Props) {
  const t = translations[locale]
  const name = locale === 'zh' && post.authorZh ? post.authorZh : post.author
  const initials = post.avatarInitials ?? name.slice(0, 2).toUpperCase()
  const src = avatarSrc(post)
  const primary = primarySummary(post, locale)
  const showEnSecondary =
    locale === 'zh' &&
    Boolean(post.summaryZh?.trim()) &&
    post.summary.trim() !== post.summaryZh.trim()

  return (
    <article className={`${compact ? 'rounded-lg p-3' : 'rounded-2xl p-4 shadow-sm'} border border-slate-200 bg-white`}>
      <div className={`${compact ? 'mb-2 gap-2.5' : 'mb-3 gap-3'} flex items-start`}>
        {src ? (
          <img
            src={src}
            alt=""
            width={compact ? 28 : 40}
            height={compact ? 28 : 40}
            className={`${compact ? 'h-7 w-7' : 'h-10 w-10'} shrink-0 rounded-full object-cover ring-1 ring-cyan-400/30`}
          />
        ) : (
          <div
            className={`${compact ? 'h-7 w-7 text-[9px]' : 'h-10 w-10 text-xs'} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-fuchsia-500 font-semibold text-white`}
            aria-hidden
          >
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
            <div className="flex min-w-0 items-baseline gap-1.5">
              <span className={`${compact ? 'text-[13px]' : ''} truncate font-semibold text-slate-900`}>{name}</span>
              {post.handle && (
                <span className={`${compact ? 'text-[11px]' : 'text-sm'} truncate text-cyan-700/80`}>{post.handle}</span>
              )}
            </div>
            <time
              dateTime={post.date}
              className={`${compact ? 'text-[10px]' : 'text-xs'} rr-mono shrink-0 text-slate-500`}
            >
              {formatPostStamp(post.date, locale)}
            </time>
          </div>
        </div>
      </div>

      <p className={`${compact ? 'line-clamp-3 text-[13px] leading-5' : 'text-[15px] leading-relaxed'} whitespace-pre-wrap text-slate-700`}>
        {primary}
      </p>
      {showEnSecondary && (
        <p className={`${compact ? 'mt-1.5 line-clamp-2 text-[12px] leading-[1.55]' : 'mt-2 text-[13px]'} whitespace-pre-wrap leading-relaxed text-slate-500`}>
          {post.summary}
        </p>
      )}

      <div className={`${compact ? 'mt-2 pt-2 text-[11px]' : 'mt-3 pt-3 text-xs'} flex flex-wrap items-center gap-3 border-t border-slate-100`}>
        {post.url ? (
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-cyan-700 transition hover:text-cyan-800"
          >
            {t.viewOnX}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        ) : (
          <span className="text-slate-500">{t.noUrl}</span>
        )}
      </div>
    </article>
  )
}
