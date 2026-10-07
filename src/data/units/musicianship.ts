import { chord, DYNAMICS, progression, ramp, repeat, seq, then, together, triad } from '../../lib/music'
import type { Unit } from '../types'

export const musicianship: Unit = {
  title: 'Musicianship and repertoire',
  summary: 'Playing music rather than notes — shape, style, and other people.',
  outcome: 'A handful of pieces you can play through, in a style that suits them, with others.',
  lessons: [
    {
      title: 'Phrasing and expression',
      duration: '13 min',
      summary: 'Music breathes. Where it breathes is a decision you make.',
      steps: [
        {
          title: 'Phrases are sentences',
          text: 'A melody divides into phrases the way prose divides into sentences — usually four bars, with a breath at the end. Play the same line with and without that shape and the difference is the whole of musicality.',
          definition:
            'A phrase is a complete musical thought, typically two or four bars, ending in a small point of rest.',
          hint: 'Flat first, then shaped',
          highlight: [60, 62, 64, 65, 67, 69],
          phrase: seq([60, 62, 64, 65, 67, 65, 64, 60], { step: 0.5, vel: 0.7 }),
          playLabel: 'Play it flat',
          alt: {
            label: 'Play it shaped',
            phrase: {
              tempo: 88,
              hits: [
                { n: 60, at: 0, dur: 0.5, vel: 0.5 },
                { n: 62, at: 0.5, dur: 0.5, vel: 0.58 },
                { n: 64, at: 1, dur: 0.5, vel: 0.68 },
                { n: 65, at: 1.5, dur: 0.5, vel: 0.78 },
                { n: 67, at: 2, dur: 1, vel: 0.9 },
                { n: 65, at: 3, dur: 0.5, vel: 0.66 },
                { n: 64, at: 3.5, dur: 0.5, vel: 0.55 },
                { n: 60, at: 4, dur: 2, vel: 0.42 },
              ],
            },
            highlight: [60, 62, 64, 65, 67],
          },
        },
        {
          title: 'Every phrase has a peak',
          text: 'Find the note the phrase is heading for — usually the highest, or the one on the strongest beat — and grow towards it, then relax away. Decide it deliberately; if you do not, the loudest note will be whichever one your hand happens to hit hardest.',
          definition:
            'The climax of a phrase is its point of greatest tension. Dynamics and timing both lead towards it and away.',
          hint: 'Everything leads to the top note',
          highlight: [60, 64, 67, 72],
          phrase: ramp(seq([60, 64, 67, 72, 67, 64, 60], { step: 0.5 }), 'p', 'f'),
        },
        {
          title: 'Rubato',
          text: 'Stretching and compressing time for expression. The classical convention is that what you borrow you pay back, so the phrase still ends where it should. Used sparingly it is moving; used constantly it just sounds unsteady.',
          definition:
            'Rubato is flexible tempo within a phrase — slowing at points of tension and recovering the time afterwards.',
          hint: 'The middle stretches, the end catches up',
          highlight: [67, 69, 71, 72],
          phrase: {
            tempo: 72,
            hits: [
              { n: 67, at: 0, dur: 0.5, vel: 0.6 },
              { n: 69, at: 0.5, dur: 0.6, vel: 0.68 },
              { n: 71, at: 1.15, dur: 0.8, vel: 0.8 },
              { n: 72, at: 2, dur: 1.4, vel: 0.92 },
              { n: 71, at: 3.3, dur: 0.4, vel: 0.6 },
              { n: 69, at: 3.7, dur: 0.3, vel: 0.5 },
              { n: 67, at: 4, dur: 2, vel: 0.45 },
            ],
          },
        },
      ],
    },

    {
      title: 'Styles',
      duration: '16 min',
      summary: 'The same four chords, played five ways.',
      steps: [
        {
          title: 'Classical',
          text: 'Even touch, clear voices, the melody sung over an accompaniment that never competes. Alberti bass, careful dynamics, the pedal used to join rather than to thicken.',
          definition:
            'Classical keyboard texture: a singing right-hand line over a broken-chord left hand, with controlled dynamics.',
          hint: 'Melody over Alberti bass',
          highlight: [48, 52, 55, 67, 69, 72],
          phrase: together(
            {
              hits: [48, 55, 52, 55, 48, 55, 52, 55].map((n, i) => ({
                n,
                at: i * 0.5,
                dur: 0.5,
                vel: 0.4,
                hand: 'L' as const,
              })),
            },
            seq([67, 69, 72, 71], { step: 1, dur: 0.95, hand: 'R', vel: 0.8 }),
          ),
        },
        {
          title: 'Pop ballad',
          text: 'Root-position chords, pedal on every change, and the melody doubled in octaves if you want it to carry. Simplicity is the style, not a shortcut within it.',
          definition:
            'Pop piano typically states the harmony plainly and lets the rhythm and the vocal do the work.',
          hint: 'Plain chords, pedalled',
          highlight: [...triad(48), ...triad(55)],
          phrase: {
            tempo: 74,
            pedal: true,
            hits: [
              { n: [36, ...triad(48)], at: 0, dur: 2, vel: 0.55, hand: 'L' },
              { n: [43, ...triad(55)], at: 2, dur: 2, vel: 0.55, hand: 'L' },
              { n: 72, at: 0, dur: 1.5, vel: 0.85, hand: 'R' },
              { n: 71, at: 1.5, dur: 0.5, vel: 0.7, hand: 'R' },
              { n: 69, at: 2, dur: 2, vel: 0.8, hand: 'R' },
            ],
          },
        },
        {
          title: 'Jazz',
          text: 'Sevenths everywhere, swung eighths, the left hand playing shells rather than full chords, and the beat implied rather than stated. The same progression as the ballad, entirely different clothing.',
          definition:
            'Jazz piano voices chords from the third and seventh, swings the eighths, and leaves the root to the bass.',
          hint: 'Sevenths, swung',
          highlight: [52, 58, 62, 65],
          phrase: {
            tempo: 124,
            swing: true,
            hits: [
              { n: [52, 58], at: 0, dur: 0.4, vel: 0.55, hand: 'L' },
              { n: [53, 57], at: 2.5, dur: 0.4, vel: 0.55, hand: 'L' },
              { n: 72, at: 0.5, dur: 0.4, vel: 0.8, hand: 'R' },
              { n: 74, at: 1, dur: 0.4, vel: 0.65, hand: 'R' },
              { n: 71, at: 1.5, dur: 0.9, vel: 0.85, hand: 'R' },
              { n: 69, at: 3, dur: 1, vel: 0.7, hand: 'R' },
            ],
          },
        },
        {
          title: 'Blues and gospel',
          text: 'Blues: the flat third and flat seventh rubbing against the major chord, and a walking or boogie bass. Gospel adds thick voicings, passing chords between every change, and a strong backbeat.',
          definition:
            'Blues and gospel share the blue notes; gospel fills the space between chords with chromatic passing harmony.',
          hint: 'Blue notes over a boogie bass',
          highlight: [48, 52, 55, 57, 63, 70],
          phrase: {
            tempo: 116,
            swing: true,
            hits: [
              ...repeat(seq([48, 52, 55, 57, 58, 57, 55, 52], { step: 0.5, hand: 'L', vel: 0.5 }), 1)
                .hits,
              { n: 70, at: 0.5, dur: 0.4, vel: 0.85, hand: 'R' },
              { n: 72, at: 1, dur: 0.4, vel: 0.7, hand: 'R' },
              { n: 63, at: 2, dur: 0.4, vel: 0.85, hand: 'R' },
              { n: 64, at: 2.5, dur: 1.5, vel: 0.8, hand: 'R' },
            ],
          },
        },
        {
          title: 'Latin',
          text: 'The pulse is a repeating two-bar pattern rather than a backbeat, and the left hand plays it rather than marking time. Everything is syncopated and nothing is swung — the eighths stay dead even.',
          definition:
            'Latin styles are built on clave — a fixed syncopated pattern that the whole ensemble references.',
          hint: 'Even eighths, heavily syncopated',
          highlight: [...triad(60), 36, 43],
          phrase: {
            tempo: 100,
            hits: [
              { n: 36, at: 0, dur: 0.4, vel: 0.7, hand: 'L' },
              { n: 43, at: 1.5, dur: 0.4, vel: 0.6, hand: 'L' },
              { n: 36, at: 3, dur: 0.4, vel: 0.65, hand: 'L' },
              { n: triad(60), at: 2, dur: 0.3, vel: 0.7, hand: 'R' },
              { n: triad(60), at: 3.5, dur: 0.3, vel: 0.75, hand: 'R' },
              { n: triad(65), at: 4, dur: 0.3, vel: 0.7, hand: 'R' },
              { n: triad(65), at: 5.5, dur: 0.3, vel: 0.75, hand: 'R' },
            ],
          },
        },
        {
          title: 'Which style?',
          text: 'The same harmony each time. What changes is the rhythm, the voicing and the feel.',
          definition:
            'Style is carried by texture and rhythm far more than by harmony. The chords are often identical.',
          hint: 'Listen to the left hand',
          quiz: {
            prompt: 'Which style was that?',
            options: ['Classical', 'Pop ballad', 'Jazz', 'Blues'],
            questions: [
              {
                answer: 'Classical',
                phrase: {
                  tempo: 100,
                  hits: [48, 55, 52, 55, 48, 55, 52, 55].map((n, i) => ({
                    n,
                    at: i * 0.5,
                    dur: 0.5,
                    vel: 0.45,
                  })),
                },
              },
              {
                answer: 'Pop ballad',
                phrase: {
                  tempo: 72,
                  pedal: true,
                  hits: [
                    { n: [36, ...triad(48)], at: 0, dur: 2, vel: 0.55 },
                    { n: [43, ...triad(55)], at: 2, dur: 2, vel: 0.55 },
                  ],
                },
              },
              {
                answer: 'Jazz',
                phrase: {
                  tempo: 124,
                  swing: true,
                  hits: [
                    { n: [52, 58], at: 0, dur: 0.4, vel: 0.6 },
                    { n: [53, 57], at: 1.5, dur: 0.4, vel: 0.6 },
                    { n: [52, 58], at: 3, dur: 0.4, vel: 0.6 },
                  ],
                },
              },
              {
                answer: 'Blues',
                phrase: {
                  tempo: 116,
                  swing: true,
                  hits: seq([48, 52, 55, 57, 58, 57, 55, 52], { step: 0.5, vel: 0.55 }).hits,
                },
              },
            ],
          },
        },
      ],
    },

    {
      title: 'Repertoire and performing',
      duration: '12 min',
      summary: 'Having something ready to play, and getting through playing it.',
      steps: [
        {
          title: 'Keep three pieces ready',
          text: 'Not thirty — three. One short and cheerful, one slow and pretty, one that shows off a little. Kept genuinely performance-ready, they will cover almost every occasion anyone asks you to play.',
          definition:
            'A working repertoire is a small set of pieces maintained at performance standard, not a long list half-learned.',
          hint: 'Something short and cheerful',
          highlight: [...triad(60), ...triad(67)],
          phrase: together(
            progression([triad(48), triad(55), triad(53), triad(48)], { dur: 2, hand: 'L', vel: 0.5 }),
            seq([64, 67, 65, 64], { step: 2, dur: 1.8, hand: 'R' }),
          ),
        },
        {
          title: 'Practise performing, not just playing',
          text: 'Play the whole piece through, once, without stopping, with something at stake — to a phone camera, to one friend. Stopping to fix things is practice; not stopping is performance, and it is a separate skill that needs its own rehearsal.',
          definition:
            'Run-throughs train continuity and recovery. Practising only in fragments leaves you unable to keep going when something slips.',
          hint: 'One run, no stopping',
          highlight: [60, 64, 67, 72],
          phrase: {
            tempo: 92,
            hits: [60, 64, 67, 72, 71, 67, 64, 60].map((n, i) => ({ n, at: i * 0.75, dur: 0.7 })),
          },
        },
        {
          title: 'Nerves and recovery',
          text: 'Nerves are not a sign you are unprepared; they are adrenaline, and they speed you up. Start slower than feels right. When a mistake happens — it will — go on as if nothing did. An audience almost never notices anything you do not draw attention to.',
          definition:
            'Recovery matters more than accuracy: an unremarked slip passes, a visible reaction does not.',
          hint: 'A slip, played through',
          highlight: [60, 62, 64, 65, 67],
          phrase: {
            tempo: 96,
            hits: [
              { n: 60, at: 0, dur: 0.5 },
              { n: 62, at: 0.5, dur: 0.5 },
              { n: 66, at: 1, dur: 0.3, vel: 0.5 },
              { n: 65, at: 1.5, dur: 0.5 },
              { n: 67, at: 2, dur: 2 },
            ],
          },
        },
      ],
    },

    {
      title: 'Playing with other people',
      duration: '12 min',
      summary: 'The things that only matter once you are not alone.',
      steps: [
        {
          title: 'Leave room',
          text: 'The commonest fault of a pianist in a band is playing everything. With a bass player you do not need low roots. With a singer you do not need the melody. Subtract until what remains is only what nobody else is doing.',
          definition:
            'In an ensemble the piano fills the register and rhythmic space that the other instruments leave empty.',
          hint: 'The same chords with the bass removed',
          highlight: [...triad(60, 'major7')],
          phrase: progression([triad(48, 'major7'), triad(53, 'dominant7')], { dur: 3 }),
          playLabel: 'Everything',
          alt: {
            label: 'Leaving room',
            phrase: progression(
              [
                [64, 71],
                [63, 69],
              ],
              { dur: 3, vel: 0.6 },
            ),
            highlight: [63, 64, 69, 71],
          },
        },
        {
          title: 'Accompanying a singer',
          text: 'Give the starting note clearly, play the harmony under the voice rather than around it, and follow their timing rather than imposing yours. Intros and endings are your job; the tempo, once it starts, is theirs.',
          definition:
            'A good accompanist states the key, supports the line and adapts to the singer’s phrasing.',
          hint: 'An intro, then space for the voice',
          highlight: [...triad(60), 67],
          phrase: then(
            seq([67, 72, 71, 67], { step: 0.5, vel: 0.6 }),
            together(
              progression([triad(48), triad(53)], { dur: 4, hand: 'L', vel: 0.45 }),
              { hits: [{ n: 55, at: 0, dur: 8, vel: 0.3, hand: 'L' as const }] },
            ),
          ),
        },
        {
          title: 'Counting each other in',
          text: 'One bar of four, out loud, at the tempo you actually want. Most ensemble disasters happen in the first two bars, and almost all of them come from a count-in that was vague or at the wrong speed.',
          definition:
            'A count-in sets the tempo, the metre and the start point. It is given at performance tempo, not approximately.',
          hint: 'Four beats, then everybody',
          highlight: [...triad(60)],
          phrase: {
            tempo: 104,
            click: 4,
            hits: [
              { n: triad(60), at: 4, dur: 1, vel: 0.8 },
              { n: triad(65), at: 5, dur: 1, vel: 0.7 },
              { n: triad(67), at: 6, dur: 1, vel: 0.7 },
              { n: triad(60), at: 7, dur: 1, vel: 0.8 },
            ],
          },
          playLabel: 'Count in, then play',
        },
      ],
    },
  ],
}

/** Kept for the depths unit, which quotes the same soft dynamic. */
export const QUIET = DYNAMICS.p
export const softChord = (notes: number[]) => chord(notes, { vel: QUIET })
