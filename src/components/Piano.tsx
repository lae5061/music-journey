import { useMemo, useRef } from 'react'
import { KEY_LABELS } from '../config'
import {
  buildKeyboard,
  fitRange,
  TWO_OCTAVES_FROM_MIDDLE_C,
  type KeyGeometry,
  type Range,
} from '../lib/keyboard'
import { noteName, octaveOf, pitchClass } from '../lib/notes'
import { useElementWidth } from '../lib/useElementWidth'

/** Below this the printed note name no longer fits on a key. */
const LABEL_MIN_KEY_PX = 17

interface PianoProps {
  /** The range to show if there is room for it. */
  range?: Range
  /** Notes that must stay visible when the board has to narrow. */
  focus?: number[]
  /** Notes the current step is about. */
  highlight?: ReadonlySet<number>
  /** Words drawn on keys instead of note names — fingering, degrees, chord tones. */
  labels?: Record<number, string>
  /** Notes sounding right now. */
  pressed: ReadonlySet<number>
  onPress: (midi: number) => void
  /** Taller keys, for the landing page's try-it board. */
  tall?: boolean
  label: string
}

/**
 * The playable keyboard. It always fits its container — there is no sideways
 * scrolling to hunt through — narrowing its range on small screens rather than
 * shrinking the keys past the point of being tappable.
 */
export function Piano({
  range = TWO_OCTAVES_FROM_MIDDLE_C,
  focus,
  highlight,
  labels,
  pressed,
  onPress,
  tall = false,
  label,
}: PianoProps) {
  const box = useRef<HTMLDivElement>(null)
  const width = useElementWidth(box)

  const anchors = useMemo(
    () => focus ?? (highlight ? [...highlight] : []),
    [focus, highlight],
  )
  const shown = useMemo(() => fitRange(range, anchors, width), [range, anchors, width])
  const { whites, blacks, whiteWidth } = useMemo(() => buildKeyboard(shown), [shown])

  const keyPx = (width * whiteWidth) / 100
  const showLabels = keyPx >= LABEL_MIN_KEY_PX

  const renderKey = (key: KeyGeometry) => {
    const isHighlighted = highlight?.has(key.midi) ?? false
    const isPressed = pressed.has(key.midi)
    const override = labels?.[key.midi]
    const text = override ?? (showLabels ? keyLabel(key.midi, isHighlighted || isPressed) : '')

    return (
      <button
        key={key.midi}
        type="button"
        className={[
          'key',
          key.black ? 'key-black' : 'key-white',
          isHighlighted ? 'is-highlighted' : '',
          isPressed ? 'is-pressed' : '',
          override ? 'has-label' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{ left: `${key.left.toFixed(3)}%`, width: `${key.width.toFixed(3)}%` }}
        aria-label={noteName(key.midi)}
        aria-pressed={isPressed}
        onPointerDown={(e) => {
          e.preventDefault()
          onPress(key.midi)
        }}
        onKeyDown={(e) => {
          if (e.key !== 'Enter' && e.key !== ' ') return
          // Swallow the synthetic click a button would otherwise fire on release.
          e.preventDefault()
          onPress(key.midi)
        }}
      >
        {text}
      </button>
    )
  }

  return (
    <div className="piano" ref={box} role="group" aria-label={label}>
      <div className={`piano-keys${tall ? ' piano-keys--tall' : ''}`}>
        {width > 0 && (
          <>
            {whites.map(renderKey)}
            {blacks.map(renderKey)}
          </>
        )}
      </div>
    </div>
  )
}

/** Keys in play always show their name; the rest follow the configured mode. */
function keyLabel(midi: number, inPlay: boolean): string {
  const show = inPlay || KEY_LABELS === 'all' || (KEY_LABELS === 'c-only' && midi % 12 === 0)
  if (!show) return ''
  // Only C carries its octave number, as the anchor you count from.
  return midi % 12 === 0 ? `${pitchClass(midi)}${octaveOf(midi)}` : pitchClass(midi)
}
