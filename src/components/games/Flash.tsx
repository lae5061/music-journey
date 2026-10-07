import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { pitchClass } from '../../lib/notes'
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
import { useMediaQuery } from '../../lib/useMediaQuery'
import { Piano } from '../Piano'
import { Staff } from '../notation/Staff'
import { Stat, type ModeProps } from './SightReading'

/** How long a note waits before it counts as missed. */
const LIMIT_S = 8
/** Notes in a round. */
const ROUND = 20
/** Below this the staff draws smaller, so the keyboard and the buttons fit beneath it. */
const ROOMY = '(min-width: 700px)'

type Outcome = 'none' | 'right' | 'recovered' | 'wrong' | 'late'
type Phase = 'ready' | 'playing' | 'over'
type Result = 'right' | 'missed'

/**
 * One note at a time, twenty to a round. A wrong or slow answer lights the right keys
 * and waits for one of them; the note counts as missed either way.
 */
export function Flash({ level, pressed, onPressKey, placement, register }: ModeProps) {
  const [phase, setPhase] = useState<Phase>('ready')
  const [target, setTarget] = useState(() => randomTarget(level, [], placement))
  const [round, setRound] = useState(0)
  const [results, setResults] = useState<Result[]>([])
  const [streak, setStreak] = useState(0)
  const [longest, setLongest] = useState(0)
  // Capped, in case an older build kept a different kind of score under this level.
  const [best, setBest] = useState(() => Math.min(ROUND, loadBests().flash[level.id] ?? 0))
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

  /** Close out the current note and either show the next or end the round. */
  const advance = (result: Result) => {
    const done = [...results, result]
    setResults(done)
    setLastTarget(target)
    setMissed(false)
    if (done.length >= ROUND) {
      setPhase('over')
      const right = done.filter((r) => r === 'right').length
      if (right > best) setBest(recordBest('flash', level.id, right))
      return
    }
    recent.current = [...recent.current, target].slice(-6)
    setTarget(randomTarget(level, recent.current, placement))
    setRound((r) => r + 1)
    shownAt.current = performance.now()
  }

  const start = () => {
    setPhase('playing')
    setOutcome('none')
    setResults([])
    setStreak(0)
    setLongest(0)
    setTotalMs(0)
    setMissed(false)
    recent.current = []
    setTarget(randomTarget(level, [], placement))
    setRound((r) => r + 1)
    shownAt.current = performance.now()
  }

  const press = (midi: number) => {
    onPressKey(midi)
    if (phase === 'over') return
    // Playing a key is as good as pressing Start.
    if (phase === 'ready') start()
    if (!sameNote(midi, target.midi)) {
      if (!missed) miss('wrong')
      return
    }
    if (missed) {
      setOutcome('recovered')
      advance('missed')
      return
    }
    const next = streak + 1
    setStreak(next)
    setLongest((l) => Math.max(l, next))
    setTotalMs((t) => t + (performance.now() - shownAt.current))
    setOutcome('right')
    advance('right')
  }

  /** Sound the note being asked for, without it counting as an answer. */
  const hear = () => onPressKey(target.midi)

  const skip = () => {
    setStreak(0)
    setOutcome('none')
    advance('missed')
  }

  useEffect(() => register(press))

  const right = results.filter((r) => r === 'right').length
  const answered = results.length
  const average = right ? `${(totalMs / right / 1000).toFixed(1)} s` : '–'
  const message =
    phase === 'ready'
      ? `A round is ${ROUND} notes. Play each one you see on the keyboard below — any octave will do. You have ${LIMIT_S} seconds a note.`
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
          <Stat label="Right" value={`${right}/${ROUND}`} accent />
          <Stat label="Streak" value={String(streak)} />
          <Stat label="Per note" value={average} />
          <Stat label="Best round" value={best ? `${best}/${ROUND}` : '–'} />
        </div>

        <div className="game-round">
          <div
            className="progress-track"
            role="progressbar"
            aria-label="Round progress"
            aria-valuenow={answered}
            aria-valuemin={0}
            aria-valuemax={ROUND}
          >
            {Array.from({ length: ROUND }, (_, i) => (
              <div
                key={i}
                className={`progress-seg${results[i] === 'right' ? ' is-filled' : results[i] === 'missed' ? ' is-missed' : ''}`}
              />
            ))}
          </div>
          <span className="progress-label">
            {phase === 'over' ? 'Round over' : `Note ${Math.min(answered + 1, ROUND)} of ${ROUND}`}
          </span>
        </div>

        {phase === 'over' ? (
          <div className="game-overlay">
            <h3>
              {right} of {ROUND}
              {right >= best && right > 0 ? ' — your best round' : ''}
            </h3>
            <p>
              {right === ROUND
                ? 'Every note first time.'
                : `${ROUND - right} missed.`}{' '}
              Longest streak {longest}
              {right ? `, ${average.replace(' s', '')} seconds a note` : ''}.
            </p>
            <div className="game-line-controls">
              <button className="btn btn-primary" onClick={start}>
                Play again
              </button>
            </div>
          </div>
        ) : (
          <>
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
          </>
        )}
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
