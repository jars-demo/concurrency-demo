"""Case 06: the waiter who stood still.

The new async waiter serves ten tables "concurrently" with asyncio.gather. It should take about
0.1 s. It takes a full second, one table after another.
Run it: uv run python -m kitchen run 6
"""

import asyncio
import time


async def take_order(table: int) -> str:
    time.sleep(0.1)  # the table decides what to eat
    return f"table {table}: ordered"


async def serve(tables: list[int]) -> list[str]:
    return await asyncio.gather(*(take_order(table) for table in tables))


def run() -> None:
    start = time.perf_counter()
    orders = asyncio.run(serve(list(range(1, 11))))
    elapsed = time.perf_counter() - start
    print(f"{len(orders)} tables served in {elapsed:.2f} s")
