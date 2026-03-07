import { Scale, Note } from "tonal"

/**
 * Resolves a scale degree to an absolute note name given a scale and octave.
 * Used by the "melody" figure type resolver.
 *
 * Degrees index into the diatonic scale tones of the active chord's scale.
 * Degree 1 = root/tonic, degree 7 = leading tone.
 *
 * Degrees beyond the scale size wrap modulo the pool size, cycling into
 * higher octaves. Zero and negative degrees wrap into lower octaves.
 * The resolver never throws on degree values — always produces music.
 *
 * Scale tones are placed in ascending order from the root: if a pitch class
 * is lower than the root (e.g. C in D dorian), it goes in the next octave.
 *
 * @throws if scaleName is not recognised by tonal
 */
export function resolveScaleDegree(
  degree: number,
  scaleName: string,
  octave = 4,
): string {
  const scale = Scale.get(scaleName)
  if (!scale.notes.length) {
    throw new Error(`Unrecognised scale: "${scaleName}"`)
  }

  const len = scale.notes.length
  const zeroIndex = ((((degree - 1) % len) + len) % len)
  const octaveOffset = Math.floor((degree - 1) / len)

  const pitchClass = scale.notes[zeroIndex]!
  const rootPitchClass = scale.notes[0]!

  // Scale tones must ascend from the root. If a pitch class sits below
  // the root at the same octave number, bump it up one octave.
  const rootMidi = Note.midi(`${rootPitchClass}${String(octave)}`)!
  const candidateMidi = Note.midi(`${pitchClass}${String(octave)}`)!
  const intraOctaveAdjust = candidateMidi < rootMidi ? 1 : 0

  const finalOctave = octave + octaveOffset + intraOctaveAdjust

  return `${pitchClass}${String(finalOctave)}`
}
