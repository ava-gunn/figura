// ============================================================================
// Jazz Turnaround — Accents and Staccato Articulations
// ============================================================================
//
// Style:       Jazz (blues-influenced)
// Key:         C major
// Progression: IM7 (Cmaj7) → IVM7 (Fmaj7) → V7 (G7) → IM7 (Cmaj7)
//
// A I-IV-V-I turnaround with a rhythmic, blues-influenced feel. The IM7
// and IVM7 chords produce major 7ths (Cmaj7, Fmaj7) rather than true
// blues dominant 7ths (C7, F7), giving this a jazz character. The rhythmic
// pattern — heavy accents and staccato — adds drive and energy.
//
// Features demonstrated:
//   - Accent (!) for velocity emphasis (0.8 → 1.0)
//   - Staccato (.) for half-duration notes
//   - Mixed articulations in a single rhythm pattern
//   - Figure rest (~) in the melody for rhythmic breathing
//   - Melody and bass layers
// ============================================================================

import { parseFigure, parseRhythm, expandProgression, resolvePhrase } from "@figura/core"
import { toMiniNotation } from "@figura/strudel"

// --- Harmony ---
const progression = expandProgression({
  key: "C",
  chords: [
    { roman: "IM7",  duration: 2 },  // Cmaj7
    { roman: "IVM7", duration: 2 },  // Fmaj7
    { roman: "V7",   duration: 2 },  // G7
    { roman: "IM7",  duration: 2 },  // Cmaj7
  ],
})

// --- Melody ---
// Accented downbeats with staccato upbeats. A figure rest (~) at position 5
// creates a rhythmic gap — the rhythm still says "play" but the figure
// rest wins, producing silence.
const melodyFigure = parseFigure("1* 3 5 3 1* ~ 3 5")
const melodyRhythm = parseRhythm("! . 1 . ! . 1 .")
const melody = resolvePhrase(melodyFigure, melodyRhythm, progression, "melody")
const melodyOut = toMiniNotation(melody)

// --- Bass ---
// Root-fifth motion with accents for a driving bass line.
const bassFigure = parseFigure("1*- 1 3 1")
const bassRhythm = parseRhythm("! 1 ! 1")
const bass = resolvePhrase(bassFigure, bassRhythm, progression, "bass")
const bassOut = toMiniNotation(bass)

// --- Strudel Playback ---
stack(
  note(melodyOut.notes)
    .struct(melodyOut.struct)
    .velocity(melodyOut.velocity)
    .sound("sawtooth"),
  note(bassOut.notes)
    .struct(bassOut.struct)
    .velocity(bassOut.velocity)
    .sound("bass"),
)
