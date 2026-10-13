import { createContext, useContext } from 'react'
import type { MidiStatus } from '../lib/useMidi'

export interface MidiState {
  status: MidiStatus
  inputs: string[]
  connect: () => void
  disconnect: () => void
  /** Whether the app's own synth sounds MIDI notes too; off for a piano with its own voice. */
  sound: boolean
  setSound: (on: boolean) => void
}

export const MidiContext = createContext<MidiState | null>(null)

/** The one line under a keyboard that offers, and reports, a MIDI connection. */
export function MidiControl() {
  const midi = useContext(MidiContext)
  if (!midi) return null

  if (midi.status === 'unsupported') {
    return (
      <p className="midi-control text-muted">
        A MIDI keyboard can play these keys in Chrome, Edge or Firefox; Safari has no MIDI yet.
      </p>
    )
  }

  if (midi.status === 'on') {
    return (
      <div className="midi-control">
        <span>
          <strong>MIDI</strong>{' '}
          {midi.inputs.length ? midi.inputs.join(', ') : 'connected — plug a keyboard in'}
        </span>
        <label className="midi-sound">
          <input type="checkbox" checked={midi.sound} onChange={(e) => midi.setSound(e.target.checked)} />
          Sound from the app
        </label>
        <button type="button" className="btn btn-ghost" onClick={midi.disconnect}>
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div className="midi-control">
      <span className="text-muted">
        {midi.status === 'denied'
          ? 'The browser refused MIDI access. Allow it in the address bar and try again.'
          : 'Got a MIDI keyboard? It can play these keys.'}
      </span>
      <button
        type="button"
        className="btn btn-ghost"
        onClick={midi.connect}
        disabled={midi.status === 'connecting'}
      >
        {midi.status === 'connecting' ? 'Connecting…' : 'Connect a MIDI keyboard'}
      </button>
    </div>
  )
}
