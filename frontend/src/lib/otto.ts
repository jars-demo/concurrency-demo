// Otto's station notes: a short note and a few questions for each page, written by hand.

export type Question = { q: string; a: string }
export type Notes = { note: string; questions: readonly Question[] }

const HOME: Notes = {
  note: 'Eight arms, one stove. I have been juggling tasks my whole life. Start with chapter 01, and keep me open if you get stuck.',
  questions: [
    {
      q: 'Do I need to know threads already?',
      a: 'No. You need to read basic Python: functions, classes and a for loop. Chapter 01 starts from what a thread is.',
    },
    {
      q: 'Why Python, if it has a GIL?',
      a: 'Races, deadlocks, queues, event loops and cancellation work the same way in every language. Python keeps the code short, and the GIL is itself a good lesson: it hides races without preventing them.',
    },
    {
      q: 'How long does it take?',
      a: 'About two and a half hours for all eight chapters. Each chapter is one sitting of 15 to 20 minutes.',
    },
    {
      q: 'Are the numbers on this site real?',
      a: 'Yes. Every symptom and timing came from running the lab. Your machine will print slightly different timings, and the same bugs.',
    },
  ],
}

const WORKSHOP: Notes = {
  note: 'Do them in order. Each chapter builds on the last, and chapter 08 ends with a checklist you can keep.',
  questions: [
    {
      q: 'How do I start a case over?',
      a: 'From lab/, run git restore cases/ to put every case back as it was shipped.',
    },
    {
      q: 'Where are the answers?',
      a: 'In lab/tests/solutions/. Try the hints first: uv run python -m kitchen hint N.',
    },
  ],
}

const CHAPTERS: Record<string, Notes> = {
  '01-waiting-is-not-working': {
    note: 'Before choosing a tool, ask one question: is the slow part waiting or working?',
    questions: [
      {
        q: 'Threads or asyncio for waiting?',
        a: 'Both overlap waits. Threads work with ordinary blocking code. asyncio needs async libraries all the way down, and in return handles many thousands of waits cheaply.',
      },
      {
        q: 'Should I install the free-threaded build?',
        a: 'Try it for the experiments. For real projects, check that your libraries support it first: some C extensions still turn the GIL back on.',
      },
    ],
  },
  '02-race-conditions': {
    note: 'If two threads can touch it, and one of them writes, it needs protecting.',
    questions: [
      {
        q: 'My code has no races in testing. Is it safe?',
        a: 'Not necessarily. Races depend on timing. They hide on a quiet laptop and appear under load, on more cores, or on a build without the GIL.',
      },
      {
        q: 'Is reading without a lock fine?',
        a: 'Only if nobody writes at the same time. A reader can see a half-finished update otherwise, or decide something on a value that is about to change.',
      },
    ],
  },
  '03-hold-locks-briefly': {
    note: 'Guard the data, not the work. A lock is a queue with a polite name.',
    questions: [
      {
        q: 'How small should a critical section be?',
        a: 'Just the reads and writes of shared data that must happen together, and nothing that waits.',
      },
      {
        q: 'Lock or RLock?',
        a: 'Use Lock by default. RLock lets the same thread take it again, which hides design problems as often as it solves them.',
      },
    ],
  },
  '04-deadlock': {
    note: 'Nobody crashed and nobody moved. Ask every thread where it is standing.',
    questions: [
      {
        q: 'How do I debug a hang in production?',
        a: 'Get a stack dump of every thread: faulthandler from inside, or py-spy dump --pid from outside. Look for two threads each waiting on a lock.',
      },
      {
        q: 'Are timeouts on locks enough?',
        a: 'They turn a hang into an error, which helps. They do not remove the cycle. Lock ordering does.',
      },
    ],
  },
  '05-queues': {
    note: 'An empty rail means nothing right now, not nothing ever.',
    questions: [
      {
        q: 'Sentinel or shutdown()?',
        a: 'Both end the consumers cleanly. shutdown() needs Python 3.13 or newer. Sentinels work everywhere and are easy to read.',
      },
      {
        q: 'How big should the queue be?',
        a: 'Big enough to smooth out bursts, small enough that a slow consumer pushes back quickly. Start small, like a few times the number of consumers.',
      },
    ],
  },
  '06-the-event-loop': {
    note: 'One thread, many tasks, and a turn only at await. Never hold the stove.',
    questions: [
      {
        q: 'Is a requests call inside async def blocking?',
        a: 'Yes. requests is blocking. Use an async client, or wrap the call in asyncio.to_thread.',
      },
      {
        q: 'Can asyncio use more than one core?',
        a: 'Not by itself: it is one thread. Send CPU work to a process pool with run_in_executor.',
      },
    ],
  },
  '07-limits-and-backpressure': {
    note: 'Fan out with a limit. The kitchen next door has only five hands.',
    questions: [
      {
        q: 'Semaphore or rate limiter?',
        a: 'A semaphore caps how many run at once. A rate limiter caps how many start per second. Read the other side’s limit to know which one it means.',
      },
      {
        q: 'What about retries?',
        a: 'Retry only errors that may pass, wait longer each time, and add randomness so every client does not retry at the same moment.',
      },
    ],
  },
  '08-timeouts-and-cancellation': {
    note: 'Every wait needs an end, and every end needs cleanup. Then you are ready for service.',
    questions: [
      {
        q: 'Where does a timeout cancel my code?',
        a: 'At the await the task is waiting on. The lines after it do not run, but finally blocks and context managers do.',
      },
      {
        q: 'Can I catch CancelledError?',
        a: 'Yes, to clean up. Then raise it again. Swallowing it makes the task impossible to stop.',
      },
    ],
  },
}

export function notesFor(pathname: string): Notes {
  if (pathname === '/workshop') return WORKSHOP
  const slug = /^\/workshop\/([\w-]+)/.exec(pathname)?.[1]
  return (slug && CHAPTERS[slug]) || HOME
}

export const NOTE_SLUGS = Object.keys(CHAPTERS)
