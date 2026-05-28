import { useEffect, useRef, useState } from 'react'

import { cn } from '../lib/cn'
import type { GanttData } from '../lib/gantt-types'
import { GanttSvg } from './gantt/GanttSvg'

type GanttChartProps = {
  data: GanttData
  className?: string
}

export function GanttChart({ data, className }: GanttChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 800, height: 400 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      setSize({
        width: Math.max(width, 320),
        height: Math.max(height, 200),
      })
    })

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn(
        'gantt-chart h-full w-full min-h-0 min-w-0 flex-1 overflow-auto',
        className,
      )}
    >
      <GanttSvg data={data} width={size.width} height={size.height} />
    </div>
  )
}
