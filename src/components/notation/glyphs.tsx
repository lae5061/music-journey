/**
 * Notation glyphs, drawn as SVG paths in a space where the five staff lines sit at
 * y = 0, 10, 20, 30, 40 and x = 0 is the glyph's own left edge.
 *
 * They are drawn rather than typeset because no music font can be relied on to be
 * present, and a missing glyph in a reading lesson is worse than a plain one.
 */

/**
 * The clefs are drawn as single stroked paths rather than filled calligraphic
 * outlines: the geometry is what carries the meaning — where the spiral winds and
 * where the dots fall — and an even stroke suits a system with no other flourishes.
 */
const CLEF_STROKE = 2.6

/** The G clef. Its spiral winds around the second line from the bottom — the G (y = 30). */
export const TrebleClef = ({ x = 0 }: { x?: number }) => (
  <path
    transform={`translate(${x + 13}, 0)`}
    fill="none"
    stroke="currentColor"
    strokeWidth={CLEF_STROKE}
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M3 52C-4 55 -9 51 -8 45C-7 39 -1 38 3 42C6 45 5 36 4 28C3 19 2 6 2 -2C2 -9 -1 -13 -4 -10C-8 -6 -7 3 -3 10C1 17 9 22 10 29C11 37 6 43 0 43C-7 43 -10 37 -9 31C-8 26 -2 23 3 26C7 28 7 33 3 34"
  />
)

/** The F clef. Its head sits on the fourth line from the bottom — the F (y = 10) — and its two dots straddle it. */
export const BassClef = ({ x = 0 }: { x?: number }) => (
  <g transform={`translate(${x + 8}, 0)`}>
    <circle cx="-4" cy="10" r="3.1" />
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth={CLEF_STROKE}
      strokeLinecap="round"
      d="M-4 10C2 6 8 9 8 16C8 25 3 33 -8 40"
    />
    <circle cx="13" cy="5" r="2.2" />
    <circle cx="13" cy="15" r="2.2" />
  </g>
)

export const CLEF_WIDTH = { treble: 28, bass: 26 } as const

/** Where each clef puts a given diatonic step. */
export const CLEF_ANCHOR = {
  // Bottom line of the treble stave is E4 (step 30); of the bass stave, G2 (step 18).
  treble: 30,
  bass: 18,
} as const

