import { useEffect, useRef, useState } from 'react'
import { LEVEL_LABEL, type Piece, type PieceLevel } from '../../data/pieces'
import { ABC_SKELETON, loadAbcjs, type Abcjs } from '../../lib/abc'
import { unlockAudio } from '../../lib/audio'
import { pieceHref, piecesHref } from '../../lib/route'
import { installDevCheck } from '../../lib/score/devCheck'
import { emptyScore } from '../../lib/score/model'
import { parseAbc } from '../../lib/score/parse'
import { serialize } from '../../lib/score/serialize'
import { useScoreEditor } from '../../lib/score/useScoreEditor'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { useScorePlayer } from '../../lib/useScorePlayer'
import { useScoreSound } from '../../lib/useScoreSound'
import { AbcTab } from './editor/AbcTab'
import { ScoreEditor } from './editor/ScoreEditor'

interface AddPieceProps {
  /** Editing an existing piece of the learner's, else adding a new one. */
  editing?: Piece
  onSave: (abc: string, level: PieceLevel, id?: string) => Piece
  onDelete?: (id: string) => void
  pressed: ReadonlySet<number>
  onPressKey: (midi: number) => void
  onHoldKey: (midi: number, on: boolean) => void
  onRegisterInput: (fn: ((midi: number) => void) | null) => void
}

type Tab = 'score' | 'text'
const PREVIEW_DELAY_MS = 400

/**
 * Add or edit a piece. The Score tab is the editor; the Text tab is the same piece as
 * ABC, for hand edits and for anything the editor cannot draw.
 */
