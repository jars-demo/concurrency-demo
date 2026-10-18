"""Case 05: the orders nobody cooked.

One waiter pins tickets on the rail; four cooks take them off and cook. The waiter took 200
orders, four from each of fifty tables. The cooks went home early, and almost every ticket is
still on the rail.
Run it: uv run python -m kitchen run 5
"""

import queue
import threading
import time


def service(tables: int = 50, cooks: int = 4) -> list[int]:
    rail: queue.Queue[int | None] = queue.Queue()
    cooked: list[int] = []

    def waiter() -> None:
        for table in range(tables):
            for dish in range(4):
                rail.put(table * 4 + dish)
            time.sleep(0.005)  # walking to the next table
        for _ in range(cooks):
            rail.put(None)  # one "kitchen closed" ticket per cook

    def cook() -> None:
        while (ticket := rail.get()) is not None:
            time.sleep(0.001)  # cooking
            cooked.append(ticket)

    staff = [threading.Thread(target=waiter)]
    staff += [threading.Thread(target=cook) for _ in range(cooks)]
    for person in staff:
        person.start()
    for person in staff:
        person.join()
    return cooked


def run() -> None:
    cooked = service()
    print("orders taken:  200")
    print(f"orders cooked: {len(cooked)}")
