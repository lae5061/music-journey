import {
  barBeats,
  beats,
  KEY_NAMES,
  keyAlter,
  letterOf,
  octaveOf,
  slurPairs,
  type Alter,
  type Length,
  type Score,
  type ScoreEvent,
  type Voice,
} from './model'

/**
 * Model → ABC. Returns the text and, for every real event, where its token sits in that
 * text, so a click abcjs reports by character position maps straight back to the model.
 */
export interface Span {
  voice: number
  index: number
  start: number
  end: number
}

export const SYSTEM_BARS = 4

interface Token {
  text: string
  /** Absent for padding rests and bar lines. */
  event?: { voice: number; index: number }
}

/** Lengths in eighths, as ABC writes them after a note with L:1/8. */
function lengthText(length: Length, dotted?: boolean): string {
  const eighths = length * 2 * (dotted ? 1.5 : 1)
  if (eighths === 1) return ''
  if (Number.isInteger(eighths)) return String(eighths)
  return '3/2'
}

function pitchText(step: number, mark: string): string {
  const letter = letterOf(step)
  const octave = octaveOf(step)
  const body = octave >= 1 ? letter.toLowerCase() : letter
  const marks = octave >= 2 ? "'".repeat(octave - 1) : octave < 0 ? ','.repeat(-octave) : ''
  return mark + body + marks
}

/** Greedy decomposition of a span of beats into standard values, longest first. */
export function decompose(total: number): { length: Length; dotted: boolean }[] {
  const options: { beats: number; length: Length; dotted: boolean }[] = [
    { beats: 6, length: 4, dotted: true },
    { beats: 4, length: 4, dotted: false },
    { beats: 3, length: 2, dotted: true },
    { beats: 2, length: 2, dotted: false },
    { beats: 1.5, length: 1, dotted: true },
    { beats: 1, length: 1, dotted: false },
    { beats: 0.75, length: 0.5, dotted: true },
    { beats: 0.5, length: 0.5, dotted: false },
  ]
  const out: { length: Length; dotted: boolean }[] = []
  let left = Math.round(total * 4) / 4
  for (const o of options) {
    while (left >= o.beats - 1e-9) {
      out.push({ length: o.length, dotted: o.dotted })
      left -= o.beats
    }
  }
  return out
}

/** Bars of tokens for one voice, with accidentals decided against the key and the bar. */
function voiceBars(score: Score, voice: Voice, v: number, bars: number): Token[][] {
  const perBar = barBeats(score.meter)
  // A slur mark without its partner would run to the end of the piece; only pairs are written.
  const pairs = slurPairs(voice.events)
  const slurStarts = new Set(pairs.map((p) => p.start))
  const slurEnds = new Set(pairs.map((p) => p.end))
  const out: Token[][] = []
  let bar: Token[] = []
  let filled = 0
  let table = new Map<number, Alter>()

  const closeBar = () => {
    out.push(bar)
    bar = []
    filled = 0
    table = new Map()
  }

  const pitchMark = (step: number, alter: Alter, explicit?: boolean) => {
    const current = table.get(step) ?? keyAlter(score.key, letterOf(step))
    if (alter === current && !explicit) return ''
    table.set(step, alter)
    return alter === 1 ? '^' : alter === -1 ? '_' : '='
  }

  const emit = (e: ScoreEvent, index: number, length: Length, dotted: boolean, tie: boolean, first: boolean, last: boolean) => {
    let text = ''
    if (first) {
      if (e.kind === 'note' && slurStarts.has(index)) text += '('
      text += e.decorations.map((d) => `!${d}!`).join('')
    }
    if (e.kind === 'rest') text += 'z'
    else if (e.pitches.length === 1) {
      const p = e.pitches[0]
      text += pitchText(p.step, pitchMark(p.step, p.alter, p.explicit))
    } else {
      const inner = [...e.pitches]
        .sort((a, b) => a.step - b.step)
        .map((p) => pitchText(p.step, pitchMark(p.step, p.alter, p.explicit)))
        .join('')
      text += `[${inner}]`
    }
    text += lengthText(length, dotted)
    if (last && e.kind === 'note' && slurEnds.has(index)) text += ')'
    if (tie || (last && e.kind === 'note' && e.tie)) text += '-'
    bar.push({ text, event: { voice: v, index } })
    filled += beats({ length, dotted })
    if (filled >= perBar - 1e-9) closeBar()
  }

  voice.events.forEach((e, index) => {
    const total = beats(e)
    const left = perBar - filled
    if (total <= left + 1e-9) {
      emit(e, index, e.length, !!e.dotted, false, true, true)
      return
    }
    // Longer than the room left in the bar: write it as tied pieces across the line.
    const pieces = [...decompose(left), ...decompose(total - left)]
    pieces.forEach((piece, i) => {
      const last = i === pieces.length - 1
      emit(e, index, piece.length, piece.dotted, !last && e.kind === 'note', i === 0, last)
    })
  })

  // Pad: finish the open bar with rests, then whole-bar rests to the common length.
  if (filled > 0) {
    for (const piece of decompose(perBar - filled)) bar.push({ text: `z${lengthText(piece.length, piece.dotted)}` })
    closeBar()
  }
  while (out.length < bars) {
    bar.push({ text: `z${perBar * 2}` })
    closeBar()
  }
  return out
}

