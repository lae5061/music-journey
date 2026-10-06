import { useMemo } from 'react'
import type { Step } from '../data/types'
import { rangeFor } from '../lib/keyboard'
import { phraseNotes, type Phrase } from '../lib/music'
import { ChordChart } from './ChordChart'
import { Diagram } from './Diagram'
import { Piano } from './Piano'
import { Quiz } from './Quiz'
import { Staff } from './notation/Staff'

interface StepViewProps {
  step: Step
  pressed: ReadonlySet<number>
  lastPlayed: string
  playing: boolean
  onPressKey: (midi: number) => void
  onPlay: (phrase: Phrase, label?: string) => void
  onStop: () => void
  onQuizPassed: () => void
}

/**
 * One step of a lesson: whatever combination of diagram, notation, chart, keyboard,
 * copy and exercise the step declares. The keyboard sizes itself to the notes in play.
 */
export function StepView({
  step,
  pressed,
  lastPlayed,
  playing,
  onPressKey,
  onPlay,
  onStop,
  onQuizPassed,
}: StepViewProps) {
  const highlight = useMemo(() => new Set(step.highlight ?? []), [step])

  // Everything the step touches, so the board is framed around it rather than around
  // an arbitrary default range.
  const inPlay = useMemo(() => {
    const notes = new Set<number>(step.highlight ?? [])
    for (const phrase of [step.phrase, step.alt?.phrase]) {
      if (phrase) phraseNotes(phrase).forEach((n) => notes.add(n))
    }
    step.alt?.highlight?.forEach((n) => notes.add(n))
    if (step.keyLabels) Object.keys(step.keyLabels).forEach((n) => notes.add(Number(n)))
    return [...notes]
  }, [step])

  const range = useMemo(() => rangeFor(inPlay), [inPlay])

  return (
    <>
      {step.diagram && (
        <div className="step-media">
          <Diagram kind={step.diagram} onPlay={onPressKey} />
        </div>
      )}

      {step.staff && (
        <div className="step-media">
          <Staff spec={step.staff} />
        </div>
      )}

      {step.chart && (
        <div className="step-media">
          <ChordChart chart={step.chart} />
        </div>
      )}

      {!step.noKeyboard && (
        <div className="lesson-keyboard">
          <div className="line-between">
            <span className="keyboard-hint">{step.hint}</span>
            <span className="text-muted now-playing" role="status">
              {lastPlayed}
            </span>
          </div>
          <Piano
            range={range}
            focus={inPlay}
            highlight={highlight}
            labels={step.keyLabels}
            pressed={pressed}
            onPress={onPressKey}
            label="Playable keyboard"
          />
        </div>
      )}

      <div className="step-grid">
        <div className="step-main">
          <h3>{step.title}</h3>
          <p className="step-text">{step.text}</p>
          <div className="step-actions">
            {step.phrase && (
              <button
                className="btn btn-primary"
                onClick={() => onPlay(step.phrase!, undefined)}
              >
                {step.playLabel ?? 'Play example'}
              </button>
            )}
            {step.alt && (
              <button className="btn btn-secondary" onClick={() => onPlay(step.alt!.phrase)}>
                {step.alt.label}
              </button>
            )}
            {playing && (
              <button className="btn btn-ghost" onClick={onStop}>
                Stop
              </button>
            )}
          </div>
        </div>
        <div className="definition">
          <h6 className="kicker">Definition</h6>
          <p>{step.definition}</p>
        </div>
      </div>

      {step.quiz && <Quiz spec={step.quiz} onPlay={onPlay} onPassed={onQuizPassed} />}
    </>
  )
}
