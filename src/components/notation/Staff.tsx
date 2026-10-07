import { Fragment } from 'react'
import type { StaffNote, StaffSpec } from '../../data/types'
import { parsePitch } from '../../lib/pitch'
import {
  ACCIDENTAL_OFFSET,
  Accidental,
  Articulation,
  BassClef,
  CLEF_ANCHOR,
  CLEF_WIDTH,
  Flag,
  Rest,
  TrebleClef,
} from './glyphs'

/**
 * A staff renderer, drawn from the same note values the audio engine plays, so what
 * a lesson shows and what it sounds cannot drift apart.
 *
 * The drawing space puts the five lines at y = 0…40, with a grand staff's lower
 * stave offset by `GRAND_GAP`. Everything else is measured from there.
 */

const LINE_GAP = 10
const STAFF_HEIGHT = 40
const GRAND_GAP = 72
/** One diatonic step is half a line gap. */
const STEP_Y = LINE_GAP / 2
const STEM_LENGTH = 30
const NOTEHEAD_RX = 6.3
const LEDGER_HALF_WIDTH = 11

const SHARP_ORDER = ['F', 'C', 'G', 'D', 'A', 'E', 'B']
const FLAT_ORDER = ['B', 'E', 'A', 'D', 'G', 'C', 'F']

/** Where each key-signature accidental sits, as a diatonic step, per clef. */
const KEY_STEPS = {
  treble: { sharps: [38, 35, 39, 36, 33, 37, 34], flats: [34, 37, 33, 36, 32, 35, 31] },
  bass: { sharps: [24, 21, 25, 22, 19, 23, 20], flats: [20, 23, 19, 22, 18, 21, 17] },
} as const

type Clef = 'treble' | 'bass'

const noteWidth = (note: StaffNote) =>
  20 + 16 * note.value + (isDotted(note.value) ? 8 : 0) + (note.accidental ? 11 : 0)

/** 1.5, 3 and 0.75 are the dotted values — half again as long as the plain one. */
const isDotted = (value: number) => value === 3 || value === 1.5 || value === 0.75

const yForStep = (step: number, clef: Clef) => STAFF_HEIGHT - (step - CLEF_ANCHOR[clef]) * STEP_Y

interface Placed {
  note: StaffNote
  beat: number
  x: number
  clef: Clef
  offsetY: number
}

