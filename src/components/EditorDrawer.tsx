import { useState } from 'react'

import { cn } from '../lib/cn'
import { formatShortDate } from '../lib/gantt-dates'
import { deleteRange, flattenRows, insertChance, insertRange } from '../lib/gantt-data'
import type { GanttData } from '../lib/gantt-types'

const inputClass =
  'w-full rounded-lg border border-indigo-100 bg-white px-2.5 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200/60 focus:outline-none'

type EditorDrawerProps = {
  open: boolean
  data: GanttData
  onDataChange: (data: GanttData) => void
  onClose: () => void
}

export function EditorDrawer({ open, data, onDataChange, onClose }: EditorDrawerProps) {
  const [section, setSection] = useState('')
  const [periodTitle, setPeriodTitle] = useState('')
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const [chanceTitle, setChanceTitle] = useState('')
  const [chanceStart, setChanceStart] = useState('')
  const [chanceEnd, setChanceEnd] = useState('')

  const rows = flattenRows(data)

  function handleAddPeriod(e: React.FormEvent) {
    e.preventDefault()
    if (!section.trim() || !periodTitle.trim() || !periodStart || !periodEnd) return
    onDataChange(insertRange(data, section, periodTitle, periodStart, periodEnd))
    setPeriodTitle('')
  }

  function handleAddChance(e: React.FormEvent) {
    e.preventDefault()
    if (!chanceTitle.trim() || !chanceStart || !chanceEnd) return
    onDataChange(insertChance(data, chanceTitle, chanceStart, chanceEnd))
    setChanceTitle('')
  }

  function handleDelete(sectionName: string, rangeId: string) {
    onDataChange(deleteRange(data, sectionName, rangeId))
  }

  return (
    <aside
      className={cn(
        'flex h-full shrink-0 overflow-hidden border-indigo-100/80 bg-white/95 backdrop-blur-xl transition-[width,border-color,box-shadow] duration-200 ease-in-out',
        open
          ? 'w-[min(100%,24rem)] border-r shadow-xl shadow-indigo-200/30'
          : 'pointer-events-none w-0 border-r-0 shadow-none',
      )}
      aria-hidden={!open}
    >
      <div className="flex h-full w-96 max-w-[100vw] flex-col">
        <div className="flex items-center justify-between border-b border-indigo-100/80 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-800">Editor</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-700"
            aria-label="Editor schließen"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-3">
            <h3 className="mb-2 text-xs font-semibold text-indigo-900">Zeiträume</h3>
            {rows.length === 0 ? (
              <p className="text-xs text-slate-500">Noch keine Zeiträume.</p>
            ) : (
              <ul className="space-y-1.5">
                {rows.map((row) => (
                  <li
                    key={`${row.section}-${row.range.id}`}
                    className="flex items-start gap-2 rounded-lg bg-white/80 px-2 py-1.5 text-xs text-slate-700"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="font-medium">{row.section}</span>
                      <span className="text-slate-400"> · </span>
                      {row.range.name}
                      <span className="block text-slate-500">
                        {formatShortDate(row.range.start)} – {formatShortDate(row.range.end)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(row.section, row.range.id)}
                      className="shrink-0 rounded-md px-1.5 py-0.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                      aria-label={`${row.range.name} löschen`}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <form
            onSubmit={handleAddPeriod}
            className="space-y-2 rounded-xl border border-indigo-100 bg-white p-3 shadow-sm shadow-indigo-100/30"
          >
            <h3 className="text-xs font-semibold text-indigo-900">Zeitraum hinzufügen</h3>
            <input
              placeholder="Section (z. B. Familie_A)"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className={inputClass}
            />
            <input
              placeholder="Name"
              value={periodTitle}
              onChange={(e) => setPeriodTitle(e.target.value)}
              className={inputClass}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className={inputClass}
              />
              <input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 py-2 text-sm font-medium text-white shadow-sm transition hover:from-indigo-600 hover:to-violet-600"
            >
              Einfügen
            </button>
          </form>

          <form
            onSubmit={handleAddChance}
            className="space-y-2 rounded-xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/80 to-teal-50/50 p-3"
          >
            <h3 className="text-xs font-semibold text-emerald-900">Chance markieren</h3>
            <input
              placeholder="Name"
              value={chanceTitle}
              onChange={(e) => setChanceTitle(e.target.value)}
              className={inputClass}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={chanceStart}
                onChange={(e) => setChanceStart(e.target.value)}
                className={inputClass}
              />
              <input
                type="date"
                value={chanceEnd}
                onChange={(e) => setChanceEnd(e.target.value)}
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2 text-sm font-medium text-white shadow-sm transition hover:from-emerald-600 hover:to-teal-600"
            >
              Chance einfügen
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
