/**
 * Resolves a scale degree (1–7) to an absolute note name given a scale and octave.
 * Used by the "melody" figure type resolver.
 *
 * Degrees index into the diatonic scale tones of the active chord's scale.
 * Degree 1 = root/tonic, degree 7 = leading tone.
 *
 * ## Octave behaviour
 * The base octave applies to degree 1. Higher degrees stay in the same octave
 * unless they would wrap (degree > scale length), in which case octave increments.
 *
 * ## Examples
 * ```
 * resolveScaleDegree(1, "D dorian", 4)  // → "D4"
 * resolveScaleDegree(3, "D dorian", 4)  // → "F4"
 * resolveScaleDegree(5, "D dorian", 4)  // → "A4"
 * resolveScaleDegree(7, "D dorian", 4)  // → "C5"  (wraps to next octave)
 * resolveScaleDegree(2, "G mixolydian", 4) // → "A4"
 * resolveScaleDegree(3, "C ionian", 4)  // → "E4"
 * ```
 *
 * @throws if degree is not in range 1–7
 * @throws if scaleName is not recognised by tonal
 */
export function resolveScaleDegree(
  _degree: number,
  _scaleName: string,
  _octave = 4,
): string {
  throw new Error("Not implemented")
}
