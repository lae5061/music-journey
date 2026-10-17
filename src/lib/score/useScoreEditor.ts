import { useCallback, useMemo, useReducer, useRef } from 'react'
import {
  addPitch,
  barOf,
  fillToBar,
  insertEvent,
  makeNote,
  makeRest,
  removeEvent,
  setBarType as setBarTypeIn,
  setEventLength,
  toggleDecoration,
  updateEvent,
  updateNote,
} from './edit'
import {
  DYNAMICS,
  emptyScore,
  FINGERS,
  keyAlter,
  letterOf,
  type Alter,
  type BarType,
  type Length,
  type Pitch,
  type Score,
} from './model'
import { midiOf, spellMidi } from './spell'

/** The editor's state: the score, its history, and where the next note goes. */

export type Hand = 0 | 1
export type Pending = { kind: 'slur' | 'cresc' | 'dim'; from: { voice: Hand; index: number } } | null

export interface Selection {
  voice: Hand
  index: number
}

export interface StaffHit {
  voice: Hand
  step: number
  insertion: number
  fillTo: number | null
}

export interface EditorState {
  score: Score
  past: Score[]
  future: Score[]
  hand: Hand
  length: Length
  dotted: boolean
  chordMode: boolean
  cursors: [number, number]
  selected: Selection | null
  pending: Pending
  armedAccidental: Alter | null
  /** Why the last thing asked for could not be done, shown until the next action. */
  notice: string | null
}

type Action =
  | { type: 'setLength'; length: Length }
  | { type: 'toggleDot' }
  | { type: 'setHand'; hand: Hand }
  | { type: 'toggleChord' }
  | { type: 'armAccidental'; alter: Alter }
  | { type: 'insertPitch'; pitch: Pitch }
  | { type: 'insertRest' }
  | { type: 'placeAt'; hit: StaffHit }
  | { type: 'select'; selection: Selection | null }
  | { type: 'moveSelection'; delta: 1 | -1 }
  | { type: 'deleteSelected' }
  | { type: 'backspace' }
  | { type: 'movePitch'; delta: number; mode: 'step' | 'semitone' }
  | { type: 'accidental'; alter: Alter }
  | { type: 'toggleTie' }
  | { type: 'beginPending'; kind: 'slur' | 'cresc' | 'dim' }
  | { type: 'finishPending'; target: Selection }
  | { type: 'cancelPending' }
  | { type: 'toggleDecoration'; name: string }
  | { type: 'setBarType'; barType: BarType }
  | { type: 'setHeader'; patch: Partial<Pick<Score, 'title' | 'composer' | 'bpm' | 'key' | 'meter'>> }
  | { type: 'setHands'; hands: 1 | 2 }
  | { type: 'replaceScore'; score: Score }
  | { type: 'undo' }
  | { type: 'redo' }

const HISTORY = 200

export function initialState(score: Score = emptyScore(2)): EditorState {
  return {
    score,
    past: [],
    future: [],
    hand: 0,
    length: 1,
    dotted: false,
    chordMode: false,
    cursors: [score.voices[0].events.length, score.voices[1]?.events.length ?? 0],
    selected: null,
    pending: null,
    armedAccidental: null,
    notice: null,
  }
}

const clampCursors = (state: EditorState): EditorState => ({
  ...state,
  cursors: [
    Math.min(state.cursors[0], state.score.voices[0].events.length),
    Math.min(state.cursors[1], state.score.voices[1]?.events.length ?? 0),
  ],
})

/** A model change: push history, drop the redo stack. */
const commit = (state: EditorState, score: Score, extra: Partial<EditorState> = {}): EditorState =>
  clampCursors({
    ...state,
    ...extra,
    score,
    past: [...state.past.slice(-(HISTORY - 1)), state.score],
    future: [],
  })

const withCursor = (cursors: [number, number], hand: Hand, value: number): [number, number] =>
  hand === 0 ? [value, cursors[1]] : [cursors[0], value]

function insertAtCursor(state: EditorState, event: ReturnType<typeof makeNote> | ReturnType<typeof makeRest>): EditorState {
  const hand = state.hand
  if (!state.score.voices[hand]) return state
  const at = state.cursors[hand]
  const { score, count } = insertEvent(state.score, hand, at, event)
  // A new note is not selected: the next length key sets the next note, not this one.
  return commit(state, score, {
    cursors: withCursor(state.cursors, hand, at + count),
    selected: null,
    armedAccidental: null,
  })
}

