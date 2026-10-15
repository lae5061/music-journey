import { useCallback, useEffect, useRef, useState } from 'react'
import { TIMBRE } from '../../config'
import type { Piece } from '../../data/pieces'
import type { Hands } from '../../lib/abc'
import { playClick, playNote, unlockAudio, type Sounded } from '../../lib/audio'
import { rangeFor } from '../../lib/keyboard'
import { pieceHref, piecesHref } from '../../lib/route'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { useScorePlayer } from '../../lib/useScorePlayer'
import { MidiControl } from '../MidiControl'
import { Piano } from '../Piano'
import { Transport } from './Transport'

interface PiecePlayerProps {
  piece: Piece
  pressed: ReadonlySet<number>
  onPressKey: (midi: number) => void
  onHoldKey: (midi: number, on: boolean) => void
}

const NARROW = '(max-width: 700px)'
/** A key stays lit for the note, but a long note goes dark sooner so runs still flicker. */
const LIGHT_CAP_S = 0.6

/** The score, its transport, and the keyboard lighting under it. */
export function PiecePlayer({ piece, pressed, onPressKey, onHoldKey }: PiecePlayerProps) {
  const narrow = useMediaQuery(NARROW)
  const [tempoPct, setTempoPct] = useState(100)
  const [hands, setHands] = useState<Hands>('both')
  const [countIn, setCountIn] = useState(true)
  const [click, setClick] = useState(false)
  const [count, setCount] = useState<{ beat: number; perBar: number } | null>(null)
  const scoreBox = useRef<HTMLDivElement>(null)

  // Every lit key and sounding note, so pausing can silence and darken them all.
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
      for (let i = 0; i < count; i++) onHoldKey(midi, false)
    })
    l.keys.clear()
    setCount(null)
  }, [onHoldKey])

  useEffect(() => release, [release])

  const onNoteOn = useCallback(
    (midi: number, durationS: number, velocity: number) => {
      const l = live.current
      const note = playNote(midi, TIMBRE, Math.max(0.15, durationS), Math.max(0.3, velocity))
      l.notes.add(note)
      onHoldKey(midi, true)
      l.keys.set(midi, (l.keys.get(midi) ?? 0) + 1)
      const id = window.setTimeout(() => {
        l.timers.delete(id)
        l.notes.delete(note)
        onHoldKey(midi, false)
        const left = (l.keys.get(midi) ?? 1) - 1
        if (left > 0) l.keys.set(midi, left)
        else l.keys.delete(midi)
      }, Math.min(durationS, LIGHT_CAP_S) * 1000)
      l.timers.add(id)
    },
    [onHoldKey],
  )

  const onBeat = useCallback(
    (beat: number, perBar: number, countingIn: boolean) => {
      if (countingIn || click) playClick(beat === 1)
      setCount(countingIn ? { beat, perBar } : null)
    },
    [click],
  )

  const player = useScorePlayer({
    abc: piece.abc,
    target: scoreBox,
    narrow,
    tempoPct,
    hands,
    countIn,
    onNoteOn,
    onBeat,
    onFinish: release,
  })

  // Wrap the transport so the sound is unlocked from the click, and lights clear on pause/stop.
  const wrapped = {
    ...player,
    play: () => {
      unlockAudio()
      player.play()
    },
    pause: () => {
      player.pause()
      release()
    },
    stop: () => {
      player.stop()
      release()
    },
    seekToBar: (n: number) => {
      release()
      player.seekToBar(n)
    },
  }

  const range = rangeFor(player.midis.length ? player.midis : [60])

  return (
    <main className="curriculum game pieces">
      <h6 className="kicker">
        <a href={piecesHref}>Pieces</a> · {piece.title}
      </h6>
      <div className="piece-head">
        <div>
          <h1>{piece.title}</h1>
          {piece.credit && <p className="curriculum-lede">{piece.credit}</p>}
        </div>
        {piece.source === 'mine' && (
          <a className="btn btn-secondary" href={`${pieceHref('add')}?edit=${piece.id}`}>
            Edit
          </a>
        )}
      </div>

      <div className="game-board score-board">
        <Transport
          player={wrapped}
          tempoPct={tempoPct}
          onTempo={setTempoPct}
          hands={hands}
          onHands={setHands}
          countIn={countIn}
          onCountIn={setCountIn}
          click={click}
          onClick={setClick}
        />

        {player.status === 'error' && <p className="game-message is-wrong">{player.error}</p>}
        {player.status === 'loading' && <p className="game-message">Loading the score…</p>}

        {count && (
          <p className="game-message game-countin" aria-live="assertive">
            {Array.from({ length: count.perBar }, (_, i) => (
              <span key={i} className={i + 1 === count.beat ? 'is-now' : undefined}>
                {i + 1}
              </span>
            ))}
          </p>
        )}

        <div className={`score hands-${hands}`}>
          <div className="score-paper" ref={scoreBox} />
        </div>
      </div>

      <Piano range={range} focus={player.midis} pressed={pressed} onPress={onPressKey} label="Keyboard" />
      <MidiControl />
    </main>
  )
}
