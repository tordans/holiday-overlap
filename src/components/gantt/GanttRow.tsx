import { cn } from '../../lib/cn'
import { rangeHighlightKey } from '../../lib/gantt-data'
import { LEFT_PAD, type GanttLayout } from '../../lib/gantt-layout'
import type { FlatGanttRow } from '../../lib/gantt-types'
import { GanttBar } from './GanttBar'

type GanttRowProps = {
  row: FlatGanttRow
  rowIndex: number
  layout: GanttLayout
  highlightActive?: boolean
  highlightedRangeKey?: string | null
}

export function GanttRow({
  row,
  rowIndex,
  layout,
  highlightActive = false,
  highlightedRangeKey = null,
}: GanttRowProps) {
  const y = layout.rowY(rowIndex)
  const rowHeight = layout.rowHeight
  const rowKey = rangeHighlightKey(row.section, row.range.id)
  const isHighlighted = highlightActive && highlightedRangeKey === rowKey
  const isDimmed = highlightActive && !isHighlighted

  return (
    <g
      className={cn('gantt-row', isHighlighted && 'gantt-row-highlighted', isDimmed && 'gantt-row-dimmed')}
      pointerEvents="none"
    >
      {isHighlighted ? (
        <rect
          x={LEFT_PAD}
          y={y}
          width={layout.chartWidth}
          height={rowHeight}
          rx={6}
          className="gantt-row-highlight-bg"
        />
      ) : null}
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

      <GanttBar row={row} rowIndex={rowIndex} layout={layout} highlighted={isHighlighted} />
    </g>
  )
}
