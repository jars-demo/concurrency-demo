"""Case 02: ten croissants, fifty sold.

The display case holds ten croissants. Fifty customers arrive at once, each served by their own
thread. The till says fifty were sold, and the stock count is negative.
Run it: uv run python -m kitchen run 2
"""

import threading
import time


class DisplayCase:
    def __init__(self, stock: int) -> None:
        self.stock = stock
        self.sold = 0

    def sell(self) -> bool:
        if self.stock > 0:
            time.sleep(0.001)  # the cook turns to the till: real work takes time
            self.stock -= 1
            self.sold += 1
            return True
        return False


def rush(stock: int = 10, customers: int = 50) -> DisplayCase:
    case = DisplayCase(stock)
    doors_open = threading.Barrier(customers)  # everyone walks in at the same moment

    def customer() -> None:
        doors_open.wait()
        case.sell()

    threads = [threading.Thread(target=customer) for _ in range(customers)]
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join()
    return case


def run() -> None:
    case = rush()
    print(f"croissants sold: {case.sold}")
    print(f"stock left:      {case.stock}")
