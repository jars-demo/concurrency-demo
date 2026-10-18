import { describe, expect, it } from 'vitest'

import { canStep, isBlocked, run, start, step, verdict } from '@/lib/interleave'

describe('the interleaving explorer', () => {
  it('counts both updates when one cook finishes before the other starts', () => {
    const state = run(false, 'AAABBB')

    expect(state.shared).toBe(2)
    expect(verdict(state)).toBe('correct')
  })

  it('loses an update when both cooks load before either stores', () => {
    const state = run(false, 'ABABAB')

    expect(state.shared).toBe(1)
    expect(verdict(state)).toBe('lost')
  })

  it('is still running until both cooks are done', () => {
    expect(verdict(run(false, 'AAAB'))).toBe('running')
  })

  it('blocks the other cook while one holds the lock', () => {
    const state = step(start(true), 'A')

    expect(isBlocked(state, 'B')).toBe(true)
    expect(canStep(state, 'B')).toBe(false)
    expect(step(state, 'B')).toBe(state)
  })

  it('cannot lose an update with the lock, whatever the schedule', () => {
    for (const schedule of ['ABABABABAB', 'AABBAABBAABB', 'BABABABABA', 'BBAABBAABBAA']) {
      expect(run(true, schedule).shared, schedule).toBe(2)
    }
  })

  it('lets the other cook run while the chosen one waits for the lock', () => {
    const state = run(true, 'ABABABABAB')

    expect(state.history.map((entry) => entry.cook).join('')).toBe('AAAAABBBBB')
    expect(verdict(state)).toBe('correct')
  })

  it('ignores steps for a cook that has finished', () => {
    const state = run(false, 'AAA')

    expect(step(state, 'A')).toBe(state)
  })
})
