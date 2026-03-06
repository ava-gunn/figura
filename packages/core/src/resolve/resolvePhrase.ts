import type { FigureType, HarmonyContext, ResolvedFigure } from "../types/index.js"
import type { FigureToken } from "../types/index.js"
import type { RhythmToken } from "../types/index.js"

/**
 * The core resolution function — the heart of the harmonics algebra.
 *
 * Combines a parsed figure, a parsed rhythm, and a harmony context into
 * a fully resolved sequence of musical events.
 *
 * ## The algebra
 * ```
 * figure (symbolic) + harmony (context) → absolute notes
 * rhythm (temporal) + notes             → articulated events
 * ```
 *
 * ## Resolution order
 * 1. Identify the anchor token in the figure
 * 2. Resolve the anchor against the strongest chord tone first
 * 3. Resolve all remaining tokens relative to the anchor's resolved pitch
 *    (voice leading: prefer minimal interval motion)
 * 4. Apply rhythm tokens (rest, tie, staccato, accent) to resolved notes
 * 5. Apply octaveDown modifier to any flagged tokens
 *
 * ## Figure type determines pitch space
 * - "melody" → resolveScaleDegree (7 diatonic tones)
 * - "chord"  → resolveChordDegree (chord tones only)
 * - "bass"   → resolveChordDegree forced to low octave (2–3)
 *
 * ## Rhythm/figure length mismatch
 * If figure and rhythm arrays differ in length, they cycle independently
 * (like Strudel pattern polyrhythm). Resolution length = LCM of both lengths.
 *
 * ## Anchor on a rest
 * If the anchor figure token aligns with a rest rhythm token, the rest wins.
 * The anchor's importance shifts to the nearest non-rest played note.
 *
 * ## Example
 * ```
 * figure:  [{degree:1, anchor:true, octaveDown:false}, {degree:3,...}, ...]
 * rhythm:  [{play:true, tie:false, ...}, {play:false, tie:true, ...}, ...]
 * context: { key:"C", chord:"Dm7", scale:"D dorian", roman:"iim7" }
 * type:    "melody"
 *
 * → ResolvedFigure {
 *     type: "melody",
 *     events: [
 *       { note:"D4", degree:1, anchor:true,  duration:1,   velocity:0.8, tie:false },
 *       { note:"D4", degree:1, anchor:false, duration:1,   velocity:0.8, tie:true  },
 *       ...
 *     ]
 *   }
 * ```
 */
export function resolvePhrase(
  _figure:  FigureToken[],
  _rhythm:  RhythmToken[],
  _context: HarmonyContext,
  _type:    FigureType,
): ResolvedFigure {
  throw new Error("Not implemented")
}
