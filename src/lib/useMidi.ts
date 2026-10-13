import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * A MIDI keyboard, if the learner has one and asks for it. Optional throughout: nothing
 * is requested until they press Connect, and the on-screen keys and typed letters keep
 * working exactly as before. Safari has no Web MIDI, so there it only says so.
 */

export type MidiStatus = 'unsupported' | 'off' | 'connecting' | 'on' | 'denied'

export interface MidiNote {
  midi: number
  /** 0…1 */
  velocity: number
  on: boolean
}

const STORAGE_KEY = 'tonic.midi.v1'

const supported = () => typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator

const wantedBefore = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'on'
  } catch {
    return false
  }
}

const remember = (on: boolean) => {
  try {
    localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off')
  } catch {
    // Then they press Connect again next time.
  }
}

const NOTE_ON = 0x90
const NOTE_OFF = 0x80

export function useMidi(onNote: (note: MidiNote) => void) {
  const [status, setStatus] = useState<MidiStatus>(() => (supported() ? 'off' : 'unsupported'))
  const [inputs, setInputs] = useState<string[]>([])
  const access = useRef<MIDIAccess | null>(null)
  const latest = useRef(onNote)
  latest.current = onNote

  /** Listen on every input there is now; called again whenever one is plugged or unplugged. */
  const attach = useCallback(() => {
    const a = access.current
    if (!a) return
    const names: string[] = []
    a.inputs.forEach((input) => {
      names.push(input.name || 'MIDI keyboard')
      input.onmidimessage = (e) => {
        const data = e.data
        if (!data || data.length < 3) return
        const kind = data[0] & 0xf0
        const midi = data[1]
        const velocity = data[2]
        if (kind === NOTE_ON && velocity > 0) latest.current({ midi, velocity: velocity / 127, on: true })
        else if (kind === NOTE_OFF || kind === NOTE_ON) latest.current({ midi, velocity: 0, on: false })
      }
    })
    setInputs(names)
  }, [])

  const connect = useCallback(async () => {
    if (!supported()) return
    setStatus('connecting')
    try {
      const a = await navigator.requestMIDIAccess()
      access.current = a
      a.onstatechange = attach
      attach()
      setStatus('on')
      remember(true)
    } catch {
      setStatus('denied')
      remember(false)
    }
  }, [attach])

  /** Stop listening, without forgetting that the learner wanted MIDI. */
  const release = useCallback(() => {
    const a = access.current
    if (a) {
      a.inputs.forEach((input) => {
        input.onmidimessage = null
      })
      a.onstatechange = null
    }
    access.current = null
    setInputs([])
    setStatus('off')
  }, [])

  const disconnect = useCallback(() => {
    release()
    remember(false)
  }, [release])

  // Someone who connected last time gets reconnected without asking; the browser
  // remembers the permission, so this does not prompt again.
  useEffect(() => {
    if (wantedBefore()) void connect()
  }, [connect])

  useEffect(() => release, [release])

  return { status, inputs, connect, disconnect }
}
