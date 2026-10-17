import { BAR_TYPES, DYNAMICS, FINGERS, type Alter } from '../../../lib/score/model'
import type { EditorState, useScoreEditor } from '../../../lib/score/useScoreEditor'

type Actions = ReturnType<typeof useScoreEditor>['actions']

/** Everything a selected note can take, in a popover beside it. */
export function NoteTools({ state, actions }: { state: EditorState; actions: Actions }) {
  if (!state.selected) return null
  const sel = state.score.voices[state.selected.voice].events[state.selected.index]
  if (!sel) return null
  const note = sel.kind === 'note' ? sel : null
  const has = (d: string) => sel.decorations.includes(d)
  const alterOf = (a: Alter) => (note ? note.pitches.some((p) => p.alter === a && (a !== 0 || p.explicit)) : false)
  const seg = (pressed: boolean, onClick: () => void, label: string, title?: string, aria?: string) => (
    <button key={label} type="button" className="game-segment" aria-pressed={pressed} onClick={onClick} title={title ?? label} aria-label={aria}>
      {label}
    </button>
  )

  return (
    <div className="note-tools" role="toolbar" aria-label="Selected note">
      <button type="button" className="note-tools-close" onClick={actions.cancelPending} aria-label="Close (Esc)" title="Close (Esc)">
        ×
      </button>
      <div className="note-tools-row">
        {note && (
          <div className="game-segmented" role="group" aria-label="Accidental">
            <button type="button" className="game-segment" aria-pressed={alterOf(1)} onClick={() => actions.accidental(1)} aria-label="Sharp"><span className="score-glyph">♯</span></button>
            <button type="button" className="game-segment" aria-pressed={alterOf(-1)} onClick={() => actions.accidental(-1)} aria-label="Flat"><span className="score-glyph">♭</span></button>
            <button type="button" className="game-segment" aria-pressed={alterOf(0)} onClick={() => actions.accidental(0)} aria-label="Natural"><span className="score-glyph">♮</span></button>
          </div>
        )}
        {note && (
          <div className="game-segmented">
            {seg(!!note.tie, actions.toggleTie, 'Tie', 'Tie (-)')}
            {seg(state.pending?.kind === 'slur' || !!note.slurStart, () => actions.beginPending('slur'), 'Slur', 'Slur to another note (S)')}
            {seg(state.chordMode, actions.toggleChord, 'Chord', 'Stack pitches onto this note (K)')}
          </div>
        )}
        <div className="game-segmented" role="group" aria-label="Dynamics">
          {DYNAMICS.map((d) => (
            <button key={d} type="button" className="game-segment score-dyn" aria-pressed={has(d)} onClick={() => actions.toggleDecoration(d)} title={d}>
              <i>{d}</i>
            </button>
          ))}
          {note && seg(state.pending?.kind === 'cresc' || has('crescendo('), () => actions.beginPending('cresc'), '<', 'Crescendo to another note', 'Crescendo')}
          {note && seg(state.pending?.kind === 'dim' || has('diminuendo('), () => actions.beginPending('dim'), '>', 'Diminuendo to another note', 'Diminuendo')}
        </div>
      </div>
      <div className="note-tools-row">
        {note && (
          <div className="game-segmented" role="group" aria-label="Fingering">
            {FINGERS.map((f) => seg(has(f), () => actions.toggleDecoration(f), f, `Finger ${f}`))}
            {seg(has('breath'), () => actions.toggleDecoration('breath'), 'Lift', 'Breath mark')}
            {seg(has('arpeggio'), () => actions.toggleDecoration('arpeggio'), 'Roll', 'Rolled chord')}
          </div>
        )}
        <div className="game-segmented" role="group" aria-label="Bar line after this bar">
          {BAR_TYPES.map((b) => seg(false, () => actions.setBarType(b.value), b.mark, b.title, b.title))}
        </div>
        <div className="game-segmented">
          <button type="button" className="game-segment note-tools-trash" onClick={actions.deleteSelected} aria-label="Delete this note" title="Delete this note (Delete)">
            <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3.5 5.5h13M8 5.5V3.5h4v2M5.5 5.5l.8 11h7.4l.8-11M8.3 8.5v5.5M11.7 8.5v5.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
