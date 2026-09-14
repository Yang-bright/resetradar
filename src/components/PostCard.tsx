import { ExternalLink } from 'lucide-react'
import type { Post } from '../data/resets'
import type { Locale } from '../i18n/translations'
import { translations } from '../i18n/translations'
import { formatPostStamp } from '../utils/time'

interface Props {
  post: Post
  locale: Locale
}

export function PostCard({ post, locale }: Props) {
  const t = translations[locale]
  const name = locale === 'zh' && post.authorZh ? post.authorZh : post.author
  const initials = post.avatarInitials ?? name.slice(0, 2).toUpperCase()

  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5">
      <div className="mb-3 flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-semibold text-white"
          aria-hidden
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
            <div className="flex min-w-0 items-baseline gap-1.5">
              <span className="truncate font-semibold text-slate-900">{name}</span>
              {post.handle && (
                <span className="truncate text-sm text-slate-400">{post.handle}</span>
              )}
            </div>
            <time
              dateTime={post.date}
              className="shrink-0 text-xs text-slate-400"
            >
              {formatPostStamp(post.date, locale)}
            </time>
          </div>
        </div>
      </div>

      <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-700">
        {locale === 'zh' ? post.summaryZh : post.summary}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3 text-xs">
        {post.url ? (
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-indigo-600 transition hover:text-indigo-500"
          >
            {t.viewOnX}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        ) : (
          <span className="text-slate-400">{t.noUrl}</span>
        )}
      </div>
    </article>
  )
}
