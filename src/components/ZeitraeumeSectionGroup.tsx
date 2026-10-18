import { cn } from '../lib/cn'
import {
  CHANCEN_SECTION,
  type FlatGanttRow,
  type GanttData,
  type GanttSection,
} from '../lib/gantt-types'
import { TrashIcon } from './icons/TrashIcon'
import { RangeListItem } from './RangeListItem'

type ZeitraeumeSectionGroupProps = {
  section: GanttSection
  sectionIndex: number
  data: GanttData
  sectionNames: string[]
  highlightedRangeKey: string | null
  onDataChange: (data: GanttData) => void
  onHighlightRangeKey: (key: string | null) => void
  onDeleteRange: (sectionName: string, rangeId: string) => void
  onDeleteSection: (sectionName: string, rangeCount: number) => void
}

export function ZeitraeumeSectionGroup({
  section,
  sectionIndex,
  data,
  sectionNames,
  highlightedRangeKey,
  onDataChange,
  onHighlightRangeKey,
  onDeleteRange,
  onDeleteSection,
}: ZeitraeumeSectionGroupProps) {
  const kind = section.name.toLowerCase() === CHANCEN_SECTION.toLowerCase() ? 'chance' : 'period'

  const rows: FlatGanttRow[] = section.ranges.map((range, rangeIndex) => ({
    section: section.name,
    range,
    kind,
    sectionIndex,
    isFirstInSection: rangeIndex === 0,
  }))

  return (
    <section
      className={cn(
        'rounded-lg border border-indigo-100/90 bg-white/70 p-2 shadow-sm shadow-indigo-100/20',
        kind === 'chance' && 'border-emerald-200/80 bg-emerald-50/30',
      )}
    >
      <div className="mb-1.5 flex items-center justify-between gap-2 border-b border-indigo-100/70 pb-1.5">
        <h4
          className={cn(
            'min-w-0 truncate text-xs font-semibold',
            kind === 'chance' ? 'text-emerald-900' : 'text-indigo-900',
          )}
        >
          Zeiträume {section.name}
        </h4>
        <button
          type="button"
          onClick={() => onDeleteSection(section.name, section.ranges.length)}
          className="shrink-0 rounded-md p-1 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
          aria-label={`Gruppe ${section.name} löschen`}
        >
          <TrashIcon />
        </button>
      </div>

      <ul className="space-y-1.5">
        {rows.map((row) => (
          <RangeListItem
            key={`${row.section}::${row.range.id}`}
            row={row}
            data={data}
            grouped
            sectionNames={sectionNames}
            highlightedRangeKey={highlightedRangeKey}
            onDataChange={onDataChange}
            onHighlightRangeKey={onHighlightRangeKey}
            onDelete={() => onDeleteRange(row.section, row.range.id)}
          />
        ))}
      </ul>
    </section>
  )
}
