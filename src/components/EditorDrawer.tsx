import { useState } from 'react'
import { cn } from '../lib/cn'
import {
  deleteRange,
  deleteSection,
  extractYears,
  insertChance,
  insertRange,
  rangeHighlightKey,
} from '../lib/gantt-data'
import type { GanttData } from '../lib/gantt-types'
import { applyPeriodsToGantt } from '../lib/holidays/apply-periods'
import {
  BUNDESLAENDER,
  DEFAULT_BUNDESLAND_CODE,
  bundeslandByCode,
} from '../lib/holidays/bundeslaender'
import { fetchSchoolAndPublicHolidays } from '../lib/holidays/fetch-periods'
import { ZeitraeumeSectionGroup } from './ZeitraeumeSectionGroup'

const inputClass =
  'w-full rounded-lg border border-indigo-100 bg-white px-2.5 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200/60 focus:outline-none'

type EditorDrawerProps = {
  open: boolean
  data: GanttData
  onDataChange: (data: GanttData) => void
  onClose: () => void
  highlightedRangeKey: string | null
  onHighlightRangeKey: (key: string | null) => void
}

export function EditorDrawer({
  open,
  data,
  onDataChange,
  onClose,
  highlightedRangeKey,
  onHighlightRangeKey,
}: EditorDrawerProps) {
  const [section, setSection] = useState('')
  const [periodTitle, setPeriodTitle] = useState('')
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const [chanceTitle, setChanceTitle] = useState('')
  const [chanceStart, setChanceStart] = useState('')
  const [chanceEnd, setChanceEnd] = useState('')

  const defaultYear = () => {
    const years = extractYears(data)
    return years.at(-1) ?? new Date().getFullYear()
  }

  const [bundeslandCode, setBundeslandCode] = useState(DEFAULT_BUNDESLAND_CODE)
  const [holidayYear, setHolidayYear] = useState(() => defaultYear())
  const [includePublicHolidays, setIncludePublicHolidays] = useState(false)
  const [replaceExisting, setReplaceExisting] = useState(true)
  const [holidayLoading, setHolidayLoading] = useState(false)
  const [holidayError, setHolidayError] = useState<string | null>(null)

  const sectionNames = data.sections.map((s) => s.name)

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
    const key = rangeHighlightKey(sectionName, rangeId)
    if (highlightedRangeKey === key) {
      onHighlightRangeKey(null)
    }
    onDataChange(deleteRange(data, sectionName, rangeId))
  }

  function handleDeleteSection(sectionName: string, rangeCount: number) {
    if (rangeCount > 1) {
      const confirmed = window.confirm(
        `Gruppe „${sectionName}“ mit ${rangeCount} Zeiträumen wirklich löschen?`,
      )
      if (!confirmed) return
    }

    const sectionKeys = data.sections
      .find((s) => s.name.toLowerCase() === sectionName.toLowerCase())
      ?.ranges.map((r) => rangeHighlightKey(sectionName, r.id))

    if (sectionKeys?.some((key) => key === highlightedRangeKey)) {
      onHighlightRangeKey(null)
    }

    onDataChange(deleteSection(data, sectionName))
  }

  async function handleLoadHolidays(e: React.FormEvent) {
    e.preventDefault()
    const targetSection = section.trim()
    if (!targetSection) return

    const land = bundeslandByCode(bundeslandCode)
    if (!land) return

    setHolidayLoading(true)
    setHolidayError(null)

    try {
      const periods = await fetchSchoolAndPublicHolidays(
        land.slug,
        holidayYear,
        includePublicHolidays,
      )
      if (periods.length === 0) {
        setHolidayError('Keine Ferien für dieses Jahr gefunden.')
        return
      }
      onDataChange(
        applyPeriodsToGantt(data, targetSection, periods, {
          replace: replaceExisting,
          year: holidayYear,
        }),
      )
    } catch {
      setHolidayError('Ferien konnten nicht geladen werden. Bitte später erneut versuchen.')
    } finally {
      setHolidayLoading(false)
    }
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
            {data.sections.length === 0 ? (
              <p className="text-xs text-slate-500">Noch keine Zeiträume.</p>
            ) : (
              <div className="space-y-2">
                {data.sections.map((section, sectionIndex) => (
                  <ZeitraeumeSectionGroup
                    key={section.name}
                    section={section}
                    sectionIndex={sectionIndex}
                    data={data}
                    sectionNames={sectionNames}
                    highlightedRangeKey={highlightedRangeKey}
                    onDataChange={onDataChange}
                    onHighlightRangeKey={onHighlightRangeKey}
                    onDeleteRange={handleDelete}
                    onDeleteSection={handleDeleteSection}
                  />
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={handleLoadHolidays}
            className="space-y-2 rounded-xl border border-violet-200/80 bg-gradient-to-br from-violet-50/80 to-indigo-50/50 p-3"
          >
            <h3 className="text-xs font-semibold text-violet-900">Ferien aus API laden</h3>
            <input
              placeholder="Section (z. B. Familie_A)"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className={inputClass}
            />
            <select
              value={bundeslandCode}
              onChange={(e) => setBundeslandCode(e.target.value)}
              className={inputClass}
            >
              {BUNDESLAENDER.map((land) => (
                <option key={land.code} value={land.code}>
                  {land.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={2020}
              max={2035}
              value={holidayYear}
              onChange={(e) => setHolidayYear(Number.parseInt(e.target.value, 10) || defaultYear())}
              className={inputClass}
              aria-label="Jahr"
            />
            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={includePublicHolidays}
                onChange={(e) => setIncludePublicHolidays(e.target.checked)}
                className="rounded border-indigo-200 text-indigo-600 focus:ring-indigo-300"
              />
              Gesetzliche Feiertage mit laden
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={replaceExisting}
                onChange={(e) => setReplaceExisting(e.target.checked)}
                className="rounded border-indigo-200 text-indigo-600 focus:ring-indigo-300"
              />
              Bestehende Zeiträume in dieser Sektion ersetzen
            </label>
            {holidayError ? (
              <p className="text-xs text-rose-600" role="alert">
                {holidayError}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={holidayLoading || !section.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 py-2 text-sm font-medium text-white shadow-sm transition hover:from-violet-600 hover:to-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {holidayLoading ? 'Lädt…' : 'Ferien laden'}
            </button>
            <p className="text-[10px] text-slate-500">
              Daten:{' '}
              <a
                href="https://www.mehr-schulferien.de"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 underline hover:text-indigo-800"
              >
                mehr-schulferien.de
              </a>
            </p>
          </form>

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
