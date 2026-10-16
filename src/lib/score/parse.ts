import type { Abcjs } from '../abc'
import {
  barBeats,
  keyAlter,
  letterOf,
  METERS,
  type Alter,
  type BarType,
  type Clef,
  type Length,
  type Note,
  type Pitch,
  type Score,
  type ScoreEvent,
  type Voice,
} from './model'

/**
 * ABC → model, for the pieces the editor can draw: one or two staves with one voice
 * each, notes and rests of the eight standard lengths, chords, ties, slurs, the
 * decorations the palette offers, and the five bar-line types. Anything else is
 * reported, and that piece stays text-only.
 */
export type ParseResult = { ok: true; score: Score } | { ok: false; reason: string }

interface AbcPitch {
  pitch: number
  accidental?: string
  startSlur?: unknown[]
  endSlur?: unknown[]
  startTie?: unknown
}
interface AbcItem {
  el_type: string
  type?: string
  duration?: number
  pitches?: AbcPitch[]
  rest?: { type: string }
  decoration?: string[]
  startSlur?: unknown[]
  endSlur?: unknown[]
  startTriplet?: number
  gracenotes?: unknown[]
  lyric?: unknown[]
  startEnding?: unknown
  endEnding?: unknown
}
interface AbcStaff {
  clef?: { type?: string }
  key?: { mode?: string; accidentals?: { acc: string }[] }
  meter?: { type?: string; value?: { num: string; den: string }[] }
  voices?: AbcItem[][]
}

const LENGTH_OF: Record<string, { length: Length; dotted: boolean }> = {
  '4': { length: 4, dotted: false },
  '6': { length: 4, dotted: true },
  '2': { length: 2, dotted: false },
  '3': { length: 2, dotted: true },
  '1': { length: 1, dotted: false },
  '1.5': { length: 1, dotted: true },
  '0.5': { length: 0.5, dotted: false },
  '0.75': { length: 0.5, dotted: true },
}

const BAR_OF: Record<string, BarType | null> = {
  bar_thin: 'plain',
  bar_thin_thin: 'double',
  bar_thin_thick: 'final',
  bar_thick_thin: 'final',
  bar_left_repeat: 'repeatStart',
  bar_right_repeat: 'repeatEnd',
  bar_invisible: 'plain',
}

const fail = (reason: string): ParseResult => ({ ok: false, reason })

