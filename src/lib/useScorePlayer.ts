import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import type { ClickListener, NoteTimingEvent, TimingCallbacks, TuneObject } from 'abcjs'
import { handPlays, loadAbcjs, voiceByChar, type Abcjs, type Hands } from './abc'

/**
 * A score that plays. abcjs draws the ABC into `target` and runs the clock; every note
 * group comes back through `onNoteOn` (for the synth and the keys) and every beat
 * through `onBeat` (for the click and the count-in). The current notes are tinted and
 * a cursor line moves across the page.
 */

export type PlayerStatus = 'loading' | 'ready' | 'playing' | 'paused' | 'error'

export interface ScorePlayerOptions {
  abc: string
  target: RefObject<HTMLDivElement | null>
  /** Fewer bars to a line on a narrow screen. */
  narrow: boolean
  /** Beats a minute; the piece's own tempo when left out. */
  bpm?: number
  hands: Hands
  countIn: boolean
  /** `delayS` is how long after the beat the note should start: a rolled chord's upper notes come a little late. */
  onNoteOn?: (midi: number, durationS: number, velocity: number, delayS: number) => void
  onBeat?: (beatInBar: number, perBar: number, countingIn: boolean) => void
  onFinish?: () => void
  /** The score editor's hooks: its own click handling, selectable types, dragging, and a look at the drawn tune. */
  clickListener?: ClickListener
  selectTypes?: boolean | string[]
  dragging?: boolean
  onRendered?: (tune: TuneObject, svg: SVGSVGElement) => void
  /** Let a short last line stretch to the full width, as the editor's lines of empty bars should. */
  stretch?: boolean
}

export interface ScorePlayer {
  status: PlayerStatus
  error: string | null
  /** The tempo written in the piece. */
  baseBpm: number
  bpm: number
  /** 1-based, where the cursor is. */
  bar: number
  bars: number
  /** Every pitch the piece sounds, for sizing the keyboard. */
  midis: number[]
  voices: number
  play: () => void
  pause: () => void
  stop: () => void
  seekToBar: (bar: number) => void
}

const CURSOR_CLASS = 'score-cursor'
/** abcjs prints the tempo above the first staff; the page shows it itself, so the mark and its space go. */
export const NO_TEMPO_MARK = '%%printtempo false'
/** How far apart the notes of a rolled chord strike, bottom to top. */
const ROLL_GAP_S = 0.045
const PLAYING_CLASS = 'is-playing'

interface Pitch {
  pitch: number
  volume: number
  duration: number
  startChar?: number
}

