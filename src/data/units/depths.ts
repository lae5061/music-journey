import { chord, invert, progression, seq, then, together, triad } from '../../lib/music'
import type { Unit } from '../types'

/** Third and seventh only — the two notes that define a seventh chord's quality. */
const shell = (root: number, quality: 'dominant7' | 'minor7' | 'major7') => {
  const full = triad(root, quality)
  return [full[1], full[3]]
}

/** A rootless A voicing: 3 5 7 9, with the root left to the bass. */
const rootless = (root: number, quality: 'dominant7' | 'minor7' | 'major7') => {
  const full = triad(root, quality === 'dominant7' ? 'dominant9' : quality === 'minor7' ? 'minor9' : 'major9')
  return [full[1], full[2], full[3], full[4]]
}

export const depths: Unit = {
  title: 'Optional depths',
  summary: 'Where to go once the foundations hold: jazz harmony, counterpoint, and the studio.',
  outcome: 'A map of the three directions this can lead, and enough of each to know if it appeals.',
  lessons: [
    {
      title: 'Jazz voicings and reharmonisation',
      duration: '16 min',
      summary: 'Dropping the root, stacking fourths, and changing the chords under a tune.',
      steps: [
        {
          title: 'Shell voicings',
          text: 'The root and fifth of a seventh chord carry almost no information — the bass has the root, and the fifth is implied. Keep the third and the seventh and the chord is still unmistakable, with two fingers instead of four.',
          definition:
            'A shell voicing plays only the third and seventh of a seventh chord. It is the smallest complete statement of its quality.',
          hint: 'Two notes per chord, and it still works',
          highlight: [...shell(62, 'minor7'), ...shell(67, 'dominant7'), ...shell(60, 'major7')],
          phrase: progression(
            [shell(62, 'minor7'), shell(67, 'dominant7'), shell(60, 'major7')],
            { dur: 2 },
          ),
          playLabel: 'ii–V–I in shells',
          alt: {
            label: 'Compare with full chords',
            phrase: progression(
              [triad(62, 'minor7'), triad(67, 'dominant7'), triad(60, 'major7')],
              { dur: 2 },
            ),
            highlight: [...triad(62, 'minor7'), ...triad(67, 'dominant7')],
          },
        },
        {
          title: 'Rootless voicings',
          text: 'Add the ninth and drop the root entirely: 3–5–7–9. It sits comfortably under the right hand, moves by tiny steps between chords, and leaves the bottom of the piano free for someone else.',
          definition:
            'A rootless voicing states 3, 5, 7 and 9, leaving the root to the bass. They are the standard jazz left-hand shapes.',
          hint: 'Four notes, no root, barely moving',
          highlight: [...rootless(62, 'minor7'), ...rootless(67, 'dominant7')],
          phrase: progression(
            [rootless(62, 'minor7'), rootless(67, 'dominant7'), rootless(60, 'major7')],
            { dur: 2.5 },
          ),
        },
        {
          title: 'Quartal voicings',
          text: 'Stack fourths instead of thirds and the chord loses its obvious quality — it becomes open and ambiguous, belonging to several keys at once. It is the sound of modal jazz, and it is very easy to play.',
          definition:
            'A quartal voicing stacks perfect fourths. It implies a mode rather than a specific chord.',
          hint: 'Fourths, not thirds',
          highlight: [62, 67, 72, 77],
          phrase: progression(
            [
              [62, 67, 72, 77],
              [64, 69, 74, 79],
              [60, 65, 70, 75],
            ],
            { dur: 2 },
          ),
        },
        {
          title: 'Reharmonisation',
          text: 'The same melody can sit over different chords. A tritone substitution replaces G7 with D♭7 — they share the two notes that matter — and the bass suddenly moves by a semitone instead of a fifth.',
          definition:
            'Tritone substitution replaces a dominant with the dominant a tritone away. Both share the same third and seventh.',
          hint: 'G7, then D♭7 — same tune, new bass',
          highlight: [...triad(67, 'dominant7'), ...triad(61, 'dominant7')],
          phrase: progression(
            [triad(62, 'minor7'), triad(67, 'dominant7'), triad(60, 'major7')],
            { dur: 2 },
          ),
          playLabel: 'The plain ii–V–I',
          alt: {
            label: 'With a tritone sub',
            phrase: progression(
              [triad(62, 'minor7'), triad(61, 'dominant7'), triad(60, 'major7')],
              { dur: 2 },
            ),
            highlight: [...triad(61, 'dominant7'), ...triad(60, 'major7')],
          },
          chart: {
            key: 'C major',
            time: [4, 4],
            bars: [{ chords: ['Dm7'] }, { chords: ['D♭7'] }, { chords: ['Cmaj7'] }],
            analysis: ['ii7', 'subV7', 'Imaj7'],
          },
        },
      ],
    },

    {
      title: 'Counterpoint and form',
      duration: '15 min',
      summary: 'Two melodies at once, and the shapes whole pieces are built in.',
      steps: [
        {
          title: 'Two independent lines',
          text: 'Counterpoint is not melody-plus-accompaniment: both hands play tunes, and the harmony is whatever their meeting produces. The classical rule of thumb is that they should mostly move in opposite directions.',
          definition:
            'Counterpoint combines independent melodic lines. Contrary motion keeps them distinguishable.',
          hint: 'Both hands have a tune',
          highlight: [48, 52, 55, 60, 64, 67],
          phrase: together(
            seq([55, 53, 52, 50, 48], { step: 1, dur: 0.95, hand: 'L' }),
            seq([60, 64, 65, 67, 72], { step: 1, dur: 0.95, hand: 'R' }),
          ),
          staff: {
            clef: 'grand',
            time: [4, 4],
            notes: ['C4', 'E4', 'F4', 'G4'].map((pitch) => ({ pitch, value: 1 as const })),
            bass: ['G3', 'F3', 'E3', 'D3'].map((pitch) => ({ pitch, value: 1 as const })),
          },
        },
        {
          title: 'Imitation and canon',
          text: 'The simplest counterpoint: one hand plays a phrase, the other plays the same phrase a bar later. If it still works harmonically, you have written a canon — which is how a round like Frère Jacques works.',
          definition:
            'In a canon, a second voice repeats the first at a fixed delay and interval.',
          hint: 'The left hand follows one bar behind',
          highlight: [60, 62, 64, 65],
          phrase: together(
            seq([60, 62, 64, 60], { step: 1, dur: 0.95, hand: 'R' }),
            { hits: [48, 50, 52, 48].map((n, i) => ({ n, at: 4 + i, dur: 0.95, hand: 'L' as const })) },
          ),
        },
        {
          title: 'Form',
          text: 'Most pieces are a small number of sections arranged in a pattern. Binary is AB, ternary ABA, rondo ABACA. Popular song is usually verse–chorus with a bridge. Hearing the form is what lets you memorise forty bars as four shapes.',
          definition:
            'Musical form is the arrangement of repeated and contrasting sections: AB, ABA, ABACA, verse–chorus.',
          hint: 'A, then B, then A again',
          highlight: [...triad(60), ...triad(69, 'minor')],
          phrase: then(
            progression([triad(60), triad(65)], { dur: 1.5 }),
            progression([triad(69, 'minor'), triad(64, 'minor')], { dur: 1.5 }),
            progression([triad(60), triad(65)], { dur: 1.5 }),
          ),
          playLabel: 'Play A–B–A',
          chart: {
            key: 'C major',
            time: [4, 4],
            bars: [
              { chords: ['C'], section: 'A' },
              { chords: ['F'] },
              { chords: ['Am'], section: 'B' },
              { chords: ['Em'] },
              { chords: ['C'], section: 'A' },
              { chords: ['F'] },
            ],
          },
        },
      ],
    },

    {
      title: 'Recording, MIDI and synths',
      duration: '13 min',
      summary: 'What happens when the piano stops being a piano.',
      steps: [
        {
          title: 'MIDI is not sound',
          text: 'A MIDI keyboard sends numbers — which note, how hard, when released — not audio. Something else turns those into sound. That separation is why you can record a performance and change the instrument afterwards, or fix a wrong note without replaying anything.',
          definition:
            'MIDI transmits performance data: note number, velocity, timing and controller values. The sound is generated separately.',
          hint: 'The same notes, two instruments',
          highlight: triad(60),
          phrase: progression([triad(60), triad(65), triad(67), triad(60)], { dur: 1.5 }),
          playLabel: 'Play the performance',
        },
        {
          title: 'Velocity and expression',
          text: 'Velocity is how fast the key went down, and it is the main thing that makes a MIDI performance sound human. A part played at a single velocity sounds like a machine, because it is one. Sustain arrives as a separate controller message, not as note length.',
          definition:
            'Velocity (0–127) records how hard each note was struck. Sustain is controller 64, sent as pedal down and pedal up.',
          hint: 'Flat velocity, then varied',
          highlight: [60, 62, 64, 65, 67],
          phrase: seq([60, 62, 64, 65, 67, 65, 64, 62], { step: 0.5, vel: 0.7 }),
          playLabel: 'Every note the same',
          alt: {
            label: 'With real dynamics',
            phrase: {
              hits: [60, 62, 64, 65, 67, 65, 64, 62].map((n, i) => ({
                n,
                at: i * 0.5,
                dur: 0.5,
                vel: [0.55, 0.62, 0.72, 0.68, 0.9, 0.65, 0.58, 0.48][i],
              })),
            },
            highlight: [60, 62, 64, 65, 67],
          },
        },
        {
          title: 'Synthesis basics',
          text: 'A synthesiser builds a sound from an oscillator — a raw waveform — shaped by a filter and an envelope. The envelope is the whole difference between a piano and an organ: one decays the moment it is struck, the other holds until released.',
          definition:
            'Subtractive synthesis: an oscillator produces harmonics, a filter removes some, and an envelope controls how the level changes over time.',
          hint: 'The same chord, struck and sustained',
          highlight: triad(60),
          phrase: chord(triad(60), { dur: 3 }),
          playLabel: 'Hear the envelope',
        },
        {
          title: 'Recording yourself',
          text: 'The most useful piece of studio equipment is any recorder at all. You do not hear your own playing accurately while you are doing it — the tempo drift, the uneven left hand and the lost phrase endings only become obvious on playback.',
          definition:
            'Recording provides the objective feedback that practice otherwise lacks. Listen back once, take one note, and move on.',
          hint: 'Play something, then listen to it',
          highlight: [...triad(60), ...triad(67)],
          phrase: together(
            progression([triad(48), invert(triad(55), 1)], { dur: 4, hand: 'L', vel: 0.45 }),
            seq([64, 67, 72, 71], { step: 2, dur: 1.8, hand: 'R' }),
          ),
        },
      ],
    },
  ],
}
