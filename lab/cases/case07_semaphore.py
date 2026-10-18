"""Case 07: fifty orders at once.

The supplier's van handles five deliveries at a time and turns the rest away, like an API that
answers 429 Too Many Requests. The kitchen fires all fifty restock orders at the same moment.
Run it: uv run python -m kitchen run 7
"""

import asyncio
import time


class TooBusy(Exception):
    """The supplier's 429."""


class Supplier:
    limit = 5

    def __init__(self) -> None:
        self.active = 0
        self.peak = 0

    async def deliver(self, item: str) -> str:
        if self.active >= self.limit:
            raise TooBusy(item)
        self.active += 1
        self.peak = max(self.peak, self.active)
        try:
            await asyncio.sleep(0.05)  # driving
            return f"{item} delivered"
        finally:
            self.active -= 1


ITEMS = [f"crate {n:02}" for n in range(1, 51)]


async def restock(supplier: Supplier, items: list[str]) -> list[str | BaseException]:
    return await asyncio.gather(*(supplier.deliver(item) for item in items), return_exceptions=True)


def run() -> None:
    supplier = Supplier()
    start = time.perf_counter()
    results = asyncio.run(restock(supplier, ITEMS))
    elapsed = time.perf_counter() - start
    turned_away = sum(isinstance(result, TooBusy) for result in results)
    print(f"delivered:   {len(results) - turned_away}")
    print(f"turned away: {turned_away}")
    print(f"took {elapsed:.2f} s")
