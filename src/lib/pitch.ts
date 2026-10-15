/** Written pitch — the spelling on the page, which is not quite the same as a MIDI number. */

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const LETTER_SEMITONES = [0, 2, 4, 5, 7, 9, 11]

export interface Pitch {
  letter: string
  /** -2 … +2 in semitones. */
  alter: number
  octave: number
  /** Diatonic step from C0 — what decides the note's height on the stave. */
  step: number
  midi: number
}

const PITCH_RE = /^([A-G])(#{1,2}|b{1,2})?(-?\d+)$/

/** Parse "C4", "F#3", "Bb5". */
export function parsePitch(text: string): Pitch {
  const match = PITCH_RE.exec(text.trim())
  if (!match) throw new Error(`Unreadable pitch: "${text}"`)
  const [, letter, accidental = '', octaveText] = match
  const alter = accidental.startsWith('#') ? accidental.length : -accidental.length
  const octave = Number(octaveText)
  const index = LETTERS.indexOf(letter)
  return {
    letter,
    alter,
    octave,
    step: index + 7 * octave,
    midi: 12 * (octave + 1) + LETTER_SEMITONES[index] + alter,
  }
}

export const midiOf = (text: string) => parsePitch(text).midi

/** Turn a list of written pitches into MIDI notes — content writes one, plays the other. */
export const midis = (...pitches: string[]) => pitches.map(midiOf)
