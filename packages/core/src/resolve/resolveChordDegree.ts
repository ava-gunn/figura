import { Chord, Note } from "tonal"

/**
 * Resolves a chord degree to an absolute note name given a chord and octave.
 * Used by the "chord" and "bass" figure type resolvers.
 *
 * Degrees index into chord tones only — not the full scale.
 * For a 7th chord: 1=root, 2=third, 3=fifth, 4=seventh.
 * Degrees beyond the chord tone count wrap around (modulo), cycling into
 * higher octaves. Zero and negative degrees wrap into lower octaves.
 * The resolver never throws on degree values — always produces music.
 *
 * Chord tones are placed in ascending order from the root: if a pitch class
 * is lower than the root (e.g. C in Dm7), it goes in the next octave.
 *
 * ## Difference from resolveScaleDegree
 * resolveScaleDegree uses all 7 diatonic scale tones.
 * resolveChordDegree uses only the chord tones (typically 3-4).
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
 */
export function resolveChordDegree(
  degree: number,
  chordName: string,
  octave = 4,
): string {
  const chord = Chord.get(chordName)
  if (!chord.notes.length) {
    throw new Error(`Unrecognised chord: "${chordName}"`)
  }

  const len = chord.notes.length
  const zeroIndex = ((((degree - 1) % len) + len) % len)
  const octaveOffset = Math.floor((degree - 1) / len)

  const pitchClass = chord.notes[zeroIndex]!
  const rootPitchClass = chord.notes[0]!

  // Chord tones must ascend from the root. If a pitch class sits below
  // the root at the same octave number, bump it up one octave.
  const rootMidi = Note.midi(`${rootPitchClass}${String(octave)}`)!
  const candidateMidi = Note.midi(`${pitchClass}${String(octave)}`)!
  const intraOctaveAdjust = candidateMidi < rootMidi ? 1 : 0

  const finalOctave = octave + octaveOffset + intraOctaveAdjust

  return `${pitchClass}${String(finalOctave)}`
}
