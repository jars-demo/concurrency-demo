'use client'

import { useState } from 'react'

import {
  canStep,
  COOKS,
  type Cook,
  isBlocked,
  isFinished,
  LINES,
  program,
  run,
  start,
  step,
  verdict,
} from '@/lib/interleave'

// Two cooks, one shared tally, and you as the scheduler. Pick who runs the next step.

const TONE: Record<Cook, { chip: string; block: string; button: string }> = {
  A: {
    chip: 'bg-blue',
    block: 'bg-blue text-surface',
    button: 'bg-blue text-surface hover:bg-[#1a43b3]',
  },
  B: {
    chip: 'bg-amber-fill',
    block: 'bg-amber-fill text-ink',
    button: 'bg-amber-fill text-ink hover:bg-[#dc9614]',
  },
}

const PRESETS = [
  { label: 'A, then B', schedule: 'AAAAABBBBB' },
  { label: 'Interleave', schedule: 'ABABABABAB' },
]

function Icon({ ok }: { ok: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className="shrink-0">
      <circle cx="8" cy="8" r="7.25" fill="currentColor" />
      <path
        d={ok ? 'M4.8 8.3l2.1 2.1 4.3-4.6' : 'M5.5 5.5l5 5M10.5 5.5l-5 5'}
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Explorer() {
  const [state, setState] = useState(() => start(false))
  const ops = program(state.withLock)
  const result = verdict(state)

  return (
    <div className="panel overflow-hidden" style={{ boxShadow: 'var(--shadow-panel)' }}>
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule bg-surface-2 px-4 py-3">
        <label className="inline-flex cursor-pointer items-center gap-2.5 text-[14px] font-medium">
          <input
            type="checkbox"
            checked={state.withLock}
            onChange={(event) => setState(start(event.target.checked))}
            className="size-4 accent-[var(--blue)]"
          />
          Use a lock
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setState(run(state.withLock, preset.schedule))}
              className="h-8 rounded-[6px] border border-rule-strong bg-surface px-3 text-[13px] font-medium text-ink-2 hover:border-ink hover:text-ink"
            >
              {preset.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setState(start(state.withLock))}
            className="h-8 rounded-[6px] px-3 text-[13px] font-medium text-muted hover:text-ink"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Shared memory */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rule px-4 py-4">
        <div className="flex items-baseline gap-3">
          <span className="label">Shared</span>
          <span className="font-mono text-[15px]">
            plated ={' '}
            <span data-testid="shared" className="text-[22px] font-semibold">
              {state.shared}
            </span>
          </span>
        </div>
        {state.withLock ? (
          <span className="font-mono text-[13px] text-ink-2">
            lock: {state.lock ? `held by cook ${state.lock}` : 'free'}
          </span>
        ) : (
          <span className="font-mono text-[13px] text-muted">no lock</span>
        )}
      </div>

      {/* The two cooks */}
      <div className="grid grid-cols-2 divide-x divide-rule">
        {COOKS.map((cook) => {
          const blocked = isBlocked(state, cook)
          const finished = isFinished(state, cook)
          return (
            <section
              key={cook}
              aria-label={`Cook ${cook}`}
              className="flex min-w-0 flex-col gap-3 p-3 sm:p-4"
            >
              <h3 className="flex items-center gap-2 text-[14px] font-semibold">
                <span className={`size-2.5 rounded-[2px] ${TONE[cook].chip}`} aria-hidden="true" />
                Cook {cook}
              </h3>
              <ol className="flex flex-col gap-0.5 font-mono text-[11.5px] sm:text-[12.5px]">
                {ops.map((op, index) => {
                  const done = index < state.pc[cook]
                  const current = index === state.pc[cook]
                  return (
                    <li
                      key={op}
                      aria-current={current ? 'step' : undefined}
                      className={`truncate rounded-[4px] border-l-2 px-2 py-1 ${
                        current
                          ? 'border-ink bg-surface-2 text-ink'
                          : done
                            ? 'border-transparent text-muted line-through decoration-rule-strong'
                            : 'border-transparent text-ink-2'
                      }`}
                    >
                      {LINES[op]}
                    </li>
                  )
                })}
              </ol>
              <p className="font-mono text-[12.5px] text-ink-2">
                local = <span className="font-semibold text-ink">{state.local[cook]}</span>
              </p>
              <button
                type="button"
                disabled={!canStep(state, cook)}
                onClick={() => setState(step(state, cook))}
                className={`mt-auto h-9 rounded-[6px] text-[13.5px] font-semibold transition-colors disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-muted ${TONE[cook].button}`}
              >
                {finished ? 'Done' : blocked ? 'Waiting for the lock' : `Step cook ${cook}`}
              </button>
            </section>
          )
        })}
      </div>

      {/* Timeline of what ran, in order */}
      <div className="border-t border-rule px-4 py-3">
        <span className="label">Order of steps</span>
        <div className="mt-2 flex flex-col gap-1.5 overflow-x-auto pb-1">
          {COOKS.map((cook) => (
            <div key={cook} className="flex h-6 gap-1" aria-hidden="true">
              {state.history.map((entry, index) => (
                <span
                  key={index}
                  className={`grid w-12 shrink-0 place-items-center rounded-[3px] font-mono text-[10.5px] ${
                    entry.cook === cook ? TONE[cook].block : 'bg-transparent'
                  }`}
                >
                  {entry.cook === cook ? entry.op : ''}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <p
        role="status"
        className={`flex items-center gap-2 border-t px-4 py-3 text-[14px] font-medium ${
          result === 'lost'
            ? 'border-red/20 bg-red-wash text-red'
            : result === 'correct'
              ? 'border-green/20 bg-green-wash text-green'
              : 'border-rule text-ink-2'
        }`}
      >
        {result === 'running' ? (
          'Step the cooks in any order. Can you make plated end at 1?'
        ) : result === 'lost' ? (
          <>
            <Icon ok={false} />
            plated = {state.shared}, expected 2. One update was lost.
          </>
        ) : (
          <>
            <Icon ok />
            plated = 2. Both updates counted.
          </>
        )}
      </p>
    </div>
  )
}
