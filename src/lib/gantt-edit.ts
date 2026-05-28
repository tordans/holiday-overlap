import { CHANCEN_SECTION } from './constants'

function taskId(section: string, title: string): string {
  const raw = `${section}-${title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
  return raw.slice(0, 12) || 'task'
}

function insertLineInSection(source: string, sectionName: string, line: string): string {
  const section = sectionName.trim()
  const sectionHeader = `  section ${section}`
  const lines = source.split('\n')

  const sectionIndex = lines.findIndex(
    (l) => l.trim().toLowerCase() === `section ${section.toLowerCase()}`,
  )

  if (sectionIndex >= 0) {
    let insertAt = sectionIndex + 1
    while (insertAt < lines.length && !lines[insertAt]?.trim().startsWith('section ')) {
      insertAt++
    }
    lines.splice(insertAt, 0, line)
    return lines.join('\n')
  }

  const chancenIndex = lines.findIndex(
    (l) => l.trim().toLowerCase() === `section ${CHANCEN_SECTION.toLowerCase()}`,
  )
  const insertAt = chancenIndex >= 0 ? chancenIndex : lines.length
  lines.splice(insertAt, 0, sectionHeader, line)
  return lines.join('\n')
}

export function insertPeriod(
  source: string,
  sectionName: string,
  title: string,
  start: string,
  end: string,
): string {
  const section = sectionName.trim()
  const id = taskId(section, title)
  const line = `  ${title.trim()} :${id}, ${start}, ${end}`
  return insertLineInSection(source, section, line)
}

export function insertChance(source: string, title: string, start: string, end: string): string {
  const id = taskId(CHANCEN_SECTION, title)
  const line = `  ${title.trim()} :crit, ${id}, ${start}, ${end}`
  return insertLineInSection(source, CHANCEN_SECTION, line)
}
