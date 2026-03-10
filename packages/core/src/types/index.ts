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
 * Discriminated union: rest tokens have no degree/modifier fields.
 *
 * e.g. "1*-" → { rest: false, degree: 1, anchor: true, octaveDown: true }
 * e.g. "~"   → { rest: true }
 */
export type FigureToken =
  | { rest: false; degree: number; anchor: boolean; octaveDown: boolean }
  | { rest: true }

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

// ─── Harmony Context ─────────────────────────────────────────────────────────

/**
 * The full harmonic context passed to the resolver at evaluation time.
 * Represents one "slot" in the harmony timeline.
 * One HarmonyContext per output position — expandProgression() handles expansion.
 */
export type HarmonyContext = {
  key:        string     // e.g. "C", "Eb", "F#"
  roman:      string     // original roman numeral e.g. "iim7"
  chord:      string     // concrete chord name e.g. "Dm7"
  scale:      string[]   // pitch classes e.g. ["D","E","F","G","A","B","C"]
  chordTones: string[]   // pitch classes e.g. ["D","F","A","C"]
}

/**
 * User-friendly progression format.
 * expandProgression() converts this to HarmonyContext[] (one per output position).
 */
export type Progression = {
  key:    string
  chords: { roman: string; duration: number }[]
}

// ─── Resolved Output ──────────────────────────────────────────────────────────

/**
 * A single resolved musical event — the output of combining one FigureToken
 * with one RhythmToken against an active chord/scale context.
 */
export type ResolvedEvent = {
  note:     string   // absolute note name e.g. "D4", "~" for rests
  degree:   number   // original symbolic degree, 0 for rests
  anchor:   boolean  // was this the anchor note?
  duration: number   // 1 = full step, 0.5 = staccato, 0 = rest
  velocity: number   // 0.8 = normal, 1.0 = accent, 0 = rest
  tie:      boolean  // true on the sustained position (tie continuation, not originator)
}

/**
 * The fully resolved output of a figure+rhythm pair against a harmony context.
 * Contains type and events only — Strudel strings are produced by toMiniNotation().
 */
export type ResolvedFigure = {
  type:   FigureType
  events: ResolvedEvent[]
}

// ─── Debug / Options ─────────────────────────────────────────────────────────

/**
 * Per-position trace output for debug mode.
 */
export type PositionTrace = {
  position:     number
  figureToken:  FigureToken
  rhythmToken:  RhythmToken
  harmony:      HarmonyContext
  pitchPool:    string[]
  resolvedNote: string | null
}

/**
 * Options bag for resolvePhrase.
 * debug: true logs to console; callback captures traces programmatically.
 */
export type ResolveOptions = {
  type:   FigureType
  debug?: boolean | ((trace: PositionTrace) => void)
}
