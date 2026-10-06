import type { Screen } from '../App'
import { TOTAL_LESSONS, UNITS } from '../data/course'

interface HeaderProps {
  screen: Screen
  onNavigate: (screen: Screen) => void
}

export function SiteHeader({ screen, onNavigate }: HeaderProps) {
  const link = (target: Screen, text: string) => (
    <a
      href="#"
      aria-current={screen === target ? 'page' : undefined}
      onClick={(e) => {
        e.preventDefault()
        onNavigate(target)
      }}
    >
      {text}
    </a>
  )

  return (
    <header className="nav site-header">
      <a
        className="nav-brand"
        href="#"
        onClick={(e) => {
          e.preventDefault()
          onNavigate('landing')
        }}
      >
        <span className="brand-mark" aria-hidden="true" />
        Tonic
      </a>
      {link('landing', 'Overview')}
      {link('curriculum', 'Curriculum')}
      {link('lesson', 'Lesson')}
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <span>Tonic — music theory from the keyboard</span>
      <span>
        {UNITS.length} units · {TOTAL_LESSONS} lessons
      </span>
    </footer>
  )
}
