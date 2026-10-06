import { repeat, seq, together, triad } from '../../lib/music'
import type { Hit } from '../../lib/music'
import type { Unit } from '../types'

/** An Alberti bass: low, high, middle, high — the eighteenth century's drum machine. */
const alberti = (root: number[], bars = 2): Hit[] => {
  const [a, b, c] = root
  const pattern = [a, c, b, c]
  return Array.from({ length: bars * 4 }, (_, i) => ({
    n: pattern[i % 4],
    at: i * 0.5,
    dur: 0.5,
    vel: 0.5,
    hand: 'L' as const,
  }))
}

export const rhythm: Unit = {
  title: 'Rhythm and groove',
  summary: 'Where the weight falls, and the left-hand patterns that carry a song along.',
  outcome: 'You can hold a groove against a click and play four accompaniment styles from memory.',
  lessons: [
    {
      title: 'Syncopation, swing and the backbeat',
      duration: '14 min',
      summary: 'Three ways of pushing against the beat instead of sitting on it.',
      steps: [
        {
          title: 'On the beat, then off it',
          text: 'Play four even quarter notes: entirely square. Now move some of them onto the "and" between beats and the same notes start to move. Syncopation is emphasis landing where the beat is not.',
          definition:
            'Syncopation places accents on weak beats or between beats, against the underlying pulse.',
          hint: 'Straight first, then syncopated',
          highlight: [60, 64, 67],
          phrase: {
            tempo: 100,
            click: 4,
            hits: [0, 1, 2, 3].map((at) => ({ n: [60, 64, 67, 64][at], at, dur: 0.9 })),
          },
          playLabel: 'Play it straight',
          alt: {
            label: 'Play it syncopated',
            phrase: {
              tempo: 100,
              click: 4,
              hits: [
                { n: 60, at: 0, dur: 0.5, vel: 0.9 },
                { n: 64, at: 1.5, dur: 0.5, vel: 0.95 },
                { n: 67, at: 2.5, dur: 0.5, vel: 0.95 },
                { n: 64, at: 3, dur: 1, vel: 0.6 },
              ],
            },
            highlight: [60, 64, 67],
          },
          staff: {
            clef: 'treble',
            time: [4, 4],
            counts: true,
            notes: [
              { pitch: 'C4', value: 0.5, count: '1' },
              { value: 1, rest: true, count: '&  2' },
              { pitch: 'E4', value: 0.5, count: '&', mark: 'accent' },
              { value: 0.5, rest: true, count: '3' },
              { pitch: 'G4', value: 0.5, count: '&', mark: 'accent' },
              { pitch: 'E4', value: 1, count: '4' },
            ],
          },
        },
        {
          title: 'Swing',
          text: 'Written as even eighth notes, played long-short: the off-beat arrives two thirds through the beat, not halfway. You cannot notate it properly, so it is marked at the top and understood. Listen to the same line both ways.',
          definition:
            'Swing delays every off-beat eighth, turning an even division into a long-short one — roughly a triplet feel.',
          hint: 'Straight, then swung',
          highlight: [60, 62, 64, 65, 67],
          phrase: { ...seq([60, 62, 64, 65, 67, 65, 64, 62], { step: 0.5 }), tempo: 132, click: 4 },
          playLabel: 'Play it straight',
          alt: {
            label: 'Play it swung',
            phrase: {
              ...seq([60, 62, 64, 65, 67, 65, 64, 62], { step: 0.5 }),
              tempo: 132,
              click: 4,
              swing: true,
            },
            highlight: [60, 62, 64, 65, 67],
          },
        },
        {
          title: 'The backbeat',
          text: 'In almost all popular music the emphasis sits on beats 2 and 4, not 1 and 3. That is where the snare drum lands. Once you feel it, a huge amount of music suddenly makes rhythmic sense.',
          definition:
            'The backbeat is the accent on beats 2 and 4 of a bar of four. It is the defining rhythmic feature of rock, pop and soul.',
          hint: 'The weight is on 2 and 4',
          highlight: [...triad(60), 36],
          phrase: {
            tempo: 96,
            click: 4,
            hits: [
              { n: 36, at: 0, dur: 0.5, vel: 0.6, hand: 'L' },
              { n: triad(60), at: 1, dur: 0.5, vel: 1, hand: 'R' },
              { n: 36, at: 2, dur: 0.5, vel: 0.6, hand: 'L' },
              { n: triad(60), at: 3, dur: 0.5, vel: 1, hand: 'R' },
              { n: 36, at: 4, dur: 0.5, vel: 0.6, hand: 'L' },
              { n: triad(60), at: 5, dur: 0.5, vel: 1, hand: 'R' },
              { n: 36, at: 6, dur: 0.5, vel: 0.6, hand: 'L' },
              { n: triad(60), at: 7, dur: 0.5, vel: 1, hand: 'R' },
            ],
          },
        },
        {
          title: 'Straight or swung?',
          text: 'The same notes, one feel or the other. This is the discrimination that tells you how to play a lead sheet you have never seen.',
          definition:
            'Straight eighths divide the beat in two; swung eighths divide it unevenly, long then short.',
          hint: 'Listen to the off-beats',
          quiz: {
            prompt: 'Straight or swung?',
            options: ['Straight', 'Swung'],
            questions: [
              { phrase: { ...seq([60, 62, 64, 65], { step: 0.5 }), tempo: 126 }, answer: 'Straight' },
              {
                phrase: { ...seq([60, 62, 64, 65], { step: 0.5 }), tempo: 126, swing: true },
                answer: 'Swung',
              },
              {
                phrase: { ...seq([67, 65, 64, 62, 60, 62, 64, 65], { step: 0.5 }), tempo: 132, swing: true },
                answer: 'Swung',
              },
              {
                phrase: { ...seq([67, 65, 64, 62, 60, 62, 64, 65], { step: 0.5 }), tempo: 132 },
                answer: 'Straight',
              },
            ],
          },
        },
      ],
    },

    {
      title: 'Accompaniment patterns',
      duration: '18 min',
      summary: 'Five left-hand figures that will get you through most songs.',
      steps: [
        {
          title: 'Alberti bass',
          text: 'Low, high, middle, high, over and over. Mozart used it constantly because it keeps a chord sounding continuously while staying out of the melody’s way. Learn it once and it transfers to every chord.',
          definition:
            'Alberti bass breaks a triad in the order root–fifth–third–fifth, in steady eighth notes.',
          hint: 'C – G – E – G, repeating',
          highlight: triad(48),
          phrase: {
            tempo: 104,
            hits: [
              ...alberti(triad(48), 1),
              ...alberti(triad(53), 1).map((h) => ({ ...h, at: h.at + 2 })),
              { n: 67, at: 0, dur: 2, hand: 'R' as const },
              { n: 69, at: 2, dur: 2, hand: 'R' as const },
            ],
          },
        },
        {
          title: 'Stride',
          text: 'Bass note on 1 and 3, chord on 2 and 4. The left hand leaps an octave and a half every half beat — hence the name. It is the engine of ragtime and early jazz, and it sounds like a whole rhythm section.',
          definition:
            'Stride alternates a low root (or root–fifth) on the strong beats with a mid-register chord on the weak ones.',
          hint: 'Bass, chord, bass, chord',
          highlight: [36, 43, ...triad(55)],
          phrase: {
            tempo: 116,
            hits: [
              { n: 36, at: 0, dur: 0.5, vel: 0.7, hand: 'L' },
              { n: triad(55), at: 1, dur: 0.5, vel: 0.5, hand: 'L' },
              { n: 43, at: 2, dur: 0.5, vel: 0.7, hand: 'L' },
              { n: triad(55), at: 3, dur: 0.5, vel: 0.5, hand: 'L' },
              { n: 41, at: 4, dur: 0.5, vel: 0.7, hand: 'L' },
              { n: triad(53), at: 5, dur: 0.5, vel: 0.5, hand: 'L' },
              { n: 43, at: 6, dur: 0.5, vel: 0.7, hand: 'L' },
              { n: triad(55), at: 7, dur: 0.5, vel: 0.5, hand: 'L' },
            ],
          },
        },
        {
          title: 'Ballad arpeggios',
          text: 'For anything slow: spread the chord across the bar in even eighths, from the bottom up, with the pedal changing on each chord. The harmony never stops sounding and the texture stays soft.',
          definition:
            'A ballad arpeggio plays the chord tones in rising order across the bar, usually pedalled.',
          hint: 'Rising, with the pedal down',
          highlight: [...triad(48), 55, 60],
          phrase: {
            tempo: 76,
            pedal: true,
            hits: [48, 55, 60, 64, 60, 55].map((n, i) => ({
              n,
              at: i * 0.5,
              dur: 0.5,
              vel: 0.5,
              hand: 'L' as const,
            })),
          },
        },
        {
          title: 'Off-beat comping',
          text: 'Leave beat 1 empty. Play the chord only on the off-beats and the groove lifts — this is the reggae "skank", and a mild version of it is how jazz and funk pianists comp behind a soloist.',
          definition:
            'Comping means accompanying with rhythmic chord stabs placed between the beats rather than on them.',
          hint: 'Nothing on 1 — chords on the &s',
          highlight: triad(60),
          phrase: {
            tempo: 88,
            click: 4,
            hits: [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5].map((at, i) => ({
              n: i % 2 === 0 ? triad(60) : triad(65),
              at,
              dur: 0.22,
              vel: 0.75,
            })),
          },
        },
        {
          title: 'Boogie',
          text: 'A repeating bass figure built from the root, third, fifth and sixth, walking up and back. Over a twelve-bar blues it is the whole left hand — relentless, and enormously satisfying once it is automatic.',
          definition:
            'A boogie bass line outlines 1–3–5–6–♭7–6–5–3 in steady eighths, usually swung.',
          hint: 'Walk up and back, eight to the bar',
          highlight: [48, 52, 55, 57, 58],
          phrase: {
            tempo: 128,
            swing: true,
            hits: repeat(
              seq([48, 52, 55, 57, 58, 57, 55, 52], { step: 0.5, hand: 'L', vel: 0.6 }),
              2,
            ).hits,
          },
        },
      ],
    },

    {
      title: 'Playing with a click',
      duration: '10 min',
      summary: 'Why the metronome is uncomfortable, and what to do about it.',
      steps: [
        {
          title: 'Play with the click',
          text: 'Set it slow enough that you never rush. The aim is not to follow the click but to disappear into it — when you are exactly together, you stop hearing it at all.',
          definition:
            'A metronome gives an external pulse. Practising against one exposes the places where your tempo drifts.',
          hint: 'Play along with the click',
          highlight: [60, 62, 64, 65, 67],
          phrase: {
            tempo: 84,
            click: 4,
            hits: [0, 1, 2, 3, 4, 5, 6, 7].map((at) => ({
              n: [60, 62, 64, 65, 67, 65, 64, 62][at],
              at,
              dur: 0.9,
            })),
          },
          playLabel: 'Play with the click',
        },
        {
          title: 'Click on 2 and 4',
          text: 'Once beats are steady, move the click to the backbeat — it clicks on 2 and 4 while you count 1 and 3 yourself. It is much harder, and it is what actually builds time, because you are now keeping the pulse rather than being handed it.',
          definition:
            'Setting the click on the weak beats forces you to maintain the strong ones internally.',
          hint: 'The click is on 2 and 4 — you supply 1 and 3',
          highlight: [...triad(60), 36],
          phrase: {
            tempo: 96,
            click: 2,
            hits: [
              { n: 36, at: 0, dur: 0.9, hand: 'L' },
              { n: triad(60), at: 2, dur: 0.9, hand: 'R' },
              { n: 36, at: 4, dur: 0.9, hand: 'L' },
              { n: triad(60), at: 6, dur: 0.9, hand: 'R' },
            ],
          },
        },
        {
          title: 'Rushing and dragging',
          text: 'Everyone speeds up in the loud parts and slows down in the hard ones. The click tells you which you do. The cure is not concentration — it is playing the difficult bar slowly enough that it stops being difficult.',
          definition:
            'Rushing is playing ahead of the beat; dragging is falling behind. Both are usually caused by technical difficulty, not by poor time.',
          hint: 'The hard bar is where the tempo slips',
          highlight: [60, 62, 64, 65, 67, 69, 71, 72],
          phrase: {
            tempo: 92,
            click: 4,
            hits: [
              ...[0, 1, 2, 3].map((at) => ({ n: [60, 62, 64, 65][at], at, dur: 0.9 })),
              ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({
                n: [67, 69, 71, 72, 71, 69, 67, 65][i],
                at: 4 + i * 0.5,
                dur: 0.5,
              })),
            ],
          },
          playLabel: 'Play both bars',
        },
      ],
    },
  ],
}

/** Shared with the practical unit, which reuses the same comping figure. */
export const comp = (voicing: number[], bars = 1) =>
  together({
    hits: Array.from({ length: bars * 4 }, (_, i) => ({
      n: voicing,
      at: i * 2 + 0.5,
      dur: 0.25,
      vel: 0.7,
    })),
  })
