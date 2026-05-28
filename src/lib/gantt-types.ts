import { z } from 'zod'

export const CHANCEN_SECTION = 'Chancen'

export type GanttRange = {
  id: string
  name: string
  start: string
  end: string
}

export type GanttSection = {
  name: string
  ranges: GanttRange[]
}

export type GanttData = {
  sections: GanttSection[]
}

export type GanttRowKind = 'period' | 'chance'

export type FlatGanttRow = {
  section: string
  range: GanttRange
  kind: GanttRowKind
  sectionIndex: number
  isFirstInSection: boolean
}

const ganttRangeSchema = z.object({
  id: z.string(),
  name: z.string(),
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

const ganttSectionSchema = z.object({
  name: z.string(),
  ranges: z.array(ganttRangeSchema),
})

export const ganttDataSchema = z.object({
  sections: z.array(ganttSectionSchema),
})
