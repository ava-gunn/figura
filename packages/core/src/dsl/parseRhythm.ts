import type { RhythmToken } from "../types/index.js"

/**
 * Parses a rhythm DSL string into an array of RhythmTokens.
 *
 * ## DSL Syntax
 * Tokens are space-separated single characters:
 *
 *   `1`  play     — trigger the note at normal duration and velocity
 *   `_`  tie      — sustain the previous note (no retrigger)
 *                   → Strudel: appended `_` to previous note name e.g. "D4_"
 *   `.`  staccato — play at half duration
 *                   → Strudel: appended `/2` to note name e.g. "B4/2"
 *   `~`  rest     — silence
 *                   → Strudel: `~` in mini-notation
 *   `!`  accent   — play at higher velocity (1.0 vs default 0.8)
 *                   → Strudel: `.velocity()` parallel pattern
 *
 * ## Strudel mapping
 * Ties and staccato are encoded inline in the note string.
 * Play/rest is encoded as the `.struct()` pattern ("t"/"f").
 * Accent is encoded as the `.velocity()` pattern.
 *
 * ## Examples
 * ```
 * "1 _ 1 . ~ ! 1 _"
 * "1 1 1 1"          four equal hits
 * ". 1 ! ~ 1 _ 1 ."  mixed articulations
 * ```
 *
 * @throws if input is empty
 * @throws if a token is not one of: 1 _ . ~ !
 */
export function parseRhythm(input: string): RhythmToken[] {
  const trimmed = input.trim()
  if (trimmed.length === 0) {
    throw new Error("Invalid rhythm DSL: input is empty")
  }

  const raw = trimmed.split(/\s+/)

  return raw.map((token, index): RhythmToken => {
    switch (token) {
      case "1": return { play: true,  tie: false, staccato: false, accent: false }
      case "_": return { play: false, tie: true,  staccato: false, accent: false }
      case ".": return { play: true,  tie: false, staccato: true,  accent: false }
      case "~": return { play: false, tie: false, staccato: false, accent: false }
      case "!": return { play: true,  tie: false, staccato: false, accent: true  }
      default:
        throw new Error(`Invalid rhythm token "${token}" at position ${index}`)
    }
  })
}
