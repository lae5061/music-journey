import type { Timbre } from '../config'
import { DEFAULT_TEMPO, DEFAULT_VELOCITY, SWING_OFFSET, type Phrase } from './music'
import { frequencyOf } from './notes'

/**
 * A small synthesiser, enough to hear what the theory is describing. Notes are
 * oscillator pairs with a shaped envelope; phrases are scheduled ahead on the audio
 * clock so rhythm stays accurate even when the main thread is busy rendering.
 */

interface Voice {
  wave: OscillatorType
  /** A quiet partial an octave (or fifth) up, for a little body. */
  partial?: { wave: OscillatorType; interval: number; gain: number }
  peak: number
  /** Fraction of the note's length spent decaying; a struck string decays, an organ doesn't. */
  sustain: number
}

const VOICES: Record<Timbre, Voice> = {
  piano: {
    wave: 'triangle',
    partial: { wave: 'sine', interval: 12, gain: 0.3 },
    peak: 0.25,
    sustain: 0.25,
  },
  organ: {
    wave: 'square',
    partial: { wave: 'sine', interval: 7, gain: 0.35 },
    peak: 0.08,
    sustain: 1,
  },
}

const ATTACK_S = 0.008
const RELEASE_TAIL_S = 0.08
const SILENCE = 0.0001

let ctx: AudioContext | null = null

/**
 * Created lazily inside the gesture that first asks for sound, and resumed on every
 * use: browsers start an AudioContext suspended until someone interacts with the page.
 */