function barLine(score: Score, i: number, lastBar: number): string {
  const type = score.bars[i] ?? (i === lastBar ? 'final' : 'plain')
  switch (type) {
    case 'double':
      return '||'
    case 'final':
      return '|]'
    case 'repeatStart':
      return '|:'
    case 'repeatEnd':
      return ':|'
    default:
      return '|'
  }
}

export function serialize(
  score: Score,
  { titles = true, wholeSystems = false }: { titles?: boolean; wholeSystems?: boolean } = {},
): { text: string; spans: Span[] } {
  const perBar = barBeats(score.meter)
  const longest = Math.max(0, ...score.voices.map((v) => v.events.reduce((s, e) => s + beats(e), 0)))
  const written = Math.max(1, Math.ceil(longest / perBar - 1e-9))
  // The editor shows whole lines of bars, the unwritten ones as rests to click into, and
  // always keeps an empty bar ahead of the music so there is somewhere to put the next note.
  const lastBarFull = Math.abs(longest / perBar - Math.round(longest / perBar)) < 1e-9 && longest > 0
  const ahead = lastBarFull ? written + 1 : written
  const bars = wholeSystems ? Math.max(SYSTEM_BARS, Math.ceil(ahead / SYSTEM_BARS) * SYSTEM_BARS) : written
  const voices = score.voices.map((voice, v) => voiceBars(score, voice, v, bars))
  const [n, d] = score.meter

  const lines: string[] = ['X:1']
  // Rendering only: no tempo mark above the staff, and every line, the last one included,
  // stretched to the width. Saved pieces leave layout to the player.
  if (!titles) lines.push('%%printtempo false', '%%stretchlast 1')
  if (titles && score.title) lines.push(`T:${score.title}`)
  if (titles && score.composer) lines.push(`C:${score.composer}`)
  lines.push(`M:${n}/${d}`, 'L:1/8', d === 8 ? `Q:3/8=${score.bpm}` : `Q:1/4=${score.bpm}`)
  const key = KEY_NAMES[score.key + 4] ?? 'C'
  if (score.hands === 2) {
    lines.push(`K:${key}`, '%%score {1 2}', 'V:1 clef=treble name="R.H."', 'V:2 clef=bass name="L.H."')
  } else {
    lines.push(`K:${key} clef=${score.voices[0].clef}`)
  }

  let text = lines.join('\n') + '\n'
  const spans: Span[] = []
  const lastBar = bars - 1

  for (let first = 0; first < bars; first += SYSTEM_BARS) {
    const until = Math.min(bars, first + SYSTEM_BARS)
    voices.forEach((voiceBarsList, v) => {
      let line = score.hands === 2 ? `[V:${v + 1}] ` : ''
      if (first === 0 && score.bars[-1] === 'repeatStart') line += '|: '
      for (let b = first; b < until; b++) {
        for (const token of voiceBarsList[b]) {
          const start = text.length + line.length
          line += token.text
          if (token.event) {
            const prev = spans.find((s) => s.voice === token.event!.voice && s.index === token.event!.index)
            if (prev) prev.end = start + token.text.length
            else spans.push({ ...token.event, start, end: start + token.text.length })
          }
          line += ' '
        }
        line += barLine(score, b, lastBar) + (b < until - 1 ? ' ' : '')
      }
      text += line + '\n'
    })
  }
  return { text, spans }
}

/** The model event whose token covers this character of the serialized text, if any. */
export function eventAt(spans: Span[], char: number): { voice: number; index: number } | null {
  for (const s of spans) if (char >= s.start && char < s.end) return { voice: s.voice, index: s.index }
  return null
}

/** Which event's token comes nearest after a character, for mapping abcjs ranges that start early. */
export function eventNear(spans: Span[], start: number, end: number): { voice: number; index: number } | null {
  let best: Span | null = null
  for (const s of spans) {
    if (s.end <= start || s.start >= end) continue
    if (!best || s.start < best.start) best = s
  }
  return best ? { voice: best.voice, index: best.index } : null
}

