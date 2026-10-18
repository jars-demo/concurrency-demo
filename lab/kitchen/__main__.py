"""kitchen: eight concurrency bugs in one busy kitchen.

list        every case, and which ones are fixed
run N       run case N and watch the bug happen
check N     check your fix (several runs: a race has to lose every time)
hint N      a nudge from Otto
try NAME    run an experiment: counter or stove
"""

import argparse
import importlib
import sys

from kitchen.checks import CHECKS
from kitchen.experiments import EXPERIMENTS

CASES = {
    1: ("case01_threads", "Dinner for twenty takes two seconds"),
    2: ("case02_race", "Ten croissants, fifty sold"),
    3: ("case03_lock_scope", "The lock that closed the kitchen"),
    4: ("case04_deadlock", "Knife, then board"),
    5: ("case05_queue", "The orders nobody cooked"),
    6: ("case06_event_loop", "The waiter who stood still"),
    7: ("case07_semaphore", "Fifty orders at once"),
    8: ("case08_cancellation", "The burners that never came back"),
}

HINTS = {
    1: [
        "The work is waiting, not computing. Waiting is where threads shine.",
        "concurrent.futures.ThreadPoolExecutor(max_workers=10) is a team of ten.",
        "pool.map(fn, items) hands out the work and returns answers in the order asked.",
    ],
    2: [
        "Two threads can both read stock == 1 before either one subtracts.",
        "Checking and then acting is one step to you. To the computer it is several.",
        "Put the check and the change inside the same `with self.lock:` block.",
    ],
    3: [
        "A lock should guard shared data, not slow work.",
        "Which line touches self.plated? Which line only waits?",
        "Cook outside the lock. Take the lock only to record the dish.",
    ],
    4: [
        "One cook holds the knife and wants the board. The other holds the board.",
        "A deadlock needs a cycle. Break the cycle and it cannot happen.",
        "Agree on one order: everyone takes the knife first, then the board.",
    ],
    5: [
        "An empty rail does not mean the waiter is finished. It means right now, nothing.",
        "rail.get() waits for the next ticket. Let it.",
        "Tell each cook the kitchen is closed: put one None per cook when the waiter is done.",
    ],
    6: [
        "Inside async def, time.sleep stops the whole event loop, not just this task.",
        "Only an await gives other tasks a turn.",
        "await asyncio.sleep(0.1). For a blocking call you cannot change: asyncio.to_thread.",
    ],
    7: [
        "gather starts all fifty at once. The supplier takes five.",
        "asyncio.Semaphore(5) lets five tasks in and makes the rest wait their turn.",
        "Wrap each delivery in `async with van:`. Do not change the Supplier.",
    ],
    8: [
        "A timeout cancels the task at its current await. The lines after it never run.",
        "Which line is skipped when a roast is cancelled while cooking?",
        "Give the burner back in a finally: block. It runs on success, error and cancel.",
    ],
}


def say(text: str) -> None:
    print("    ___")
    print(f"   (o o)   {text}")
    print("  //|||\\\\", flush=True)


def module(number: int):
    name = f"cases.{CASES[number][0]}"
    sys.modules.pop(name, None)  # always the code as it is on disk now
    return importlib.import_module(name)


def fixed(number: int) -> bool:
    return all(ok for _, ok in CHECKS[number](module(number)))


def cmd_list(args: argparse.Namespace) -> None:
    for number, (_, title) in CASES.items():
        print(f"  {number}  {title:<38} {'fixed' if fixed(number) else ''}", flush=True)


def cmd_run(args: argparse.Namespace) -> None:
    say(f"Case {args.n}: {CASES[args.n][1]}.")
    print()
    module(args.n).run()


def cmd_check(args: argparse.Namespace) -> None:
    results = CHECKS[args.n](module(args.n))
    for label, ok in results:
        print(f"  {'PASS' if ok else 'TODO'}  {label}")
    print()
    if all(ok for _, ok in results):
        say(f"Case {args.n} fixed. Service!")
    else:
        say(f"Not yet. Try: uv run python -m kitchen hint {args.n}")
        sys.exit(1)


def cmd_hint(args: argparse.Namespace) -> None:
    say("Here is what I would look at:")
    for hint in HINTS[args.n]:
        print(f"  - {hint}")


def cmd_try(args: argparse.Namespace) -> None:
    EXPERIMENTS[args.name]()


def main() -> None:
    parser = argparse.ArgumentParser(prog="kitchen", description="Eight concurrency bugs.")
    sub = parser.add_subparsers(required=True)
    sub.add_parser("list", help="every case and which are fixed").set_defaults(func=cmd_list)
    for name, func, text in [
        ("run", cmd_run, "run case N and watch the bug"),
        ("check", cmd_check, "check your fix"),
        ("hint", cmd_hint, "a nudge from Otto"),
    ]:
        p = sub.add_parser(name, help=text)
        p.add_argument("n", type=int, choices=CASES, metavar="N")
        p.set_defaults(func=func)
    p = sub.add_parser("try", help="run an experiment: counter or stove")
    p.add_argument("name", choices=EXPERIMENTS)
    p.set_defaults(func=cmd_try)
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
