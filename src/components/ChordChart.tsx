import type { ChartSpec } from '../data/types'

/**
 * A lead sheet's chord grid: four bars to a line, chord symbols where the changes
 * happen, and — when the lesson is about harmony rather than repertoire — the Roman
 * numeral under each bar.
 */
export function ChordChart({ chart }: { chart: ChartSpec }) {
  return (
    <figure className="chart">
      <div className="chart-head">
        <div>
          {chart.title && <h4 className="chart-title">{chart.title}</h4>}
          <span className="chart-key">
            Key of {chart.key}
            {chart.time && ` · ${chart.time[0]}/${chart.time[1]}`}
          </span>
        </div>
        {chart.tempo && <span className="chart-tempo">{chart.tempo}</span>}
      </div>

      <div className="chart-grid">
        {chart.bars.map((bar, i) => (
          <div className="chart-bar" key={i}>
            {bar.section && <span className="chart-section">{bar.section}</span>}
            <div className="chart-chords">
              {bar.chords.map((symbol, j) => (
                <span className="chart-chord" key={j}>
                  {symbol}
                </span>
              ))}
            </div>
            {chart.analysis?.[i] && <span className="chart-analysis">{chart.analysis[i]}</span>}
            {bar.lyric && <span className="chart-lyric">{bar.lyric}</span>}
          </div>
        ))}
      </div>
    </figure>
  )
}
