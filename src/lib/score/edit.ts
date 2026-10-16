import { decompose } from './serialize'
import {
  barBeats,
  beats,
  startBeat,
  totalBeats,
  type BarType,
  type Length,
  type Note,
  type Pitch,
  type Rest,
  type Score,
  type ScoreEvent,
} from './model'

/** Pure edits. Each returns a new Score and never touches the one it was given. */

const withVoice = (score: Score, v: number, events: ScoreEvent[]): Score => ({
  ...score,
  voices: score.voices.map((voice, i) => (i === v ? { ...voice, events } : voice)),
})

/**
 * Put an event into a voice at an index. One that would run past the end of its bar is
 * written as tied pieces, so a bar never overflows. Returns how many events went in.
 */
export function insertEvent(score: Score, v: number, index: number, event: ScoreEvent): { score: Score; count: number } {
  const events = score.voices[v].events
  const perBar = barBeats(score.meter)
  const at = startBeat(events, index)
  const left = perBar - (at % perBar || 0)
  const total = beats(event)
  let pieces: ScoreEvent[]
  if (total <= left + 1e-9) pieces = [event]
  else {
    const parts = [...decompose(left), ...decompose(total - left)]
    pieces = parts.map((p, i) => {
      const last = i === parts.length - 1
      if (event.kind === 'rest') return { ...event, length: p.length, dotted: p.dotted || undefined }
      const note: Note = {
        ...event,
        length: p.length,
        dotted: p.dotted || undefined,
        tie: last ? event.tie : true,
        slurStart: i === 0 ? event.slurStart : undefined,
        slurEnd: last ? event.slurEnd : undefined,
        decorations: i === 0 ? event.decorations : [],
      }
      return note
    })
  }
  const next = [...events.slice(0, index), ...pieces, ...events.slice(index)]
  return { score: withVoice(score, v, next), count: pieces.length }
}

/** Whole-bar rests until the voice reaches the start of bar `bar` (0-based). */
export function fillToBar(score: Score, v: number, bar: number): Score {
  const perBar = barBeats(score.meter)
  let events = score.voices[v].events
  let total = totalBeats(events)
  // Finish an open bar first.
  const open = total % perBar
  if (open > 1e-9 && total < bar * perBar) {
    for (const p of decompose(perBar - open)) events = [...events, { kind: 'rest', length: p.length, dotted: p.dotted || undefined, decorations: [] }]
    total = totalBeats(events)
  }
  while (total + 1e-9 < bar * perBar) {
    for (const p of decompose(perBar)) events = [...events, { kind: 'rest', length: p.length, dotted: p.dotted || undefined, decorations: [] }]
    total = totalBeats(events)
  }
  return withVoice(score, v, events)
}

export function removeEvent(score: Score, v: number, index: number): Score {
  const events = score.voices[v].events
  if (index < 0 || index >= events.length) return score
  return withVoice(score, v, [...events.slice(0, index), ...events.slice(index + 1)])
}

export function updateEvent(score: Score, v: number, index: number, fn: (e: ScoreEvent) => ScoreEvent): Score {
  const events = score.voices[v].events
  if (index < 0 || index >= events.length) return score
  return withVoice(
    score,
    v,
    events.map((e, i) => (i === index ? fn(e) : e)),
  )
}

export const updateNote = (score: Score, v: number, index: number, fn: (n: Note) => Note) =>
  updateEvent(score, v, index, (e) => (e.kind === 'note' ? fn(e) : e))

/** Change a note's length in place; if it now overflows its bar it is re-split. */
export function setEventLength(score: Score, v: number, index: number, length: Length, dotted: boolean): { score: Score; count: number } {
  const e = score.voices[v].events[index]
  if (!e) return { score, count: 0 }
  const changed = { ...e, length, dotted: dotted || undefined }
  return insertEvent(removeEvent(score, v, index), v, index, changed)
}

export function addPitch(note: Note, pitch: Pitch): Note {
  if (note.pitches.some((p) => p.step === pitch.step)) {
    return { ...note, pitches: note.pitches.map((p) => (p.step === pitch.step ? pitch : p)) }
  }
  return { ...note, pitches: [...note.pitches, pitch].sort((a, b) => a.step - b.step) }
}

export function toggleDecoration(e: ScoreEvent, name: string, exclusiveWith: readonly string[] = []): ScoreEvent {
  const has = e.decorations.includes(name)
  const kept = e.decorations.filter((d) => d !== name && !exclusiveWith.includes(d))
  return { ...e, decorations: has ? kept : [...kept, name] }
}

export function setBarType(score: Score, boundary: number, type: BarType): Score {
  const bars = { ...score.bars }
  if (type === 'plain') delete bars[boundary]
  else bars[boundary] = type
  return { ...score, bars }
}

/** The bar (0-based) that holds the start of events[index]. */
export const barOf = (score: Score, v: number, index: number) =>
  Math.floor(startBeat(score.voices[v].events, index) / barBeats(score.meter) + 1e-9)

export const makeRest = (length: Length, dotted: boolean): Rest => ({ kind: 'rest', length, dotted: dotted || undefined, decorations: [] })
export const makeNote = (pitch: Pitch, length: Length, dotted: boolean): Note => ({
  kind: 'note',
  pitches: [pitch],
  length,
  dotted: dotted || undefined,
  decorations: [],
})
