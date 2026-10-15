import { lessonKey, type LessonRef } from '../data/course'

/** The word on a curriculum card, and how strongly it is tinted. */
export interface LessonStatus {
  label: string
  tagClass: string
}

/** Lessons sort by unit then position; there are never a hundred in one unit. */
const order = (ref: LessonRef) => ref.unit * 100 + ref.lesson

export function lessonStatus(
  ref: LessonRef,
  current: LessonRef,
  inLesson: boolean,
  completed: ReadonlySet<string>,
): LessonStatus {
  const done = completed.has(lessonKey(ref))
  const here = order(ref) === order(current)
  const behind = order(ref) < order(current)

  const label = done
    ? 'Complete'
    : here
      ? inLesson
        ? 'In progress'
        : 'Up next'
      : behind
        ? 'Started'
        : 'Not started'

  return { label, tagClass: done || here || behind ? 'tag tag-accent' : 'tag tag-neutral' }
}