export function Staff({
  spec,
  caption,
  scale = 1.5,
}: {
  spec: StaffSpec
  caption?: string
  /** Screen pixels per drawing unit at most; the staff never grows past this. */
  scale?: number
}) {
  const grand = spec.clef === 'grand'
  const beatsPerBar = spec.time?.[0] ?? 4

  const upper: Clef = spec.clef === 'grand' ? 'treble' : spec.clef
  const voices: { notes: StaffNote[]; clef: Clef; offsetY: number }[] = [
    { notes: spec.notes, clef: upper, offsetY: 0 },
  ]
  if (grand && spec.bass) voices.push({ notes: spec.bass, clef: 'bass', offsetY: GRAND_GAP })

  // ── horizontal layout ─────────────────────────────────────────────────────
  // Every voice shares one timeline, so a grand staff's hands line up vertically.
  const onsets = new Map<number, number>() // beat -> widest note starting there
  for (const voice of voices) {
    let beat = 0
    for (const note of voice.notes) {
      onsets.set(beat, Math.max(onsets.get(beat) ?? 0, noteWidth(note)))
      beat += note.value
    }
  }

  const keyCount = Math.abs(spec.key ?? 0)
  let cursor = 8 + CLEF_WIDTH[upper] + 6 + keyCount * 9 + (spec.time ? 26 : 0)

  const xOfBeat = new Map<number, number>()
  const barlines: number[] = []
  const sortedBeats = [...onsets.keys()].sort((a, b) => a - b)
  for (const beat of sortedBeats) {
    // A new bar gets a line before the note that opens it.
    if (beat > 0 && beat % beatsPerBar === 0) {
      barlines.push(cursor + 2)
      cursor += 10
    }
    xOfBeat.set(beat, cursor + onsets.get(beat)! / 2)
    cursor += onsets.get(beat)!
  }
  const totalBeats = Math.max(
    ...voices.map((v) => v.notes.reduce((sum, n) => sum + n.value, 0)),
    beatsPerBar,
  )
  const endX = cursor + 6

  const placed: Placed[] = []
  for (const voice of voices) {
    let beat = 0
    for (const note of voice.notes) {
      placed.push({
        note,
        beat,
        x: xOfBeat.get(beat) ?? cursor,
        clef: voice.clef,
        offsetY: voice.offsetY,
      })
      beat += note.value
    }
  }

  // ── vertical extent ───────────────────────────────────────────────────────
  const staveBottom = grand ? GRAND_GAP + STAFF_HEIGHT : STAFF_HEIGHT
  // The treble clef itself reaches well above and below its stave, so the margin
  // starts wide enough for it even when no note does.
  let top = -22
  let bottom = staveBottom + 20
  for (const p of placed) {
    if (p.note.rest || !p.note.pitch) continue
    const y = yForStep(parsePitch(p.note.pitch).step, p.clef) + p.offsetY
    top = Math.min(top, y - STEM_LENGTH - 14)
    bottom = Math.max(bottom, y + STEM_LENGTH + 14)
  }
  if (spec.counts) bottom += 22
  if (spec.dynamic) bottom += 18
  if (spec.pedal) bottom += 20

  const viewHeight = bottom - top

  return (
    <figure className="staff-figure">
      <svg
        className="staff"
        viewBox={`0 ${top} ${endX} ${viewHeight}`}
        style={{ maxWidth: `${Math.round(endX * scale)}px` }}
        role="img"
        aria-label={caption ?? 'Music notation'}
        fill="currentColor"
      >
        {voices.map((voice) => (
          <StaveLines key={voice.offsetY} offsetY={voice.offsetY} endX={endX} />
        ))}

        {grand && (
          <>
            <path
              d={`M4 0v${GRAND_GAP + STAFF_HEIGHT}`}
              stroke="currentColor"
              strokeWidth="2.4"
              fill="none"
            />
            <path
              d={`M8 0C0 14 0 24 6 ${(GRAND_GAP + STAFF_HEIGHT) / 2}C0 ${(GRAND_GAP + STAFF_HEIGHT) / 2 + 10} 0 ${GRAND_GAP + STAFF_HEIGHT - 14} 8 ${GRAND_GAP + STAFF_HEIGHT}`}
              stroke="currentColor"
              strokeWidth="1.6"
              fill="none"
            />
          </>
        )}

        {voices.map((voice) => (
          <g key={`clef-${voice.offsetY}`} transform={`translate(0, ${voice.offsetY})`}>
            {voice.clef === 'treble' ? <TrebleClef x={8} /> : <BassClef x={10} />}
            <KeySignature clef={voice.clef} count={spec.key ?? 0} x={8 + CLEF_WIDTH[voice.clef] + 6} />
            {spec.time && (
              <TimeSignature
                time={spec.time}
                x={8 + CLEF_WIDTH[voice.clef] + 6 + keyCount * 9 + 10}
              />
            )}
          </g>
        ))}

        {barlines.map((x) => (
          <rect key={x} x={x} y={0} width="1.4" height={staveBottom} />
        ))}
        {/* Final double bar. */}
        <rect x={endX - 7} y={0} width="1.4" height={staveBottom} />
        <rect x={endX - 4} y={0} width="3" height={staveBottom} />

        {placed.map((p, i) => (
          <Note key={i} placed={p} next={placed[i + 1]} />
        ))}

        {spec.counts && <Counts placed={placed} y={staveBottom + 26} />}
        {spec.dynamic && (
          <text className="staff-dynamic" x={xOfBeat.get(0) ?? 40} y={staveBottom + 16}>
            {spec.dynamic}
          </text>
        )}
        {spec.pedal && <PedalLine from={xOfBeat.get(0) ?? 40} to={endX - 10} y={bottom - 10} />}
        <TripletBrackets placed={placed} />
      </svg>
      {caption && <figcaption>{caption}</figcaption>}
      <span className="sr-only">
        {describeStaff(spec, totalBeats, beatsPerBar)}
      </span>
    </figure>
  )
}

