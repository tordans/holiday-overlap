import {
  addCalendarDays,
  daysBetween,
  endOfIsoWeek,
  parseIsoDate,
  startOfCalendarMonth,
  startOfIsoWeek,
  today,
} from './dates'
import { formatMonthLabel } from './gantt-dates'
import type { FlatGanttRow } from './gantt-types'

const BAR_HEIGHT = 24
const BAR_TOP_PAD = 2
const DATE_LABEL_GAP = 5
const DATE_LABEL_HEIGHT = 12
const ROW_MIN = BAR_TOP_PAD + BAR_HEIGHT + DATE_LABEL_GAP + DATE_LABEL_HEIGHT
export const LEFT_PAD = 120
export const TOP_PAD = 48
export const RIGHT_PAD = 16
const MIN_WEEK_WIDTH = 40
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

type WeekBand = {
  start: Date
  end: Date
}

type WeekendBand = {
  start: Date
  end: Date
}

type MonthTick = {
  date: Date
  label: string
}

type WeekTick = {
  date: Date
}

type ChanceBand = {
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

export function computeLayout(input: GanttLayoutInput): GanttLayout | null {
  const { rows, containerWidth } = input
  const firstRow = rows[0]
  if (!firstRow) return null

  let minStart = parseIsoDate(firstRow.range.start)
  let maxEnd = parseIsoDate(firstRow.range.end)

  for (const row of rows) {
    const start = parseIsoDate(row.range.start)
    const end = parseIsoDate(row.range.end)
    if (start < minStart) minStart = start
    if (end > maxEnd) maxEnd = end
  }

  const domainStart = startOfIsoWeek(addCalendarDays(minStart, -7))
  const domainEnd = endOfIsoWeek(addCalendarDays(maxEnd, 7))
  const totalDays = Math.max(1, daysBetween(domainStart, domainEnd))

  const rowCount = rows.length
  const rowHeight = ROW_MIN
  const bodyBottom = TOP_PAD + rowCount * rowHeight
  const svgHeight = bodyBottom

  const weekBands: WeekBand[] = []
  let weekStart = startOfIsoWeek(domainStart)
  while (weekStart < domainEnd) {
    const weekEnd = addCalendarDays(weekStart, 7)
    weekBands.push({ start: weekStart, end: weekEnd })
    weekStart = weekEnd
  }

  const minChartWidth = LEFT_PAD + RIGHT_PAD + weekBands.length * MIN_WEEK_WIDTH
  const availableWidth = Math.max(containerWidth, minChartWidth)
  const chartWidth = availableWidth - LEFT_PAD - RIGHT_PAD
  const svgWidth = LEFT_PAD + chartWidth + RIGHT_PAD

  const xScale = (date: Date): number => {
    const days = daysBetween(domainStart, date)
    return LEFT_PAD + (days / totalDays) * chartWidth
  }

  const xScaleFromIso = (iso: string): number => xScale(parseIsoDate(iso))

  const barWidth = (startIso: string, endIso: string): number => {
    const start = xScaleFromIso(startIso)
    const end = xScaleFromIso(endIso)
    return Math.max(end - start, 2)
  }

  const rowY = (index: number): number => TOP_PAD + index * rowHeight

  const weekendBands: WeekendBand[] = []
  for (const week of weekBands) {
    const saturday = addCalendarDays(week.start, 5)
    const sundayEnd = addCalendarDays(week.start, 7)
    if (saturday < domainEnd && sundayEnd > domainStart) {
      weekendBands.push({ start: saturday, end: sundayEnd })
    }
  }

  const monthTicks: MonthTick[] = []
  let monthCursor = startOfCalendarMonth(domainStart)
  while (monthCursor <= domainEnd) {
    monthTicks.push({ date: monthCursor, label: formatMonthLabel(monthCursor) })
    monthCursor = startOfCalendarMonth(addCalendarDays(monthCursor, 32))
  }

  const weekTicks: WeekTick[] = []
  for (const week of weekBands) {
    weekTicks.push({ date: week.start })
  }

  const todayDate = today()
  const todayX = todayDate >= domainStart && todayDate <= domainEnd ? xScale(todayDate) : null

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

export function dateFromChartX(layout: GanttLayout, chartX: number): Date | null {
  if (chartX < LEFT_PAD || chartX > LEFT_PAD + layout.chartWidth) return null
  const dayOffset = Math.round(((chartX - LEFT_PAD) / layout.chartWidth) * layout.totalDays)
  const clamped = Math.max(0, Math.min(layout.totalDays, dayOffset))
  return addCalendarDays(layout.domainStart, clamped)
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
