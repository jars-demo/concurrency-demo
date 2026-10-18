import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google'

import { Shell } from '@/components/Shell'

import './globals.css'

const sans = IBM_Plex_Sans({ variable: '--font-plex-sans', subsets: ['latin'] })
const mono = IBM_Plex_Mono({
  variable: '--font-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: {
    default: 'Concurrency, from first principles',
    template: '%s · Concurrency, from first principles',
  },
  description:
    'A hands-on concurrency workshop: eight real bugs in one busy kitchen. Threads, the GIL, race conditions, locks, deadlock, queues, asyncio, semaphores, timeouts and cancellation.',
}

export const viewport: Viewport = { themeColor: '#f6f7f9' }

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only rounded bg-ink px-4 py-2 text-surface focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
        >
          Skip to content
        </a>
        <Shell>{children}</Shell>
      </body>
    </html>
  )
}
