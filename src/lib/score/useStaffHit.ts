import type { TuneObject } from 'abcjs'
import { barBeats, startBeat, totalBeats, type Score } from './model'
import { eventNear, type Span } from './serialize'
import { stepFromStaff } from './spell'

/**
 * Turning a pointer position over the drawn score into "add a note here". Reads the
 * geometry abcjs leaves on the tune after drawing; everything about that lives in this
 * file so a change in abcjs touches one place.
 */

/** One diagonal step on the staff, in SVG units (abcjs: 30 × 93 / 720). */
export const STEP = 3.875
/** Closer than this to a drawn element and abcjs's own selection owns the click. */
const NEAR = 12

export interface DrawnChild {
  type?: string
  x: number
  w: number
  top?: number
  bottom?: number
  abcelem?: { startChar?: number; endChar?: number; el_type?: string; rest?: unknown }
  elemset?: Element[]
}
export interface DrawnStaff {
  absoluteY?: number
  topLine?: number
  bottomLine?: number
  top?: number
  bottom?: number
}
export interface DrawnVoice {
  children: DrawnChild[]
}
export interface DrawnGroup {
  staffs: DrawnStaff[]
  voices: DrawnVoice[]
  startx?: number
}

export const groupsOf = (tune: TuneObject): DrawnGroup[] =>
  (tune.lines as unknown as { staffGroup?: DrawnGroup }[]).map((l) => l.staffGroup).filter((g): g is DrawnGroup => !!g)

export const staffTop = (s: DrawnStaff) => s.topLine ?? (s.absoluteY ?? 0) - 10 * STEP
export const staffBottom = (s: DrawnStaff) => s.bottomLine ?? (s.absoluteY ?? 0) - 2 * STEP

export const isNoteOrRest = (c: DrawnChild) => c.type === 'note' || c.type === 'rest' || c.abcelem?.el_type === 'note'

/** Pointer (client px) → the SVG's own units. */
export function svgPoint(svg: SVGSVGElement, clientX: number, clientY: number): DOMPoint | null {
  const ctm = svg.getScreenCTM()
  if (!ctm) return null
  return new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse())
}

export type Hit =
  | { kind: 'place'; voice: 0 | 1; step: number; insertion: number; fillTo: number | null; x: number; y: number; staff: DrawnStaff; line: number }
  | { kind: 'near' }

export function hitTest(
  tune: TuneObject,
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
  score: Score,
  spans: Span[],
): Hit | null {
  const p = svgPoint(svg, clientX, clientY)
  if (!p) return null
  const groups = groupsOf(tune)

  // The nearest staff band, with four ledger lines of slack above and below.
  let best: { line: number; staffIndex: number; staff: DrawnStaff; distance: number } | null = null
  groups.forEach((g, line) => {
    g.staffs.forEach((staff, staffIndex) => {
      if (staff.absoluteY === undefined) return
      const top = staff.absoluteY - 18 * STEP
      const bottom = staff.absoluteY + 8 * STEP
      const distance = p.y < top ? top - p.y : p.y > bottom ? p.y - bottom : 0
      if (!best || distance < best.distance) best = { line, staffIndex, staff, distance }
    })
  })
  if (!best) return null
  const { line, staffIndex, staff, distance } = best as { line: number; staffIndex: number; staff: DrawnStaff; distance: number }
  if (distance > 2 * STEP) return null
  const voice = staffIndex as 0 | 1
  if (!score.voices[voice]) return null
  const clef = score.voices[voice].clef
  const pos = Math.max(-8, Math.min(18, Math.round((staff.absoluteY! - p.y) / STEP)))
  const step = stepFromStaff(pos, clef)

  const group = groups[line]
  const drawn = group.voices[voice]?.children ?? []

  // Too close to something already drawn: abcjs's own selection handles that.
  for (const c of drawn) {
    if (!isNoteOrRest(c) && c.type !== 'bar') continue
    const left = c.x - NEAR
    const right = c.x + c.w + NEAR
    const topY = staff.absoluteY! - (c.top ?? 12) * STEP - NEAR
    const bottomY = staff.absoluteY! - (c.bottom ?? -2) * STEP + NEAR
    if (p.x >= left && p.x <= right && p.y >= topY && p.y <= bottomY && isNoteOrRest(c)) return { kind: 'near' }
  }

  // Which bar of the line, and which bar overall.
  const bars = drawn.filter((c) => c.type === 'bar').sort((a, b) => a.x - b.x)
  const firstNoteX = drawn.find(isNoteOrRest)?.x ?? Infinity
  const realBars = bars.filter((b) => b.x > firstNoteX - NEAR)
  const m = realBars.filter((b) => b.x + b.w / 2 < p.x).length
  let barsBefore = 0
  for (let i = 0; i < line; i++) {
    const children = groups[i].voices[voice]?.children ?? []
    const firstX = children.find(isNoteOrRest)?.x ?? Infinity
    barsBefore += children.filter((c) => c.type === 'bar' && c.x > firstX - NEAR).length
  }
  const bar = barsBefore + m
  const perBar = barBeats(score.meter)
  const events = score.voices[voice].events
  const total = totalBeats(events)

  let insertion = events.length
  let fillTo: number | null = null
  if (total + 1e-9 <= bar * perBar) {
    fillTo = total + 1e-9 < bar * perBar ? bar : null
    insertion = events.length
  } else {
    insertion = events.findIndex((_, i) => startBeat(events, i) + 1e-9 >= (bar + 1) * perBar)
    if (insertion < 0) insertion = events.length
  }

  // Where the ghost sits: after the last real note in that bar, else at the bar's start.
  const barLeft = m > 0 ? realBars[m - 1].x + realBars[m - 1].w : (group.startx ?? firstNoteX - 12)
  const barRight = m < realBars.length ? realBars[m].x : Infinity
  let lastReal: DrawnChild | null = null
  for (const c of drawn) {
    if (!isNoteOrRest(c) || c.x < barLeft || c.x >= barRight) continue
    const real = c.abcelem && eventNear(spans, c.abcelem.startChar ?? -1, c.abcelem.endChar ?? -1)
    if (real && (!lastReal || c.x > lastReal.x)) lastReal = c
  }
  const x = lastReal ? lastReal.x + lastReal.w + 10 : barLeft + 14
  const y = staff.absoluteY! - pos * STEP
  return { kind: 'place', voice, step, insertion, fillTo, x, y, staff, line }
}

/** The drawn element for a model event, for placing the cursor and the selection. */
export function findDrawn(tune: TuneObject, spans: Span[], voice: number, index: number): { child: DrawnChild; group: DrawnGroup; line: number } | null {
  const span = spans.find((s) => s.voice === voice && s.index === index)
  if (!span) return null
  const groups = groupsOf(tune)
  for (let line = 0; line < groups.length; line++) {
    for (const child of groups[line].voices[voice]?.children ?? []) {
      const a = child.abcelem
      if (!a || a.startChar === undefined || a.endChar === undefined) continue
      if (a.endChar > span.start && a.startChar < span.end && isNoteOrRest(child)) return { child, group: groups[line], line }
    }
  }
  return null
}
