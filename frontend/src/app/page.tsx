import Link from 'next/link'

import { ChapterList } from '@/components/ChapterList'
import { CopyButton } from '@/components/CopyButton'
import { Explorer } from '@/components/Explorer'
import { Lanes } from '@/components/Lanes'
import { Otto } from '@/components/Otto'
import { CASE_TWO, CHECKLIST, MEASURED, QUICKSTART, REPO_URL } from '@/lib/site'
import { CHAPTERS } from '@/lib/workshop'

function SectionHead({
  index,
  name,
  title,
  children,
}: {
  index: string
  name: string
  title: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex max-w-2xl flex-col gap-3">
      <span className="label">
        {index} · {name}
      </span>
      <h2 className="text-[30px] leading-[1.1] font-semibold tracking-[-0.02em] sm:text-[36px]">
        {title}
      </h2>
      {children ? <p className="text-[16.5px] leading-relaxed text-ink-2">{children}</p> : null}
    </div>
  )
}

export default function Home() {
  const minutes = CHAPTERS.reduce((sum, chapter) => sum + chapter.minutes, 0)
  const hours = Math.round((minutes / 60) * 2) / 2

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-24 px-4 pt-12 pb-24 sm:pt-20">
      {/* Hero */}
      <section className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
        <div className="flex min-w-0 flex-col gap-6">
          <span className="label">
            Workshop · {CHAPTERS.length} chapters · about {hours} hours · Python 3.13
          </span>
          <h1 className="text-[42px] leading-[1.04] font-semibold tracking-[-0.03em] text-balance sm:text-[60px]">
            Concurrency, from first principles.
          </h1>
          <p className="max-w-xl text-[18px] leading-relaxed text-ink-2">
            Threads, the GIL, race conditions, locks, deadlock, queues, the event loop, limits and
            cancellation. Each chapter explains one idea in depth, then hands you a real bug in a
            busy kitchen to fix. <strong className="font-semibold text-ink">Otto</strong>, the
            octopus line cook, checks your work.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/workshop/${CHAPTERS[0]?.slug ?? ''}`}
              className="inline-flex h-11 items-center rounded-[6px] bg-ink px-5 text-[15px] font-medium text-surface hover:bg-ink-2"
            >
              Start chapter 01
            </Link>
            <a
              href={REPO_URL}
              className="inline-flex h-11 items-center rounded-[6px] border border-rule-strong bg-surface px-5 text-[15px] font-medium hover:border-ink"
            >
              Read the source
            </a>
          </div>
          <dl className="grid max-w-xl grid-cols-3 gap-4 border-t border-rule pt-5">
            {[
              ['8', 'real bugs to fix'],
              ['0', 'packages to install'],
              [`${hours} h`, 'start to finish'],
            ].map(([value, text]) => (
              <div key={text} className="flex flex-col gap-0.5">
                <dt className="sr-only">{text}</dt>
                <dd className="font-mono text-[22px] font-semibold">{value}</dd>
                <dd className="text-[13px] text-muted">{text}</dd>
              </div>
            ))}
          </dl>
        </div>
        <Lanes />
      </section>

      {/* Contents */}
      <section id="contents" className="flex scroll-mt-20 flex-col gap-8">
        <SectionHead index="01" name="Contents" title="Eight chapters, eight bugs.">
          Read the idea, run the case, watch it break, fix it, and let the checker run it many
          times. Every symptom below is real output from the lab.
        </SectionHead>
        <ChapterList />
      </section>

      {/* Explorer */}
      <section
        id="explorer"
        className="grid scroll-mt-20 gap-10 lg:grid-cols-[1fr_1.35fr] [&>*]:min-w-0"
      >
        <div className="flex flex-col gap-6">
          <SectionHead index="02" name="Explorer" title="Lose an update yourself.">
            Two cooks each run <code className="font-mono text-[0.9em] text-ink">plated += 1</code>,
            which Python runs as three steps. You are the scheduler: choose who goes next. Then turn
            on the lock and try to break it again.
          </SectionHead>
          <div className="flex items-start gap-4 border-l-2 border-blue pl-4">
            <Otto face className="size-12 shrink-0" />
            <p className="text-[14.5px] leading-relaxed text-ink-2">
              Try <span className="font-medium text-ink">A, B, A, B, A, B</span>: both cooks load 0
              before either one stores. That is chapter 02 in six clicks.
            </p>
          </div>
        </div>
        <Explorer />
      </section>

      {/* How a chapter works */}
      <section className="flex flex-col gap-8">
        <SectionHead index="03" name="Method" title="Run it. Fix it. Check it many times." />
        <ol className="grid gap-4 md:grid-cols-3">
          <li className="panel flex min-w-0 flex-col gap-3 p-5">
            <span className="label">Step 1 · run</span>
            <p className="text-[15px] text-ink-2">Watch the bug happen on your own machine.</p>
            <div className="code mt-auto rounded-[6px] p-4 text-[12.5px] leading-[1.7]">
              <p className="text-code-muted">$ kitchen run 2</p>
              {CASE_TWO.run.map((line) => (
                <p key={line} className="whitespace-pre">
                  {line}
                </p>
              ))}
            </div>
          </li>
          <li className="panel flex min-w-0 flex-col gap-3 p-5">
            <span className="label">Step 2 · fix</span>
            <p className="text-[15px] text-ink-2">
              Change the case file in <code className="font-mono text-[0.9em]">lab/cases/</code>.
              The chapter explains the idea; the fix is yours to write.
            </p>
            <div className="code mt-auto rounded-[6px] p-4 text-[12.5px] leading-[1.7]">
              <p>
                <span className="text-[#8fb0ff]">with</span> self.lock:
              </p>
              <p className="pl-4">
                <span className="text-[#8fb0ff]">if</span> self.stock &gt; 0:
              </p>
              <p className="pl-8 text-code-muted">...</p>
            </div>
          </li>
          <li className="panel flex min-w-0 flex-col gap-3 p-5">
            <span className="label">Step 3 · check</span>
            <p className="text-[15px] text-ink-2">
              The checker runs the case many times. A race has to lose every time.
            </p>
            <div className="code mt-auto overflow-x-auto rounded-[6px] p-4 text-[12.5px] leading-[1.7]">
              <p className="text-code-muted">$ kitchen check 2</p>
              {CASE_TWO.check.map((line) => (
                <p key={line} className="-indent-[6ch] pl-[6ch] whitespace-pre-wrap">
                  <span className="text-[#7ee2a0]">{line.slice(0, 4)}</span>
                  {line.slice(4)}
                </p>
              ))}
            </div>
          </li>
        </ol>
      </section>

      {/* Measured */}
      <section className="flex flex-col gap-8">
        <SectionHead index="04" name="Measured" title="GIL on, GIL off.">
          The same code on Python 3.13 and on the free-threaded Python 3.14, on one laptop (
          {MEASURED.machine}). You run both in chapters 01 and 02.
        </SectionHead>
        <div className="grid gap-4 md:grid-cols-2">
          <figure className="panel overflow-hidden">
            <figcaption className="border-b border-rule px-4 py-3">
              <span className="label">kitchen try stove</span>
              <p className="mt-1 text-[14px] text-ink-2">Four CPU-heavy jobs. Lower is faster.</p>
            </figcaption>
            <table className="w-full text-[14px]">
              <thead className="bg-surface-2 font-mono text-[11.5px] tracking-[0.04em] text-ink-2 uppercase">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Ran on</th>
                  <th className="px-4 py-2 text-right font-medium">GIL on</th>
                  <th className="px-4 py-2 text-right font-medium">GIL off</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule font-mono">
                {MEASURED.stove.map((row) => (
                  <tr key={row.label}>
                    <td className="px-4 py-2.5 font-sans">{row.label}</td>
                    <td className="px-4 py-2.5 text-right">{row.gil}</td>
                    <td className="px-4 py-2.5 text-right">{row.free}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </figure>
          <figure className="panel overflow-hidden">
            <figcaption className="border-b border-rule px-4 py-3">
              <span className="label">kitchen try counter</span>
              <p className="mt-1 text-[14px] text-ink-2">
                Four threads each add 1, a million times, with no lock.
              </p>
            </figcaption>
            <dl className="divide-y divide-rule font-mono text-[14px]">
              <div className="flex justify-between px-4 py-2.5">
                <dt className="font-sans">expected</dt>
                <dd>{MEASURED.counter.expected}</dd>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <dt className="font-sans">GIL on</dt>
                <dd>{MEASURED.counter.gil}</dd>
              </div>
              <div className="flex justify-between bg-red-wash px-4 py-2.5 text-red">
                <dt className="font-sans font-medium">GIL off</dt>
                <dd className="font-semibold">{MEASURED.counter.free}</dd>
              </div>
            </dl>
            <p className="px-4 py-3 text-[13.5px] leading-relaxed text-ink-2">
              The GIL hid the race. It never prevented it.
            </p>
          </figure>
        </div>
      </section>

      {/* Checklist */}
      <section className="flex flex-col gap-8">
        <SectionHead index="05" name="Checklist" title="Ten questions before you ship." />
        <ol className="grid gap-x-10 border-t border-rule md:grid-cols-2">
          {CHECKLIST.map((item, index) => (
            <li
              key={item}
              className="flex gap-4 border-b border-rule py-3.5 text-[15.5px] leading-relaxed"
            >
              <span className="font-mono text-[13px] leading-[1.7rem] text-muted">
                {String(index + 1).padStart(2, '0')}
              </span>
              {item}
            </li>
          ))}
        </ol>
      </section>

      {/* Start */}
      <section className="grid items-center gap-10 lg:grid-cols-[1fr_1.2fr] [&>*]:min-w-0">
        <div className="flex flex-col gap-5">
          <SectionHead index="06" name="Start" title="Ready in a minute.">
            You need uv and git. uv installs Python for you, and the lab uses the standard library
            only.
          </SectionHead>
          <Link
            href={`/workshop/${CHAPTERS[0]?.slug ?? ''}`}
            className="inline-flex h-11 w-fit items-center rounded-[6px] bg-ink px-5 text-[15px] font-medium text-surface hover:bg-ink-2"
          >
            Start chapter 01
          </Link>
        </div>
        <div className="flex items-end gap-4">
          <div className="code relative min-w-0 flex-1 overflow-x-auto rounded-[8px] px-5 pt-11 pb-5 text-[13px] leading-relaxed">
            <span className="absolute top-3 left-5 font-mono text-[11px] tracking-[0.04em] text-code-muted uppercase">
              shell
            </span>
            <div className="absolute top-2.5 right-3">
              <CopyButton text={QUICKSTART} />
            </div>
            <pre>{QUICKSTART}</pre>
          </div>
          <Otto className="hidden w-32 shrink-0 sm:block" />
        </div>
      </section>
    </div>
  )
}
