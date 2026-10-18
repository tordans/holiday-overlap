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

/** ISO weekday: 1 = Monday, 2 = Tuesday, 4 = Thursday, 5 = Friday */
const MONDAY = 1
const TUESDAY = 2
const THURSDAY = 4
const FRIDAY = 5

/**
 * Extends single-day public holidays on Mon/Tue/Thu/Fri to typical
 * Brückentag long-weekend ranges and suffixes the title.
 */
export function expandBridgeDayPeriod(period: HolidayPeriod): HolidayPeriod {
  if (period.start !== period.end) return period

  const holiday = parseIsoDate(period.start)
  const weekday = getISODay(holiday, chartDateOptions)

  if (weekday === THURSDAY || weekday === FRIDAY) {
    const endOffset = weekday === THURSDAY ? 3 : 2
    return {
      title: `${period.title} (Brückentag)`,
      start: period.start,
      end: toIso(addCalendarDays(holiday, endOffset)),
    }
  }

  if (weekday === TUESDAY || weekday === MONDAY) {
    const startOffset = weekday === TUESDAY ? -3 : -2
    return {
      title: `${period.title} (Brückentag)`,
      start: toIso(addCalendarDays(holiday, startOffset)),
      end: period.end,
    }
  }

  return period
}

export function expandBridgeDayPeriods(periods: HolidayPeriod[]): HolidayPeriod[] {
  return periods.map(expandBridgeDayPeriod)
}
