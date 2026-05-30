import type { DateTooltipLines } from '../../lib/gantt-dates'

type DateTooltipContentProps = {
  lines: DateTooltipLines
}

export function DateTooltipContent({ lines }: DateTooltipContentProps) {
  return (
    <div className="space-y-0.5 leading-snug">
      <p className="font-medium text-slate-800">{lines.shortDate}</p>
      <p className="text-slate-600">{lines.monthYear}</p>
      <p className="text-slate-500 capitalize">{lines.relative}</p>
    </div>
  )
}
