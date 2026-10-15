import { useCallback, useRef, useState } from 'react'
import type { Piece } from '../../data/pieces'
import type { Hands } from '../../lib/abc'
import { playClick, unlockAudio } from '../../lib/audio'
import { rangeFor } from '../../lib/keyboard'
import { pieceHref, piecesHref } from '../../lib/route'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { useScorePlayer } from '../../lib/useScorePlayer'
import { useScoreSound } from '../../lib/useScoreSound'
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

/** The score, its transport, and the keyboard lighting under it. */
export function PiecePlayer({ piece, pressed, onPressKey, onHoldKey }: PiecePlayerProps) {
  const narrow = useMediaQuery(NARROW)
  // Null until the score says what it is written at.
  const [bpm, setBpm] = useState<number | null>(null)
  const [hands, setHands] = useState<Hands>('both')
  const [countIn, setCountIn] = useState(true)
  const [click, setClick] = useState(false)
  const [count, setCount] = useState<{ beat: number; perBar: number } | null>(null)
  const scoreBox = useRef<HTMLDivElement>(null)

  const sound = useScoreSound(onHoldKey)
  const release = useCallback(() => {
    sound.release()
    setCount(null)
  }, [sound])

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
    bpm: bpm ?? undefined,
    hands,
    countIn,
    onNoteOn: sound.onNoteOn,
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
          onTempo={setBpm}
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
