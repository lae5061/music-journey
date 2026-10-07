import type { NoteValue, StaffNote, StaffSpec } from '../data/types'
import type { Range } from './keyboard'
import { parsePitch } from './pitch'

/**
 * The sight-reading game: what the three modes share. Levels fix the range of written
 * pitches a round may draw from; the modes decide how those notes are asked.
 */

export type Clef = 'treble' | 'bass'
export type Mode = 'flash' | 'stream' | 'line'

export const MODES: { id: Mode; title: string; hook: string }[] = [
  { id: 'flash', title: 'Flash', hook: 'One note at a time. Play it before the bar runs out.' },
  { id: 'stream', title: 'Stream', hook: 'Notes come to you. Hit each one as it reaches the line.' },
  { id: 'line', title: 'Line', hook: 'Read a whole line to a click, then see where you slipped.' },
]

export const isMode = (text: string): text is Mode => MODES.some((m) => m.id === text)

/**
 * The games ask for a note's name, not its octave: any C answers a written C. So the
 * board is the same three octaves whatever the level, and a typed letter always lands.
 */
export const BOARD: Range = { lowest: 48, highest: 84 }

export const sameNote = (a: number, b: number) => a % 12 === b % 12

/** Every key on the board with this note's name. */
export function sameNameKeys(midi: number): number[] {
  const out: number[] = []
  for (let m = BOARD.lowest; m <= BOARD.highest; m++) if (sameNote(m, midi)) out.push(m)
  return out
}

/** The middle octave's copy of a note, to centre a narrow board on. */
export const middleOctave = (midi: number) => 60 + (midi % 12)

export interface Level {
  id: string
  title: string
  /** Written range per stave, inclusive. A level with both is a grand staff. */
  range: Partial<Record<Clef, [string, string]>>
  accidentals: boolean
  /** Stream's starting pace, in notes per minute. */
  tempo: number
  /** Line's note values. */
  values: NoteValue[]
}

export const LEVELS: Level[] = [
  { id: 'treble', title: 'Treble staff', range: { treble: ['E4', 'F5'] }, accidentals: false, tempo: 40, values: [1, 2] },
  { id: 'treble-ledger', title: 'Treble with ledger lines', range: { treble: ['A3', 'C6'] }, accidentals: false, tempo: 44, values: [1, 2, 0.5] },
  { id: 'bass', title: 'Bass staff', range: { bass: ['G2', 'A3'] }, accidentals: false, tempo: 40, values: [1, 2] },
  { id: 'bass-ledger', title: 'Bass with ledger lines', range: { bass: ['E2', 'C4'] }, accidentals: false, tempo: 44, values: [1, 2, 0.5] },
  { id: 'grand', title: 'Grand staff', range: { treble: ['A3', 'C6'], bass: ['E2', 'C4'] }, accidentals: false, tempo: 48, values: [1, 2, 0.5] },
  { id: 'accidentals', title: 'Sharps and flats', range: { treble: ['C4', 'A5'], bass: ['F2', 'C4'] }, accidentals: true, tempo: 48, values: [1, 2, 0.5] },
  { id: 'everything', title: 'Everything', range: { treble: ['A3', 'C6'], bass: ['E2', 'C4'] }, accidentals: true, tempo: 52, values: [1, 2, 0.5] },
]

export const getLevel = (id: string): Level => LEVELS.find((l) => l.id === id) ?? LEVELS[0]
export const clefsOf = (level: Level): Clef[] => Object.keys(level.range) as Clef[]

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

/** Every natural pitch from one written note to another. */
export function naturalsBetween(low: string, high: string): string[] {
  const from = parsePitch(low).step
  const to = parsePitch(high).step
  const out: string[] = []
  for (let step = from; step <= to; step++) out.push(`${LETTERS[step % 7]}${Math.floor(step / 7)}`)
  return out
}

/** A sharp on anything but E and B, a flat on anything but C and F: the spellings a beginner meets. */
function alteredFrom(naturals: string[]): string[] {
  const out: string[] = []
  for (const p of naturals) {
    const letter = p[0]
    const octave = p.slice(1)
    if (letter !== 'E' && letter !== 'B') out.push(`${letter}#${octave}`)
    if (letter !== 'C' && letter !== 'F') out.push(`${letter}b${octave}`)
  }
  return out
}

export interface Target {
  clef: Clef
  pitch: string
  midi: number
}

const pick = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)]

/** How many of the notes just asked a new one steers clear of, when the level has room. */
const RECENT = 3

/** One note to ask for, not one of the last few — so a five-note level does not seesaw. */
export function randomTarget(level: Level, recent: Target[] = []): Target {
  const size = clefsOf(level).reduce((n, clef) => n + naturalsBetween(...level.range[clef]!).length, 0)
  const avoid = recent.slice(-Math.min(RECENT, Math.max(1, size - 2)))
  for (let tries = 0; tries < 30; tries++) {
    const clef = pick(clefsOf(level))
    const [low, high] = level.range[clef]!
    const naturals = naturalsBetween(low, high)
    const pool = level.accidentals && Math.random() < 0.4 ? alteredFrom(naturals) : naturals
    const pitch = pick(pool)
    if (avoid.some((a) => a.clef === clef && a.pitch === pitch)) continue
    return { clef, pitch, midi: parsePitch(pitch).midi }
  }
  const clef = clefsOf(level)[0]
  const pitch = level.range[clef]![0]
  return { clef, pitch, midi: parsePitch(pitch).midi }
}

