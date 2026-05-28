import { formatMonthLabel } from './gantt-dates'
import type { FlatGanttRow } from './gantt-types'

export const BAR_HEIGHT = 24
export const BAR_TOP_PAD = 2
export const DATE_LABEL_GAP = 5
export const DATE_LABEL_HEIGHT = 12
export const ROW_MIN = BAR_TOP_PAD + BAR_HEIGHT + DATE_LABEL_GAP + DATE_LABEL_HEIGHT
export const ROW_MAX = ROW_MIN
export const LEFT_PAD = 120
export const TOP_PAD = 48
export const RIGHT_PAD = 16
export const MIN_CHART_WIDTH = 600
export const LABEL_PAD = 8
export const FONT_SIZE = 14
export const FONT_FAMILY = 'Inter Variable, ui-sans-serif, system-ui, sans-serif'

export const SECTION_COLORS = [
  { fill: '#818cf8', stroke: '#6366f1' },
  { fill: '#a78bfa', stroke: '#8b5cf6' },
  { fill: '#67e8f9', stroke: '#22d3ee' },
  { fill: '#f0abfc', stroke: '#e879f9' },
] as const

export const CHANCE_COLORS = { fill: '#34d399', stroke: '#10b981' } as const

export type GanttLayoutInput = {
  rows: FlatGanttRow[]
  containerWidth: number
  containerHeight: number
}

export type WeekBand = {
  start: Date
  end: Date
  weekIndex: number
}

export type WeekendBand = {
  start: Date
  end: Date
}

export type MonthTick = {
  date: Date
  label: string
}

export type WeekTick = {
  date: Date
}

export type ChanceBand = {
  start: string
  end: string
  name: string
}

export type GanttLayout = {
  domainStart: Date
  domainEnd: Date
  totalDays: number
  chartWidth: number
  svgWidth: number
  svgHeight: number
  rowHeight: number
  rowCount: number
  xScale: (date: Date) => number
  xScaleFromIso: (iso: string) => number
  barWidth: (startIso: string, endIso: string) => number
  rowY: (index: number) => number
  weekBands: WeekBand[]
  weekendBands: WeekendBand[]
  monthTicks: MonthTick[]
  weekTicks: WeekTick[]
  chanceBands: ChanceBand[]
  todayX: number | null
  bodyBottom: number
}

function parseIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/** ISO 8601 week: Monday is the first day (getDay: 0=Sun … 6=Sat). */
function startOfIsoWeek(date: Date): Date {
  const d = startOfDay(date)
  const daysFromMonday = (d.getDay() + 6) % 7
  return addDays(d, -daysFromMonday)
}

function endOfIsoWeek(date: Date): Date {
  return addDays(startOfIsoWeek(date), 7)
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function daysBetween(a: Date, b: Date): number {
  const ms = startOfDay(b).getTime() - startOfDay(a).getTime()
  return ms / (1000 * 60 * 60 * 24)
}

export function computeLayout(input: GanttLayoutInput): GanttLayout | null {
  const { rows, containerWidth, containerHeight } = input
  if (rows.length === 0) return null

  let minStart = parseIso(rows[0].range.start)
  let maxEnd = parseIso(rows[0].range.end)

  for (const row of rows) {
    const start = parseIso(row.range.start)
    const end = parseIso(row.range.end)
    if (start < minStart) minStart = start
    if (end > maxEnd) maxEnd = end
  }

  const domainStart = startOfIsoWeek(addDays(minStart, -7))
  const domainEnd = endOfIsoWeek(addDays(maxEnd, 7))
  const totalDays = Math.max(1, daysBetween(domainStart, domainEnd))

  const rowCount = rows.length
  const rowHeight = ROW_MIN
  const bodyBottom = TOP_PAD + rowCount * rowHeight
  const svgHeight = Math.max(containerHeight, bodyBottom)

  const availableWidth = Math.max(containerWidth, MIN_CHART_WIDTH)
  const chartWidth = availableWidth - LEFT_PAD - RIGHT_PAD
  const svgWidth = LEFT_PAD + chartWidth + RIGHT_PAD

  const xScale = (date: Date): number => {
    const days = daysBetween(domainStart, date)
    return LEFT_PAD + (days / totalDays) * chartWidth
  }

  const xScaleFromIso = (iso: string): number => xScale(parseIso(iso))

  const barWidth = (startIso: string, endIso: string): number => {
    const start = xScaleFromIso(startIso)
    const end = xScaleFromIso(endIso)
    return Math.max(end - start, 2)
  }

  const rowY = (index: number): number => TOP_PAD + index * rowHeight

  const weekBands: WeekBand[] = []
  let weekStart = startOfIsoWeek(domainStart)
  let weekIndex = 0
  while (weekStart < domainEnd) {
    const weekEnd = addDays(weekStart, 7)
    weekBands.push({ start: weekStart, end: weekEnd, weekIndex })
    weekStart = weekEnd
    weekIndex++
  }

  const weekendBands: WeekendBand[] = []
  for (const week of weekBands) {
    const saturday = addDays(week.start, 5)
    const sundayEnd = addDays(week.start, 7)
    if (saturday < domainEnd && sundayEnd > domainStart) {
      weekendBands.push({ start: saturday, end: sundayEnd })
    }
  }

  const monthTicks: MonthTick[] = []
  let monthCursor = startOfMonth(domainStart)
  while (monthCursor <= domainEnd) {
    monthTicks.push({ date: monthCursor, label: formatMonthLabel(monthCursor) })
    monthCursor = startOfMonth(addDays(monthCursor, 32))
  }

  const weekTicks: WeekTick[] = []
  for (const week of weekBands) {
    weekTicks.push({ date: week.start })
  }

  const today = startOfDay(new Date())
  const todayX =
    today >= domainStart && today <= domainEnd ? xScale(today) : null

  const chanceBands: ChanceBand[] = rows
    .filter((row) => row.kind === 'chance')
    .map((row) => ({
      start: row.range.start,
      end: row.range.end,
      name: row.range.name,
    }))

  return {
    domainStart,
    domainEnd,
    totalDays,
    chartWidth,
    svgWidth,
    svgHeight,
    rowHeight,
    rowCount,
    xScale,
    xScaleFromIso,
    barWidth,
    rowY,
    weekBands,
    weekendBands,
    monthTicks,
    weekTicks,
    chanceBands,
    todayX,
    bodyBottom,
  }
}

export function barGeometry(
  layout: GanttLayout,
  rowIndex: number,
  startIso: string,
  endIso: string,
): { x: number; y: number; width: number; height: number; dateY: number } {
  const x = layout.xScaleFromIso(startIso)
  const width = layout.barWidth(startIso, endIso)
  const y = layout.rowY(rowIndex) + BAR_TOP_PAD
  const dateY = y + BAR_HEIGHT + DATE_LABEL_GAP
  return { x, y, width, height: BAR_HEIGHT, dateY }
}
