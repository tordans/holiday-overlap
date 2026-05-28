import { useState } from 'react'

import { cn } from '../lib/cn'
import { insertChance, insertPeriod } from '../lib/gantt-edit'

const inputClass =
  'w-full rounded-lg border border-indigo-100 bg-white px-2.5 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200/60 focus:outline-none'

type EditorDrawerProps = {
  open: boolean
  source: string
  parseError?: string
  onSourceChange: (source: string) => void
  onClose: () => void
}

export function EditorDrawer({
  open,
  source,
  parseError,
  onSourceChange,
  onClose,
}: EditorDrawerProps) {
  const [section, setSection] = useState('')
  const [periodTitle, setPeriodTitle] = useState('')
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const [chanceTitle, setChanceTitle] = useState('')
  const [chanceStart, setChanceStart] = useState('')
  const [chanceEnd, setChanceEnd] = useState('')

  function handleAddPeriod(e: React.FormEvent) {
    e.preventDefault()
    if (!section.trim() || !periodTitle.trim() || !periodStart || !periodEnd) return
    onSourceChange(insertPeriod(source, section, periodTitle, periodStart, periodEnd))
    setPeriodTitle('')
  }

  function handleAddChance(e: React.FormEvent) {
    e.preventDefault()
    if (!chanceTitle.trim() || !chanceStart || !chanceEnd) return
    onSourceChange(insertChance(source, chanceTitle, chanceStart, chanceEnd))
    setChanceTitle('')
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
          <h2 className="text-sm font-semibold text-slate-800">Mermaid-Editor</h2>
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
          <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-slate-600">
            Gantt-Quelltext
            <textarea
              value={source}
              onChange={(e) => onSourceChange(e.target.value)}
              spellCheck={false}
              className="min-h-[12rem] flex-1 resize-y rounded-xl border border-indigo-100 bg-indigo-50/30 p-3 font-mono text-xs leading-relaxed text-slate-800 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200/60 focus:outline-none"
            />
          </label>

          {parseError ? (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-800">{parseError}</p>
          ) : null}

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
