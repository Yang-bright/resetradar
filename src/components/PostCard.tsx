import { ExternalLink } from 'lucide-react'
import type { Post } from '../data/resets'
import type { Locale } from '../i18n/translations'
import { translations } from '../i18n/translations'
import { formatPostStamp } from '../utils/time'

interface Props {
  post: Post
  locale: Locale
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

export function PostCard({ post, locale }: Props) {
  const t = translations[locale]
  const name = locale === 'zh' && post.authorZh ? post.authorZh : post.author
  const initials = post.avatarInitials ?? name.slice(0, 2).toUpperCase()
  const src = avatarSrc(post)

  return (
    <article className="rounded-2xl border border-white/10 bg-[#0d121a]/90 p-4 shadow-[inset_0_1px_0_rgba(34,211,238,0.08)]">
      <div className="mb-3 flex items-start gap-3">
        {src ? (
          <img
            src={src}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-cyan-400/25"
          />
        ) : (
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500 text-xs font-semibold text-[#07090d]"
            aria-hidden
          >
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
            <div className="flex min-w-0 items-baseline gap-1.5">
              <span className="truncate font-semibold text-slate-100">{name}</span>
              {post.handle && (
                <span className="truncate text-sm text-cyan-400/70">{post.handle}</span>
              )}
            </div>
            <time
              dateTime={post.date}
              className="rr-mono shrink-0 text-xs text-slate-500"
            >
              {formatPostStamp(post.date, locale)}
            </time>
          </div>
        </div>
      </div>

      <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-300">
        {locale === 'zh' ? post.summaryZh : post.summary}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-white/5 pt-3 text-xs">
        {post.url ? (
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-cyan-400 transition hover:text-cyan-300"
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
