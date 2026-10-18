"""How each case is checked. Every check takes the case module, so the tests can check a fixed
copy too. A check says what it expects in plain words.

Concurrency bugs come and go, so a check runs the case several times and every run must pass."""

import asyncio
import inspect
import threading
import time
from collections.abc import Callable
from types import ModuleType

Check = tuple[str, bool]


def attempt(fn: Callable[[], object]) -> object:
    """Run fn and return its result, or the exception it raised."""
    try:
        return fn()
    except Exception as error:  # a crash is an answer too
        return error


def within(seconds: float, fn: Callable[[], object]) -> object:
    """Run fn on a daemon thread. Return its result, or TimeoutError if it never finishes."""
    box: list[object] = [TimeoutError(f"still running after {seconds} s")]

    def target() -> None:
        box[0] = attempt(fn)

    worker = threading.Thread(target=target, daemon=True)
    worker.start()
    worker.join(seconds)
    return box[0]


def timed(fn: Callable[[], object]) -> tuple[object, float]:
    start = time.perf_counter()
    result = attempt(fn)
    return result, time.perf_counter() - start


def keeps(fn: Callable[..., object], line: str) -> bool:
    """The work that stands in for real life is still there: no deleting the sleep."""
    return line in inspect.getsource(fn)


def check_01(m: ModuleType) -> list[Check]:
    calls: list[str] = []
    real = m.ask_supplier

    def counted(order: str) -> str:
        calls.append(order)
        return real(order)

    m.ask_supplier = counted
    try:
        answers, elapsed = timed(lambda: m.check_all(m.ORDERS))
    finally:
        m.ask_supplier = real
    expected = [f"order {n:02}: in stock" for n in range(1, 21)]
    return [
        ("all 20 answers come back, in the order asked", answers == expected),
        ("the supplier is still asked once per order", sorted(calls) == m.ORDERS),
        (f"20 orders take under 0.5 s (took {elapsed:.2f} s)", elapsed < 0.5),
    ]


def check_02(m: ModuleType) -> list[Check]:
    rushes = [attempt(m.rush) for _ in range(20)]
    sold = [getattr(case, "sold", None) for case in rushes]
    stock = [getattr(case, "stock", None) for case in rushes]
    return [
        ("in 20 rushes, exactly 10 croissants are sold every time", sold == [10] * 20),
        ("the stock never goes below zero", stock == [0] * 20),
        ("the till still takes time (keep the sleep)", keeps(m.DisplayCase.sell, "time.sleep")),
    ]


def check_03(m: ModuleType) -> list[Check]:
    runs = [timed(m.service) for _ in range(3)]
    plated = [getattr(kitchen, "plated", None) for kitchen, _ in runs]
    slowest = max(elapsed for _, elapsed in runs)
    return [
        (
            "every dish is counted, in 3 runs out of 3",
            plated == [{"grill": 20, "pans": 20}] * 3,
        ),
        (f"40 orders take under 0.5 s with 10 cooks (took {slowest:.2f} s)", slowest < 0.5),
        ("cooking still takes time", keeps(m.Kitchen.cook, "time.sleep(0.05)")),
    ]


def check_04(m: ModuleType) -> list[Check]:
    runs = [attempt(lambda: m.service(times=50, wait=3.0)) for _ in range(3)]
    finished = [isinstance(run, tuple) and run[1] for run in runs]
    dishes = [run[0].dishes if isinstance(run, tuple) else None for run in runs]
    return [
        ("both cooks finish, in 3 runs out of 3", finished == [True] * 3),
        ("all 100 dishes are made each time", dishes == [100] * 3),
        (
            "both cooks still need the knife and the board",
            all(
                keeps(fn, "self.knife") and keeps(fn, "self.board")
                for fn in (m.Kitchen.chop_onions, m.Kitchen.slice_bread)
            ),
        ),
    ]


def check_05(m: ModuleType) -> list[Check]:
    runs = [within(5.0, m.service) for _ in range(3)]
    return [
        (
            "the service ends: no cook waits forever",
            not any(isinstance(run, TimeoutError) for run in runs),
        ),
        (
            "all 200 orders are cooked, each exactly once, in 3 runs out of 3",
            all(isinstance(run, list) and sorted(run) == list(range(200)) for run in runs),
        ),
    ]


def check_06(m: ModuleType) -> list[Check]:
    orders, elapsed = timed(lambda: asyncio.run(m.serve(list(range(1, 11)))))
    return [
        (
            "every table orders, in table order",
            orders == [f"table {n}: ordered" for n in range(1, 11)],
        ),
        (f"10 tables take under 0.3 s (took {elapsed:.2f} s)", elapsed < 0.3),
    ]


def check_07(m: ModuleType) -> list[Check]:
    supplier = m.Supplier()
    results, elapsed = timed(lambda: asyncio.run(m.restock(supplier, m.ITEMS)))
    expected = [f"{item} delivered" for item in m.ITEMS]
    return [
        ("all 50 crates are delivered, none turned away", results == expected),
        (f"never more than 5 at once (peak {supplier.peak})", 0 < supplier.peak <= 5),
        (f"still concurrent: under 1.5 s (took {elapsed:.2f} s)", elapsed < 1.5),
    ]


def check_08(m: ModuleType) -> list[Check]:
    stove = m.Stove()
    results = attempt(lambda: asyncio.run(m.evening(stove)))
    results = results if isinstance(results, list) else []

    async def cancel_midway() -> int:
        small = m.Stove(burners=1)
        task = asyncio.create_task(m.cook(small, "soup", minutes=500))
        await asyncio.sleep(0.02)
        task.cancel()
        await asyncio.gather(task, return_exceptions=True)
        return small.free

    return [
        (
            "the six slow roasts are given up on",
            results[:6] == [f"roast {n}: customer left" for n in range(1, 7)],
        ),
        ("the omelette is served", results[6:] == ["omelette served"]),
        (f"all 4 burners are free at closing ({stove.free} free)", stove.free == 4),
        (
            "a dish cancelled mid-cook gives its burner back",
            attempt(lambda: asyncio.run(cancel_midway())) == 1,
        ),
    ]


CHECKS: dict[int, Callable[[ModuleType], list[Check]]] = {
    1: check_01,
    2: check_02,
    3: check_03,
    4: check_04,
    5: check_05,
    6: check_06,
    7: check_07,
    8: check_08,
}
