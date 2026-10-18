import Link from 'next/link'

import { REPO_URL } from '@/lib/site'

import { Companion } from './Companion'

// Header, footer and Otto, shared by every page.

export function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#0f1720" />
      <rect x="6" y="8" width="13" height="4" rx="2" fill="#4f7af0" />
      <rect x="11" y="14" width="15" height="4" rx="2" fill="#f0a520" />
      <rect x="6" y="20" width="9" height="4" rx="2" fill="#e5e9f0" />
    </svg>
  )
}

const NAV = [
  { href: '/workshop', label: 'Chapters', phone: true },
  { href: '/#explorer', label: 'Explorer', phone: false },
]

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-rule bg-surface/95">
        <nav
          aria-label="Main"
          className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4"
        >
          <Link href="/" className="inline-flex items-center gap-2.5 rounded">
            <LogoMark />
            <span className="text-[15.5px] font-semibold tracking-[-0.01em]">Concurrency</span>
            <span className="hidden font-mono text-[12px] text-muted sm:inline">
              from first principles
            </span>
          </Link>
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.href} className={item.phone ? '' : 'hidden sm:block'}>
                <Link
                  href={item.href}
                  className="inline-flex h-9 items-center rounded-[6px] px-3 text-[14px] font-medium text-ink-2 hover:bg-surface-2 hover:text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={REPO_URL}
                className="ml-1 inline-flex h-9 items-center rounded-[6px] bg-ink px-3.5 text-[14px] font-medium text-surface hover:bg-ink-2"
              >
                GitHub
              </a>
            </li>
          </ul>
        </nav>
      </header>
      <main id="main" className="flex-1">
        {children}
      </main>
      <footer className="border-t border-rule">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 pt-6 pb-24 text-[13px] text-muted sm:flex-row sm:justify-between">
          <span>Concurrency, from first principles · MIT licensed</span>
          <a href={REPO_URL} className="hover:text-ink">
            Source on GitHub
          </a>
        </div>
      </footer>
      <Companion />
    </>
  )
}
