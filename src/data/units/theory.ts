import {
  chord,
  CIRCLE_OF_FIFTHS,
  diatonicTriads,
  invert,
  progression,
  ROMAN_NUMERALS_MAJOR,
  scale,
  seq,
  then,
  together,
  triad,
} from '../../lib/music'
import type { Unit } from '../types'

const C = 60
const cMajorTriads = diatonicTriads(C)

export const theory: Unit = {
  title: 'Theory',
  summary: 'Why the notes you are playing belong together, from two-note intervals to modulation.',
  outcome: 'You can build any chord, name any key, and explain what a progression is doing.',
  lessons: [
    {
      title: 'Intervals',
      duration: '16 min',
      summary: 'The distance between two notes — counted in letters, qualified in semitones.',
      steps: [
        {
          title: 'The half step',
          text: 'A half step is the distance between any key and its immediate neighbour, black or white. C to C♯ is a half step. It is the smallest move the keyboard can make.',
          definition:
            'The half step (semitone) is the smallest interval on the piano. There are twelve in an octave.',
          hint: 'C → C♯',
          highlight: [60, 61],
          phrase: seq([60, 61], { step: 1 }),
        },
        {
          title: 'The whole step, and the two exceptions',
          text: 'A whole step skips one key: C to D, because C♯ sits between them. But E to F and B to C have no key between them — those white-to-white moves are half steps. That asymmetry is what gives every scale its character.',
          definition:
            'A whole step (tone) equals two half steps. Adjacent white keys are a whole step apart except E–F and B–C.',
          hint: 'C → D is a whole step; E → F is a half',
          highlight: [60, 62, 64, 65, 71, 72],
          phrase: then(seq([60, 62], { step: 1 }), seq([64, 65], { step: 1 }), seq([71, 72], { step: 1 })),
        },
        {
          title: 'Counting an interval',
          text: 'Count letter names from the lower note to the upper, including both. C to E is C–D–E: three letters, so it is a third. The number never changes — only its quality does.',
          definition:
            'An interval is the distance between two pitches, named by the number of letter names it spans.',
          hint: 'C and E — a third',
          highlight: [60, 64],
          phrase: chord([60, 64]),
          playLabel: 'Play the third',
        },
        {
          title: 'Major, minor and perfect',
          text: 'C to E spans four semitones: a major third. C to E♭ spans three: a minor third. Seconds, thirds, sixths and sevenths come in major and minor. Unisons, fourths, fifths and octaves come only as perfect — or, altered, augmented and diminished.',
          definition:
            'Major third = 4 semitones. Minor third = 3. Perfect fifth = 7. Perfect intervals are neither major nor minor.',
          hint: 'Compare C–E and C–E♭',
          highlight: [60, 63, 64, 67],
          phrase: then(chord([60, 64], { dur: 1.5 }), chord([60, 63], { dur: 1.5 }), chord([60, 67], { dur: 2 })),
          playLabel: 'Major 3rd, minor 3rd, perfect 5th',
        },
        {
          title: 'Name the interval',
          text: 'Two notes at once. Name the distance. The fifth is the easiest to learn first — it is the one that sounds hollow and stable.',
          definition:
            'Recognising intervals by ear is the single most transferable skill in music. Everything else builds on it.',
          hint: 'Listen, then name the distance',
          quiz: {
            prompt: 'What interval was that?',
            options: ['Minor 3rd', 'Major 3rd', 'Perfect 4th', 'Perfect 5th', 'Octave'],
            target: 4,
            questions: [
              { phrase: chord([60, 63]), answer: 'Minor 3rd' },
              { phrase: chord([60, 64]), answer: 'Major 3rd' },
              { phrase: chord([60, 65]), answer: 'Perfect 4th' },
              { phrase: chord([60, 67]), answer: 'Perfect 5th' },
              { phrase: chord([60, 72]), answer: 'Octave' },
              { phrase: chord([65, 69]), answer: 'Major 3rd' },
              { phrase: chord([62, 69]), answer: 'Perfect 5th' },
              { phrase: chord([64, 67]), answer: 'Minor 3rd' },
            ],
          },
        },
      ],
    },

    {
      title: 'Keys and key signatures',
      duration: '15 min',
      summary: 'One formula, twelve starting notes, and the shorthand at the front of the stave.',
      steps: [
        {
          title: 'The major scale formula',
          text: 'A major scale is a fixed pattern of steps: whole, whole, half, whole, whole, whole, half. Start on C and follow it — you land only on white keys. That is the only reason C major looks simple.',
          definition:
            'Major scale: W–W–H–W–W–W–H. Eight notes, the last repeating the first an octave higher.',
          hint: 'C major — play it ascending',
          highlight: scale(60, 'major'),
          phrase: seq(scale(60, 'major'), { step: 0.5 }),
        },
        {
          title: 'Same formula, new start',
          text: 'Apply W–W–H–W–W–W–H starting on G and the seventh note has to be F♯ — the white F would give a whole step where the formula wants a half. The shape of the sound is identical; only the spelling changes.',
          definition:
            'Every major scale uses the same step formula. The sharps and flats exist to make the pattern fit from a different starting note.',
          hint: 'G major — note the F♯',
          highlight: scale(67, 'major'),
          phrase: seq(scale(67, 'major'), { step: 0.5 }),
          staff: {
            clef: 'treble',
            key: 1,
            notes: ['G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F#5', 'G5'].map((pitch) => ({
              pitch,
              value: 1 as const,
            })),
          },
        },
        {
          title: 'The key signature',
          text: 'Rather than write F♯ every time it appears, the sharp goes once at the front of the stave and applies to every F in the piece. That block of sharps or flats is the key signature, and reading it tells you the key before you play a note.',
          definition:
            'A key signature places the accidentals of the key at the start of every stave, applying to those letters in all octaves.',
          hint: 'One sharp at the front means G major',
          highlight: scale(67, 'major'),
          phrase: seq(scale(67, 'major'), { step: 0.5 }),
          staff: {
            clef: 'grand',
            key: 1,
            time: [4, 4],
            notes: [
              { pitch: 'G4', value: 2 },
              { pitch: 'B4', value: 2 },
              { pitch: 'D5', value: 4 },
            ],
            bass: [{ pitch: 'G2', value: 4 }, { pitch: 'G2', value: 4 }],
          },
        },
        {
          title: 'Relative minors',
          text: 'Every key signature belongs to two keys — one major and one minor. Start the same notes on the sixth degree instead of the first and you get the relative minor: A minor shares C major’s empty key signature, and its sound is entirely different.',
          definition:
            'The relative minor begins on the sixth degree of the major scale and uses exactly the same notes and key signature.',
          hint: 'The same seven notes, started from A',
          highlight: scale(69, 'naturalMinor'),
          phrase: then(seq(scale(60, 'major'), { step: 0.4 }), seq(scale(69, 'naturalMinor'), { step: 0.4 })),
          playLabel: 'C major, then A minor',
        },
      ],
    },

    {
      title: 'The circle of fifths',
      duration: '13 min',
      summary: 'The map that puts all twelve keys in order and explains the key signatures.',
      steps: [
        {
          title: 'Fifths all the way round',
          text: 'Start on C and keep going up a fifth: C, G, D, A, E, B… After twelve fifths you arrive back at C. Each step adds one sharp; going the other way — down a fifth — adds one flat.',
          definition:
            'The circle of fifths arranges the twelve keys so that neighbours differ by one accidental.',
          hint: 'Each key is a fifth above the last',
          diagram: 'circle-of-fifths',
          highlight: [60, 67, 74, 81],
          phrase: seq([60, 67, 62, 69, 64, 71, 66], { step: 0.6 }),
          playLabel: 'Climb in fifths',
        },
        {
          title: 'Reading a key signature',
          text: 'One sharp is G, two is D, three is A — the order of sharps is always F C G D A E B, and the key is a semitone above the last sharp. For flats, the order reverses and the key is the second-to-last flat.',
          definition:
            'Sharps appear in the order F C G D A E B; flats in the reverse. The last sharp is the leading note of the key.',
          hint: 'Two sharps means D major',
          highlight: scale(62, 'major'),
          phrase: seq(scale(62, 'major'), { step: 0.5 }),
          staff: {
            clef: 'treble',
            key: 2,
            notes: ['D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C#5', 'D5'].map((pitch) => ({
              pitch,
              value: 1 as const,
            })),
          },
        },
        {
          title: 'Why it matters',
          text: 'Neighbours on the circle share almost all their notes, so music moves easily between them. A piece in C will visit G and F far more readily than it visits F♯. The circle is not a curiosity — it is a map of which keys are next door.',
          definition:
            'Keys adjacent on the circle are closely related: they share six of seven notes, and modulation between them is smooth.',
          hint: 'C to G to C — a step and back',
          highlight: [...triad(60), ...triad(67)],
          phrase: progression([triad(60), triad(67), triad(65), triad(60)], { dur: 1.5 }),
          diagram: 'circle-of-fifths',
        },
        {
          title: 'How many sharps or flats?',
          text: 'Say the key, count the accidentals. The four at the top of the circle are worth knowing cold — they cover most of the repertoire you will meet early on.',
          definition:
            'C has none; G one sharp; D two; A three; F one flat; B♭ two; E♭ three.',
          hint: 'Name the key signature',
          quiz: {
            prompt: 'How many sharps or flats does this key have?',
            options: ['None', '1 sharp', '2 sharps', '3 sharps', '1 flat', '2 flats'],
            questions: CIRCLE_OF_FIFTHS.filter((k) => Math.abs(k.accidentals) <= 3).map((k) => ({
              shown: `${k.major} major`,
              answer:
                k.accidentals === 0
                  ? 'None'
                  : k.accidentals > 0
                    ? `${k.accidentals} sharp${k.accidentals > 1 ? 's' : ''}`
                    : `${-k.accidentals} flat${k.accidentals < -1 ? 's' : ''}`,
            })),
          },
        },
      ],
    },

    {
      title: 'Building chords',
      duration: '16 min',
      summary: 'Triads, sevenths and extensions — all of it stacked thirds.',
      steps: [
        {
          title: 'The major triad',
          text: 'Take degrees 1, 3 and 5 of the major scale — C, E, G — and play them together. That is a C major triad: a major third with a minor third stacked on top.',
          definition:
            'A triad is a three-note chord built from a root, a third and a fifth. Major triad: major third + minor third.',
          hint: 'C – E – G together',
          highlight: triad(60),
          phrase: chord(triad(60)),
        },
        {
          title: 'Minor, diminished, augmented',
          text: 'Lower the third and it is minor. Lower the fifth as well and it is diminished — tense and unresolved. Raise the fifth of a major triad instead and it is augmented. Four qualities, all from moving one or two notes.',
          definition:
            'Major 4+3 semitones, minor 3+4, diminished 3+3, augmented 4+4, measured from the root.',
          hint: 'Major, minor, diminished, augmented',
          highlight: [60, 63, 64, 66, 67, 68],
          phrase: progression(
            [triad(60, 'major'), triad(60, 'minor'), triad(60, 'diminished'), triad(60, 'augmented')],
            { dur: 1.5 },
          ),
          playLabel: 'Play all four',
        },
        {
          title: 'Sevenths',
          text: 'Stack another third on top and you have a seventh chord. The dominant seventh — major triad with a flat seventh — is the restless one that wants to resolve. The major seventh is the soft, floating one; the minor seventh is the neutral workhorse of pop and jazz.',
          definition:
            'Dominant 7th: major triad + ♭7. Major 7th: major triad + ♮7. Minor 7th: minor triad + ♭7.',
          hint: 'Maj7, min7, dominant 7',
          highlight: [60, 62, 64, 67, 69, 70, 71],
          phrase: progression(
            [triad(60, 'major7'), triad(60, 'minor7'), triad(60, 'dominant7')],
            { dur: 2 },
          ),
          playLabel: 'Play the three sevenths',
          staff: {
            clef: 'treble',
            notes: [{ pitch: 'C4', value: 4 }],
          },
        },
        {
          title: 'Extensions',
          text: 'Keep stacking: the ninth, eleventh and thirteenth are just the second, fourth and sixth an octave higher. They add colour without changing what the chord is doing. In practice you drop notes — nobody plays all seven.',
          definition:
            'Extensions are chord tones above the seventh: 9, 11 and 13. They are usually added to seventh chords, with the fifth or root omitted.',
          hint: 'A plain seventh, then the same chord with a ninth',
          highlight: triad(60, 'dominant9'),
          phrase: then(chord(triad(60, 'dominant7'), { dur: 2 }), chord(triad(60, 'dominant9'), { dur: 3 })),
          playLabel: 'C7, then C9',
        },
        {
          title: 'Major or minor?',
          text: 'One chord at a time. Major is bright, minor is dark — the whole difference is one note, and it is the easiest discrimination in music to hear once you know what you are listening for.',
          definition:
            'The third of the chord decides its quality. Everything else can move without changing major to minor.',
          hint: 'Listen to the middle note',
          quiz: {
            prompt: 'Which chord was that?',
            options: ['Major', 'Minor', 'Diminished', 'Dominant 7th'],
            target: 4,
            questions: [
              { phrase: chord(triad(60, 'major')), answer: 'Major' },
              { phrase: chord(triad(60, 'minor')), answer: 'Minor' },
              { phrase: chord(triad(65, 'major')), answer: 'Major' },
              { phrase: chord(triad(62, 'minor')), answer: 'Minor' },
              { phrase: chord(triad(59, 'diminished')), answer: 'Diminished' },
              { phrase: chord(triad(67, 'dominant7')), answer: 'Dominant 7th' },
              { phrase: chord(triad(69, 'minor')), answer: 'Minor' },
            ],
          },
        },
      ],
    },

    {
      title: 'Inversions and voice leading',
      duration: '16 min',
      summary: 'Rearranging a chord so the hand barely has to move — and why that sounds better.',
      steps: [
        {
          title: 'Same chord, different bottom note',
          text: 'C–E–G is a C major triad in root position. Move the C up an octave and you get E–G–C: first inversion. Move the E up too and you get G–C–E: second inversion. Still a C major chord — just repacked.',
          definition:
            'An inversion rearranges a chord so a note other than the root is lowest. A triad has two inversions.',
          hint: 'Root, first inversion, second inversion',
          highlight: [60, 64, 67, 72, 76],
          phrase: progression([triad(60), invert(triad(60), 1), invert(triad(60), 2)], { dur: 1.5 }),
          playLabel: 'Play all three positions',
        },
        {
          title: 'Why bother',
          text: 'Play C then F then G in root position and the hand jumps around, and so does the sound. Now play C, then F in second inversion, then G in first — the top notes barely move and the hand stays put. Same harmony, far better line.',
          definition:
            'Inversions let a progression keep its voices close together, which is smoother to hear and easier to play.',
          hint: 'Jumpy first, then smooth',
          highlight: [60, 64, 65, 67, 69, 71, 72],
          phrase: progression([triad(60), triad(65), triad(67), triad(60)], { dur: 1.2 }),
          playLabel: 'All in root position',
          alt: {
            label: 'With inversions',
            phrase: progression(
              [triad(60), invert(triad(65), 2), invert(triad(67), 1), triad(60)],
              { dur: 1.2 },
            ),
            highlight: [60, 64, 67, 65, 69, 71, 72],
          },
        },
        {
          title: 'The rule of the nearest note',
          text: 'Voice leading is one instruction: move each voice as little as possible. Keep any note the two chords share, and move the rest by a step. Apply it mechanically and good-sounding chord changes fall out.',
          definition:
            'Voice leading is the horizontal movement of each individual voice between chords. Common tones are held; the rest move by the smallest available interval.',
          hint: 'The top voice hardly moves at all',
          highlight: [60, 62, 64, 65, 67, 69, 71, 72],
          phrase: progression(
            [
              triad(60),
              invert(triad(69, 'minor'), 1),
              invert(triad(65), 2),
              invert(triad(67), 1),
              triad(60),
            ],
            { dur: 1.5 },
          ),
        },
        {
          title: 'Inversions in the left hand',
          text: 'The practical payoff: the left hand can hold a chord shape near middle C all the way through a song, changing one or two fingers per chord instead of leaping. This is how accompaniment is actually played.',
          definition:
            'Keeping left-hand voicings within a narrow band — roughly the octave below middle C — is standard practice for accompaniment.',
          hint: 'Four chords, almost no movement',
          highlight: [52, 55, 57, 59, 60, 62, 64],
          phrase: together(
            progression(
              [triad(48), invert(triad(53), 2), invert(triad(55), 1), triad(48)],
              { dur: 2, hand: 'L', vel: 0.55 },
            ),
            seq([64, 65, 67, 64], { step: 2, dur: 1.8, hand: 'R' }),
          ),
        },
      ],
    },

    {
      title: 'Diatonic chords and Roman numerals',
      duration: '14 min',
      summary: 'The seven chords that live in a key, and the shorthand everyone uses for them.',
      steps: [
        {
          title: 'A triad on every degree',
          text: 'Build a triad on each note of C major using only white keys. Degrees 1, 4 and 5 come out major; 2, 3 and 6 minor; 7 diminished. You did not choose that — it falls out of the scale.',
          definition:
            'Diatonic triads use only the notes of one scale. In a major key: I, IV, V major; ii, iii, vi minor; vii° diminished.',
          hint: 'All seven, in order',
          highlight: cMajorTriads[0],
          phrase: progression(cMajorTriads, { dur: 1 }),
          playLabel: 'Play all seven',
        },
        {
          title: 'Roman numerals',
          text: 'Capitals for major, lower case for minor, a small circle for diminished. The numeral describes the chord’s function in the key rather than its letter name — so "I–V–vi–IV" is the same progression in every key, which is exactly why it is written that way.',
          definition:
            'Roman numerals name a chord by its scale degree: I ii iii IV V vi vii° in major.',
          hint: 'The four chords of a thousand songs',
          highlight: [...triad(60), ...triad(67), ...triad(69, 'minor'), ...triad(65)],
          phrase: progression([triad(60), triad(67), triad(69, 'minor'), triad(65)], { dur: 2 }),
          chart: {
            key: 'C major',
            time: [4, 4],
            bars: [{ chords: ['C'] }, { chords: ['G'] }, { chords: ['Am'] }, { chords: ['F'] }],
            // I – V – vi – IV, drawn from the numerals rather than spelled out again.
            analysis: [0, 4, 5, 3].map((degree) => ROMAN_NUMERALS_MAJOR[degree]),
          },
        },
        {
          title: 'The same numerals, a different key',
          text: 'I–V–vi–IV in C is C–G–Am–F. In G it is G–D–Em–C. Identical shape, identical feeling, different letters. Learning progressions by numeral rather than by letter is what makes transposition possible later.',
          definition:
            'A progression written in numerals is key-independent. Substituting the scale of a new key transposes it.',
          hint: 'The same progression, up a fifth',
          highlight: [...triad(67), ...triad(62)],
          phrase: progression([triad(60), triad(67), triad(69, 'minor'), triad(65)], { dur: 1.5 }),
          playLabel: 'In C',
          alt: {
            label: 'In G',
            phrase: progression([triad(67), triad(62), triad(64, 'minor'), triad(60)], { dur: 1.5 }),
            highlight: [...triad(67), ...triad(62), ...triad(64, 'minor')],
          },
        },
        {
          title: 'Which degree?',
          text: 'You hear the key established, then one chord from it. Which degree was it? Start by telling I from V — home and away.',
          definition:
            'Hearing chords by function rather than by name is what lets you play along with music you have never heard.',
          hint: 'Listen for home, or away from it',
          quiz: {
            prompt: 'Which chord of C major was that?',
            options: ['I (C)', 'ii (Dm)', 'IV (F)', 'V (G)', 'vi (Am)'],
            target: 4,
            questions: [
              { phrase: then(chord(triad(60), { dur: 1 }), chord(triad(60), { dur: 2 })), answer: 'I (C)' },
              { phrase: then(chord(triad(60), { dur: 1 }), chord(triad(67), { dur: 2 })), answer: 'V (G)' },
              { phrase: then(chord(triad(60), { dur: 1 }), chord(triad(65), { dur: 2 })), answer: 'IV (F)' },
              { phrase: then(chord(triad(60), { dur: 1 }), chord(triad(69, 'minor'), { dur: 2 })), answer: 'vi (Am)' },
              { phrase: then(chord(triad(60), { dur: 1 }), chord(triad(62, 'minor'), { dur: 2 })), answer: 'ii (Dm)' },
            ],
          },
        },
      ],
    },

    {
      title: 'Progressions and cadences',
      duration: '14 min',
      summary: 'How chords move, and the handful of endings that make music sound finished.',
      steps: [
        {
          title: 'The perfect cadence',
          text: 'V to I. The dominant chord contains the leading note, a semitone below the tonic, and the ear insists that it resolve. Play G then C and hear the argument settle.',
          definition:
            'A perfect (authentic) cadence is V–I. It is the strongest way to end a phrase.',
          hint: 'G, then home to C',
          highlight: [...triad(67), ...triad(60)],
          phrase: progression([triad(67, 'dominant7'), triad(60)], { dur: 2 }),
        },
        {
          title: 'Plagal, imperfect, interrupted',
          text: 'IV–I is the plagal — gentler, the "amen" ending. Stopping on V is imperfect: unfinished, waiting. V–vi is interrupted: you were promised home and given something else instead.',
          definition:
            'Plagal IV–I; imperfect ends on V; interrupted (deceptive) is V–vi.',
          hint: 'Three endings in turn',
          highlight: [...triad(65), ...triad(67), ...triad(69, 'minor')],
          phrase: then(
            progression([triad(65), triad(60)], { dur: 1.5 }),
            progression([triad(60), triad(67)], { dur: 1.5 }),
            progression([triad(67), triad(69, 'minor')], { dur: 2 }),
          ),
          playLabel: 'Plagal, imperfect, interrupted',
        },
        {
          title: 'The ii–V–I',
          text: 'The most common progression in Western music after I–IV–V. The roots fall by fifths, each chord pulling into the next, and the voice leading is nearly all steps. It is the sentence that jazz is built out of.',
          definition:
            'ii–V–I: the supertonic minor, the dominant, the tonic. Roots descend by fifths.',
          hint: 'Dm7 – G7 – Cmaj7',
          highlight: [...triad(62, 'minor7'), ...triad(67, 'dominant7'), ...triad(60, 'major7')],
          phrase: progression(
            [triad(62, 'minor7'), triad(67, 'dominant7'), triad(60, 'major7')],
            { dur: 2 },
          ),
          chart: {
            key: 'C major',
            time: [4, 4],
            bars: [{ chords: ['Dm7'] }, { chords: ['G7'] }, { chords: ['Cmaj7'] }],
            analysis: ['ii7', 'V7', 'Imaj7'],
          },
        },
        {
          title: 'Finished or unfinished?',
          text: 'Two chords. Did the phrase come to rest, or is it still waiting? This is the single most useful thing an ear can learn to do.',
          definition:
            'A cadence that ends on I sounds closed; one that ends on V or vi sounds open.',
          hint: 'Does it sound settled?',
          quiz: {
            prompt: 'How did that phrase end?',
            options: ['Finished (on I)', 'Unfinished (on V)', 'Surprised (on vi)'],
            questions: [
              { phrase: progression([triad(67), triad(60)], { dur: 1.5 }), answer: 'Finished (on I)' },
              { phrase: progression([triad(60), triad(67)], { dur: 1.5 }), answer: 'Unfinished (on V)' },
              { phrase: progression([triad(67), triad(69, 'minor')], { dur: 1.5 }), answer: 'Surprised (on vi)' },
              { phrase: progression([triad(65), triad(60)], { dur: 1.5 }), answer: 'Finished (on I)' },
              { phrase: progression([triad(62, 'minor'), triad(67)], { dur: 1.5 }), answer: 'Unfinished (on V)' },
            ],
          },
        },
      ],
    },

    {
      title: 'Modes, pentatonic and blues',
      duration: '15 min',
      summary: 'Other ways to carve up the same twelve notes.',
      steps: [
        {
          title: 'Modes are the scale started elsewhere',
          text: 'Play the white keys from D to D and you get Dorian — minor, but with a raised sixth that makes it less mournful than natural minor. From E, Phrygian. From G, Mixolydian: major with a flat seventh, the sound of most rock music.',
          definition:
            'A mode is a scale built on a different degree of the parent scale. Ionian is major; Aeolian is natural minor.',
          hint: 'D Dorian — all white keys',
          highlight: scale(62, 'dorian'),
          phrase: seq(scale(62, 'dorian'), { step: 0.45 }),
          alt: {
            label: 'Hear Mixolydian',
            phrase: seq(scale(67, 'mixolydian'), { step: 0.45 }),
            highlight: scale(67, 'mixolydian'),
          },
        },
        {
          title: 'The pentatonic',
          text: 'Drop the two notes that cause trouble — the fourth and seventh — and five remain. Nothing in a pentatonic scale clashes, which is why it is the scale every beginner improvises on and every folk tradition arrives at independently.',
          definition:
            'Major pentatonic: degrees 1 2 3 5 6. Minor pentatonic: 1 ♭3 4 5 ♭7. Five notes, no semitones.',
          hint: 'Five notes that cannot go wrong',
          highlight: scale(60, 'majorPentatonic'),
          phrase: seq(scale(60, 'majorPentatonic'), { step: 0.45 }),
        },
        {
          title: 'The blues scale',
          text: 'Minor pentatonic with one extra note squeezed in between the fourth and fifth — the flat fifth, the blue note. It is dissonant on its own and essential in context: it is the note you pass through, not land on.',
          definition:
            'Blues scale: 1 ♭3 4 ♭5 5 ♭7. The ♭5 is a passing note between 4 and 5.',
          hint: 'Listen for the note that slides',
          highlight: scale(60, 'blues'),
          phrase: then(
            seq(scale(60, 'blues'), { step: 0.4 }),
            seq([...scale(60, 'blues')].reverse().slice(1), { step: 0.4 }),
          ),
        },
        {
          title: 'Bright or dark?',
          text: 'Modes sort roughly by how bright they sound, which comes down to whether the third and sixth are major or minor. Lydian is the brightest, Locrian the darkest.',
          definition:
            'Lydian and Ionian are major-sounding; Mixolydian is major with a soft edge; Dorian, Aeolian and Phrygian are minor, in increasing darkness.',
          hint: 'Name the mode',
          quiz: {
            prompt: 'Which scale was that?',
            options: ['Major (Ionian)', 'Dorian', 'Mixolydian', 'Natural minor', 'Blues'],
            target: 4,
            questions: [
              { phrase: seq(scale(60, 'major'), { step: 0.4 }), answer: 'Major (Ionian)' },
              { phrase: seq(scale(60, 'dorian'), { step: 0.4 }), answer: 'Dorian' },
              { phrase: seq(scale(60, 'mixolydian'), { step: 0.4 }), answer: 'Mixolydian' },
              { phrase: seq(scale(60, 'aeolian'), { step: 0.4 }), answer: 'Natural minor' },
              { phrase: seq(scale(60, 'blues'), { step: 0.4 }), answer: 'Blues' },
            ],
          },
        },
      ],
    },

    {
      title: 'Beyond the key',
      duration: '16 min',
      summary: 'Secondary dominants, borrowed chords and moving the music to a new key.',
      steps: [
        {
          title: 'Secondary dominants',
          text: 'Any chord in a key can be given its own dominant. To approach the vi chord more strongly, precede it with the chord that is V *of* vi — E major, which is not in C at all. The borrowed G♯ pulls into A and makes the arrival feel deliberate.',
          definition:
            'A secondary dominant is the dominant of a chord other than the tonic, written V/x. It borrows an accidental from outside the key.',
          hint: 'E7 pulls hard into Am',
          highlight: [...triad(64, 'dominant7'), ...triad(69, 'minor')],
          phrase: progression(
            [triad(60), triad(64, 'dominant7'), triad(69, 'minor'), triad(65)],
            { dur: 2 },
          ),
          chart: {
            key: 'C major',
            time: [4, 4],
            bars: [{ chords: ['C'] }, { chords: ['E7'] }, { chords: ['Am'] }, { chords: ['F'] }],
            analysis: ['I', 'V/vi', 'vi', 'IV'],
          },
        },
        {
          title: 'Borrowed chords',
          text: 'Major and minor keys on the same tonic are close relatives, and you can take chords from one into the other. The most common borrowing is the minor iv in a major key — a sudden shadow that resolves beautifully back to I.',
          definition:
            'A borrowed chord (modal interchange) comes from the parallel major or minor — the key with the same tonic.',
          hint: 'F major, then F minor, then home',
          highlight: [...triad(65), ...triad(65, 'minor'), ...triad(60)],
          phrase: progression([triad(60), triad(65), triad(65, 'minor'), triad(60)], { dur: 2 }),
          chart: {
            key: 'C major',
            time: [4, 4],
            bars: [{ chords: ['C'] }, { chords: ['F'] }, { chords: ['Fm'] }, { chords: ['C'] }],
            analysis: ['I', 'IV', 'iv', 'I'],
          },
        },
        {
          title: 'Modulation',
          text: 'To change key properly, you need a chord that belongs to both, then a cadence in the new one. C major and G major share four chords; land on one of them, then play D7–G, and the ear accepts G as the new home.',
          definition:
            'Modulation is a change of key. A pivot chord shared by both keys makes the change smooth; a cadence in the new key confirms it.',
          hint: 'C major, pivot, then a cadence in G',
          highlight: [...triad(60), ...triad(62, 'dominant7'), ...triad(67)],
          phrase: progression(
            [triad(60), triad(65), triad(62, 'dominant7'), triad(67)],
            { dur: 2 },
          ),
          chart: {
            key: 'C major → G major',
            time: [4, 4],
            bars: [
              { chords: ['C'] },
              { chords: ['F'], section: 'pivot' },
              { chords: ['D7'] },
              { chords: ['G'] },
            ],
            analysis: ['I', 'IV = vii in G', 'V7 of G', 'I in G'],
          },
        },
      ],
    },
  ],
}
