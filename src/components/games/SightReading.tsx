import { useEffect, useRef, useState } from 'react'
import { gameHref, gamesHref } from '../../lib/route'
import {
  getLevel,
  isMode,
  LEVELS,
  loadBests,
  MODES,
  rememberLevel,
  type Mode,
} from '../../lib/sightReading'
import { typingHint, useTypingKeys } from '../../lib/useTypingKeys'
import { Flash } from './Flash'
import { Line } from './Line'
import { Stream } from './Stream'

export interface ModeProps {
  level: ReturnType<typeof getLevel>
  pressed: ReadonlySet<number>
  onPressKey: (midi: number) => void
  /** Hand the shell the mode's key handler, so typed letters reach it. */
  register: (press: (midi: number) => void) => void
}

/** The sight-reading game: three modes over one set of levels. */
export function SightReading({
  part,
  pressed,
  onPressKey,
}: {
  part: string | null
  pressed: ReadonlySet<number>
  onPressKey: (midi: number) => void
}) {
  const mode: Mode = part && isMode(part) ? part : 'flash'
  const [levelId, setLevelId] = useState(() => loadBests().lastLevel ?? LEVELS[0].id)
  const level = getLevel(levelId)

  useEffect(() => rememberLevel(level.id), [level])

  // Typed letters go to whichever mode is showing.
  const pressRef = useRef<(midi: number) => void>(() => {})
  const octave = useTypingKeys((midi) => pressRef.current(midi))

  const current = MODES.find((m) => m.id === mode)!
  const props: ModeProps = {
    level,
    pressed,
    onPressKey,
    register: (press) => {
      pressRef.current = press
    },
  }

  return (
    <main className="curriculum game">
      <h6 className="kicker">
        <a href={gamesHref}>Games</a> · Sight reading
      </h6>
      <h1>Sight reading</h1>
      <p className="curriculum-lede">{current.hook}</p>

      <div className="game-controls">
        <nav className="game-tabs" aria-label="Game mode">
          {MODES.map((m) => (
            <a
              key={m.id}
              href={gameHref('sight-reading', m.id)}
              aria-current={m.id === mode ? 'page' : undefined}
            >
              {m.title}
            </a>
          ))}
        </nav>
        <label className="game-level">
          <span className="kicker">Level</span>
          <select
            className="unit-switch"
            value={level.id}
            onChange={(e) => setLevelId(e.target.value)}
          >
            {LEVELS.map((l, i) => (
              <option key={l.id} value={l.id}>
                {i + 1} · {l.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Keyed by level so changing it starts the mode over. */}
      {mode === 'flash' && <Flash key={level.id} {...props} />}
      {mode === 'stream' && <Stream key={level.id} {...props} />}
      {mode === 'line' && <Line key={level.id} {...props} />}
      <p className="game-keys">{typingHint(octave)}</p>
    </main>
  )
}

export function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`game-stat${accent ? ' is-accent' : ''}`}>
      <span className="game-stat-value">{value}</span>
      <span className="game-stat-label">{label}</span>
    </div>
  )
}
