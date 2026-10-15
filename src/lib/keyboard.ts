import { isBlackKey, octaveOf, MIDDLE_C } from './notes'

/**
 * Key geometry for a range of the keyboard. Positions are percentages of the
 * keyboard's width, so the same numbers work at any size.
 *
 * White keys divide the width equally; black keys are 60% of a white key wide and
 * straddle the gap, centred on the boundary with the white key above them.
 */

export interface KeyGeometry {
  midi: number
  black: boolean
  /** Percent from the left edge. */
  left: number
  /** Percent of the keyboard's width. */
  width: number
}

export interface OctaveMark {
  midi: number
  left: number
  width: number
  label: string
}

export interface Keyboard {
  whites: KeyGeometry[]
  blacks: KeyGeometry[]
  octaveMarks: OctaveMark[]
  /** How wide one white key is, as a percentage — callers convert to px. */
  whiteWidth: number
}

export interface Range {
  lowest: number
  highest: number
}

/** C4 to C6 — the default working range. */
export const TWO_OCTAVES_FROM_MIDDLE_C: Range = { lowest: 60, highest: 84 }

/** C3 to C6 — three octaves, for two-handed examples. */
export const THREE_OCTAVES: Range = { lowest: 48, highest: 84 }

/** A0 to C8 — a full acoustic piano. */
export const FULL_88_KEYS: Range = { lowest: 21, highest: 108 }

const BLACK_KEY_WIDTH_RATIO = 0.6

export const whiteKeyCount = ({ lowest, highest }: Range): number => {
  let count = 0
  for (let m = lowest; m <= highest; m++) if (!isBlackKey(m)) count++
  return count
}

export function buildKeyboard({ lowest, highest }: Range): Keyboard {
  const midis: number[] = []
  for (let midi = lowest; midi <= highest; midi++) midis.push(midi)

  const whiteMidis = midis.filter((midi) => !isBlackKey(midi))
  const whiteWidth = 100 / Math.max(whiteMidis.length, 1)
  const blackWidth = whiteWidth * BLACK_KEY_WIDTH_RATIO

  const whites: KeyGeometry[] = whiteMidis.map((midi, i) => ({
    midi,
    black: false,
    left: i * whiteWidth,
    width: whiteWidth,
  }))

  const blacks: KeyGeometry[] = []
  for (const midi of midis) {
    if (!isBlackKey(midi)) continue
    // Sit centred on the left edge of the next white key up.
    const neighbourIndex = whiteMidis.findIndex((white) => white > midi)
    if (neighbourIndex === -1) continue // range ends on a black key; nothing to hang it on
    blacks.push({
      midi,
      black: true,
      left: neighbourIndex * whiteWidth - blackWidth / 2,
      width: blackWidth,
    })
  }

  const octaveMarks: OctaveMark[] = whiteMidis
    .map((midi, i) => ({ midi, i }))
    .filter(({ midi }) => midi % 12 === 0)
    .map(({ midi, i }) => ({
      midi,
      left: i * whiteWidth,
      width: whiteWidth,
      label: `C${octaveOf(midi)}`,
    }))

  return { whites, blacks, octaveMarks, whiteWidth }
}

/** The lowest and highest keys an 88-key piano has. */
const PIANO_LOWEST = 21
const PIANO_HIGHEST = 108

/**
 * The range a step needs: wide enough for every note it touches, snapped out to whole
 * octaves so the board always begins and ends on a C, and never narrower than two
 * octaves so a single-note example still looks like a keyboard.
 */
export function rangeFor(notes: number[]): Range {
  if (notes.length === 0) return TWO_OCTAVES_FROM_MIDDLE_C
  const low = Math.min(...notes)
  const high = Math.max(...notes)
  let lowest = Math.floor(low / 12) * 12
  let highest = Math.ceil(high / 12) * 12
  // Grow an octave at a time, alternating, so a narrow example ends up centred
  // rather than pinned to one edge of the board.
  for (let grown = 0; highest - lowest < 24; grown++) {
    const downFirst = grown % 2 === 0
    if (downFirst && lowest - 12 >= PIANO_LOWEST) lowest -= 12
    else if (highest + 12 <= PIANO_HIGHEST) highest += 12
    else if (lowest - 12 >= PIANO_LOWEST) lowest -= 12
    else break
  }
  return {
    lowest: Math.max(PIANO_LOWEST, lowest),
    highest: Math.min(PIANO_HIGHEST, highest),
  }
}

/** A white key narrower than this is not a usable touch target. */
export const MIN_WHITE_KEY_PX = 26

/**
 * Pick the range that actually fits the space available.
 *
 * A phone cannot show 88 keys at a playable size, so rather than shrink them to
 * slivers the board narrows to a window around the notes the step is about. The
 * window only ever grows past the comfortable minimum when the example itself spans
 * more keys than would otherwise fit — being able to see the notes beats key width.
 */
export function fitRange(desired: Range, focus: number[], availablePx: number): Range {
  if (availablePx <= 0) return desired

  // Work in white-key positions: they are what the width is actually divided between.
  const whites: number[] = []
  for (let m = desired.lowest; m <= desired.highest; m++) if (!isBlackKey(m)) whites.push(m)
  if (whites.length === 0) return desired

  const roomFor = Math.floor(availablePx / MIN_WHITE_KEY_PX)
  if (roomFor >= whites.length) return desired

  // Everything the step needs on screen, with middle C as a fallback anchor.
  const anchors = focus.length > 0 ? focus : [MIDDLE_C]
  const low = Math.max(desired.lowest, Math.min(...anchors))
  const high = Math.min(desired.highest, Math.max(...anchors))

  // A black anchor is covered by the white key below it, which is always in range.
  const lowIndex = Math.max(0, lastIndexAtOrBelow(whites, low))
  const highIndex = firstIndexAtOrAbove(whites, high)

  // Never narrower than the notes in play: seeing them beats key width.
  const needed = highIndex - lowIndex + 1
  const count = Math.min(whites.length, Math.max(roomFor, needed, MIN_WHITE_KEYS))

  // Centre the window on the notes, then slide it back inside the range.
  const centre = (lowIndex + highIndex) / 2
  const start = clamp(Math.round(centre - count / 2), 0, whites.length - count)

  return { lowest: whites[start], highest: whites[start + count - 1] }
}

/** Fewer than this and it stops looking like a keyboard. */
const MIN_WHITE_KEYS = 8

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

function lastIndexAtOrBelow(whites: number[], midi: number): number {
  let index = -1
  for (let i = 0; i < whites.length; i++) if (whites[i] <= midi) index = i
  return index
}

function firstIndexAtOrAbove(whites: number[], midi: number): number {
  for (let i = 0; i < whites.length; i++) if (whites[i] >= midi) return i
  return whites.length - 1
}
