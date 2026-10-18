"""Case 01: dinner for twenty takes two seconds.

Every order waits 0.1 s for the supplier to answer. The kitchen asks about one order, waits,
then asks about the next. Nothing is computing; everyone is waiting. Make the waits overlap.
Run it: uv run python -m kitchen run 1
"""

import time

ORDERS = [f"order {n:02}" for n in range(1, 21)]


def ask_supplier(order: str) -> str:
    """Stands in for a network call: it waits, it does not compute."""
    time.sleep(0.1)
    return f"{order}: in stock"


def check_all(orders: list[str]) -> list[str]:
    return [ask_supplier(order) for order in orders]


def run() -> None:
    start = time.perf_counter()
    answers = check_all(ORDERS)
    elapsed = time.perf_counter() - start
    print(f"first answer: {answers[0]}")
    print(f"last answer:  {answers[-1]}")
    print(f"{len(answers)} orders checked in {elapsed:.2f} s")
