import { useCallback, useEffect, useRef } from 'react'
import { TIMBRE } from '../config'
import { playNote, type Sounded } from './audio'

/** A key stays lit for the note, but a long note goes dark sooner so runs still flicker. */
const LIGHT_CAP_S = 0.6

/**
 * What a score's notes do when they arrive: strike the synth and, if there is a
 * keyboard, light the key. Everything sounding or lit is remembered so a pause can
 * silence and darken it all at once; `holdKey` is ref-counted, so every light-on is
 * matched by a light-off.
 */
export function useScoreSound(holdKey?: (midi: number, on: boolean) => void) {
  const live = useRef<{ timers: Set<number>; notes: Set<Sounded>; keys: Map<number, number> }>({
    timers: new Set(),
    notes: new Set(),
    keys: new Map(),
  })

  const release = useCallback(() => {
    const l = live.current
    l.timers.forEach(window.clearTimeout)
    l.timers.clear()
    l.notes.forEach((n) => n.stop())
    l.notes.clear()
    l.keys.forEach((count, midi) => {
      for (let i = 0; i < count; i++) holdKey?.(midi, false)
    })
    l.keys.clear()
  }, [holdKey])

  useEffect(() => release, [release])

  const onNoteOn = useCallback(
    (midi: number, durationS: number, velocity: number) => {
      const l = live.current
      const note = playNote(midi, TIMBRE, Math.max(0.15, durationS), Math.max(0.3, velocity))
      l.notes.add(note)
      if (holdKey) {
        holdKey(midi, true)
        l.keys.set(midi, (l.keys.get(midi) ?? 0) + 1)
      }
      const id = window.setTimeout(() => {
        l.timers.delete(id)
        l.notes.delete(note)
        if (holdKey) {
          holdKey(midi, false)
          const left = (l.keys.get(midi) ?? 1) - 1
          if (left > 0) l.keys.set(midi, left)
          else l.keys.delete(midi)
        }
      }, Math.min(durationS, LIGHT_CAP_S) * 1000)
      l.timers.add(id)
    },
    [holdKey],
  )

  return { onNoteOn, release }
}
