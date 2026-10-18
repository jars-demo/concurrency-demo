import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { headingsOf, slugify } from '@/components/Markdown'
import { NOTE_SLUGS, notesFor } from '@/lib/otto'
import { CASES } from '@/lib/site'
import { CHAPTERS, findChapter } from '@/lib/workshop'

const ROOT = path.join(process.cwd(), '..')
const read = (file: string) => fs.readFileSync(path.join(ROOT, file), 'utf8')

describe('chapters', () => {
  it('has eight chapters numbered in order', () => {
    expect(CHAPTERS.map((chapter) => Number(chapter.number))).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it.each(CHAPTERS.map((chapter) => [chapter.slug, chapter] as const))(
    '%s has a summary, a time, the standard sections and its own case',
    (_slug, chapter) => {
      expect(chapter.summary.length).toBeGreaterThan(10)
      expect(chapter.minutes).toBeGreaterThan(0)
      expect(chapter.body).toMatch(/^## Goal$/m)
      expect(chapter.body).toMatch(/^## The case$/m)
      expect(chapter.body).toMatch(/^## Check it works$/m)
      expect(chapter.body).toMatch(/^## Exercise$/m)
      expect(chapter.body).toContain(`kitchen run ${Number(chapter.number)}`)
      expect(chapter.body).toContain(`kitchen check ${Number(chapter.number)}`)
    },
  )

  it('only mentions lab files that exist', () => {
    const mentioned = new Set(
      CHAPTERS.flatMap((chapter) =>
        [...chapter.body.matchAll(/`(lab\/[\w./-]+\.\w+)`/g)].map((m) => m[1] ?? ''),
      ),
    )
    expect(mentioned.size).toBeGreaterThan(5)
    for (const file of mentioned) {
      expect(fs.existsSync(path.join(ROOT, file)), `${file} is missing`).toBe(true)
    }
  })

  it('shows check output exactly as the checker words it', () => {
    const checks = read('lab/kitchen/checks.py')
    const labels = CHAPTERS.flatMap((chapter) =>
      [...chapter.body.matchAll(/^ {2}PASS {2}(.+)$/gm)].map((m) => m[1] ?? ''),
    )
    expect(labels.length).toBeGreaterThan(15)
    for (const label of labels) {
      // Labels with a measured time are f-strings in the checker; compare the fixed part.
      const fixed = label.replace(/ \((took|peak|\d+ free).*\)$/, '')
      expect(checks, label).toContain(fixed)
    }
  })

  it('quotes the case code as it is in the lab', () => {
    expect(findChapter('08-timeouts-and-cancellation')?.body).toContain(
      '    await asyncio.sleep(minutes / 100)',
    )
    expect(read('lab/cases/case08_cancellation.py')).toContain(
      '    await asyncio.sleep(minutes / 100)',
    )
    expect(read('lab/cases/case04_deadlock.py').split('\n')[21]).toContain('with self.board:')
    expect(read('lab/cases/case04_deadlock.py').split('\n')[28]).toContain('with self.knife:')
  })
})

describe('cases', () => {
  it('has one case per chapter, titled as the lab titles it', () => {
    const cli = read('lab/kitchen/__main__.py')
    expect(CASES.map((item) => item.number)).toEqual(CHAPTERS.map((chapter) => chapter.number))
    for (const item of CASES) {
      expect(cli).toContain(`"${item.title}"`)
    }
  })

  it('shows each symptom as it appears in its chapter', () => {
    for (const item of CASES) {
      const chapter = CHAPTERS.find((c) => c.number === item.number)
      expect(chapter?.body, item.number).toContain(item.symptom)
    }
  })

  it('links headings by a stable slug', () => {
    expect(slugify("Lock ordering, don't guess")).toBe('lock-ordering-dont-guess')
    expect(
      headingsOf('## Goal\n```\n## not a heading\n```\n## Check it works').map((h) => h.id),
    ).toEqual(['goal', 'check-it-works'])
  })
})

describe("Otto's notes", () => {
  it('has notes for every chapter and none for chapters that do not exist', () => {
    expect([...NOTE_SLUGS].sort()).toEqual(CHAPTERS.map((chapter) => chapter.slug))
  })

  it('picks the notes for the page you are on', () => {
    expect(notesFor('/workshop/04-deadlock').note).toContain('Nobody crashed')
    expect(notesFor('/workshop').questions.length).toBeGreaterThan(0)
    expect(notesFor('/')).toBe(notesFor('/no-such-page'))
  })
})
