import { formatInTimeZone } from 'date-fns-tz'
import type { Locale } from '../i18n/translations'

export const TZ_ZH = 'Asia/Shanghai'
export const TZ_EN = 'America/New_York'

export function zoneForLocale(locale: Locale): string {
  return locale === 'zh' ? TZ_ZH : TZ_EN
}

export function zoneLabel(locale: Locale): string {
  return locale === 'zh' ? '北京时间' : 'ET'
}

/** Format an ISO/UTC date for display in the locale timezone */
export function formatDateTime(iso: string | Date, locale: Locale): string {
  const date = typeof iso === 'string' ? new Date(iso) : iso
  const tz = zoneForLocale(locale)
  const pattern =
    locale === 'zh' ? 'yyyy-MM-dd HH:mm' : 'MMM d, yyyy h:mm a'
  return formatInTimeZone(date, tz, pattern)
}

export function formatDate(iso: string | Date, locale: Locale): string {
  const date = typeof iso === 'string' ? new Date(iso) : iso
  const tz = zoneForLocale(locale)
  const pattern = locale === 'zh' ? 'yyyy-MM-dd' : 'MMM d, yyyy'
  return formatInTimeZone(date, tz, pattern)
}

export function formatCountdown(
  target: Date,
  now: Date,
  locale: Locale,
): { text: string; overdue: boolean } {
  const diff = target.getTime() - now.getTime()
  const overdue = diff < 0
  const abs = Math.abs(diff)
  const days = Math.floor(abs / (24 * 60 * 60 * 1000))
  const hours = Math.floor((abs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const mins = Math.floor((abs % (60 * 60 * 1000)) / (60 * 1000))

  if (locale === 'zh') {
    const body =
      days > 0
        ? `${days} 天 ${hours} 小时`
        : hours > 0
          ? `${hours} 小时 ${mins} 分`
          : `${mins} 分`
    return {
      text: overdue ? `已逾期 ${body}` : `还剩 ${body}`,
      overdue,
    }
  }

  const body =
    days > 0
      ? `${days}d ${hours}h`
      : hours > 0
        ? `${hours}h ${mins}m`
        : `${mins}m`
  return {
    text: overdue ? `Overdue by ${body}` : `${body} remaining`,
    overdue,
  }
}
