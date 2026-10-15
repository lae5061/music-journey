/**
 * Options the design prototype exposed in Claude Design's Tweaks panel. They were
 * never learner-facing controls, so they ship here as fixed defaults — change the
 * constant to change the whole app.
 */

/** Which keys carry a printed note name. Highlighted and sounding keys always do. */
export type KeyLabelMode = 'all' | 'highlighted' | 'c-only'
export const KEY_LABELS: KeyLabelMode = 'all'

/** The synthesised voice the keyboard plays with. */
export type Timbre = 'piano' | 'organ'
export const TIMBRE: Timbre = 'piano'
