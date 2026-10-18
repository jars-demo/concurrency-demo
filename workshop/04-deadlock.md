# Deadlock

> A deadlock is a circle of threads, each holding something the next one needs. Nobody crashes and nobody moves. Break the circle and it cannot happen.

**Time:** 20 minutes

## Goal

Recognise a deadlock, find exactly where each thread is stuck, and prevent it by taking locks in one agreed order.

## The case

```bash
uv run python -m kitchen run 4
```

```text
dishes made: 0 of 100
after 3 s, both cooks are still waiting:
  knife taken: True
  board taken: True
```

Open `lab/cases/case04_deadlock.py`. Every dish needs the knife and the board. One cook picks up the knife first, the other picks up the board first. The case gives up after three seconds, so your terminal does not hang. A real program would wait forever.

## The circle

| Cook       | Holds | Waits for |
| ---------- | ----- | --------- |
| onion cook | knife | board     |
| bread cook | board | knife     |

Each waits for the other to let go, and neither will until it gets what it is waiting for. A deadlock needs all four of these at once:

| Condition        | In the kitchen                                          |
| ---------------- | ------------------------------------------------------- |
| mutual exclusion | only one cook can hold the knife                        |
| hold and wait    | a cook keeps the knife while waiting for the board      |
| no preemption    | nobody can take the knife out of a cook's hand          |
| circular wait    | onion cook waits on bread cook, who waits on onion cook |

Remove any one and the deadlock is impossible. The cheapest one to remove is almost always the last.

## See where they are stuck

A hung program gives no error. Ask it what every thread is doing instead. `faulthandler` from the standard library prints every thread's stack after a delay:

```bash
uv run python -c "import faulthandler; faulthandler.dump_traceback_later(1); from cases import case04_deadlock as case; case.run()"
```

```text
Timeout (0:00:01)!
Thread 0x00007f20 (most recent call first):
  File "E:\ProjectsWork\concurrency-demo\lab\cases\case04_deadlock.py", line 29 in slice_bread
  ...
Thread 0x00006624 (most recent call first):
  File "E:\ProjectsWork\concurrency-demo\lab\cases\case04_deadlock.py", line 22 in chop_onions
  ...
```

The output is shortened: the standard library frames are cut. Line 22 is `with self.board:` inside `chop_onions`. Line 29 is `with self.knife:` inside `slice_bread`. Two threads, each stuck on the second lock. That is the whole diagnosis. For a program that is already hung, tools like `py-spy dump --pid` do the same from outside.

## Prevent it

- **Lock ordering.** Give every lock a rank and always take them in rank order: knife, then board, everywhere. A circle needs someone to go the other way round, so there is no circle.
- **One lock.** If two pieces of data are always used together, one lock for both is simpler and cannot deadlock with itself.
- **Timeouts.** `lock.acquire(timeout=0.5)` returns `False` instead of waiting forever. It turns a hang into an error you can see and retry. It is a safety net, not a design.
- **Hold less.** Take a lock, do the small thing, let go, before you take the next one. Code that never holds two locks at once cannot deadlock on locks.

Two relatives to know: **livelock**, where threads keep reacting to each other and never progress (two people stepping aside in a corridor, forever), and **starvation**, where one thread never gets its turn because others always win.

## Fix the case

Make both cooks take the knife first and the board second. Both still need both tools: the checker makes sure.

## Check it works

```bash
uv run python -m kitchen check 4
```

```text
  PASS  both cooks finish, in 3 runs out of 3
  PASS  all 100 dishes are made each time
  PASS  both cooks still need the knife and the board
```

## Exercise

Keep the original, opposite order, and use `acquire(timeout=0.05)` for the second lock instead. If it times out, put the first lock down, wait a moment and try again. Does the service finish? Is it as fast as lock ordering? Which would you rather debug at 3 a.m.?

### More to try

- Remove the `time.sleep(0.001)` lines in the shipped case and run it a few times. It may finish. The deadlock is still there: what made it rare instead of certain?
- Write the lock order in a comment at the top of the class. In a real codebase, where would you put it so the next person sees it?
