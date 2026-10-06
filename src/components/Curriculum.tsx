import {
  lessonKey,
  lessonNumber,
  TOTAL_LESSONS,
  UNITS,
  unitNumber,
  type LessonRef,
} from '../data/course'
import { lessonStatus } from '../lib/lessonStatus'
import { CompletedCheck } from './CompletedCheck'

interface CurriculumProps {
  current: LessonRef
  completed: ReadonlySet<string>
  onOpenLesson: (ref: LessonRef) => void
}

export function Curriculum({ current, completed, onOpenLesson }: CurriculumProps) {
  const done = completed.size

  return (
    <main className="curriculum">
      <h6 className="kicker">The whole course</h6>
      <h1>Curriculum</h1>
      <p className="curriculum-lede">
        Seven units, {TOTAL_LESSONS} lessons, from sitting down at the keyboard to rootless
        voicings. They are ordered the way most players meet them, but nothing stops you
        starting in the middle — each lesson says what it assumes.
      </p>
      <div className="curriculum-total">
        <div className="progress-track" aria-hidden="true">
          {UNITS.map((unit, u) => {
            const unitDone = unit.lessons.filter((_, l) =>
              completed.has(lessonKey({ unit: u, lesson: l })),
            ).length
            return (
              <div
                key={unit.title}
                className="progress-seg"
                style={{
                  flex: unit.lessons.length,
                  background:
                    unitDone === unit.lessons.length
                      ? 'var(--color-accent)'
                      : unitDone > 0
                        ? 'var(--color-accent-300)'
                        : 'var(--color-neutral-300)',
                }}
              />
            )
          })}
        </div>
        <span className="progress-label">
          {done} of {TOTAL_LESSONS} lessons complete
        </span>
      </div>

      {UNITS.map((unit, u) => (
        <section className="unit" key={unit.title}>
          <div className="unit-head">
            <div>
              <h6 className="kicker">
                Unit {unitNumber(u)} · {unit.lessons.length} lessons
              </h6>
              <h2>{unit.title}</h2>
              <p className="unit-summary">{unit.summary}</p>
            </div>
            <p className="unit-outcome">{unit.outcome}</p>
          </div>

          <div className="curriculum-grid">
            {unit.lessons.map((lesson, l) => {
              const ref = { unit: u, lesson: l }
              const status = lessonStatus(ref, current, false, completed)
              return (
                <a
                  key={lesson.title}
                  className="card lesson-card"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    onOpenLesson(ref)
                  }}
                >
                  <div className="lesson-card-head">
                    <span className="lesson-card-num">{lessonNumber(l)}</span>
                    <span className="lesson-card-status">
                      <CompletedCheck done={completed.has(lessonKey(ref))} />
                      <span className={status.tagClass}>{status.label}</span>
                    </span>
                  </div>
                  <h3>{lesson.title}</h3>
                  <p className="card-body">{lesson.summary}</p>
                  <div className="lesson-card-foot">
                    <span className="card-meta">
                      {lesson.duration} · {lesson.steps.length} steps
                    </span>
                    <span className="lesson-card-open">Open →</span>
                  </div>
                </a>
              )
            })}
          </div>
        </section>
      ))}
    </main>
  )
}
