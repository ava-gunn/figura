import type { FigureToken } from "../types/index.js"

/**
 * Parses a figure DSL string into an array of FigureTokens.
 *
 * ## DSL Syntax
 * Tokens are space-separated. Each token is a degree (1–7) with optional modifiers:
 *
 *   `*`  anchor     — the most important note; resolved against the strongest
 *                     chord tone first, all other notes fit around it
 *   `-`  octaveDown — drop the resolved pitch one octave
 *
 * Modifiers may appear in any order after the degree digit.
 *
 * ## Figure Type affects resolution (not parsing)
 * The same figure string is interpreted differently depending on FigureType:
 *   - "melody" → degrees index the active chord's scale (7 tones)
 *   - "chord"  → degrees index chord tones only (4 tones for 7th chords)
 *   - "bass"   → degrees index chord tones, forced to low register
 *
 * ## Examples
 * ```
 * "1* 3 5 3 2* 1"      simple melodic phrase, anchors on 1 and 2
 * "1*- 5 1 3"          bass figure, low root anchor
 * "1* 3- 5 7"          chord figure with low third
 * ```
 *
 * @throws if input is empty
 * @throws if a degree is not in range 1–7
 * @throws if a token contains unrecognised characters
 */
export function parseFigure(_input: string): FigureToken[] {
  throw new Error("Not implemented")
}
