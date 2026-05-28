import { flattenRows } from '../../lib/gantt-data'
import { computeLayout, FONT_FAMILY } from '../../lib/gantt-layout'
import type { GanttData } from '../../lib/gantt-types'
import { GanttGrid } from './GanttGrid'
import { GanttRow } from './GanttRow'

type GanttSvgProps = {
  data: GanttData
  width: number
  height: number
}

export function GanttSvg({ data, width, height }: GanttSvgProps) {
  const rows = flattenRows(data)
  const layout = computeLayout({ rows, containerWidth: width, containerHeight: height })

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
    <svg
      width={layout.svgWidth}
      height={layout.svgHeight}
      className="gantt-svg"
      style={{ fontFamily: FONT_FAMILY }}
    >
      <GanttGrid layout={layout} />
      {rows.map((row, index) => (
        <GanttRow key={row.range.id} row={row} rowIndex={index} layout={layout} />
      ))}
    </svg>
  )
}
