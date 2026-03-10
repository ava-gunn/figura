// ============================================================================
// Classical Arpeggio — Rolling Chord Tones
// ============================================================================
//
// Style:       Classical
// Key:         C major
// Progression: IM7 (Cmaj7) → IVM7 (Fmaj7) → vim7 (Am7) → V7 (G7)
//
// Inspired by Alberti bass and Pachelbel-style arpeggiation. The chord
// figure rolls up and down through all four chord tones, creating a
// flowing, harp-like texture. The rhythm is perfectly even — no
// articulation, just pure motion.
//
// Features demonstrated:
//   - Figure type "chord" — degrees index chord tones (4 notes for 7th chords)
//   - Even rhythm with no articulation (all play tokens)
//   - Rolling arpeggio pattern: 1 2 3 4 3 2
//   - Layered bass root notes
//   - vim7 chord (A aeolian)
// ============================================================================

const { parseFigure, parseRhythm, expandProgression, resolvePhrase } = await import('https://cdn.jsdelivr.net/gh/ava-gunn/figura@main/packages/core/dist/index.js')
const { toMiniNotation } = await import('https://cdn.jsdelivr.net/gh/ava-gunn/figura@main/packages/strudel/dist/index.js')

// --- Harmony ---
const progression = expandProgression({
  key: "C",
  chords: [
    { roman: "IM7",  duration: 6 },  // Cmaj7 — 6 beats for one full arpeggio cycle
    { roman: "IVM7", duration: 6 },  // Fmaj7
    { roman: "vim7", duration: 6 },  // Am7
    { roman: "V7",   duration: 6 },  // G7
  ],
})

// --- Arpeggio ---
// Using "chord" type: degree 1=root, 2=third, 3=fifth, 4=seventh.
// The pattern rolls up (1 2 3 4) then back down (3 2), repeating.
const arpFigure = parseFigure("1 2 3 4 3 2")
const arpRhythm = parseRhythm("1 1 1 1 1 1")
const arpeggio = resolvePhrase(arpFigure, arpRhythm, progression, "chord")
const arpOut = toMiniNotation(arpeggio)

// --- Bass ---
// Sustained root notes anchoring each chord. One note per chord,
// held with ties for the full duration.
const bassFigure = parseFigure("1*-")
const bassRhythm = parseRhythm("1 _ _ _ _ _")
const bass = resolvePhrase(bassFigure, bassRhythm, progression, "bass")
const bassOut = toMiniNotation(bass)

// --- Strudel Playback ---
stack(
  note(arpOut.notes)
    .struct(arpOut.struct)
    .velocity(arpOut.velocity)
    .sound("piano"),
  note(bassOut.notes)
    .struct(bassOut.struct)
    .velocity(bassOut.velocity)
    .sound("piano"),
)
