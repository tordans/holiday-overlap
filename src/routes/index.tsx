import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { EditorDrawer } from '../components/EditorDrawer'
import { GanttChart } from '../components/GanttChart'
import { ShareButton } from '../components/ShareButton'
import { cn } from '../lib/cn'
import { DEFAULT_GANTT_DATA } from '../lib/constants'
import { extractYears, flattenRows, formatYearRange, rangeHighlightKey } from '../lib/gantt-data'
import type { GanttData } from '../lib/gantt-types'
import { searchSchema, type SearchParams } from '../lib/search-schema'
import { decodeGantt, encodeGantt } from '../lib/url-gantt'

export const Route = createFileRoute('/')({
  validateSearch: searchSchema,
  component: HomePage,
})

function defaultEditorOpen(): SearchParams['editor'] {
  if (typeof window === 'undefined') return 'open'
  return window.matchMedia('(min-width: 1024px)').matches ? 'open' : 'closed'
}

function HomePage() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: '/' })
  const [data, setData] = useState<GanttData>(() => decodeGantt(search.g))
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingEncodedRef = useRef<string | null>(null)
  const initializedRef = useRef(false)

  const editorOpen = (search.editor ?? defaultEditorOpen()) === 'open'
  const [highlightedRangeKey, setHighlightedRangeKey] = useState<string | null>(null)
  const yearLabel = useMemo(() => formatYearRange(extractYears(data)), [data])

  useEffect(() => {
    if (!search.g && !initializedRef.current) {
      initializedRef.current = true
      void navigate({
        search: {
          g: encodeGantt(DEFAULT_GANTT_DATA),
          editor: search.editor ?? defaultEditorOpen(),
        },
        replace: true,
      })
    }
  }, [search.g, search.editor, navigate])

  useEffect(() => {
    if (!search.g) return

    if (pendingEncodedRef.current !== null) {
      if (search.g === pendingEncodedRef.current) {
        pendingEncodedRef.current = null
      }
      return
    }

    setData(decodeGantt(search.g))
  }, [search.g])

  // Adjust state during render (React docs: "storing information from previous renders")
  // instead of syncing it in an effect.
  const [prevEditorOpen, setPrevEditorOpen] = useState(editorOpen)
  if (prevEditorOpen !== editorOpen) {
    setPrevEditorOpen(editorOpen)
    if (!editorOpen) setHighlightedRangeKey(null)
  }

  if (highlightedRangeKey !== null) {
    const exists = flattenRows(data).some(
      (row) => rangeHighlightKey(row.section, row.range.id) === highlightedRangeKey,
    )
    if (!exists) setHighlightedRangeKey(null)
  }

  function handleDataChange(nextData: GanttData) {
    const encoded = encodeGantt(nextData)
    pendingEncodedRef.current = encoded
    setData(nextData)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      void navigate({
        search: (prev) => ({
          ...prev,
          g: encoded,
        }),
        replace: true,
      })
    }, 400)
  }

  function setEditorOpen(open: boolean) {
    void navigate({
      search: (prev) => ({
        ...prev,
        editor: open ? 'open' : 'closed',
      }),
      replace: true,
    })
  }

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-indigo-100/80 bg-white/70 px-4 py-3 shadow-sm shadow-indigo-100/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setEditorOpen(!editorOpen)}
            className={cn(
              'rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-md transition',
              editorOpen
                ? 'bg-gradient-to-r from-violet-500 to-indigo-500 ring-2 ring-violet-400/50 ring-offset-2 ring-offset-white hover:from-violet-600 hover:to-indigo-600'
                : 'bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600',
            )}
          >
            {editorOpen ? 'Editor ausblenden' : 'Editor öffnen'}
          </button>
          <h1 className="hidden text-sm font-semibold text-slate-800 sm:block">
            Ferien & Home Exchange
            {yearLabel ? (
              <span className="ml-2 font-normal text-slate-500">{yearLabel}</span>
            ) : null}
          </h1>
          {yearLabel ? (
            <span className="text-sm font-semibold text-slate-800 sm:hidden">{yearLabel}</span>
          ) : null}
        </div>
        <ShareButton />
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <EditorDrawer
          open={editorOpen}
          data={data}
          onDataChange={handleDataChange}
          onClose={() => setEditorOpen(false)}
          highlightedRangeKey={highlightedRangeKey}
          onHighlightRangeKey={setHighlightedRangeKey}
        />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <GanttChart data={data} highlightedRangeKey={highlightedRangeKey} className="flex-1" />
        </main>
      </div>
    </div>
  )
}
