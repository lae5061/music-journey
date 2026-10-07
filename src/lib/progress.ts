import { useEffect, useState } from 'react'
import {
  FIRST_LESSON,
  isValidRef,
  lessonKey,
  parseLessonKey,
  getLesson,
  type LessonRef,
} from '../data/course'

/**
 * Where the learner got to, kept in localStorage so a reload doesn't lose it.
 * There are no accounts, so this is per-browser.
 */
export interface Progress {
  /** Keys ("2.03") of lessons whose last step has been reached. */
  completed: string[]
  /** Where "Lesson" in the nav picks up. */
  at: LessonRef
  step: number
}

const STORAGE_KEY = 'tonic.progress.v2'

export const EMPTY_PROGRESS: Progress = { completed: [], at: FIRST_LESSON, step: 0 }

/** Anything stored under our key is untrusted — it may predate a change to the course. */
function reconcile(stored: unknown): Progress {
  if (typeof stored !== 'object' || stored === null) return EMPTY_PROGRESS
  const { completed, at, step } = stored as Partial<Progress>

  const valid = Array.isArray(completed)
    ? completed.filter((key) => typeof key === 'string' && isValidRef(parseLessonKey(key)))
    : []

  const ref = at && isValidRef(at) ? at : FIRST_LESSON
  const steps = getLesson(ref).steps.length
  const atStep = Number.isInteger(step) ? Math.min(Math.max(step as number, 0), steps - 1) : 0

  return { completed: [...new Set(valid)], at: ref, step: atStep }
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? reconcile(JSON.parse(raw)) : EMPTY_PROGRESS
  } catch {
    // Private mode, blocked storage, or corrupt JSON — start fresh rather than fail.
    return EMPTY_PROGRESS
  }
}

export function saveProgress(progress: Progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // Not being able to remember progress shouldn't break the lesson.
  }
}

export const isComplete = (completed: ReadonlySet<string>, ref: LessonRef) =>
  completed.has(lessonKey(ref))

/** What the app holds in memory: the stored shape, with completed lessons as a Set. */
export interface Place {
  completed: Set<string>
  at: LessonRef
  step: number
}

/** Progress as React state, seeded from storage and written back on every change. */
export function useProgress() {
  const [place, setPlace] = useState<Place>(() => {
    const saved = loadProgress()
    return { completed: new Set(saved.completed), at: saved.at, step: saved.step }
  })

  useEffect(() => {
    saveProgress({ completed: [...place.completed], at: place.at, step: place.step })
  }, [place])

  return { place, setPlace }
}