/** Every key the level can ask for, so the keyboard can be sized to it. */
export function midisOf(level: Level): number[] {
  const out: number[] = []
  for (const clef of clefsOf(level)) {
    const [low, high] = level.range[clef]!
    for (const p of naturalsBetween(low, high)) out.push(parsePitch(p).midi)
  }
  return out
}

/** A single note on its stave — or on one stave of a grand staff, the other left empty. */
export function targetSpec(level: Level, target: Target): StaffSpec {
  const note: StaffNote = { pitch: target.pitch, value: 4 }
  if (clefsOf(level).length === 1) return { clef: target.clef, notes: [note] }
  return {
    clef: 'grand',
    notes: target.clef === 'treble' ? [note] : [],
    bass: target.clef === 'bass' ? [note] : [],
  }
}

// ── Line: a readable four-bar melody ────────────────────────────────────────

export interface Melody {
  clef: Clef
  notes: StaffNote[]
  tempo: number
}

export const LINE_BARS = 4
export const LINE_TEMPO = 60

/** Bar rhythms, as beats; the ones with eighths only when the level allows them. */
const PLAIN_BARS: NoteValue[][] = [[1, 1, 1, 1], [2, 1, 1], [1, 1, 2], [2, 2], [1, 2, 1]]
const EIGHTH_BARS: NoteValue[][] = [[1, 0.5, 0.5, 1, 1], [0.5, 0.5, 1, 1, 1], [1, 1, 0.5, 0.5, 1], [2, 0.5, 0.5, 1]]
const LAST_BARS: NoteValue[][] = [[2, 2], [1, 1, 2], [4]]

/** How far the line moves between notes: mostly steps, sometimes a third, rarely still. */
const MOVES = [-2, -1, -1, -1, 0, 1, 1, 1, 2]

export function makeMelody(level: Level): Melody {
  const clef = pick(clefsOf(level))
  const [low, high] = level.range[clef]!
  const pool = naturalsBetween(low, high)

  const rhythm: NoteValue[] = []
  const bars = level.values.includes(0.5) ? [...PLAIN_BARS, ...EIGHTH_BARS] : PLAIN_BARS
  for (let b = 0; b < LINE_BARS - 1; b++) rhythm.push(...pick(bars))
  rhythm.push(...pick(LAST_BARS))

  // Start near the middle of the range and wander, never leaving it.
  let index = Math.floor(pool.length / 2) + Math.floor(Math.random() * 3) - 1
  index = Math.max(0, Math.min(pool.length - 1, index))
  const notes: StaffNote[] = rhythm.map((value, i) => {
    if (i > 0) index = Math.max(0, Math.min(pool.length - 1, index + pick(MOVES)))
    let pitch = pool[index]
    let accidental: StaffNote['accidental']
    // A chromatic neighbour now and then, spelled so it reads in C: sharps rising, flats on E and B.
    if (level.accidentals && Math.random() < 0.12) {
      const letter = pitch[0]
      const altered = letter === 'E' || letter === 'B' ? 'b' : '#'
      pitch = `${letter}${altered}${pitch.slice(1)}`
      accidental = altered
    }
    return accidental ? { pitch, value, accidental } : { pitch, value }
  })

  return { clef, notes, tempo: LINE_TEMPO }
}

/** When each note of a melody starts, in beats from the first. */
export function onsetsOf(notes: StaffNote[]): number[] {
  let beat = 0
  return notes.map((n) => {
    const at = beat
    beat += n.value
    return at
  })
}

// ── best scores ─────────────────────────────────────────────────────────────

export interface Bests {
  flash: Record<string, number>
  stream: Record<string, number>
  line: Record<string, number>
  lastLevel?: string
}

const STORAGE_KEY = 'tonic.games.v1'
const EMPTY: Bests = { flash: {}, stream: {}, line: {} }

export function loadBests(): Bests {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const stored = JSON.parse(raw) as Partial<Bests>
    return {
      flash: numbers(stored.flash),
      stream: numbers(stored.stream),
      line: numbers(stored.line),
      lastLevel: typeof stored.lastLevel === 'string' ? stored.lastLevel : undefined,
    }
  } catch {
    return EMPTY
  }
}

function numbers(record: unknown): Record<string, number> {
  if (typeof record !== 'object' || record === null) return {}
  const out: Record<string, number> = {}
  for (const [k, v] of Object.entries(record)) if (typeof v === 'number') out[k] = v
  return out
}

function save(bests: Bests) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bests))
  } catch {
    // A forgotten high score is not worth breaking the game over.
  }
}

/** Record a score if it beats the one kept; returns the best after. */
export function recordBest(mode: Mode, level: string, score: number): number {
  const bests = loadBests()
  const best = Math.max(bests[mode][level] ?? 0, score)
  bests[mode][level] = best
  save(bests)
  return best
}

export function rememberLevel(level: string) {
  save({ ...loadBests(), lastLevel: level })
}
