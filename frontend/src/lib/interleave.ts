// The interleaving explorer: two cooks each run `plated += 1`, which Python runs as three
// steps (load, add, store). You choose who takes the next step. Pure functions, so the rules
// are unit tested without a browser.

export type Cook = 'A' | 'B'

export type Op = 'acquire' | 'load' | 'add' | 'store' | 'release'

export type Step = { cook: Cook; op: Op; shared: number; local: number }

export type State = {
  withLock: boolean
  shared: number
  lock: Cook | null
  pc: Record<Cook, number>
  local: Record<Cook, number>
  history: Step[]
}

export const COOKS: readonly Cook[] = ['A', 'B']

export function program(withLock: boolean): Op[] {
  const body: Op[] = ['load', 'add', 'store']
  return withLock ? ['acquire', ...body, 'release'] : body
}

/** How each step reads as Python, for the instruction list. */
export const LINES: Record<Op, string> = {
  acquire: 'lock.acquire()',
  load: 'local = plated',
  add: 'local = local + 1',
  store: 'plated = local',
  release: 'lock.release()',
}

export function start(withLock: boolean): State {
  return {
    withLock,
    shared: 0,
    lock: null,
    pc: { A: 0, B: 0 },
    local: { A: 0, B: 0 },
    history: [],
  }
}

export function nextOp(state: State, cook: Cook): Op | undefined {
  return program(state.withLock)[state.pc[cook]]
}

export function isFinished(state: State, cook: Cook): boolean {
  return nextOp(state, cook) === undefined
}

/** A cook is blocked when its next step is to take a lock the other cook holds. */
export function isBlocked(state: State, cook: Cook): boolean {
  return nextOp(state, cook) === 'acquire' && state.lock !== null && state.lock !== cook
}

export function canStep(state: State, cook: Cook): boolean {
  return !isFinished(state, cook) && !isBlocked(state, cook)
}

export function step(state: State, cook: Cook): State {
  const op = nextOp(state, cook)
  if (op === undefined || !canStep(state, cook)) return state
  let { shared, lock } = state
  let local = state.local[cook]
  if (op === 'acquire') lock = cook
  if (op === 'release') lock = null
  if (op === 'load') local = shared
  if (op === 'add') local += 1
  if (op === 'store') shared = local
  return {
    ...state,
    shared,
    lock,
    pc: { ...state.pc, [cook]: state.pc[cook] + 1 },
    local: { ...state.local, [cook]: local },
    history: [...state.history, { cook, op, shared, local }],
  }
}

/** Run a schedule such as "AABAB". When the chosen cook is blocked or finished, the other cook
 * takes the step instead, as a real scheduler would. */
export function run(withLock: boolean, schedule: string): State {
  return [...schedule].reduce((state, letter) => {
    const chosen = COOKS.find((cook) => cook === letter)
    if (!chosen) return state
    const other = COOKS.find((cook) => cook !== chosen) ?? chosen
    return step(state, canStep(state, chosen) ? chosen : other)
  }, start(withLock))
}

export type Verdict = 'running' | 'correct' | 'lost'

export function verdict(state: State): Verdict {
  if (!COOKS.every((cook) => isFinished(state, cook))) return 'running'
  return state.shared === COOKS.length ? 'correct' : 'lost'
}
