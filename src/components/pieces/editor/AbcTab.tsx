import { AbcCheatSheet } from '../AbcCheatSheet'

/** The piece as text, for those who would rather type, and for anything the editor cannot draw. */
export function AbcTab({ text, onChange, notice }: { text: string; onChange: (text: string) => void; notice: string | null }) {
  const open = async (file: File | undefined) => {
    if (!file) return
    onChange(await file.text())
  }
  return (
    <div className="abc-editor-text">
      {notice && <p className="game-message is-wrong">{notice}</p>}
      <textarea className="abc-text" value={text} onChange={(e) => onChange(e.target.value)} spellCheck={false} aria-label="ABC notation" />
      <div className="game-line-controls">
        <label className="btn btn-secondary abc-open">
          Open an .abc file
          <input type="file" accept=".abc,text/plain" onChange={(e) => void open(e.target.files?.[0])} />
        </label>
        <button type="button" className="btn btn-secondary" onClick={() => void navigator.clipboard?.writeText(text)}>
          Copy ABC
        </button>
      </div>
      <AbcCheatSheet />
    </div>
  )
}
