import type { Hands } from '../../lib/abc'
import type { ScorePlayer } from '../../lib/useScorePlayer'

interface TransportProps {
  player: ScorePlayer
  tempoPct: number
  onTempo: (pct: number) => void
  hands: Hands
  onHands: (h: Hands) => void
  countIn: boolean
  onCountIn: (on: boolean) => void
  click: boolean
  onClick: (on: boolean) => void
}

const TEMPO_MIN = 40
const TEMPO_MAX = 150
const TEMPO_STEP = 5

const HANDS: { id: Hands; title: string }[] = [
  { id: 'both', title: 'Both' },
  { id: 'right', title: 'Right' },
  { id: 'left', title: 'Left' },
]

/** Play, stop, tempo, hands, and the two checkboxes. */
export function Transport({
  player,
  tempoPct,
  onTempo,
  hands,
  onHands,
  countIn,
  onCountIn,
  click,
  onClick,
}: TransportProps) {
  const busy = player.status === 'loading' || player.status === 'error'
  const playing = player.status === 'playing'
  const clamp = (pct: number) => Math.min(TEMPO_MAX, Math.max(TEMPO_MIN, pct))

  return (
    <div className="transport">
      <div className="game-line-controls">
        <button
          type="button"
          className="btn btn-primary"
          onClick={playing ? player.pause : player.play}
          disabled={busy}
        >
          {playing ? 'Pause' : player.status === 'paused' ? 'Resume' : 'Play'}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={player.stop}
          disabled={busy || player.status === 'ready'}
        >
          Stop
        </button>
        <span className="transport-bar">
          Bar {player.bar} of {player.bars || '–'}
        </span>
      </div>

      <div className="transport-row">
        <label className="transport-tempo">
          <span className="kicker">Tempo</span>
          <span className="transport-tempo-value">
            ♩ = {player.bpm} · {tempoPct}%
          </span>
          <span className="transport-tempo-input">
            <button type="button" className="btn btn-ghost" onClick={() => onTempo(clamp(tempoPct - TEMPO_STEP))} aria-label="Slower">
              −
            </button>
            <input
              type="range"
              min={TEMPO_MIN}
              max={TEMPO_MAX}
              step={TEMPO_STEP}
              value={tempoPct}
              onChange={(e) => onTempo(Number(e.target.value))}
              aria-label="Tempo, percent of the written tempo"
            />
            <button type="button" className="btn btn-ghost" onClick={() => onTempo(clamp(tempoPct + TEMPO_STEP))} aria-label="Faster">
              +
            </button>
          </span>
        </label>

        {player.voices > 1 && (
          <div className="game-level" role="group" aria-label="Hands">
            <span className="kicker">Hands</span>
            <div className="game-segmented">
              {HANDS.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  className="game-segment"
                  aria-pressed={h.id === hands}
                  onClick={() => onHands(h.id)}
                >
                  {h.title}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="transport-checks">
          <label>
            <input type="checkbox" checked={countIn} onChange={(e) => onCountIn(e.target.checked)} />
            Count-in
          </label>
          <label>
            <input type="checkbox" checked={click} onChange={(e) => onClick(e.target.checked)} />
            Click
          </label>
        </div>
      </div>

      {player.bars > 0 && (
        <div className="progress-track transport-bars" role="group" aria-label="Bars">
          {Array.from({ length: player.bars }, (_, i) => (
            <button
              key={i}
              type="button"
              className={`progress-seg${i + 1 <= player.bar ? ' is-filled' : ''}`}
              aria-label={`Go to bar ${i + 1}`}
              onClick={() => player.seekToBar(i + 1)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
