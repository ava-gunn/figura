// ─── Figure Types ────────────────────────────────────────────────────────────

/**
 * Determines which pitch space degree numbers index into:
 * - "melody"  → scale tones (7 degrees, diatonic to active chord's scale)
 * - "chord"   → chord tones only (4 degrees for 7th chords)
 * - "bass"    → root-relative, always monophonic, low register
 */
export type FigureType = "melody" | "chord" | "bass"

// ─── DSL Tokens ──────────────────────────────────────────────────────────────

/**
 * A single parsed token from the figure DSL string.
 * e.g. "1*-" → { degree: 1, anchor: true, octaveDown: true }
 *
 * Anchor = the most important note in the phrase (Synfire concept).
 * The resolver prioritises landing the anchor on the strongest chord tone,
 * then fits remaining notes around it.
 */
export type FigureToken = {
  degree:     number   // 1–7
  anchor:     boolean  // * modifier — most important note, resolved first
  octaveDown: boolean  // - modifier — drop one octave
}

/**
 * A single parsed token from the rhythm DSL string.
 *
 * DSL chars:
 *   1  = play normally
 *   _  = tie (sustain previous note, no retrigger)
 *   .  = staccato (half duration → Strudel /2)
 *   ~  = rest
 *   !  = accent (higher velocity)
 */
export type RhythmToken = {
  play:     boolean
  tie:      boolean
  accent:   boolean
  staccato: boolean
}

// ─── Roman Numeral / Harmony ──────────────────────────────────────────────────

/**
 * A chord expressed as a roman numeral function within a key.
 * e.g. { numeral: "ii", quality: "m7", degree: 2 }
 *
 * This is the middle abstraction layer:
 *   Key + RomanChord → concrete chord name (e.g. "Dm7")
 *   concrete chord name → scale/chord tones for degree resolution
 */
export type RomanChord = {
  numeral:  string   // "I" | "ii" | "iii" | "IV" | "V" | "vi" | "vii"
  quality:  string   // "maj7" | "m7" | "7" | "m7b5" etc
  degree:   number   // 1–7, scale position of the root
}

// ─── Resolved Output ──────────────────────────────────────────────────────────

/**
 * A single resolved musical event — the output of combining one FigureToken
 * with one RhythmToken against an active chord/scale context.
 */
export type ResolvedEvent = {
  note:     string | null  // absolute note name e.g. "D4", null = rest
  degree:   number         // original symbolic degree, preserved for debugging
  anchor:   boolean        // was this the anchor note?
  duration: number         // 1 = full step, 0.5 = staccato
  velocity: number         // 0.0–1.0
  tie:      boolean        // sustain previous note
}

/**
 * The fully resolved output of a figure+rhythm pair against a harmony context.
 * Contains both the raw events (for further processing) and Strudel-ready strings.
 */
export type ResolvedFigure = {
  type:     FigureType
  events:   ResolvedEvent[]
  // Strudel adapter strings (populated by @harmonics/strudel)
  notes?:    string   // e.g. "D4 D4_ A4 B4/2 ~ G4 B3 B3_"
  struct?:   string   // e.g. "t f t t f t t f"
  velocity?: string   // e.g. "0.8 0.8 0.8 0.8 0.8 1 0.8 0.8"
}

// ─── Harmony Context ─────────────────────────────────────────────────────────

/**
 * The full harmonic context passed to the resolver at evaluation time.
 * Represents one "slot" in the harmony timeline.
 */
export type HarmonyContext = {
  key:       string   // e.g. "C", "Eb", "F#"
  chord:     string   // concrete chord name e.g. "Dm7" (derived from key + roman)
  scale:     string   // scale name e.g. "D dorian" (for melody figure resolution)
  roman:     string   // original roman numeral e.g. "iim7" (for reference)
}
