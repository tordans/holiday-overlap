import { useEffect, useState } from 'react'

import { cn } from '../lib/cn'
import {
  flattenRows,
  rangeHighlightKey,
  updateRange,
  type RangeUpdate,
} from '../lib/gantt-data'
import { CHANCEN_SECTION, type FlatGanttRow, type GanttData } from '../lib/gantt-types'
import { TrashIcon } from './icons/TrashIcon'

const compactInputClass =
  'w-full rounded-md border border-indigo-100 bg-white px-2 py-1 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200/60 focus:outline-none'

type RangeListItemProps = {
  row: FlatGanttRow
  data: GanttData
  grouped?: boolean
  sectionNames?: string[]
  highlightedRangeKey: string | null
  onDataChange: (data: GanttData) => void
  onHighlightRangeKey: (key: string | null) => void
  onDelete: () => void
}

export function RangeListItem({
  row,
  data,
  grouped = false,
  sectionNames = [],
  highlightedRangeKey,
  onDataChange,
  onHighlightRangeKey,
  onDelete,
}: RangeListItemProps) {
  const isChance = row.kind === 'chance'
  const listKey = rangeHighlightKey(row.section, row.range.id)
  const isHighlighted = highlightedRangeKey === listKey

  const [section, setSection] = useState(row.section)
  const [name, setName] = useState(row.range.name)
  const [start, setStart] = useState(row.range.start)
  const [end, setEnd] = useState(row.range.end)

  useEffect(() => {
    setSection(row.section)
    setName(row.range.name)
    setStart(row.range.start)
    setEnd(row.range.end)
  }, [row.section, row.range.id, row.range.name, row.range.start, row.range.end])

  function commit() {
    const updates: RangeUpdate = {
      section: isChance ? CHANCEN_SECTION : section,
      name,
      start,
      end,
    }

    if (
      updates.section === row.section &&
      updates.name === row.range.name &&
      updates.start === row.range.start &&
      updates.end === row.range.end
    ) {
      return
    }

    const next = updateRange(data, row.section, row.range.id, updates)
    if (!next) {
      setSection(row.section)
      setName(row.range.name)
      setStart(row.range.start)
      setEnd(row.range.end)
      return
    }

    if (highlightedRangeKey === listKey) {
      const match = flattenRows(next).find(
        (r) => r.range.name === name && r.range.start === start && r.range.end === end,
      )
      if (match) {
        onHighlightRangeKey(rangeHighlightKey(match.section, match.range.id))
      }
    }

    onDataChange(next)
  }

  function handleBlur(event: React.FocusEvent<HTMLLIElement>) {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
    commit()
  }

  function handleSectionSelect(nextSection: string) {
    setSection(nextSection)
    if (!grouped || isChance || nextSection === row.section) return

    const updates: RangeUpdate = {
      section: nextSection,
      name,
      start,
      end,
    }
    const next = updateRange(data, row.section, row.range.id, updates)
    if (!next) return

    if (highlightedRangeKey === listKey) {
      const match = flattenRows(next).find(
        (r) =>
          r.section === nextSection &&
          r.range.name === name &&
          r.range.start === start &&
          r.range.end === end,
      )
      if (match) {
        onHighlightRangeKey(rangeHighlightKey(match.section, match.range.id))
      }
    }

    onDataChange(next)
  }

  return (
    <li
      className={cn(
        'rounded-lg border px-2 py-2 transition-colors',
        isHighlighted
          ? 'border-indigo-300 bg-indigo-50/90 ring-2 ring-indigo-300/60'
          : 'border-transparent bg-white/80 hover:border-indigo-200 hover:bg-indigo-50/50',
      )}
      onMouseEnter={() => onHighlightRangeKey(listKey)}
      onMouseLeave={() => onHighlightRangeKey(null)}
      onBlur={handleBlur}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1 space-y-1.5">
          {grouped && !isChance ? (
            <select
              value={section}
              onChange={(e) => handleSectionSelect(e.target.value)}
              aria-label="Gruppe"
              className={compactInputClass}
            >
              {sectionNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          ) : grouped ? null : (
            <input
              value={isChance ? CHANCEN_SECTION : section}
              onChange={(e) => setSection(e.target.value)}
              disabled={isChance}
              placeholder="Gruppe"
              aria-label="Gruppe"
              className={cn(compactInputClass, isChance && 'cursor-not-allowed bg-slate-50 text-slate-500')}
            />
          )}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Bezeichnung"
            aria-label="Bezeichnung"
            className={compactInputClass}
          />
          <div className="grid grid-cols-2 gap-1.5">
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              aria-label="Start"
              className={compactInputClass}
            />
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              aria-label="Ende"
              className={compactInputClass}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="shrink-0 rounded-md p-1 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
          aria-label={`${row.range.name} löschen`}
        >
          <TrashIcon />
        </button>
      </div>
    </li>
  )
}