const selectionBar = (state: EditorState) => {
  if (state.selected) return barOf(state.score, state.selected.voice, state.selected.index)
  const i = state.cursors[state.hand]
  return i > 0 ? barOf(state.score, state.hand, i - 1) : 0
}

export function reduce(previous: EditorState, action: Action): EditorState {
  // A notice lasts one action.
  const state = previous.notice ? { ...previous, notice: null } : previous
  switch (action.type) {
    case 'setLength': {
      const next = { ...state, length: action.length }
      if (!state.selected) return next
      const { voice, index } = state.selected
      const { score, count } = setEventLength(state.score, voice, index, action.length, state.dotted)
      return commit(next, score, { cursors: withCursor(state.cursors, voice, index + count), selected: { voice, index: index + count - 1 } })
    }
    case 'toggleDot': {
      const dotted = !state.dotted
      const next = { ...state, dotted }
      if (!state.selected) return next
      const { voice, index } = state.selected
      const e = state.score.voices[voice].events[index]
      const { score, count } = setEventLength(state.score, voice, index, e.length, dotted)
      return commit(next, score, { cursors: withCursor(state.cursors, voice, index + count), selected: { voice, index: index + count - 1 } })
    }
    case 'setHand':
      if (!state.score.voices[action.hand]) return state
      return { ...state, hand: action.hand, selected: null, pending: null }
    case 'toggleChord':
      return { ...state, chordMode: !state.chordMode }
    case 'armAccidental':
      return { ...state, armedAccidental: state.armedAccidental === action.alter ? null : action.alter }

    case 'insertPitch': {
      if (state.chordMode && state.selected) {
        const { voice, index } = state.selected
        return commit(state, updateNote(state.score, voice, index, (n) => addPitch(n, action.pitch)))
      }
      // With a note selected, a new pitch replaces it and the selection moves on, so a
      // run of wrong notes can be corrected one after another.
      if (state.selected) {
        const { voice, index } = state.selected
        const events = state.score.voices[voice].events
        const score = updateEvent(state.score, voice, index, (e) =>
          e.kind === 'note'
            ? { ...e, pitches: [action.pitch] }
            : { kind: 'note', pitches: [action.pitch], length: e.length, dotted: e.dotted, decorations: e.decorations },
        )
        const next = index + 1 < events.length ? { voice, index: index + 1 } : null
        return commit(state, score, { selected: next, cursors: withCursor(state.cursors, voice, index + 1 + (next ? 1 : 0)) })
      }
      return insertAtCursor(state, makeNote(action.pitch, state.length, state.dotted))
    }
    case 'insertRest':
      return insertAtCursor(state, makeRest(state.length, state.dotted))
    case 'placeAt': {
      const { voice, step, insertion, fillTo } = action.hit
      let score = state.score
      let at = insertion
      if (fillTo !== null) {
        score = fillToBar(score, voice, fillTo)
        at = score.voices[voice].events.length
      }
      const alter = state.armedAccidental ?? keyAlter(score.key, letterOf(step))
      const pitch: Pitch = state.armedAccidental === 0 && keyAlter(score.key, letterOf(step)) !== 0 ? { step, alter, explicit: true } : { step, alter }
      const res = insertEvent(score, voice, at, makeNote(pitch, state.length, state.dotted))
      return commit(state, res.score, {
        hand: voice,
        cursors: withCursor(state.cursors, voice, at + res.count),
        selected: null,
        armedAccidental: null,
        pending: null,
      })
    }

    case 'select': {
      if (!action.selection) return { ...state, selected: null }
      const { voice, index } = action.selection
      if (!state.score.voices[voice]?.events[index]) return state
      return { ...state, hand: voice, selected: action.selection, cursors: withCursor(state.cursors, voice, index + 1) }
    }
    case 'moveSelection': {
      const hand = state.selected?.voice ?? state.hand
      const events = state.score.voices[hand].events
      const current = state.selected ? state.selected.index : action.delta < 0 ? state.cursors[hand] : state.cursors[hand] - 1
      const next = current + action.delta
      // Off either end: nothing selected, and new notes go on the end as usual.
      if (next < 0 || next >= events.length) {
        return { ...state, selected: null, cursors: withCursor(state.cursors, hand, events.length) }
      }
      return { ...state, hand, selected: { voice: hand, index: next }, cursors: withCursor(state.cursors, hand, next + 1) }
    }
    case 'deleteSelected': {
      if (!state.selected) return state
      const { voice, index } = state.selected
      return commit(state, removeEvent(state.score, voice, index), {
        cursors: withCursor(state.cursors, voice, index),
        selected: index > 0 ? { voice, index: index - 1 } : null,
        pending: null,
      })
    }
    case 'backspace': {
      const hand = state.hand
      const i = state.cursors[hand] - 1
      if (i < 0) return state
      return commit(state, removeEvent(state.score, hand, i), {
        cursors: withCursor(state.cursors, hand, i),
        selected: i > 0 ? { voice: hand, index: i - 1 } : null,
        pending: null,
      })
    }

    case 'movePitch': {
      if (!state.selected) return state
      const { voice, index } = state.selected
      return commit(
        state,
        updateNote(state.score, voice, index, (n) => ({
          ...n,
          pitches: n.pitches.map((p) => {
            if (action.mode === 'step') {
              const step = p.step + action.delta
              return { step, alter: keyAlter(state.score.key, letterOf(step)) }
            }
            return spellMidi(midiOf(p) + action.delta, state.score.key)
          }),
        })),
      )
    }
    case 'accidental': {
      if (!state.selected) return reduce(state, { type: 'armAccidental', alter: action.alter })
      const { voice, index } = state.selected
      const e = state.score.voices[voice].events[index]
      if (e.kind !== 'note') return state
      return commit(
        state,
        updateNote(state.score, voice, index, (n) => ({
          ...n,
          pitches: n.pitches.map((p) => {
            const inKey = keyAlter(state.score.key, letterOf(p.step))
            // Pressing the sign it already has takes it back to what the key says.
            if (p.alter === action.alter && (p.explicit || action.alter !== inKey)) return { step: p.step, alter: inKey }
            return action.alter === 0 && inKey !== 0 ? { step: p.step, alter: 0 } : action.alter === 0 ? { step: p.step, alter: 0, explicit: true } : { step: p.step, alter: action.alter }
          }),
        })),
      )
    }
    case 'toggleTie': {
      if (!state.selected) return state
      const { voice, index } = state.selected
      return commit(state, updateNote(state.score, voice, index, (n) => ({ ...n, tie: n.tie ? undefined : true })))
    }
    case 'beginPending': {
      if (!state.selected) return state
      if (state.pending?.kind === action.kind) return { ...state, pending: null }
      return { ...state, pending: { kind: action.kind, from: state.selected } }
    }
    case 'finishPending': {
      const pending = state.pending
      if (!pending) return state
      const { from } = pending
      const { voice } = action.target
      const what = pending.kind === 'slur' ? 'A slur' : 'A hairpin'
      // Each hand is its own voice in ABC, and a slur or hairpin lives inside one voice.
      if (voice !== from.voice) {
        return { ...state, notice: `${what} cannot cross from one hand to the other; pick a note in the same hand, or press Esc.` }
      }
      if (action.target.index === from.index) {
        return { ...state, notice: `${what} needs two different notes; pick the note where it ends.` }
      }
      // Chosen back to front is fine: it runs from the earlier note to the later one.
      const a = Math.min(from.index, action.target.index)
      const b = Math.max(from.index, action.target.index)
      let score = state.score
      if (pending.kind === 'slur') {
        score = updateNote(score, voice, a, (n) => ({ ...n, slurStart: true }))
        score = updateNote(score, voice, b, (n) => ({ ...n, slurEnd: true }))
      } else {
        const name = pending.kind === 'cresc' ? 'crescendo' : 'diminuendo'
        score = updateEvent(score, voice, a, (e) => toggleDecoration(e, `${name}(`))
        score = updateEvent(score, voice, b, (e) => toggleDecoration(e, `${name})`))
      }
      return commit(state, score, { pending: null, selected: { voice, index: b }, cursors: withCursor(state.cursors, voice, b + 1) })
    }
    case 'cancelPending': {
      // With nothing selected there is no visible insertion point, so adding resumes at the end.
      const hand = state.selected?.voice ?? state.hand
      return { ...state, pending: null, selected: null, cursors: withCursor(state.cursors, hand, state.score.voices[hand].events.length) }
    }

    case 'toggleDecoration': {
      if (!state.selected) return state
      const { voice, index } = state.selected
      const exclusive = (DYNAMICS as readonly string[]).includes(action.name)
        ? DYNAMICS
        : (FINGERS as readonly string[]).includes(action.name)
          ? FINGERS
          : []
      return commit(state, updateEvent(state.score, voice, index, (e) => toggleDecoration(e, action.name, exclusive)))
    }
    case 'setBarType': {
      const bar = selectionBar(state)
      const boundary = action.barType === 'repeatStart' ? bar - 1 : bar
      return commit(state, setBarTypeIn(state.score, boundary, action.barType))
    }
    case 'setHeader':
      return commit(state, { ...state.score, ...action.patch })
    case 'setHands': {
      if (action.hands === state.score.hands) return state
      const voices = action.hands === 2 ? [state.score.voices[0], { clef: 'bass' as const, events: [] }] : [state.score.voices[0]]
      return commit(state, { ...state.score, hands: action.hands, voices }, { hand: 0, selected: null, pending: null })
    }
    case 'replaceScore':
      return commit(state, action.score, {
        hand: 0,
        selected: null,
        pending: null,
        cursors: [action.score.voices[0].events.length, action.score.voices[1]?.events.length ?? 0],
      })
    case 'undo': {
      const prev = state.past[state.past.length - 1]
      if (!prev) return state
      return clampCursors({ ...state, score: prev, past: state.past.slice(0, -1), future: [state.score, ...state.future], selected: null, pending: null })
    }
    case 'redo': {
      const next = state.future[0]
      if (!next) return state
      return clampCursors({ ...state, score: next, past: [...state.past, state.score], future: state.future.slice(1), selected: null, pending: null })
    }
  }
}

