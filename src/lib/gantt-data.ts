import { CHANCEN_SECTION, type FlatGanttRow, type GanttData, type GanttRange } from './gantt-types'

function computeRangeId(section: string, title: string): string {
  const raw = `${section}-${title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
  return raw.slice(0, 12) || 'task'
}

export function rangeHighlightKey(section: string, rangeId: string): string {
  return `${section}::${rangeId}`
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
  const id = computeRangeId(section, title)
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
  const id = computeRangeId(CHANCEN_SECTION, title)
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

export function deleteSection(data: GanttData, sectionName: string): GanttData {
  return {
    sections: data.sections.filter(
      (section) => section.name.toLowerCase() !== sectionName.toLowerCase(),
    ),
  }
}

export type RangeUpdate = {
  section?: string
  name?: string
  start?: string
  end?: string
}

export function updateRange(
  data: GanttData,
  fromSection: string,
  id: string,
  updates: RangeUpdate,
): GanttData | null {
  let existing: GanttRange | undefined

  const sectionsWithout = data.sections
    .map((section) => {
      if (section.name.toLowerCase() !== fromSection.toLowerCase()) return section
      const match = section.ranges.find((range) => range.id === id)
      if (!match) return section
      existing = match
      return {
        ...section,
        ranges: section.ranges.filter((range) => range.id !== id),
      }
    })
    .filter((section) => section.ranges.length > 0)

  if (!existing) return null

  const targetSection =
    updates.section?.trim() ||
    (fromSection.toLowerCase() === CHANCEN_SECTION.toLowerCase() ? CHANCEN_SECTION : fromSection)
  const name = updates.name?.trim() || existing.name
  const start = updates.start ?? existing.start
  const end = updates.end ?? existing.end

  if (!targetSection || !name || !start || !end || start > end) return null

  const isChance = targetSection.toLowerCase() === CHANCEN_SECTION.toLowerCase()
  const sectionForId = isChance ? CHANCEN_SECTION : targetSection
  const nextRange: GanttRange = {
    id: computeRangeId(sectionForId, name),
    name,
    start,
    end,
  }

  return insertRangeInSection({ sections: sectionsWithout }, sectionForId, nextRange)
}
