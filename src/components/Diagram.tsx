import type { DiagramKind } from '../data/types'
import { CIRCLE_OF_FIFTHS } from '../lib/music'
import { isBlackKey, octaveOf } from '../lib/notes'

/**
 * Flat line diagrams for the things a keyboard cannot show: where the Cs fall across
 * 88 keys, how the staves map onto the keyboard, how note values divide, how to sit.
 *
 * They are drawn rather than photographed, which suits the system — no rounded
 * corners, no shading, structure doing the explaining.
 */
export function Diagram({ kind, onPlay }: { kind: DiagramKind; onPlay?: (midi: number) => void }) {
  switch (kind) {
    case 'octave-map':
      return <OctaveMap onPlay={onPlay} />
    case 'circle-of-fifths':
      return <CircleOfFifths onPlay={onPlay} />
    case 'finger-numbers':
      return <FingerNumbers />
    case 'hand-position':
      return <HandPosition />
    case 'posture':
      return <Posture />
    case 'staff-map':
      return <StaffMap />
    case 'note-values':
      return <NoteValues />
    case 'pedal':
      return <Pedals />
  }
}

/**
 * All 88 keys at a glance. Deliberately not playable: at this size the keys are a
 * picture of the instrument's range, and the board below is the one you press.
 */
function OctaveMap({ onPlay }: { onPlay?: (midi: number) => void }) {
  const midis: number[] = []
  for (let m = 21; m <= 108; m++) midis.push(m)
  const whites = midis.filter((m) => !isBlackKey(m))
  const w = 100 / whites.length

  return (
    <figure className="diagram">
      <div className="octave-map">
        <div className="octave-map-keys">
          {whites.map((midi, i) => (
            <span
              key={midi}
              className={`omk omk-white${midi === 60 ? ' is-middle' : ''}`}
              style={{ left: `${i * w}%`, width: `${w}%` }}
            />
          ))}
          {midis
            .filter(isBlackKey)
            .map((midi) => {
              const next = whites.findIndex((x) => x > midi)
              if (next === -1) return null
              return (
                <span
                  key={midi}
                  className="omk omk-black"
                  style={{ left: `${next * w - w * 0.3}%`, width: `${w * 0.6}%` }}
                />
              )
            })}
        </div>
        <div className="octave-map-labels">
          {whites
            .map((midi, i) => ({ midi, i }))
            .filter(({ midi }) => midi % 12 === 0)
            .map(({ midi, i }) => (
              <button
                key={midi}
                type="button"
                className={`octave-map-label${midi === 60 ? ' is-middle' : ''}`}
                style={{ left: `${i * w + w / 2}%` }}
                onClick={() => onPlay?.(midi)}
              >
                C{octaveOf(midi)}
              </button>
            ))}
        </div>
      </div>
      <figcaption>
        Eighty-eight keys, A0 to C8. The eight Cs are marked; middle C is the fourth from
        the left.
      </figcaption>
    </figure>
  )
}

/** The twelve keys as a clock face: one step clockwise adds a sharp, one anticlockwise adds a flat. */
function CircleOfFifths({ onPlay }: { onPlay?: (midi: number) => void }) {
  const size = 300
  const centre = size / 2
  const outer = 128
  const inner = 88

  return (
    <figure className="diagram">
      <svg className="circle-of-fifths" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="The circle of fifths">
        <circle cx={centre} cy={centre} r={outer} className="cof-ring" />
        <circle cx={centre} cy={centre} r={inner} className="cof-ring" />
        <circle cx={centre} cy={centre} r={inner - 40} className="cof-ring" />

        {CIRCLE_OF_FIFTHS.map((entry, i) => {
          const angle = (i / 12) * Math.PI * 2 - Math.PI / 2
          const spoke = ((i - 0.5) / 12) * Math.PI * 2 - Math.PI / 2
          const at = (r: number) => ({
            x: centre + Math.cos(angle) * r,
            y: centre + Math.sin(angle) * r,
          })
          const major = at((outer + inner) / 2)
          const minor = at(inner - 20)
          const accidentals =
            entry.accidentals === 0
              ? '—'
              : entry.accidentals > 0
                ? `${entry.accidentals}♯`
                : `${-entry.accidentals}♭`

          return (
            <g key={entry.major}>
              <line
                x1={centre + Math.cos(spoke) * (inner - 40)}
                y1={centre + Math.sin(spoke) * (inner - 40)}
                x2={centre + Math.cos(spoke) * outer}
                y2={centre + Math.sin(spoke) * outer}
                className="cof-spoke"
              />
              <text
                className="cof-major"
                x={major.x}
                y={major.y - 3}
                textAnchor="middle"
                onClick={() => onPlay?.(entry.tonic)}
              >
                {entry.major}
              </text>
              <text className="cof-count" x={major.x} y={major.y + 10} textAnchor="middle">
                {accidentals}
              </text>
              <text className="cof-minor" x={minor.x} y={minor.y + 4} textAnchor="middle">
                {entry.minor}
              </text>
            </g>
          )
        })}
        <text className="cof-centre" x={centre} y={centre - 4} textAnchor="middle">
          Fifths
        </text>
        <text className="cof-centre-sub" x={centre} y={centre + 12} textAnchor="middle">
          clockwise
        </text>
      </svg>
      <figcaption>
        Each step clockwise is a fifth up and one more sharp; each step the other way is one
        more flat. The inner ring is the relative minor of the key outside it.
      </figcaption>
    </figure>
  )
}

