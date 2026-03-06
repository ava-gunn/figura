import { describe, it, expect } from "vitest"
import { resolveChordDegree } from "../../src/resolve/resolveChordDegree.js"

describe("resolveChordDegree", () => {
  describe("Dm7 (iim7)", () => {
    it("degree 1 = root D4", () => {
      expect(resolveChordDegree(1, "Dm7", 4)).toBe("D4")
    })
    it("degree 2 = third F4", () => {
      expect(resolveChordDegree(2, "Dm7", 4)).toBe("F4")
    })
    it("degree 3 = fifth A4", () => {
      expect(resolveChordDegree(3, "Dm7", 4)).toBe("A4")
    })
    it("degree 4 = seventh C5", () => {
      expect(resolveChordDegree(4, "Dm7", 4)).toBe("C5")
    })
  })

  describe("G7 (V7)", () => {
    it("degree 1 = root G4", () => {
      expect(resolveChordDegree(1, "G7", 4)).toBe("G4")
    })
    it("degree 2 = third B4", () => {
      expect(resolveChordDegree(2, "G7", 4)).toBe("B4")
    })
    it("degree 3 = fifth D5", () => {
      expect(resolveChordDegree(3, "G7", 4)).toBe("D5")
    })
    it("degree 4 = seventh F5", () => {
      expect(resolveChordDegree(4, "G7", 4)).toBe("F5")
    })
  })

  describe("Cmaj7 (IM7)", () => {
    it("degree 1 = root C4", () => {
      expect(resolveChordDegree(1, "Cmaj7", 4)).toBe("C4")
    })
    it("degree 2 = third E4", () => {
      expect(resolveChordDegree(2, "Cmaj7", 4)).toBe("E4")
    })
  })

  describe("degree 2 is different from resolveScaleDegree degree 2", () => {
    // Over Dm7:
    //   chord degree 2 = F (third of chord)
    //   scale degree 2 = E (second tone of D dorian)
    it("chord degree 2 over Dm7 = F4, not E4", () => {
      expect(resolveChordDegree(2, "Dm7", 4)).toBe("F4")
    })
  })

  describe("degree wrapping", () => {
    it("degree 5 wraps to degree 1 (root) for 7th chords", () => {
      expect(resolveChordDegree(5, "Dm7", 4)).toBe("D5")
    })
  })

  describe("octave parameter", () => {
    it("respects octave 2 for bass register", () => {
      expect(resolveChordDegree(1, "Dm7", 2)).toBe("D2")
    })
    it("defaults to octave 4", () => {
      expect(resolveChordDegree(1, "Dm7")).toBe("D4")
    })
  })

  describe("error cases", () => {
    it("throws on degree less than 1", () => {
      expect(() => resolveChordDegree(0, "Dm7", 4)).toThrow()
    })
    it("throws on unrecognised chord name", () => {
      expect(() => resolveChordDegree(1, "Xblorp", 4)).toThrow()
    })
  })
})
