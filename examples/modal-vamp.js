// ============================================================================
// Modal Vamp — Ambient Exploration over D Dorian
// ============================================================================
//
// Style:       Modal / Ambient
// Key:         C major
// Progression: iim7 (Dm7) — single chord context
//
// Modal jazz sits on one chord and lets the melody explore the entire
// scale. Think Miles Davis "So What" or Herbie Hancock "Maiden Voyage".
// The single iim7 gives us D dorian: D E F G A B C — all 7 degrees
// are available to the melody.
//
// Features demonstrated:
//   - Single HarmonyContext (no progression array — resolver uses LCM cycling)
//   - All 7 scale degrees used in the figure
//   - LCM cycling: figure (7 tokens) and rhythm (5 tokens) have different
//     lengths, so the resolver cycles both to LCM(7,5) = 35 positions
//   - Spacious rhythm with rests (~) and ties (_)
// ============================================================================

import { parseFigure, parseRhythm, expandProgression, resolvePhrase } from "@figura/core"
import { toMiniNotation } from "@figura/strudel"

// --- Harmony ---
// A single HarmonyContext (not an array). When resolvePhrase receives a
// single context, it uses LCM(figure.length, rhythm.length) to determine
// output length — no need to hardcode the duration.
const [harmony] = expandProgression({
  key: "C",
  chords: [
    { roman: "iim7", duration: 1 },  // Dm7 — D dorian
  ],
})

// --- Melody ---
// 7 tokens cycling through all scale degrees. The rhythm has 5 tokens.
// LCM(7, 5) = 35 — the resolver will produce 35 events, cycling both
// arrays independently. This creates evolving combinations as figure
// and rhythm go in and out of phase.
const melodyFigure = parseFigure("1* 2 3 4 5 6 7")   // 7 tokens — full dorian scale
const melodyRhythm = parseRhythm("1 ~ 1 _ ~")         // 5 tokens — spacious, breathing

const melody = resolvePhrase(melodyFigure, melodyRhythm, harmony, "melody")
const melodyOut = toMiniNotation(melody)

// --- Strudel Playback ---
// A single voice for an ambient, meditative texture.
note(melodyOut.notes)
  .struct(melodyOut.struct)
  .velocity(melodyOut.velocity)
  .sound("sine")
