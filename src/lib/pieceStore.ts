import { useCallback, useEffect, useState } from 'react'
import { abcHeader, ADD_PIECE_ID, BUNDLED_PIECES, type Piece, type PieceLevel } from '../data/pieces'

/** The learner's own pieces, kept per browser like progress is. */
const STORAGE_KEY = 'tonic.pieces.v1'
const LEVELS: PieceLevel[] = ['beginner', 'easy', 'intermediate']

function reconcile(stored: unknown): Piece[] {
  if (typeof stored !== 'object' || stored === null) return []
  const list = (stored as { pieces?: unknown }).pieces
  if (!Array.isArray(list)) return []
  const out: Piece[] = []
  for (const item of list) {
    if (typeof item !== 'object' || item === null) continue
    const p = item as Partial<Piece>
    if (typeof p.id !== 'string' || typeof p.abc !== 'string' || p.id === ADD_PIECE_ID) continue
    out.push({
      id: p.id,
      title: typeof p.title === 'string' && p.title ? p.title : 'Untitled',
      credit: typeof p.credit === 'string' ? p.credit : '',
      level: LEVELS.includes(p.level as PieceLevel) ? (p.level as PieceLevel) : 'beginner',
      abc: p.abc,
      source: 'mine',
    })
  }
  return out
}

export function loadMyPieces(): Piece[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? reconcile(JSON.parse(raw)) : []
  } catch {
    return []
  }
}

function saveMyPieces(pieces: Piece[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, pieces }))
  } catch {
    // Storage full or blocked: the piece still plays this session.
  }
}

const newId = () => `mine-${Date.now().toString(36)}`

/** Every piece there is: the bundled ones, then the learner's own. */
export function usePieces() {
  const [mine, setMine] = useState<Piece[]>(loadMyPieces)

  // Another tab may have added one.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setMine(loadMyPieces())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const save = useCallback((abc: string, level: PieceLevel, id?: string): Piece => {
    const head = abcHeader(abc)
    const piece: Piece = {
      id: id ?? newId(),
      title: head.title ?? 'Untitled',
      credit: head.composer ?? 'Typed in by me',
      level,
      abc,
      source: 'mine',
    }
    setMine((list) => {
      const next = list.some((p) => p.id === piece.id)
        ? list.map((p) => (p.id === piece.id ? piece : p))
        : [...list, piece]
      saveMyPieces(next)
      return next
    })
    return piece
  }, [])

  const remove = useCallback((id: string) => {
    setMine((list) => {
      const next = list.filter((p) => p.id !== id)
      saveMyPieces(next)
      return next
    })
  }, [])

  const all = [...BUNDLED_PIECES, ...mine]
  const find = (id: string) => all.find((p) => p.id === id)
  return { all, mine, find, save, remove }
}
