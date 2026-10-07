import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { rangeFor } from '../../lib/keyboard'
import { parsePitch } from '../../lib/pitch'
import {
  clefsOf,
  loadBests,
  midisOf,
  randomTarget,
  recordBest,
  type Clef,
  type Level,
  type Target,
} from '../../lib/sightReading'
import { Piano } from '../Piano'
import { Accidental, BassClef, CLEF_ANCHOR, TrebleClef } from '../notation/glyphs'
import { Stat, type ModeProps } from './SightReading'

type State = 'pending' | 'hit' | 'wrong' | 'missed'
type Grade = 'early' | 'on' | 'late'

interface Note {
  id: number
  target: Target
  /** Seconds after the start at which it crosses the line. */
  at: number
  /** How far either side of `at` a press still counts, in seconds. */
  window: number
  state: State
  grade?: Grade
}

type Phase = 'ready' | 'running' | 'over'

const LEAD_S = 2.5
const AHEAD_S = 8
const MAX_MISSES = 3
const NOTES_PER_STEP = 8
const TEMPO_STEP = 4
const TEMPO_CAP = 150

/** Notes per minute at the i-th note: it climbs a little every few notes. */
const tempoAt = (level: Level, i: number) =>
  Math.min(TEMPO_CAP, level.tempo + TEMPO_STEP * Math.floor(i / NOTES_PER_STEP))

interface Game {
  notes: Note[]
  /** How many notes have been generated so far. */
  count: number
  lastAt: number
  recent: Target[]
  score: number
  streak: number
  misses: number
  hits: number
  judged: number
  t0: number
}

const fresh = (): Game => ({
  notes: [],
  count: 0,
  lastAt: 0,
  recent: [],
  score: 0,
  streak: 0,
  misses: 0,
  hits: 0,
  judged: 0,
  t0: 0,
})

/** Notes scroll toward a line; play each as it crosses. Three misses end the run. */
export function Stream({ level, pressed, onPressKey, register }: ModeProps) {
  const [phase, setPhase] = useState<Phase>('ready')
  const [now, setNow] = useState(0)
  const [best, setBest] = useState(() => loadBests().stream[level.id] ?? 0)
  const [lastGrade, setLastGrade] = useState<Grade | 'miss' | null>(null)
  const game = useRef<Game>(fresh())
  const raf = useRef(0)

  const clefs = useMemo(() => clefsOf(level), [level])
  const range = useMemo(() => rangeFor(midisOf(level)), [level])
  const focus = useMemo(() => {
    const m = midisOf(level)
    return [Math.min(...m), Math.max(...m)]
  }, [level])

  const ensureAhead = useCallback(
    (g: Game, until: number) => {
      while (g.lastAt < until) {
        const i = g.count
        const beat = 60 / tempoAt(level, i)
        const at = i === 0 ? LEAD_S : g.lastAt + beat
        const target = randomTarget(level, g.recent)
        g.notes.push({ id: i, target, at, window: Math.min(0.55, beat * 0.5), state: 'pending' })
        g.count = i + 1
        g.lastAt = at
        g.recent = [...g.recent, target].slice(-6)
      }
    },
    [level],
  )

  const end = useCallback(() => {
    cancelAnimationFrame(raf.current)
    setPhase('over')
    const g = game.current
    if (g.score > best) setBest(recordBest('stream', level.id, g.score))
  }, [best, level])

  const tick = useCallback(() => {
    const g = game.current
    const t = (performance.now() - g.t0) / 1000
    ensureAhead(g, t + AHEAD_S)
    for (const n of g.notes) {
      if (n.state === 'pending' && t > n.at + n.window) {
        n.state = 'missed'
        g.misses++
        g.streak = 0
        g.judged = Math.max(g.judged, n.id + 1)
        setLastGrade('miss')
      }
    }
    g.notes = g.notes.filter((n) => n.at > t - 3)
    setNow(t)
    if (g.misses >= MAX_MISSES) {
      end()
      return
    }
    raf.current = requestAnimationFrame(tick)
  }, [ensureAhead, end])

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const start = () => {
    cancelAnimationFrame(raf.current)
    const g = fresh()
    g.t0 = performance.now()
    game.current = g
    setLastGrade(null)
    setNow(0)
    setPhase('running')
    raf.current = requestAnimationFrame(tick)
  }

  const press = (midi: number) => {
    onPressKey(midi)
    if (phase !== 'running') return
    const g = game.current
    const t = (performance.now() - g.t0) / 1000
    const n = g.notes.find((x) => x.state === 'pending' && t >= x.at - x.window)
    if (!n) return
    g.judged = Math.max(g.judged, n.id + 1)
    if (midi === n.target.midi) {
      const d = t - n.at
      n.state = 'hit'
      n.grade = Math.abs(d) < 0.12 ? 'on' : d < 0 ? 'early' : 'late'
      g.streak++
      g.hits++
      g.score += (n.grade === 'on' ? 150 : 100) + Math.min(100, 10 * g.streak)
      setLastGrade(n.grade)
    } else {
      n.state = 'wrong'
      g.misses++
      g.streak = 0
      setLastGrade('miss')
      if (g.misses >= MAX_MISSES) end()
    }
  }

  useEffect(() => register(press))

  const g = game.current
  const tempo = tempoAt(level, Math.max(0, g.judged - 1))
  const missDots = Array.from({ length: MAX_MISSES }, (_, i) => (i < g.misses ? '●' : '○')).join('')

  return (
    <>
      <div className="game-board">
        <div className="game-stats">
          <Stat label="Score" value={String(g.score)} accent />
          <Stat label="Streak" value={String(g.streak)} />
          <Stat label="Notes a minute" value={String(tempo)} />
          <Stat label="Misses" value={missDots} />
          <Stat label="Best" value={String(best)} />
        </div>

        <div className="game-staff">
          <StreamStaff clefs={clefs} notes={g.notes} now={now} />
        </div>

        {phase === 'ready' && (
          <div className="game-overlay">
            <p>Notes slide toward the red line. Play each one as it crosses. The pace rises every eight notes; three misses end the run.</p>
            <button className="btn btn-primary" onClick={start}>
              Start
            </button>
          </div>
        )}
        {phase === 'running' && (
          <p className={`game-message${lastGrade === 'miss' ? ' is-wrong' : lastGrade ? ' is-right' : ''}`} aria-live="polite">
            {lastGrade === null ? 'Ready…' : lastGrade === 'miss' ? 'Miss' : lastGrade === 'on' ? 'On the line' : lastGrade === 'early' ? 'A little early' : 'A little late'}
          </p>
        )}
        {phase === 'over' && (
          <div className="game-overlay">
            <h3>Run over</h3>
            <p>
              {g.score} points · {g.hits} notes hit · reached {tempo} notes a minute
              {g.score >= best && g.score > 0 ? ' · a new best' : ''}
            </p>
            <button className="btn btn-primary" onClick={start}>
              Play again
            </button>
          </div>
        )}
      </div>
      <Piano range={range} focus={focus} pressed={pressed} onPress={press} label="Keyboard" />
    </>
  )
}

