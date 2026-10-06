/**
 * The musical vocabulary the whole course is written in.
 *
 * Everything sounded — a single note, a scale, a triad, an Alberti bass, a swung
 * groove, two hands playing different rhythms — is one `Phrase`: hits placed on a
 * beat grid. That keeps the content files declarative and gives the audio engine a
 * single thing to schedule.
 */

import { isBlackKey, NOTE_NAMES } from './notes'

/** One sounded event: a note or a chord, placed on the beat grid. */
export interface Hit {
  /** MIDI note, or several for a chord. */
  n: number | number[]
  /** Start, in beats from the phrase's beginning. */
  at: number
  /** Length, in beats. Short values read as staccato. */
  dur?: number
  /** 0–1. This is where dynamics live: p is quiet, f is loud. */
  vel?: number
  /** Which hand plays it — shown in two-hand exercises. */
  hand?: 'L' | 'R'
}

export interface Phrase {
  hits: Hit[]
  /** Beats per minute. */
  tempo?: number
  /** Click track. A number sets the bar length for the accented beat. */
  click?: number | false
  /** Delay every off-beat eighth, turning straight eighths into swung ones. */
  swing?: boolean
  /** Hold every note to the end of the phrase, as the sustain pedal does. */
  pedal?: boolean
}

export const DEFAULT_TEMPO = 96
export const DEFAULT_VELOCITY = 0.7

/** Swung eighths land two thirds of the way through the beat, not halfway. */
export const SWING_OFFSET = 1 / 6

// ── building phrases ────────────────────────────────────────────────────────

interface SeqOptions {
  /** Beats between one note and the next. */
  step?: number
  /** How long each note is held; defaults to filling the step. */
  dur?: number
  tempo?: number
  vel?: number
  hand?: Hit['hand']
}

/** Notes one after another — scales, arpeggios, melodic lines. */
export function seq(notes: number[], options: SeqOptions = {}): Phrase {
  const { step = 0.5, dur, tempo, vel, hand } = options
  return {
    tempo,
    hits: notes.map((n, i) => ({ n, at: i * step, dur: dur ?? step, vel, hand })),
  }
}

interface ChordOptions {
  dur?: number
  tempo?: number
  vel?: number
  hand?: Hit['hand']
}

/** Notes together — triads, sevenths, any block voicing. */
export function chord(notes: number[], options: ChordOptions = {}): Phrase {
  const { dur = 2, tempo, vel, hand } = options
  return { tempo, hits: [{ n: notes, at: 0, dur, vel, hand }] }
}

/** Several chords in a row, each held for `dur` beats — a progression. */
export function progression(voicings: number[][], options: ChordOptions = {}): Phrase {
  const { dur = 2, tempo, vel, hand } = options
  return {
    tempo,
    hits: voicings.map((notes, i) => ({ n: notes, at: i * dur, dur, vel, hand })),
  }
}

/** Play phrases at the same time — typically a left hand under a right hand. */
export function together(...phrases: Phrase[]): Phrase {
  return {
    tempo: phrases.find((p) => p.tempo)?.tempo,
    click: phrases.find((p) => p.click !== undefined)?.click,
    swing: phrases.some((p) => p.swing),
    pedal: phrases.some((p) => p.pedal),
    hits: phrases.flatMap((p) => p.hits),
  }
}

/** Play phrases end to end. */
export function then(...phrases: Phrase[]): Phrase {
  let offset = 0
  const hits: Hit[] = []
  for (const phrase of phrases) {
    for (const hit of phrase.hits) hits.push({ ...hit, at: hit.at + offset })
    offset += phraseLength(phrase)
  }
  return { tempo: phrases[0]?.tempo, hits }
}

/** Repeat a phrase `times` times, back to back. */
export function repeat(phrase: Phrase, times: number): Phrase {
  const span = phraseLength(phrase)
  const hits: Hit[] = []
  for (let i = 0; i < times; i++) {
    for (const hit of phrase.hits) hits.push({ ...hit, at: hit.at + i * span })
  }
  return { ...phrase, hits }
}

/** Move every note by a number of semitones — the transposition lessons use this. */
export function transpose(phrase: Phrase, semitones: number): Phrase {
  return {
    ...phrase,
    hits: phrase.hits.map((hit) => ({
      ...hit,
      n: Array.isArray(hit.n) ? hit.n.map((n) => n + semitones) : hit.n + semitones,
    })),
  }
}

/** Total length in beats, rounded up to a whole beat. */
export function phraseLength(phrase: Phrase): number {
  const end = phrase.hits.reduce((max, h) => Math.max(max, h.at + (h.dur ?? 1)), 0)
  return Math.max(1, Math.ceil(end))
}

/** Every note a phrase touches, low to high — used to frame the keyboard. */
export function phraseNotes(phrase: Phrase): number[] {
  const all = new Set<number>()
  for (const hit of phrase.hits) {
    if (Array.isArray(hit.n)) hit.n.forEach((n) => all.add(n))
    else all.add(hit.n)
  }
  return [...all].sort((a, b) => a - b)
}

// ── dynamics ────────────────────────────────────────────────────────────────

/** The dynamic marks, as velocities. */
export const DYNAMICS = {
  pp: 0.25,
  p: 0.4,
  mp: 0.55,
  mf: 0.7,
  f: 0.85,
  ff: 1,
} as const

export type Dynamic = keyof typeof DYNAMICS

