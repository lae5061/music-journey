import { chord, DYNAMICS, ramp, scale, seq, then, together, triad } from '../../lib/music'
import type { Unit } from '../types'

const C_MAJOR = scale(60, 'major')
const C_MINOR_NATURAL = scale(60, 'naturalMinor')
const C_MINOR_HARMONIC = scale(60, 'harmonicMinor')
const C_MINOR_MELODIC = scale(60, 'melodicMinor')

/** Right-hand fingering for a one-octave C major scale, thumb under after E. */
const RH_SCALE_FINGERS: Record<number, string> = {
  60: '1',
  62: '2',
  64: '3',
  65: '1',
  67: '2',
  69: '3',
  71: '4',
  72: '5',
}

export const technique: Unit = {
  title: 'Technique',
  summary: 'What the hands have to learn to do, from five-finger shapes to pedalling.',
  outcome: 'Scales and arpeggios under the hand, two hands doing different things, and control of touch.',
  lessons: [
    {
      title: 'Five-finger patterns',
      duration: '10 min',
      summary: 'The shape every beginning exercise starts from, in major and minor.',
      steps: [
        {
          title: 'Five notes, five fingers',
          text: 'One finger per key, nothing moves. Play up and down slowly, listening for evenness: the little finger is weak and will play quieter than the thumb until you notice it and fix it.',
          definition:
            'A five-finger pattern covers the first five notes of a scale, one finger to each, with no thumb-under.',
          hint: 'Fingers 1–5 on C D E F G, up and down',
          highlight: [60, 62, 64, 65, 67],
          keyLabels: { 60: '1', 62: '2', 64: '3', 65: '4', 67: '5' },
          phrase: seq([60, 62, 64, 65, 67, 65, 64, 62, 60]),
          staff: {
            clef: 'treble',
            time: [4, 4],
            notes: [60, 62, 64, 65, 67, 65, 64, 62]
              .map((_, i) => ['C4', 'D4', 'E4', 'F4', 'G4', 'F4', 'E4', 'D4'][i])
              .map((pitch, i) => ({
                pitch,
                value: 1 as const,
                finger: [1, 2, 3, 4, 5, 4, 3, 2][i],
              })),
          },
        },
        {
          title: 'Major and minor, side by side',
          text: 'Lower the third note by a semitone and the whole shape darkens. That single key is the entire difference between a major and a minor five-finger pattern — and, later, between a major and a minor chord.',
          definition:
            'Major five-finger pattern: W–W–H–W. Minor: W–H–W–W. Only the third note differs.',
          hint: 'Major first, then minor',
          highlight: [60, 62, 64, 65, 67],
          phrase: seq([60, 62, 64, 65, 67, 65, 64, 62, 60]),
          alt: {
            label: 'Play it minor',
            phrase: seq([60, 62, 63, 65, 67, 65, 63, 62, 60]),
            highlight: [60, 62, 63, 65, 67],
          },
        },
        {
          title: 'Both hands, an octave apart',
          text: 'The left hand plays the same pattern an octave lower, with fingering mirrored: 5 4 3 2 1 going up. Start hands separately. Put them together only when each is even on its own.',
          definition:
            'Playing in octaves means both hands play the same letters, twelve semitones apart.',
          hint: 'Left hand 5–1, right hand 1–5',
          highlight: [48, 50, 52, 53, 55, 60, 62, 64, 65, 67],
          phrase: together(
            seq([48, 50, 52, 53, 55, 53, 52, 50, 48], { hand: 'L' }),
            seq([60, 62, 64, 65, 67, 65, 64, 62, 60], { hand: 'R' }),
          ),
          staff: {
            clef: 'grand',
            time: [4, 4],
            notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'F4', 'E4', 'D4'].map((pitch) => ({
              pitch,
              value: 1 as const,
            })),
            bass: ['C3', 'D3', 'E3', 'F3', 'G3', 'F3', 'E3', 'D3'].map((pitch) => ({
              pitch,
              value: 1 as const,
            })),
          },
        },
      ],
    },

    {
      title: 'Scales and the thumb under',
      duration: '16 min',
      summary: 'Getting past five notes: the thumb-under move that makes a full scale possible.',
      steps: [
        {
          title: 'The problem with five fingers',
          text: 'A scale has eight notes and you have five fingers. Something has to give. The answer is that the thumb passes underneath the hand mid-scale and starts a second group, so the hand travels without the line breaking.',
          definition:
            'A scale of more than five notes requires the thumb to pass under the palm, or a finger to cross over the thumb on the way down.',
          hint: 'Listen for the seam — there should not be one',
          highlight: C_MAJOR,
          phrase: seq(C_MAJOR, { step: 0.5 }),
        },
        {
          title: 'Where the thumb goes',
          text: 'Right hand going up C major: 1 on C, 2 on D, 3 on E — then the thumb tucks under to take F, and 2 3 4 5 finish on C. Going down it reverses: 5 4 3 2 1, then the third finger crosses over the thumb onto E.',
          definition:
            'Right-hand C major fingering: 1 2 3 1 2 3 4 5 ascending, 5 4 3 2 1 3 2 1 descending.',
          hint: 'The thumb takes F — prepare it early',
          highlight: C_MAJOR,
          keyLabels: RH_SCALE_FINGERS,
          phrase: seq(C_MAJOR, { step: 0.5 }),
          staff: {
            clef: 'treble',
            time: [4, 4],
            notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'].map((pitch, i) => ({
              pitch,
              value: 1 as const,
              finger: [1, 2, 3, 1, 2, 3, 4, 5][i],
            })),
          },
        },
        {
          title: 'Move the arm, not the wrist',
          text: 'The thumb-under fails when the wrist twists to reach. Instead, let the elbow drift gently to the right as you ascend, so the thumb arrives under the third finger already over its key. The wrist stays level and quiet throughout.',
          definition:
            'A smooth scale comes from lateral arm movement; the thumb should arrive at its key rather than lunge for it.',
          hint: 'Play it slowly and watch the wrist stay flat',
          highlight: C_MAJOR,
          phrase: seq(C_MAJOR, { step: 1, tempo: 76 }),
          playLabel: 'Play it slowly',
        },
        {
          title: 'Two octaves, both hands',
          text: 'The same move happens twice per octave. Hands together in octaves is the standard practice form — and the point where evenness problems become obvious.',
          definition:
            'A two-octave scale repeats the fingering pattern, with the thumb passing under at F and again at the octave.',
          hint: 'Two octaves up and back',
          highlight: [...C_MAJOR, ...scale(72, 'major')],
          phrase: (() => {
            const up = [...C_MAJOR.slice(0, 7), ...scale(72, 'major')]
            const down = [...up].reverse().slice(1)
            return together(
              seq([...up, ...down].map((n) => n - 12), { step: 0.4, hand: 'L' }),
              seq([...up, ...down], { step: 0.4, hand: 'R' }),
            )
          })(),
        },
      ],
    },

    {
      title: 'Minor scales',
      duration: '15 min',
      summary: 'Three minors, why there are three, and what each one is for.',
      steps: [
        {
          title: 'Natural minor',
          text: 'Take the major scale and flatten the third, sixth and seventh. That is the natural minor — the plainest of the three, and the one that matches the key signature exactly.',
          definition:
            'Natural minor: W–H–W–W–H–W–W. It is the major scale with ♭3, ♭6 and ♭7.',
          hint: 'C natural minor — listen to the flat third',
          highlight: C_MINOR_NATURAL,
          phrase: seq(C_MINOR_NATURAL, { step: 0.5 }),
          alt: {
            label: 'Compare with major',
            phrase: seq(C_MAJOR, { step: 0.5 }),
            highlight: C_MAJOR,
          },
        },
        {
          title: 'Harmonic minor',
          text: 'Natural minor has a weak ending: the flat seventh does not pull upward to the tonic. Raise it back and the pull returns — at the cost of a gap of three semitones between the sixth and seventh, which is the sound people call exotic.',
          definition:
            'Harmonic minor raises the seventh degree, producing a leading note and an augmented second between ♭6 and ♮7.',
          hint: 'Listen to the leap near the top',
          highlight: C_MINOR_HARMONIC,
          phrase: seq(C_MINOR_HARMONIC, { step: 0.5 }),
          staff: {
            clef: 'treble',
            key: -3,
            notes: ['C4', 'D4', 'Eb4', 'F4', 'G4', 'Ab4', 'B4', 'C5'].map((pitch) => ({
              pitch,
              value: 1 as const,
            })),
          },
        },
        {
          title: 'Melodic minor',
          text: 'To lose the leap, raise the sixth as well — but only on the way up, where the line is heading for the tonic. Coming down there is nothing to lead to, so the scale reverts to natural minor. It is the one scale that differs ascending and descending.',
          definition:
            'Melodic minor raises the sixth and seventh ascending, and reverts to natural minor descending.',
          hint: 'Up one way, down another',
          highlight: C_MINOR_MELODIC,
          phrase: then(
            seq(C_MINOR_MELODIC, { step: 0.5 }),
            seq([...C_MINOR_NATURAL].reverse().slice(1), { step: 0.5 }),
          ),
          playLabel: 'Play up and down',
        },
        {
          title: 'Which minor was that?',
          text: 'The three differ only in their sixth and seventh degrees. Listen to the top of the scale — that is where the decision is made.',
          definition:
            'Natural has ♭6 ♭7; harmonic has ♭6 ♮7; melodic ascending has ♮6 ♮7.',
          hint: 'Listen to the last three notes',
          quiz: {
            prompt: 'Which minor scale was that?',
            options: ['Natural minor', 'Harmonic minor', 'Melodic minor'],
            questions: [
              { phrase: seq(C_MINOR_NATURAL, { step: 0.45 }), answer: 'Natural minor' },
              { phrase: seq(C_MINOR_HARMONIC, { step: 0.45 }), answer: 'Harmonic minor' },
              { phrase: seq(C_MINOR_MELODIC, { step: 0.45 }), answer: 'Melodic minor' },
              { phrase: seq(scale(69, 'harmonicMinor'), { step: 0.45 }), answer: 'Harmonic minor' },
              { phrase: seq(scale(69, 'naturalMinor'), { step: 0.45 }), answer: 'Natural minor' },
            ],
          },
        },
      ],
    },

    {
      title: 'Arpeggios and broken chords',
      duration: '14 min',
      summary: 'Chords played one note at a time — the backbone of accompaniment.',
      steps: [
        {
          title: 'A chord, spread out',
          text: 'An arpeggio is a chord whose notes arrive one after another instead of together. Play C–E–G as a block, then the same three notes in a line. Same harmony, different texture.',
          definition:
            'An arpeggio (broken chord) sounds the notes of a chord in succession rather than simultaneously.',
          hint: 'Block first, then broken',
          highlight: triad(60),
          phrase: then(chord(triad(60), { dur: 2 }), seq([60, 64, 67, 72], { step: 0.5 })),
          playLabel: 'Play both',
        },
        {
          title: 'Fingering across the octave',
          text: 'Right hand, C major arpeggio: 1 on C, 2 on E, 3 on G, then the thumb passes under for the top C. The same tuck as the scale, over a wider gap, so the arm has to travel further and earlier.',
          definition:
            'Right-hand major arpeggio fingering: 1 2 3 1 ascending, 5 3 2 1 descending over one octave.',
          hint: 'Thumb under for the top C',
          highlight: [60, 64, 67, 72],
          keyLabels: { 60: '1', 64: '2', 67: '3', 72: '5' },
          phrase: seq([60, 64, 67, 72, 67, 64, 60], { step: 0.5 }),
        },
        {
          title: 'Broken chords in the left hand',
          text: 'The left hand rarely plays block chords under a melody — it breaks them. Root, fifth, octave, fifth is the plainest pattern, and it works under almost anything.',
          definition:
            'A broken-chord accompaniment keeps the harmony sounding while leaving space for the melody above it.',
          hint: 'Left hand breaks the chord; right hand holds the tune',
          highlight: [36, 43, 48, 60, 64, 67],
          phrase: together(
            seq([36, 43, 48, 43, 36, 43, 48, 43], { step: 0.5, hand: 'L' }),
            {
              hits: [
                { n: 67, at: 0, dur: 1.5, hand: 'R' },
                { n: 64, at: 1.5, dur: 0.5, hand: 'R' },
                { n: 60, at: 2, dur: 2, hand: 'R' },
              ],
            },
          ),
        },
      ],
    },

    {
      title: 'Hand independence',
      duration: '15 min',
      summary: 'Getting the two hands to do different things at the same time.',
      steps: [
        {
          title: 'Two against one',
          text: 'Start with the simplest possible split: the left hand holds a whole note while the right plays four quarters. The hands are not fighting — one is simply still while the other moves.',
          definition:
            'Hand independence begins with contrast in rhythm, not complexity. One hand sustains, the other moves.',
          hint: 'Left hand holds, right hand walks',
          highlight: [48, 60, 62, 64, 65],
          phrase: together(
            { hits: [{ n: 48, at: 0, dur: 4, hand: 'L' }] },
            seq([60, 62, 64, 65], { step: 1, hand: 'R' }),
          ),
          staff: {
            clef: 'grand',
            time: [4, 4],
            notes: ['C4', 'D4', 'E4', 'F4'].map((pitch) => ({ pitch, value: 1 as const })),
            bass: [{ pitch: 'C3', value: 4 }],
          },
        },
        {
          title: 'Two against three',
          text: 'Now the hands genuinely disagree: three notes in the left against two in the right, over the same beat. Do not try to hear both at once — learn where they coincide (only on beat 1) and let the rest fall between.',
          definition:
            'A polyrhythm sets one division of the beat against another. Three against two is the most common.',
          hint: 'They only line up on beat one',
          highlight: [48, 52, 55, 60, 64],
          phrase: together(
            { hits: [0, 1 / 3, 2 / 3, 1, 4 / 3, 5 / 3].map((at, i) => ({ n: [48, 52, 55, 48, 52, 55][i], at, dur: 1 / 3, hand: 'L' as const })) },
            { hits: [0, 0.5, 1, 1.5].map((at, i) => ({ n: [60, 64, 60, 64][i], at, dur: 0.5, hand: 'R' as const })) },
          ),
          playLabel: 'Play three against two',
        },
        {
          title: 'Melody over accompaniment',
          text: 'The real use of independence: one hand keeps a steady pattern while the other phrases freely on top. The accompaniment must become automatic enough that you can stop thinking about it.',
          definition:
            'In most piano writing, the left hand maintains a texture and the right hand carries the line.',
          hint: 'Steady left, singing right',
          highlight: [48, 55, 60, 64, 67, 69, 72],
          phrase: together(
            seq([48, 55, 52, 55, 48, 55, 52, 55], { step: 0.5, hand: 'L', vel: 0.45 }),
            {
              hits: [
                { n: 67, at: 0, dur: 1, vel: 0.85, hand: 'R' },
                { n: 69, at: 1, dur: 0.5, vel: 0.8, hand: 'R' },
                { n: 72, at: 1.5, dur: 1.5, vel: 0.9, hand: 'R' },
                { n: 67, at: 3, dur: 1, vel: 0.8, hand: 'R' },
              ],
            },
          ),
        },
      ],
    },

    {
      title: 'Dynamics and articulation',
      duration: '12 min',
      summary: 'How loud, and how joined up — the two dials that turn notes into music.',
      steps: [
        {
          title: 'Soft and loud',
          text: 'p is soft, f is loud, and mp and mf sit between them. On a piano the only thing that changes is how fast the key goes down — which is why control of weight, not force, is what you practise.',
          definition:
            'Dynamic marks: pp, p, mp, mf, f, ff, from softest to loudest. They are relative, not absolute.',
          hint: 'The same notes, four times, getting louder',
          highlight: triad(60),
          phrase: {
            hits: [DYNAMICS.pp, DYNAMICS.p, DYNAMICS.mf, DYNAMICS.ff].map((vel, i) => ({
              n: triad(60),
              at: i * 1.5,
              dur: 1.2,
              vel,
            })),
          },
          playLabel: 'pp — p — mf — ff',
        },
        {
          title: 'Crescendo',
          text: 'A crescendo is a change of dynamic spread over time, not a step. The trap is to arrive too early: aim to be still growing at the last note before the peak.',
          definition:
            'Crescendo (<) means grow louder; diminuendo (>) means grow softer. Both are gradual.',
          hint: 'Growing from soft to loud across the scale',
          highlight: scale(60, 'major'),
          phrase: ramp(seq(scale(60, 'major'), { step: 0.5 }), 'pp', 'ff'),
          staff: {
            clef: 'treble',
            dynamic: 'p  <  f',
            notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'].map((pitch) => ({
              pitch,
              value: 1 as const,
            })),
          },
        },
        {
          title: 'Legato and staccato',
          text: 'Legato joins each note to the next with no gap — the finger only leaves its key as the next one arrives. Staccato shortens every note, leaving air around it. Same notes, entirely different character.',
          definition:
            'Legato: smooth and connected, often marked with a slur. Staccato: detached, marked with a dot above or below the note.',
          hint: 'Smooth first, then detached',
          highlight: [60, 62, 64, 65, 67],
          phrase: seq([60, 62, 64, 65, 67], { step: 1, dur: 1 }),
          playLabel: 'Play it legato',
          alt: {
            label: 'Play it staccato',
            phrase: seq([60, 62, 64, 65, 67], { step: 1, dur: 0.18 }),
            highlight: [60, 62, 64, 65, 67],
          },
          staff: {
            clef: 'treble',
            notes: ['C4', 'D4', 'E4', 'F4', 'G4'].map((pitch) => ({
              pitch,
              value: 1 as const,
              mark: 'staccato' as const,
            })),
          },
        },
        {
          title: 'Accents',
          text: 'An accent marks one note out of the line — louder, and usually with a fraction more length. It is how a rhythm gets its shape when everything else is even.',
          definition:
            'An accent (>) emphasises a single note. A tenuto (—) asks for full length and weight without extra volume.',
          hint: 'The accent moves through the bar',
          highlight: [60, 62, 64, 65],
          phrase: {
            hits: [0, 1, 2, 3, 4, 5, 6, 7].map((at) => ({
              n: [60, 62, 64, 65][at % 4],
              at: at * 0.5,
              dur: 0.5,
              vel: at % 4 === 2 ? 1 : 0.45,
            })),
          },
        },
      ],
    },

    {
      title: 'Pedalling',
      duration: '13 min',
      summary: 'The sustain pedal, and the timing trick that keeps it from turning to mud.',
      steps: [
        {
          title: 'Three pedals',
          text: 'The right pedal lifts the dampers off every string, so notes keep ringing after you let go. The left softens the tone. The middle one — where it exists — holds only the notes already down. The right one is the one you learn first and use most.',
          definition:
            'The sustain (damper) pedal lifts all dampers, letting every string ring until it is released.',
          hint: 'Nothing to play — read this',
          diagram: 'pedal',
          noKeyboard: true,
        },
        {
          title: 'What the pedal does',
          text: 'Play a chord and release the keys: the sound stops. Play it with the pedal down and it rings on. That is the whole mechanism — and the whole danger, because a pedal held through a chord change blurs the two together.',
          definition:
            'With the pedal down, every note played continues to sound until the pedal is lifted.',
          hint: 'Without pedal, then with',
          highlight: [...triad(48), ...triad(60)],
          phrase: seq([48, 52, 55, 60, 64, 67], { step: 0.5, dur: 0.4 }),
          playLabel: 'Play without pedal',
          alt: {
            label: 'Play with pedal',
            phrase: { ...seq([48, 52, 55, 60, 64, 67], { step: 0.5 }), pedal: true },
            highlight: [...triad(48), ...triad(60)],
          },
        },
        {
          title: 'Syncopated pedalling',
          text: 'The rule that keeps it clean: change the pedal just *after* the new chord, not with it. Play the chord, then lift and re-press in one movement. The old harmony is cut off and the new one is caught — the sound never breaks and never overlaps.',
          definition:
            'Syncopated (legato) pedalling: the pedal lifts immediately after the new note sounds, then returns. The foot moves against the beat, not with it.',
          hint: 'Chord — then foot, chord — then foot',
          highlight: [...triad(60), ...triad(65), ...triad(67)],
          phrase: {
            tempo: 76,
            hits: [
              { n: triad(60), at: 0, dur: 1.9 },
              { n: triad(65), at: 2, dur: 1.9 },
              { n: triad(67), at: 4, dur: 1.9 },
              { n: triad(60), at: 6, dur: 2 },
            ],
          },
          staff: {
            clef: 'bass',
            time: [4, 4],
            pedal: true,
            notes: [
              { pitch: 'C3', value: 2 },
              { pitch: 'F3', value: 2 },
              { pitch: 'G3', value: 2 },
              { pitch: 'C3', value: 2 },
            ],
          },
        },
      ],
    },

    {
      title: 'Octaves, trills and ornaments',
      duration: '12 min',
      summary: 'The decorations — and the one technique that needs a loose wrist above all.',
      steps: [
        {
          title: 'Octaves',
          text: 'Thumb and little finger on the same letter, twelve semitones apart. The power comes from the forearm dropping, not from the fingers gripping — a tight hand playing octaves is how people injure themselves.',
          definition:
            'An octave is played 1–5 in either hand. Repeated octaves are played from a loose wrist, never a locked one.',
          hint: 'Thumb and little finger together',
          highlight: [60, 72],
          keyLabels: { 60: '1', 72: '5' },
          phrase: seq([60, 62, 64, 65], { step: 1 }),
          playLabel: 'Play the single notes',
          alt: {
            label: 'Play them as octaves',
            phrase: {
              hits: [
                { n: [60, 72], at: 0, dur: 0.9 },
                { n: [62, 74], at: 1, dur: 0.9 },
                { n: [64, 76], at: 2, dur: 0.9 },
                { n: [65, 77], at: 3, dur: 1 },
              ],
            },
            highlight: [60, 62, 64, 65, 72, 74, 76, 77],
          },
        },
        {
          title: 'The trill',
          text: 'A trill alternates a note with the one above it, fast and evenly. Practise it slowly with fingers 2 and 3 — the weakest pairing is 3 and 4, which is exactly why it is worth drilling.',
          definition:
            'A trill (tr) rapidly alternates the written note with the note a step above.',
          hint: 'Two notes, alternating quickly',
          highlight: [71, 72],
          phrase: {
            tempo: 120,
            hits: Array.from({ length: 12 }, (_, i) => ({
              n: i % 2 === 0 ? 72 : 71,
              at: i * 0.25,
              dur: 0.25,
            })).concat([{ n: 72, at: 3, dur: 1 }]),
          },
        },
        {
          title: 'Grace notes and turns',
          text: 'A grace note is a quick lean into the main note, taking its time from it rather than from the beat. A turn wraps around the note — above, note, below, note. Both are decoration: the main note still has to land where the beat says.',
          definition:
            'A grace note is a small note played just before the beat or on it. A turn (∿) plays the note above, the note, the note below, the note.',
          hint: 'The ornament leans into the main note',
          highlight: [71, 72, 74],
          phrase: {
            tempo: 88,
            hits: [
              { n: 71, at: 0, dur: 0.12 },
              { n: 72, at: 0.12, dur: 1.88 },
              { n: 74, at: 2, dur: 0.18 },
              { n: 72, at: 2.18, dur: 0.18 },
              { n: 71, at: 2.36, dur: 0.18 },
              { n: 72, at: 2.54, dur: 1.5 },
            ],
          },
          playLabel: 'Grace note, then a turn',
        },
      ],
    },

    {
      title: 'Staying relaxed',
      duration: '9 min',
      summary: 'How to practise for years without hurting yourself.',
      steps: [
        {
          title: 'Tension is the enemy',
          text: 'Almost every technical problem — uneven scales, missed leaps, a trill that seizes up — is tension somewhere it does not belong. Check the shoulders, the jaw, the forearm. If a passage needs force, the fingering is probably wrong.',
          definition:
            'Sustained muscular tension causes both inaccuracy and injury. Playing well is mostly the absence of unnecessary effort.',
          hint: 'Play this, and notice your shoulders',
          highlight: scale(60, 'major'),
          phrase: seq(scale(60, 'major'), { step: 0.5, vel: 0.5 }),
        },
        {
          title: 'The rules that matter',
          text: 'Wrists level with the forearm, never dropped or arched. Fingers curved, nails short. Break every twenty minutes. Stop the moment anything aches — pain in the hands or forearms is a signal to stop that day, not to push through.',
          definition:
            'Warm up slowly, keep the wrist neutral, rest regularly, and treat pain as information rather than weakness.',
          hint: 'Nothing to play — read this',
          diagram: 'posture',
          noKeyboard: true,
        },
        {
          title: 'Practise slowly, deliberately',
          text: 'Speed is a by-product of accuracy, not a thing you practise directly. Play slowly enough that you never make the mistake, and the tempo follows on its own. Practising fast and messy only rehearses the mess.',
          definition:
            'Deliberate practice means working at the speed where the passage is reliably correct, and raising it only when it is.',
          hint: 'The same run, slow then fast',
          highlight: scale(60, 'major'),
          phrase: seq(scale(60, 'major'), { step: 1, tempo: 60 }),
          playLabel: 'Slowly',
          alt: {
            label: 'Up to speed',
            phrase: seq(scale(60, 'major'), { step: 0.25, tempo: 120 }),
            highlight: scale(60, 'major'),
          },
        },
      ],
    },
  ],
}
