import { keyAlter, LETTERS, mod, type Alter, type Clef, type Pitch } from './model'

/** Written pitch ↔ sounding pitch, with the key deciding how a black key is spelled. */

const LETTER_SEMIS = [0, 2, 4, 5, 7, 9, 11]

export const midiOf = (p: Pitch) => 60 + Math.floor(p.step / 7) * 12 + LETTER_SEMIS[mod(p.step, 7)] + p.alter

/**
 * The spelling a key signature would use: in-key spellings first (F# in G major), then
 * naturals, then sharps in sharp keys and flats in flat keys.
 */
export function spellMidi(midi: number, key: number): Pitch {
  const candidates: Pitch[] = []
  for (let l = 0; l < 7; l++) {
    for (const alter of [0, 1, -1] as Alter[]) {
      const pc = mod(LETTER_SEMIS[l] + alter, 12)
      if (pc !== mod(midi, 12)) continue
      // Which octave puts this letter on the right midi number.
      for (const oct of [-1, 0, 1]) {
        const base = Math.floor((midi - 60) / 12) + oct
        const step = base * 7 + l
        if (60 + base * 12 + LETTER_SEMIS[l] + alter === midi) candidates.push({ step, alter })
      }
    }
  }
  const score = (p: Pitch) => {
    const inKey = keyAlter(key, LETTERS[mod(p.step, 7)]) === p.alter ? 0 : 10
    const natural = p.alter === 0 ? 0 : 1
    const side = key >= 0 ? (p.alter === -1 ? 3 : 0) : p.alter === 1 ? 3 : 0
    return inKey + natural + side
  }
  candidates.sort((a, b) => score(a) - score(b))
  return candidates[0] ?? { step: 0, alter: 0 }
}

/** abcjs staff position (0 = the line below the staff's own middle C) → model step. */
export const stepFromStaff = (verticalPos: number, clef: Clef) => verticalPos + (clef === 'bass' ? -12 : 0)
export const staffFromStep = (step: number, clef: Clef) => step - (clef === 'bass' ? -12 : 0)
