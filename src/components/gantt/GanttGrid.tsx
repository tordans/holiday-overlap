import type { GanttLayout } from '../../lib/gantt-layout'
import { LEFT_PAD } from '../../lib/gantt-layout'

type GanttGridProps = {
  layout: GanttLayout
}

export function GanttGrid({ layout }: GanttGridProps) {
  const gridTop = 0
  const gridBottom = layout.svgHeight

  return (
    <g className="gantt-grid">
      {layout.weekBands.map((week) => {
        const x1 = layout.xScale(week.start)
        const x2 = layout.xScale(week.end)
        const width = x2 - x1
        const fill = week.weekIndex % 2 === 0 ? '#f8fafc' : '#eef2ff'
        return (
          <rect
            key={`week-${week.start.toISOString()}`}
            x={x1}
            y={gridTop}
            width={width}
            height={gridBottom - gridTop}
            fill={fill}
          />
        )
      })}

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
            fill="#e0e7ff"
            opacity={0.5}
          />
        )
      })}

      {layout.chanceBands.map((chance) => {
        const x1 = layout.xScaleFromIso(chance.start)
        const x2 = layout.xScaleFromIso(chance.end)
        const width = Math.max(x2 - x1, 2)
        return (
          <g key={`chance-${chance.start}-${chance.end}`}>
            <rect
              x={x1}
              y={gridTop}
              width={width}
              height={gridBottom - gridTop}
              className="gantt-chance-highlight"
            />
            <line
              x1={x1}
              y1={gridTop}
              x2={x1}
              y2={gridBottom}
              className="gantt-chance-border"
            />
            <line
              x1={x1 + width}
              y1={gridTop}
              x2={x1 + width}
              y2={gridBottom}
              className="gantt-chance-border"
            />
          </g>
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
        x2={layout.svgWidth - 16}
        y2={layout.bodyBottom}
        className="gantt-axis-baseline"
      />
    </g>
  )
}
