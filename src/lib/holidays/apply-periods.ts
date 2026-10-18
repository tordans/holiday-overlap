import { insertRange } from '../gantt-data'
import type { GanttData } from '../gantt-types'
import type { HolidayPeriod } from './fetch-periods'

function rangeOverlapsYear(start: string, end: string, year: number): boolean {
  const startYear = Number.parseInt(start.slice(0, 4), 10)
  const endYear = Number.parseInt(end.slice(0, 4), 10)
  return startYear <= year && endYear >= year
}

function removeSectionRangesForYear(data: GanttData, sectionName: string, year: number): GanttData {
  const target = sectionName.trim().toLowerCase()
  return {
    sections: data.sections
      .map((section) => {
        if (section.name.toLowerCase() !== target) return section
        return {
          ...section,
          ranges: section.ranges.filter(
            (range) => !rangeOverlapsYear(range.start, range.end, year),
          ),
        }
      })
      .filter((section) => section.ranges.length > 0),
  }
}

function periodExists(data: GanttData, sectionName: string, period: HolidayPeriod): boolean {
  const target = sectionName.trim().toLowerCase()
  const section = data.sections.find((s) => s.name.toLowerCase() === target)
  if (!section) return false
  return section.ranges.some(
    (range) =>
      range.name === period.title && range.start === period.start && range.end === period.end,
  )
}

export function applyPeriodsToGantt(
  data: GanttData,
  sectionName: string,
  periods: HolidayPeriod[],
  options: { replace: boolean; year: number },
): GanttData {
  let next = options.replace ? removeSectionRangesForYear(data, sectionName, options.year) : data

  for (const period of periods) {
    if (!options.replace && periodExists(next, sectionName, period)) continue
    next = insertRange(next, sectionName, period.title, period.start, period.end)
  }

  return next
}
