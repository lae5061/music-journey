import { useCallback, useEffect, useState } from 'react'
import { getLesson, isValidRef, lessonLabel, type LessonRef } from '../data/course'
import { isGameId, type GameId } from '../data/games'

/**
 * Screens are addressed by the URL hash, so a lesson can be bookmarked and the back
 * button steps back through the course:
 *
 *   #/                    the landing page
 *   #/curriculum          every unit and lesson
 *   #/lesson              wherever the learner got to (resolved against saved progress)
 *   #/lesson/2.03         lesson 2.03 from its first step
 *   #/lesson/2.03/4       lesson 2.03, step 4
 *   #/games               the practice games
 *   #/games/sight-reading one game, and #/games/sight-reading/stream one part of it
 *
 * Hash routes rather than paths because the app is static files with no server to
 * rewrite /lesson/2.03 back to index.html.
 */
export type Route =
  | { screen: 'landing' }
  | { screen: 'curriculum' }
  | { screen: 'lesson'; at: LessonRef; step: number }
  | { screen: 'games'; game: GameId | null; part: string | null }

export type Screen = Route['screen']

/** Where "#/lesson" with no address should land: the learner's saved place. */
export interface Position {
  at: LessonRef
  step: number
}

export const landingHref = '#/'
export const curriculumHref = '#/curriculum'
/** "#/lesson" — the lesson in progress, whatever it is. */
export const resumeHref = '#/lesson'
export const gamesHref = '#/games'
export const gameHref = (game: GameId, part?: string) => (part ? `#/games/${game}/${part}` : `#/games/${game}`)

export const lessonHref = (ref: LessonRef, step = 0) =>
  step > 0 ? `#/lesson/${lessonLabel(ref)}/${step + 1}` : `#/lesson/${lessonLabel(ref)}`

export function formatRoute(route: Route): string {
  switch (route.screen) {
    case 'landing':
      return landingHref
    case 'curriculum':
      return curriculumHref
    case 'lesson':
      return lessonHref(route.at, route.step)
    case 'games':
      return route.game ? gameHref(route.game, route.part ?? undefined) : gamesHref
  }
}

/** "2.03" → { unit: 1, lesson: 2 }; anything that is not two numbers is null. */
function parseLessonAddress(text: string): LessonRef | null {
  const match = /^(\d+)\.(\d+)$/.exec(text)
  if (!match) return null
  const ref = { unit: Number(match[1]) - 1, lesson: Number(match[2]) - 1 }
  return isValidRef(ref) ? ref : null
}

/**
 * Read a hash into a route. Unknown paths go to the landing page; a lesson that does
 * not exist goes to the curriculum, since that is where to find the one that does; a
 * step past the end of its lesson is clamped rather than refused.
 */
export function parseRoute(hash: string, saved: Position): Route {
  const path = hash.replace(/^#\/?/, '').replace(/\/+$/, '')
  if (path === '') return { screen: 'landing' }
  if (path === 'curriculum') return { screen: 'curriculum' }

  const [head, address, stepText, ...rest] = path.split('/')
  if (head === 'games' && rest.length === 0) {
    if (address === undefined || !isGameId(address)) return { screen: 'games', game: null, part: null }
    return { screen: 'games', game: address, part: stepText ?? null }
  }
  if (head !== 'lesson' || rest.length > 0) return { screen: 'landing' }
  if (address === undefined) return { screen: 'lesson', ...saved }

  const at = parseLessonAddress(address)
  if (!at) return { screen: 'curriculum' }

  const steps = getLesson(at).steps.length
  const step = stepText === undefined ? 0 : Number(stepText) - 1
  if (!Number.isInteger(step)) return { screen: 'lesson', at, step: 0 }
  return { screen: 'lesson', at, step: Math.min(Math.max(step, 0), steps - 1) }
}

const readHash = () => (typeof window === 'undefined' ? '' : window.location.hash)

/**
 * The current hash, kept in step with the address bar. `navigate` adds a history entry;
 * `replace` rewrites the current one, for tidying a hash into its canonical form.
 */
export function useHash() {
  const [hash, setHash] = useState(readHash)

  useEffect(() => {
    const onChange = () => setHash(readHash())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const navigate = useCallback((next: string) => {
    if (next === readHash()) return
    window.location.hash = next
  }, [])

  const replace = useCallback((next: string) => {
    if (next === readHash()) return
    window.history.replaceState(window.history.state, '', next)
    setHash(next)
  }, [])

  return { hash, navigate, replace }
}
