import { useEffect, useState } from 'react'

import { cn } from '../lib/cn'
import { renderGantt } from '../lib/mermaid'

type GanttChartProps = {
  source: string
  className?: string
  onError?: (error: string | undefined) => void
}

export function GanttChart({ source, className, onError }: GanttChartProps) {
  const [svg, setSvg] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    void renderGantt(source).then((result) => {
      if (cancelled) return
      setSvg(result.svg)
      setError(result.error)
      onError?.(result.error)
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [source, onError])

  if (loading && !svg) {
    return (
      <div className={cn('flex flex-1 items-center justify-center text-slate-400', className)}>
        Diagramm wird geladen…
      </div>
    )
  }

  if (error && !svg) {
    return (
      <div
        className={cn(
          'flex flex-1 items-center justify-center p-6 text-center text-sm text-red-700',
          className,
        )}
      >
        {error}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'gantt-chart h-full w-full min-h-0 min-w-0 flex-1 overflow-auto p-4',
        className,
      )}
    >
      <div className="mermaid inline-block shrink-0" dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  )
}
