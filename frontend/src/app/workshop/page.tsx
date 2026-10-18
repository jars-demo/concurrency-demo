import type { Metadata } from 'next'

import { ChapterList } from '@/components/ChapterList'
import { CHAPTERS } from '@/lib/workshop'

export const metadata: Metadata = { title: 'Chapters' }

export default function Workshop() {
  const minutes = CHAPTERS.reduce((sum, chapter) => sum + chapter.minutes, 0)
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 px-4 pt-14 pb-24">
      <header className="flex flex-col gap-4">
        <span className="label">
          Contents · {CHAPTERS.length} chapters · {minutes} minutes
        </span>
        <h1 className="text-[40px] leading-[1.05] font-semibold tracking-[-0.03em] sm:text-[52px]">
          The chapters
        </h1>
        <p className="max-w-2xl text-[17px] leading-relaxed text-ink-2">
          Work through them in order. Each one explains an idea, gives you a real bug that shows it,
          and ends with a check that runs your fix many times.
        </p>
      </header>
      <ChapterList />
    </div>
  )
}
