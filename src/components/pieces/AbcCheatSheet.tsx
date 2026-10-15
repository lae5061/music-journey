/** Enough ABC to type a beginner piece in from the page. */
export function AbcCheatSheet() {
  return (
    <details className="abc-cheat">
      <summary>How to write it out</summary>
      <dl>
        <dt>Notes</dt>
        <dd>
          <code>C D E F G A B</code> are the octave from middle C. Lower case <code>c d e</code> is the
          octave above; <code>C,</code> the octave below; <code>c'</code> two above.
        </dd>
        <dt>Sharps and flats</dt>
        <dd>
          <code>^F</code> sharp, <code>_B</code> flat, <code>=B</code> natural. A key signature such as{' '}
          <code>K:G</code> adds its sharps for you.
        </dd>
        <dt>Lengths</dt>
        <dd>
          With <code>L:1/8</code>: <code>C</code> is an eighth, <code>C2</code> a quarter, <code>C4</code> a half,{' '}
          <code>C8</code> a whole, <code>C3</code> a dotted quarter, <code>C/</code> a sixteenth.
        </dd>
        <dt>Rests</dt>
        <dd>
          <code>z2</code> a quarter rest, <code>z4</code> a half, <code>z8</code> a whole bar.
        </dd>
        <dt>Bars</dt>
        <dd>
          <code>|</code> a bar line, <code>|]</code> the end, <code>|: … :|</code> a repeat,{' '}
          <code>[1 … :|[2 …</code> first and second endings.
        </dd>
        <dt>Chords, ties, slurs</dt>
        <dd>
          <code>[CEG]2</code> a chord, <code>C2-C2</code> a tie, <code>(C D E)</code> a slur.
        </dd>
        <dt>Two hands</dt>
        <dd>
          <code>V:1</code> is the right hand on the treble staff, <code>V:2</code> the left on the bass.
          Write each line of the page as a pair: a <code>[V:1]</code> line, then its <code>[V:2]</code> line.
        </dd>
        <dt>Tempo and time</dt>
        <dd>
          <code>Q:1/4=100</code> is 100 to the quarter; <code>M:3/4</code> sets the time signature.
        </dd>
        <dt>Fingering and dynamics</dt>
        <dd>
          <code>!1!C</code> prints a 1 over the note; <code>!p!</code> and <code>!f!</code> for dynamics.
        </dd>
      </dl>
    </details>
  )
}
