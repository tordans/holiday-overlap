import { CHANCEN_SECTION, type FlatGanttRow, type GanttData } from './gantt-types'

function rangeId(section: string, title: string): string {
  const raw = `${section}-${title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
  return raw.slice(0, 12) || 'task'
}

export function flattenRows(data: GanttData): FlatGanttRow[] {
  const rows: FlatGanttRow[] = []
  data.sections.forEach((section, sectionIndex) => {
    const kind = section.name === CHANCEN_SECTION ? 'chance' : 'period'
    section.ranges.forEach((range, rangeIndex) => {
      rows.push({
        section: section.name,
        range,
        kind,
        sectionIndex,
        isFirstInSection: rangeIndex === 0,
      })
    })
  })
  return rows
}

export function extractYears(data: GanttData): number[] {
  const years = new Set<number>()
  for (const section of data.sections) {
    for (const range of section.ranges) {
      for (const date of [range.start, range.end]) {
        const year = Number.parseInt(date.slice(0, 4), 10)
        if (!Number.isNaN(year)) years.add(year)
      }
    }
  }
  return [...years].sort((a, b) => a - b)
}

export function formatYearRange(years: number[]): string | null {
  if (years.length === 0) return null
  if (years.length === 1) return String(years[0])
  return `${years[0]}–${years[years.length - 1]}`
}

function insertRangeInSection(
  data: GanttData,
  sectionName: string,
  range: { id: string; name: string; start: string; end: string },
): GanttData {
  const name = sectionName.trim()
  const sections = data.sections.map((s) => ({ ...s, ranges: [...s.ranges] }))
  const existing = sections.find((s) => s.name.toLowerCase() === name.toLowerCase())

  if (existing) {
    existing.ranges.push(range)
    return { sections }
  }

  const chancenIndex = sections.findIndex(
    (s) => s.name.toLowerCase() === CHANCEN_SECTION.toLowerCase(),
  )
  const newSection = { name, ranges: [range] }
  if (chancenIndex >= 0) {
    sections.splice(chancenIndex, 0, newSection)
  } else {
    sections.push(newSection)
  }
  return { sections }
}

export function insertRange(
  data: GanttData,
  sectionName: string,
  title: string,
  start: string,
  end: string,
): GanttData {
  const section = sectionName.trim()
  const id = rangeId(section, title)
  return insertRangeInSection(data, section, {
    id,
    name: title.trim(),
    start,
    end,
  })
}

export function insertChance(
  data: GanttData,
  title: string,
  start: string,
  end: string,
): GanttData {
  const id = rangeId(CHANCEN_SECTION, title)
  return insertRangeInSection(data, CHANCEN_SECTION, {
    id,
    name: title.trim(),
    start,
    end,
  })
}

export function deleteRange(data: GanttData, sectionName: string, id: string): GanttData {
  return {
    sections: data.sections
      .map((section) =>
        section.name.toLowerCase() === sectionName.toLowerCase()
          ? { ...section, ranges: section.ranges.filter((range) => range.id !== id) }
          : section,
      )
      .filter((section) => section.ranges.length > 0),
  }
}
