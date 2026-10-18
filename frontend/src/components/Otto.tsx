// Otto: an octopus line cook. Eight arms, one stove, a ticket in one hand and a pan in another.
// He blinks and waves the ticket now and then; both stop for people who prefer reduced motion.

const BODY = '#2f5fdc'
const ARM = '#1f4fd1'
const INK = '#0f1720'

export function Otto({ className = '', face = false }: { className?: string; face?: boolean }) {
  return (
    <svg
      viewBox={face ? '46 0 108 124' : '0 0 200 200'}
      role="img"
      aria-label="Otto, an octopus line cook in a chef's hat"
      className={className}
    >
      {face ? null : (
        <>
          <ellipse cx="100" cy="188" rx="58" ry="6" fill={INK} opacity="0.07" />
          {/* Arms. */}
          <g fill="none" stroke={ARM} strokeWidth="13" strokeLinecap="round">
            <path d="M64 116c-22 10-32 32-18 44 8 6 16-2 10-8" />
            <path d="M78 124c-10 20-10 40 4 46 8 3 12-6 5-10" />
            <path d="M122 124c10 20 10 40-4 46-8 3-12-6-5-10" />
            <path d="M136 116c22 10 32 32 18 44-8 6-16-2-10-8" />
            <path d="M100 128c0 20-4 36 4 44" />
            <path d="M60 104c-18-4-28-14-30-28" />
          </g>
          {/* A pan, held by its handle. */}
          <path d="M30 76l-6-12" stroke={INK} strokeWidth="5" strokeLinecap="round" />
          <circle cx="18" cy="52" r="13" fill={INK} />
          <circle cx="18" cy="52" r="8" fill="#3b4452" />
          {/* A ticket, waved now and then. */}
          <g className="otto-wave">
            <path
              d="M140 104c20-8 30-26 26-42"
              fill="none"
              stroke={ARM}
              strokeWidth="13"
              strokeLinecap="round"
            />
            <rect
              x="152"
              y="26"
              width="28"
              height="36"
              rx="2"
              fill="#ffffff"
              stroke={INK}
              strokeWidth="2"
            />
            <path d="M158 36h16M158 43h16M158 50h10" stroke="#97a3b6" strokeWidth="2.5" />
          </g>
        </>
      )}
      {/* Head. */}
      <path d="M52 112c-6-42 14-72 48-72s54 30 48 72c-8 16-88 16-96 0z" fill={BODY} />
      <ellipse
        cx="80"
        cy="62"
        rx="12"
        ry="6"
        fill="#ffffff"
        opacity="0.18"
        transform="rotate(-24 80 62)"
      />
      {/* Chef's hat. */}
      <path
        d="M76 34c-11-1-13-18 1-19 2-12 22-14 25-4 8-10 28-6 24 8 12 0 11 15 0 15z"
        fill="#ffffff"
        stroke={INK}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect
        x="74"
        y="30"
        width="52"
        height="12"
        rx="3"
        fill="#ffffff"
        stroke={INK}
        strokeWidth="2"
      />
      {/* Eyes, cheeks and a small smile. */}
      <g className="otto-blink">
        <circle cx="84" cy="80" r="10" fill="#ffffff" />
        <circle cx="116" cy="80" r="10" fill="#ffffff" />
        <circle cx="86" cy="82" r="5" fill={INK} />
        <circle cx="118" cy="82" r="5" fill={INK} />
        <circle cx="88" cy="79.5" r="1.6" fill="#ffffff" />
        <circle cx="120" cy="79.5" r="1.6" fill="#ffffff" />
      </g>
      <circle cx="72" cy="97" r="5" fill="#f6a3b5" opacity="0.75" />
      <circle cx="128" cy="97" r="5" fill="#f6a3b5" opacity="0.75" />
      <path d="M92 99q8 6 16 0" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