// ── drawing ─────────────────────────────────────────────────────────────────

const W = 640
const HIT_X = 110
const PX_PER_S = 90
const LINE_GAP = 10
const STAFF_HEIGHT = 40
const GRAND_GAP = 72
const STEM = 30
const MARGIN = 34

function StreamStaff({ clefs, notes, now }: { clefs: Clef[]; notes: Note[]; now: number }) {
  const height = clefs.length === 2 ? GRAND_GAP + STAFF_HEIGHT : STAFF_HEIGHT
  const top = -MARGIN
  const bottom = height + MARGIN
  const offsetOf = (clef: Clef) => (clefs.length === 2 && clef === 'bass' ? GRAND_GAP : 0)

  return (
    <svg
      className="stream-staff"
      viewBox={`0 ${top} ${W} ${bottom - top}`}
      fill="currentColor"
      role="img"
      aria-label="Notes approaching the play line"
    >
      {clefs.map((clef) => (
        <g key={clef} transform={`translate(0, ${offsetOf(clef)})`}>
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={4} y={i * LINE_GAP} width={W - 8} height="1.1" />
          ))}
          {clef === 'treble' ? <TrebleClef x={8} /> : <BassClef x={10} />}
        </g>
      ))}
      <rect className="stream-hit" x={HIT_X - 1} y={top + 4} width="2" height={bottom - top - 8} />
      {notes.map((n) => {
        const x = HIT_X + (n.at - now) * PX_PER_S
        if (x < 56 || x > W + 12) return null
        return <StreamNote key={n.id} note={n} x={x} offsetY={offsetOf(n.target.clef)} />
      })}
    </svg>
  )
}

function StreamNote({ note, x, offsetY }: { note: Note; x: number; offsetY: number }) {
  const pitch = parsePitch(note.target.pitch)
  const y = STAFF_HEIGHT - (pitch.step - CLEF_ANCHOR[note.target.clef]) * (LINE_GAP / 2)
  const stemUp = y > LINE_GAP * 2
  const stemX = stemUp ? x + 5.7 : x - 5.7
  const ledgers: number[] = []
  for (let ly = -LINE_GAP; ly >= y; ly -= LINE_GAP) ledgers.push(ly)
  for (let ly = STAFF_HEIGHT + LINE_GAP; ly <= y; ly += LINE_GAP) ledgers.push(ly)
  const accidental = pitch.alter > 0 ? '#' : pitch.alter < 0 ? 'b' : null

  return (
    <g
      transform={`translate(0, ${offsetY})`}
      className={`stream-note is-${note.state}`}
      data-midi={note.target.midi}
    >
      {ledgers.map((ly) => (
        <rect key={ly} x={x - 11} y={ly} width="22" height="1.1" />
      ))}
      {accidental && <Accidental kind={accidental} x={x - 11} y={y} />}
      <ellipse cx={x} cy={y} rx="6.3" ry="4.7" transform={`rotate(-20 ${x} ${y})`} />
      <rect x={stemX - 0.7} y={stemUp ? y - STEM : y} width="1.4" height={STEM} />
    </g>
  )
}