function StaveLines({ offsetY, endX }: { offsetY: number; endX: number }) {
  return (
    <g transform={`translate(0, ${offsetY})`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={4} y={i * LINE_GAP} width={endX - 8} height="1.1" />
      ))}
    </g>
  )
}

function KeySignature({ clef, count, x }: { clef: Clef; count: number; x: number }) {
  if (count === 0) return null
  const sharps = count > 0
  const letters = (sharps ? SHARP_ORDER : FLAT_ORDER).slice(0, Math.abs(count))
  const steps = sharps ? KEY_STEPS[clef].sharps : KEY_STEPS[clef].flats
  return (
    <>
      {letters.map((letter, i) => (
        <Accidental
          key={letter}
          kind={sharps ? '#' : 'b'}
          x={x + i * 9 + 4}
          y={yForStep(steps[i], clef)}
        />
      ))}
    </>
  )
}

function TimeSignature({ time, x }: { time: [number, number]; x: number }) {
  return (
    <>
      {/* Centred in the upper and lower halves of the stave, as engraved. */}
      <text className="staff-time" x={x} y={LINE_GAP + 5.5} textAnchor="middle">
        {time[0]}
      </text>
      <text className="staff-time" x={x} y={LINE_GAP * 3 + 5.5} textAnchor="middle">
        {time[1]}
      </text>
    </>
  )
}

function Note({ placed, next }: { placed: Placed; next?: Placed }) {
  const { note, x, clef, offsetY } = placed

  if (note.rest || !note.pitch) {
    return (
      <g transform={`translate(0, ${offsetY})`}>
        <Rest value={note.value} x={x} dotted={isDotted(note.value)} />
      </g>
    )
  }

  const pitch = parsePitch(note.pitch)
  const y = yForStep(pitch.step, clef)
  const stemUp = y > LINE_GAP * 2
  const hollow = note.value >= 2
  const stemless = note.value >= 4
  const flags = note.value <= 0.25 ? 2 : note.value <= 0.5 ? 1 : 0

  const stemX = stemUp ? x + NOTEHEAD_RX - 0.6 : x - NOTEHEAD_RX + 0.6
  const stemEnd = stemUp ? y - STEM_LENGTH : y + STEM_LENGTH

  const accidental = note.accidental ?? (pitch.alter > 0 ? '#' : pitch.alter < 0 ? 'b' : undefined)

  return (
    <g transform={`translate(0, ${offsetY})`} className={note.className} data-pitch={note.pitch}>
      <LedgerLines x={x} y={y} />
      {accidental && <Accidental kind={accidental} x={x - ACCIDENTAL_OFFSET} y={y} />}

      <ellipse
        cx={x}
        cy={y}
        rx={stemless ? 7.4 : NOTEHEAD_RX}
        ry="4.7"
        transform={`rotate(-20 ${x} ${y})`}
      />
      {hollow && (
        <ellipse
          className="notehead-hole"
          cx={x}
          cy={y}
          rx={stemless ? 4.4 : 3.3}
          ry="2.4"
          transform={`rotate(-20 ${x} ${y})`}
        />
      )}

      {!stemless && <rect x={stemX - 0.7} y={Math.min(y, stemEnd)} width="1.4" height={STEM_LENGTH} />}
      {flags > 0 && <Flag x={stemX} y={stemEnd} up={stemUp} count={flags} />}

      {isDotted(note.value) && <circle cx={x + 11} cy={y % LINE_GAP === 0 ? y - 5 : y} r="1.7" />}

      {note.mark && (
        <Articulation mark={note.mark} x={x} y={stemUp ? y + 11 : y - 11} />
      )}
      {note.finger !== undefined && (
        <text className="staff-finger" x={x} y={y - (stemUp ? 16 : -22)} textAnchor="middle">
          {note.finger}
        </text>
      )}
      {note.tie && next?.note.pitch && (
        <path
          d={`M${x + 8} ${y + 7}Q${(x + next.x) / 2} ${y + 15} ${next.x - 8} ${y + 7}`}
          stroke="currentColor"
          strokeWidth="1.3"
          fill="none"
        />
      )}
    </g>
  )
}

