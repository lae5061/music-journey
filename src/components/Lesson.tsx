import {
  getLesson,
  getUnit,
  lessonKey,
  lessonLabel,
  lessonNumber,
  nextLesson,
  UNITS,
  unitNumber,
  type LessonRef,
} from '../data/course'
import type { Phrase } from '../lib/music'
import { useMediaQuery, WIDE } from '../lib/useMediaQuery'
import { CompletedCheck } from './CompletedCheck'
import { StepView } from './StepView'

interface LessonProps {
  at: LessonRef
  stepIndex: number
  completed: ReadonlySet<string>
  pressed: ReadonlySet<number>
  lastPlayed: string
  playing: boolean
  onPressKey: (midi: number) => void
  onPlay: (phrase: Phrase, label?: string) => void
  onStop: () => void
  onOpenLesson: (ref: LessonRef) => void
  onPrevStep: () => void
  onNextStep: () => void
  onQuizPassed: () => void
}

export function Lesson({
  at,
  stepIndex,
  completed,
  pressed,
  lastPlayed,
  playing,
  onPressKey,
  onPlay,
  onStop,
  onOpenLesson,
  onPrevStep,
  onNextStep,
  onQuizPassed,
}: LessonProps) {
  const unit = getUnit(at)
  const lesson = getLesson(at)
  const step = lesson.steps[stepIndex]
  const wide = useMediaQuery(WIDE)

  const isLastStep = stepIndex === lesson.steps.length - 1
  const following = nextLesson(at)
  const percent = Math.round(((stepIndex + 1) / lesson.steps.length) * 100)

  const nextLabel = !isLastStep
    ? 'Next step'
    : !following
      ? 'Finish the course'
      : following.unit !== at.unit
        ? 'Next unit'
        : 'Next lesson'

  const sidebar = (
    <>
      <select
        className="unit-switch"
        value={at.unit}
        onChange={(e) => onOpenLesson({ unit: Number(e.target.value), lesson: 0 })}
        aria-label="Choose a unit"
      >
        {UNITS.map((u, i) => (
          <option key={u.title} value={i}>
            Unit {unitNumber(i)} — {u.title}
          </option>
        ))}
      </select>
      <div className="lesson-nav-list">
        {unit.lessons.map((l, i) => {
          const ref = { unit: at.unit, lesson: i }
          return (
            <a
              key={l.title}
              className={`lesson-nav-item${i === at.lesson ? ' is-current' : ''}`}
              href="#"
              aria-current={i === at.lesson ? 'true' : undefined}
              onClick={(e) => {
                e.preventDefault()
                onOpenLesson(ref)
              }}
            >
              <span>{lessonNumber(i)}</span>
              <span>{l.title}</span>
              <CompletedCheck done={completed.has(lessonKey(ref))} />
            </a>
          )
        })}
      </div>
    </>
  )

  return (
    <main className="lesson">
      {wide ? (
        <aside className="lesson-nav">
          <h6 className="kicker">Unit {unitNumber(at.unit)}</h6>
          {sidebar}
        </aside>
      ) : (
        <details className="lesson-nav lesson-nav--collapsed">
          <summary>
            Unit {unitNumber(at.unit)} · {unit.title} — lesson {lessonNumber(at.lesson)} of{' '}
            {unit.lessons.length}
          </summary>
          {sidebar}
        </details>
      )}

      <section className="lesson-body">
        <div>
          <h6 className="kicker">
            Lesson {lessonLabel(at)} · Step {stepIndex + 1} of {lesson.steps.length}
          </h6>
          <h1 className="lesson-title">{lesson.title}</h1>
        </div>

        <div className="progress">
          <div
            className="progress-track"
            role="progressbar"
            aria-label="Lesson progress"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            {lesson.steps.map((s, i) => (
              <div key={s.title} className={`progress-seg${i <= stepIndex ? ' is-filled' : ''}`} />
            ))}
          </div>
          <span className="progress-label">{percent}% complete</span>
        </div>

        <StepView
          step={step}
          pressed={pressed}
          lastPlayed={lastPlayed}
          playing={playing}
          onPressKey={onPressKey}
          onPlay={onPlay}
          onStop={onStop}
          onQuizPassed={onQuizPassed}
        />

        <div className="step-nav">
          <button className="btn btn-secondary" onClick={onPrevStep} disabled={stepIndex === 0}>
            Previous
          </button>
          <button className="btn btn-primary" onClick={onNextStep}>
            {nextLabel}
          </button>
        </div>
      </section>
    </main>
  )
}
