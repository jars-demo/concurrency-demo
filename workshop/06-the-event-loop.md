# The event loop

> asyncio runs thousands of tasks on one thread by switching only at `await`. That is its strength and its trap: one task that never awaits stops every other task.

**Time:** 20 minutes

## Goal

Understand what an event loop does, why a blocking call inside `async def` freezes everything, and how to find and fix one.

## The case

```bash
uv run python -m kitchen run 6
```

```text
10 tables served in 1.00 s
```

Open `lab/cases/case06_event_loop.py`. `serve` starts ten `take_order` tasks with `asyncio.gather`, so they should overlap and finish in about 0.1 s. They take a full second, one after another.

## How the loop works

asyncio has one thread and one loop. The loop keeps a list of tasks that are ready to run. It picks one and runs it until that task reaches an `await` on something that is not ready yet: a timer, a socket, a lock. The task is parked, and the loop picks the next ready task. When the timer fires or the data arrives, the parked task becomes ready again.

| Threads                                | asyncio                                   |
| -------------------------------------- | ----------------------------------------- |
| the OS switches threads at any moment  | a task switches only at an `await`        |
| a slow thread slows only itself        | a task that does not await stops everyone |
| races can happen between any two lines | races can only happen across an `await`   |
| thousands of threads are heavy         | a hundred thousand tasks are fine         |

This is **cooperative** multitasking. Every task has to cooperate by awaiting. `time.sleep(0.1)` does not await: it holds the only thread for 0.1 s, and the loop cannot run anything else.

## Find the task that blocks

asyncio has a debug mode that names every step that held the loop for more than 0.1 s:

```bash
PYTHONASYNCIODEBUG=1 uv run python -m kitchen run 6
```

```text
Executing <Task finished name='Task-2' coro=<take_order() done, defined at ...\case06_event_loop.py:12> result='table 1: ordered' created at ...\asyncio\tasks.py:748> took 0.101 seconds
Executing <Task finished name='Task-3' coro=<take_order() done, defined at ...\case06_event_loop.py:12> result='table 2: ordered' created at ...\asyncio\tasks.py:748> took 0.101 seconds
```

The paths are shortened, and there are ten lines, one per table. Each names the culprit and its line. On Windows PowerShell, set the variable first with `$env:PYTHONASYNCIODEBUG=1`. You can also pass `debug=True` to `asyncio.run`.

## Three kinds of slow, three fixes

| The slow thing                    | Inside async code, use                                         |
| --------------------------------- | -------------------------------------------------------------- |
| a wait with an async version      | its async version: `await asyncio.sleep`, an async HTTP client |
| a blocking call you cannot change | `await asyncio.to_thread(blocking_call, arg)`                  |
| heavy CPU work                    | a process pool: `loop.run_in_executor(pool, fn, arg)`          |

`asyncio.to_thread` runs the blocking call on a worker thread and lets the loop carry on. It is how you use an old library from new async code.

## Races across `await`

asyncio removes most races, not all. Between two lines with no `await`, no other task can run. Across an `await`, anything can happen:

```python
if stock > 0:
    await till.ring()   # other tasks run here, and may sell the last one
    stock -= 1
```

That is chapter 02 again, single threaded. `asyncio.Lock` is the fix, used with `async with`.

## Fix the case

Make `take_order` wait without blocking the loop. Then run the case again with debug mode on. The warnings are gone.

## Check it works

```bash
uv run python -m kitchen check 6
```

```text
  PASS  every table orders, in table order
  PASS  10 tables take under 0.3 s (took 0.12 s)
```

## Exercise

Pretend `time.sleep(0.1)` is a call into an old library you cannot change. Fix the case with `asyncio.to_thread` instead, keeping `time.sleep`. How long does it take? Then try 100 tables. Why is it slower than 100 `asyncio.sleep` calls? Hint: how many worker threads does `to_thread` have?

### More to try

- Put `burn(5_000_000)` from `lab/kitchen/experiments.py` inside `take_order`. What does debug mode report? Which row of the table above fits?
- `asyncio.gather` returns results in the order of its arguments. Replace it with `asyncio.TaskGroup` (Python 3.11+). What changes when one task raises?
