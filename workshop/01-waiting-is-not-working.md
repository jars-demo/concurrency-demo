# Waiting is not working

> Concurrency is about dealing with many things at once. Parallelism is about doing many things at once. Know which one your program needs before you reach for a tool.

**Time:** 20 minutes

## Goal

Tell waiting apart from working, and know when threads, processes or asyncio fit. Then make twenty slow supplier calls overlap so dinner takes 0.2 s instead of 2.

## The case

```bash
uv run python -m kitchen run 1
```

```text
first answer: order 01: in stock
last answer:  order 20: in stock
20 orders checked in 2.01 s
```

Open `lab/cases/case01_threads.py`. Each call to `ask_supplier` sleeps for 0.1 s. That sleep stands in for a network call: the program sends a question and waits for the answer. Twenty questions, one after another, is twenty waits in a row.

## Two words that are not the same

Picture one cook and four pots. The cook stirs one pot, turns to the next while the first simmers, and keeps all four going. Nothing happens at the same instant, but all four dishes make progress. That is **concurrency**: structuring work so many tasks are in progress at once.

Now picture four cooks at four stoves. Four things really do happen at the same instant. That is **parallelism**: running at the same time on more than one CPU core.

Concurrency is a way to arrange a program. Parallelism is a property of the hardware it runs on. A concurrent program can run on a single core, and it is still useful there, because most programs spend their time waiting.

## Waiting and working

Every slow piece of code is slow for one of two reasons.

| The code is             | It spends its time            | Examples                                   | What helps                        |
| ----------------------- | ----------------------------- | ------------------------------------------ | --------------------------------- |
| **I/O bound** (waiting) | waiting for something outside | HTTP calls, database queries, reading disk | threads or asyncio: overlap waits |
| **CPU bound** (working) | computing                     | parsing, image resizing, number crunching  | more cores: processes             |

While a thread waits for the network, the CPU has nothing to do for it. Start twenty waits at once and they all finish in about the time of one. That is this case.

## Three ways to run things at once

| Tool      | Shares memory | Cost to start | Who decides when to switch        | Good for                     |
| --------- | ------------- | ------------- | --------------------------------- | ---------------------------- |
| process   | no            | high          | the operating system              | CPU-bound work on many cores |
| thread    | yes           | medium        | the operating system, at any time | waiting, with ordinary code  |
| coroutine | yes           | tiny          | your code, at every `await`       | thousands of waits (asyncio) |

Shared memory is the double-edged part. Threads can read each other's data, which is convenient, and they can also trample it, which is the subject of the next three chapters.

## The GIL, honestly

The usual build of CPython has a **global interpreter lock**: only one thread runs Python code at a time. A thread lets go of the lock while it waits for I/O, so threads overlap waiting perfectly well. They do not make CPU work faster.

Measure it on your own machine:

```bash
uv run python -m kitchen try stove
```

```text
Python 3.13.7, GIL on, 16 CPUs
  one thread      0.98 s
  4 threads       1.07 s
  4 processes     0.31 s
```

Four threads did four jobs no faster than one thread, because they took turns. Four processes each have their own interpreter and their own GIL, so they used four cores.

Since Python 3.13 there is also a **free-threaded build** with no GIL, officially supported from 3.14. uv can fetch it for you:

```bash
uv run --no-project --python 3.14t python -m kitchen try stove
```

```text
Python 3.14.3, GIL off, 16 CPUs
  one thread      1.10 s
  4 threads       0.27 s
  4 processes     0.29 s
```

Now threads run in parallel. Hold on to that result: chapter 02 shows what else changes when the GIL goes away.

## Fix the case

The work is waiting, so threads are the right tool. The standard library has a ready-made team of worker threads:

```python
from concurrent.futures import ThreadPoolExecutor

with ThreadPoolExecutor(max_workers=10) as pool:
    results = list(pool.map(fetch, urls))
```

`pool.map` hands each item to a free worker and gives the results back **in the order you asked**, not the order they finished. The `with` block waits for every worker before it ends. Use it in `check_all`.

How many workers? With ten workers and twenty orders, the waits happen in two rounds of 0.1 s. Without `max_workers`, the default is `min(32, os.cpu_count() + 4)`, which is sized for I/O work.

## Check it works

```bash
uv run python -m kitchen check 1
```

```text
  PASS  all 20 answers come back, in the order asked
  PASS  the supplier is still asked once per order
  PASS  20 orders take under 0.5 s (took 0.20 s)
```

## Exercise

Predict, then measure: how long do the twenty orders take with `max_workers=5`? With `max_workers=20`? With 100? Write your three guesses down before you run them. Why does 100 not beat 20?

### More to try

- Change `ask_supplier` to do CPU work instead of sleeping (call `burn(2_000_000)` from `lab/kitchen/experiments.py`). Do threads still help? Now swap in `ProcessPoolExecutor`.
- `pool.submit(fn, item)` returns a `Future`. Collect them and use `concurrent.futures.as_completed` to print answers as they arrive. When is that better than `map`?
