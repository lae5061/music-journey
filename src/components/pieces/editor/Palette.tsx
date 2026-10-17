import { BAR_TYPES, DYNAMICS, FINGERS, LENGTHS, type Alter, type ScoreEvent } from '../../../lib/score/model'
import type { EditorState, useScoreEditor } from '../../../lib/score/useScoreEditor'

type Actions = ReturnType<typeof useScoreEditor>['actions']

/**
 * The toolbar, in two moods. While adding notes it holds only what adding needs: the
 * hand, the length, a rest, chord mode. With a note selected it becomes that note's
 * tools instead: accidental, tie and slur, dynamics, fingering, the bar line after it.
 */
export function Palette({ state, actions }: { state: EditorState; actions: Actions }) {
  const sel: ScoreEvent | null = state.selected
    ? state.score.voices[state.selected.voice].events[state.selected.index]
    : null
  const length = sel ? sel.length : state.length
  const dotted = sel ? !!sel.dotted : state.dotted
  const note = sel?.kind === 'note' ? sel : null

  const lengths = (
    <div className="game-segmented" role="group" aria-label="Note length">
      {LENGTHS.map((l) => (
        <button key={l.value} type="button" className="game-segment" aria-pressed={length === l.value} onClick={() => actions.setLength(l.value)} title={`${l.title} (${l.short})`}>
          {l.title}
        </button>
      ))}
      <button type="button" className="game-segment" aria-pressed={dotted} onClick={actions.toggleDot} aria-label="Dotted" title="Dotted (.)">
        ·
      </button>
    </div>
  )

  if (!sel) {
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
        {lengths}
        <div className="game-segmented">
          <button type="button" className="game-segment" onClick={actions.insertRest} title="Rest (R)">
            Rest
          </button>
          <button type="button" className="game-segment" aria-pressed={state.armedAccidental === 1} onClick={() => actions.accidental(1)} aria-label="Next note sharp" title="Sharp for the next click">
            ♯
          </button>
          <button type="button" className="game-segment" aria-pressed={state.armedAccidental === -1} onClick={() => actions.accidental(-1)} aria-label="Next note flat" title="Flat for the next click">
            ♭
          </button>
          <button type="button" className="game-segment" aria-pressed={state.chordMode} onClick={actions.toggleChord} title="Chord (K)">
            Chord
          </button>
        </div>
      </div>
    )
  }

  const has = (d: string) => sel.decorations.includes(d)
  const alterOf = (a: Alter) => (note ? note.pitches.some((p) => p.alter === a && (a !== 0 || p.explicit)) : false)

  return (
    <div className="score-palette score-palette--note" role="toolbar" aria-label="Selected note">
      {lengths}
      {note && (
        <>
          <div className="game-segmented" role="group" aria-label="Accidental">
            <button type="button" className="game-segment" aria-pressed={alterOf(1)} onClick={() => actions.accidental(1)} aria-label="Sharp">♯</button>
            <button type="button" className="game-segment" aria-pressed={alterOf(-1)} onClick={() => actions.accidental(-1)} aria-label="Flat">♭</button>
            <button type="button" className="game-segment" aria-pressed={alterOf(0)} onClick={() => actions.accidental(0)} aria-label="Natural">♮</button>
          </div>
          <div className="game-segmented">
            <button type="button" className="game-segment" aria-pressed={!!note.tie} onClick={actions.toggleTie} title="Tie (-)">
              Tie
            </button>
            <button type="button" className="game-segment" aria-pressed={state.pending?.kind === 'slur' || !!note.slurStart} onClick={() => actions.beginPending('slur')} title="Slur (S)">
              Slur
            </button>
            <button type="button" className="game-segment" aria-pressed={state.chordMode} onClick={actions.toggleChord} title="Chord (K)">
              Chord
            </button>
          </div>
        </>
      )}
      <div className="game-segmented" role="group" aria-label="Dynamics">
        {DYNAMICS.map((d) => (
          <button key={d} type="button" className="game-segment score-dyn" aria-pressed={has(d)} onClick={() => actions.toggleDecoration(d)}>
            <i>{d}</i>
          </button>
        ))}
        {note && (
          <>
            <button type="button" className="game-segment" aria-pressed={state.pending?.kind === 'cresc' || has('crescendo(')} onClick={() => actions.beginPending('cresc')} aria-label="Crescendo" title="Crescendo">
              &lt;
            </button>
            <button type="button" className="game-segment" aria-pressed={state.pending?.kind === 'dim' || has('diminuendo(')} onClick={() => actions.beginPending('dim')} aria-label="Diminuendo" title="Diminuendo">
              &gt;
            </button>
          </>
        )}
      </div>
      {note && (
        <div className="game-segmented" role="group" aria-label="Fingering">
          {FINGERS.map((f) => (
            <button key={f} type="button" className="game-segment" aria-pressed={has(f)} onClick={() => actions.toggleDecoration(f)}>
              {f}
            </button>
          ))}
          <button type="button" className="game-segment" aria-pressed={has('breath')} onClick={() => actions.toggleDecoration('breath')} title="Breath mark">
            Lift
          </button>
          <button type="button" className="game-segment" aria-pressed={has('arpeggio')} onClick={() => actions.toggleDecoration('arpeggio')} title="Rolled chord">
            Roll
          </button>
        </div>
      )}
      <div className="game-segmented" role="group" aria-label="Bar line after this bar">
        {BAR_TYPES.map((b) => (
          <button key={b.value} type="button" className="game-segment" onClick={() => actions.setBarType(b.value)} title={b.title} aria-label={b.title}>
            {b.mark}
          </button>
        ))}
      </div>
      <div className="game-segmented">
        <button type="button" className="game-segment" onClick={actions.deleteSelected} title="Delete">
          Delete
        </button>
        <button type="button" className="game-segment" onClick={actions.cancelPending} title="Back to adding (Esc)">
          Done
        </button>
      </div>
    </div>
  )
}
