"""Case 08: the burners that never came back.

The stove has four burners. Customers who wait too long leave, and their dish is cancelled.
After four customers leave, the stove has no free burners, and nobody is cooking on them.
Run it: uv run python -m kitchen run 8
"""

import asyncio


class Stove:
    def __init__(self, burners: int = 4) -> None:
        self.burners = asyncio.Semaphore(burners)
        self.total = burners
        self.in_use = 0

    async def take(self) -> None:
        await self.burners.acquire()
        self.in_use += 1

    def give_back(self) -> None:
        self.in_use -= 1
        self.burners.release()

    @property
    def free(self) -> int:
        return self.total - self.in_use


async def cook(stove: Stove, dish: str, minutes: float) -> str:
    await stove.take()
    try:
        await asyncio.sleep(minutes / 100)  # one minute of cooking is 0.01 s here
    finally:
        stove.give_back()
    return f"{dish} served"


async def order(stove: Stove, dish: str, minutes: float, patience: float) -> str:
    """The customer waits patience seconds, then leaves and the dish is cancelled."""
    try:
        async with asyncio.timeout(patience):
            return await cook(stove, dish, minutes)
    except TimeoutError:
        return f"{dish}: customer left"


async def evening(stove: Stove) -> list[str]:
    slow = [order(stove, f"roast {n}", minutes=90, patience=0.05) for n in range(1, 7)]
    results = list(await asyncio.gather(*slow))
    results.append(await order(stove, "omelette", minutes=5, patience=0.5))
    return results


def run() -> None:
    stove = Stove()
    for line in asyncio.run(evening(stove)):
        print(line)
    print(f"burners free at closing: {stove.free} of {stove.total}")
