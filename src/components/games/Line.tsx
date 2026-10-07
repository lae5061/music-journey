import { useEffect, useMemo, useRef, useState } from 'react'
import type { StaffNote, StaffSpec } from '../../data/types'
import { playClicks, type Playback } from '../../lib/audio'
import { spell } from '../../lib/music'
import { parsePitch } from '../../lib/pitch'
import {
  BOARD,
  BOARD_FOCUS,
  LINE_BARS,
  loadBests,
  makeMelody,
  onsetsOf,
  recordBest,
  sameNote,
} from '../../lib/sightReading'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { Piano } from '../Piano'
import { Staff } from '../notation/Staff'
import { Stat, type ModeProps } from './SightReading'

type Phase = 'ready' | 'countin' | 'playing' | 'done'

interface Press {
  midi: number
  /** Seconds after bar one began. */
  at: number
}

interface Mark {
  state: 'right' | 'wrong' | 'missed'
  timing?: 'early' | 'on' | 'late'
  played?: number
}

const COUNT_IN = 4
const BEATS_PER_BAR = 4
const LINES_PER_SET = 5
/** A note this far from its beat, as a fraction of one, is early or late. */
const TIMING_SLACK = 0.3
/** Below this, four bars on one line are too small to read; the line breaks in two. */
const ONE_SYSTEM = '(min-width: 700px)'

