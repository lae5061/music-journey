import { useEffect, useState } from 'react'

/** Track a media query, so layout decisions React has to make match the ones CSS makes. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  )

  useEffect(() => {
    const list = window.matchMedia(query)
    const onChange = () => setMatches(list.matches)
    onChange()
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/** Below this the lesson sidebar collapses and the layout goes to one column. */
export const WIDE = '(min-width: 860px)'
