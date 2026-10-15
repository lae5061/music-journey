import { useEffect, useRef, useState } from 'react'
import { LEVEL_LABEL, type Piece, type PieceLevel } from '../../data/pieces'
import { ABC_SKELETON } from '../../lib/abc'
import { pieceHref, piecesHref } from '../../lib/route'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { useScorePlayer } from '../../lib/useScorePlayer'
import { AbcCheatSheet } from './AbcCheatSheet'

interface AddPieceProps {
  /** Editing an existing piece of the learner's, else adding a new one. */
  editing?: Piece
  onSave: (abc: string, level: PieceLevel, id?: string) => Piece
  onDelete?: (id: string) => void
}

const PREVIEW_DELAY_MS = 400

/** Type a piece in from a book, or open an .abc file, and see it as you go. */
export function AddPiece({ editing, onSave, onDelete }: AddPieceProps) {
  const [text, setText] = useState(editing?.abc ?? ABC_SKELETON)
  const [level, setLevel] = useState<PieceLevel>(editing?.level ?? 'beginner')
  const [preview, setPreview] = useState(text)
  const box = useRef<HTMLDivElement>(null)
  const narrow = useMediaQuery('(max-width: 860px)')

  useEffect(() => {
    const id = window.setTimeout(() => setPreview(text), PREVIEW_DELAY_MS)
    return () => window.clearTimeout(id)
  }, [text])

  const player = useScorePlayer({
    abc: preview,
    target: box,
    narrow,
    tempoPct: 100,
    hands: 'both',
    countIn: false,
  })

  const open = async (file: File | undefined) => {
    if (!file) return
    setText(await file.text())
  }

  const save = () => {
    const piece = onSave(text, level, editing?.id)
    window.location.hash = pieceHref(piece.id)
  }

  const remove = () => {
    if (!editing || !onDelete) return
    if (!window.confirm(`Delete “${editing.title}”? This cannot be undone.`)) return
    onDelete(editing.id)
    window.location.hash = piecesHref
  }

  return (
    <main className="curriculum pieces">
      <h6 className="kicker">
        <a href={piecesHref}>Pieces</a> · {editing ? 'Edit' : 'Add a piece'}
      </h6>
      <h1>{editing ? editing.title : 'Add a piece'}</h1>
      <p className="curriculum-lede">
        Type it in from the page in ABC notation, or open an .abc file. It stays on this
        device. The preview below updates as you type, and you can play it before saving.
      </p>

      <div className="abc-editor">
        <div className="abc-editor-text">
          <textarea
            className="abc-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            aria-label="ABC notation"
          />
          <div className="game-line-controls">
            <label className="btn btn-secondary abc-open">
              Open an .abc file
              <input type="file" accept=".abc,text/plain" onChange={(e) => void open(e.target.files?.[0])} />
            </label>
            <label className="game-level abc-level">
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
          <AbcCheatSheet />
        </div>

        <div className="abc-editor-preview">
          <div className="game-line-controls">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={player.status === 'playing' ? player.pause : player.play}
              disabled={player.status !== 'ready' && player.status !== 'playing' && player.status !== 'paused'}
            >
              {player.status === 'playing' ? 'Pause' : 'Hear it'}
            </button>
            <button type="button" className="btn btn-primary" onClick={save} disabled={player.status === 'error'}>
              {editing ? 'Save changes' : 'Save piece'}
            </button>
            {editing && (
              <button type="button" className="btn btn-ghost" onClick={remove}>
                Delete
              </button>
            )}
          </div>
          {player.error && (
            <p className={`game-message${player.status === 'error' ? ' is-wrong' : ''}`}>{player.error}</p>
          )}
          <div className="score score-preview">
            <div className="score-paper" ref={box} />
          </div>
        </div>
      </div>
    </main>
  )
}