const FINGERS = [1, 2, 3, 4, 5]
/** Finger lengths, thumb to little finger. */
const FINGER_LENGTH = [26, 46, 52, 46, 34]

function Hand({ side, x }: { side: 'L' | 'R'; x: number }) {
  const flip = side === 'L' ? -1 : 1
  return (
    <g transform={`translate(${x}, 0) scale(${flip}, 1)`}>
      <rect x={-34} y={58} width={68} height={46} className="hand-palm" />
      {FINGERS.map((finger, i) => {
        // The thumb sits out to the side; the others stand in a row.
        const thumb = i === 0
        const fx = thumb ? -46 : -30 + (i - 1) * 21
        const fy = thumb ? 74 : 58 - FINGER_LENGTH[i]
        const w = thumb ? 22 : 17
        const h = thumb ? 26 : FINGER_LENGTH[i]
        return (
          <g key={finger}>
            <rect x={fx} y={fy} width={w} height={h} className="hand-finger" />
            <g transform={`scale(${flip}, 1)`}>
              <circle cx={flip * (fx + w / 2)} cy={fy + (thumb ? 13 : 14)} r="10" className="hand-dot" />
              <text className="hand-num" x={flip * (fx + w / 2)} y={fy + (thumb ? 17 : 18)} textAnchor="middle">
                {finger}
              </text>
            </g>
          </g>
        )
      })}
      <g transform={`scale(${flip}, 1)`}>
        <text className="hand-label" x={0} y={122} textAnchor="middle">
          {side === 'L' ? 'Left' : 'Right'}
        </text>
      </g>
    </g>
  )
}

function FingerNumbers() {
  return (
    <figure className="diagram">
      <svg className="hands" viewBox="0 0 400 140" role="img" aria-label="Finger numbers on both hands">
        <Hand side="L" x={110} />
        <Hand side="R" x={290} />
      </svg>
      <figcaption>
        Both hands number the same way, thumb to little finger. The mirror image means the
        thumbs face each other at the middle of the keyboard.
      </figcaption>
    </figure>
  )
}

/** The five-finger position: fingers 1–5 standing on C D E F G. */
function HandPosition() {
  const labels = ['1', '2', '3', '4', '5']
  return (
    <figure className="diagram">
      <svg className="hand-position" viewBox="0 0 320 170" role="img" aria-label="Right hand in C position">
        {labels.map((n, i) => (
          <g key={n}>
            <rect x={20 + i * 56} y={90} width="54" height="70" className="hp-key" />
            <text className="hp-note" x={47 + i * 56} y={150} textAnchor="middle">
              {['C', 'D', 'E', 'F', 'G'][i]}
            </text>
            <line x1={47 + i * 56} y1={60} x2={47 + i * 56} y2={88} className="hp-drop" />
            <circle cx={47 + i * 56} cy={46} r="16" className="hp-dot" />
            <text className="hp-num" x={47 + i * 56} y={52} textAnchor="middle">
              {n}
            </text>
          </g>
        ))}
        <path d="M20 26c60-18 220-18 280 0" className="hp-arch" />
        <text className="hp-caption" x={160} y={16} textAnchor="middle">
          Knuckles up, fingers curved
        </text>
      </svg>
      <figcaption>
        C position: the right thumb on middle C, then one finger per white key up to G.
      </figcaption>
    </figure>
  )
}

