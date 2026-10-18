"""Case 03: the lock that closed the kitchen.

Ten cooks share one tally of plated dishes, so someone added a lock. Now the dishes are counted
right, but ten cooks are exactly as fast as one. The lock is guarding too much.
Run it: uv run python -m kitchen run 3
"""

import threading
import time
from concurrent.futures import ThreadPoolExecutor


class Kitchen:
    def __init__(self) -> None:
        self.lock = threading.Lock()
        self.plated: dict[str, int] = {}

    def record(self, station: str) -> None:
        count = self.plated.get(station, 0)
        time.sleep(0.0001)  # writing it in the ledger
        self.plated[station] = count + 1

    def cook(self, order: int) -> None:
        station = "grill" if order % 2 else "pans"
        with self.lock:
            time.sleep(0.05)  # cooking: slow, and touches nothing shared
            self.record(station)


def service(orders: int = 40, cooks: int = 10) -> Kitchen:
    kitchen = Kitchen()
    with ThreadPoolExecutor(cooks) as pool:
        list(pool.map(kitchen.cook, range(orders)))
    return kitchen


def run() -> None:
    start = time.perf_counter()
    kitchen = service()
    elapsed = time.perf_counter() - start
    print(f"plated: {kitchen.plated}")
    print(f"40 orders, 10 cooks: {elapsed:.2f} s")
