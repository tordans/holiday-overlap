import { addCalendarDays } from '../../lib/dates'
import { LEFT_PAD, TOP_PAD, type GanttLayout } from '../../lib/gantt-layout'

const DAYS_PER_WEEK = 7

type GanttWeekDayLinesProps = {
  layout: GanttLayout
}

export function GanttWeekDayLines({ layout }: GanttWeekDayLinesProps) {
  const linesTop = TOP_PAD
  const linesHeight = layout.bodyBottom - TOP_PAD

  return (
    <>
      {layout.weekBands.map((week) => {
        const weekLeft = layout.xScale(week.start)
        const weekWidth = layout.xScale(week.end) - weekLeft
        const overlayLeft = weekLeft - LEFT_PAD

        return (
          <div
            key={week.start.toISOString()}
            className="group absolute"
            style={{
              left: overlayLeft,
              top: linesTop,
              width: weekWidth,
              height: linesHeight,
            }}
          >
            {Array.from({ length: DAYS_PER_WEEK }, (_, dayIndex) => {
              const day = addCalendarDays(week.start, dayIndex)
              const dayLeft = layout.xScale(day) - weekLeft

              return (
                <div
                  key={dayIndex}
                  className="pointer-events-none absolute top-0 border-l border-dotted border-slate-300/35 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                  style={{
                    left: dayLeft,
                    height: linesHeight,
                  }}
                />
              )
            })}
          </div>
        )
      })}
    </>
  )
}