function Posture() {
  return (
    <figure className="diagram">
      <svg className="posture" viewBox="0 0 340 200" role="img" aria-label="Sitting position at the keyboard">
        {/* keyboard and stand */}
        <rect x={12} y={104} width={120} height="10" className="pos-solid" />
        <line x1={40} y1={114} x2={40} y2={186} className="pos-line" />
        <line x1={110} y1={114} x2={110} y2={186} className="pos-line" />
        {/* bench */}
        <rect x={214} y={126} width={96} height="8" className="pos-solid" />
        <line x1={230} y1={134} x2={230} y2={186} className="pos-line" />
        <line x1={294} y1={134} x2={294} y2={186} className="pos-line" />
        {/* floor */}
        <line x1={0} y1={186} x2={340} y2={186} className="pos-rule" />
        {/* player */}
        <circle cx={246} cy={44} r="16" className="pos-solid" />
        <path d="M246 60v56" className="pos-body" />
        <path d="M246 70L138 104" className="pos-body" />
        <path d="M138 104h-12" className="pos-body" />
        <path d="M246 116h-38v46" className="pos-body" />
        <path d="M208 162h-26" className="pos-body" />
        {/* angle marks */}
        <path d="M228 104a22 22 0 0 0 14 12" className="pos-angle" />
        <text className="pos-note" x={196} y={96}>
          elbows level with the keys
        </text>
        <text className="pos-note" x={150} y={176}>
          feet flat
        </text>
        <text className="pos-note" x={252} y={26}>
          shoulders down
        </text>
      </svg>
      <figcaption>
        Sit forward on the bench, far enough back that the elbows fall just in front of the
        body and the forearms run level into the keys.
      </figcaption>
    </figure>
  )
}

const TREBLE_LINES = ['E', 'G', 'B', 'D', 'F']
const TREBLE_SPACES = ['F', 'A', 'C', 'E']
const BASS_LINES = ['G', 'B', 'D', 'F', 'A']
const BASS_SPACES = ['A', 'C', 'E', 'G']

function StaffMap() {
  const row = (label: string, notes: string[], mnemonic: string) => (
    <div className="staff-map-row" key={label}>
      <h6 className="kicker">{label}</h6>
      <div className="staff-map-notes">
        {notes.map((n, i) => (
          <span key={i} className="staff-map-note">
            {n}
          </span>
        ))}
      </div>
      <p>{mnemonic}</p>
    </div>
  )

  return (
    <figure className="diagram staff-map">
      {row('Treble lines', TREBLE_LINES, 'Every Good Boy Deserves Fruit — bottom line up.')}
      {row('Treble spaces', TREBLE_SPACES, 'They spell FACE, bottom space up.')}
      {row('Bass lines', BASS_LINES, 'Good Boys Deserve Fruit Always.')}
      {row('Bass spaces', BASS_SPACES, 'All Cows Eat Grass.')}
    </figure>
  )
}

const VALUE_ROWS = [
  { label: 'Whole', count: 1, beats: '4 beats' },
  { label: 'Half', count: 2, beats: '2 beats each' },
  { label: 'Quarter', count: 4, beats: '1 beat each' },
  { label: 'Eighth', count: 8, beats: '½ beat each' },
  { label: 'Sixteenth', count: 16, beats: '¼ beat each' },
]

/** The halving tree: one whole note is two halves is four quarters, and so on. */
function NoteValues() {
  return (
    <figure className="diagram note-values">
      {VALUE_ROWS.map((row) => (
        <div className="note-value-row" key={row.label}>
          <span className="note-value-name">{row.label}</span>
          <div className="note-value-bar">
            {Array.from({ length: row.count }, (_, i) => (
              <span key={i} className="note-value-cell" />
            ))}
          </div>
          <span className="note-value-beats">{row.beats}</span>
        </div>
      ))}
      <figcaption>
        Each row is one bar of 4/4. Every value is exactly half the one above it — which is
        why the arithmetic of rhythm always works out.
      </figcaption>
    </figure>
  )
}

function Pedals() {
  const pedals = [
    { name: 'Una corda', role: 'Softens and thins the tone.' },
    { name: 'Sostenuto', role: 'Holds only the notes already down.' },
    { name: 'Sustain', role: 'Lifts the dampers — everything rings on.' },
  ]
  return (
    <figure className="diagram pedals">
      {pedals.map((pedal, i) => (
        <div className={`pedal${i === 2 ? ' is-primary' : ''}`} key={pedal.name}>
          <span className="pedal-shape" />
          <h6 className="kicker">{pedal.name}</h6>
          <p>{pedal.role}</p>
        </div>
      ))}
      <figcaption>
        Three pedals, right to left. The right one — sustain — is the one that matters first;
        many uprights have only two.
      </figcaption>
    </figure>
  )
}
