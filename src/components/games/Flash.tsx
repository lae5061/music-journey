import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { rangeFor } from '../../lib/keyboard'
import { noteName } from '../../lib/notes'
import { loadBests, midisOf, randomTarget, recordBest, targetSpec } from '../../lib/sightReading'
import { Piano } from '../Piano'
import { Staff } from '../notation/Staff'
import { Stat, type ModeProps } from './SightReading'

/** How long a note waits before it counts as missed. */
const LIMIT_S = 6

type Outcome = 'none' | 'right' | 'wrong' | 'late'

/** One note at a time. A wrong or slow answer lights the right key and waits for it. */
export function Flash({ level, pressed, onPressKey }: ModeProps) {
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

  const range = useMemo(() => rangeFor(midisOf(level)), [level])
  const hint = useMemo(() => (missed ? new Set([target.midi]) : undefined), [missed, target])

  const miss = useCallback((why: Outcome) => {
    setStreak(0)
    setMissed(true)
    setOutcome(why)
  }, [])

  // The bar above the staff drains for this long; when it is empty the note is missed.
  useEffect(() => {
    if (missed) return
    const id = window.setTimeout(() => miss('late'), LIMIT_S * 1000)
    return () => window.clearTimeout(id)
  }, [round, missed, miss])

  const press = (midi: number) => {
    onPressKey(midi)
    if (midi !== target.midi) {
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
    }
    setLastTarget(target)
    setTarget((t) => randomTarget(level, t))
    setRound((r) => r + 1)
    setMissed(false)
    shownAt.current = performance.now()
  }

  const average = answered ? (totalMs / answered / 1000).toFixed(1) : '–'
  const message =
    outcome === 'right'
      ? `Yes — that was ${lastTarget.pitch}.`
      : outcome === 'wrong'
        ? `Not that one. This is ${target.pitch}; play it to go on.`
        : outcome === 'late'
          ? `Too slow. This is ${target.pitch}; play it to go on.`
          : 'Play the note you see.'

  return (
    <>
      <div className="game-board">
        <div className="game-stats">
          <Stat label="Streak" value={String(streak)} accent />
          <Stat label="Best" value={String(best)} />
          <Stat label="Seconds a note" value={average} />
          <Stat label="Read" value={String(answered)} />
        </div>
        <div className="game-timer" aria-hidden="true">
          <div
            key={round}
            className={`game-timer-fill${missed ? ' is-paused' : ''}`}
            style={{ animationDuration: `${LIMIT_S}s` }}
          />
        </div>
        <div className="game-staff game-staff--flash">
          <Staff spec={targetSpec(level, target)} scale={2.2} />
        </div>
        <p className={`game-message${outcome === 'right' ? ' is-right' : missed ? ' is-wrong' : ''}`} aria-live="polite">
          {message}
        </p>
      </div>
      <Piano
        range={range}
        focus={[target.midi]}
        highlight={hint}
        pressed={pressed}
        onPress={press}
        label={`Keyboard — play ${noteName(target.midi)}`}
      />
    </>
  )
}
