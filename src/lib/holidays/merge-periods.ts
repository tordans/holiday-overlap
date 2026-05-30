import type { HolidayPeriod } from './bridge-days'

const BRIDGE_SUFFIX = ' (Brückentag)'
const TITLE_SEP = ' / '

function parseTitle(title: string): { names: string[]; isBridge: boolean } {
  const isBridge = title.endsWith(BRIDGE_SUFFIX)
  const base = isBridge ? title.slice(0, -BRIDGE_SUFFIX.length) : title
  const names = base
    .split(TITLE_SEP)
    .map((part) => part.trim())
    .filter(Boolean)
  return { names, isBridge }
}

export function mergePeriodTitles(a: string, b: string): string {
  const first = parseTitle(a)
  const second = parseTitle(b)
  const names = [...new Set([...first.names, ...second.names])]
  const merged = names.join(TITLE_SEP)
  const isBridge = first.isBridge || second.isBridge
  return isBridge ? `${merged}${BRIDGE_SUFFIX}` : merged
}

function rangeKey(period: HolidayPeriod): string {
  return `${period.start}|${period.end}`
}

/** Merges periods with the same start/end into one bar with combined labels. */
export function mergePeriodsByRange(periods: HolidayPeriod[]): HolidayPeriod[] {
  const byRange = new Map<string, HolidayPeriod>()

  for (const period of periods) {
    const key = rangeKey(period)
    const existing = byRange.get(key)
    if (!existing) {
      byRange.set(key, period)
      continue
    }
    byRange.set(key, {
      start: period.start,
      end: period.end,
      title: mergePeriodTitles(existing.title, period.title),
    })
  }

  return [...byRange.values()]
}

function maxIsoDate(a: string, b: string): string {
  return a >= b ? a : b
}

/** Merges periods whose date ranges overlap into one bar with combined labels. */
export function mergeOverlappingPeriods(periods: HolidayPeriod[]): HolidayPeriod[] {
  if (periods.length === 0) return []

  const sorted = [...periods].sort((a, b) => a.start.localeCompare(b.start))
  const merged: HolidayPeriod[] = [{ ...sorted[0]! }]

  for (let index = 1; index < sorted.length; index++) {
    const current = sorted[index]!
    const last = merged[merged.length - 1]!

    if (current.start <= last.end) {
      last.end = maxIsoDate(last.end, current.end)
      last.title = mergePeriodTitles(last.title, current.title)
      continue
    }

    merged.push({ ...current })
  }

  return merged
}
