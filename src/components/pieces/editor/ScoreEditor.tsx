import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { rangeFor } from '../../../lib/keyboard'
import { serialize } from '../../../lib/score/serialize'
import { midiOf } from '../../../lib/score/spell'
import type { useScoreEditor } from '../../../lib/score/useScoreEditor'
import { useMediaQuery } from '../../../lib/useMediaQuery'
import type { PlayerStatus, ScorePlayer } from '../../../lib/useScorePlayer'
import { useScoreSound } from '../../../lib/useScoreSound'
import { typingHint, useTypingKeys } from '../../../lib/useTypingKeys'
import { MidiControl } from '../../MidiControl'
import { Piano } from '../../Piano'
import { HeaderFields } from './HeaderFields'
import { Palette } from './Palette'
import { ScoreCanvas } from './ScoreCanvas'

type Editor = ReturnType<typeof useScoreEditor>

interface ScoreEditorProps {
  editor: Editor
  active: boolean
  pressed: ReadonlySet<number>
  onPressKey: (midi: number) => void
  onHoldKey: (midi: number, on: boolean) => void
  onRegisterInput: (fn: ((midi: number) => void) | null) => void
  controls: React.ReactNode
}

const NARROW = '(max-width: 700px)'
const BOARD_FOCUS = [60, 72]

/** The Score tab: palette, header fields, the drawn score, and the keyboard that feeds it. */
export function ScoreEditor({ editor, active, pressed, onPressKey, onHoldKey, onRegisterInput, controls }: ScoreEditorProps) {
  const { state, actions, enterMidi } = editor
  const narrow = useMediaQuery(NARROW)
  const { text, spans } = useMemo(() => serialize(state.score, { titles: false }), [state.score])
  const sound = useScoreSound(onHoldKey)
  // The player object changes every render; keep it in a ref and only its status in state.
  const playerRef = useRef<ScorePlayer | null>(null)
  const [status, setStatus] = useState<PlayerStatus>('loading')
  const onPlayer = useCallback((p: ScorePlayer) => {
    playerRef.current = p
    setStatus(p.status)
  }, [])
  const hear = useCallback(() => {
    const p = playerRef.current
    if (!p) return
    if (p.status === 'playing') {
      p.pause()
      sound.release()
    } else p.play()
  }, [sound])

  const play = useCallback((midi: number) => {
    onPressKey(midi)
    enterMidi(midi)
  }, [onPressKey, enterMidi])

  const octave = useTypingKeys(play, active)

  // A MIDI note has already lit or sounded in App; here it only enters the note.
  useEffect(() => {
    if (!active) return
    onRegisterInput((midi) => enterMidi(midi))
    return () => onRegisterInput(null)
  }, [active, onRegisterInput, enterMidi])

  // Editor shortcuts, kept off the letters the typing hook owns (c d e f g a b, z, x).
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const tag = target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable) return
      const meta = e.metaKey || e.ctrlKey
      if (meta && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) actions.redo()
        else actions.undo()
        return
      }
      if (meta && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        actions.redo()
        return
      }
      if (meta || e.altKey) return
      switch (e.key) {
        case '1': actions.setLength(4); break
        case '2': actions.setLength(2); break
        case '4': actions.setLength(1); break
        case '8': actions.setLength(0.5); break
        case '.': actions.toggleDot(); break
        case '0':
        case 'r':
        case 'R': actions.insertRest(); break
        case '-': actions.toggleTie(); break
        case 's':
        case 'S': actions.beginPending('slur'); break
        case 'k':
        case 'K': actions.toggleChord(); break
        case 'h':
        case 'H': actions.setHand(state.hand === 0 ? 1 : 0); break
        case 'ArrowUp': if (state.selected) { e.preventDefault(); actions.movePitch(1, e.shiftKey ? 'semitone' : 'step') } break
        case 'ArrowDown': if (state.selected) { e.preventDefault(); actions.movePitch(-1, e.shiftKey ? 'semitone' : 'step') } break
        case 'ArrowLeft': e.preventDefault(); actions.moveSelection(-1); break
        case 'ArrowRight': e.preventDefault(); actions.moveSelection(1); break
        case 'Delete': e.preventDefault(); actions.deleteSelected(); break
        case 'Backspace': e.preventDefault(); if (state.selected) actions.deleteSelected(); else actions.backspace(); break
        case 'Escape': actions.cancelPending(); break
        case ' ': e.preventDefault(); hear(); break
        default: return
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, actions, state.hand, state.selected, hear])

  const midis = useMemo(() => {
    const out: number[] = [48, 84]
    for (const v of state.score.voices) for (const e of v.events) if (e.kind === 'note') for (const p of e.pitches) out.push(midiOf(p))
    return out
  }, [state.score])
  const range = useMemo(() => rangeFor(midis), [midis])
  const highlight = useMemo(() => {
    if (!state.selected) return undefined
    const e = state.score.voices[state.selected.voice].events[state.selected.index]
    return e?.kind === 'note' ? new Set(e.pitches.map(midiOf)) : undefined
  }, [state.selected, state.score])

  const hint = state.pending
    ? state.pending.kind === 'slur'
      ? 'Slur: click the note where it ends. Esc cancels.'
      : state.pending.kind === 'cresc'
        ? 'Crescendo: click the note where it ends. Esc cancels.'
        : 'Diminuendo: click the note where it ends. Esc cancels.'
    : state.chordMode && state.selected
      ? 'Chord: each pitch you enter stacks onto the selected note.'
      : state.selected
        ? 'Selected. Arrows move it, Delete removes it, the palette changes it; a new pitch goes in after it.'
        : `${state.hand === 0 ? 'Right' : 'Left'} hand. Tap a key, type C to B, play MIDI, or click a line or space.`

  return (
    <>
      <div className="game-board score-board score-editor">
        <HeaderFields score={state.score} actions={actions} open={!narrow} />
        <Palette state={state} actions={actions} />
        <p className={`game-message${state.pending ? ' is-wrong' : ''}`} aria-live="polite">
          {hint}
        </p>
        <ScoreCanvas
          text={text}
          spans={spans}
          state={state}
          actions={actions}
          narrow={narrow}
          onNoteOn={sound.onNoteOn}
          onFinish={sound.release}
          onPlayer={onPlayer}
        >
          <div className="game-line-controls">
            <button type="button" className="btn btn-secondary" onClick={hear} disabled={status === 'loading' || status === 'error'}>
              {status === 'playing' ? 'Pause' : 'Hear it'}
            </button>
            {controls}
          </div>
        </ScoreCanvas>
      </div>
      <Piano range={range} focus={BOARD_FOCUS} highlight={highlight} pressed={pressed} onPress={play} label="Keyboard — enter a note" />
      <p className="game-keys">{typingHint(octave)} Keys 1 2 4 8 pick the length, R a rest, S a slur, Delete removes.</p>
      <MidiControl />
    </>
  )
}
