/** Note maths. Pitches are MIDI numbers throughout — 60 is middle C (C4). */

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export const MIDDLE_C = 60

const BLACK_PITCH_CLASSES = [1, 3, 6, 8, 10]

export const isBlackKey = (midi: number) => BLACK_PITCH_CLASSES.includes(midi % 12)

/** "C", "C#", … — the letter name without its octave. */
export const pitchClass = (midi: number) => NOTE_NAMES[midi % 12]

/** Octave number as written on a piano: middle C is in octave 4. */
export const octaveOf = (midi: number) => Math.floor(midi / 12 - 1)

/** "C4", "F#3", … */
export const noteName = (midi: number) => pitchClass(midi) + octaveOf(midi)

/** Equal temperament from A4 = 440 Hz. */
export const frequencyOf = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12)
