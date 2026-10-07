import { TOTAL_LESSONS, UNITS } from '../data/course'
import { curriculumHref, landingHref, resumeHref, type Screen } from '../lib/route'

interface HeaderProps {
  screen: Screen
}

export function SiteHeader({ screen }: HeaderProps) {
  const link = (target: Screen, href: string, text: string) => (
    <a href={href} aria-current={screen === target ? 'page' : undefined}>
      {text}
    </a>
  )

  return (
    <header className="nav site-header">
      <a className="nav-brand" href={landingHref}>
        <span className="brand-mark" aria-hidden="true" />
        Tonic
      </a>
      {link('landing', landingHref, 'Overview')}
      {link('curriculum', curriculumHref, 'Curriculum')}
      {link('lesson', resumeHref, 'Lesson')}
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
