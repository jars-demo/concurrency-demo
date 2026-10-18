# Concurrency, from first principles

A hands-on concurrency workshop. Eight chapters, each explaining one idea in depth, each with a real bug in a busy kitchen for you to fix: threads and the GIL, race conditions, lock scope, deadlock, queues, the event loop, limits and backpressure, and timeouts and cancellation. **Otto**, the octopus line cook, checks your work.

**Workshop site:** [concurrency.jishanahmed.in](https://concurrency.jishanahmed.in)

## Quick start

You need [uv](https://docs.astral.sh/uv/) and git. uv installs Python for you. The lab uses the Python standard library only.

```bash
git clone https://github.com/jars-demo/concurrency-demo.git
cd concurrency-demo/lab
uv sync
uv run python -m kitchen run 1
```

## How a case works

| Command                                | What it does                                    |
| -------------------------------------- | ----------------------------------------------- |
| `uv run python -m kitchen list`        | every case, and which ones are fixed            |
| `uv run python -m kitchen run N`       | run case N and watch the bug happen             |
| `uv run python -m kitchen check N`     | check your fix; races are run many times        |
| `uv run python -m kitchen hint N`      | a nudge from Otto                               |
| `uv run python -m kitchen try counter` | four threads, one shared number, no lock        |
| `uv run python -m kitchen try stove`   | CPU work on one thread, four threads, processes |

Fix the code in `lab/cases/`. Start a case over with `git restore cases/` from `lab/`.

Run the two experiments without the GIL too:

```bash
uv run --no-project --python 3.14t python -m kitchen try counter
```

## The chapters

| #   | Chapter                                                               | The case                            |
| --- | --------------------------------------------------------------------- | ----------------------------------- |
| 01  | [Waiting is not working](workshop/01-waiting-is-not-working.md)       | Dinner for twenty takes two seconds |
| 02  | [Race conditions](workshop/02-race-conditions.md)                     | Ten croissants, fifty sold          |
| 03  | [Hold locks briefly](workshop/03-hold-locks-briefly.md)               | The lock that closed the kitchen    |
| 04  | [Deadlock](workshop/04-deadlock.md)                                   | Knife, then board                   |
| 05  | [Queues: producers and consumers](workshop/05-queues.md)              | The orders nobody cooked            |
| 06  | [The event loop](workshop/06-the-event-loop.md)                       | The waiter who stood still          |
| 07  | [Limits and backpressure](workshop/07-limits-and-backpressure.md)     | Fifty orders at once                |
| 08  | [Timeouts and cancellation](workshop/08-timeouts-and-cancellation.md) | The burners that never came back    |

## Layout

```text
lab/cases/            the eight cases: one real concurrency bug each
lab/kitchen/          the CLI, the checks and the two experiments
lab/tests/            every case fails as shipped and passes with the fix in tests/solutions/
workshop/             the chapters, in Markdown
frontend/             the workshop site (Next.js), which renders workshop/
```

Run the lab's tests with `cd lab && uv run pytest`. The solutions are in `lab/tests/solutions/`: peek only when truly stuck.

## Run the site locally

```bash
cd frontend
npm ci
npm run dev
```

## License

[MIT](LICENSE)
