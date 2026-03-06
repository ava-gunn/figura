import { describe, it, expect } from "vitest"
import { parseRhythm } from "../../src/dsl/parseRhythm.js"

describe("parseRhythm", () => {
  describe("play token (1)", () => {
    it("parses a single play token", () => {
      expect(parseRhythm("1")).toEqual([
        { play: true, tie: false, staccato: false, accent: false },
      ])
    })

    it("parses four equal play tokens", () => {
      const result = parseRhythm("1 1 1 1")
      expect(result).toHaveLength(4)
      result.forEach(t => expect(t.play).toBe(true))
    })
  })

  describe("rest token (~)", () => {
    it("parses a rest as play=false", () => {
      expect(parseRhythm("~")[0]).toMatchObject({ play: false, tie: false })
    })
  })

  describe("tie token (_)", () => {
    it("parses a tie as tie=true, play=false", () => {
      expect(parseRhythm("_")[0]).toMatchObject({ tie: true, play: false })
    })

    it("tie and rest are distinct tokens", () => {
      const result = parseRhythm("_ ~")
      expect(result[0]?.tie).toBe(true)
      expect(result[1]?.tie).toBe(false)
    })
  })

  describe("staccato token (.)", () => {
    it("parses staccato as staccato=true, play=true", () => {
      expect(parseRhythm(".")[0]).toMatchObject({ staccato: true, play: true })
    })
  })

  describe("accent token (!)", () => {
    it("parses accent as accent=true, play=true", () => {
      expect(parseRhythm("!")[0]).toMatchObject({ accent: true, play: true })
    })
  })

  describe("mixed sequences", () => {
    it("parses the design reference rhythm correctly", () => {
      const result = parseRhythm("1 _ 1 . ~ ! 1 _")
      expect(result).toHaveLength(8)
      expect(result[0]).toMatchObject({ play: true,  tie: false, staccato: false, accent: false })
      expect(result[1]).toMatchObject({ play: false, tie: true,  staccato: false, accent: false })
      expect(result[2]).toMatchObject({ play: true,  tie: false, staccato: false, accent: false })
      expect(result[3]).toMatchObject({ play: true,  tie: false, staccato: true,  accent: false })
      expect(result[4]).toMatchObject({ play: false, tie: false, staccato: false, accent: false })
      expect(result[5]).toMatchObject({ play: true,  tie: false, staccato: false, accent: true  })
      expect(result[6]).toMatchObject({ play: true,  tie: false, staccato: false, accent: false })
      expect(result[7]).toMatchObject({ play: false, tie: true,  staccato: false, accent: false })
    })

    it("handles extra whitespace", () => {
      expect(parseRhythm("1  _   .")).toHaveLength(3)
    })

    it("handles leading and trailing whitespace", () => {
      expect(parseRhythm("  1 ~ !  ")).toHaveLength(3)
    })
  })

  describe("error cases", () => {
    it("throws on empty string", () => {
      expect(() => parseRhythm("")).toThrow()
    })

    it("throws on whitespace-only string", () => {
      expect(() => parseRhythm("   ")).toThrow()
    })

    it("throws on unrecognised token", () => {
      expect(() => parseRhythm("x")).toThrow()
    })

    it("throws on multi-character token", () => {
      expect(() => parseRhythm("11")).toThrow()
    })
  })
})
