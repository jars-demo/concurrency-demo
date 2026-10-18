'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useId, useState } from 'react'

import { notesFor } from '@/lib/otto'

import { BackToTop } from './BackToTop'
import { Otto } from './Otto'

// Otto, in the corner of every page: a short note for the page you are on and a few questions
// with answers. Opens with the button, closes with the button, the cross or Escape.

export function Companion() {
  const pathname = usePathname()
  const notes = notesFor(pathname)
  const [open, setOpen] = useState(false)
  const [asked, setAsked] = useState<number | null>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex flex-col items-end gap-3">
      {open ? (
        <section
          id={panelId}
          aria-label="Otto's station notes"
          className="panel flex max-h-[min(34rem,calc(100dvh-7rem))] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden"
          style={{ boxShadow: 'var(--shadow-panel)' }}
        >
          <header className="flex items-center gap-3 border-b border-rule px-4 py-3">
            <Otto face className="size-9 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold text-ink">Otto</p>
              <p className="label !text-[10.5px]">Line cook · station notes</p>
            </div>
            <button
              type="button"
              aria-label="Close Otto's notes"
              onClick={() => setOpen(false)}
              className="grid size-8 place-items-center rounded-[6px] text-muted hover:bg-surface-2 hover:text-ink"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                <path
                  d="M3 3l8 8M11 3l-8 8"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </header>
          <div className="overflow-y-auto px-4 py-4">
            <p className="text-[14.5px] leading-relaxed text-ink">{notes.note}</p>
            <ul className="mt-4 flex flex-col border-t border-rule">
              {notes.questions.map((item, index) => {
                const expanded = asked === index
                return (
                  <li key={item.q} className="border-b border-rule">
                    <button
                      type="button"
                      aria-expanded={expanded}
                      onClick={() => setAsked(expanded ? null : index)}
                      className="flex w-full items-start justify-between gap-3 py-2.5 text-left text-[14px] font-medium text-ink hover:text-blue"
                    >
                      {item.q}
                      <span aria-hidden="true" className="mt-0.5 font-mono text-[13px] text-muted">
                        {expanded ? '−' : '+'}
                      </span>
                    </button>
                    {expanded ? (
                      <p className="pb-3 text-[14px] leading-relaxed text-ink-2">{item.a}</p>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      ) : null}
      <div className="flex items-center gap-2">
        <BackToTop />
        <button
          type="button"
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          onClick={() => setOpen(!open)}
          className="panel inline-flex h-12 items-center gap-2 pr-4 pl-1.5 text-[14px] font-semibold text-ink hover:border-rule-strong"
          style={{ boxShadow: 'var(--shadow-panel)' }}
        >
          <Otto face className="size-9" />
          {open ? 'Close' : 'Ask Otto'}
        </button>
      </div>
    </div>
  )
}
