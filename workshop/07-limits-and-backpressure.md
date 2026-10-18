# Limits and backpressure

> Starting work is easy. Starting all of it at once is how you knock over the service you depend on. Decide how many things may run at a time, and make the rest wait in line.

**Time:** 15 minutes

## Goal

Cap how many tasks run at once with a semaphore, so a burst of work reaches a dependency at the pace it can handle.

## The case

```bash
uv run python -m kitchen run 7
```

```text
delivered:   5
turned away: 45
took 0.06 s
```

Open `lab/cases/case07_semaphore.py`. The supplier handles five deliveries at a time and turns the rest away, the way a real API answers `429 Too Many Requests`. `restock` fires all fifty with `gather`. Five get through, forty-five bounce, and it is all over in 0.06 s. Fast and wrong.

## Unlimited is a bug

`gather` over a list of a thousand items opens a thousand connections at once. Your side may cope. The database, the API or the disk on the other side usually does not. Every real system has a limit, whether it says so or not, and a burst over the limit gets errors, timeouts or worse: a slowdown for everyone else using that service.

So pick the number yourself. There are two kinds of limit, and they are easy to mix up:

| Limit           | Means                                | Tool                           |
| --------------- | ------------------------------------ | ------------------------------ |
| **concurrency** | at most N in flight at the same time | a semaphore                    |
| **rate**        | at most N started per second         | a token bucket or leaky bucket |

This supplier has a concurrency limit, so a semaphore is the right fit.

## Semaphores

A semaphore is a lock that lets N holders in instead of one. It keeps a count: taking it subtracts one, and if the count is zero you wait; giving it back adds one and wakes someone up.

```python
gate = asyncio.Semaphore(5)

async def fetch(url):
    async with gate:            # waits here if five are already inside
        return await client.get(url)

results = await asyncio.gather(*(fetch(url) for url in urls))
```

All the tasks still start at once, but only five get past `async with gate` at a time. The rest wait in line, in order, without spinning or sleeping. `threading.Semaphore` is the same idea for threads, and a thread pool's `max_workers` is a semaphore you get for free.

## Choosing N

- Start from the other side's documented limit, then stay a little under it.
- If there is no documented limit, measure: raise N until the total time stops improving or errors appear, then back off.
- More is not faster past the point where the other side is busy. It only moves the queue from your code to theirs.

## Fix the case

Leave the `Supplier` alone: it is the outside world. In `restock`, make each delivery pass through an `asyncio.Semaphore` sized to `Supplier.limit` before it calls `supplier.deliver`.

## Check it works

```bash
uv run python -m kitchen check 7
```

```text
  PASS  all 50 crates are delivered, none turned away
  PASS  never more than 5 at once (peak 5)
  PASS  still concurrent: under 1.5 s (took 0.63 s)
```

Ten rounds of five at 0.05 s is 0.5 s. One at a time would take 2.5 s and fail the last check, so "await each delivery in a loop" is not the answer either.

## Exercise

Set the semaphore to 6, one more than the supplier allows. Predict how many crates are turned away, then run it. Now make it 4. Everything is delivered: how much slower is it?

### More to try

- The supplier answers `TooBusy`. Instead of a semaphore, catch it and retry after a short wait. How long should the wait be? Look up **exponential backoff with jitter** and why every retry loop needs both.
- Chapter 05's bounded queue and this chapter's semaphore are both backpressure. What is the difference in who waits?
