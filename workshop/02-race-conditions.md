# Race conditions

> A race condition is a bug where the answer depends on timing. The code is correct for every order of events you imagined, and wrong for one you did not.

**Time:** 20 minutes

## Goal

See why "check, then act" breaks when two threads do it at once, read the steps hidden inside one line of Python, and protect shared data with a lock.

## The case

```bash
uv run python -m kitchen run 2
```

```text
croissants sold: 50
stock left:      -40
```

Ten croissants, fifty sold. Open `lab/cases/case02_race.py` and read `sell`. On its own it is correct: if there is stock, take one. The trouble is that fifty threads run it at the same moment.

## Check, then act

Here is one way two cooks can interleave when one croissant is left:

| Step | Cook A                  | Cook B                  | `stock` |
| ---- | ----------------------- | ----------------------- | ------- |
| 1    | reads `stock > 0`: true |                         | 1       |
| 2    |                         | reads `stock > 0`: true | 1       |
| 3    | turns to the till       | turns to the till       | 1       |
| 4    | `stock -= 1`            |                         | 0       |
| 5    |                         | `stock -= 1`            | -1      |

Both checks passed, because both happened before either change. The check was true when it was made and false by the time anyone acted on it. This pattern is called **check-then-act**, and it is the most common race of all: "if the file does not exist, create it", "if the username is free, take it", "if the balance is enough, pay".

The case makes it happen every time: a `threading.Barrier` lets all fifty customers in at the same instant, and the 1 ms at the till leaves a wide gap between check and act. Real systems have the same gap, just narrower, so the bug shows up once a week instead of every run.

## One line, several steps

Even `total += 1` is not one step. Ask Python what it really runs:

```python
import dis

def bump():
    global total
    total += 1

dis.dis(bump)
```

```text
  6           LOAD_GLOBAL              0 (total)
              LOAD_CONST               1 (1)
              BINARY_OP               13 (+=)
              STORE_GLOBAL             0 (total)
```

Read, add, write. If another thread writes between the read and the write, its update is lost. Try it with four threads adding a million each:

```bash
uv run python -m kitchen try counter
```

```text
Python 3.13.7, GIL on, 16 CPUs
run 1: total = 4,000,000  expected 4,000,000  lost 0
run 2: total = 4,000,000  expected 4,000,000  lost 0
run 3: total = 4,000,000  expected 4,000,000  lost 0
```

Perfect, it seems. In CPython 3.13 with the GIL, a thread switch only happens at certain points, like the jump back to the top of a loop, and never between those four instructions. That is luck built into one version of one interpreter, not a promise. Run the same code without the GIL:

```bash
uv run --no-project --python 3.14t python -m kitchen try counter
```

```text
Python 3.14.3, GIL off, 16 CPUs
run 1: total = 1,098,299  expected 4,000,000  lost 2,901,701
run 2: total = 1,058,022  expected 4,000,000  lost 2,941,978
run 3: total = 1,051,416  expected 4,000,000  lost 2,948,584
```

Nearly three out of four updates lost. **The GIL hides races. It does not prevent them.** And as soon as there is a call, a sleep or any I/O between the read and the write, as in the case, races happen with the GIL too.

## Locks

A lock (a mutex, for "mutual exclusion") lets one thread in at a time. Everyone else who asks for it waits.

```python
import threading

lock = threading.Lock()

with lock:          # wait until it is free, then take it
    ...             # only one thread at a time runs this part
                    # leaving the block gives it back, even on an exception
```

The code inside is a **critical section**. The rule for drawing its edges: the check and the action that depends on it must be inside the **same** critical section. A lock around only `stock -= 1` fixes the lost update and still oversells, because the check happens outside.

Every thread that touches the shared data must use the same lock. A lock only protects data from code that also takes it.

## Fix the case

Give `DisplayCase` a lock in `__init__` and hold it across the check and the sale in `sell`. Keep the `time.sleep`: it stands for real work, and the checker makes sure it is still there.

## Check it works

```bash
uv run python -m kitchen check 2
```

```text
  PASS  in 20 rushes, exactly 10 croissants are sold every time
  PASS  the stock never goes below zero
  PASS  the till still takes time (keep the sleep)
```

The checker runs twenty rushes. A race that wins nineteen times out of twenty is still a race.

## Exercise

Move the lock so it only wraps `self.stock -= 1` and `self.sold += 1`, leaving the `if` outside. Predict how many croissants are sold, then run it. Explain the number using the step table above.

### More to try

- Use the interleaving explorer on the workshop home page. Find the schedule that loses an update with two cooks, then turn the lock on and try to break it again.
- Add a lock to `bump` in `lab/kitchen/experiments.py` and run the counter on 3.14t. All four million arrive. How much slower is it, and why?
