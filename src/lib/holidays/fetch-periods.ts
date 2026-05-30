import { expandBridgeDayPeriods, type HolidayPeriod } from './bridge-days'
import { mergePeriodsByRange } from './merge-periods'

export type { HolidayPeriod } from './bridge-days'

const API_BASE = 'https://www.mehr-schulferien.de/api/v2.1'

export type PeriodKind = 'vacation' | 'holiday'

type ApiPeriod = {
  name: string
  starts_on: string
  ends_on: string
  type: string
}

type ApiResponse = {
  data: ApiPeriod[]
}

const VACATION_NAME_LABELS: Record<string, string> = {
  Sommer: 'Sommerferien',
  Herbst: 'Herbstferien',
  Frühjahr: 'Frühjahrsferien',
  Ostern: 'Osterferien',
  Pfingsten: 'Pfingstferien',
  Weihnachten: 'Weihnachtsferien',
}

function cacheKey(slug: string, year: number, kind: PeriodKind): string {
  return `mehr-schulferien:v3:${slug}:${year}:${kind}`
}

function readCache(key: string): HolidayPeriod[] | null {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as HolidayPeriod[]
  } catch {
    return null
  }
}

function writeCache(key: string, periods: HolidayPeriod[]): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(periods))
  } catch {
    // ignore quota errors
  }
}

function formatTitle(name: string, kind: PeriodKind): string {
  if (kind === 'holiday') return name
  return VACATION_NAME_LABELS[name] ?? name
}

function overlapsYear(start: string, end: string, year: number): boolean {
  const startYear = Number.parseInt(start.slice(0, 4), 10)
  const endYear = Number.parseInt(end.slice(0, 4), 10)
  return startYear <= year && endYear >= year
}

function normalizePeriods(items: ApiPeriod[], kind: PeriodKind, year: number): HolidayPeriod[] {
  const periods = items
    .filter((item) => overlapsYear(item.starts_on, item.ends_on, year))
    .map((item) => ({
      title: formatTitle(item.name, kind),
      start: item.starts_on,
      end: item.ends_on,
    }))

  const merged = mergePeriodsByRange(periods)

  if (kind === 'holiday') {
    return mergePeriodsByRange(expandBridgeDayPeriods(merged))
  }

  return merged
}

export async function fetchPeriods(
  slug: string,
  year: number,
  kind: PeriodKind,
): Promise<HolidayPeriod[]> {
  const key = cacheKey(slug, year, kind)
  const cached = readCache(key)
  if (cached) return cached

  const startDate = `${year}-01-01`
  const endDate = `${year}-12-31`
  const url = `${API_BASE}/federal-states/${slug}/periods?start_date=${startDate}&end_date=${endDate}&type=${kind}`

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`API-Fehler (${response.status})`)
  }

  const body = (await response.json()) as ApiResponse
  const periods = normalizePeriods(body.data ?? [], kind, year)
  writeCache(key, periods)
  return periods
}

export async function fetchSchoolVacations(slug: string, year: number): Promise<HolidayPeriod[]> {
  return fetchPeriods(slug, year, 'vacation')
}

export async function fetchPublicHolidays(slug: string, year: number): Promise<HolidayPeriod[]> {
  return fetchPeriods(slug, year, 'holiday')
}

export async function fetchSchoolAndPublicHolidays(
  slug: string,
  year: number,
  includePublicHolidays: boolean,
): Promise<HolidayPeriod[]> {
  const vacations = await fetchSchoolVacations(slug, year)
  if (!includePublicHolidays) return vacations

  const holidays = await fetchPublicHolidays(slug, year)
  return [...vacations, ...holidays]
}
