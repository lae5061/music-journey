import { GAMES, getGame, type GameId } from '../data/games'
import { gameHref, gamesHref } from '../lib/route'

/** The games index: one card per drill. */
export function Games({ game }: { game: GameId | null }) {
  if (game) return <GameScreen id={game} />

  return (
    <main className="curriculum games">
      <h6 className="kicker">Practice</h6>
      <h1>Games</h1>
      <p className="curriculum-lede">
        Short drills for the skills that only get better with repetition. Each one is a few
        minutes, keeps score, and can be played as often as you like.
      </p>
      <div className="curriculum-grid">
        {GAMES.map((g) => (
          <a key={g.id} className="card lesson-card" href={gameHref(g.id)}>
            <div className="lesson-card-head">
              <span className="tag tag-accent">Taught in {g.taughtIn}</span>
            </div>
            <h3>{g.title}</h3>
            <p className="card-body">{g.summary}</p>
            <div className="lesson-card-foot">
              <span className="card-meta">Keeps your best score</span>
              <span className="lesson-card-open">Play →</span>
            </div>
          </a>
        ))}
      </div>
    </main>
  )
}

function GameScreen({ id }: { id: GameId }) {
  const game = getGame(id)
  return (
    <main className="curriculum games">
      <h6 className="kicker">
        <a href={gamesHref}>Games</a> · {game.title}
      </h6>
      <h1>{game.title}</h1>
      <p className="curriculum-lede">{game.summary}</p>
    </main>
  )
}
