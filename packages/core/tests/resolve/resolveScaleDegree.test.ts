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
    it("resolves degree 7 to C5", () => {
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

  describe("degree overflow wrapping", () => {
    it("wraps degree 8 to degree 1 in the next octave", () => {
      // D dorian degree 8 = degree 1 (D) one octave up
      expect(resolveScaleDegree(8, "D dorian", 4)).toBe("D5")
    })
    it("wraps degree 9 to degree 2 in the next octave", () => {
      expect(resolveScaleDegree(9, "D dorian", 4)).toBe("E5")
    })
    it("wraps degree 14 to degree 7 in the next octave", () => {
      expect(resolveScaleDegree(14, "D dorian", 4)).toBe("C6")
    })
    it("wraps degree 15 to degree 1 two octaves up", () => {
      expect(resolveScaleDegree(15, "D dorian", 4)).toBe("D6")
    })
  })

  describe("zero and negative degree wrapping", () => {
    it("wraps degree 0 to degree 7 in the previous octave", () => {
      // degree 0 = one below degree 1 = degree 7 one octave down
      expect(resolveScaleDegree(0, "D dorian", 4)).toBe("C4")
    })
    it("wraps degree -1 to degree 6 in the previous octave", () => {
      expect(resolveScaleDegree(-1, "D dorian", 4)).toBe("B3")
    })
    it("wraps degree -6 to degree 1 in the previous octave", () => {
      expect(resolveScaleDegree(-6, "D dorian", 4)).toBe("D3")
    })
    it("never throws on zero or negative degrees", () => {
      expect(() => resolveScaleDegree(0, "D dorian", 4)).not.toThrow()
      expect(() => resolveScaleDegree(-1, "D dorian", 4)).not.toThrow()
      expect(() => resolveScaleDegree(-100, "D dorian", 4)).not.toThrow()
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

  describe("input validation", () => {
    it("throws on unrecognised scale name", () => {
      expect(() => resolveScaleDegree(1, "X blorp", 4)).toThrow()
    })
  })
})
