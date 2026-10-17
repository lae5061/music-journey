import type { ReactNode } from 'react'

/** A small ? that opens a panel of help; closed, it is just the mark. */
export function HelpToggle({ label, children }: { label: string; children: ReactNode }) {
  return (
    <details className="help">
      <summary aria-label={label} title={label}>
        ?
      </summary>
      <div className="help-panel">{children}</div>
    </details>
  )
}
