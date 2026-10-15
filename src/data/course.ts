import type { Lesson, Step, Unit } from './types'
import { depths } from './units/depths'
import { fundamentals } from './units/fundamentals'
import { musicianship } from './units/musicianship'
import { practical } from './units/practical'
import { rhythm } from './units/rhythm'
import { technique } from './units/technique'
import { theory } from './units/theory'

/** The whole course, in the order it is meant to be taken. */
export const UNITS: Unit[] = [
  fundamentals,
  technique,
  theory,
  rhythm,
  practical,
  musicianship,
  depths,
]

/** Where a lesson lives. Progress and navigation both address lessons this way. */
export interface LessonRef {
  unit: number
  lesson: number
}

export const lessonKey = (ref: LessonRef) => `${ref.unit}.${ref.lesson}`

export const parseLessonKey = (key: string): LessonRef => {
  const [unit, lesson] = key.split('.').map(Number)
  return { unit, lesson }
}

export const getUnit = (ref: LessonRef): Unit => UNITS[ref.unit]
export const getLesson = (ref: LessonRef): Lesson => UNITS[ref.unit].lessons[ref.lesson]
export const getStep = (ref: LessonRef, step: number): Step => getLesson(ref).steps[step]

/** "1" … "7" for units; "01" … "09" for lessons within one. */
export const unitNumber = (unit: number) => String(unit + 1)
export const lessonNumber = (lesson: number) => String(lesson + 1).padStart(2, '0')
/** "2.03" — how a lesson is labelled anywhere both numbers are wanted. */
export const lessonLabel = (ref: LessonRef) => `${unitNumber(ref.unit)}.${lessonNumber(ref.lesson)}`

export const ALL_LESSONS: LessonRef[] = UNITS.flatMap((unit, u) =>
  unit.lessons.map((_, l) => ({ unit: u, lesson: l })),
)

export const TOTAL_LESSONS = ALL_LESSONS.length
export const TOTAL_STEPS = UNITS.reduce(
  (sum, unit) => sum + unit.lessons.reduce((n, lesson) => n + lesson.steps.length, 0),
  0,
)

/** The lesson after this one, running on into the next unit. */
export function nextLesson(ref: LessonRef): LessonRef | null {
  if (ref.lesson + 1 < UNITS[ref.unit].lessons.length) {
    return { unit: ref.unit, lesson: ref.lesson + 1 }
  }
  if (ref.unit + 1 < UNITS.length) return { unit: ref.unit + 1, lesson: 0 }
  return null
}

export function isValidRef(ref: LessonRef): boolean {
  return (
    Number.isInteger(ref.unit) &&
    Number.isInteger(ref.lesson) &&
    ref.unit >= 0 &&
    ref.unit < UNITS.length &&
    ref.lesson >= 0 &&
    ref.lesson < UNITS[ref.unit].lessons.length
  )
}

export const FIRST_LESSON: LessonRef = { unit: 0, lesson: 0 }

export type { Lesson, Step, Unit } from './types'
