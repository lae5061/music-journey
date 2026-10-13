import { GAMES, type GameId } from '../data/games'
import { gameHref } from '../lib/route'
import { SightReading } from './games/SightReading'

interface GamesProps {
  game: GameId | null
  part: string | null
  pressed: ReadonlySet<number>
  onPressKey: (midi: number) => void
  /** Where a connected MIDI keyboard's notes should go while a game is showing. */
  onRegisterInput: (fn: ((midi: number) => void) | null) => void
}

/** The games index: one card per drill. */
export function Games({ game, part, pressed, onPressKey, onRegisterInput }: GamesProps) {
  if (game === 'sight-reading') {
    return (
      <SightReading
        part={part}
        pressed={pressed}
        onPressKey={onPressKey}
        onRegisterInput={onRegisterInput}
      />
    )
  }

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
