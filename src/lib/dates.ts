import { tz } from '@date-fns/tz'
import {
  addDays,
  differenceInCalendarDays,
  format,
  formatDistance,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { de } from 'date-fns/locale'

const CHART_TIME_ZONE =
  typeof Intl !== 'undefined'
    ? (Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'Europe/Berlin')
    : 'Europe/Berlin'

const chartTz = tz(CHART_TIME_ZONE)

export const chartDateOptions = { in: chartTz, locale: de } as const

export function parseIsoDate(iso: string): Date {
  return parseISO(iso, chartDateOptions)
}

function now(): Date {
  return new Date()
}

export function today(): Date {
  return startOfDay(now(), chartDateOptions)
}

export function addCalendarDays(date: Date, amount: number): Date {
  return addDays(date, amount, chartDateOptions)
}

export function daysBetween(a: Date, b: Date): number {
  return differenceInCalendarDays(b, a, chartDateOptions)
}

/** ISO week: Monday is the first day. */
export function startOfIsoWeek(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1, ...chartDateOptions })
}

export function endOfIsoWeek(date: Date): Date {
  return addCalendarDays(startOfIsoWeek(date), 7)
}

export function startOfCalendarMonth(date: Date): Date {
  return startOfMonth(date, chartDateOptions)
}

export function formatWithLocale(date: Date, pattern: string): string {
  return format(date, pattern, chartDateOptions)
}

export function formatRelativeToNow(date: Date): string {
  return formatDistance(date, now(), { addSuffix: true, ...chartDateOptions })
}
