import { useState } from 'react'

import { cn } from '../lib/cn'

type ShareButtonProps = {
  className?: string
}

export function ShareButton({ className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className={cn(
        'rounded-xl border border-indigo-100 bg-white/80 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-200 hover:bg-white hover:text-indigo-700',
        className,
      )}
    >
      {copied ? 'Link kopiert' : 'Link kopieren'}
    </button>
  )
}
