import type { Abcjs } from '../abc'
import { parseAbc } from './parse'
import { serialize } from './serialize'
import type { Score } from './model'

/** DEV only: a handle on the editor from the browser console, for checks by script. */
export function installDevCheck(get: { state: () => unknown; text: () => string; tune: () => unknown; lib: () => Abcjs | null }) {
  if (!import.meta.env.DEV) return
  const roundTrip = (abc: string) => {
    const lib = get.lib()
    if (!lib) return { ok: false, reason: 'abcjs not loaded yet' }
    const first = parseAbc(lib, abc)
    if (!first.ok) return first
    const out = serialize(first.score, { titles: true }).text
    const second = parseAbc(lib, out)
    if (!second.ok) return { ok: false, reason: `re-parse failed: ${second.reason}`, out }
    const equal = JSON.stringify(first.score) === JSON.stringify(second.score)
    return { ok: true, equal, out, first: first.score, second: second.score }
  }
  ;(window as unknown as { tonicScore: unknown }).tonicScore = {
    ...get,
    serialize: (score: Score, titles = true) => serialize(score, { titles }),
    parse: (abc: string) => {
      const lib = get.lib()
      return lib ? parseAbc(lib, abc) : { ok: false, reason: 'abcjs not loaded yet' }
    },
    roundTrip,
  }
}
