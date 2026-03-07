import { describe, it, expect } from "vitest"
import { expandProgression } from "../../src/resolve/expandProgression.js"

describe("expandProgression", () => {
  describe("basic chord resolution in C (AC1, AC2, AC3)", () => {
    it("resolves iim7 in C to Dm7 with D dorian scale", () => {
      const result = expandProgression({ key: "C", chords: [{ roman: "iim7", duration: 1 }] })
      expect(result).toHaveLength(1)
      expect(result[0]!.key).toBe("C")
      expect(result[0]!.roman).toBe("iim7")
      expect(result[0]!.chord).toBe("Dm7")
      expect(result[0]!.scale).toEqual(["D", "E", "F", "G", "A", "B", "C"])
      expect(result[0]!.chordTones).toEqual(["D", "F", "A", "C"])
    })

    it("resolves V7 in C to G7 with G mixolydian scale", () => {
      const result = expandProgression({ key: "C", chords: [{ roman: "V7", duration: 1 }] })
      expect(result).toHaveLength(1)
      expect(result[0]!.chord).toBe("G7")
      expect(result[0]!.scale).toEqual(["G", "A", "B", "C", "D", "E", "F"])
      expect(result[0]!.chordTones).toEqual(["G", "B", "D", "F"])
    })

    it("resolves IM7 in C to Cmaj7 with C ionian scale", () => {
      const result = expandProgression({ key: "C", chords: [{ roman: "IM7", duration: 1 }] })
      expect(result).toHaveLength(1)
      expect(result[0]!.chord).toBe("Cmaj7")
      expect(result[0]!.scale).toEqual(["C", "D", "E", "F", "G", "A", "B"])
      expect(result[0]!.chordTones).toEqual(["C", "E", "G", "B"])
    })
  })

  describe("duration expansion (AC4)", () => {
    it("expands iim7 x4 + V7 x2 to 6 HarmonyContext objects", () => {
      const result = expandProgression({
        key: "C",
        chords: [
          { roman: "iim7", duration: 4 },
          { roman: "V7", duration: 2 },
        ],
      })
      expect(result).toHaveLength(6)

      // First 4 are iim7 → Dm7
      for (let i = 0; i < 4; i++) {
        expect(result[i]!.chord).toBe("Dm7")
        expect(result[i]!.scale).toEqual(["D", "E", "F", "G", "A", "B", "C"])
        expect(result[i]!.chordTones).toEqual(["D", "F", "A", "C"])
      }

      // Last 2 are V7 → G7
      for (let i = 4; i < 6; i++) {
        expect(result[i]!.chord).toBe("G7")
        expect(result[i]!.scale).toEqual(["G", "A", "B", "C", "D", "E", "F"])
        expect(result[i]!.chordTones).toEqual(["G", "B", "D", "F"])
      }
    })

    it("single chord with duration 1 returns array of length 1", () => {
      const result = expandProgression({ key: "C", chords: [{ roman: "IM7", duration: 1 }] })
      expect(result).toHaveLength(1)
    })
  })

  describe("all diatonic degrees in C (AC5)", () => {
    it("resolves I (IM7) to Cmaj7 with ionian scale and chordTones", () => {
      const result = expandProgression({ key: "C", chords: [{ roman: "IM7", duration: 1 }] })
      expect(result[0]!.chord).toBe("Cmaj7")
      expect(result[0]!.scale).toEqual(["C", "D", "E", "F", "G", "A", "B"])
      expect(result[0]!.chordTones).toEqual(["C", "E", "G", "B"])
    })

    it("resolves ii (iim7) to Dm7 with dorian scale and chordTones", () => {
      const result = expandProgression({ key: "C", chords: [{ roman: "iim7", duration: 1 }] })
      expect(result[0]!.chord).toBe("Dm7")
      expect(result[0]!.scale).toEqual(["D", "E", "F", "G", "A", "B", "C"])
      expect(result[0]!.chordTones).toEqual(["D", "F", "A", "C"])
    })

    it("resolves iii (iiim7) to Em7 with phrygian scale and chordTones", () => {
      const result = expandProgression({ key: "C", chords: [{ roman: "iiim7", duration: 1 }] })
      expect(result[0]!.chord).toBe("Em7")
      expect(result[0]!.scale).toEqual(["E", "F", "G", "A", "B", "C", "D"])
      expect(result[0]!.chordTones).toEqual(["E", "G", "B", "D"])
    })

    it("resolves IV (IVmaj7) to Fmaj7 with lydian scale and chordTones", () => {
      const result = expandProgression({ key: "C", chords: [{ roman: "IVmaj7", duration: 1 }] })
      expect(result[0]!.chord).toBe("Fmaj7")
      expect(result[0]!.scale).toEqual(["F", "G", "A", "B", "C", "D", "E"])
      expect(result[0]!.chordTones).toEqual(["F", "A", "C", "E"])
    })

    it("resolves V (V7) to G7 with mixolydian scale and chordTones", () => {
      const result = expandProgression({ key: "C", chords: [{ roman: "V7", duration: 1 }] })
      expect(result[0]!.chord).toBe("G7")
      expect(result[0]!.scale).toEqual(["G", "A", "B", "C", "D", "E", "F"])
      expect(result[0]!.chordTones).toEqual(["G", "B", "D", "F"])
    })

    it("resolves vi (vim7) to Am7 with aeolian scale and chordTones", () => {
      const result = expandProgression({ key: "C", chords: [{ roman: "vim7", duration: 1 }] })
      expect(result[0]!.chord).toBe("Am7")
      expect(result[0]!.scale).toEqual(["A", "B", "C", "D", "E", "F", "G"])
      expect(result[0]!.chordTones).toEqual(["A", "C", "E", "G"])
    })

    it("resolves vii (viim7b5) to Bm7b5 with locrian scale and chordTones", () => {
      const result = expandProgression({ key: "C", chords: [{ roman: "viim7b5", duration: 1 }] })
      expect(result[0]!.chord).toBe("Bm7b5")
      expect(result[0]!.scale).toEqual(["B", "C", "D", "E", "F", "G", "A"])
      expect(result[0]!.chordTones).toEqual(["B", "D", "F", "A"])
    })

    it("resolves vii (viiø7) to Bm7b5 with locrian scale and chordTones", () => {
      const result = expandProgression({ key: "C", chords: [{ roman: "viiø7", duration: 1 }] })
      expect(result[0]!.chord).toBe("Bm7b5")
      expect(result[0]!.scale).toEqual(["B", "C", "D", "E", "F", "G", "A"])
      expect(result[0]!.chordTones).toEqual(["B", "D", "F", "A"])
    })
  })

  describe("non-C keys (AC6)", () => {
    it("resolves iim7 in G to Am7 with A dorian scale", () => {
      const result = expandProgression({ key: "G", chords: [{ roman: "iim7", duration: 1 }] })
      expect(result[0]!.chord).toBe("Am7")
      expect(result[0]!.scale).toEqual(["A", "B", "C", "D", "E", "F#", "G"])
    })

    it("resolves V7 in Eb to Bb7 with Bb mixolydian scale", () => {
      const result = expandProgression({ key: "Eb", chords: [{ roman: "V7", duration: 1 }] })
      expect(result[0]!.chord).toBe("Bb7")
      expect(result[0]!.scale).toEqual(["Bb", "C", "D", "Eb", "F", "G", "Ab"])
    })
  })

  describe("error handling (AC7, AC8)", () => {
    it("throws on invalid Roman numeral", () => {
      expect(() =>
        expandProgression({ key: "C", chords: [{ roman: "xyz", duration: 1 }] }),
      ).toThrow(/xyz/)
    })

    it("throws on valid Roman prefix with invalid suffix", () => {
      expect(() =>
        expandProgression({ key: "C", chords: [{ roman: "Iadd9", duration: 1 }] }),
      ).toThrow(/Iadd9/)
    })

    it("throws on invalid key", () => {
      expect(() =>
        expandProgression({ key: "X", chords: [{ roman: "iim7", duration: 1 }] }),
      ).toThrow(/X/)
    })

    it("throws on duration 0", () => {
      expect(() =>
        expandProgression({ key: "C", chords: [{ roman: "IM7", duration: 0 }] }),
      ).toThrow(/duration/)
    })

    it("throws on negative duration", () => {
      expect(() =>
        expandProgression({ key: "C", chords: [{ roman: "IM7", duration: -1 }] }),
      ).toThrow(/duration/)
    })
  })

  describe("HarmonyContext shape (AC9)", () => {
    it("returns objects with all required fields", () => {
      const result = expandProgression({ key: "C", chords: [{ roman: "iim7", duration: 1 }] })
      const ctx = result[0]!
      expect(ctx).toHaveProperty("key")
      expect(ctx).toHaveProperty("roman")
      expect(ctx).toHaveProperty("chord")
      expect(ctx).toHaveProperty("scale")
      expect(ctx).toHaveProperty("chordTones")
      expect(Array.isArray(ctx.scale)).toBe(true)
      expect(Array.isArray(ctx.chordTones)).toBe(true)
    })
  })
})
