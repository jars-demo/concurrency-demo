"""Case 04: knife, then board.

Two cooks share one knife and one chopping board, and every dish needs both. Most nights it
works. Tonight the kitchen went silent: nobody crashed, and nobody moved.
Run it: uv run python -m kitchen run 4
"""

import threading
import time


class Kitchen:
    def __init__(self) -> None:
        self.knife = threading.Lock()
        self.board = threading.Lock()
        self.dishes = 0

    def chop_onions(self, times: int) -> None:
        for _ in range(times):
            with self.knife:
                time.sleep(0.001)  # picking up the onion
                with self.board:
                    self.dishes += 1

    def slice_bread(self, times: int) -> None:
        for _ in range(times):
            with self.knife:
                time.sleep(0.001)  # laying out the loaf
                with self.board:
                    self.dishes += 1


def service(times: int = 50, wait: float = 3.0) -> tuple[Kitchen, bool]:
    """Run both cooks. Return the kitchen and whether they finished within wait seconds."""
    kitchen = Kitchen()
    cooks = [
        threading.Thread(target=kitchen.chop_onions, args=(times,), daemon=True),
        threading.Thread(target=kitchen.slice_bread, args=(times,), daemon=True),
    ]
    for cook in cooks:
        cook.start()
    deadline = time.monotonic() + wait
    for cook in cooks:
        cook.join(timeout=max(0.0, deadline - time.monotonic()))
    return kitchen, not any(cook.is_alive() for cook in cooks)


def run() -> None:
    kitchen, finished = service()
    print(f"dishes made: {kitchen.dishes} of 100")
    if finished:
        print("both cooks finished")
        return
    print("after 3 s, both cooks are still waiting:")
    print(f"  knife taken: {kitchen.knife.locked()}")
    print(f"  board taken: {kitchen.board.locked()}")
