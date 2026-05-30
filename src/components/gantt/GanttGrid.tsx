import type { GanttLayout } from '../../lib/gantt-layout'
import { LEFT_PAD, RIGHT_PAD } from '../../lib/gantt-layout'

type GanttGridProps = {
  layout: GanttLayout
}

export function GanttGrid({ layout }: GanttGridProps) {
  const gridTop = 0
  const gridBottom = layout.svgHeight
  const chartX = LEFT_PAD
  const chartWidth = layout.chartWidth

  return (
    <g className="gantt-grid">
      <rect
        x={chartX}
        y={gridTop}
        width={chartWidth}
        height={gridBottom - gridTop}
        className="gantt-bg-weekday"
      />

      {layout.weekendBands.map((weekend) => {
        const x1 = layout.xScale(weekend.start)
        const x2 = layout.xScale(weekend.end)
        const width = x2 - x1
        return (
          <rect
            key={`weekend-${weekend.start.toISOString()}`}
            x={x1}
            y={gridTop}
            width={width}
            height={gridBottom - gridTop}
            className="gantt-bg-weekend"
          />
        )
      })}

      {layout.chanceBands.map((chance) => {
        const x1 = layout.xScaleFromIso(chance.start)
        const x2 = layout.xScaleFromIso(chance.end)
        const width = Math.max(x2 - x1, 2)
        return (
          <rect
            key={`chance-${chance.start}-${chance.end}`}
            x={x1}
            y={gridTop}
            width={width}
            height={gridBottom - gridTop}
            className="gantt-chance-highlight"
          />
        )
      })}

      {layout.weekTicks.map((tick) => (
        <line
          key={`week-tick-${tick.date.toISOString()}`}
          x1={layout.xScale(tick.date)}
          y1={gridTop}
          x2={layout.xScale(tick.date)}
          y2={gridBottom}
          className="gantt-week-line"
        />
      ))}

      {layout.monthTicks.map((tick) => (
        <g key={`month-${tick.date.toISOString()}`}>
          <line
            x1={layout.xScale(tick.date)}
            y1={gridTop}
            x2={layout.xScale(tick.date)}
            y2={gridBottom}
            className="gantt-month-line"
          />
          <text
            x={layout.xScale(tick.date) + 4}
            y={20}
            className="gantt-axis-label"
            textAnchor="start"
          >
            {tick.label}
          </text>
        </g>
      ))}

      {layout.todayX !== null ? (
        <line
          x1={layout.todayX}
          y1={gridTop}
          x2={layout.todayX}
          y2={gridBottom}
          className="gantt-today-line"
        />
      ) : null}

      <line
        x1={LEFT_PAD}
        y1={layout.bodyBottom}
        x2={layout.svgWidth - RIGHT_PAD}
        y2={layout.bodyBottom}
        className="gantt-axis-baseline"
      />
    </g>
  )
}
