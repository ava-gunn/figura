// ============================================================================
// Pop Ballad — Legato Melody over a Classic Turnaround
// ============================================================================
//
// Style:       Pop / Singer-Songwriter
// Key:         Eb major
// Progression: IM7 (Ebmaj7) → vim7 (Cm7) → IVM7 (Abmaj7) → V7 (Bb7)
//
// The I-vi-IV-V is one of pop music's most-used progressions. Each chord
// is held for 2 beats to create a slower, ballad-like feel. The melody
// uses ties for a smooth legato line, and the chords arpeggiate gently.
//
// Features demonstrated:
//   - Flat key (Eb major) — demonstrates accidental handling
//   - Chord durations > 1 for slower harmonic rhythm
//   - Legato melody via tie (_) tokens
//   - Arpeggiated chord figure
//   - vim7 chord (aeolian mode)
// ============================================================================

import { parseFigure, parseRhythm, expandProgression, resolvePhrase } from "@figura/core"
import { toMiniNotation } from "@figura/strudel"

// --- Harmony ---
// Each chord held for 2 beats — half the harmonic speed of the jazz example.
const progression = expandProgression({
  key: "Eb",
  chords: [
    { roman: "IM7",  duration: 2 },  // Ebmaj7
    { roman: "vim7", duration: 2 },  // Cm7
    { roman: "IVM7", duration: 2 },  // Abmaj7
    { roman: "V7",   duration: 2 },  // Bb7
  ],
})

// --- Melody ---
// A gentle stepwise melody with ties creating a legato, singing quality.
// The anchors fall on chord tones to keep things consonant.
const melodyFigure = parseFigure("1* 2 3 5 4* 3 2 1*")
const melodyRhythm = parseRhythm("1 _ 1 _ 1 _ 1 _")
const melody = resolvePhrase(melodyFigure, melodyRhythm, progression, "melody")
const melodyOut = toMiniNotation(melody)

// --- Chords (arpeggiated) ---
// Rolling through all four chord tones for a gentle arpeggio.
const chordFigure = parseFigure("1 2 3 4")
const chordRhythm = parseRhythm("1 1 1 1")
const chords = resolvePhrase(chordFigure, chordRhythm, progression, "chord")
const chordsOut = toMiniNotation(chords)

// --- Strudel Playback ---
stack(
  note(melodyOut.notes)
    .struct(melodyOut.struct)
    .velocity(melodyOut.velocity)
    .sound("piano"),
  note(chordsOut.notes)
    .struct(chordsOut.struct)
    .velocity(chordsOut.velocity)
    .sound("piano"),
)
