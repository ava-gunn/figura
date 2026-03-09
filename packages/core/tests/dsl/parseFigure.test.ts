import { describe, it, expect } from "vitest"
import { parseFigure } from "../../src/dsl/parseFigure.js"
import type { FigureToken } from "../../src/types/index.js"

/** Narrows a FigureToken to the degree variant, failing the test if it's a rest. */
function expectDegree(token: FigureToken | undefined): { rest: false; degree: number; anchor: boolean; octaveDown: boolean } {
  expect(token).toBeDefined()
  expect(token!.rest).toBe(false)
  if (token!.rest) throw new Error("unreachable")
  return token!
}

describe("parseFigure", () => {
  describe("basic degrees", () => {
    it("parses a single degree", () => {
      expect(parseFigure("1")).toEqual([
        { rest: false, degree: 1, anchor: false, octaveDown: false },
      ])
    })

    it("parses all seven degrees", () => {
      const result = parseFigure("1 2 3 4 5 6 7")
      expect(result.map(t => expectDegree(t).degree)).toEqual([1, 2, 3, 4, 5, 6, 7])
    })

    it("parses multiple space-separated degrees", () => {
      const result = parseFigure("1 3 5")
      expect(result).toHaveLength(3)
    })

    it("all non-modified tokens have anchor=false and octaveDown=false", () => {
      const result = parseFigure("2 4 6")
      for (const t of result) {
        const d = expectDegree(t)
        expect(d.anchor).toBe(false)
        expect(d.octaveDown).toBe(false)
      }
    })
  })

  describe("anchor modifier (*)", () => {
    it("marks a note as anchor", () => {
      expect(expectDegree(parseFigure("1*")[0]).anchor).toBe(true)
    })

    it("does not mark adjacent notes as anchor", () => {
      const result = parseFigure("1* 3 5")
      expect(expectDegree(result[1]).anchor).toBe(false)
      expect(expectDegree(result[2]).anchor).toBe(false)
    })

    it("preserves the degree when anchor is set", () => {
      expect(expectDegree(parseFigure("5*")[0]).degree).toBe(5)
    })

    it("supports anchor on any degree", () => {
      for (let d = 1; d <= 7; d++) {
        expect(expectDegree(parseFigure(`${d}*`)[0]).anchor).toBe(true)
      }
    })
  })

  describe("octave down modifier (-)", () => {
    it("marks a note as octaveDown", () => {
      expect(expectDegree(parseFigure("1-")[0]).octaveDown).toBe(true)
    })

    it("preserves the degree when octaveDown is set", () => {
      expect(expectDegree(parseFigure("3-")[0]).degree).toBe(3)
    })
  })

  describe("combined modifiers", () => {
    it("parses anchor + octaveDown together", () => {
      expect(parseFigure("1*-")[0]).toEqual({
        rest: false,
        degree: 1,
        anchor: true,
        octaveDown: true,
      })
    })

    it("parses octaveDown + anchor in reverse order", () => {
      expect(parseFigure("1-*")[0]).toEqual({
        rest: false,
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

  describe("rest token", () => {
    it("parses a single rest token", () => {
      expect(parseFigure("~")).toEqual([{ rest: true }])
    })

    it("parses rest in a mixed phrase", () => {
      const result = parseFigure("1 ~ 3")
      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({ rest: false, degree: 1, anchor: false, octaveDown: false })
      expect(result[1]).toEqual({ rest: true })
      expect(result[2]).toEqual({ rest: false, degree: 3, anchor: false, octaveDown: false })
    })
  })

  describe("error cases", () => {
    it("throws on empty string", () => {
      expect(() => parseFigure("")).toThrow("input is empty")
    })

    it("throws on degree 0 with token and position", () => {
      expect(() => parseFigure("0")).toThrow('"0" at position 0')
    })

    it("throws on degree 8 with token and position", () => {
      expect(() => parseFigure("8")).toThrow('"8" at position 0')
    })

    it("throws on unrecognised token characters with token and position", () => {
      expect(() => parseFigure("1x")).toThrow('"1x" at position 0')
    })

    it("throws on whitespace-only string", () => {
      expect(() => parseFigure("   ")).toThrow("input is empty")
    })

    it("includes correct position for mid-sequence errors", () => {
      expect(() => parseFigure("1 3 x")).toThrow('"x" at position 2')
    })

    it("throws on duplicate anchor modifier", () => {
      expect(() => parseFigure("1**")).toThrow('"1**" at position 0')
    })

    it("throws on duplicate octaveDown modifier", () => {
      expect(() => parseFigure("1--")).toThrow('"1--" at position 0')
    })
  })
})
