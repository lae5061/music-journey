import { useCallback, useEffect, useState } from 'react'
import { SiteFooter, SiteHeader } from './components/Chrome'
import { Curriculum } from './components/Curriculum'
import { Landing } from './components/Landing'
import { Lesson } from './components/Lesson'
import {
  FIRST_LESSON,
  getLesson,
  lessonKey,
  nextLesson,
  type LessonRef,
} from './data/course'
import { loadProgress, saveProgress } from './lib/progress'
import { usePiano } from './lib/usePiano'

export type Screen = 'landing' | 'curriculum' | 'lesson'

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing')
  // Seeded from localStorage so a reload picks up where the learner left off.
  const [place, setPlace] = useState(() => {
    const saved = loadProgress()
    return { completed: new Set(saved.completed), at: saved.at, step: saved.step }
  })
  const { completed, at, step } = place
  const { pressed, lastPlayed, playing, pressKey, play, stop } = usePiano()

  useEffect(() => {
    saveProgress({ completed: [...completed], at, step })
  }, [completed, at, step])

  const go = useCallback(
    (next: Screen) => {
      stop()
      setScreen(next)
      window.scrollTo(0, 0)
    },
    [stop],
  )

  const openLesson = useCallback(
    (ref: LessonRef) => {
      setPlace((p) => ({ ...p, at: ref, step: 0 }))
      go('lesson')
    },
    [go],
  )

  const prevStep = useCallback(() => {
    stop()
    setPlace((p) => ({ ...p, step: Math.max(0, p.step - 1) }))
  }, [stop])

  /** Advance; finishing a lesson's last step marks it complete and moves on. */
  const nextStep = useCallback(() => {
    stop()
    if (step < getLesson(at).steps.length - 1) {
      setPlace((p) => ({ ...p, step: p.step + 1 }))
      return
    }
    // Reaching the last step is what counts as finishing a lesson.
    const done = new Set(completed).add(lessonKey(at))
    const following = nextLesson(at)
    if (following) {
      setPlace({ completed: done, at: following, step: 0 })
      go('lesson')
    } else {
      setPlace((p) => ({ ...p, completed: done }))
      go('curriculum')
    }
  }, [completed, at, step, go, stop])

  /** Passing an exercise counts as finishing the lesson it belongs to. */
  const quizPassed = useCallback(() => {
    setPlace((p) => {
      const key = lessonKey(p.at)
      if (p.completed.has(key)) return p
      return { ...p, completed: new Set(p.completed).add(key) }
    })
  }, [])

  return (
    <div className="app">
      <SiteHeader screen={screen} onNavigate={go} />

      {screen === 'landing' && (
        <Landing
          completed={completed}
          pressed={pressed}
          lastPlayed={lastPlayed}
          onPressKey={pressKey}
          onStart={() => openLesson(FIRST_LESSON)}
          onResume={() => go('lesson')}
          hasProgress={completed.size > 0 || at.unit > 0 || at.lesson > 0 || step > 0}
          onCurriculum={() => go('curriculum')}
          onOpenUnit={openLesson}
        />
      )}

      {screen === 'curriculum' && (
        <Curriculum current={at} completed={completed} onOpenLesson={openLesson} />
      )}

      {screen === 'lesson' && (
        <Lesson
          at={at}
          stepIndex={step}
          completed={completed}
          pressed={pressed}
          lastPlayed={lastPlayed}
          playing={playing}
          onPressKey={pressKey}
          onPlay={play}
          onStop={stop}
          onOpenLesson={openLesson}
          onPrevStep={prevStep}
          onNextStep={nextStep}
          onQuizPassed={quizPassed}
        />
      )}

      <SiteFooter />
    </div>
  )
}
