import { getISODay } from 'date-fns'

import { addCalendarDays, chartDateOptions, formatWithLocale, parseIsoDate } from '../dates'

export type HolidayPeriod = {
  title: string
  start: string
  end: string
}

function toIso(date: Date): string {
  return formatWithLocale(date, 'yyyy-MM-dd')
}

/** ISO weekday: 1 = Monday, 4 = Thursday, 2 = Tuesday */
const THURSDAY = 4
const TUESDAY = 2

/**
 * Extends single-day public holidays on Tuesday or Thursday to typical
 * Brückentag long-weekend ranges and suffixes the title.
 */
export function expandBridgeDayPeriod(period: HolidayPeriod): HolidayPeriod {
  if (period.start !== period.end) return period

  const holiday = parseIsoDate(period.start)
  const weekday = getISODay(holiday, chartDateOptions)

  if (weekday === THURSDAY) {
    return {
      title: `${period.title} (Brückentag)`,
      start: period.start,
      end: toIso(addCalendarDays(holiday, 3)),
    }
  }

  if (weekday === TUESDAY) {
    return {
      title: `${period.title} (Brückentag)`,
      start: toIso(addCalendarDays(holiday, -3)),
      end: period.end,
    }
  }

  return period
}

export function expandBridgeDayPeriods(periods: HolidayPeriod[]): HolidayPeriod[] {
  return periods.map(expandBridgeDayPeriod)
}
