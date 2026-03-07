import { Scale, Chord } from "tonal"
import type { HarmonyContext, Progression } from "../types/index.js"

const ROMAN_NUMERALS = [
  { numeral: "VII", degree: 7 },
  { numeral: "III", degree: 3 },
  { numeral: "VI", degree: 6 },
  { numeral: "IV", degree: 4 },
  { numeral: "II", degree: 2 },
  { numeral: "V", degree: 5 },
  { numeral: "I", degree: 1 },
] as const

const DEGREE_MODE: Record<number, string> = {
  1: "ionian",
  2: "dorian",
  3: "phrygian",
  4: "lydian",
  5: "mixolydian",
  6: "aeolian",
  7: "locrian",
}

const SUFFIX_MAP: Record<string, string> = {
  m7: "m7",
  "7": "7",
  M7: "maj7",
  maj7: "maj7",
  m7b5: "m7b5",
  "ø7": "m7b5",
}

function parseRoman(roman: string): { degree: number; chordSuffix: string } {
  for (const { numeral, degree } of ROMAN_NUMERALS) {
    if (roman.toUpperCase().startsWith(numeral)) {
      const suffix = roman.slice(numeral.length)
      const chordSuffix = SUFFIX_MAP[suffix]
      if (chordSuffix === undefined) {
        throw new Error(`Unrecognised Roman numeral suffix in "${roman}"`)
      }
      return { degree, chordSuffix }
    }
  }
  throw new Error(`Unrecognised Roman numeral: "${roman}"`)
}

export function expandProgression(progression: Progression): HarmonyContext[] {
  const { key, chords } = progression

  const keyScale = Scale.get(`${key} major`)
  if (!keyScale.notes.length) {
    throw new Error(`Invalid key: "${key}"`)
  }

  const result: HarmonyContext[] = []

  for (const { roman, duration } of chords) {
    if (duration < 1) {
      throw new Error(`Invalid duration ${String(duration)} for Roman numeral "${roman}" — must be >= 1`)
    }
    const { degree, chordSuffix } = parseRoman(roman)
    const rootNote = keyScale.notes[degree - 1]!
    const modeName = DEGREE_MODE[degree]!

    const chordName = `${rootNote}${chordSuffix}`
    const scaleName = `${rootNote} ${modeName}`

    const scaleNotes = Scale.get(scaleName).notes
    const chordTones = Chord.get(chordName).notes

    /* v8 ignore start */
    if (!scaleNotes.length) {
      throw new Error(`Cannot resolve scale "${scaleName}" for Roman numeral "${roman}"`)
    }
    if (!chordTones.length) {
      throw new Error(`Cannot resolve chord "${chordName}" for Roman numeral "${roman}"`)
    }
    /* v8 ignore stop */

    const ctx: HarmonyContext = { key, roman, chord: chordName, scale: scaleNotes, chordTones }

    for (let i = 0; i < duration; i++) {
      result.push(ctx)
    }
  }

  return result
}
