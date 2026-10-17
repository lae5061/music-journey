import { LENGTHS } from '../../../lib/score/model'
import type { EditorState, useScoreEditor } from '../../../lib/score/useScoreEditor'

type Actions = ReturnType<typeof useScoreEditor>['actions']

/** The row for adding notes: hand, length, rest, a sharp or flat for the next click, chord. */
export function Palette({ state, actions }: { state: EditorState; actions: Actions }) {
  const sel = state.selected ? state.score.voices[state.selected.voice].events[state.selected.index] : null
  const length = sel ? sel.length : state.length
  const dotted = sel ? !!sel.dotted : state.dotted

  return (
    <div className="score-palette" role="toolbar" aria-label="Adding notes">
      {state.score.hands === 2 && (
        <div className="game-segmented" role="group" aria-label="Hand">
          <button type="button" className="game-segment" aria-pressed={state.hand === 0} onClick={() => actions.setHand(0)} title="Right hand (H)">
            R.H.
          </button>
          <button type="button" className="game-segment" aria-pressed={state.hand === 1} onClick={() => actions.setHand(1)} title="Left hand (H)">
            L.H.
          </button>
        </div>
      )}
      <div className="game-segmented" role="group" aria-label="Note length">
        {LENGTHS.map((l) => (
          <button key={l.value} type="button" className="game-segment" aria-pressed={length === l.value} onClick={() => actions.setLength(l.value)} title={`${l.title} (${l.short})`}>
            {l.title}
          </button>
        ))}
        <button type="button" className="game-segment" aria-pressed={dotted} onClick={actions.toggleDot} title="Dotted (.)">
          Dot
        </button>
      </div>
      <div className="game-segmented">
        <button type="button" className="game-segment" onClick={actions.insertRest} title="Rest (R)">
          Rest
        </button>
        <button type="button" className="game-segment" aria-pressed={state.armedAccidental === 1} onClick={() => actions.accidental(1)} aria-label="Next note sharp" title="Sharp for the next click">
          <span className="score-glyph">♯</span>
        </button>
        <button type="button" className="game-segment" aria-pressed={state.armedAccidental === -1} onClick={() => actions.accidental(-1)} aria-label="Next note flat" title="Flat for the next click">
          <span className="score-glyph">♭</span>
        </button>
        <button type="button" className="game-segment" aria-pressed={state.chordMode} onClick={actions.toggleChord} title="Chord (K)">
          Chord
        </button>
      </div>
    </div>
  )
}
