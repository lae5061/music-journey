import { useCallback, useEffect, useMemo } from 'react'
import { SiteFooter, SiteHeader } from './components/Chrome'
import { Curriculum } from './components/Curriculum'
import { Games } from './components/Games'
import { Landing } from './components/Landing'
import { Lesson } from './components/Lesson'
import {
  FIRST_LESSON,
  getLesson,
  lessonKey,
  lessonLabel,
  nextLesson,
  type LessonRef,
} from './data/course'
import { useProgress } from './lib/progress'
import { curriculumHref, formatRoute, lessonHref, parseRoute, resumeHref, useHash } from './lib/route'
import { usePiano } from './lib/usePiano'

export default function App() {
  const { place, setPlace } = useProgress()
  const { completed, at, step } = place
  const { hash, navigate, replace } = useHash()
  const { pressed, lastPlayed, playing, pressKey, play, stop } = usePiano()

  // The URL decides what is on screen; saved progress only fills in a bare "#/lesson".
  const route = useMemo(() => parseRoute(hash, { at, step }), [hash, at, step])
  const here = route.screen === 'lesson' ? route : null
  const hereKey = here ? lessonKey(here.at) : null

  // Tidy the hash into its canonical form ("#/lesson" → "#/lesson/2.03/4"), so that the
  // back button and a copied link both mean exactly what was on screen.
  useEffect(() => {
    const canonical = formatRoute(route)
    if (hash !== '' && hash !== '#' && hash !== canonical) replace(canonical)
  }, [hash, route, replace])

  // Being on a lesson is what moves the learner's saved place.
  useEffect(() => {
    if (!here) return
    setPlace((p) =>
      lessonKey(p.at) === lessonKey(here.at) && p.step === here.step
        ? p
        : { ...p, at: here.at, step: here.step },
    )
  }, [here, setPlace])

  // Leaving a screen or a lesson starts the next one from the top; stepping does not.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [route.screen, hereKey])

  // Nothing keeps sounding across a navigation, including one by the back button.
  useEffect(() => {
    stop()
  }, [hash, stop])

  useEffect(() => {
    document.title =
      route.screen === 'landing'
        ? 'Tonic — music theory from the keyboard'
        : route.screen === 'curriculum'
          ? 'Curriculum · Tonic'
          : route.screen === 'games'
            ? 'Games · Tonic'
            : `${lessonLabel(route.at)} ${getLesson(route.at).title} · Tonic`
  }, [route])

  const openLesson = useCallback((ref: LessonRef) => navigate(lessonHref(ref)), [navigate])

  const prevStep = useCallback(() => {
    if (here) navigate(lessonHref(here.at, Math.max(0, here.step - 1)))
  }, [here, navigate])

  /** Advance; finishing a lesson's last step marks it complete and moves on. */
  const nextStep = useCallback(() => {
    if (!here) return
    if (here.step < getLesson(here.at).steps.length - 1) {
      navigate(lessonHref(here.at, here.step + 1))
      return
    }
    // Reaching the last step is what counts as finishing a lesson.
    setPlace((p) => ({ ...p, completed: new Set(p.completed).add(lessonKey(here.at)) }))
    const following = nextLesson(here.at)
    navigate(following ? lessonHref(following) : curriculumHref)
  }, [here, navigate, setPlace])

  /** Passing an exercise counts as finishing the lesson it belongs to. */
  const quizPassed = useCallback(() => {
    setPlace((p) => {
      const key = lessonKey(p.at)
      if (p.completed.has(key)) return p
      return { ...p, completed: new Set(p.completed).add(key) }
    })
  }, [setPlace])

  return (
    <div className="app">
      <SiteHeader screen={route.screen} />

      {route.screen === 'landing' && (
        <Landing
          completed={completed}
          pressed={pressed}
          lastPlayed={lastPlayed}
          onPressKey={pressKey}
          onStart={() => openLesson(FIRST_LESSON)}
          onResume={() => navigate(resumeHref)}
          hasProgress={completed.size > 0 || at.unit > 0 || at.lesson > 0 || step > 0}
          onCurriculum={() => navigate(curriculumHref)}
        />
      )}

      {route.screen === 'curriculum' && <Curriculum current={at} completed={completed} />}

      {route.screen === 'games' && (
        <Games game={route.game} part={route.part} pressed={pressed} onPressKey={pressKey} />
      )}

      {here && (
        <Lesson
          at={here.at}
          stepIndex={here.step}
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
