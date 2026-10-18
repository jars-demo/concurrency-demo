# AGENTS.md

Guidance for AI coding agents and developers. Humans: start with [README.md](README.md).

## What this is

"Concurrency, from first principles": eight chapters, each a concurrency idea explained in depth
and a real bug in a kitchen that shows it. `lab/` holds the cases and the checker; `workshop/`
the chapters; `frontend/` the site.

## Map

```text
lab/cases/caseNN_*.py      one deliberate concurrency bug each; run() shows the symptom
lab/kitchen/checks.py      check_NN(module) -> [(label, ok)]; races are run several times
lab/kitchen/experiments.py `kitchen try counter` and `kitchen try stove`
lab/kitchen/__main__.py    CLI: list, run, check, hint, try; case titles live here
lab/tests/                 each case fails as shipped and passes with tests/solutions/
frontend/src/lib/site.ts   cases and measured numbers: every value is real lab output
frontend/src/lib/interleave.ts  the explorer's rules, unit tested
frontend/src/lib/otto.ts   Otto's notes for each page
frontend/src/lib/tokens.ts colour pairs; a test checks them against globals.css and WCAG AA
```

## Commands

```bash
cd lab && uv sync && uv run pytest && uv run ruff check .
cd frontend && npm ci && npm run verify
```

## Rules

1. **The bugs are the product.** Never fix a bug in `lab/cases/`. Change a case, its check and
   its solution together, and keep `test_case_is_broken_as_shipped` passing.
2. **Bugs must be deterministic.** A case shows its symptom on every run, on any OS. Use
   barriers and generous sleeps rather than hoping the scheduler misbehaves.
3. **Standard library only** in `lab/`.
4. **Every number is real.** Output and timings in chapters and on the site come from real runs.
5. **Writing style.** Plain English, short sentences, no em dashes. Conventional Commits, no AI
   attribution trailers.
