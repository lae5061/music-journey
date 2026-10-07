/**
 * Practice games: short, repeatable drills that build one skill the lessons teach.
 * They sit beside the course rather than inside it, so nothing has to be unlocked.
 */
export interface Game {
  id: GameId
  title: string
  /** What it trains, in a line. */
  summary: string
  /** The lesson that teaches what the game drills, as a label like "1.03". */
  taughtIn: string
}

export const GAME_IDS = ['sight-reading'] as const
export type GameId = (typeof GAME_IDS)[number]

export const isGameId = (text: string): text is GameId => (GAME_IDS as readonly string[]).includes(text)

export const GAMES: Game[] = [
  {
    id: 'sight-reading',
    title: 'Sight reading',
    summary: 'Three ways to drill it: one note at a time, a stream of notes to a line, or a whole line to a click.',
    taughtIn: '1.03',
  },
]

