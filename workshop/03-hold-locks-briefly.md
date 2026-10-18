# Hold locks briefly

> A lock turns parallel work back into a queue. Guard the shared data, never the slow work, or ten threads become one very polite thread.

**Time:** 15 minutes

## Goal

Find what a lock really needs to protect, shrink the critical section to just that, and see the speed come back without losing correctness.

## The case

```bash
uv run python -m kitchen run 3
```

```text
plated: {'pans': 20, 'grill': 20}
40 orders, 10 cooks: 2.04 s
```

The count is right. The time is not: 40 orders at 0.05 s each is 2.0 s, which is exactly what one cook alone would take. Ten cooks bought nothing.

Open `lab/cases/case03_lock_scope.py` and read `cook`. The whole thing, cooking included, sits inside `with self.lock:`.

## Correct and slow

While one cook holds the lock, the other nine stand in line. The lock made the work **serial**: one at a time, in a queue. This is called **contention**, and it is the price of every lock. The longer a lock is held, the higher the price.

How much can more threads help? Split the work into the part that must run one at a time and the part that can overlap:

| Part of `cook`     | Touches shared data | Time per order | Must be serial |
| ------------------ | ------------------- | -------------- | -------------- |
| cooking            | no                  | 0.05 s         | no             |
| writing the ledger | yes, `self.plated`  | about 0.5 ms   | yes            |

Only the ledger needs the lock. Forty ledger writes at half a millisecond is 20 ms of serial time. The rest can overlap. This is **Amdahl's law** in one sentence: the serial part sets the speed limit, however many threads you add.

## What a lock should guard

- **Data, not work.** Ask "which shared variable does this line read or write?" If the answer is none, the line does not belong in the critical section.
- **Never wait while holding a lock.** No network calls, no disk, no `sleep`, no waiting for another lock if you can help it. Everyone queued behind you waits too.
- **Copy out, then work.** If you need shared data for a slow job, take the lock, copy what you need, let go, and do the slow part on your copy.
- **One lock per piece of shared state.** A lock is a promise about some data. Write down which data, in a comment next to it.

Going too far the other way is the bug from chapter 02. Take the lock out completely and the checker will catch lost dishes: `record` reads the count, writes in the ledger, then stores the count plus one.

## Fix the case

In `cook`, do the cooking outside the lock. Take the lock only around `self.record(station)`.

## Check it works

```bash
uv run python -m kitchen check 3
```

```text
  PASS  every dish is counted, in 3 runs out of 3
  PASS  40 orders take under 0.5 s with 10 cooks (took 0.21 s)
  PASS  cooking still takes time
```

0.21 s is four rounds of ten cooks at 0.05 s, plus the ledger.

## Exercise

After your fix, delete the `with self.lock:` line entirely (dedent its body). Run the case and the check. Which check fails, and how many dishes go missing from `plated`? Put the lock back around `record` only. That is the smallest correct critical section.

### More to try

- `record` is called with the lock already held. What would happen if `record` took `self.lock` itself? Find out safely in a Python shell: `lock = threading.Lock()`, `lock.acquire()`, then `lock.acquire(timeout=1)`. Now repeat with `threading.RLock()`, a lock the same thread may take twice.
- Give each station its own lock. Does it help here? When would it?
