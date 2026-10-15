import { useEffect, useState, type RefObject } from 'react'

/**
 * The element's current content width, tracked as it changes. Components that have to
 * decide *what* to draw — not just how to stretch it — need the real number.
 */
export function useElementWidth(ref: RefObject<HTMLElement | null>): number {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Measure once up front; ResizeObserver only fires on change in some browsers.
    setWidth(el.clientWidth)

    if (typeof ResizeObserver === 'undefined') {
      const onResize = () => setWidth(el.clientWidth)
      window.addEventListener('resize', onResize)
      return () => window.removeEventListener('resize', onResize)
    }

    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])

  return width
}
