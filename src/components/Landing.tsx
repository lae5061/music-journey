import { TOTAL_LESSONS, TOTAL_STEPS, UNITS, unitNumber, type LessonRef } from '../data/course'
import { TWO_OCTAVES_FROM_MIDDLE_C } from '../lib/keyboard'
import { lessonKey } from '../data/course'
import { CompletedCheck } from './CompletedCheck'
import { Piano } from './Piano'

interface LandingProps {
  completed: ReadonlySet<string>
  pressed: ReadonlySet<number>
  lastPlayed: string
  onPressKey: (midi: number) => void
  onStart: () => void
  onResume: () => void
  hasProgress: boolean
  onCurriculum: () => void
  onOpenUnit: (ref: LessonRef) => void
}

export function Landing({
  completed,
  pressed,
  lastPlayed,
  onPressKey,
  onStart,
  onResume,
  hasProgress,
  onCurriculum,
  onOpenUnit,
}: LandingProps) {
  return (
    <main className="grow">
      <section className="hero">
        <div className="hero-grid">
          <h1 className="hero-title">Music theory, one key at a time.</h1>
          <div className="hero-side">
            <p className="hero-lede">
              A structured course for adult beginners. Every concept is introduced on the piano
              keyboard first — you play it, then you name it.
            </p>
            <div className="btn-row">
              <button className="btn btn-primary" onClick={onStart}>
                Begin the course
              </button>
              {hasProgress && (
                <button className="btn btn-secondary" onClick={onResume}>
                  Resume where you left off
                </button>
              )}
              <button className="btn btn-secondary" onClick={onCurriculum}>
                See the curriculum
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="try">
        <div className="try-inner">
          <div className="line-between">
            <h6 className="kicker">Try it — click or tap any key</h6>
            <span className="text-muted now-playing" role="status">
              {lastPlayed}
            </span>
          </div>
          <Piano
            range={TWO_OCTAVES_FROM_MIDDLE_C}
            tall
            pressed={pressed}
            onPress={onPressKey}
            label="Try the keyboard"
          />
        </div>
      </section>

      <section className="method">
        <div className="method-grid">
          <div className="method-cell">
            <h6 className="kicker">01 — Why the piano</h6>
            <h3>Theory made visible</h3>
            <p>
              The keyboard lays every pitch in a straight line. Half steps, scales and chords become
              shapes you can see and press, not abstractions to memorise.
            </p>
          </div>
          <div className="method-cell">
            <h6 className="kicker">02 — How a lesson works</h6>
            <h3>Play, then name</h3>
            <p>
              Each lesson is a sequence of short steps. The keyboard highlights the notes in
              question, the notation shows how they are written, and you hear the result before you
              read the definition.
            </p>
          </div>
          <div className="method-cell">
            <h6 className="kicker">03 — How far it goes</h6>
            <h3>
              {TOTAL_LESSONS} lessons, {TOTAL_STEPS} steps
            </h3>
            <p>
              From posture and finger numbers to rootless voicings and reharmonisation. No
              instrument and no reading of notation is assumed at the start.
            </p>
          </div>
        </div>
      </section>

      <section className="landing-curriculum">
        <div className="section-head">
          <h2>The seven units</h2>
          <a
            href="#"
            className="section-head-link"
            onClick={(e) => {
              e.preventDefault()
              onCurriculum()
            }}
          >
            All lessons
          </a>
        </div>
        <div className="lesson-list">
          {UNITS.map((unit, u) => {
            const done = unit.lessons.filter((_, l) =>
              completed.has(lessonKey({ unit: u, lesson: l })),
            ).length
            return (
              <a
                key={unit.title}
                className="lesson-row"
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  onOpenUnit({ unit: u, lesson: 0 })
                }}
              >
                <span className="lesson-row-num">{unitNumber(u)}</span>
                <span className="lesson-row-body">
                  <span className="lesson-row-title">{unit.title}</span>
                  <span className="lesson-row-sub">{unit.summary}</span>
                </span>
                <span className="text-muted lesson-row-duration">
                  {done > 0 ? `${done}/${unit.lessons.length}` : `${unit.lessons.length} lessons`}
                </span>
                <CompletedCheck done={done === unit.lessons.length} />
              </a>
            )
          })}
        </div>
      </section>

      <section className="banner">
        <div className="banner-inner">
          <h2>Fifteen minutes. One idea. Every day.</h2>
          <button className="btn btn-ink" onClick={hasProgress ? onResume : onStart}>
            {hasProgress ? 'Carry on' : 'Begin the course'}
          </button>
        </div>
      </section>
    </main>
  )
}
