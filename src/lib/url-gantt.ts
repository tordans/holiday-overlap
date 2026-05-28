import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'

import { DEFAULT_GANTT_DATA } from './constants'
import { ganttDataSchema, type GanttData } from './gantt-types'

export function encodeGantt(data: GanttData): string {
  return compressToEncodedURIComponent(JSON.stringify(data))
}

export function decodeGantt(encoded: string | undefined): GanttData {
  if (!encoded) return DEFAULT_GANTT_DATA
  try {
    const decoded = decompressFromEncodedURIComponent(encoded)
    if (!decoded) return DEFAULT_GANTT_DATA
    const parsed = JSON.parse(decoded) as unknown
    const result = ganttDataSchema.safeParse(parsed)
    if (!result.success) return DEFAULT_GANTT_DATA
    return result.data
  } catch {
    return DEFAULT_GANTT_DATA
  }
}
