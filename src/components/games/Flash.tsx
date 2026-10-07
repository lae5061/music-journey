import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { pitchClass } from '../../lib/notes'
import { useMediaQuery } from '../../lib/useMediaQuery'
import {
  BOARD,
  BOARD_FOCUS,
  loadBests,
  randomTarget,
  recordBest,
  sameNameKeys,
  sameNote,
  targetSpec,
} from '../../lib/sightReading'
import { Piano } from '../Piano'
import { Staff } from '../notation/Staff'
import { Stat, type ModeProps } from './SightReading'

/** How long a note waits before it counts as missed. */
const LIMIT_S = 8
/** Below this the staff draws smaller, so the keyboard and the buttons fit beneath it. */
const ROOMY = '(min-width: 700px)'

type Outcome = 'none' | 'right' | 'recovered' | 'wrong' | 'late'
type Phase = 'ready' | 'playing'

/** One note at a time. A wrong or slow answer lights the right key and waits for it. */
export function Flash({ level, pressed, onPressKey, register }: ModeProps) {
  const [phase, setPhase] = useState<Phase>('ready')
  const [target, setTarget] = useState(() => randomTarget(level))
  const [round, setRound] = useState(0)
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState(() => loadBests().flash[level.id] ?? 0)
  const [answered, setAnswered] = useState(0)
  const [totalMs, setTotalMs] = useState(0)
  const [missed, setMissed] = useState(false)
  const [outcome, setOutcome] = useState<Outcome>('none')
  const [lastTarget, setLastTarget] = useState(target)
  const shownAt = useRef(performance.now())
  const roomy = useMediaQuery(ROOMY)
  const recent = useRef<ReturnType<typeof randomTarget>[]>([])

  const hint = useMemo(() => (missed ? new Set(sameNameKeys(target.midi)) : undefined), [missed, target])

  const miss = useCallback((why: Outcome) => {
    setStreak(0)
    setMissed(true)
    setOutcome(why)
  }, [])

  // The bar above the staff drains for this long; when it is empty the note is missed.
  useEffect(() => {
    if (phase !== 'playing' || missed) return
    const id = window.setTimeout(() => miss('late'), LIMIT_S * 1000)
    return () => window.clearTimeout(id)
  }, [phase, round, missed, miss])

  const advance = () => {
    setLastTarget(target)
    recent.current = [...recent.current, target].slice(-6)
    setTarget(randomTarget(level, recent.current))
    setRound((r) => r + 1)
    setMissed(false)
    shownAt.current = performance.now()
  }

  const start = () => {
    setPhase('playing')
    setOutcome('none')
    setRound((r) => r + 1)
    shownAt.current = performance.now()
  }

  const press = (midi: number) => {
    onPressKey(midi)
    // Playing a key is as good as pressing Start.
    if (phase === 'ready') start()
    if (!sameNote(midi, target.midi)) {
      if (!missed) miss('wrong')
      return
    }
    if (!missed) {
      const next = streak + 1
      setStreak(next)
      if (next > best) setBest(recordBest('flash', level.id, next))
      setAnswered((n) => n + 1)
      setTotalMs((t) => t + (performance.now() - shownAt.current))
      setOutcome('right')
    } else {
      setOutcome('recovered')
    }
    advance()
  }

  /** Sound the note being asked for, without it counting as an answer. */
  const hear = () => onPressKey(target.midi)

  const skip = () => {
    setStreak(0)
    setOutcome('none')
    advance()
  }

  useEffect(() => register(press))

  const average = answered ? `${(totalMs / answered / 1000).toFixed(1)} s` : '–'
  const message =
    phase === 'ready'
      ? `Play each note you see on the keyboard below — any octave will do. You have ${LIMIT_S} seconds a note.`
      : outcome === 'right'
        ? `Yes — that was ${lastTarget.pitch}.`
        : outcome === 'recovered'
          ? `That was ${lastTarget.pitch}. Here is the next one.`
        : outcome === 'wrong'
          ? `Not that one. This is ${target.pitch}: play a lit key to go on, or skip it.`
          : outcome === 'late'
            ? `Too slow. This is ${target.pitch}: play a lit key to go on, or skip it.`
            : 'Play the note you see.'

  return (
    <>
      <div className="game-board">
        <div className="game-stats">
          <Stat label="Streak" value={String(streak)} accent />
          <Stat label="Best" value={String(best)} />
          <Stat label="Per note" value={average} />
          <Stat label="Answered" value={String(answered)} />
        </div>
        <div className="game-timer" aria-hidden="true">
          {phase === 'playing' && (
            <div
              key={round}
              className={`game-timer-fill${missed ? ' is-paused' : ''}`}
              style={{ animationDuration: `${LIMIT_S}s` }}
            />
          )}
        </div>
        <div className="game-staff game-staff--flash">
          <Staff spec={targetSpec(level, target)} scale={roomy ? 2.2 : 1.5} />
        </div>
        <p
          className={`game-message${outcome === 'right' ? ' is-right' : missed ? ' is-wrong' : ''}`}
          aria-live="polite"
        >
          {message}
        </p>
        <div className="game-line-controls">
          {phase === 'ready' ? (
            <button className="btn btn-primary" onClick={start}>
              Start
            </button>
          ) : (
            <>
              <button className="btn btn-secondary" onClick={hear}>
                Hear it
              </button>
              <button className="btn btn-secondary" onClick={skip}>
                Skip
              </button>
            </>
          )}
        </div>
      </div>
      <Piano
        range={BOARD}
        focus={BOARD_FOCUS}
        highlight={hint}
        pressed={pressed}
        onPress={press}
        label={`Keyboard — play ${pitchClass(target.midi)}`}
      />
    </>
  )
}
