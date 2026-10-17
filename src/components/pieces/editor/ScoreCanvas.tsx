import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import type { ClickListener, TuneObject } from 'abcjs'
import { type Span, eventNear } from '../../../lib/score/serialize'
import type { EditorState, useScoreEditor } from '../../../lib/score/useScoreEditor'
import { findDrawn, groupsOf, hitTest, isNoteOrRest, staffBottom, staffTop, STEP, type DrawnChild } from '../../../lib/score/useStaffHit'
import { useScorePlayer, type ScorePlayer } from '../../../lib/useScorePlayer'
import { NoteTools } from './NoteTools'

type Actions = ReturnType<typeof useScoreEditor>['actions']

interface ScoreCanvasProps {
  text: string
  spans: Span[]
  state: EditorState
  actions: Actions
  narrow: boolean
  onNoteOn: (midi: number, durationS: number, velocity: number, delayS: number) => void
  onFinish: () => void
  onPlayer: (player: ScorePlayer) => void
  children?: ReactNode
}

const SVG_NS = 'http://www.w3.org/2000/svg'
/** Only notes and rests respond to abcjs's own click handling. A constant, so the drawing effect does not re-run. */
const SELECTABLE = ['note']

/**
 * The drawn score with the editor's overlay: a blinking insertion cursor, a ghost
 * notehead under the pointer, the selected note tinted, and the bars not yet written
 * muted. The drawing is abcjs's; everything here is laid on top of its SVG.
 */