export function useScoreEditor(start?: Score) {
  const [state, dispatch] = useReducer(reduce, start, (s) => initialState(s))

  // The key is needed to spell a MIDI note; keep the latest without re-creating the callback.
  const keyRef = useRef(state.score.key)
  keyRef.current = state.score.key
  const enterMidi = useCallback((midi: number) => dispatch({ type: 'insertPitch', pitch: spellMidi(midi, keyRef.current) }), [])

  const actions = useMemo(
    () => ({
      setLength: (length: Length) => dispatch({ type: 'setLength', length }),
      toggleDot: () => dispatch({ type: 'toggleDot' }),
      setHand: (hand: Hand) => dispatch({ type: 'setHand', hand }),
      toggleChord: () => dispatch({ type: 'toggleChord' }),
      armAccidental: (alter: Alter) => dispatch({ type: 'armAccidental', alter }),
      insertPitch: (pitch: Pitch) => dispatch({ type: 'insertPitch', pitch }),
      insertRest: () => dispatch({ type: 'insertRest' }),
      placeAt: (hit: StaffHit) => dispatch({ type: 'placeAt', hit }),
      select: (selection: Selection | null) => dispatch({ type: 'select', selection }),
      moveSelection: (delta: 1 | -1) => dispatch({ type: 'moveSelection', delta }),
      deleteSelected: () => dispatch({ type: 'deleteSelected' }),
      backspace: () => dispatch({ type: 'backspace' }),
      movePitch: (delta: number, mode: 'step' | 'semitone') => dispatch({ type: 'movePitch', delta, mode }),
      accidental: (alter: Alter) => dispatch({ type: 'accidental', alter }),
      toggleTie: () => dispatch({ type: 'toggleTie' }),
      beginPending: (kind: 'slur' | 'cresc' | 'dim') => dispatch({ type: 'beginPending', kind }),
      finishPending: (target: Selection) => dispatch({ type: 'finishPending', target }),
      cancelPending: () => dispatch({ type: 'cancelPending' }),
      toggleDecoration: (name: string) => dispatch({ type: 'toggleDecoration', name }),
      setBarType: (barType: BarType) => dispatch({ type: 'setBarType', barType }),
      setHeader: (patch: Partial<Pick<Score, 'title' | 'composer' | 'bpm' | 'key' | 'meter'>>) => dispatch({ type: 'setHeader', patch }),
      setHands: (hands: 1 | 2) => dispatch({ type: 'setHands', hands }),
      replaceScore: (score: Score) => dispatch({ type: 'replaceScore', score }),
      undo: () => dispatch({ type: 'undo' }),
      redo: () => dispatch({ type: 'redo' }),
    }),
    [],
  )

  return { state, actions, enterMidi }
}