/** Ramp a phrase's velocity from one dynamic to another — a crescendo or a diminuendo. */
export function ramp(phrase: Phrase, from: Dynamic, to: Dynamic): Phrase {
  const sorted = [...phrase.hits].sort((a, b) => a.at - b.at)
  const span = Math.max(1, sorted[sorted.length - 1]?.at ?? 1)
  return {
    ...phrase,
    hits: phrase.hits.map((hit) => ({
      ...hit,
      vel: DYNAMICS[from] + (DYNAMICS[to] - DYNAMICS[from]) * (hit.at / span),
    })),
  }
}

// ── scales, chords and keys ─────────────────────────────────────────────────

/** Step patterns in semitones, from the tonic. */
export const SCALE_STEPS = {
  major: [0, 2, 4, 5, 7, 9, 11, 12],
  naturalMinor: [0, 2, 3, 5, 7, 8, 10, 12],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11, 12],
  melodicMinor: [0, 2, 3, 5, 7, 9, 11, 12],
  majorPentatonic: [0, 2, 4, 7, 9, 12],
  minorPentatonic: [0, 3, 5, 7, 10, 12],
  blues: [0, 3, 5, 6, 7, 10, 12],
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  ionian: [0, 2, 4, 5, 7, 9, 11, 12],
  dorian: [0, 2, 3, 5, 7, 9, 10, 12],
  phrygian: [0, 1, 3, 5, 7, 8, 10, 12],
  lydian: [0, 2, 4, 6, 7, 9, 11, 12],
  mixolydian: [0, 2, 4, 5, 7, 9, 10, 12],
  aeolian: [0, 2, 3, 5, 7, 8, 10, 12],
  locrian: [0, 1, 3, 5, 6, 8, 10, 12],
} as const

export type ScaleName = keyof typeof SCALE_STEPS

export const scale = (root: number, name: ScaleName = 'major'): number[] =>
  SCALE_STEPS[name].map((s) => root + s)

/** Chord shapes in semitones above the root. */
export const CHORD_SHAPES = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  major7: [0, 4, 7, 11],
  minor7: [0, 3, 7, 10],
  dominant7: [0, 4, 7, 10],
  halfDiminished7: [0, 3, 6, 10],
  diminished7: [0, 3, 6, 9],
  minorMajor7: [0, 3, 7, 11],
  add9: [0, 4, 7, 14],
  major9: [0, 4, 7, 11, 14],
  minor9: [0, 3, 7, 10, 14],
  dominant9: [0, 4, 7, 10, 14],
  dominant13: [0, 4, 7, 10, 14, 21],
} as const

export type ChordShape = keyof typeof CHORD_SHAPES

export const triad = (root: number, shape: ChordShape = 'major'): number[] =>
  CHORD_SHAPES[shape].map((s) => root + s)

/**
 * Rotate a voicing upward: the first inversion puts the third on the bottom, the
 * second puts the fifth there.
 */
export function invert(notes: number[], times: number): number[] {
  const voicing = [...notes]
  for (let i = 0; i < times; i++) {
    const lowest = voicing.shift()
    if (lowest === undefined) break
    voicing.push(lowest + 12)
  }
  return voicing
}

/** The diatonic triads of a major key, I through vii°. */
export function diatonicTriads(tonic: number): number[][] {
  const degrees = SCALE_STEPS.major.slice(0, 7).map((s) => tonic + s)
  const pitches = [...degrees, ...degrees.map((d) => d + 12)]
  return degrees.map((_, i) => [pitches[i], pitches[i + 2], pitches[i + 4]])
}

export const ROMAN_NUMERALS_MAJOR = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']
export const ROMAN_NUMERALS_MINOR = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII']

/**
 * The circle of fifths, sharp side first. Each entry is the major key, its relative
 * minor, and how many sharps (positive) or flats (negative) it carries.
 */
export const CIRCLE_OF_FIFTHS = [
  { major: 'C', minor: 'Am', accidentals: 0, tonic: 60 },
  { major: 'G', minor: 'Em', accidentals: 1, tonic: 67 },
  { major: 'D', minor: 'Bm', accidentals: 2, tonic: 62 },
  { major: 'A', minor: 'F♯m', accidentals: 3, tonic: 69 },
  { major: 'E', minor: 'C♯m', accidentals: 4, tonic: 64 },
  { major: 'B', minor: 'G♯m', accidentals: 5, tonic: 71 },
  { major: 'G♭', minor: 'E♭m', accidentals: -6, tonic: 66 },
  { major: 'D♭', minor: 'B♭m', accidentals: -5, tonic: 61 },
  { major: 'A♭', minor: 'Fm', accidentals: -4, tonic: 68 },
  { major: 'E♭', minor: 'Cm', accidentals: -3, tonic: 63 },
  { major: 'B♭', minor: 'Gm', accidentals: -2, tonic: 70 },
  { major: 'F', minor: 'Dm', accidentals: -1, tonic: 65 },
] as const

/** Interval names by semitone count, for ear training and the interval lessons. */
export const INTERVAL_NAMES = [
  'Unison',
  'Minor 2nd',
  'Major 2nd',
  'Minor 3rd',
  'Major 3rd',
  'Perfect 4th',
  'Tritone',
  'Perfect 5th',
  'Minor 6th',
  'Major 6th',
  'Minor 7th',
  'Major 7th',
  'Octave',
]

/** Spell a note the way the written music would, given sharps or flats. */
export function spell(midi: number, useFlats = false): string {
  const FLAT_NAMES = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B']
  const name = useFlats ? FLAT_NAMES[midi % 12] : NOTE_NAMES[midi % 12].replace('#', '♯')
  return name
}

export { isBlackKey }
