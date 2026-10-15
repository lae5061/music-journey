import depotBoogie from './pieces/depot-boogie.abc?raw'

/**
 * Pieces to play from the score. Each is ABC notation text: a few lines a learner can
 * type from a printed page, which matters because method-book pieces are copyrighted
 * and cannot be shipped. The ones here are original.
 */
export type PieceLevel = 'beginner' | 'easy' | 'intermediate'

export interface Piece {
  id: string
  title: string
  /** Composer, arranger, or where it came from. */
  credit: string
  level: PieceLevel
  abc: string
  source: 'bundled' | 'mine'
}

export const LEVEL_LABEL: Record<PieceLevel, string> = {
  beginner: 'Beginner',
  easy: 'Easy',
  intermediate: 'Intermediate',
}

/** What the ABC header says, for cards and titles. */
export function abcHeader(abc: string) {
  const field = (letter: string) => {
    const m = new RegExp(`^${letter}:\\s*(.+)$`, 'm').exec(abc)
    return m ? m[1].trim() : undefined
  }
  const voices = (abc.match(/^V:\s*\S+/gm) ?? []).length
  const tempo = field('Q')
  const bpm = tempo ? Number(/=\s*(\d+)/.exec(tempo)?.[1] ?? tempo) : undefined
  return {
    title: field('T'),
    composer: field('C'),
    meter: field('M'),
    bpm: bpm && Number.isFinite(bpm) ? bpm : undefined,
    voices: Math.max(1, voices),
  }
}

/** Bars in the first voice, as a rough length for the card. */
export function abcBars(abc: string): number {
  const lines = abc.split('\n').filter((l) => /^\[V:1\]/.test(l) || (!/^[A-Za-z%]:|^%%|^\[V:/.test(l) && /\|/.test(l)))
  const bars = lines.join(' ').split(/\|+\]?/).filter((s) => s.trim().length > 0).length
  return bars
}

const bundled = (id: string, level: PieceLevel, abc: string): Piece => {
  const head = abcHeader(abc)
  return { id, title: head.title ?? id, credit: head.composer ?? '', level, abc, source: 'bundled' }
}

export const BUNDLED_PIECES: Piece[] = [bundled('depot-boogie', 'beginner', depotBoogie)]

/** The id the add form lives at; no piece may use it. */
export const ADD_PIECE_ID = 'add'
