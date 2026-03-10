import type { ResolvedFigure } from "@figura/core"

export type StrudelOutput = {
  notes: string
  struct: string
  velocity: string
}

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
export function toMiniNotation(figure: ResolvedFigure): StrudelOutput {
  const notesParts: string[] = []
  const structParts: string[] = []
  const velocityParts: string[] = []

  for (const ev of figure.events) {
    if (ev.note === "~") {
      // Rest
      notesParts.push("~")
      structParts.push("f")
      velocityParts.push("0")
    } else {
      // Velocity encoding (only for non-rest events)
      const vel = ev.velocity === 0 ? "0" : ev.velocity === 1 ? "1" : "0.8"

      if (ev.tie) {
        // Tie — sustain previous note (resolver already set ev.note to sustained note)
        notesParts.push(`${ev.note}_`)
        structParts.push("f")
        velocityParts.push(vel)
      } else if (ev.duration === 0.5) {
        // Staccato
        notesParts.push(`${ev.note}/2`)
        structParts.push("t")
        velocityParts.push(vel)
      } else {
        // Normal
        notesParts.push(ev.note)
        structParts.push("t")
        velocityParts.push(vel)
      }
    }
  }

  return {
    notes: notesParts.join(" "),
    struct: structParts.join(" "),
    velocity: velocityParts.join(" "),
  }
}
