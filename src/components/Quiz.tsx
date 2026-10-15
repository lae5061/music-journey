import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { QuizSpec } from '../data/types'
import type { Phrase } from '../lib/music'

/**
 * The exercise every lesson ends on. Questions are drawn in a shuffled order and the
 * step is only passed once enough have been answered correctly — so "complete" means
 * the learner did something, not that they clicked Next.
 */
export function Quiz({
  spec,
  onPlay,
  onPassed,
}: {
  spec: QuizSpec
  onPlay: (phrase: Phrase, label?: string) => void
  onPassed?: () => void
}) {
  const target = spec.target ?? Math.min(3, spec.questions.length)
  const order = useMemo(() => shuffle(spec.questions.map((_, i) => i)), [spec])

  const [asked, setAsked] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [chosen, setChosen] = useState<string | null>(null)
  const [heard, setHeard] = useState(false)

  // A different exercise means a fresh start.
  useEffect(() => {
    setAsked(0)
    setCorrect(0)
    setChosen(null)
    setHeard(false)
  }, [spec])

  const passed = correct >= target
  const question = spec.questions[order[asked % order.length]]

  const play = useRef(onPlay)
  play.current = onPlay

  const hear = useCallback(() => {
    if (!question.phrase) return
    setHeard(true)
    play.current(question.phrase, 'Listen…')
  }, [question])

  // Once the learner has asked for a question, play each following one on arrival —
  // but never the first, which would mean sound the moment the step opens.
  useEffect(() => {
    if (asked === 0 || !heard) return
    const phrase = spec.questions[order[asked % order.length]].phrase
    if (phrase) play.current(phrase, 'Listen…')
  }, [asked, heard, spec, order])

  const answer = (option: string) => {
    if (chosen) return
    setChosen(option)
    if (option === question.answer) {
      const next = correct + 1
      setCorrect(next)
      if (next >= target) onPassed?.()
    }
  }

  const next = () => {
    setChosen(null)
    setAsked((n) => n + 1)
  }

  return (
    <section className="quiz" aria-label="Exercise">
      <div className="quiz-head">
        <h6 className="kicker">Exercise</h6>
        <span className={`quiz-score${passed ? ' is-passed' : ''}`}>
          {passed ? 'Passed' : `${correct} of ${target}`}
        </span>
      </div>

      <p className="quiz-prompt">{spec.prompt}</p>
      {question.shown && <p className="quiz-shown">{question.shown}</p>}

      {question.phrase && (
        <button className="btn btn-primary quiz-replay" onClick={hear}>
          {heard ? (spec.replayLabel ?? 'Play it again') : 'Play the question'}
        </button>
      )}

      <div className="quiz-options">
        {spec.options.map((option) => {
          const isAnswer = option === question.answer
          const state = !chosen
            ? ''
            : option === chosen
              ? isAnswer
                ? ' is-right'
                : ' is-wrong'
              : isAnswer
                ? ' is-right'
                : ''
          return (
            <button
              key={option}
              className={`quiz-option${state}`}
              onClick={() => answer(option)}
              disabled={chosen !== null}
            >
              {option}
            </button>
          )
        })}
      </div>

      {chosen && (
        <div className="quiz-feedback">
          <span>
            {chosen === question.answer
              ? 'Correct.'
              : `Not quite — it was ${question.answer}.`}
          </span>
          <button className="btn btn-primary" onClick={next}>
            {passed ? 'Try another' : 'Next question'}
          </button>
        </div>
      )}
    </section>
  )
}

/** Fisher–Yates, so a repeated lesson doesn't ask the same question first every time. */
function shuffle<T>(items: T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