export function AddPiece({ editing, onSave, onDelete, pressed, onPressKey, onHoldKey, onRegisterInput }: AddPieceProps) {
  const [lib, setLib] = useState<Abcjs | null>(null)
  useEffect(() => {
    let alive = true
    loadAbcjs().then((m) => {
      if (alive) setLib(m)
    })
    return () => {
      alive = false
    }
  }, [])

  const editor = useScoreEditor(emptyScore(2))
  const [tab, setTab] = useState<Tab>('score')
  const [text, setText] = useState(editing?.abc ?? ABC_SKELETON)
  const [notice, setNotice] = useState<string | null>(null)
  const [level, setLevel] = useState<PieceLevel>(editing?.level ?? 'beginner')
  const [loaded, setLoaded] = useState(false)

  // An existing piece opens in the editor if it can be drawn, else as text.
  useEffect(() => {
    if (!lib || loaded) return
    setLoaded(true)
    if (!editing) return
    const result = parseAbc(lib, editing.abc)
    if (result.ok) editor.actions.replaceScore(result.score)
    else {
      setTab('text')
      setNotice(`This piece stays as text: ${result.reason}`)
    }
  }, [lib, loaded, editing, editor.actions])

  const toText = () => {
    setText(serialize(editor.state.score, { titles: true }).text)
    setNotice(null)
    setTab('text')
  }
  const toScore = () => {
    if (!lib) return
    const result = parseAbc(lib, text)
    if (!result.ok) {
      setNotice(`The editor cannot draw this yet: ${result.reason}`)
      return
    }
    editor.actions.replaceScore(result.score)
    setNotice(null)
    setTab('score')
  }

  const save = () => {
    const abc = tab === 'score' ? serialize(editor.state.score, { titles: true }).text : text
    const piece = onSave(abc, level, editing?.id)
    window.location.hash = pieceHref(piece.id)
  }
  const remove = () => {
    if (!editing || !onDelete) return
    if (!window.confirm(`Delete “${editing.title}”? This cannot be undone.`)) return
    onDelete(editing.id)
    window.location.hash = piecesHref
  }

  // DEV handle for checks by script.
  const stateRef = useRef(editor.state)
  stateRef.current = editor.state
  const libRef = useRef(lib)
  libRef.current = lib
  useEffect(() => {
    installDevCheck({
      state: () => stateRef.current,
      text: () => serialize(stateRef.current.score, { titles: true }).text,
      tune: () => (document.querySelector('.score-paper') as { __tune?: unknown } | null)?.__tune ?? null,
      lib: () => libRef.current,
    })
  }, [])

  const controls = (
    <>
      <button type="button" className="btn btn-primary" onClick={save}>
        {editing ? 'Save changes' : 'Save piece'}
      </button>
      {editing && (
        <button type="button" className="btn btn-ghost" onClick={remove}>
          Delete
        </button>
      )}
    </>
  )

  return (
    <main className="curriculum game pieces">
      <h6 className="kicker">
        <a href={piecesHref}>Pieces</a> · {editing ? 'Edit' : 'Add a piece'}
      </h6>
      <h1>{editing ? editing.title : 'Add a piece'}</h1>
      <p className="curriculum-lede">
        Build it on the staff, or type it as ABC. Either way it stays on this device, and you can hear it before you save.
      </p>

      <div className="game-controls">
        <nav className="game-tabs" aria-label="Editor view">
          <button type="button" aria-current={tab === 'score' ? 'page' : undefined} onClick={tab === 'text' ? toScore : undefined}>
            Score
          </button>
          <button type="button" aria-current={tab === 'text' ? 'page' : undefined} onClick={tab === 'score' ? toText : undefined}>
            Text
          </button>
        </nav>
        <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {tab === 'score' && editor.state.score.hands === 2 && (
            <div className="game-level" role="group" aria-label="Hand">
              <span className="kicker">Hand</span>
              <div className="game-segmented">
                <button type="button" className="game-segment" aria-pressed={editor.state.hand === 0} onClick={() => editor.actions.setHand(0)}>
                  R.H.
                </button>
                <button type="button" className="game-segment" aria-pressed={editor.state.hand === 1} onClick={() => editor.actions.setHand(1)}>
                  L.H.
                </button>
              </div>
            </div>
          )}
          <label className="game-level">
            <span className="kicker">Level</span>
            <select className="unit-switch" value={level} onChange={(e) => setLevel(e.target.value as PieceLevel)}>
              {(Object.keys(LEVEL_LABEL) as PieceLevel[]).map((l) => (
                <option key={l} value={l}>
                  {LEVEL_LABEL[l]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {tab === 'score' ? (
        <ScoreEditor
          editor={editor}
          active={tab === 'score'}
          pressed={pressed}
          onPressKey={onPressKey}
          onHoldKey={onHoldKey}
          onRegisterInput={onRegisterInput}
          controls={controls}
        />
      ) : (
        <TextMode text={text} onChange={setText} notice={notice} controls={controls} onHoldKey={onHoldKey} />
      )}
    </main>
  )
}

/** The Text tab: the textarea on one side, the live preview and Hear it on the other. */
function TextMode({
  text,
  onChange,
  notice,
  controls,
  onHoldKey,
}: {
  text: string
  onChange: (t: string) => void
  notice: string | null
  controls: React.ReactNode
  onHoldKey: (midi: number, on: boolean) => void
}) {
  const [preview, setPreview] = useState(text)
  const box = useRef<HTMLDivElement>(null)
  const narrow = useMediaQuery('(max-width: 860px)')
  useEffect(() => {
    const id = window.setTimeout(() => setPreview(text), PREVIEW_DELAY_MS)
    return () => window.clearTimeout(id)
  }, [text])
  const sound = useScoreSound(onHoldKey)
  const player = useScorePlayer({ abc: preview, target: box, narrow, hands: 'both', countIn: false, onNoteOn: sound.onNoteOn, onFinish: sound.release })
  const hear = () => {
    if (player.status === 'playing') {
      player.pause()
      sound.release()
    } else {
      unlockAudio()
      player.play()
    }
  }
  const error = player.error
  return (
    <div className="abc-editor">
      <AbcTab text={text} onChange={onChange} notice={notice} />
      <div className="abc-editor-preview">
        <div className="game-line-controls">
          <button type="button" className="btn btn-secondary" onClick={hear} disabled={player.status === 'loading' || player.status === 'error'}>
            {player.status === 'playing' ? 'Pause' : 'Hear it'}
          </button>
          {controls}
        </div>
        {error && <p className={`game-message${player.status === 'error' ? ' is-wrong' : ''}`}>{error}</p>}
        <div className="score score-preview">
          <div className="score-paper" ref={box} />
        </div>
      </div>
    </div>
  )
}
