import { KEY_TITLES, METERS, type Score } from '../../../lib/score/model'
import type { useScoreEditor } from '../../../lib/score/useScoreEditor'

type Actions = ReturnType<typeof useScoreEditor>['actions']

/** Title, composer, tempo, key, time and staves, folded on a phone. */
export function HeaderFields({ score, actions, open }: { score: Score; actions: Actions; open: boolean }) {
  return (
    <details className="score-fields" open={open}>
      <summary>
        <strong>{score.title || 'Untitled'}</strong>
        {score.composer ? ` · ${score.composer}` : ''} · {KEY_TITLES[score.key + 4]} · {score.meter[0]}/{score.meter[1]} · ♩ = {score.bpm}
      </summary>
      <div className="score-fields-grid">
        <label className="score-field score-field--wide">
          <span className="kicker">Title</span>
          <input type="text" value={score.title} onChange={(e) => actions.setHeader({ title: e.target.value })} />
        </label>
        <label className="score-field score-field--wide">
          <span className="kicker">Composer</span>
          <input type="text" value={score.composer} placeholder="from the book" onChange={(e) => actions.setHeader({ composer: e.target.value })} />
        </label>
        <label className="score-field">
          <span className="kicker">♩ =</span>
          <input type="number" min={20} max={240} value={score.bpm} onChange={(e) => actions.setHeader({ bpm: Math.max(20, Math.min(240, Number(e.target.value) || 100)) })} />
        </label>
        <label className="score-field">
          <span className="kicker">Key</span>
          <select className="unit-switch" value={score.key} onChange={(e) => actions.setHeader({ key: Number(e.target.value) })}>
            {KEY_TITLES.map((title, i) => (
              <option key={title} value={i - 4}>
                {title}
              </option>
            ))}
          </select>
        </label>
        <label className="score-field">
          <span className="kicker">Time</span>
          <select className="unit-switch" value={score.meter.join('/')} onChange={(e) => actions.setHeader({ meter: e.target.value.split('/').map(Number) as [number, number] })}>
            {METERS.map(([n, d]) => (
              <option key={`${n}/${d}`} value={`${n}/${d}`}>
                {n}/{d}
              </option>
            ))}
          </select>
        </label>
        <label className="score-field">
          <span className="kicker">Staves</span>
          <select
            className="unit-switch"
            value={score.hands}
            onChange={(e) => {
              const hands = Number(e.target.value) as 1 | 2
              if (hands === 1 && score.voices[1]?.events.length && !window.confirm('Drop the left hand and its notes?')) return
              actions.setHands(hands)
            }}
          >
            <option value={2}>Two</option>
            <option value={1}>One</option>
          </select>
        </label>
      </div>
    </details>
  )
}