export function useScorePlayer({
  abc,
  target,
  narrow,
  bpm: wantedBpm,
  hands,
  countIn,
  onNoteOn,
  onBeat,
  onFinish,
  clickListener,
  selectTypes,
  dragging,
  onRendered,
  stretch = false,
}: ScorePlayerOptions): ScorePlayer {
  const [lib, setLib] = useState<Abcjs | null>(null)
  const [status, setStatus] = useState<PlayerStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const [baseBpm, setBaseBpm] = useState(100)
  const [bar, setBar] = useState(1)
  const [bars, setBars] = useState(0)
  const [midis, setMidis] = useState<number[]>([])
  const [voices, setVoices] = useState(1)

  const tune = useRef<TuneObject | null>(null)
  const timer = useRef<TimingCallbacks | null>(null)
  const voiceOf = useRef<Map<number, number>>(new Map())
  const lit = useRef<HTMLElement[]>([])
  const cursor = useRef<SVGLineElement | null>(null)
  const statusRef = useRef<PlayerStatus>('loading')
  const lastMs = useRef(0)
  const oldMsPerBar = useRef(1)
  const offsetRef = useRef(0)

  // Callbacks change identity every render; the timer must always see the latest.
  const latest = useRef({ onNoteOn, onBeat, onFinish, hands, clickListener, onRendered })
  latest.current = { onNoteOn, onBeat, onFinish, hands, clickListener, onRendered }

  const setStatusBoth = (s: PlayerStatus) => {
    statusRef.current = s
    setStatus(s)
  }

  useEffect(() => {
    let alive = true
    loadAbcjs().then((m) => {
      if (alive) setLib(m)
    })
    return () => {
      alive = false
    }
  }, [])

  const bpm = Math.max(20, Math.round(wantedBpm ?? baseBpm))

  const unlight = () => {
    for (const el of lit.current) el.classList.remove(PLAYING_CLASS)
    lit.current = []
    if (cursor.current) cursor.current.setAttribute('opacity', '0')
  }

  const showEvent = (ev: NoteTimingEvent) => {
    for (const el of lit.current) el.classList.remove(PLAYING_CLASS)
    lit.current = (ev.elements ?? []).flat()
    for (const el of lit.current) el.classList.add(PLAYING_CLASS)
    const line = cursor.current
    if (line && ev.left !== undefined && ev.left !== null && ev.top !== undefined && ev.height !== undefined) {
      line.setAttribute('x1', String(ev.left - 2))
      line.setAttribute('x2', String(ev.left - 2))
      line.setAttribute('y1', String(ev.top))
      line.setAttribute('y2', String(ev.top + ev.height))
      line.setAttribute('opacity', '1')
    }
    const first = lit.current[0]
    if (first) first.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
  }

  // ── render ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const box = target.current
    if (!lib || !box) return
    timer.current?.stop()
    timer.current = null
    unlight()
    try {
      // The page shows the title itself; the score keeps only the music.
      // (A blank line would end the tune, so the whole line goes, newline included.)
      let music = abc.replace(/^[TC]:.*(\r?\n|$)/gm, '')
      // The editor's text already carries the directive; adding it there would shift the
      // character positions its spans rely on.
      if (!music.includes(NO_TEMPO_MARK)) music = `${NO_TEMPO_MARK}\n${music}`
      const [first] = lib.renderAbc(box, music, {
        add_classes: true,
        responsive: 'resize',
        staffwidth: narrow ? 400 : 820,
        wrap: { preferredMeasuresPerLine: narrow ? 2 : 4, minSpacing: 1.8, maxSpacing: stretch ? 12 : 2.7 },
        paddingleft: 0,
        paddingright: 0,
        paddingtop: 0,
        paddingbottom: 10,
        selectTypes: selectTypes as never,
        dragging,
        clickListener: (...args) => {
          if (latest.current.clickListener) {
            latest.current.clickListener(...args)
            return
          }
          const ms = (args[0] as { currentTrackMilliseconds?: number | number[] }).currentTrackMilliseconds
          const at = Array.isArray(ms) ? ms[0] : ms
          if (typeof at === 'number' && timer.current) timer.current.setProgress(at / 1000, 'seconds')
        },
      })
      if (!first) throw new Error('Nothing to draw: the ABC has no tune in it.')
      // Timing alone does not work out MIDI pitches; the audio set-up does, silently.
      first.setUpAudio({})
      tune.current = first
      voiceOf.current = voiceByChar(first)
      setError(first.warnings?.length ? first.warnings[0].replace(/<[^>]+>/g, '') : null)
      setBaseBpm(first.getBpm())
      setVoices(Math.max(1, countVoices(first)))
      setMidis(allPitches(first))
      // A cursor line inside the SVG scales with it.
      const svg = box.querySelector('svg')
      if (svg) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        line.setAttribute('class', CURSOR_CLASS)
        line.setAttribute('opacity', '0')
        svg.appendChild(line)
        cursor.current = line
        latest.current.onRendered?.(first, svg)
      }
      setStatusBoth('ready')
      setBar(1)
    } catch (e) {
      tune.current = null
      setError(e instanceof Error ? e.message : String(e))
      setStatusBoth('error')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lib, abc, narrow, selectTypes, dragging, stretch])

  // ── timing ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = tune.current
    if (!lib || !t || status === 'loading' || status === 'error') return
    const wasPlaying = statusRef.current === 'playing'
    const msPerBar = t.millisecondsPerMeasure(bpm)
    // With a count-in the clock starts a bar early; bar numbers are counted from the music.
    const offsetMs = countIn ? msPerBar : 0
    const resumeAt = lastMs.current
    timer.current?.stop()

    const perBar = t.getBeatsPerMeasure()
    const beatLength = t.getBeatLength()
    const timing = new lib.TimingCallbacks(t, {
      qpm: bpm,
      extraMeasuresAtBeginning: countIn ? 1 : 0,
      beatCallback: (beatNumber) => {
        const countingIn = countIn && beatNumber < perBar
        latest.current.onBeat?.((beatNumber % perBar) + 1, perBar, countingIn)
      },
      eventCallback: (ev): undefined => {
        if (!ev) {
          unlight()
          lastMs.current = 0
          setBar(1)
          setStatusBoth('ready')
          latest.current.onFinish?.()
          return undefined
        }
        lastMs.current = ev.milliseconds
        showEvent(ev)
        setBar(Math.max(1, Math.floor((ev.milliseconds - offsetMs) / ev.millisecondsPerMeasure) + 1))
        const pitches = (ev.midiPitches ?? []) as Pitch[]
        // A chord marked !arpeggio! is rolled: abcjs draws the wavy line but strikes the
        // notes together, so the roll is added here, lowest note first.
        const rolled = new Map<number, number>()
        for (const p of pitches) {
          if (p.startChar === undefined || rolled.has(p.startChar)) continue
          const item = t.getElementFromChar(p.startChar) as { decoration?: string[] } | null
          if (item?.decoration?.includes('arpeggio')) rolled.set(p.startChar, 0)
        }
        const sorted = [...pitches].sort((a, b) => a.pitch - b.pitch)
        for (const p of sorted) {
          if (!handPlays(latest.current.hands, voiceOf.current.get(p.startChar ?? -1))) continue
          // abcjs durations are fractions of a whole note; a beat is `beatLength` of one.
          const durS = (p.duration / beatLength) * (60 / bpm)
          let delayS = 0
          if (p.startChar !== undefined && rolled.has(p.startChar)) {
            const n = rolled.get(p.startChar)!
            delayS = n * ROLL_GAP_S
            rolled.set(p.startChar, n + 1)
          }
          latest.current.onNoteOn?.(p.pitch, Math.max(0.1, durS - delayS), p.volume / 127, delayS)
        }
        return undefined
      },
    })
    timer.current = timing
    setBars(Math.max(1, Math.round((t.getTotalTime() * 1000 - offsetMs) / msPerBar)))
    offsetRef.current = offsetMs

    // A tempo change mid-piece carries on from the same place at the new speed:
    // `resumeAt` was measured at the old tempo, so convert it through the bar count.
    if (wasPlaying) {
      const barsIn = resumeAt / oldMsPerBar.current
      timing.start((barsIn * msPerBar) / 1000, 'seconds')
      setStatusBoth('playing')
    }
    oldMsPerBar.current = msPerBar
    return () => {
      timing.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lib, bpm, countIn, status === 'loading' || status === 'error', abc, narrow])

  useEffect(() => () => unlight(), [])

  const play = useCallback(() => {
    const timing = timer.current
    if (!timing) return
    if (statusRef.current === 'paused') timing.start()
    else timing.start(0, 'seconds')
    setStatusBoth('playing')
  }, [])

  const pause = useCallback(() => {
    timer.current?.pause()
    unlight()
    setStatusBoth('paused')
  }, [])

  const stop = useCallback(() => {
    timer.current?.stop()
    unlight()
    lastMs.current = 0
    setBar(1)
    setStatusBoth('ready')
  }, [])

  const seekToBar = useCallback(
    (n: number) => {
      const t = tune.current
      const timing = timer.current
      if (!t || !timing) return
      const ms = offsetRef.current + (n - 1) * t.millisecondsPerMeasure(bpm)
      lastMs.current = ms
      setBar(n)
      if (statusRef.current === 'playing') timing.setProgress(ms / 1000, 'seconds')
      else {
        timing.setProgress(ms / 1000, 'seconds')
        timing.pause()
        setStatusBoth('paused')
      }
    },
    [bpm],
  )

  // A background tab's clock stalls; pause rather than let notes pile up.
  useEffect(() => {
    const onHide = () => {
      if (document.hidden && statusRef.current === 'playing') pause()
    }
    document.addEventListener('visibilitychange', onHide)
    return () => document.removeEventListener('visibilitychange', onHide)
  }, [pause])

  return { status, error, baseBpm, bpm, bar, bars, midis, voices, play, pause, stop, seekToBar }
}

function countVoices(t: TuneObject): number {
  let most = 0
  for (const line of t.lines) {
    const staves = (line as { staff?: Array<{ voices?: unknown[] }> }).staff
    if (!staves) continue
    most = Math.max(most, staves.reduce((n, s) => n + (s.voices?.length ?? 0), 0))
  }
  return most
}

function allPitches(t: TuneObject): number[] {
  const out = new Set<number>()
  for (const line of t.lines) {
    const staves = (line as { staff?: Array<{ voices?: Array<Array<{ midiPitches?: Pitch[] }>> }> }).staff
    if (!staves) continue
    for (const s of staves) for (const v of s.voices ?? []) for (const item of v) {
      for (const p of item.midiPitches ?? []) out.add(p.pitch)
    }
  }
  return [...out].sort((a, b) => a - b)
}