function audioContext(): AudioContext | null {
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

/** True once the browser has let us start making sound. */
export const audioReady = () => ctx !== null && ctx.state === 'running'

interface Sounded {
  stop(): void
}

function strike(
  c: AudioContext,
  midi: number,
  at: number,
  duration: number,
  velocity: number,
  timbre: Timbre,
): Sounded {
  const voice = VOICES[timbre]
  const level = voice.peak * velocity
  const out = c.createGain()
  out.connect(c.destination)

  const oscillators: OscillatorNode[] = []
  const add = (wave: OscillatorType, semitones: number, gain: number) => {
    const osc = c.createOscillator()
    const amp = c.createGain()
    osc.type = wave
    osc.frequency.value = frequencyOf(midi + semitones)
    amp.gain.value = gain
    osc.connect(amp)
    amp.connect(out)
    osc.start(at)
    osc.stop(at + duration + RELEASE_TAIL_S)
    oscillators.push(osc)
  }

  add(voice.wave, 0, 1)
  if (voice.partial) add(voice.partial.wave, voice.partial.interval, voice.partial.gain)

  // A struck note decays under its own weight; a held one stays put until released.
  const decayTo = level * voice.sustain
  out.gain.setValueAtTime(0, at)
  out.gain.linearRampToValueAtTime(level, at + ATTACK_S)
  if (voice.sustain < 1) {
    out.gain.exponentialRampToValueAtTime(
      Math.max(decayTo, SILENCE),
      at + ATTACK_S + duration * 0.6,
    )
  }
  out.gain.exponentialRampToValueAtTime(SILENCE, at + duration + RELEASE_TAIL_S)

  return {
    stop() {
      const now = c.currentTime
      try {
        out.gain.cancelScheduledValues(now)
        out.gain.setValueAtTime(Math.max(out.gain.value, SILENCE), now)
        out.gain.exponentialRampToValueAtTime(SILENCE, now + 0.05)
        oscillators.forEach((osc) => osc.stop(now + 0.06))
      } catch {
        // Already stopped — nothing to do.
      }
    },
  }
}

/** The metronome: a bright tick on beat one, a duller one elsewhere. */
interface Ticking {
  stop(): void
}

function click(c: AudioContext, at: number, accented: boolean): Ticking {
  const osc = c.createOscillator()
  const amp = c.createGain()
  osc.type = 'square'
  osc.frequency.value = accented ? 1600 : 1100
  amp.gain.setValueAtTime(accented ? 0.12 : 0.06, at)
  amp.gain.exponentialRampToValueAtTime(SILENCE, at + 0.04)
  osc.connect(amp)
  amp.connect(c.destination)
  osc.start(at)
  osc.stop(at + 0.06)
  return {
    stop() {
      try {
        osc.stop()
      } catch {
        // Already finished.
      }
    },
  }
}

/** Sound one note immediately — a learner tapping a key. */
export function playNote(midi: number, timbre: Timbre, duration = 1.2, velocity = 0.8) {
  const c = audioContext()
  if (!c) return
  strike(c, midi, c.currentTime, duration, velocity, timbre)
}

/** A metronome on its own: `count` beats at `tempo`, the first of each bar accented. */
export function playClicks(count: number, tempo: number, perBar = 4): Playback {
  const c = audioContext()
  if (!c) return { stop() {} }
  const beat = 60 / tempo
  const start = c.currentTime + 0.06
  const ticks: Ticking[] = []
  for (let b = 0; b < count; b++) ticks.push(click(c, start + b * beat, b % perBar === 0))
  return {
    stop() {
      ticks.forEach((t) => t.stop())
    },
  }
}

export interface Playback {
  /** Cut everything short — used when the learner moves on mid-phrase. */
  stop(): void
}

export interface PhraseCallbacks {
  /** Called as each note starts and stops, so the keyboard can light up in time. */
  onKey?: (midi: number, on: boolean) => void
  onEnd?: () => void
}

/**
 * Schedule a whole phrase. Note timings come off the audio clock; the visual
 * callbacks are ordinary timers lined up against the same schedule.
 */
export function playPhrase(
  phrase: Phrase,
  timbre: Timbre,
  { onKey, onEnd }: PhraseCallbacks = {},
): Playback {
  const c = audioContext()
  if (!c) return { stop() {} }

  const beat = 60 / (phrase.tempo ?? DEFAULT_TEMPO)
  const start = c.currentTime + 0.06 // a beat of headroom so nothing is late
  const sounded: Sounded[] = []
  const timers: number[] = []
  let latest = 0

  // The sustain pedal holds everything to the end of the phrase.
  const pedalEnd = phrase.pedal
    ? phrase.hits.reduce((max, h) => Math.max(max, h.at + (h.dur ?? 1)), 0)
    : 0

  for (const hit of phrase.hits) {
    // Swung eighths sit two thirds through the beat rather than halfway.
    const swung = phrase.swing && Math.abs((hit.at % 1) - 0.5) < 1e-6
    const at = hit.at + (swung ? SWING_OFFSET : 0)
    const dur = phrase.pedal ? Math.max(pedalEnd - hit.at, hit.dur ?? 1) : (hit.dur ?? 1)
    const velocity = hit.vel ?? DEFAULT_VELOCITY
    const notes = Array.isArray(hit.n) ? hit.n : [hit.n]

    const startS = at * beat
    const durS = dur * beat
    latest = Math.max(latest, startS + durS)

    for (const midi of notes) {
      sounded.push(strike(c, midi, start + startS, durS, velocity, timbre))
      if (!onKey) continue
      // Light the key for the note's length, capped so a fast run still flickers.
      timers.push(window.setTimeout(() => onKey(midi, true), startS * 1000))
      timers.push(
        window.setTimeout(() => onKey(midi, false), (startS + Math.min(durS, 0.6)) * 1000),
      )
    }
  }

  if (phrase.click) {
    const perBar = typeof phrase.click === 'number' ? phrase.click : 4
    const bars = Math.ceil(latest / beat)
    for (let b = 0; b < bars; b++) click(c, start + b * beat, b % perBar === 0)
  }

  if (onEnd) timers.push(window.setTimeout(onEnd, latest * 1000 + 100))

  return {
    stop() {
      timers.forEach(clearTimeout)
      sounded.forEach((s) => s.stop())
      onEnd?.()
    },
  }
}
