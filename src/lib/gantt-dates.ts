function parseIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function daysBetween(a: Date, b: Date): number {
  const ms = startOfDay(b).getTime() - startOfDay(a).getTime()
  return ms / (1000 * 60 * 60 * 24)
}

export function formatShortDate(iso: string): string {
  const date = parseIso(iso)
  const weekday = new Intl.DateTimeFormat('de-DE', { weekday: 'short' })
    .format(date)
    .replace(/\.$/, '')
  const day = date.getDate()
  const month = date.getMonth() + 1
  return `${weekday} ${day}.${month}.`
}

export function formatMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat('de-DE', { month: 'short' })
    .format(date)
    .replace(/\.$/, '')
}

export function rangeDayCount(startIso: string, endIso: string): number {
  return Math.max(1, Math.round(daysBetween(parseIso(startIso), parseIso(endIso))) + 1)
}

export function formatBarLabel(name: string, startIso: string, endIso: string): string {
  return `${name} (${rangeDayCount(startIso, endIso)})`
}
