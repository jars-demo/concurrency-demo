"""Two experiments to run on your own machine, with and without the GIL.

counter  four threads each add 1 to a shared number a million times
stove    the same CPU-heavy work on one thread, four threads and four processes

Try them on the free-threaded build too:
    uv run --no-project --python 3.14t python -m kitchen try stove
"""

import os
import sys
import threading
import time
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor


def describe() -> str:
    gil = "GIL on" if getattr(sys, "_is_gil_enabled", lambda: True)() else "GIL off"
    return f"Python {sys.version.split()[0]}, {gil}, {os.cpu_count()} CPUs"


total = 0


def bump(times: int) -> None:
    global total
    for _ in range(times):
        total += 1  # read, add, write: three steps, not one


def counter(threads: int = 4, times: int = 1_000_000) -> None:
    global total
    print(describe())
    for attempt in range(1, 4):
        total = 0
        workers = [threading.Thread(target=bump, args=(times,)) for _ in range(threads)]
        for worker in workers:
            worker.start()
        for worker in workers:
            worker.join()
        lost = threads * times - total
        print(f"run {attempt}: total = {total:>9,}  expected {threads * times:,}  lost {lost:,}")


def burn(n: int) -> int:
    """Pure CPU work: no waiting, no I/O."""
    acc = 0
    for i in range(n):
        acc += i * i % 7
    return acc


def stove(jobs: int = 4, n: int = 5_000_000) -> None:
    print(describe())

    def timed(label: str, fn) -> None:
        start = time.perf_counter()
        fn()
        print(f"  {label:<14} {time.perf_counter() - start:5.2f} s")

    timed("one thread", lambda: [burn(n) for _ in range(jobs)])
    with ThreadPoolExecutor(jobs) as pool:
        timed(f"{jobs} threads", lambda: list(pool.map(burn, [n] * jobs)))
    with ProcessPoolExecutor(jobs) as pool:
        list(pool.map(burn, [1] * jobs))  # start the processes before timing
        timed(f"{jobs} processes", lambda: list(pool.map(burn, [n] * jobs)))


EXPERIMENTS = {"counter": counter, "stove": stove}
