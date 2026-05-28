import type { GanttLayout } from '../../lib/gantt-layout'
import type { FlatGanttRow } from '../../lib/gantt-types'
import { GanttBar } from './GanttBar'

type GanttRowProps = {
  row: FlatGanttRow
  rowIndex: number
  layout: GanttLayout
}

export function GanttRow({ row, rowIndex, layout }: GanttRowProps) {
  const y = layout.rowY(rowIndex)
  const rowHeight = layout.rowHeight

  return (
    <g className="gantt-row">
      {row.isFirstInSection ? (
        <text
          x={8}
          y={y + rowHeight / 2}
          className="gantt-section-label"
          dominantBaseline="middle"
        >
          {row.section}
        </text>
      ) : null}

      <GanttBar row={row} rowIndex={rowIndex} layout={layout} />
    </g>
  )
}
