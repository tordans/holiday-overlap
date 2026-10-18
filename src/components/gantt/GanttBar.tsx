import { cn } from '../../lib/cn'
import { formatBarLabel, formatShortDate } from '../../lib/gantt-dates'
import { computeLabelLayout } from '../../lib/gantt-labels'
import {
  barGeometry,
  CHANCE_COLORS,
  FONT_SIZE,
  SECTION_COLORS,
  type GanttLayout,
} from '../../lib/gantt-layout'
import type { FlatGanttRow } from '../../lib/gantt-types'

type GanttBarProps = {
  row: FlatGanttRow
  rowIndex: number
  layout: GanttLayout
  highlighted?: boolean
}

export function GanttBar({ row, rowIndex, layout, highlighted = false }: GanttBarProps) {
  const { x, y, width, height, dateY } = barGeometry(
    layout,
    rowIndex,
    row.range.start,
    row.range.end,
  )
  const colors =
    row.kind === 'chance'
      ? CHANCE_COLORS
      : (SECTION_COLORS[row.sectionIndex % SECTION_COLORS.length] ?? CHANCE_COLORS)

  const barLabel = formatBarLabel(row.range.name, row.range.start, row.range.end)
  const label = computeLabelLayout(barLabel, x, y, width, height, layout.svgWidth - 16)

  const startDateX = x
  const endDateX = x + width

  return (
    <g
      className={
        row.kind === 'chance'
          ? cn('gantt-bar gantt-bar-chance', highlighted && 'gantt-bar-highlighted')
          : cn('gantt-bar', highlighted && 'gantt-bar-highlighted')
      }
      pointerEvents="none"
    >
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={4}
        ry={4}
        fill={colors.fill}
        stroke={colors.stroke}
        strokeWidth={1}
        className="gantt-bar-rect"
      />
      <text
        x={label.x}
        y={label.y}
        fill={label.fill}
        textAnchor={label.textAnchor}
        dominantBaseline="middle"
        fontSize={FONT_SIZE}
        fontWeight={500}
        className={`gantt-bar-label gantt-bar-label-${label.placement}`}
      >
        {barLabel}
      </text>
      <text
        x={startDateX}
        y={dateY}
        className="gantt-date-label"
        textAnchor="start"
        dominantBaseline="hanging"
      >
        {formatShortDate(row.range.start)}
      </text>
      <text
        x={endDateX}
        y={dateY}
        className="gantt-date-label"
        textAnchor="end"
        dominantBaseline="hanging"
      >
        {formatShortDate(row.range.end)}
      </text>
    </g>
  )
}
