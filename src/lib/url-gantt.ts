import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'

import { DEFAULT_GANTT } from './constants'
import { stripGanttTitle } from './gantt-meta'

export function normalizeGanttSource(text: string): string {
  const trimmed = text.trim()
  if (!trimmed) return DEFAULT_GANTT
  const firstLine = trimmed.split('\n')[0]?.trim().toLowerCase()
  const withGantt = firstLine === 'gantt' ? trimmed : `gantt\n${trimmed}`
  return stripGanttTitle(withGantt)
}

export function encodeGantt(text: string): string {
  return compressToEncodedURIComponent(normalizeGanttSource(text))
}

export function decodeGantt(encoded: string | undefined): string {
  if (!encoded) return DEFAULT_GANTT
  try {
    const decoded = decompressFromEncodedURIComponent(encoded)
    if (!decoded) return DEFAULT_GANTT
    return normalizeGanttSource(decoded)
  } catch {
    return DEFAULT_GANTT
  }
}
