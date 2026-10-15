import type { Phrase } from '../lib/music'

/**
 * The shape of the course. A step is one screen: some copy, a definition, and
 * whatever combination of keyboard, notation, chart, diagram or exercise makes the
 * idea concrete.
 */

// ── notation ────────────────────────────────────────────────────────────────

/** Durations in beats, so they line up with the phrase model. */
export type NoteValue = 4 | 3 | 2 | 1.5 | 1 | 0.75 | 0.5 | 0.25

export interface StaffNote {
  /** Written pitch, e.g. "C4", "F#3", "Bb5". Ignored when `rest` is set. */
  pitch?: string
  /** Length in beats: 4 whole, 2 half, 1 quarter, 0.5 eighth, 0.25 sixteenth. */
  value: NoteValue
  rest?: boolean
  /** Force an accidental even where the key signature implies it. */
  accidental?: '#' | 'b' | 'n'
  /** Tie into the next note. */
  tie?: boolean
  /** Part of a triplet bracket. */
  triplet?: boolean
  /** Counting syllable printed under the note: "1", "&", "2 e & a". */
  count?: string
  /** A class on the note's group, for colouring it after the fact. */
  className?: string
  /** Fingering number printed above the note. */
  finger?: number
  /** Articulation mark. */
  mark?: 'staccato' | 'accent' | 'tenuto' | 'fermata'
}

export interface StaffSpec {
  clef: 'treble' | 'bass' | 'grand'
  /** Beats per bar and the note value that gets the beat, e.g. [4, 4] or [6, 8]. */
  time?: [number, number]
  /** Sharps as a positive count, flats as negative. */
  key?: number
  /** The upper (or only) stave. */
  notes: StaffNote[]
  /** The lower stave of a grand staff. */
  bass?: StaffNote[]
  /** Print the counting row underneath. */
  counts?: boolean
  /** A dynamic or expression mark under the first bar. */
  dynamic?: string
  /** Draw a pedal line under the stave. */
  pedal?: boolean
}

// ── lead sheets ─────────────────────────────────────────────────────────────

export interface ChartBar {
  /** One or two chord symbols per bar. */
  chords: string[]
  lyric?: string
  /** Mark a section start: "A", "Chorus", "Turnaround". */
  section?: string
}

export interface ChartSpec {
  title?: string
  key: string
  time?: [number, number]
  tempo?: string
  bars: ChartBar[]
  /** Roman-numeral analysis printed under each bar. */
  analysis?: string[]
}

// ── diagrams ────────────────────────────────────────────────────────────────

export type DiagramKind =
  | 'octave-map'
  | 'circle-of-fifths'
  | 'finger-numbers'
  | 'hand-position'
  | 'posture'
  | 'staff-map'
  | 'note-values'
  | 'pedal'

// ── exercises ───────────────────────────────────────────────────────────────

export interface Question {
  /** What the learner hears. Omit for a reading question. */
  phrase?: Phrase
  /** Shown instead of a phrase — a chord symbol, a bit of notation to name. */
  shown?: string
  answer: string
}

export interface QuizSpec {
  prompt: string
  /** Every option shown as a button; the bank is drawn from these answers. */
  options: string[]
  questions: Question[]
  /** How many to get right before the exercise is passed. */
  target?: number
  /** Label for the replay button. */
  replayLabel?: string
}

// ── steps and lessons ───────────────────────────────────────────────────────

export interface Step {
  title: string
  text: string
  definition: string
  /** The line above the keyboard telling the learner what to do. */
  hint: string
  /** Notes the keyboard tints. */
  highlight?: number[]
  /** Labels drawn on highlighted keys: fingering, degrees, chord tones. */
  keyLabels?: Record<number, string>
  /** What the Play button sounds. */
  phrase?: Phrase
  playLabel?: string
  /** A second example, for comparisons. */
  alt?: { label: string; phrase: Phrase; highlight?: number[] }
  staff?: StaffSpec
  chart?: ChartSpec
  diagram?: DiagramKind
  quiz?: QuizSpec
  /** Hide the keyboard on steps that are purely about reading or listening. */
  noKeyboard?: boolean
}

export interface Lesson {
  title: string
  duration: string
  summary: string
  steps: Step[]
}

export interface Unit {
  title: string
  /** One line on what the unit is for, shown on the curriculum. */
  summary: string
  /** What comes out of it — printed on the unit header. */
  outcome: string
  lessons: Lesson[]
}
