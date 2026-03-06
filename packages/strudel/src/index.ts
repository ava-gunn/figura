import type { ResolvedFigure } from "@harmonics/core"

/**
 * Converts a ResolvedFigure into Strudel mini-notation strings.
 *
 * ## Output strings
 *
 * ### notes
 * Absolute note names with inline duration encoding:
 *   - tie      → append `_` to note name  e.g. "D4_"
 *   - staccato → append `/2`              e.g. "B4/2"
 *   - rest     → `~`
 *
 * ### struct
 * Binary play/rest pattern for `.struct()`:
 *   - play/staccato/accent → "t"
 *   - rest/tie             → "f"
 *
 * ### velocity
 * Per-note velocity values for `.velocity()`:
 *   - accent → "1"
 *   - normal → "0.8"
 *   - rest   → "0"    (positional placeholder)
 *
 * ## Usage in Strudel
 * ```javascript
 * const { notes, struct, velocity } = toMiniNotation(resolved)
 * note(notes).struct(struct).velocity(velocity).sound("piano")
 * ```
 *
 * ## Chord voicings (future)
 * Currently monophonic only. Polyphonic chord voicings would use
 * Strudel bracket syntax: "[D3,F3,A3,C4]"
 */
export function toMiniNotation(figure: ResolvedFigure): {
  notes:    string
  struct:   string
  velocity: string
} {
  void figure
  throw new Error("Not implemented")
}
