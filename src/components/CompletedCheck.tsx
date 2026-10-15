/** The red tick that marks a finished lesson. Always in the DOM so rows stay aligned. */
export function CompletedCheck({ done }: { done: boolean }) {
  return (
    <svg
      className={`check${done ? '' : ' is-hidden'}`}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="square"
      role={done ? 'img' : 'presentation'}
      aria-label={done ? 'Completed' : undefined}
      aria-hidden={done ? undefined : true}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
