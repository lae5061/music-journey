import {
  chord,
  invert,
  progression,
  scale,
  seq,
  then,
  together,
  transpose,
  triad,
} from '../../lib/music'
import type { Unit } from '../types'

/** A rootless left-hand voicing: the bass player has the root, so you keep 3rd and 7th. */
const shell = (root: number, seventh: 'dominant7' | 'minor7' | 'major7') => {
  const full = triad(root, seventh)
  return [full[1], full[3]] // third and seventh only
}

const TWELVE_BAR = [
  'C7', 'F7', 'C7', 'C7',
  'F7', 'F7', 'C7', 'C7',
  'G7', 'F7', 'C7', 'G7',
]

export const practical: Unit = {
  title: 'Practical skills',
  summary: 'Turning what you know into playing: charts, reading, ears, keys and invention.',
  outcome: 'You can pick up a chord chart, work out a song by ear, and play it in any key.',
  lessons: [
    {
      title: 'Lead sheets and chord charts',
      duration: '15 min',
      summary: 'How most working music is actually written down — and what it leaves to you.',
      steps: [
        {
          title: 'What a lead sheet gives you',
          text: 'A melody, a set of chord symbols, and nothing else. No left-hand part, no rhythm, no voicing — those are your decisions. It is a specification, not a score, and learning to read one is what lets you play with other people.',
          definition:
            'A lead sheet carries the melody, the chord symbols and the lyrics. The accompaniment is left to the player.',
          hint: 'Four bars of chords — play whatever fits',
          highlight: [...triad(60), ...triad(69, 'minor'), ...triad(65), ...triad(67)],
          phrase: progression([triad(60), triad(69, 'minor'), triad(65), triad(67)], { dur: 2 }),
          chart: {
            title: 'A plain four-bar turn',
            key: 'C major',
            time: [4, 4],
            tempo: 'Medium',
            bars: [
              { chords: ['C'] },
              { chords: ['Am'] },
              { chords: ['F'] },
              { chords: ['G'] },
            ],
            analysis: ['I', 'vi', 'IV', 'V'],
          },
        },
        {
          title: 'Reading chord symbols',
          text: 'The letter is the root. Nothing after it means a major triad. A small m means minor; 7 means a dominant seventh; maj7 the major seventh; m7 the minor seventh. A slash — C/E — means play the chord over that bass note, which is just an inversion written out.',
          definition:
            'Chord symbol grammar: root, quality, extension, then an optional slash bass. C, Cm, C7, Cmaj7, Cm7, C/E.',
          hint: 'Five symbols, five chords',
          highlight: triad(60, 'major7'),
          phrase: progression(
            [
              triad(60),
              triad(60, 'minor'),
              triad(60, 'dominant7'),
              triad(60, 'major7'),
              invert(triad(60), 1),
            ],
            { dur: 1.5 },
          ),
          playLabel: 'C, Cm, C7, Cmaj7, C/E',
        },
        {
          title: 'Playing from a chart',
          text: 'Left hand takes a simple voicing near middle C, right hand plays the melody or comps. Do not try to play every note of every chord — three notes is usually plenty, and the bass and the third carry most of the information.',
          definition:
            'A workable default: left hand root and seventh (or root and third), right hand melody or rhythm.',
          hint: 'Sparse left hand, melody on top',
          highlight: [...shell(48, 'dominant7'), 60, 64, 67],
          phrase: together(
            progression(
              [shell(48, 'dominant7'), shell(53, 'dominant7'), shell(48, 'dominant7')],
              { dur: 4, hand: 'L', vel: 0.5 },
            ),
            seq([67, 64, 65, 64, 60], { step: 2, dur: 1.8, hand: 'R' }),
          ),
        },
        {
          title: 'The twelve-bar blues',
          text: 'The most-played chord chart in existence: three chords, twelve bars, a fixed shape. Learn it in C and you can sit in with almost anyone, in any key, for the rest of your life.',
          definition:
            'Twelve-bar blues: four bars of I, two of IV, two of I, then V, IV, I and a turnaround on V. All chords are dominant sevenths.',
          hint: 'Twelve bars, three chords',
          highlight: [...triad(60, 'dominant7'), ...triad(65, 'dominant7'), ...triad(67, 'dominant7')],
          phrase: {
            tempo: 120,
            swing: true,
            hits: TWELVE_BAR.slice(0, 8).flatMap((symbol, bar) => {
              const root = symbol.startsWith('C') ? 48 : symbol.startsWith('F') ? 53 : 55
              return [
                { n: root, at: bar * 2, dur: 0.5, vel: 0.6, hand: 'L' as const },
                { n: triad(root + 12, 'dominant7'), at: bar * 2 + 1, dur: 0.4, vel: 0.5, hand: 'R' as const },
              ]
            }),
          },
          chart: {
            title: 'Twelve-bar blues',
            key: 'C',
            time: [4, 4],
            tempo: 'Medium swing',
            bars: TWELVE_BAR.map((symbol, i) => ({
              chords: [symbol],
              section: i === 0 ? 'Head' : i === 8 ? 'Turnaround' : undefined,
            })),
            analysis: ['I7', 'IV7', 'I7', 'I7', 'IV7', 'IV7', 'I7', 'I7', 'V7', 'IV7', 'I7', 'V7'],
          },
        },
      ],
    },

    {
      title: 'Sight-reading',
      duration: '13 min',
      summary: 'Playing something you have never seen, without stopping.',
      steps: [
        {
          title: 'Read shapes, not notes',
          text: 'Nobody reads note by note at speed. You read intervals and contours: this leaps a third, that steps down four. Recognising that a bar is a rising C arpeggio is one act of reading, not four.',
          definition:
            'Fluent reading is pattern recognition — scales, arpeggios and repeated figures read as single units.',
          hint: 'A rising arpeggio, read as one shape',
          highlight: [60, 64, 67, 72],
          phrase: seq([60, 64, 67, 72], { step: 0.5 }),
          staff: {
            clef: 'treble',
            time: [4, 4],
            notes: ['C4', 'E4', 'G4', 'C5'].map((pitch) => ({ pitch, value: 1 as const })),
          },
        },
        {
          title: 'Keep going',
          text: 'The one rule: do not stop. A wrong note that keeps time is better than a right note that breaks the bar. When you lose your place, leave out the left hand and keep the melody going — you can always add detail back.',
          definition:
            'In sight-reading, continuity takes priority over accuracy. Stopping to correct is the habit that has to be unlearned.',
          hint: 'Play through it once without stopping',
          highlight: scale(60, 'major'),
          phrase: {
            tempo: 76,
            click: 4,
            hits: [
              { n: 60, at: 0, dur: 1 },
              { n: 64, at: 1, dur: 1 },
              { n: 65, at: 2, dur: 0.5 },
              { n: 67, at: 2.5, dur: 0.5 },
              { n: 69, at: 3, dur: 1 },
              { n: 67, at: 4, dur: 2 },
              { n: 64, at: 6, dur: 2 },
            ],
          },
          staff: {
            clef: 'treble',
            time: [4, 4],
            notes: [
              { pitch: 'C4', value: 1 },
              { pitch: 'E4', value: 1 },
              { pitch: 'F4', value: 0.5 },
              { pitch: 'G4', value: 0.5 },
              { pitch: 'A4', value: 1 },
              { pitch: 'G4', value: 2 },
              { pitch: 'E4', value: 2 },
            ],
          },
        },
        {
          title: 'Look before you play',
          text: 'Thirty seconds of scanning saves a minute of floundering. Check the key signature, the time signature, the hardest bar, and where the hands have to move. Then set a tempo slow enough for that hardest bar, not for the easiest.',
          definition:
            'Pre-reading means surveying key, metre, range and the difficult passages before starting, and choosing a tempo the whole piece can hold.',
          hint: 'Two sharps — that is D major',
          highlight: scale(62, 'major'),
          phrase: seq(scale(62, 'major'), { step: 0.5 }),
          staff: {
            clef: 'grand',
            key: 2,
            time: [3, 4],
            notes: [
              { pitch: 'F#4', value: 1 },
              { pitch: 'A4', value: 1 },
              { pitch: 'D5', value: 1 },
              { pitch: 'C#5', value: 2 },
              { pitch: 'A4', value: 1 },
            ],
            bass: [
              { pitch: 'D3', value: 3 },
              { pitch: 'A2', value: 3 },
            ],
          },
        },
      ],
    },

    {
      title: 'Ear training',
      duration: '16 min',
      summary: 'Recognising intervals, chords and progressions without looking.',
      steps: [
        {
          title: 'Anchor intervals to songs',
          text: 'The fastest way in is to hook each interval to a tune you already know. A rising perfect fifth opens Twinkle Twinkle. A rising major sixth opens My Bonnie. An octave opens Somewhere Over the Rainbow. Use them until you no longer need them.',
          definition:
            'Reference songs give each interval a memorable handle, bridging the gap until recognition becomes direct.',
          hint: 'A fifth, a sixth, an octave',
          highlight: [60, 67, 69, 72],
          phrase: then(
            chord([60, 67], { dur: 1.5 }),
            chord([60, 69], { dur: 1.5 }),
            chord([60, 72], { dur: 2 }),
          ),
          playLabel: 'Fifth, sixth, octave',
        },
        {
          title: 'Intervals by ear',
          text: 'Two notes, one after the other. Name the distance. Start with the wide ones — they are far easier than the narrow ones.',
          definition:
            'Melodic intervals are heard in sequence; harmonic intervals together. Melodic is easier to start with.',
          hint: 'Listen, then name it',
          quiz: {
            prompt: 'Which interval?',
            options: ['Major 2nd', 'Major 3rd', 'Perfect 4th', 'Perfect 5th', 'Major 6th', 'Octave'],
            target: 5,
            questions: [
              { phrase: seq([60, 62], { step: 1 }), answer: 'Major 2nd' },
              { phrase: seq([60, 64], { step: 1 }), answer: 'Major 3rd' },
              { phrase: seq([60, 65], { step: 1 }), answer: 'Perfect 4th' },
              { phrase: seq([60, 67], { step: 1 }), answer: 'Perfect 5th' },
              { phrase: seq([60, 69], { step: 1 }), answer: 'Major 6th' },
              { phrase: seq([60, 72], { step: 1 }), answer: 'Octave' },
              { phrase: seq([65, 72], { step: 1 }), answer: 'Perfect 5th' },
              { phrase: seq([62, 66], { step: 1 }), answer: 'Major 3rd' },
            ],
          },
        },
        {
          title: 'Progressions by ear',
          text: 'Harder, and far more useful. You are listening for the bass line and for whether each chord feels like home, away, or on the way back. Four bars at a time is plenty.',
          definition:
            'Recognising a progression means hearing each chord’s function — tonic, subdominant, dominant — rather than its letter name.',
          hint: 'Where does the bass go?',
          quiz: {
            prompt: 'Which progression was that?',
            options: ['I–IV–V–I', 'I–V–vi–IV', 'ii–V–I', 'I–vi–IV–V'],
            target: 3,
            questions: [
              {
                phrase: progression([triad(60), triad(65), triad(67), triad(60)], { dur: 1.2 }),
                answer: 'I–IV–V–I',
              },
              {
                phrase: progression([triad(60), triad(67), triad(69, 'minor'), triad(65)], { dur: 1.2 }),
                answer: 'I–V–vi–IV',
              },
              {
                phrase: progression(
                  [triad(62, 'minor7'), triad(67, 'dominant7'), triad(60, 'major7')],
                  { dur: 1.4 },
                ),
                answer: 'ii–V–I',
              },
              {
                phrase: progression([triad(60), triad(69, 'minor'), triad(65), triad(67)], { dur: 1.2 }),
                answer: 'I–vi–IV–V',
              },
            ],
          },
        },
      ],
    },

    {
      title: 'Transposition',
      duration: '12 min',
      summary: 'Moving a song to a key that suits the singer — or your hands.',
      steps: [
        {
          title: 'Move the numbers, not the letters',
          text: 'If you learned the song as I–V–vi–IV, transposing is trivial: work out the new key’s I, V, vi and IV and play those. If you learned it as C–G–Am–F you have to do arithmetic on every chord, every time.',
          definition:
            'Transposition means shifting every pitch by the same interval. Thinking in scale degrees makes it automatic.',
          hint: 'The same shape, three semitones up',
          highlight: [...triad(60), ...triad(63)],
          phrase: progression([triad(60), triad(67), triad(69, 'minor'), triad(65)], { dur: 1.4 }),
          playLabel: 'In C',
          alt: {
            label: 'In E♭',
            phrase: transpose(
              progression([triad(60), triad(67), triad(69, 'minor'), triad(65)], { dur: 1.4 }),
              3,
            ),
            highlight: [...triad(63), ...triad(70)],
          },
        },
        {
          title: 'Transposing a melody',
          text: 'Same idea for a tune: keep the intervals, change the starting note. Play it in C, then start on F and follow the same shape. What your fingers do changes; what the ear hears does not.',
          definition:
            'A transposed melody preserves every interval, so its contour and character are unchanged.',
          hint: 'The same tune, up a fourth',
          highlight: [60, 62, 64, 65, 67],
          phrase: seq([60, 62, 64, 62, 60, 67, 65, 64], { step: 0.5 }),
          playLabel: 'In C',
          alt: {
            label: 'In F',
            phrase: transpose(seq([60, 62, 64, 62, 60, 67, 65, 64], { step: 0.5 }), 5),
            highlight: [65, 67, 69, 70, 72],
          },
        },
        {
          title: 'Why singers ask',
          text: 'Most transposition requests are about vocal range: the tune is fine but sits two notes too high. Moving down a tone or a minor third usually fixes it. Knowing three or four keys well is more useful than knowing all twelve badly.',
          definition:
            'Comfortable vocal ranges are roughly an octave and a half. Shifting a song by a tone or two usually brings it into range.',
          hint: 'The same phrase, dropped a tone',
          highlight: [67, 69, 71, 72],
          phrase: seq([72, 71, 69, 67, 69, 71, 72], { step: 0.5 }),
          playLabel: 'Original',
          alt: {
            label: 'Down a tone',
            phrase: transpose(seq([72, 71, 69, 67, 69, 71, 72], { step: 0.5 }), -2),
            highlight: [65, 67, 69, 70],
          },
        },
      ],
    },

    {
      title: 'Memorisation',
      duration: '11 min',
      summary: 'Four kinds of memory, and why relying on one of them fails on stage.',
      steps: [
        {
          title: 'Muscle memory is not enough',
          text: 'Your fingers will learn a piece on their own, and that memory is fast, reliable and completely brittle: one interruption and there is nowhere to restart from. It is necessary and it is never sufficient.',
          definition:
            'Kinaesthetic (muscle) memory recalls the physical sequence. It fails catastrophically when broken mid-stream.',
          hint: 'Play it, then try starting from bar 2',
          highlight: scale(60, 'major'),
          phrase: seq([60, 62, 64, 65, 67, 69, 71, 72], { step: 0.5 }),
        },
        {
          title: 'Know what it is made of',
          text: 'Analytical memory is the antidote: knowing the piece is in D, that bar 9 is where it goes to the relative minor, that the left hand is an Alberti bass on I and V. With that you can restart anywhere, because you know what should be happening.',
          definition:
            'Analytical memory stores the structure — keys, chords, form — rather than the sequence of movements.',
          hint: 'I, then vi, then IV, then V',
          highlight: [...triad(60), ...triad(69, 'minor')],
          phrase: progression([triad(60), triad(69, 'minor'), triad(65), triad(67)], { dur: 1.5 }),
          chart: {
            key: 'C major',
            time: [4, 4],
            bars: [{ chords: ['C'] }, { chords: ['Am'] }, { chords: ['F'] }, { chords: ['G'] }],
            analysis: ['I', 'vi', 'IV', 'V'],
          },
        },
        {
          title: 'Practise starting in the middle',
          text: 'Pick five or six restart points and practise beginning from each cold. If you can start from any of them without the run-up, the piece is actually memorised. If you can only start from the beginning, it is not.',
          definition:
            'Distributed restart points turn a single fragile chain into several independent entries.',
          hint: 'Start from the fifth note, not the first',
          highlight: [67, 69, 71, 72],
          phrase: seq([67, 69, 71, 72], { step: 0.5 }),
          playLabel: 'From the middle',
        },
      ],
    },

    {
      title: 'Improvisation and comping',
      duration: '15 min',
      summary: 'Making something up that fits — starting from five notes.',
      steps: [
        {
          title: 'Start with the pentatonic',
          text: 'Over a C chord, every note of the C major pentatonic works. That is the point of it: you cannot play a wrong note, so you are free to think about rhythm and shape instead of pitch.',
          definition:
            'The pentatonic removes the two notes most likely to clash, leaving five that fit the chord in any order.',
          hint: 'Five notes, any order, over one chord',
          highlight: scale(72, 'majorPentatonic'),
          phrase: together(
            progression([triad(48), triad(48)], { dur: 4, hand: 'L', vel: 0.45 }),
            {
              hits: [72, 76, 74, 79, 77, 74, 72, 69].map((n, i) => ({
                n,
                at: i * 0.5 + (i > 3 ? 1 : 0),
                dur: 0.45,
                hand: 'R' as const,
              })),
            },
          ),
        },
        {
          title: 'Play the rhythm first',
          text: 'Most weak improvising is rhythmically flat, not harmonically wrong. Try inventing on a single note — only the rhythm changes — until the phrases have shape. Then add pitches back.',
          definition:
            'A phrase’s identity comes largely from its rhythm. Interesting rhythm on few notes beats dull rhythm on many.',
          hint: 'One note, played with intent',
          highlight: [67],
          phrase: {
            tempo: 104,
            swing: true,
            hits: [
              { n: 67, at: 0.5, dur: 0.4, vel: 0.85 },
              { n: 67, at: 1, dur: 0.4, vel: 0.5 },
              { n: 67, at: 2.5, dur: 0.4, vel: 0.9 },
              { n: 67, at: 3, dur: 0.9, vel: 0.6 },
              { n: 67, at: 4.5, dur: 0.4, vel: 0.85 },
              { n: 67, at: 5.5, dur: 1.5, vel: 0.7 },
            ],
          },
        },
        {
          title: 'Target the chord tones',
          text: 'The trick that makes lines sound intentional: land on a chord tone when the chord changes. Everything between can be passing notes. Aim for the third of the new chord on beat 1 and the line will sound like it was written.',
          definition:
            'Chord-tone targeting places a root, third, fifth or seventh on the strong beat of each chord change.',
          hint: 'The strong beats land on chord tones',
          highlight: [...triad(60), ...triad(65)],
          phrase: together(
            progression([triad(48), triad(53)], { dur: 4, hand: 'L', vel: 0.45 }),
            {
              hits: [
                { n: 64, at: 0, dur: 0.5, hand: 'R' as const, vel: 0.9 },
                { n: 65, at: 0.5, dur: 0.5, hand: 'R' as const, vel: 0.6 },
                { n: 67, at: 1, dur: 0.5, hand: 'R' as const, vel: 0.6 },
                { n: 69, at: 1.5, dur: 0.5, hand: 'R' as const, vel: 0.6 },
                { n: 72, at: 2, dur: 1, hand: 'R' as const, vel: 0.7 },
                { n: 71, at: 3, dur: 1, hand: 'R' as const, vel: 0.6 },
                { n: 69, at: 4, dur: 2, hand: 'R' as const, vel: 0.9 },
              ],
            },
          ),
        },
        {
          title: 'Comping behind someone else',
          text: 'When another player has the tune, your job is to state the harmony and stay out of the way. Short chords, off the beat, in the middle register, leaving gaps. If you are playing more than half the time, you are playing too much.',
          definition:
            'Comping supports a soloist with intermittent chords, usually voiced between the staves and rhythmically sparse.',
          hint: 'Short, off-beat, and not too often',
          highlight: [...shell(60, 'minor7'), ...shell(65, 'dominant7')],
          phrase: {
            tempo: 116,
            swing: true,
            hits: [
              { n: shell(62, 'minor7'), at: 0.5, dur: 0.3, vel: 0.65 },
              { n: shell(62, 'minor7'), at: 2.5, dur: 0.3, vel: 0.55 },
              { n: shell(67, 'dominant7'), at: 4.5, dur: 0.3, vel: 0.7 },
              { n: shell(60, 'major7'), at: 7, dur: 1, vel: 0.6 },
            ],
          },
        },
      ],
    },

    {
      title: 'Playing by ear',
      duration: '14 min',
      summary: 'Working a song out from a recording, in the order that actually works.',
      steps: [
        {
          title: 'Find the bass note first',
          text: 'Not the melody — the bass. It tells you the root of every chord, and once you have the roots the chords are mostly guessable. Hum along with the lowest thing you can hear and find it on the keyboard.',
          definition:
            'The bass line outlines the harmony. Identifying it converts an unknown song into a chord chart.',
          hint: 'Four bass notes — what are the chords?',
          highlight: [48, 55, 57, 53],
          phrase: seq([48, 55, 57, 53], { step: 2, dur: 1.8 }),
          playLabel: 'Hear the bass line',
          alt: {
            label: 'Now with chords',
            phrase: progression([triad(48), triad(55), triad(57, 'minor'), triad(53)], { dur: 2 }),
            highlight: [48, 55, 57, 53],
          },
        },
        {
          title: 'Find the key',
          text: 'Play a few candidate notes against the recording until one sounds like home. That is your tonic. Then the bass notes convert to scale degrees, and the progression becomes numerals you already recognise.',
          definition:
            'The tonic is the note that sounds most at rest against the music. Finding it converts pitches into functions.',
          hint: 'Which note sounds like home?',
          highlight: [60],
          phrase: then(
            progression([triad(60), triad(65), triad(67)], { dur: 1.2 }),
            chord(triad(60), { dur: 2 }),
          ),
        },
        {
          title: 'Then the melody',
          text: 'With the harmony in place the melody is far easier, because most of its notes are chord tones. Work in two-bar chunks, sing before you play, and accept that the first pass will be approximately right — that is normal.',
          definition:
            'Melody notes are predominantly chord tones on strong beats, which narrows the search considerably.',
          hint: 'The tune over the chords you found',
          highlight: [64, 65, 67, 69],
          phrase: together(
            progression([triad(48), triad(53)], { dur: 4, hand: 'L', vel: 0.45 }),
            seq([67, 65, 64, 65, 69, 67], { step: 1, dur: 0.9, hand: 'R' }),
          ),
        },
      ],
    },
  ],
}
