// ============================================================================
// Jazz ii-V-I — The "Hello World" of Figura
// ============================================================================
//
// Style:       Jazz
// Key:         C major
// Progression: iim7 (Dm7) → V7 (G7) → IM7 (Cmaj7)
//
// This is the most common cadence in jazz. The melody uses the canonical
// reference phrase from the figura design session. Three layers are
// stacked: melody, chord comping, and a walking bass line.
//
// Features demonstrated:
//   - Full pipeline: expandProgression → parseFigure → parseRhythm → resolvePhrase → toMiniNotation
//   - All three figure types: melody, chord, bass
//   - Strudel stack() for layering parts
//   - Rhythm DSL: play (1), tie (_), staccato (.), rest (~), accent (!)
//   - Figure DSL: anchor (*), octave-down (-)
// ============================================================================
const { parseFigure, parseRhythm, expandProgression, resolvePhrase } =
  await import('https://cdn.jsdelivr.net/gh/ava-gunn/figura@main/packages/core/dist/index.js')
const { toMiniNotation } =
  await import('https://cdn.jsdelivr.net/gh/ava-gunn/figura@main/packages/strudel/dist/index.js')

// --- Harmony ---
// Define the chord progression. Duration = number of figure/rhythm slots
// per chord. expandProgression converts roman numerals into HarmonyContext[]
// — one context per slot, with scale and chord tone arrays resolved.
// The 8-token melody (3+3+2) gives ii and V more time to develop tension
// before a shorter resolution on the I chord.
const progression = expandProgression({
  key: 'C',
  chords: [
    { roman: 'iim7', duration: 3 }, // Dm7 — D dorian (3 slots)
    { roman: 'V7', duration: 3 }, // G7  — G mixolydian (3 slots)
    { roman: 'IM7', duration: 2 }, // Cmaj7 — C ionian (2 slots — resolution)
  ],
})

// --- Melody ---
// Figure: degrees 1-7 index the active chord's SCALE (7 tones).
// Anchors (*) mark structurally important notes. Octave-down (-) drops a note.
// Rhythm: 1=play, _=tie (sustain), .=staccato (half duration), ~=rest, !=accent
const melodyFigure = parseFigure('1* 3 5 3 2* 1 7- 1*')
const melodyRhythm = parseRhythm('1 _ 1 . ~ ! 1 _')
const melody = resolvePhrase(melodyFigure, melodyRhythm, progression, 'melody')
const melodyOut = toMiniNotation(melody)

// --- Chords (comping) ---
// Figure type "chord" — degrees 1-4 index CHORD TONES only (e.g. Dm7 = D,F,A,C).
// A simple rhythmic comping pattern: hit, rest, hit, tie.
const chordFigure = parseFigure('1 3 2 4')
const chordRhythm = parseRhythm('1 ~ 1 _')
const chords = resolvePhrase(chordFigure, chordRhythm, progression, 'chord')
const chordsOut = toMiniNotation(chords)

// --- Bass ---
// Figure type "bass" — like chord, but placed in the low register.
// Octave-down (-) on the root anchor for a deep bass tone.
const bassFigure = parseFigure('1*- 3 1 2')
const bassRhythm = parseRhythm('1 1 1 1')
const bass = resolvePhrase(bassFigure, bassRhythm, progression, 'bass')
const bassOut = toMiniNotation(bass)

// --- Strudel Playback ---
// note() sets the pitch pattern, struct() gates play/rest,
// velocity() controls dynamics, sound() picks the instrument.
stack(
  note(melodyOut.notes)
    .struct(melodyOut.struct)
    .velocity(melodyOut.velocity)
    .sound('piano'),
  note(chordsOut.notes)
    .struct(chordsOut.struct)
    .velocity(chordsOut.velocity)
    .sound('piano'),
  note(bassOut.notes)
    .struct(bassOut.struct)
    .velocity(bassOut.velocity)
    .sound('bass'),
)
