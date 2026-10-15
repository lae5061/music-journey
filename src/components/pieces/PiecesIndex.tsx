import { abcBars, LEVEL_LABEL, type Piece } from '../../data/pieces'
import { pieceHref } from '../../lib/route'

/** One card per piece, the learner's own after the bundled ones, and a card to add more. */
export function PiecesIndex({ all, mine }: { all: Piece[]; mine: Piece[] }) {
  const bundled = all.filter((p) => p.source === 'bundled')

  const card = (p: Piece) => (
    <a key={p.id} className="card lesson-card" href={pieceHref(p.id)}>
      <div className="lesson-card-head">
        <span className="tag tag-accent">{LEVEL_LABEL[p.level]}</span>
      </div>
      <h3>{p.title}</h3>
      <p className="card-body">{p.credit}</p>
      <div className="lesson-card-foot">
        <span className="card-meta">{abcBars(p.abc)} bars</span>
        <span className="lesson-card-open">Play →</span>
      </div>
    </a>
  )

  return (
    <main className="curriculum pieces">
      <h6 className="kicker">Play</h6>
      <h1>Pieces</h1>
      <p className="curriculum-lede">
        Real music from the score. Press play to hear a piece at any tempo and watch the
        keys light as it goes; then play along, one hand at a time if you like. Add your
        own from a book: method-book pieces are copyrighted, so they are typed in, not shipped.
      </p>

      <div className="curriculum-grid">
        {bundled.map(card)}
        <a className="card lesson-card pieces-add" href={pieceHref('add')}>
          <div className="lesson-card-head">
            <span className="tag tag-neutral">Yours</span>
          </div>
          <h3>Add a piece</h3>
          <p className="card-body">Type it in from the page, or open an .abc file. It stays on this device.</p>
          <div className="lesson-card-foot">
            <span className="card-meta">ABC notation</span>
            <span className="lesson-card-open">Add →</span>
          </div>
        </a>
      </div>

      {mine.length > 0 && (
        <>
          <h2 className="pieces-mine">My pieces</h2>
          <div className="curriculum-grid">{mine.map(card)}</div>
        </>
      )}
    </main>
  )
}
