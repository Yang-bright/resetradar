import { formatInTimeZone } from 'date-fns-tz'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'
import { addDays, startOfDay } from 'date-fns'
import type { Locale } from '../i18n/translations'

export const TZ_ZH = 'Asia/Shanghai'
export const TZ_EN = 'America/New_York'

export function zoneForLocale(locale: Locale): string {
  return locale === 'zh' ? TZ_ZH : TZ_EN
}

export function zoneLabel(locale: Locale): string {
  return locale === 'zh' ? '北京时间' : 'ET'
}

export function zoneHint(locale: Locale): string {
  return locale === 'zh' ? '北京时间 · UTC+8' : 'US Eastern · ET'
}

/** yyyy-MM-dd in the locale display timezone */
export function calendarDayKey(iso: string | Date, locale: Locale): string {
  const date = typeof iso === 'string' ? new Date(iso) : iso
  return formatInTimeZone(date, zoneForLocale(locale), 'yyyy-MM-dd')
}

/** Format an ISO/UTC date for display in the locale timezone */
export function formatDateTime(iso: string | Date, locale: Locale): string {
  const date = typeof iso === 'string' ? new Date(iso) : iso
  const tz = zoneForLocale(locale)
  const pattern =
    locale === 'zh' ? 'M月d日 HH:mm' : 'MMM d, h:mm a'
  return formatInTimeZone(date, tz, pattern)
}

export function formatDateTimeFull(iso: string | Date, locale: Locale): string {
  const date = typeof iso === 'string' ? new Date(iso) : iso
  const tz = zoneForLocale(locale)
  const pattern =
    locale === 'zh' ? 'yyyy年M月d日 HH:mm' : 'MMM d, yyyy h:mm a'
  return formatInTimeZone(date, tz, pattern)
}

export function formatDate(iso: string | Date, locale: Locale): string {
  const date = typeof iso === 'string' ? new Date(iso) : iso
  const tz = zoneForLocale(locale)
  const pattern = locale === 'zh' ? 'M月d日' : 'MMM d'
  return formatInTimeZone(date, tz, pattern)
}

/**
 * Next-estimate display: date only. The source data does not support a
 * reliable time-of-day prediction, so avoid presenting false precision.
 */
export function formatEstimateDate(iso: string | Date, locale: Locale): string {
  return formatDate(iso, locale)
}

/** UTC boundaries of the estimate's displayed calendar day. */
export function estimateDayWindow(
  iso: string | Date,
  locale: Locale,
): { start: Date; end: Date } {
  const date = typeof iso === 'string' ? new Date(iso) : iso
  const tz = zoneForLocale(locale)
  const localStart = startOfDay(toZonedTime(date, tz))
  return {
    start: fromZonedTime(localStart, tz),
    end: fromZonedTime(addDays(localStart, 1), tz),
  }
}

export function formatMonthTitle(year: number, monthIndex: number, locale: Locale): string {
  if (locale === 'zh') return `${year} 年 ${monthIndex + 1} 月`
  const d = new Date(Date.UTC(year, monthIndex, 1))
  return formatInTimeZone(d, 'UTC', 'MMMM yyyy')
}

export function formatWeekday(iso: string | Date, locale: Locale): string {
  const date = typeof iso === 'string' ? new Date(iso) : iso
  const tz = zoneForLocale(locale)
  const dow = Number(formatInTimeZone(date, tz, 'i')) // 1=Mon … 7=Sun
  if (locale === 'zh') {
    const names = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    return names[dow - 1] ?? ''
  }
  return formatInTimeZone(date, tz, 'EEEE')
}

export function formatPostStamp(iso: string | Date, locale: Locale): string {
  const date = typeof iso === 'string' ? new Date(iso) : iso
  const tz = zoneForLocale(locale)
  if (locale === 'zh') {
    return formatInTimeZone(date, tz, 'M/d HH:mm') + ' 发布'
  }
  return formatInTimeZone(date, tz, 'MMM d, h:mm a')
}

export function formatElapsed(
  from: Date,
  now: Date,
  locale: Locale,
): string {
  const abs = Math.max(0, now.getTime() - from.getTime())
  const days = Math.floor(abs / (24 * 60 * 60 * 1000))
  const hours = Math.floor((abs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  if (locale === 'zh') {
    if (days > 0) return `距离现在已过去 ${days} 天 ${hours} 小时`
    return `距离现在已过去 ${hours} 小时`
  }
  if (days > 0) return `${days}d ${hours}h ago`
  return `${hours}h ago`
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

/** Build a Date at local-noon UTC for a yyyy-MM-dd key (stable for comparisons) */
export function parseDayKey(dayKey: string): Date {
  return new Date(`${dayKey}T12:00:00.000Z`)
}
