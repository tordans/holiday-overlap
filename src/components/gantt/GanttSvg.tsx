import { useMemo } from 'react'
import { flattenRows, rangeHighlightKey } from '../../lib/gantt-data'
import { computeLayout, FONT_FAMILY } from '../../lib/gantt-layout'
import type { GanttData } from '../../lib/gantt-types'
import { GanttChartOverlay } from './GanttColumnTooltip'
import { GanttGrid } from './GanttGrid'
import { GanttRow } from './GanttRow'
import { GanttWeekDayLines } from './GanttWeekDayLines'

type GanttSvgProps = {
  data: GanttData
  width: number
  height: number
  highlightedRangeKey?: string | null
}

export function GanttSvg({ data, width, height, highlightedRangeKey = null }: GanttSvgProps) {
  const rows = flattenRows(data)
  const layout = computeLayout({ rows, containerWidth: width, containerHeight: height })

  const chartRevision = useMemo(
    () =>
      rows
        .map((row) => `${row.section}:${row.range.id}:${row.range.start}:${row.range.end}`)
        .join('|'),
    [rows],
  )

  const highlightActive =
    highlightedRangeKey != null &&
    rows.some((row) => rangeHighlightKey(row.section, row.range.id) === highlightedRangeKey)

  if (!layout) {
    return (
      <svg width={width} height={height} className="gantt-svg">
        <text x={width / 2} y={height / 2} textAnchor="middle" className="gantt-empty-label">
          Keine Zeiträume vorhanden
        </text>
      </svg>
    )
  }

  return (
    <div
      key={chartRevision}
      className="relative shrink-0"
      style={{ width: layout.svgWidth, height: layout.svgHeight }}
    >
      <GanttChartOverlay layout={layout}>
        <GanttWeekDayLines layout={layout} />
      </GanttChartOverlay>

      <svg
        width={layout.svgWidth}
        height={layout.svgHeight}
        className="gantt-svg pointer-events-none absolute inset-0 z-10 block"
        style={{ fontFamily: FONT_FAMILY }}
      >
        <GanttGrid layout={layout} />
        {rows.map((row, index) => (
          <GanttRow
            key={rangeHighlightKey(row.section, row.range.id)}
            row={row}
            rowIndex={index}
            layout={layout}
            highlightActive={highlightActive}
            highlightedRangeKey={highlightedRangeKey}
          />
        ))}
      </svg>
    </div>
  )
}
