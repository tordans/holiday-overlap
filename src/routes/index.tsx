import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { EditorDrawer } from '../components/EditorDrawer'
import { GanttChart } from '../components/GanttChart'
import { ShareButton } from '../components/ShareButton'
import { cn } from '../lib/cn'
import { DEFAULT_GANTT } from '../lib/constants'
import { searchSchema, type SearchParams } from '../lib/search-schema'
import { extractYearsFromGantt, formatYearRange } from '../lib/gantt-meta'
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
  const [source, setSource] = useState(() => decodeGantt(search.g))
  const [parseError, setParseError] = useState<string | undefined>()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initializedRef = useRef(false)

  const editorOpen = (search.editor ?? defaultEditorOpen()) === 'open'
  const yearLabel = useMemo(
    () => formatYearRange(extractYearsFromGantt(source)),
    [source],
  )

  useEffect(() => {
    if (!search.g && !initializedRef.current) {
      initializedRef.current = true
      void navigate({
        search: {
          g: encodeGantt(DEFAULT_GANTT),
          editor: search.editor ?? defaultEditorOpen(),
        },
        replace: true,
      })
    }
  }, [search.g, search.editor, navigate])

  useEffect(() => {
    if (search.g) {
      setSource(decodeGantt(search.g))
    }
  }, [search.g])

  const syncToUrl = useCallback(
    (nextSource: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        void navigate({
          search: (prev) => ({
            ...prev,
            g: encodeGantt(nextSource),
          }),
          replace: true,
        })
      }, 400)
    },
    [navigate],
  )

  function handleSourceChange(nextSource: string) {
    setSource(nextSource)
    syncToUrl(nextSource)
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

  const handleParseError = useCallback((error: string | undefined) => {
    setParseError(error)
  }, [])

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
          source={source}
          parseError={parseError}
          onSourceChange={handleSourceChange}
          onClose={() => setEditorOpen(false)}
        />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <GanttChart source={source} className="flex-1" onError={handleParseError} />
        </main>
      </div>
    </div>
  )
}
