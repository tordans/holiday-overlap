import { daysBetween, formatRelativeToNow, formatWithLocale, parseIsoDate } from './dates'

function stripTrailingDot(text: string): string {
  return text.replace(/\.$/, '')
}

function formatShortDateFromDate(date: Date): string {
  const formatted = formatWithLocale(date, 'EEE d.M.')
  return formatted.replace(/^(\w+)\./, '$1')
}

export function formatShortDate(iso: string): string {
  return formatShortDateFromDate(parseIsoDate(iso))
}

export function formatMonthLabel(date: Date): string {
  return stripTrailingDot(formatWithLocale(date, 'LLL'))
}

function rangeDayCount(startIso: string, endIso: string): number {
  const start = parseIsoDate(startIso)
  const end = parseIsoDate(endIso)
  return Math.max(1, daysBetween(start, end) + 1)
}

export function formatBarLabel(name: string, startIso: string, endIso: string): string {
  return `${name} (${rangeDayCount(startIso, endIso)})`
}

export type DateTooltipLines = {
  shortDate: string
  monthYear: string
  relative: string
}

export function formatDateTooltip(date: Date): DateTooltipLines {
  return {
    shortDate: formatShortDateFromDate(date),
    monthYear: formatWithLocale(date, 'LLLL yyyy'),
    relative: formatRelativeToNow(date),
  }
}
