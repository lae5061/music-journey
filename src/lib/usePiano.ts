import { useCallback, useEffect, useRef, useState } from 'react'
import { TIMBRE, type Timbre } from '../config'
import { playNote, playPhrase, type Playback } from './audio'
import { phraseNotes, spell, type Phrase } from './music'
import { noteName } from './notes'

const TAPPED_NOTE_S = 1.2
const NOTHING_PLAYED = 'Nothing played yet'

/**
 * Owns what the keyboard sounds and what it looks like while sounding: which keys are
 * lit, whether a phrase is running, and the "Played C – E – G" line above the board.
 *
 * Keys are reference-counted, because a phrase can restrike a note it is still
 * holding and the light must not go out early.
 */
export function usePiano(timbre: Timbre = TIMBRE) {
  const [pressed, setPressed] = useState<ReadonlySet<number>>(() => new Set())
  const [lastPlayed, setLastPlayed] = useState(NOTHING_PLAYED)
  const [playing, setPlaying] = useState(false)

  const held = useRef(new Map<number, number>())
  const current = useRef<Playback | null>(null)
  const tapTimers = useRef(new Set<number>())

  const setKey = useCallback((midi: number, on: boolean) => {
    const counts = held.current
    const next = (counts.get(midi) ?? 0) + (on ? 1 : -1)
    if (next > 0) counts.set(midi, next)
    else counts.delete(midi)
    setPressed(new Set(counts.keys()))
  }, [])

  const stop = useCallback(() => {
    current.current?.stop()
    current.current = null
    tapTimers.current.forEach(clearTimeout)
    tapTimers.current.clear()
    held.current.clear()
    setPressed(new Set())
    setPlaying(false)
  }, [])

  // Nothing should keep sounding after the component that started it is gone.
  useEffect(() => stop, [stop])

  /** A learner tapping a key directly. */
  const pressKey = useCallback(
    (midi: number) => {
      playNote(midi, timbre, TAPPED_NOTE_S)
      setKey(midi, true)
      const id = window.setTimeout(() => {
        tapTimers.current.delete(id)
        setKey(midi, false)
      }, 500)
      tapTimers.current.add(id)
      setLastPlayed(`Played ${noteName(midi)}`)
    },
    [timbre, setKey],
  )

  /** Sound a whole phrase, replacing anything already running. */
  const play = useCallback(
    (phrase: Phrase, label?: string) => {
      stop()
      setPlaying(true)
      setLastPlayed(label ?? describe(phrase))
      current.current = playPhrase(phrase, timbre, {
        onKey: setKey,
        onEnd: () => {
          current.current = null
          setPlaying(false)
        },
      })
    },
    [timbre, setKey, stop],
  )

  return { pressed, lastPlayed, playing, pressKey, play, stop }
}

/** "Played C – E – G" for a chord, "C → D → E" for a line. */
function describe(phrase: Phrase): string {
  const starts = new Set(phrase.hits.map((h) => h.at))
  const simultaneous = starts.size === 1
  const notes = phraseNotes(phrase)
  if (notes.length === 0) return NOTHING_PLAYED
  const names = (simultaneous ? notes : orderedByTime(phrase)).map((n) => spell(n))
  const shown = names.length > 10 ? [...names.slice(0, 9), '…'] : names
  return `Played ${shown.join(simultaneous ? ' – ' : ' → ')}`
}

function orderedByTime(phrase: Phrase): number[] {
  return [...phrase.hits]
    .sort((a, b) => a.at - b.at)
    .flatMap((hit) => (Array.isArray(hit.n) ? [...hit.n].sort((a, b) => a - b) : [hit.n]))
}
