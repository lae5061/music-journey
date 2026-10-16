/**
 * What the score editor edits. Not ABC: a small model that serializes to ABC, so that
 * every edit is a plain data change and undo is a snapshot. Bar lines are not stored;
 * they fall out of the time signature when the score is written out.
 */

export type BarType = 'plain' | 'double' | 'final' | 'repeatStart' | 'repeatEnd'
/** In beats: whole, half, quarter, eighth. A dot makes it half as long again. */
export type Length = 4 | 2 | 1 | 0.5
export type Alter = -1 | 0 | 1
export type Clef = 'treble' | 'bass'

export interface Pitch {
  /** Diatonic step from middle C: C4 = 0, D4 = 1, B3 = −1, C5 = 7. Same scale abcjs uses. */
  step: number
  alter: Alter
  /** Print the accidental even where the key or the bar already implies it (a courtesy natural). */
  explicit?: boolean
}

export interface Rest {
  kind: 'rest'
  length: Length
  dotted?: boolean
  decorations: string[]
}

export interface Note {
  kind: 'note'
  pitches: Pitch[]
  length: Length
  dotted?: boolean
  tie?: boolean
  slurStart?: boolean
  slurEnd?: boolean
  decorations: string[]
}

export type ScoreEvent = Note | Rest

export interface Voice {
  clef: Clef
  events: ScoreEvent[]
}

export interface Score {
  title: string
  composer: string
  bpm: number
  /** Sharps positive, flats negative, −4 … 4. */
  key: number
  meter: [number, number]
  hands: 1 | 2
  voices: Voice[]
  /** The bar line after bar i; −1 is a leading repeat. Anything missing is plain. */
  bars: Record<number, BarType>
}

export const LENGTHS: { value: Length; title: string; short: string }[] = [
  { value: 4, title: 'Whole', short: '1' },
  { value: 2, title: 'Half', short: '2' },
  { value: 1, title: 'Quarter', short: '4' },
  { value: 0.5, title: 'Eighth', short: '8' },
]

/** Index by key + 4. */
export const KEY_NAMES = ['Ab', 'Eb', 'Bb', 'F', 'C', 'G', 'D', 'A', 'E'] as const
export const KEY_TITLES = ['A♭ major', 'E♭ major', 'B♭ major', 'F major', 'C major', 'G major', 'D major', 'A major', 'E major'] as const
export const METERS: [number, number][] = [
  [4, 4],
  [3, 4],
  [2, 4],
  [6, 8],
]

export const DYNAMICS = ['p', 'mp', 'mf', 'f'] as const
export const FINGERS = ['1', '2', '3', '4', '5'] as const
export const BAR_TYPES: { value: BarType; title: string; mark: string }[] = [
  { value: 'plain', title: 'Bar line', mark: '|' },
  { value: 'double', title: 'Double bar', mark: '||' },
  { value: 'final', title: 'Final bar', mark: '|]' },
  { value: 'repeatStart', title: 'Repeat from here', mark: '|:' },
  { value: 'repeatEnd', title: 'Repeat back', mark: ':|' },
]

export const LETTERS = 'CDEFGAB'
const SHARP_ORDER = 'FCGDAEB'
const FLAT_ORDER = 'BEADGCF'

export const mod = (n: number, m: number) => ((n % m) + m) % m
export const letterOf = (step: number) => LETTERS[mod(step, 7)]
/** 0 is the octave from middle C; −1 the one below. */
export const octaveOf = (step: number) => Math.floor(step / 7)

/** What the key signature does to a letter. */
export function keyAlter(key: number, letter: string): Alter {
  if (key > 0) return SHARP_ORDER.slice(0, key).includes(letter) ? 1 : 0
  if (key < 0) return FLAT_ORDER.slice(0, -key).includes(letter) ? -1 : 0
  return 0
}

export const beats = (e: { length: Length; dotted?: boolean }) => e.length * (e.dotted ? 1.5 : 1)
export const barBeats = ([n, d]: [number, number]) => (n * 4) / d
export const totalBeats = (events: ScoreEvent[]) => events.reduce((sum, e) => sum + beats(e), 0)

/** Beats from the start of the voice to the start of events[index]. */
export const startBeat = (events: ScoreEvent[], index: number) => totalBeats(events.slice(0, index))

export const barCount = (score: Score) =>
  Math.max(1, ...score.voices.map((v) => Math.ceil(totalBeats(v.events) / barBeats(score.meter))))

export function emptyScore(hands: 1 | 2 = 2): Score {
  const voices: Voice[] = [{ clef: 'treble', events: [] }]
  if (hands === 2) voices.push({ clef: 'bass', events: [] })
  return { title: 'Untitled', composer: '', bpm: 100, key: 0, meter: [4, 4], hands, voices, bars: {} }
}

export const DEFAULT_DECORATIONS: string[] = []
