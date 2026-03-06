/**
 * Resolves a chord degree (1–4 for 7th chords) to an absolute note name.
 * Used by the "chord" and "bass" figure type resolvers.
 *
 * Degrees index into chord tones only — not the full scale.
 * For a 7th chord: 1=root, 2=third, 3=fifth, 4=seventh.
 * Degrees beyond the chord tone count wrap around (modulo).
 *
 * ## Difference from resolveScaleDegree
 * resolveScaleDegree uses all 7 diatonic scale tones.
 * resolveChordDegree uses only the chord tones (typically 4).
 * This means degree 2 resolves differently:
 *   - scale: degree 2 over Dm7 = E (second scale tone)
 *   - chord: degree 2 over Dm7 = F (third of the chord)
 *
 * ## Examples
 * ```
 * resolveChordDegree(1, "Dm7", 4)   // → "D4"  (root)
 * resolveChordDegree(2, "Dm7", 4)   // → "F4"  (third)
 * resolveChordDegree(3, "Dm7", 4)   // → "A4"  (fifth)
 * resolveChordDegree(4, "Dm7", 4)   // → "C5"  (seventh)
 * resolveChordDegree(1, "G7",  4)   // → "G4"
 * resolveChordDegree(2, "G7",  4)   // → "B4"
 * ```
 *
 * @throws if chordName is not recognised by tonal
 * @throws if degree is less than 1
 */
export function resolveChordDegree(
  _degree: number,
  _chordName: string,
  _octave = 4,
): string {
  throw new Error("Not implemented")
}