export function ScoreCanvas({ text, spans, state, actions, narrow, onNoteOn, onFinish, onPlayer, children }: ScoreCanvasProps) {
  const box = useRef<HTMLDivElement>(null)
  const tune = useRef<TuneObject | null>(null)
  const svg = useRef<SVGSVGElement | null>(null)
  const cursor = useRef<SVGLineElement | null>(null)
  const ghost = useRef<SVGGElement | null>(null)
  const selectedEls = useRef<Element[]>([])
  const scoreBox = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  // Where the selected note's popover sits, relative to the frame around the score box.
  const [pop, setPop] = useState<{ x: number; y: number } | null>(null)
  const popEl = useRef<HTMLDivElement>(null)

  // Keep the popover inside the frame, with its arrow still on the note.
  useLayoutEffect(() => {
    const el = popEl.current
    const f = frame.current
    if (!el || !f || !pop || narrow) return
    const w = el.offsetWidth
    const left = Math.max(0, Math.min(f.clientWidth - w, pop.x - w / 2))
    el.style.left = `${left}px`
    el.style.setProperty('--arrow', `${Math.max(12, Math.min(w - 12, pop.x - left))}px`)
  }, [pop, narrow])
  const latest = useRef({ state, actions, spans })
  latest.current = { state, actions, spans }

  const clearSelection = () => {
    for (const el of selectedEls.current) el.classList.remove('is-selected')
    selectedEls.current = []
  }

  /** Put the cursor and the selection where the state says, on the current drawing. */
  const sync = useCallback(() => {
    const t = tune.current
    const line = cursor.current
    if (!t || !line) return
    const { state: s, spans: sp } = latest.current
    clearSelection()
    const hand = s.hand
    const groups = groupsOf(t)
    if (groups.length === 0) return
    const at = s.cursors[hand]
    let x: number
    let staff = groups[0].staffs[hand]
    let drawn: DrawnChild | null = null
    if (at > 0) {
      const found = findDrawn(t, sp, hand, at - 1)
      if (found) {
        drawn = found.child
        x = found.child.x + found.child.w + 3
        staff = found.group.staffs[hand] ?? staff
      } else x = 60
    } else {
      const first = groups[0].voices[hand]?.children.find((c) => isNoteOrRest(c) || c.type === 'bar')
      x = (first?.x ?? 70) - 8
    }
    if (!staff) return
    line.setAttribute('x1', String(x))
    line.setAttribute('x2', String(x))
    line.setAttribute('y1', String(staffTop(staff) - 2 * STEP))
    line.setAttribute('y2', String(staffBottom(staff) + 2 * STEP))
    line.setAttribute('opacity', '1')
    let next: { x: number; y: number } | null = null
    if (s.selected) {
      const found = findDrawn(t, sp, s.selected.voice, s.selected.index)
      for (const el of found?.child.elemset ?? []) {
        el.classList.add('is-selected')
        selectedEls.current.push(el)
      }
      drawn = found?.child ?? drawn
      const el = found?.child.elemset?.[0] as Element | undefined
      const f = frame.current
      if (el && f) {
        const r = el.getBoundingClientRect()
        const b = f.getBoundingClientRect()
        next = { x: Math.round(r.left + r.width / 2 - b.left), y: Math.round(r.top - b.top) }
      }
    }
    setPop((prev) => (prev?.x === next?.x && prev?.y === next?.y ? prev : next))
    const anchor = drawn?.elemset?.[0]
    if (anchor && 'scrollIntoView' in anchor) (anchor as HTMLElement).scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [])

  const onRendered = useCallback(
    (t: TuneObject, el: SVGSVGElement) => {
      tune.current = t
      svg.current = el
      // For the DEV console handle.
      if (box.current) (box.current as unknown as { __tune?: unknown }).__tune = t
      const line = document.createElementNS(SVG_NS, 'line')
      line.setAttribute('class', 'score-insert')
      el.appendChild(line)
      cursor.current = line
      const g = document.createElementNS(SVG_NS, 'g')
      g.setAttribute('class', 'score-ghost')
      g.setAttribute('opacity', '0')
      el.appendChild(g)
      ghost.current = g
      // Rests the serializer added to even the voices out are not in the model: mute them.
      for (const group of groupsOf(t)) {
        for (const voice of group.voices) {
          for (const c of voice.children) {
            if (!isNoteOrRest(c) || !c.abcelem) continue
            if (eventNear(latest.current.spans, c.abcelem.startChar ?? -1, c.abcelem.endChar ?? -1)) continue
            for (const node of c.elemset ?? []) node.classList.add('is-padding')
          }
        }
      }
      sync()
    },
    [sync],
  )

  const clickListener = useCallback<ClickListener>((abcElem, _tune, classes, _analysis, drag) => {
    const { actions: a, spans: sp, state: s } = latest.current
    const el = abcElem as { el_type?: string; startChar?: number; endChar?: number }
    if (el.el_type !== 'note') return
    const hit = eventNear(sp, el.startChar ?? -1, el.endChar ?? -1)
    if (!hit) {
      // A padding rest: the next note goes at the end of that hand.
      const voice = Number(/abcjs-v(\d)/.exec(classes)?.[1] ?? 0) as 0 | 1
      a.select(null)
      a.setHand(voice)
      return
    }
    const target = { voice: hit.voice as 0 | 1, index: hit.index }
    if (s.pending) {
      a.finishPending(target)
      return
    }
    a.select(target)
    if (drag && drag.step) a.movePitch(-drag.step, 'step')
  }, [])

  const player = useScorePlayer({
    abc: text,
    target: box,
    narrow,
    hands: 'both',
    countIn: false,
    onNoteOn,
    onFinish,
    clickListener,
    selectTypes: SELECTABLE,
    dragging: true,
    onRendered,
    stretch: true,
  })

  useEffect(() => onPlayer(player), [player, onPlayer])
  useEffect(() => sync(), [state.cursors, state.selected, state.hand, sync])
  // The popover follows the note when the score box scrolls.
  useEffect(() => {
    const box = scoreBox.current
    if (!box) return
    const onScroll = () => sync()
    box.addEventListener('scroll', onScroll)
    return () => box.removeEventListener('scroll', onScroll)
  }, [sync])

  const hideGhost = () => {
    ghost.current?.setAttribute('opacity', '0')
    box.current?.classList.remove('has-ghost')
  }

  const hitAt = (e: PointerEvent) => {
    const t = tune.current
    const el = svg.current
    if (!t || !el) return null
    return hitTest(t, el, e.clientX, e.clientY, latest.current.state.score, latest.current.spans)
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const g = ghost.current
    if (!g) return
    const hit = hitAt(e)
    if (!hit || hit.kind !== 'place') {
      hideGhost()
      return
    }
    const ledgers: string[] = []
    const top = staffTop(hit.staff)
    const bottom = staffBottom(hit.staff)
    for (let y = top - 2 * STEP; y >= hit.y - 0.1; y -= 2 * STEP) ledgers.push(`<rect x="${hit.x - 9}" y="${y - 0.6}" width="18" height="1.2"/>`)
    for (let y = bottom + 2 * STEP; y <= hit.y + 0.1; y += 2 * STEP) ledgers.push(`<rect x="${hit.x - 9}" y="${y - 0.6}" width="18" height="1.2"/>`)
    g.innerHTML = `${ledgers.join('')}<ellipse cx="${hit.x}" cy="${hit.y}" rx="4.8" ry="3.4" transform="rotate(-20 ${hit.x} ${hit.y})"/>`
    g.setAttribute('opacity', '1')
    box.current?.classList.add('has-ghost')
  }

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    const hit = hitAt(e)
    if (!hit || hit.kind !== 'place') return
    e.preventDefault()
    latest.current.actions.placeAt({ voice: hit.voice, step: hit.step, insertion: hit.insertion, fillTo: hit.fillTo })
    hideGhost()
  }

  return (
    <>
      <div className="score-frame" ref={frame}>
        <div className="score score-edit" ref={scoreBox}>
          <div
            className="score-paper"
            ref={box}
            onPointerMove={onPointerMove}
            onPointerLeave={hideGhost}
            onPointerDown={onPointerDown}
          />
        </div>
        {pop && state.selected && (
          <div ref={popEl} className={`note-pop${narrow ? ' note-pop--sheet' : ''}`} style={narrow ? { top: pop.y } : { left: pop.x, top: pop.y }}>
            <NoteTools state={state} actions={actions} />
          </div>
        )}
      </div>
      {children}
    </>
  )
}