/** A sharp: two uprights crossed by two rising bars. */
export const Sharp = ({ x, y }: { x: number; y: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    <path d="M-3.2 -9.5v14.2M1.4 -11v14.2" strokeWidth="1.5" stroke="currentColor" fill="none" />
    <path d="M-5.2 -2.6 3.4 -4.6v2.8l-8.6 2zM-5.2 2.9 3.4 .9v2.8l-8.6 2z" />
  </g>
)

/** A flat: an upright with a bowl on its lower right. */
export const Flat = ({ x, y }: { x: number; y: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    <path d="M-2.8 -12.5v17.8" strokeWidth="1.5" stroke="currentColor" fill="none" />
    <path d="M-2.8 -1.4c1.6-1.7 3.2-2.5 4.6-2.5 1.8 0 3 1.3 3 3.3 0 2.4-1.8 4.4-5.6 6.7l-2 1.2zm0 6.7 1.4-.9c2-1.3 3-2.6 3-4.1 0-1.1-.6-1.8-1.5-1.8-.8 0-1.8.6-2.9 1.8z" />
  </g>
)

/** A natural: two uprights joined by two bars. */
export const Natural = ({ x, y }: { x: number; y: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    <path d="M-2.6 -9.5v13.4M2.6 -4.2v13.4" strokeWidth="1.5" stroke="currentColor" fill="none" />
    <path d="M-2.6 -3.4 2.6 -4.6v2.6l-5.2 1.2zM-2.6 1.6 2.6 .4V3l-5.2 1.2z" />
  </g>
)

export function Accidental({ kind, x, y }: { kind: '#' | 'b' | 'n'; x: number; y: number }) {
  if (kind === '#') return <Sharp x={x} y={y} />
  if (kind === 'b') return <Flat x={x} y={y} />
  return <Natural x={x} y={y} />
}

/** How far left of the notehead an accidental sits. */
export const ACCIDENTAL_OFFSET = 11

/**
 * Rests. The whole rest hangs below the second line from the top, the half rest sits
 * on the middle line, and the rest are drawn from the middle of the stave.
 */
export function Rest({ value, x, dotted }: { value: number; x: number; dotted?: boolean }) {
  const dot = dotted ? <circle cx={x + 10} cy={18} r="1.6" /> : null

  if (value >= 4) {
    return (
      <>
        <rect x={x - 6} y={10} width="12" height="5" />
        {dot}
      </>
    )
  }
  if (value >= 2) {
    return (
      <>
        <rect x={x - 6} y={15} width="12" height="5" />
        {dot}
      </>
    )
  }
  if (value >= 1) {
    // The quarter rest's zig-zag.
    return (
      <>
        <path
          transform={`translate(${x}, 0)`}
          d="M-3.4 6.6c2.6 2.8 4.2 4.6 4.2 6.6 0 1.4-.8 2.6-2.4 4 2.4-.8 4-.4 4 1.4 0 1.2-.8 2.4-2.2 3.6l.6.6c2.6-2 3.8-3.8 3.8-5.6 0-1.6-1-2.6-3-2.8 1.8-1.4 2.6-2.6 2.6-3.8 0-1.4-1-2.8-3.2-5L1.6 4.4 3.8 1.6 3 .8-3.4 6.6z"
        />
        {dot}
      </>
    )
  }
  // Eighth and sixteenth rests: a slanted stroke with one or two hooks.
  const hooks = value >= 0.5 ? 1 : 2
  return (
    <g transform={`translate(${x}, 0)`}>
      <path
        d={`M4.6 ${10 + (hooks - 1) * 6}L1 26`}
        stroke="currentColor"
        strokeWidth="1.4"
        fill="none"
      />
      {Array.from({ length: hooks }, (_, i) => {
        const cy = 12 + i * 6
        return (
          <g key={i}>
            <circle cx="1.6" cy={cy} r="2.1" />
            <path
              d={`M1.6 ${cy - 2}c2-1.4 3.6-1.8 5 -1.2`}
              stroke="currentColor"
              strokeWidth="1.3"
              fill="none"
            />
          </g>
        )
      })}
      {dot}
    </g>
  )
}

/**
 * The flag on an eighth or shorter note. It is drawn once for an up-stem — hanging
 * down and to the right of the stem's top — and mirrored for a down-stem, so there is
 * only one piece of path data to get right.
 */
export function Flag({
  x,
  y,
  up,
  count,
}: {
  x: number
  y: number
  up: boolean
  count: number
}) {
  return (
    <g transform={`translate(${x}, ${y})${up ? '' : ' scale(1, -1)'}`}>
      {Array.from({ length: count }, (_, i) => (
        <path
          key={i}
          transform={`translate(0, ${i * 7})`}
          d="M0 0c4.4 3.2 7 6.4 7 10.5c0 2.6-.6 4.4-2 6.2c.4-4.4-1.4-7.4-5-10.2z"
        />
      ))}
    </g>
  )
}

/** Articulation marks above or below the notehead. */
export function Articulation({
  mark,
  x,
  y,
}: {
  mark: 'staccato' | 'accent' | 'tenuto' | 'fermata'
  x: number
  y: number
}) {
  if (mark === 'staccato') return <circle cx={x} cy={y} r="1.7" />
  if (mark === 'tenuto') return <rect x={x - 5} y={y - 0.8} width="10" height="1.6" />
  if (mark === 'accent')
    return (
      <path
        d={`M${x - 6} ${y - 4}L${x + 6} ${y}L${x - 6} ${y + 4}`}
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
      />
    )
  return (
    <g>
      <path
        d={`M${x - 9} ${y + 3}a9 9 0 0 1 18 0`}
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
      />
      <circle cx={x} cy={y} r="1.7" />
    </g>
  )
}