export function parseAbc(lib: Abcjs, text: string): ParseResult {
  let tune
  try {
    ;[tune] = lib.parseOnly(text)
  } catch (e) {
    return fail(e instanceof Error ? e.message : String(e))
  }
  if (!tune) return fail('Nothing to read: there is no tune in the text.')

  // Gather each staff's single voice across every line of the page.
  const staves: AbcStaff[] = []
  const items: AbcItem[][] = []
  for (const line of tune.lines as unknown as { staff?: AbcStaff[] }[]) {
    if (!line.staff) continue
    line.staff.forEach((staff, j) => {
      if (!staves[j]) staves[j] = staff
      const voices = staff.voices ?? []
      if (voices.length > 1) return
      items[j] = [...(items[j] ?? []), ...(voices[0] ?? [])]
    })
    if (line.staff.some((s) => (s.voices?.length ?? 0) > 1)) return fail('More than one voice on a staff; the editor draws one per hand.')
  }
  if (staves.length === 0) return fail('No music yet.')
  if (staves.length > 2) return fail('More than two staves; the editor draws a right hand and a left hand.')

  const clefs = staves.map((s) => (s.clef?.type === 'bass' ? 'bass' : s.clef?.type === 'treble' || !s.clef?.type ? 'treble' : null))
  if (clefs.some((c) => c === null)) return fail('A clef the editor cannot draw; it knows treble and bass.')
  if (staves.length === 2 && (clefs[0] !== 'treble' || clefs[1] !== 'bass')) {
    return fail('Two staves must be treble over bass for the editor.')
  }

  const keyInfo = staves[0].key
  if (keyInfo?.mode && keyInfo.mode !== 'major' && keyInfo.mode !== '') return fail('A minor or modal key; the editor offers major keys.')
  const accs = keyInfo?.accidentals ?? []
  const sharps = accs.filter((a) => a.acc === 'sharp').length
  const flats = accs.filter((a) => a.acc === 'flat').length
  if (sharps && flats) return fail('A key signature the editor cannot draw.')
  const key = sharps ? sharps : -flats
  if (key < -4 || key > 4) return fail('A key with more than four sharps or flats.')

  const m = staves[0].meter?.value?.[0]
  const meter: [number, number] | undefined = m ? [Number(m.num), Number(m.den)] : [4, 4]
  if (!METERS.some(([n, d]) => n === meter[0] && d === meter[1])) return fail(`${meter[0]}/${meter[1]} time; the editor offers 4/4, 3/4, 2/4 and 6/8.`)
  const perBar = barBeats(meter)

  const meta = (tune as unknown as { metaText?: { title?: string; composer?: string; tempo?: { bpm?: number; duration?: number[] } } }).metaText ?? {}
  let bpm = meta.tempo?.bpm ?? 100
  const unit = meta.tempo?.duration?.[0]
  const expected = meter[1] === 8 ? 0.375 : 0.25
  if (unit && Math.abs(unit - expected) > 1e-6) bpm = Math.round((bpm * unit) / expected)

  const bars: Record<number, BarType> = {}
  const voices: Voice[] = []

  for (let j = 0; j < staves.length; j++) {
    const clef = clefs[j] as Clef
    const events: ScoreEvent[] = []
    let running = 0
    let table = new Map<number, Alter>()
    const hand = staves.length === 2 ? (j === 0 ? 'right hand' : 'left hand') : 'music'

    for (const item of items[j] ?? []) {
      if (item.el_type === 'bar') {
        if (item.startEnding !== undefined || item.endEnding !== undefined) return fail('First and second endings; the editor does not draw those yet.')
        const type = BAR_OF[item.type ?? '']
        if (type === null || type === undefined) return fail(`A bar line (${item.type}) the editor does not draw.`)
        if (running < 1e-9) {
          if (type === 'repeatStart' && j === 0) bars[-1] = 'repeatStart'
          continue
        }
        const whole = running / perBar
        if (Math.abs(whole - Math.round(whole)) > 1e-6) return fail(`In the ${hand}, a bar is not ${perBar} beats long; the editor needs full bars.`)
        if (j === 0 && type !== 'plain') bars[Math.round(whole) - 1] = type
        table = new Map()
        continue
      }
      if (item.el_type === 'note') {
        if (item.startTriplet) return fail('Triplets; the editor does not draw those.')
        if (item.gracenotes?.length) return fail('Grace notes; the editor does not draw those.')
        if (item.lyric?.length) return fail('Lyrics; the editor leaves words out.')
        const beats = Math.round((item.duration ?? 0) * 4 * 1000) / 1000
        const len = LENGTH_OF[String(beats)]
        if (!len) return fail(`A note length (${beats} beats) the editor cannot draw.`)
        const decorations = (item.decoration ?? []).filter((d) => typeof d === 'string')
        if (item.rest) {
          // abcjs calls a rest that fills its bar 'whole'.
          if (!['rest', 'whole', 'invisible'].includes(item.rest.type)) return fail('A spacer or multi-bar rest; the editor writes plain rests.')
          events.push({ kind: 'rest', length: len.length, dotted: len.dotted || undefined, decorations })
        } else {
          const pitches: Pitch[] = []
          let slurStart = Boolean(item.startSlur?.length)
          let slurEnd = Boolean(item.endSlur?.length)
          let tie = false
          for (const p of item.pitches ?? []) {
            const step = p.pitch
            let alter: Alter
            let explicit: boolean | undefined
            switch (p.accidental) {
              case 'sharp':
                alter = 1
                break
              case 'flat':
                alter = -1
                break
              case 'natural':
                alter = 0
                explicit = keyAlter(key, letterOf(step)) === 0 && !table.has(step) ? true : undefined
                break
              case undefined:
                alter = table.get(step) ?? keyAlter(key, letterOf(step))
                break
              default:
                return fail('A double sharp or flat; the editor writes single accidentals.')
            }
            if (p.accidental) table.set(step, alter)
            pitches.push(explicit ? { step, alter, explicit } : { step, alter })
            if (p.startSlur?.length) slurStart = true
            if (p.endSlur?.length) slurEnd = true
            if (p.startTie) tie = true
          }
          const note: Note = { kind: 'note', pitches, length: len.length, dotted: len.dotted || undefined, decorations }
          if (tie) note.tie = true
          if (slurStart) note.slurStart = true
          if (slurEnd) note.slurEnd = true
          events.push(note)
        }
        running += beats
        continue
      }
      if (['clef', 'key', 'meter', 'tempo', 'part', 'overlay'].includes(item.el_type)) {
        return fail('A change of key, time, clef or tempo part-way through; the editor keeps one throughout.')
      }
    }
    // Rests after the last note are the serializer's padding; they come back on output.
    while (events.length && events[events.length - 1].kind === 'rest') events.pop()
    voices.push({ clef, events })
  }

  // The closing |] is what the serializer writes at the end by default; it is not an override.
  const longest = Math.max(0, ...voices.map((v) => v.events.reduce((sum, e) => sum + e.length * (e.dotted ? 1.5 : 1), 0)))
  const lastBar = Math.max(0, Math.ceil(longest / perBar - 1e-9) - 1)
  if (bars[lastBar] === 'final') delete bars[lastBar]

  return {
    ok: true,
    score: {
      title: meta.title ?? '',
      composer: meta.composer ?? '',
      bpm,
      key,
      meter,
      hands: staves.length as 1 | 2,
      voices,
      bars,
    },
  }
}
