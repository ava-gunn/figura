// ============================================================================
// Latin Bossa Nova — Syncopated Rhythm and Smooth Melody
// ============================================================================
//
// Style:       Bossa Nova / Latin Jazz
// Key:         F major
// Progression: IM7 (Fmaj7) → iim7 (Gm7) → iiim7 (Am7) → iim7 (Gm7)
//
// Bossa nova is defined by its syncopated rhythmic feel. The melody
// floats over the beat while the bass provides a characteristic
// long-short pattern via staccato. The iiim7 (A phrygian) adds a
// darker color before resolving back to iim7.
//
// Features demonstrated:
//   - Key of F major
//   - iiim7 chord (phrygian mode)
//   - Syncopated rhythm via rests (~) and ties (_)
//   - Bass with staccato (.) for the bossa "long-short" feel
//   - Melody, chord, and bass layers
//   - Stepwise melodic motion across chord changes
// ============================================================================

import { parseFigure, parseRhythm, expandProgression, resolvePhrase } from "@figura/core"
import { toMiniNotation } from "@figura/strudel"

// --- Harmony ---
const progression = expandProgression({
  key: "F",
  chords: [
    { roman: "IM7",   duration: 2 },  // Fmaj7
    { roman: "iim7",  duration: 2 },  // Gm7
    { roman: "iiim7", duration: 2 },  // Am7 — A phrygian, darker color
    { roman: "iim7",  duration: 2 },  // Gm7 — resolves back
  ],
})

// --- Melody ---
// Stepwise motion with syncopation: the ties and rests push notes
// off the beat, creating the signature bossa float.
const melodyFigure = parseFigure("1* 3 2 4 3* 5 4 2")
const melodyRhythm = parseRhythm("1 ~ 1 _ 1 ~ 1 _")
const melody = resolvePhrase(melodyFigure, melodyRhythm, progression, "melody")
const melodyOut = toMiniNotation(melody)

// --- Chords ---
// Off-beat comping with all four chord tones voiced.
// Rhythm plays on beats 2 and 4 (off-beat), rests on 1 and 3.
const chordFigure = parseFigure("1 3 2 4")
const chordRhythm = parseRhythm("1 ~ 1 ~")
const chords = resolvePhrase(chordFigure, chordRhythm, progression, "chord")
const chordsOut = toMiniNotation(chords)

// --- Bass ---
// The bossa bass pattern: long note followed by a short (staccato) pickup.
const bassFigure = parseFigure("1*- 3")
const bassRhythm = parseRhythm("1 .")
const bass = resolvePhrase(bassFigure, bassRhythm, progression, "bass")
const bassOut = toMiniNotation(bass)

// --- Strudel Playback ---
stack(
  note(melodyOut.notes)
    .struct(melodyOut.struct)
    .velocity(melodyOut.velocity)
    .sound("piano"),
  note(chordsOut.notes)
    .struct(chordsOut.struct)
    .velocity(chordsOut.velocity)
    .sound("gm_electric_piano_1"),
  note(bassOut.notes)
    .struct(bassOut.struct)
    .velocity(bassOut.velocity)
    .sound("bass"),
)
