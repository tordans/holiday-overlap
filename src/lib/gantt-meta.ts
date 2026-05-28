const ISO_DATE = /\b(19|20)\d{2}-\d{2}-\d{2}\b/g

/** Remove Mermaid `title …` line so the chart has no title block. */
export function stripGanttTitle(source: string): string {
  return source
    .split('\n')
    .filter((line) => !/^\s*title\s+/i.test(line))
    .join('\n')
}

export function extractYearsFromGantt(source: string): number[] {
  const years = new Set<number>()
  for (const match of source.matchAll(ISO_DATE)) {
    const year = Number.parseInt(match[0].slice(0, 4), 10)
    if (!Number.isNaN(year)) years.add(year)
  }
  return [...years].sort((a, b) => a - b)
}

export function formatYearRange(years: number[]): string | null {
  if (years.length === 0) return null
  if (years.length === 1) return String(years[0])
  return `${years[0]}–${years[years.length - 1]}`
}

export function prepareGanttForRender(source: string): string {
  return stripGanttTitle(source)
}
