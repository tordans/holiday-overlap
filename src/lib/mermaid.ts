import mermaid from 'mermaid'

import { prepareGanttForRender } from './gantt-meta'
import { MERMAID_THEME_VARIABLES } from './mermaid-theme'

let initialized = false

function ensureInitialized() {
  if (initialized) return
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    theme: 'base',
    themeVariables: { ...MERMAID_THEME_VARIABLES },
    gantt: {
      titleTopMargin: 0,
      numberSectionStyles: 4,
      barHeight: 24,
      fontSize: 14,
      sectionFontSize: 14,
    },
  })
  initialized = true
}

let renderCounter = 0

export async function renderGantt(
  source: string,
): Promise<{ svg: string; error?: string }> {
  ensureInitialized()
  const id = `gantt-${++renderCounter}`
  try {
    const { svg } = await mermaid.render(id, prepareGanttForRender(source))
    return { svg }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { svg: '', error: message }
  }
}
