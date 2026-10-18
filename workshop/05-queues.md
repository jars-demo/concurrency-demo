# Queues: producers and consumers

> The safest shared data is data you hand over instead of share. A queue lets one thread pass work to another, and it does the locking for you.

**Time:** 20 minutes

## Goal

Build a producer and consumer pipeline that never loses work, learn why `empty()` cannot tell you that work is finished, and end the pipeline cleanly.

## The case

```bash
uv run python -m kitchen run 5
```

```text
orders taken:  200
orders cooked: 4
```

Open `lab/cases/case05_queue.py`. The waiter (the **producer**) pins four tickets for a table, then walks to the next table. Four cooks (the **consumers**) take tickets off the rail. They cooked the first table's order, found the rail empty while the waiter was walking, and went home.

## Why a queue

Chapters 02 to 04 were about many threads sharing one piece of data. A queue changes the question. Each ticket belongs to exactly one thread at a time: the waiter until `put`, then the rail, then one cook after `get`. Nothing is shared, so nothing needs your lock. `queue.Queue` is thread safe: its own lock is inside.

| Method        | What it does                                                    |
| ------------- | --------------------------------------------------------------- |
| `put(item)`   | add to the back; waits if the queue is full                     |
| `get()`       | take from the front; **waits** until there is something to take |
| `empty()`     | is it empty **right now**                                       |
| `task_done()` | a consumer says "I finished the item I got"                     |
| `join()`      | wait until every item put has been marked done                  |
| `shutdown()`  | new in 3.13: no more puts; `get` raises `ShutDown` once drained |

## The lie in `empty()`

`while not rail.empty():` reads like "while there is work". It means "while there is work at this exact moment". An empty rail can mean the waiter is finished, or the waiter is between tables. The queue cannot tell those apart, and by the time `empty()` returns, its answer may already be out of date. It is chapter 02's check-then-act again, in a new costume.

The consumer needs to hear "no more work is coming" from the producer, not guess it from the state of the queue.

## Ending cleanly

The classic answer is a **sentinel** (sometimes called a poison pill): a special value that means "the kitchen is closed".

```python
def consumer(jobs):
    while (job := jobs.get()) is not None:   # wait for the next job
        handle(job)

# the producer, after the last real job:
for _ in range(number_of_consumers):
    jobs.put(None)                           # one sentinel per consumer
```

`get()` blocks, so a cook with nothing to do simply waits. Each cook leaves only when it takes a `None`, and every cook gets exactly one, so they all go home and none goes early. Since Python 3.13 `jobs.shutdown()` does the same without a sentinel: `get` raises `queue.ShutDown` once the queue is empty.

## Backpressure

`queue.Queue()` has no size limit. If the producer is faster than the consumers, the queue grows until memory runs out. Give it a limit:

```python
jobs = queue.Queue(maxsize=8)
```

Now `put` waits when eight tickets are already on the rail. The producer slows to the speed of the kitchen instead of burying it. That push back from a slow consumer to a fast producer is called **backpressure**, and every healthy pipeline has it somewhere.

## Fix the case

Make each cook wait for tickets with `rail.get()`, and stop only on a "kitchen closed" signal from the waiter. A sentinel or `shutdown()` both work. Change the queue's type hint if you add `None`.

## Check it works

```bash
uv run python -m kitchen check 5
```

```text
  PASS  the service ends: no cook waits forever
  PASS  all 200 orders are cooked, each exactly once, in 3 runs out of 3
```

The first line is there because the obvious half fix, a blocking `get` with no sentinel, cooks every order and then never goes home.

## Exercise

Put only one sentinel instead of one per cook. Predict what the checker says, then run it. Which line fails, and why does a missing sentinel look like a hang rather than an error?

### More to try

- Use `maxsize=8` and record the longest the rail ever gets (`rail.qsize()` after each `put`). Then make cooking ten times slower. What happens to the waiter?
- Replace the sentinels with `rail.shutdown()` and `except queue.ShutDown`. Which version reads better to you?
