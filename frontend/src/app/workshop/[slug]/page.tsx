import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { CopyButton } from '@/components/CopyButton'
import { headingsOf, Markdown } from '@/components/Markdown'
import { CASES } from '@/lib/site'
import { type Chapter, CHAPTERS, findChapter } from '@/lib/workshop'

export function generateStaticParams() {
  return CHAPTERS.map((chapter) => ({ slug: chapter.slug }))
}

export async function generateMetadata(props: PageProps<'/workshop/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params
  const chapter = findChapter(slug)
  return { title: chapter ? `${chapter.number}. ${chapter.title}` : 'Chapter' }
}

function Contents({ current }: { current: Chapter }) {
  return (
    <ol className="flex flex-col">
      {CHAPTERS.map((chapter) => {
        const here = chapter.slug === current.slug
        return (
          <li key={chapter.slug}>
            <Link
              href={`/workshop/${chapter.slug}`}
              aria-current={here ? 'page' : undefined}
              className={`flex gap-3 border-l-2 py-1.5 pl-3 text-[14px] leading-snug ${
                here
                  ? 'border-blue font-medium text-ink'
                  : 'border-rule text-ink-2 hover:border-rule-strong hover:text-ink'
              }`}
            >
              <span className="font-mono text-[12px] leading-5 text-muted">{chapter.number}</span>
              {chapter.title}
            </Link>
          </li>
        )
      })}
    </ol>
  )
}

export default async function ChapterPage(props: PageProps<'/workshop/[slug]'>) {
  const { slug } = await props.params
  const chapter = findChapter(slug)
  if (!chapter) notFound()
  const index = CHAPTERS.indexOf(chapter)
  const previous = CHAPTERS[index - 1]
  const next = CHAPTERS[index + 1]
  const item = CASES.find((c) => c.number === chapter.number)
  const headings = headingsOf(chapter.body)
  const n = Number(chapter.number)
  const commands = `uv run python -m kitchen run ${n}\nuv run python -m kitchen check ${n}\nuv run python -m kitchen hint ${n}`

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-10 pb-24 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-14">
      <aside className="hidden lg:block">
        <div className="sticky top-20 flex flex-col gap-8">
          <nav aria-label="Chapters" className="flex flex-col gap-3">
            <span className="label">Chapters</span>
            <Contents current={chapter} />
          </nav>
          {headings.length ? (
            <nav aria-label="On this page" className="flex flex-col gap-2">
              <span className="label">On this page</span>
              <ul className="flex flex-col gap-1.5 text-[13.5px]">
                {headings.map((heading) => (
                  <li key={heading.id}>
                    <a href={`#${heading.id}`} className="text-muted hover:text-ink">
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>
      </aside>

      <article className="min-w-0 max-w-3xl">
        <details className="panel mb-8 lg:hidden">
          <summary className="cursor-pointer px-4 py-3 text-[14px] font-medium">
            All chapters
          </summary>
          <div className="border-t border-rule px-4 py-3">
            <Contents current={chapter} />
          </div>
        </details>

        <header className="flex flex-col gap-4">
          <span className="label">
            Chapter {chapter.number} · {chapter.minutes} minutes
          </span>
          <h1 className="text-[36px] leading-[1.08] font-semibold tracking-[-0.025em] text-balance sm:text-[48px]">
            {chapter.title}
          </h1>
          <p className="text-[17.5px] leading-relaxed text-ink-2">{chapter.summary}</p>
          {item ? (
            <div className="panel mt-2 flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:gap-5">
              <div className="flex min-w-0 flex-col gap-0.5 sm:w-56 sm:shrink-0">
                <span className="label">Case {chapter.number}</span>
                <span className="text-[14.5px] font-medium text-ink">{item.title}</span>
              </div>
              <pre className="min-w-0 flex-1 overflow-x-auto rounded-[6px] bg-red-wash px-3 py-2 font-mono text-[13px] leading-relaxed text-red">
                {item.symptom}
              </pre>
            </div>
          ) : null}
        </header>

        <div className="prose-manual">
          <Markdown>{chapter.body}</Markdown>
        </div>

        <section aria-labelledby="commands" className="code mt-14 overflow-hidden rounded-[8px]">
          <div className="flex items-center justify-between border-b border-[#232c39] px-4 py-2.5">
            <h2
              id="commands"
              className="font-mono text-[11.5px] tracking-[0.04em] text-code-muted uppercase"
            >
              Chapter {chapter.number} · commands, from lab/
            </h2>
            <CopyButton text={commands} />
          </div>
          <pre className="overflow-x-auto px-4 py-4 text-[13px] leading-relaxed">{commands}</pre>
        </section>

        <nav aria-label="Previous and next" className="mt-8 grid gap-3 sm:grid-cols-2">
          {previous ? (
            <Link
              href={`/workshop/${previous.slug}`}
              className="panel flex flex-col gap-1 p-4 hover:border-rule-strong"
            >
              <span className="label">Previous</span>
              <span className="font-medium">
                {previous.number}. {previous.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/workshop/${next.slug}`}
              className="panel flex flex-col gap-1 p-4 text-right hover:border-rule-strong"
            >
              <span className="label">Next</span>
              <span className="font-medium">
                {next.number}. {next.title}
              </span>
            </Link>
          ) : (
            <Link
              href="/#explorer"
              className="panel flex flex-col gap-1 p-4 text-right hover:border-rule-strong"
            >
              <span className="label">All eight fixed</span>
              <span className="font-medium">Back to the explorer</span>
            </Link>
          )}
        </nav>
      </article>
    </div>
  )
}
