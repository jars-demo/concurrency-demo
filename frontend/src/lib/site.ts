// Facts shown on the site. Every symptom and timing is real output from the lab:
// `uv run python -m kitchen run N` and `kitchen try`.

export const REPO_URL = 'https://github.com/jars-demo/concurrency-demo'

export type Case = {
  number: string
  title: string
  topics: string
  symptom: string
}

export const CASES: readonly Case[] = [
  {
    number: '01',
    title: 'Dinner for twenty takes two seconds',
    topics: 'threads, processes, the GIL',
    symptom: '20 orders checked in 2.01 s',
  },
  {
    number: '02',
    title: 'Ten croissants, fifty sold',
    topics: 'check-then-act, locks',
    symptom: 'croissants sold: 50\nstock left:      -40',
  },
  {
    number: '03',
    title: 'The lock that closed the kitchen',
    topics: 'contention, critical sections',
    symptom: '40 orders, 10 cooks: 2.04 s',
  },
  {
    number: '04',
    title: 'Knife, then board',
    topics: 'deadlock, lock ordering',
    symptom: 'dishes made: 0 of 100',
  },
  {
    number: '05',
    title: 'The orders nobody cooked',
    topics: 'queues, sentinels, backpressure',
    symptom: 'orders taken:  200\norders cooked: 4',
  },
  {
    number: '06',
    title: 'The waiter who stood still',
    topics: 'asyncio, blocking the loop',
    symptom: '10 tables served in 1.00 s',
  },
  {
    number: '07',
    title: 'Fifty orders at once',
    topics: 'semaphores, fan-out limits',
    symptom: 'delivered:   5\nturned away: 45',
  },
  {
    number: '08',
    title: 'The burners that never came back',
    topics: 'timeouts, cancellation, cleanup',
    symptom: 'burners free at closing: 0 of 4',
  },
]

// Measured with `kitchen try stove` and `kitchen try counter` on one 16-CPU Windows laptop.
export const MEASURED = {
  machine: '16 CPUs, Windows 11',
  stove: [
    { label: 'one thread', gil: '0.98 s', free: '1.10 s' },
    { label: '4 threads', gil: '1.07 s', free: '0.27 s' },
    { label: '4 processes', gil: '0.31 s', free: '0.29 s' },
  ],
  counter: { expected: '4,000,000', gil: '4,000,000', free: '1,098,299' },
} as const

export const CHECKLIST: readonly string[] = [
  'Is the slow part waiting or working? Threads and asyncio for waiting, processes for working.',
  'List every piece of data more than one thread or task touches.',
  'Hand data over with a queue before you share it with a lock.',
  'A check and the action that depends on it go in one critical section.',
  'Hold locks briefly. Never wait on the network while holding one.',
  'Take locks in one agreed order, written down.',
  'Never block the event loop. Every async def awaits its waits.',
  'Cap concurrency. Unlimited fan-out is a bug waiting for traffic.',
  'Put a timeout on every wait, and clean up in finally.',
  'Test it many times. A race that passes once has proven nothing.',
]

export const QUICKSTART = `git clone https://github.com/jars-demo/concurrency-demo.git
cd concurrency-demo/lab
uv sync
uv run python -m kitchen run 1`

// Real output of `kitchen run 2`, then `kitchen check 2` once the lock is in place.
export const CASE_TWO = {
  run: ['croissants sold: 50', 'stock left:      -40'],
  check: [
    'PASS  in 20 rushes, exactly 10 croissants are sold every time',
    'PASS  the stock never goes below zero',
    'PASS  the till still takes time (keep the sleep)',
  ],
}
