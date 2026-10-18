import Link from 'next/link'

import { CASES } from '@/lib/site'
import { CHAPTERS } from '@/lib/workshop'

// The table of contents: one row per chapter, with its case and what it covers.

export function ChapterList() {
  return (
    <ol className="panel divide-y divide-rule overflow-hidden">
      {CHAPTERS.map((chapter) => {
        const item = CASES.find((c) => c.number === chapter.number)
        return (
          <li key={chapter.slug}>
            <Link
              href={`/workshop/${chapter.slug}`}
              className="group grid grid-cols-[2.5rem_1fr] gap-x-4 gap-y-1 px-4 py-4 hover:bg-surface-2 sm:grid-cols-[3rem_1fr_13rem_4rem] sm:items-center sm:px-5"
            >
              <span className="font-mono text-[15px] font-medium text-muted group-hover:text-blue">
                {chapter.number}
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[16px] font-semibold text-ink">{chapter.title}</span>
                <span className="text-[14px] text-ink-2">{item?.title}</span>
              </span>
              <span className="col-start-2 font-mono text-[12px] text-muted sm:col-start-auto">
                {item?.topics}
              </span>
              <span className="col-start-2 font-mono text-[12px] text-muted sm:col-start-auto sm:text-right">
                {chapter.minutes} min
              </span>
            </Link>
          </li>
        )
      })}
    </ol>
  )
}
