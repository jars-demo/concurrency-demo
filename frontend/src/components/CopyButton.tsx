'use client'

import { useState } from 'react'

export function CopyButton({ text, tone = 'dark' }: { text: string; tone?: 'dark' | 'light' }) {
  const [state, setState] = useState<'idle' | 'copied' | 'blocked'>('idle')
  const look =
    tone === 'dark'
      ? 'border-[#2c3646] text-code-muted hover:border-[#475366] hover:text-code-ink'
      : 'border-rule-strong bg-surface text-ink-2 hover:border-ink hover:text-ink'
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setState('copied')
        } catch {
          setState('blocked')
        }
        window.setTimeout(() => setState('idle'), 1600)
      }}
      className={`h-6 rounded-[4px] border px-2 font-mono text-[11px] tracking-[0.04em] uppercase ${look}`}
    >
      <span aria-live="polite">
        {state === 'copied' ? 'Copied' : state === 'blocked' ? 'Select to copy' : 'Copy'}
      </span>
    </button>
  )
}
