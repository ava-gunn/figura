import { describe, it, expect } from "vitest"
import { parseFigure } from "../../src/dsl/parseFigure.js"

describe("parseFigure", () => {
  describe("basic degrees", () => {
    it("parses a single degree", () => {
      expect(parseFigure("1")).toEqual([
        { degree: 1, anchor: false, octaveDown: false },
      ])
    })

    it("parses all seven degrees", () => {
      const result = parseFigure("1 2 3 4 5 6 7")
      expect(result.map(t => t.degree)).toEqual([1, 2, 3, 4, 5, 6, 7])
    })

    it("parses multiple space-separated degrees", () => {
      const result = parseFigure("1 3 5")
      expect(result).toHaveLength(3)
    })

    it("all non-modified tokens have anchor=false and octaveDown=false", () => {
      const result = parseFigure("2 4 6")
      result.forEach(t => {
        expect(t.anchor).toBe(false)
        expect(t.octaveDown).toBe(false)
      })
    })
  })

  describe("anchor modifier (*)", () => {
    it("marks a note as anchor", () => {
      expect(parseFigure("1*")[0]?.anchor).toBe(true)
    })

    it("does not mark adjacent notes as anchor", () => {
      const result = parseFigure("1* 3 5")
      expect(result[1]?.anchor).toBe(false)
      expect(result[2]?.anchor).toBe(false)
    })

    it("preserves the degree when anchor is set", () => {
      expect(parseFigure("5*")[0]?.degree).toBe(5)
    })

    it("supports anchor on any degree", () => {
      for (let d = 1; d <= 7; d++) {
        expect(parseFigure(`${d}*`)[0]?.anchor).toBe(true)
      }
    })
  })

  describe("octave down modifier (-)", () => {
    it("marks a note as octaveDown", () => {
      expect(parseFigure("1-")[0]?.octaveDown).toBe(true)
    })

    it("preserves the degree when octaveDown is set", () => {
      expect(parseFigure("3-")[0]?.degree).toBe(3)
    })
  })

  describe("combined modifiers", () => {
    it("parses anchor + octaveDown together", () => {
      expect(parseFigure("1*-")[0]).toEqual({
        degree: 1,
        anchor: true,
        octaveDown: true,
      })
    })

    it("parses octaveDown + anchor in reverse order", () => {
      expect(parseFigure("1-*")[0]).toEqual({
        degree: 1,
        anchor: true,
        octaveDown: true,
      })
    })
  })

  describe("whitespace handling", () => {
    it("handles extra whitespace between tokens", () => {
      expect(parseFigure("1  3   5")).toHaveLength(3)
    })

    it("handles leading and trailing whitespace", () => {
      expect(parseFigure("  1 3 5  ")).toHaveLength(3)
    })
  })

  describe("full phrase example from design", () => {
    it("parses the design reference phrase correctly", () => {
      const result = parseFigure("1* 3 5 3 2* 1 7- 1*")
      expect(result).toHaveLength(8)
      expect(result[0]).toMatchObject({ degree: 1, anchor: true,  octaveDown: false })
      expect(result[1]).toMatchObject({ degree: 3, anchor: false, octaveDown: false })
      expect(result[4]).toMatchObject({ degree: 2, anchor: true,  octaveDown: false })
      expect(result[6]).toMatchObject({ degree: 7, anchor: false, octaveDown: true  })
      expect(result[7]).toMatchObject({ degree: 1, anchor: true,  octaveDown: false })
    })
  })

  describe("error cases", () => {
    it("throws on empty string", () => {
      expect(() => parseFigure("")).toThrow()
    })

    it("throws on degree 0", () => {
      expect(() => parseFigure("0")).toThrow()
    })

    it("throws on degree 8", () => {
      expect(() => parseFigure("8")).toThrow()
    })

    it("throws on unrecognised token characters", () => {
      expect(() => parseFigure("1x")).toThrow()
    })

    it("throws on whitespace-only string", () => {
      expect(() => parseFigure("   ")).toThrow()
    })
  })
})