/** A four-bar line to a click. Afterwards every note is marked. */
export function Line({ level, pressed, onPressKey, register }: ModeProps) {
  const [melody, setMelody] = useState(() => makeMelody(level))
  const [phase, setPhase] = useState<Phase>('ready')
  const [beat, setBeat] = useState(0)
  const [pressCount, setPressCount] = useState(0)
  const [marks, setMarks] = useState<Mark[] | null>(null)
  const [lineNo, setLineNo] = useState(1)
  const [accuracies, setAccuracies] = useState<number[]>([])
  const [best, setBest] = useState(() => loadBests().line[level.id] ?? 0)
  const oneSystem = useMediaQuery(ONE_SYSTEM)

  const presses = useRef<Press[]>([])
  const clicks = useRef<Playback | null>(null)
  const timers = useRef<number[]>([])
  const t0 = useRef(0)
  const phaseRef = useRef<Phase>('ready')

  const onsets = useMemo(() => onsetsOf(melody.notes), [melody])
  const beatS = 60 / melody.tempo
  const totalBeats = LINE_BARS * BEATS_PER_BAR
  const midis = useMemo(() => melody.notes.map((n) => parsePitch(n.pitch!).midi), [melody])

  const setPhaseBoth = (p: Phase) => {
    phaseRef.current = p
    setPhase(p)
  }

  const clear = () => {
    clicks.current?.stop()
    clicks.current = null
    timers.current.forEach(window.clearTimeout)
    timers.current = []
  }
  useEffect(() => clear, [])

  const finish = () => {
    if (phaseRef.current === 'done') return
    clear()
    const graded = melody.notes.map((_, i): Mark => {
      const p = presses.current[i]
      if (!p) return { state: 'missed' }
      const right = sameNote(p.midi, midis[i])
      const d = p.at - onsets[i] * beatS
      const timing = d > TIMING_SLACK * beatS ? 'late' : d < -TIMING_SLACK * beatS ? 'early' : 'on'
      return { state: right ? 'right' : 'wrong', timing, played: p.midi }
    })
    setMarks(graded)
    setPhaseBoth('done')
    const pct = Math.round((graded.filter((m) => m.state === 'right').length / graded.length) * 100)
    setAccuracies((a) => [...a, pct])
    if (pct > best) setBest(recordBest('line', level.id, pct))
  }

  const start = () => {
    clear()
    presses.current = []
    setPressCount(0)
    setMarks(null)
    setBeat(1)
    setPhaseBoth('countin')
    clicks.current = playClicks(COUNT_IN + totalBeats, melody.tempo, BEATS_PER_BAR)
    const startMs = performance.now()
    t0.current = startMs + COUNT_IN * beatS * 1000
    for (let b = 1; b < COUNT_IN; b++) {
      timers.current.push(window.setTimeout(() => setBeat(b + 1), b * beatS * 1000))
    }
    timers.current.push(window.setTimeout(() => setPhaseBoth('playing'), COUNT_IN * beatS * 1000))
    // A beat of grace after the last bar, then the line is over whether or not it was finished.
    timers.current.push(window.setTimeout(finish, (COUNT_IN + totalBeats + 1) * beatS * 1000))
  }

  const press = (midi: number) => {
    onPressKey(midi)
    if (phaseRef.current !== 'playing') return
    if (presses.current.length >= melody.notes.length) return
    presses.current.push({ midi, at: (performance.now() - t0.current) / 1000 })
    setPressCount(presses.current.length)
    if (presses.current.length === melody.notes.length) finish()
  }

  useEffect(() => register(press))

  const nextLine = () => {
    clear()
    presses.current = []
    setPressCount(0)
    setMarks(null)
    setMelody(makeMelody(level))
    setPhaseBoth('ready')
    setLineNo((n) => n + 1)
  }

  const newSet = () => {
    setAccuracies([])
    setLineNo(0)
    nextLine()
  }

  const shown = melody.notes.map((n, i) => (marks ? marked(n, marks[i]) : n))
  const spec: StaffSpec = {
    clef: melody.clef,
    time: [BEATS_PER_BAR, 4],
    notes: shown,
    counts: marks !== null,
  }
  // On a phone, two bars to a line: the generator never splits a note across a barline.
  const half = onsets.findIndex((b) => b >= (LINE_BARS / 2) * BEATS_PER_BAR)
  const systems: StaffSpec[] =
    oneSystem || half <= 0
      ? [spec]
      : [
          { ...spec, notes: shown.slice(0, half) },
          { ...spec, notes: shown.slice(half), time: undefined },
        ]

  const lastAccuracy = accuracies[accuracies.length - 1]
  const setDone = phase === 'done' && lineNo >= LINES_PER_SET
  const average = accuracies.length
    ? Math.round(accuracies.reduce((a, b) => a + b, 0) / accuracies.length)
    : null

  return (
    <>
      <div className="game-board">
        <div className="game-stats">
          <Stat label={`Line of ${LINES_PER_SET}`} value={String(Math.min(lineNo, LINES_PER_SET))} />
          <Stat label="This line" value={lastAccuracy !== undefined && phase === 'done' ? `${lastAccuracy}%` : '–'} accent />
          <Stat label="Set average" value={average !== null ? `${average}%` : '–'} />
          <Stat label="Best line" value={best ? `${best}%` : '–'} />
        </div>

        <div className="game-staff game-staff--line">
          {systems.map((s, i) => (
            <Staff key={i} spec={s} scale={2} />
          ))}
        </div>

        {phase === 'ready' && (
          <div className="game-line-controls">
            <button className="btn btn-primary" onClick={start}>
              {lineNo === 1 ? 'Start' : 'Play this line'}
            </button>
            <span className="game-hint">
              Four beats of count-in, then play the line to the click, in any octave. {melody.tempo} a minute.
            </span>
          </div>
        )}
        {phase === 'countin' && (
          <p className="game-message game-countin" aria-live="assertive">
            {Array.from({ length: COUNT_IN }, (_, i) => (
              <span key={i} className={i + 1 === beat ? 'is-now' : undefined}>
                {i + 1}
              </span>
            ))}
          </p>
        )}
        {phase === 'playing' && (
          <p className="game-message" aria-live="polite">
            Play — {pressCount} of {melody.notes.length}
          </p>
        )}
        {phase === 'done' && marks && (
          <div className="game-line-controls">
            {!setDone ? (
              <>
                <button className="btn btn-primary" onClick={nextLine}>
                  Next line
                </button>
                <button className="btn btn-secondary" onClick={start}>
                  Play it again
                </button>
                <span className="game-hint">{describe(marks)}</span>
              </>
            ) : (
              <>
                <button className="btn btn-primary" onClick={newSet}>
                  New set
                </button>
                <span className="game-hint">
                  Set done: {average}% over {LINES_PER_SET} lines.
                </span>
              </>
            )}
          </div>
        )}
      </div>
      <Piano range={BOARD} focus={BOARD_FOCUS} pressed={pressed} onPress={press} label="Keyboard" />
    </>
  )
}

/** The note as it should print once graded: tinted, and labelled with what went wrong. */
function marked(note: StaffNote, mark: Mark): StaffNote {
  const className = mark.state === 'right' ? 'is-right' : 'is-wrong'
  const count =
    mark.state === 'missed'
      ? '–'
      : mark.state === 'wrong'
        ? spell(mark.played!)
        : mark.timing === 'on'
          ? ''
          : mark.timing
  return { ...note, className, count }
}

function describe(marks: Mark[]): string {
  const wrong = marks.filter((m) => m.state === 'wrong').length
  const missed = marks.filter((m) => m.state === 'missed').length
  const off = marks.filter((m) => m.state === 'right' && m.timing !== 'on').length
  const parts: string[] = []
  if (wrong) parts.push(`${wrong} wrong`)
  if (missed) parts.push(`${missed} not played`)
  if (off) parts.push(`${off} off the beat`)
  return parts.length ? `${parts.join(', ')}. Wrong notes say what you played.` : 'Every note, on the beat.'
}
