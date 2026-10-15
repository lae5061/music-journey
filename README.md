# Tonic

A piano course for adult beginners, taught from the keyboard. Seven units, 41 lessons,
154 steps — from how to sit at the instrument through to rootless voicings and
reharmonisation. Every idea is introduced by playing it: the keyboard highlights the
notes in question, the notation shows how they are written, and you hear the result
before you read the definition.

React + TypeScript, built with Vite. No backend; progress lives in `localStorage`, and
every screen has a URL (`#/lesson/2.03/4`) so lessons can be bookmarked and the back
button steps back through the course.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build into dist/
npm run preview  # serve the built app
```

Pushing to `main` deploys twice: to Netlify at https://music-journey-633.netlify.app
through `.github/workflows/netlify.yml` (pull requests get a preview deploy), and to
GitHub Pages through `.github/workflows/deploy.yml`. The Netlify workflow needs two
secrets in a `netlify` environment on the repo, `NETLIFY_AUTH_TOKEN` and
`NETLIFY_SITE_ID`; `netlify.toml` and `.netlify/state.json` carry the site's settings
and id. Hash routes mean every lesson URL works on either host without server rewrites.

## The course

| Unit | | Lessons |
| --- | --- | --- |
| 1 | Fundamentals | Posture and finger numbers · note names · reading the staff · note values and rests · time signatures · accidentals |
| 2 | Technique | Five-finger patterns · scales and the thumb under · minor scales · arpeggios · hand independence · dynamics and articulation · pedalling · ornaments · staying relaxed |
| 3 | Theory | Intervals · keys and key signatures · circle of fifths · building chords · inversions and voice leading · Roman numerals · progressions and cadences · modes and blues · beyond the key |
| 4 | Rhythm and groove | Syncopation, swing and backbeat · accompaniment patterns · playing with a click |
| 5 | Practical skills | Lead sheets · sight-reading · ear training · transposition · memorisation · improvisation · playing by ear |
| 6 | Musicianship | Phrasing · styles · repertoire and performing · playing with others |
| 7 | Optional depths | Jazz voicings and reharmonisation · counterpoint and form · recording, MIDI and synths |

Sixteen lessons end in a scored exercise — interval and chord recognition by ear,
progression identification, metre and style identification, key signatures. Passing one
marks the lesson complete, so "complete" means the learner did something rather than
that they clicked Next.

## Games

Beside the course, a Games tab holds drills for the skills that only come with
repetition. The first is sight reading, in three modes over one set of seven levels
(the treble staff up to the grand staff with accidentals):

- **Flash** — twenty notes, one at a time; play each on the keyboard before a bar drains.
  A wrong or slow answer lights the right keys and waits, and the note counts as missed.
  Scores notes right out of twenty.
- **Stream** — notes slide toward a line; play each as it crosses. The pace rises every
  eight notes and three misses end the run. Scores points, with a bonus for timing.
- **Line** — a generated four-bar melody, a count-in, then play it through to a click.
  Afterwards every note is marked right, wrong (and what was played), early or late.

A Lines · Spaces · Both switch narrows every mode to the notes on lines (ledger lines
included), the notes in spaces, or all of them. All three ask for the note's name rather than its octave — any C answers a written C —
so the board is the same three octaves at every level and a typed letter always lands.
Best scores are kept per level and mode in `localStorage`.

## Pieces

A Pieces tab plays real music from the score. Pieces are **ABC notation** text: a few
lines a learner can type from a printed page, which matters because method-book pieces
are copyrighted and cannot be shipped. The bundled piece is an original twelve-bar boogie;
the learner adds their own with the Add-a-piece form (paste, type, or open an `.abc` file,
with a cheat-sheet and a live preview) and they stay in `localStorage`.

The score is drawn and timed by [abcjs](https://www.abcjs.net/), fetched the first time a
piece is opened so the course bundle stays small. Sound and lights are Tonic's own: every
note abcjs reports is struck on the app's synth and lights the on-screen key, and the
playing notes are tinted on the page behind a moving cursor. The transport has play,
pause and stop, a tempo slider in beats a minute (30 to 200, with the written tempo a
click away) that can be moved mid-piece, a both-right-left hands switch, a count-in and a click; clicking a bar
in the progress track or a note in the score jumps there. On a phone the keyboard pins to
the bottom and the score wraps two bars to a line.

## Playing it from a real keyboard

The computer keyboard plays notes by letter: C D E F G A B, Shift for a sharp, Z and X
for the octave. A MIDI keyboard is optional: a *Connect a MIDI keyboard* line sits under
every playable board, nothing is requested until it is pressed, and once connected the
keyboard lights the keys and answers the games. The app's own sound stays off for MIDI
notes unless asked for, since most keyboards have a voice of their own. Web MIDI exists
in Chrome, Edge and Firefox; Safari, on Mac and iPhone, has none, and the line says so.

## How it is put together

Everything sounded — a single note, a scale, an Alberti bass, three-against-two, a swung
blues — is one `Phrase`: hits placed on a beat grid, with velocity, hand and duration.
That one structure is what the audio engine schedules, what the keyboard lights from, and
what the notation is drawn from, so a lesson's sound and its picture cannot drift apart.

```
src/
  App.tsx              the URL decides the screen; progress, navigation, completion
  config.ts            fixed options: key labels, keyboard voice
  data/
    course.ts          the seven units, lesson addressing, navigation
    types.ts           what a step may contain
    units/*.ts         all course content — one file per unit
    games.ts           the games list
    pieces.ts          the piece model and the bundled pieces/*.abc
  components/
    Piano.tsx          the keyboard: fits its container, never scrolls
    StepView.tsx       assembles a step from its parts
    Lesson.tsx         sidebar, progress, step, step navigation
    Curriculum.tsx     all seven units and their lesson cards
    Landing.tsx        hero, try-it keyboard, the method, unit list
    Quiz.tsx           the scored exercises
    Games.tsx          the games index
    games/             SightReading.tsx shell; Flash, Stream, Line modes
    pieces/            index, player, transport, add form, ABC cheat-sheet
    ChordChart.tsx     lead sheets and chord grids
    Diagram.tsx        octave map, circle of fifths, hands, posture, note values, pedals
    notation/
      Staff.tsx        notation renderer — pitches, values, rests, ties, triplets
      glyphs.tsx       clefs, accidentals, rests, flags, articulation marks
  lib/
    music.ts           phrases, scales, chords, inversions, the circle of fifths
    audio.ts           Web Audio voices and phrase scheduling
    usePiano.ts        what is sounding and what is lit
    keyboard.ts        key geometry, and choosing a range that fits
    notes.ts / pitch.ts  MIDI maths, and written pitch ("F#3")
    progress.ts        localStorage, reconciled against the current course
    route.ts           hash routes: #/, #/curriculum, #/lesson/2.03/4, #/games/…, #/pieces/…
    sightReading.ts    levels, note pools, melody generation, best scores
    useScorePlayer.ts  a score that plays: abcjs render and clock, lights and sound
    abc.ts             loading abcjs, voice lookup, the add-form skeleton
    pieceStore.ts      the learner's own pieces, in localStorage
```

Notes are MIDI numbers throughout — 60 is middle C.

### The keyboard fits, it does not scroll

A phone cannot show 88 keys at a size anyone can hit. Rather than shrink them to
slivers or make the learner drag sideways to find middle C, the board picks a range:
it takes the notes the step is about, frames them, and narrows the window until the
white keys are at least 26px. Middle C ends up centred at every width. It only goes
below that minimum when the example itself spans more keys than would otherwise fit —
seeing the notes beats key width on a step you listen to rather than play.

Lesson 1.01 still shows all 88 keys, but as a labelled diagram above the playable
board, which teaches the shape of the instrument better than 6px keys would.

### Notation

Drawn from the same note values the audio engine plays. The clefs, accidentals, rests
and flags are stroked SVG constructions rather than a music font — no music font can be
relied on to be present, and a missing glyph in a reading lesson is worse than a plain
one. It handles both staves and the grand staff, key and time signatures, ledger lines,
dots, ties, triplets, fingering, articulation, dynamics, a pedal line and a counting row.

## Design

Built from a Claude Design handoff bundle, kept in `project/` for reference: the
prototype (`Tonic.dc.html`), the Modernist design system, and the chat transcripts.
`project/HANDOFF.md` is the bundle's own readme. Every colour comes from a design-system
token; the literal px values in `src/styles/app.css` are the design's own composition
sizes, which the token scales don't cover.

Two prototype details differ on purpose. The Tweaks-panel options ship as fixed defaults
in `src/config.ts` — they were design-direction knobs, not learner controls — and the
alternative "Poster" hero is not built, though it is still in `project/Tonic.dc.html`.
And progress persists, per browser.

## Known gaps

- **No photographs.** The design assistant asked for a grayscale photo of hand position;
  the posture and hand-position steps use line diagrams instead. A real photo would be
  better and the `.grayscale` wrapper is ready for one.
- **No tests.** The course was verified by crawling all 154 steps in a browser at phone
  and desktop widths, but none of that is checked in.
