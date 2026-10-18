import { useCallback, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/cn'
import { formatDateTooltip } from '../../lib/gantt-dates'
import { dateFromChartX, LEFT_PAD, type GanttLayout } from '../../lib/gantt-layout'
import { DateTooltipContent } from './DateTooltipContent'

type CursorTip = {
  clientX: number
  clientY: number
  lines: ReturnType<typeof formatDateTooltip>
}

type GanttChartOverlayProps = {
  layout: GanttLayout
  children: ReactNode
}

export function GanttChartOverlay({ layout, children }: GanttChartOverlayProps) {
  const chartAreaRef = useRef<HTMLDivElement>(null)
  const [tip, setTip] = useState<CursorTip | null>(null)

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const chartArea = chartAreaRef.current
      if (!chartArea) return

      const rect = chartArea.getBoundingClientRect()
      const chartX = LEFT_PAD + (event.clientX - rect.left)
      const date = dateFromChartX(layout, chartX)
      if (!date) {
        setTip(null)
        return
      }

      setTip({
        clientX: event.clientX,
        clientY: event.clientY,
        lines: formatDateTooltip(date),
      })
    },
    [layout],
  )

  const handleMouseLeave = useCallback(() => {
    setTip(null)
  }, [])

  return (
    <>
      <div className="pointer-events-none absolute inset-0">
        <div
          ref={chartAreaRef}
          className="pointer-events-auto absolute z-0 cursor-crosshair"
          style={{
            left: LEFT_PAD,
            width: layout.chartWidth,
            height: layout.svgHeight,
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          aria-hidden
        >
          {children}
        </div>
      </div>

      {tip && typeof document !== 'undefined'
        ? createPortal(
            <div
              className={cn(
                'pointer-events-none fixed z-50 max-w-xs -translate-y-1/2 rounded-lg border border-indigo-100',
                'bg-white px-3 py-2 text-xs text-slate-700 shadow-lg shadow-indigo-200/40',
                tip.clientX > window.innerWidth - 220
                  ? '-translate-x-[calc(100%+12px)]'
                  : 'translate-x-3',
              )}
              style={{
                left: tip.clientX,
                top: tip.clientY,
              }}
              role="tooltip"
            >
              <DateTooltipContent lines={tip.lines} />
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
