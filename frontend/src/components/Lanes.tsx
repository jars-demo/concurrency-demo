// Fig. 1: case 02 as a timeline. Two cooks check the last croissant before either one sells it.
// Times are in milliseconds and drawn to scale; the shape matches what the lab does.

type Block = { from: number; to: number; text: string }

const SPAN = 4 // milliseconds shown

const A: Block[] = [
  { from: 0, to: 0.7, text: 'check' },
  { from: 0.7, to: 2.1, text: 'till' },
  { from: 2.1, to: 2.6, text: 'sell' },
]
const B: Block[] = [
  { from: 0.3, to: 1.0, text: 'check' },
  { from: 1.0, to: 2.4, text: 'till' },
  { from: 2.9, to: 3.4, text: 'sell' },
]
const STOCK: Block[] = [
  { from: 0, to: 2.6, text: '1' },
  { from: 2.6, to: 3.4, text: '0' },
  { from: 3.4, to: 4, text: '-1' },
]

const pct = (ms: number) => `${(ms / SPAN) * 100}%`

function Lane({ blocks, tone }: { blocks: Block[]; tone: 'a' | 'b' }) {
  const look = tone === 'a' ? 'bg-blue text-surface' : 'bg-amber-fill text-ink'
  return (
    <div className="relative h-8">
      {blocks.map((block, index) => (
        <span
          key={block.text}
          className={`lane-block absolute inset-y-0 flex items-center justify-center overflow-hidden rounded-[4px] font-mono text-[10.5px] font-medium sm:text-[11.5px] ${look}`}
          style={
            {
              left: pct(block.from),
              width: `calc(${pct(block.to - block.from)} - 2px)`,
              '--at': `${300 + index * 450 + (tone === 'b' ? 150 : 0)}ms`,
            } as React.CSSProperties
          }
        >
          {block.text}
        </span>
      ))}
    </div>
  )
}

export function Lanes() {
  return (
    <figure className="panel p-4 sm:p-5" style={{ boxShadow: 'var(--shadow-panel)' }}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="label">Fig. 1 · Case 02</span>
        <span className="font-mono text-[11.5px] text-muted">time in ms</span>
      </div>

      <div className="mt-4 grid grid-cols-[3.5rem_1fr] gap-x-3 gap-y-2.5 sm:grid-cols-[4.25rem_1fr]">
        <span />
        <div className="relative h-4 font-mono text-[11px] text-muted">
          {[0, 1, 2, 3, 4].map((ms) => (
            <span
              key={ms}
              className="absolute -translate-x-1/2 first:translate-x-0 last:-translate-x-full"
              style={{ left: pct(ms) }}
            >
              {ms}
            </span>
          ))}
        </div>

        <span className="self-center text-[13px] font-medium">cook A</span>
        <Lane blocks={A} tone="a" />
        <span className="self-center text-[13px] font-medium">cook B</span>
        <Lane blocks={B} tone="b" />

        <span className="self-center font-mono text-[12px] text-muted">stock</span>
        <div className="relative h-8 border-y border-rule">
          {STOCK.map((cell) => (
            <span
              key={cell.text}
              className={`absolute inset-y-0 flex items-center border-l border-rule pl-2 font-mono text-[13px] font-semibold ${
                cell.text === '-1' ? 'bg-red-wash text-red' : 'text-ink'
              }`}
              style={{ left: pct(cell.from), width: pct(cell.to - cell.from) }}
            >
              {cell.text}
            </span>
          ))}
          {/* Both checks happen while stock is still 1. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-[5.4rem] bottom-0 rounded-[4px] border border-dashed border-red/60"
            style={{ left: pct(-0.05), width: pct(1.1) }}
          />
        </div>
      </div>

      <figcaption className="mt-4 border-t border-rule pt-3 text-[13.5px] leading-relaxed text-ink-2">
        Both cooks check while one croissant is left (dashed box), then both sell it. Stock ends at{' '}
        <span className="font-mono font-semibold text-red">-1</span>. In the lab, fifty cooks do
        this at once.
      </figcaption>
    </figure>
  )
}
