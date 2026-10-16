import { ADD_PIECE_ID } from '../../data/pieces'
import { usePieces } from '../../lib/pieceStore'
import { piecesHref } from '../../lib/route'
import { AddPiece } from './AddPiece'
import { PiecePlayer } from './PiecePlayer'
import { PiecesIndex } from './PiecesIndex'

interface PiecesProps {
  piece: string | null
  pressed: ReadonlySet<number>
  onPressKey: (midi: number) => void
  onHoldKey: (midi: number, on: boolean) => void
  onRegisterInput: (fn: ((midi: number) => void) | null) => void
}

/** The Pieces screen: the index, one piece, or the add form. */
export function Pieces({ piece, pressed, onPressKey, onHoldKey, onRegisterInput }: PiecesProps) {
  const { all, mine, find, save, remove } = usePieces()

  if (piece === null) return <PiecesIndex all={all} mine={mine} />

  if (piece.startsWith(ADD_PIECE_ID)) {
    // "#/pieces/add?edit=<id>" edits one of the learner's own.
    const editId = /[?&]edit=([^&]+)/.exec(piece)?.[1]
    const editing = editId ? find(editId) : undefined
    return (
      <AddPiece
        key={editing?.id ?? 'new'}
        editing={editing?.source === 'mine' ? editing : undefined}
        onSave={save}
        onDelete={remove}
        pressed={pressed}
        onPressKey={onPressKey}
        onHoldKey={onHoldKey}
        onRegisterInput={onRegisterInput}
      />
    )
  }

  const found = find(piece)
  if (!found) {
    return (
      <main className="curriculum pieces">
        <h6 className="kicker">
          <a href={piecesHref}>Pieces</a>
        </h6>
        <h1>Not here</h1>
        <p className="curriculum-lede">There is no piece at this address. It may have been deleted.</p>
      </main>
    )
  }

  return (
    <PiecePlayer key={found.id} piece={found} pressed={pressed} onPressKey={onPressKey} onHoldKey={onHoldKey} />
  )
}
