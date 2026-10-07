import { useEffect, useRef, useState } from 'react'
import { gameHref, gamesHref } from '../../lib/route'
import {
  getLevel,
  isMode,
  LEVELS,
  loadBests,
  MODES,
  PLACEMENTS,
  rememberChoice,
  type Mode,
  type Placement,
} from '../../lib/sightReading'
import { typingHint, useTypingKeys } from '../../lib/useTypingKeys'
import { Flash } from './Flash'
import { Line } from './Line'
import { Stream } from './Stream'

export interface ModeProps {
  level: ReturnType<typeof getLevel>
  pressed: ReadonlySet<number>
  onPressKey: (midi: number) => void
  placement: Placement
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
  const [placement, setPlacement] = useState<Placement>(() => loadBests().lastPlacement ?? 'both')
  const level = getLevel(levelId)

  useEffect(() => rememberChoice(level.id, placement), [level, placement])

  // Typed letters go to whichever mode is showing.
  const pressRef = useRef<(midi: number) => void>(() => {})
  const octave = useTypingKeys((midi) => pressRef.current(midi))

  const current = MODES.find((m) => m.id === mode)!
  const props: ModeProps = {
    level,
    pressed,
    onPressKey,
    placement,
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
        <div className="game-level" role="group" aria-label="Which notes">
          <span className="kicker">Notes</span>
          <div className="game-segmented">
            {PLACEMENTS.map((p) => (
              <button
                key={p.id}
                type="button"
                className="game-segment"
                aria-pressed={p.id === placement}
                onClick={() => setPlacement(p.id)}
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>
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

      {/* Keyed by the choices so changing one starts the mode over. */}
      {mode === 'flash' && <Flash key={`${level.id}-${placement}`} {...props} />}
      {mode === 'stream' && <Stream key={`${level.id}-${placement}`} {...props} />}
      {mode === 'line' && <Line key={`${level.id}-${placement}`} {...props} />}
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
