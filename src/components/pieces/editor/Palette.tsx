import { BAR_TYPES, DYNAMICS, FINGERS, LENGTHS, type Alter, type ScoreEvent } from '../../../lib/score/model'
import type { EditorState, useScoreEditor } from '../../../lib/score/useScoreEditor'

type Actions = ReturnType<typeof useScoreEditor>['actions']

/** The toolbar. With a note selected it shows that note's settings; otherwise what the next note gets. */
export function Palette({ state, actions }: { state: EditorState; actions: Actions }) {
  const sel: ScoreEvent | null = state.selected
    ? state.score.voices[state.selected.voice].events[state.selected.index]
    : null
  const length = sel ? sel.length : state.length
  const dotted = sel ? !!sel.dotted : state.dotted
  const note = sel?.kind === 'note' ? sel : null
  const has = (d: string) => sel?.decorations.includes(d) ?? false
  const alterOf = (a: Alter) =>
    note ? note.pitches.some((p) => p.alter === a && (a !== 0 || p.explicit)) : state.armedAccidental === a

  return (
    <div className="score-palette" role="toolbar" aria-label="Note palette">
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
      <div className="game-segmented">
        <button type="button" className="game-segment" onClick={actions.insertRest} title="Rest (R)">
          Rest
        </button>
      </div>
      <div className="game-segmented" role="group" aria-label="Accidental">
        <button type="button" className="game-segment" aria-pressed={alterOf(1)} onClick={() => actions.accidental(1)} aria-label="Sharp">♯</button>
        <button type="button" className="game-segment" aria-pressed={alterOf(-1)} onClick={() => actions.accidental(-1)} aria-label="Flat">♭</button>
        <button type="button" className="game-segment" aria-pressed={alterOf(0)} onClick={() => actions.accidental(0)} aria-label="Natural">♮</button>
      </div>
      <div className="game-segmented">
        <button type="button" className="game-segment" aria-pressed={!!note?.tie} onClick={actions.toggleTie} disabled={!note} title="Tie (-)">
          Tie
        </button>
        <button type="button" className="game-segment" aria-pressed={state.pending?.kind === 'slur' || !!note?.slurStart} onClick={() => actions.beginPending('slur')} disabled={!note} title="Slur (S)">
          Slur
        </button>
        <button type="button" className="game-segment" aria-pressed={state.chordMode} onClick={actions.toggleChord} title="Chord (K)">
          Chord
        </button>
      </div>
      <div className="game-segmented" role="group" aria-label="Dynamics">
        {DYNAMICS.map((d) => (
          <button key={d} type="button" className="game-segment score-dyn" aria-pressed={has(d)} onClick={() => actions.toggleDecoration(d)} disabled={!sel}>
            <i>{d}</i>
          </button>
        ))}
        <button type="button" className="game-segment" aria-pressed={state.pending?.kind === 'cresc' || has('crescendo(')} onClick={() => actions.beginPending('cresc')} disabled={!note} aria-label="Crescendo" title="Crescendo">
          &lt;
        </button>
        <button type="button" className="game-segment" aria-pressed={state.pending?.kind === 'dim' || has('diminuendo(')} onClick={() => actions.beginPending('dim')} disabled={!note} aria-label="Diminuendo" title="Diminuendo">
          &gt;
        </button>
      </div>
      <div className="game-segmented" role="group" aria-label="Fingering">
        {FINGERS.map((f) => (
          <button key={f} type="button" className="game-segment" aria-pressed={has(f)} onClick={() => actions.toggleDecoration(f)} disabled={!note}>
            {f}
          </button>
        ))}
        <button type="button" className="game-segment" aria-pressed={has('breath')} onClick={() => actions.toggleDecoration('breath')} disabled={!sel} title="Breath mark">
          Lift
        </button>
        <button type="button" className="game-segment" aria-pressed={has('arpeggio')} onClick={() => actions.toggleDecoration('arpeggio')} disabled={!note} title="Rolled chord">
          Roll
        </button>
      </div>
      <div className="game-segmented" role="group" aria-label="Bar line">
        {BAR_TYPES.map((b) => (
          <button key={b.value} type="button" className="game-segment" onClick={() => actions.setBarType(b.value)} title={b.title} aria-label={b.title}>
            {b.mark}
          </button>
        ))}
      </div>
      <span className="score-palette-spacer" />
      <div className="game-segmented">
        <button type="button" className="game-segment" onClick={actions.undo} disabled={state.past.length === 0} title="Undo (⌘Z)">
          Undo
        </button>
        <button type="button" className="game-segment" onClick={actions.redo} disabled={state.future.length === 0} title="Redo (⇧⌘Z)">
          Redo
        </button>
      </div>
    </div>
  )
}
