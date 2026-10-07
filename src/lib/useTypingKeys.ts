import { useEffect, useRef, useState } from 'react'

/**
 * Play from the computer keyboard by typing a note's letter: C D E F G A B sound that
 * note in the current octave, Shift makes it sharp, and Z and X move the octave down
 * or up. Letters rather than a piano-shaped layout because this is a course about
 * naming notes, and "I played D" should mean D.
 */
const LETTER_SEMITONES: Record<string, number> = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 }

const DEFAULT_OCTAVE = 4
const LOWEST_OCTAVE = 1
const HIGHEST_OCTAVE = 7

export const typingHint = (octave: number) =>
  `Your computer keyboard plays too: type C D E F G A B for the note (C${octave} to B${octave} just now), hold Shift for a sharp, and press Z or X for an octave down or up.`

/**
 * Call `press` with a MIDI note for each letter typed; off while typing in a field.
 * Returns the octave the letters currently play in.
 */
export function useTypingKeys(press: (midi: number) => void, enabled = true): number {
  const [octave, setOctave] = useState(DEFAULT_OCTAVE)
  const octaveRef = useRef(DEFAULT_OCTAVE)
  const latest = useRef(press)
  latest.current = press

  useEffect(() => {
    if (!enabled) return
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return
      const target = e.target as HTMLElement | null
      const tag = target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable) return

      const key = e.key.toLowerCase()
      if (key === 'z' || key === 'x') {
        const next = Math.min(HIGHEST_OCTAVE, Math.max(LOWEST_OCTAVE, octaveRef.current + (key === 'x' ? 1 : -1)))
        octaveRef.current = next
        setOctave(next)
        e.preventDefault()
        return
      }
      const semitone = LETTER_SEMITONES[key]
      if (semitone === undefined) return
      e.preventDefault()
      latest.current(12 * (octaveRef.current + 1) + semitone + (e.shiftKey ? 1 : 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enabled])

  return octave
}
