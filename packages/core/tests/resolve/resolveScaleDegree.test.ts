import { describe, it, expect } from "vitest"
import { resolveScaleDegree } from "../../src/resolve/resolveScaleDegree.js"

describe("resolveScaleDegree", () => {
  describe("D dorian (iim7 context)", () => {
    it("resolves degree 1 to D4", () => {
      expect(resolveScaleDegree(1, "D dorian", 4)).toBe("D4")
    })
    it("resolves degree 2 to E4", () => {
      expect(resolveScaleDegree(2, "D dorian", 4)).toBe("E4")
    })
    it("resolves degree 3 to F4", () => {
      expect(resolveScaleDegree(3, "D dorian", 4)).toBe("F4")
    })
    it("resolves degree 5 to A4", () => {
      expect(resolveScaleDegree(5, "D dorian", 4)).toBe("A4")
    })
    it("resolves degree 7 — wraps to C5", () => {
      expect(resolveScaleDegree(7, "D dorian", 4)).toBe("C5")
    })
  })

  describe("G mixolydian (V7 context)", () => {
    it("resolves degree 1 to G4", () => {
      expect(resolveScaleDegree(1, "G mixolydian", 4)).toBe("G4")
    })
    it("resolves degree 3 to B4", () => {
      expect(resolveScaleDegree(3, "G mixolydian", 4)).toBe("B4")
    })
    it("resolves degree 7 to F5", () => {
      expect(resolveScaleDegree(7, "G mixolydian", 4)).toBe("F5")
    })
  })

  describe("C ionian (IM7 context)", () => {
    it("resolves degree 1 to C4", () => {
      expect(resolveScaleDegree(1, "C major", 4)).toBe("C4")
    })
    it("resolves degree 3 to E4", () => {
      expect(resolveScaleDegree(3, "C major", 4)).toBe("E4")
    })
    it("resolves degree 7 to B4", () => {
      expect(resolveScaleDegree(7, "C major", 4)).toBe("B4")
    })
  })

  describe("octave parameter", () => {
    it("respects octave 3", () => {
      expect(resolveScaleDegree(1, "D dorian", 3)).toBe("D3")
    })
    it("respects octave 5", () => {
      expect(resolveScaleDegree(1, "D dorian", 5)).toBe("D5")
    })
    it("defaults to octave 4", () => {
      expect(resolveScaleDegree(1, "D dorian")).toBe("D4")
    })
  })

  describe("error cases", () => {
    it("throws on degree 0", () => {
      expect(() => resolveScaleDegree(0, "D dorian", 4)).toThrow()
    })
    it("throws on degree 8", () => {
      expect(() => resolveScaleDegree(8, "D dorian", 4)).toThrow()
    })
    it("throws on unrecognised scale name", () => {
      expect(() => resolveScaleDegree(1, "X blorp", 4)).toThrow()
    })
  })
})