function LedgerLines({ x, y }: { x: number; y: number }) {
  const lines: number[] = []
  for (let ly = -LINE_GAP; ly >= y; ly -= LINE_GAP) lines.push(ly)
  for (let ly = STAFF_HEIGHT + LINE_GAP; ly <= y; ly += LINE_GAP) lines.push(ly)
  return (
    <>
      {lines.map((ly) => (
        <rect key={ly} x={x - LEDGER_HALF_WIDTH} y={ly} width={LEDGER_HALF_WIDTH * 2} height="1.1" />
      ))}
    </>
  )
}

/** The counting row — "1 & 2 &" — printed under the notes it belongs to. */
function Counts({ placed, y }: { placed: Placed[]; y: number }) {
  const top = placed.filter((p) => p.offsetY === 0)
  return (
    <>
      {top.map((p, i) =>
        p.note.count ? (
          <text key={i} className="staff-count" x={p.x} y={y} textAnchor="middle">
            {p.note.count}
          </text>
        ) : null,
      )}
    </>
  )
}

function PedalLine({ from, to, y }: { from: number; to: number; y: number }) {
  return (
    <g className="staff-pedal">
      <path
        d={`M${from} ${y - 8}v8h${to - from}v-8`}
        stroke="currentColor"
        strokeWidth="1.3"
        fill="none"
      />
      <text className="staff-count" x={from} y={y - 11}>
        ped.
      </text>
    </g>
  )
}

function TripletBrackets({ placed }: { placed: Placed[] }) {
  const groups: Placed[][] = []
  let run: Placed[] = []
  for (const p of placed) {
    if (p.note.triplet) run.push(p)
    else if (run.length) {
      groups.push(run)
      run = []
    }
  }
  if (run.length) groups.push(run)

  return (
    <>
      {groups.map((group, i) => {
        const from = group[0].x
        const to = group[group.length - 1].x
        const y = -12 + group[0].offsetY
        return (
          <Fragment key={i}>
            <path
              d={`M${from - 6} ${y + 5}v-5h${to - from + 12}v5`}
              stroke="currentColor"
              strokeWidth="1.2"
              fill="none"
            />
            <text className="staff-count" x={(from + to) / 2} y={y - 2} textAnchor="middle">
              3
            </text>
          </Fragment>
        )
      })}
    </>
  )
}

/** What a screen reader gets instead of the picture. */
function describeStaff(spec: StaffSpec, beats: number, beatsPerBar: number): string {
  const names = spec.notes
    .map((n) => (n.rest ? `${valueName(n.value)} rest` : `${n.pitch} ${valueName(n.value)}`))
    .join(', ')
  const time = spec.time ? `${spec.time[0]}/${spec.time[1]} time. ` : ''
  return `${spec.clef} clef. ${time}${Math.ceil(beats / beatsPerBar)} bars: ${names}.`
}

function valueName(value: number): string {
  const names: Record<number, string> = {
    4: 'whole note',
    3: 'dotted half note',
    2: 'half note',
    1.5: 'dotted quarter note',
    1: 'quarter note',
    0.75: 'dotted eighth note',
    0.5: 'eighth note',
    0.25: 'sixteenth note',
  }
  return names[value] ?? `${value}-beat note`
}
