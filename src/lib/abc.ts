import type { TuneObject } from 'abcjs'

/**
 * abcjs renders the score and keeps the clock; Tonic does the sound and the lights.
 * The library is 500 kB, so it is fetched the first time a score is opened, not with
 * the course.
 */
let loading: Promise<typeof import('abcjs')> | null = null
export const loadAbcjs = () => (loading ??= import('abcjs'))
export type Abcjs = Awaited<ReturnType<typeof loadAbcjs>>

export type Hands = 'both' | 'right' | 'left'

/**
 * Which voice each note belongs to, by its position in the ABC text. abcjs's timing
 * events say what pitches sound but not whose hand they are; this answers that.
 * Voice 0 is the first `V:` (the right hand by the convention the add form teaches),
 * voice 1 the second.
 */
export function voiceByChar(tune: TuneObject): Map<number, number> {
  const map = new Map<number, number>()
  for (const line of tune.lines) {
    const staves = (line as { staff?: Array<{ voices?: Array<Array<{ startChar?: number; el_type?: string }>> }> }).staff
    if (!staves) continue
    let voice = 0
    for (const staff of staves) {
      for (const items of staff.voices ?? []) {
        for (const item of items) {
          if (item.el_type === 'note' && typeof item.startChar === 'number') map.set(item.startChar, voice)
        }
        voice++
      }
    }
  }
  return map
}

export const handPlays = (hands: Hands, voice: number | undefined) =>
  hands === 'both' || voice === undefined || (hands === 'right' ? voice === 0 : voice !== 0)

/** The skeleton the add form starts from: two hands, ready to type into from a book. */
export const ABC_SKELETON = `X:1
T:Title
C:Composer
M:4/4
L:1/8
Q:1/4=100
K:C
%%score {1 2}
V:1 clef=treble name="R.H."
V:2 clef=bass name="L.H."
[V:1] C2 D2 E2 F2 | G4 G4 |]
[V:2] C,4 G,,4 | C,8 |]
`
