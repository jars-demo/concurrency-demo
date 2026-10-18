# Timeouts and cancellation

> Every wait needs an end. And when you stop a task halfway, whatever it was holding must be handed back on the way out.

**Time:** 20 minutes

## Goal

Put a deadline on waits, learn exactly where a cancelled task stops, and make cleanup run on success, on error and on cancel.

## The case

```bash
uv run python -m kitchen run 8
```

```text
roast 1: customer left
roast 2: customer left
roast 3: customer left
roast 4: customer left
roast 5: customer left
roast 6: customer left
omelette: customer left
burners free at closing: 0 of 4
```

The roasts take too long and the customers leave. That part is expected. But then a five-minute omelette cannot get a burner either. The stove has four burners, nobody is cooking, and none are free.

Open `lab/cases/case08_cancellation.py` and read `cook`.

## Every wait needs a deadline

Without a timeout, a slow dependency becomes your slowness, and a dead one becomes your hang. asyncio has a deadline you can wrap around any block of awaits (Python 3.11+):

```python
async with asyncio.timeout(2.0):
    reply = await client.get(url)
```

If the block is not done in two seconds, asyncio **cancels** the task inside it and `async with` raises `TimeoutError`. The case does exactly this in `order`. The timeout works. What happens to the cancelled task is the bug.

## Where cancellation lands

Cancelling a task does not stop it instantly. asyncio raises `asyncio.CancelledError` **inside the task, at the `await` it is waiting on**. From there it travels up like any exception:

```python
async def cook(stove, dish, minutes):
    await stove.take()
    await asyncio.sleep(minutes / 100)   # CancelledError is raised here
    stove.give_back()                    # so this line never runs
    return f"{dish} served"
```

Four roasts took a burner, were cancelled while cooking, and never gave the burner back. That is a **resource leak**, and it is the same leak whether the "burner" is a lock, a database connection, a file or a slot in a pool.

## Cleanup that always runs

`finally` runs when its block ends for any reason: return, exception or cancellation.

```python
await pool.acquire()
try:
    await work()
finally:
    pool.release()       # runs on success, error and cancel
```

Better still, use a context manager that does it for you: `async with semaphore:`, `async with lock:`, `with open(...)`. Most leaks are a manual `acquire` that should have been an `async with`.

Two rules about `CancelledError`:

- **Do not swallow it.** It is a `BaseException`, not an `Exception`, so `except Exception:` lets it through, as it should. A bare `except:` or `except BaseException:` that does not re-raise makes a task impossible to stop.
- **Do not wait forever in cleanup.** A `finally` that awaits something slow delays the cancel. Keep cleanup short.

## Threads cannot be cancelled

There is no way to stop a thread from outside in Python. The thread has to agree to stop. The usual way is a `threading.Event` it checks between steps:

```python
stop = threading.Event()

def worker():
    while not stop.is_set():
        do_one_small_step()

stop.set()   # from any thread: please finish the current step and leave
```

Any blocking call inside the loop should have a timeout too, or the thread never gets back to the check.

## Fix the case

Make `cook` give the burner back even when it is cancelled in the middle of cooking.

## Check it works

```bash
uv run python -m kitchen check 8
```

```text
  PASS  the six slow roasts are given up on
  PASS  the omelette is served
  PASS  all 4 burners are free at closing (4 free)
  PASS  a dish cancelled mid-cook gives its burner back
```

## Exercise

Replace `stove.take()` and `stove.give_back()` in `cook` with `async with stove.burners:`. The check passes, but now `stove.free` says 4 even while a dish is cooking. Why? Give `Stove` its own `__aenter__` and `__aexit__` so `async with stove:` keeps `in_use` right too.

### More to try

- Wrap the sleep in `cook` with `try: ... except BaseException: pass`. Run the case. Four roasts now say "served" after 0.05 s of a 0.9 s cook. What did swallowing the cancel do to the timeout?
- Write `kitchen check 8` style checks for your own code: what resource does your service hold that a timeout could leak?

## The concurrency checklist

1. Is the slow part waiting or working? Threads and asyncio for waiting, processes for working.
2. List every piece of data more than one thread or task touches.
3. Hand data over with a queue before you share it with a lock.
4. A check and the action that depends on it go in one critical section.
5. Hold locks briefly. Never wait on the network while holding one.
6. Take locks in one agreed order, written down.
7. Never block the event loop. Every `async def` awaits its waits.
8. Cap concurrency. Unlimited fan-out is a bug waiting for traffic.
9. Put a timeout on every wait, and clean up in `finally`.
10. Test it many times. A race that passes once has proven nothing.
