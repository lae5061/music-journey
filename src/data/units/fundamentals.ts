import { chord, seq, then, together } from '../../lib/music'
import { midis } from '../../lib/pitch'
import type { Unit } from '../types'

const C4 = 60

export const fundamentals: Unit = {
  title: 'Fundamentals',
  summary: 'Sitting down, finding your way around the keys, and reading what is written.',
  outcome: 'You can name any key, read a note on either stave, and count a bar out loud.',
  lessons: [
    {
      title: 'Before you begin',
      duration: '8 min',
      summary:
        'Sitting at the keyboard, finger numbers, finding middle C and where the right hand rests.',
      steps: [
        {
          title: 'Sit at the middle',
          text: 'Sit centred on the keyboard, far enough back that your elbows fall just in front of your body. Forearms level with the keys, shoulders down. If you are using a laptop or phone, the same idea applies: relaxed, upright, unhurried.',
          definition:
            'Good posture is the first technique. Tension in the shoulders and wrists is the most common cause of mistakes.',
          hint: 'Nothing to play yet',
          diagram: 'posture',
          noKeyboard: true,
        },
        {
          title: 'Finger numbers',
          text: 'Both hands number the same way: thumb is 1, index 2, middle 3, ring 4, little finger 5. Every exercise in this course refers to fingers by number, never by name — so the same instruction works for either hand.',
          definition: 'Finger numbers 1–5 run from thumb to little finger on each hand.',
          hint: 'Hold up a hand and count 1 to 5 from the thumb',
          diagram: 'finger-numbers',
          noKeyboard: true,
        },
        {
          title: 'The whole keyboard',
          text: 'A full piano has 88 keys — a little over seven octaves. The pattern of black keys repeats every twelve keys, so there are eight Cs. The one nearest the middle is middle C, written C4. Every lesson from here on starts there; find it below and press it.',
          definition:
            'Middle C (C4) is the fourth C from the left on an 88-key piano. Octave numbers count up from the bottom: C1, C2 … C8.',
          hint: 'Find and press middle C (C4)',
          highlight: [C4],
          phrase: seq([C4], { dur: 2 }),
          diagram: 'octave-map',
        },
        {
          title: 'Resting the right hand',
          text: 'Curve the fingers as if holding a ball. Place the right thumb (1) on middle C and let fingers 2, 3, 4 and 5 fall on D, E, F and G. This is the five-finger position every early exercise starts from.',
          definition: 'C position: right-hand fingers 1–5 on C, D, E, F, G.',
          hint: 'Fingers 1–5 on C D E F G',
          highlight: [60, 62, 64, 65, 67],
          keyLabels: { 60: '1', 62: '2', 64: '3', 65: '4', 67: '5' },
          phrase: seq([60, 62, 64, 65, 67]),
          diagram: 'hand-position',
        },
        {
          title: 'Pressing a key',
          text: 'Play C with the thumb using the weight of the hand, not a push from the finger. Let the key come back up fully before playing it again. Try C, then walk up to G one finger at a time and back down.',
          definition:
            'A note sounds when the key is fully down. Releasing it stops the sound. Speed and force change only the volume.',
          hint: 'Play C with the thumb, then walk up and back',
          highlight: [60, 62, 64, 65, 67],
          phrase: seq([60, 62, 64, 65, 67, 65, 64, 62, 60]),
        },
      ],
    },

    {
      title: 'Note names on the keyboard',
      duration: '12 min',
      summary: 'Find C, learn the seven letter names and how black keys borrow theirs.',
      steps: [
        {
          title: 'Find middle C',
          text: 'Look at the pattern of black keys: they alternate in groups of two and three. The white key immediately to the left of any group of two is C. That pattern is the only map you need — it repeats all the way up.',
          definition: 'C is the reference point of the keyboard. Every other key is named relative to it.',
          hint: 'C is highlighted — press it',
          highlight: [60, 72],
          phrase: seq([60, 72], { step: 1 }),
        },
        {
          title: 'The seven letters',
          text: 'From C, the white keys ascend D, E, F, G, A, B, then C again. Only seven letters exist; the pattern repeats each octave. Say them out loud as you play.',
          definition:
            'An octave is the distance from one note to the next note with the same name. The frequency exactly doubles.',
          hint: 'Play the white keys from C to C',
          highlight: [60, 62, 64, 65, 67, 69, 71, 72],
          phrase: seq([60, 62, 64, 65, 67, 69, 71, 72]),
        },
        {
          title: 'Black keys: sharps and flats',
          text: 'A black key borrows its name from a neighbour. The key right of C is C sharp (C♯); it is also D flat (D♭). Both names point to the same key — which one you use depends on the music around it.',
          definition:
            'Sharp (♯) raises a note by one key; flat (♭) lowers it. Two names for one key are called enharmonic equivalents.',
          hint: 'The five black keys of one octave',
          highlight: [61, 63, 66, 68, 70],
          phrase: seq([61, 63, 66, 68, 70]),
        },
        {
          title: 'Name that key',
          text: 'Listen to a single note and name it. Everything is inside one octave from middle C, and the keyboard is still there to check against.',
          definition:
            'Naming keys by ear and by sight is the skill everything else is built on. It should become automatic.',
          hint: 'Listen, then name the note',
          quiz: {
            prompt: 'Which note was that?',
            options: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
            replayLabel: 'Hear it again',
            questions: [
              { phrase: seq([60], { dur: 2 }), answer: 'C' },
              { phrase: seq([62], { dur: 2 }), answer: 'D' },
              { phrase: seq([64], { dur: 2 }), answer: 'E' },
              { phrase: seq([65], { dur: 2 }), answer: 'F' },
              { phrase: seq([67], { dur: 2 }), answer: 'G' },
              { phrase: seq([69], { dur: 2 }), answer: 'A' },
              { phrase: seq([71], { dur: 2 }), answer: 'B' },
            ],
          },
        },
      ],
    },

    {
      title: 'Reading the staff',
      duration: '16 min',
      summary: 'Treble and bass clef, the lines and spaces, and the ledger lines between them.',
      steps: [
        {
          title: 'The treble clef',
          text: 'The treble clef curls around the second line from the bottom, and that line is G — the G above middle C. From there the lines run E, G, B, D, F upward and the spaces spell F, A, C, E. The right hand usually reads this stave.',
          definition:
            'The treble (G) clef fixes the second line from the bottom as G4. It is used for the higher part, normally the right hand.',
          hint: 'Play the notes on the lines: E G B D F',
          highlight: midis('E4', 'G4', 'B4', 'D5', 'F5'),
          phrase: seq(midis('E4', 'G4', 'B4', 'D5', 'F5'), { step: 1 }),
          staff: {
            clef: 'treble',
            notes: [
              { pitch: 'E4', value: 1 },
              { pitch: 'G4', value: 1 },
              { pitch: 'B4', value: 1 },
              { pitch: 'D5', value: 1 },
              { pitch: 'F5', value: 1 },
            ],
          },
        },
        {
          title: 'The bass clef',
          text: 'The bass clef puts its two dots either side of the second line from the top, and that line is F — the F below middle C. Its lines run G, B, D, F, A and its spaces A, C, E, G. The left hand usually reads this stave.',
          definition:
            'The bass (F) clef fixes the second line from the top as F3. It is used for the lower part, normally the left hand.',
          hint: 'Play the notes on the lines: G B D F A',
          highlight: midis('G2', 'B2', 'D3', 'F3', 'A3'),
          phrase: seq(midis('G2', 'B2', 'D3', 'F3', 'A3'), { step: 1 }),
          staff: {
            clef: 'bass',
            notes: [
              { pitch: 'G2', value: 1 },
              { pitch: 'B2', value: 1 },
              { pitch: 'D3', value: 1 },
              { pitch: 'F3', value: 1 },
              { pitch: 'A3', value: 1 },
            ],
          },
        },
        {
          title: 'Lines, spaces and the sayings',
          text: 'Nobody works these out from first principles at sight. Learn the four mnemonics, then stop using them — within a week the positions read directly, the way letters do.',
          definition:
            'Treble lines EGBDF, treble spaces FACE, bass lines GBDFA, bass spaces ACEG.',
          hint: 'Nothing to play — read these',
          diagram: 'staff-map',
          noKeyboard: true,
        },
        {
          title: 'Middle C and ledger lines',
          text: 'Middle C sits between the two staves, so it needs a little line of its own: one ledger line below the treble stave, or one above the bass stave. Same key, two ways of writing it. Ledger lines simply carry the stave on past its five lines.',
          definition:
            'A ledger line is a short line added above or below a stave to carry notes beyond it. Middle C is the first ledger line below the treble stave and the first above the bass stave.',
          hint: 'Both written Cs are the same key',
          highlight: [60],
          phrase: seq([60], { dur: 2 }),
          staff: {
            clef: 'grand',
            notes: [{ pitch: 'C4', value: 4 }],
            bass: [{ pitch: 'C4', value: 4 }],
          },
        },
        {
          title: 'Read and play',
          text: 'One note is shown at a time. Name it — then check yourself on the keyboard.',
          definition:
            'Sight-reading is the ability to turn a written note into the right key without stopping to work it out.',
          hint: 'Name the written note',
          quiz: {
            prompt: 'Treble clef: which note is written?',
            options: ['C4', 'E4', 'G4', 'B4', 'D5', 'F5'],
            questions: [
              { shown: 'Bottom line of the treble stave', answer: 'E4' },
              { shown: 'Second line from the bottom, the one the clef curls round', answer: 'G4' },
              { shown: 'Middle line of the treble stave', answer: 'B4' },
              { shown: 'Fourth line from the bottom', answer: 'D5' },
              { shown: 'Top line of the treble stave', answer: 'F5' },
              { shown: 'One ledger line below the treble stave', answer: 'C4' },
            ],
          },
        },
      ],
    },

    {
      title: 'Note values and rests',
      duration: '14 min',
      summary: 'How long each note lasts, how dots and triplets bend that, and how silence is written.',
      steps: [
        {
          title: 'The halving tree',
          text: 'Note values are a system of halves. A whole note lasts four beats; a half note two; a quarter note one; an eighth half a beat; a sixteenth a quarter of one. Nothing else to memorise — every value is half the one above it.',
          definition:
            'Whole = 4 beats, half = 2, quarter = 1, eighth = ½, sixteenth = ¼, in common time.',
          hint: 'Listen to each value in turn',
          diagram: 'note-values',
          phrase: {
            tempo: 100,
            click: 4,
            hits: [
              { n: 60, at: 0, dur: 4 },
              { n: 62, at: 4, dur: 2 },
              { n: 64, at: 6, dur: 2 },
              { n: 65, at: 8, dur: 1 },
              { n: 67, at: 9, dur: 1 },
              { n: 69, at: 10, dur: 1 },
              { n: 71, at: 11, dur: 1 },
              { n: 72, at: 12, dur: 0.5 },
              { n: 71, at: 12.5, dur: 0.5 },
              { n: 69, at: 13, dur: 0.5 },
              { n: 67, at: 13.5, dur: 0.5 },
              { n: 65, at: 14, dur: 0.5 },
              { n: 64, at: 14.5, dur: 0.5 },
              { n: 62, at: 15, dur: 0.5 },
              { n: 60, at: 15.5, dur: 0.5 },
            ],
          },
          playLabel: 'Play all five values',
          staff: {
            clef: 'treble',
            time: [4, 4],
            notes: [
              { pitch: 'C4', value: 4 },
              { pitch: 'D4', value: 2 },
              { pitch: 'E4', value: 2 },
              { pitch: 'F4', value: 1 },
              { pitch: 'G4', value: 1 },
              { pitch: 'A4', value: 1 },
              { pitch: 'B4', value: 1 },
            ],
          },
        },
        {
          title: 'Dots and ties',
          text: 'A dot after a note adds half its length again: a dotted half note lasts three beats, a dotted quarter one and a half. A tie joins two notes into one longer sound, which is how you write lengths that cross a barline.',
          definition:
            'A dot adds half the note’s value. A tie joins two notes of the same pitch into a single sustained note.',
          hint: 'Count 1-2-3 on the long note',
          phrase: {
            tempo: 100,
            click: 4,
            hits: [
              { n: 60, at: 0, dur: 3 },
              { n: 62, at: 3, dur: 1 },
              { n: 64, at: 4, dur: 1.5 },
              { n: 65, at: 5.5, dur: 0.5 },
              { n: 67, at: 6, dur: 2 },
            ],
          },
          staff: {
            clef: 'treble',
            time: [4, 4],
            counts: true,
            notes: [
              { pitch: 'C4', value: 3, count: '1 2 3' },
              { pitch: 'D4', value: 1, count: '4' },
              { pitch: 'E4', value: 1.5, count: '1 &' },
              { pitch: 'F4', value: 0.5, count: 'a' },
              { pitch: 'G4', value: 2, count: '3 4' },
            ],
          },
        },
        {
          title: 'Triplets',
          text: 'A triplet squeezes three notes into the time of two. Three eighth-note triplets fill one beat instead of two eighths. Count them "tri-pl-et" — evenly, without hurrying the last one.',
          definition:
            'A triplet divides a note value into three equal parts instead of two. It is marked with a bracket and a 3.',
          hint: 'Three notes per beat, evenly',
          phrase: {
            tempo: 92,
            click: 4,
            hits: [0, 1 / 3, 2 / 3, 1, 4 / 3, 5 / 3, 2, 7 / 3, 8 / 3, 3].map((at, i) => ({
              n: [60, 64, 67, 72, 67, 64, 60, 64, 67, 72][i],
              at,
              dur: 1 / 3,
            })),
          },
          staff: {
            clef: 'treble',
            time: [4, 4],
            notes: [
              { pitch: 'C4', value: 0.5, triplet: true },
              { pitch: 'E4', value: 0.5, triplet: true },
              { pitch: 'G4', value: 0.5, triplet: true },
              { pitch: 'C5', value: 0.5, triplet: true },
              { pitch: 'G4', value: 0.5, triplet: true },
              { pitch: 'E4', value: 0.5, triplet: true },
            ],
          },
        },
        {
          title: 'Rests',
          text: 'Silence is written as carefully as sound. Each note value has a matching rest, and a rest is not a pause — it lasts exactly as long as its note would, and you keep counting through it.',
          definition:
            'A rest is a measured silence. Whole, half, quarter, eighth and sixteenth rests match the note values of the same name.',
          hint: 'Keep counting through the gaps',
          phrase: {
            tempo: 100,
            click: 4,
            hits: [
              { n: 60, at: 0, dur: 1 },
              { n: 64, at: 2, dur: 1 },
              { n: 67, at: 4, dur: 0.5 },
              { n: 72, at: 5, dur: 0.5 },
              { n: 67, at: 6, dur: 2 },
            ],
          },
          staff: {
            clef: 'treble',
            time: [4, 4],
            counts: true,
            notes: [
              { pitch: 'C4', value: 1, count: '1' },
              { value: 1, rest: true, count: '2' },
              { pitch: 'E4', value: 1, count: '3' },
              { value: 1, rest: true, count: '4' },
              { pitch: 'G4', value: 0.5, count: '1' },
              { value: 0.5, rest: true, count: '&' },
              { pitch: 'C5', value: 0.5, count: '2' },
              { value: 0.5, rest: true, count: '&' },
              { pitch: 'G4', value: 2, count: '3 4' },
            ],
          },
        },
      ],
    },

    {
      title: 'Time signatures and counting',
      duration: '12 min',
      summary: 'What the two numbers mean, and how 4/4, 3/4 and 6/8 actually feel.',
      steps: [
        {
          title: 'What the numbers mean',
          text: 'The top number is how many beats fill a bar. The bottom number says which note value counts as one beat: 4 means a quarter note, 8 means an eighth. So 3/4 is three quarter-note beats to a bar.',
          definition:
            'A time signature gives beats per bar (top) and the note value of the beat (bottom).',
          hint: 'Four even beats, accent on the first',
          phrase: {
            tempo: 104,
            click: 4,
            hits: [
              { n: 60, at: 0, vel: 0.9 },
              { n: 60, at: 1, vel: 0.55 },
              { n: 60, at: 2, vel: 0.55 },
              { n: 60, at: 3, vel: 0.55 },
            ],
          },
          highlight: [60],
          staff: {
            clef: 'treble',
            time: [4, 4],
            counts: true,
            notes: [
              { pitch: 'C4', value: 1, count: '1', mark: 'accent' },
              { pitch: 'C4', value: 1, count: '2' },
              { pitch: 'C4', value: 1, count: '3' },
              { pitch: 'C4', value: 1, count: '4' },
            ],
          },
        },
        {
          title: 'Three-four: a waltz',
          text: 'Three beats to a bar, with the weight on the first. Play the bass note on 1 and the chord on 2 and 3 and you have the oldest accompaniment in the book.',
          definition:
            '3/4 is three quarter-note beats per bar. The first beat is strong, the other two weak.',
          hint: 'ONE two three, ONE two three',
          phrase: {
            tempo: 132,
            click: 3,
            hits: [
              { n: 48, at: 0, dur: 1, vel: 0.9, hand: 'L' },
              { n: [60, 64, 67], at: 1, dur: 1, vel: 0.5, hand: 'R' },
              { n: [60, 64, 67], at: 2, dur: 1, vel: 0.5, hand: 'R' },
              { n: 43, at: 3, dur: 1, vel: 0.9, hand: 'L' },
              { n: [59, 62, 67], at: 4, dur: 1, vel: 0.5, hand: 'R' },
              { n: [59, 62, 67], at: 5, dur: 1, vel: 0.5, hand: 'R' },
            ],
          },
          highlight: [48, 43, 60, 64, 67, 59, 62],
        },
        {
          title: 'Six-eight: two big beats',
          text: '6/8 has six eighth notes to a bar, but you do not count six — you feel two, each divided into three. Count "ONE-two-three FOUR-five-six" and let the 1 and the 4 carry the weight. It is the lilt of a jig or a slow ballad.',
          definition:
            '6/8 is a compound metre: six eighth notes grouped as two beats of three.',
          hint: 'Feel two beats of three, not six',
          phrase: {
            tempo: 150,
            click: 3,
            hits: [60, 64, 67, 72, 67, 64].map((n, i) => ({
              n,
              at: i,
              dur: 1,
              vel: i % 3 === 0 ? 0.9 : 0.5,
            })),
          },
          staff: {
            clef: 'treble',
            time: [6, 8],
            counts: true,
            notes: [
              { pitch: 'C4', value: 1, count: '1', mark: 'accent' },
              { pitch: 'E4', value: 1, count: '2' },
              { pitch: 'G4', value: 1, count: '3' },
              { pitch: 'C5', value: 1, count: '4', mark: 'accent' },
              { pitch: 'G4', value: 1, count: '5' },
              { pitch: 'E4', value: 1, count: '6' },
            ],
          },
        },
        {
          title: 'Which metre is it?',
          text: 'Listen for where the weight falls. If the accent comes round every three beats it is a waltz; every four, common time; if each beat splits into three, it is compound.',
          definition:
            'Metre is the pattern of strong and weak beats. You identify it by counting to the next accent.',
          hint: 'Count until the accent comes back',
          quiz: {
            prompt: 'How many beats to a bar?',
            options: ['2/4', '3/4', '4/4', '6/8'],
            questions: [
              {
                answer: '3/4',
                phrase: {
                  tempo: 138,
                  hits: [0, 1, 2, 3, 4, 5].map((at) => ({
                    n: [60, 64, 67, 60, 64, 67][at],
                    at,
                    vel: at % 3 === 0 ? 0.95 : 0.45,
                  })),
                },
              },
              {
                answer: '4/4',
                phrase: {
                  tempo: 112,
                  hits: [0, 1, 2, 3, 4, 5, 6, 7].map((at) => ({
                    n: 60 + [0, 4, 7, 4, 0, 4, 7, 4][at],
                    at,
                    vel: at % 4 === 0 ? 0.95 : 0.45,
                  })),
                },
              },
              {
                answer: '6/8',
                phrase: {
                  tempo: 156,
                  hits: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((at) => ({
                    n: 60 + [0, 4, 7, 12, 7, 4, 0, 4, 7, 12, 7, 4][at],
                    at,
                    vel: at % 3 === 0 ? 0.9 : 0.4,
                  })),
                },
              },
              {
                answer: '2/4',
                phrase: {
                  tempo: 110,
                  hits: [0, 1, 2, 3, 4, 5].map((at) => ({
                    n: at % 2 === 0 ? 48 : 60,
                    at,
                    vel: at % 2 === 0 ? 0.95 : 0.45,
                  })),
                },
              },
            ],
          },
        },
      ],
    },

    {
      title: 'Sharps, flats and enharmonics',
      duration: '10 min',
      summary: 'Accidentals, what they do to a bar, and why one key has two names.',
      steps: [
        {
          title: 'Raising and lowering',
          text: 'A sharp raises a note by one key; a flat lowers it by one. Not by one letter — by one key, black or white. C♯ is the black key right of C; F♭ is the white key left of F, which is E.',
          definition:
            'Sharp (♯) raises a pitch one semitone. Flat (♭) lowers it one semitone. A natural (♮) cancels either.',
          hint: 'C, then C♯, then C again',
          highlight: [60, 61],
          phrase: seq([60, 61, 60], { step: 1 }),
          staff: {
            clef: 'treble',
            notes: [
              { pitch: 'C4', value: 1 },
              { pitch: 'C#4', value: 1 },
              { pitch: 'C4', value: 1, accidental: 'n' },
            ],
          },
        },
        {
          title: 'An accidental lasts the bar',
          text: 'Once you write a sharp, it applies to that note for the rest of the bar — you do not repeat it. The barline cancels it. A natural sign takes it back early.',
          definition:
            'An accidental applies to its pitch for the remainder of the bar in which it appears, and no further.',
          hint: 'The second F is still sharp; the third is not',
          highlight: [65, 66],
          phrase: seq([66, 67, 66, 65], { step: 1 }),
          staff: {
            clef: 'treble',
            time: [4, 4],
            notes: [
              { pitch: 'F#4', value: 1 },
              { pitch: 'G4', value: 1 },
              { pitch: 'F#4', value: 1 },
              { pitch: 'A4', value: 1 },
              { pitch: 'F4', value: 1, accidental: 'n' },
              { pitch: 'G4', value: 1 },
              { pitch: 'A4', value: 2 },
            ],
          },
        },
        {
          title: 'Two names, one key',
          text: 'C♯ and D♭ are the same key. So are F♯/G♭ and A♯/B♭. Which spelling is correct depends on the key you are in and where the line is going — a rising line tends to use sharps, a falling one flats.',
          definition:
            'Enharmonic equivalents are two spellings of the same pitch. E♯ is F, and C♭ is B.',
          hint: 'The same five black keys, named both ways',
          highlight: [61, 63, 66, 68, 70],
          phrase: seq([61, 63, 66, 68, 70], { step: 0.6 }),
          alt: {
            label: 'Hear it as flats',
            phrase: seq([70, 68, 66, 63, 61], { step: 0.6 }),
            highlight: [61, 63, 66, 68, 70],
          },
        },
        {
          title: 'Sharp, flat or natural?',
          text: 'Two notes, one after the other. Was the second one a semitone up, a semitone down, or the same note again?',
          definition:
            'Hearing a semitone move is the smallest discrimination the ear has to make, and the foundation of everything in Unit 3.',
          hint: 'Listen for the direction of the move',
          quiz: {
            prompt: 'What happened to the second note?',
            options: ['Raised a semitone', 'Lowered a semitone', 'Unchanged'],
            questions: [
              { phrase: seq([60, 61], { step: 1 }), answer: 'Raised a semitone' },
              { phrase: seq([67, 66], { step: 1 }), answer: 'Lowered a semitone' },
              { phrase: seq([64, 64], { step: 1 }), answer: 'Unchanged' },
              { phrase: seq([69, 68], { step: 1 }), answer: 'Lowered a semitone' },
              { phrase: seq([62, 63], { step: 1 }), answer: 'Raised a semitone' },
            ],
          },
        },
      ],
    },
  ],
}

/** Re-exported so the unit files can share a consistent two-hand demo shape. */
export const handsTogether = (left: number[], right: number[]) =>
  together(seq(left, { hand: 'L' }), seq(right, { hand: 'R' }))

export const blockThen = (notes: number[]) => then(chord(notes), seq(notes))
