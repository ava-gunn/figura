import { describe, it, expect } from "vitest"
import type {
  FigureToken,
  HarmonyContext,
  ResolvedEvent,
  ResolvedFigure,
  Progression,
  ResolveOptions,
  PositionTrace,
} from "../../src/types/index.js"

describe("core type definitions", () => {
  describe("FigureToken discriminated union", () => {
    it("represents a degree token with rest: false", () => {
      const token: FigureToken = {
        rest: false,
        degree: 1,
        anchor: true,
        octaveDown: false,
      }
      expect(token.rest).toBe(false)
      expect(token.degree).toBe(1)
    })

    it("represents a rest token with rest: true", () => {
      const token: FigureToken = { rest: true }
      expect(token.rest).toBe(true)
    })

    it("narrows type via discriminant", () => {
      const token: FigureToken = { rest: false, degree: 3, anchor: false, octaveDown: false }
      if (!token.rest) {
        // TypeScript narrows: degree, anchor, octaveDown available
        expect(token.degree).toBe(3)
        expect(token.anchor).toBe(false)
        expect(token.octaveDown).toBe(false)
      }
    })
  })

  describe("HarmonyContext", () => {
    it("includes scale as pitch class array and chordTones", () => {
      const ctx: HarmonyContext = {
        key: "C",
        roman: "iim7",
        chord: "Dm7",
        scale: ["D", "E", "F", "G", "A", "B", "C"],
        chordTones: ["D", "F", "A", "C"],
      }
      expect(ctx.scale).toHaveLength(7)
      expect(ctx.chordTones).toHaveLength(4)
    })
  })

  describe("ResolvedEvent", () => {
    it("uses string note with ~ for rests, not null", () => {
      const rest: ResolvedEvent = {
        note: "~",
        degree: 0,
        anchor: false,
        duration: 0,
        velocity: 0,
        tie: false,
      }
      expect(rest.note).toBe("~")
      expect(rest.degree).toBe(0)
    })

    it("represents a normal played event", () => {
      const event: ResolvedEvent = {
        note: "D4",
        degree: 1,
        anchor: true,
        duration: 1,
        velocity: 0.8,
        tie: false,
      }
      expect(event.note).toBe("D4")
    })
  })

  describe("ResolvedFigure", () => {
    it("contains only type and events — no Strudel fields", () => {
      const figure: ResolvedFigure = {
        type: "melody",
        events: [],
      }
      expect(figure.type).toBe("melody")
      expect(figure.events).toEqual([])
      // Verify no Strudel fields exist on the type
      const keys = Object.keys(figure)
      expect(keys).toEqual(["type", "events"])
    })
  })

  describe("Progression", () => {
    it("defines key with chord durations", () => {
      const prog: Progression = {
        key: "C",
        chords: [
          { roman: "iim7", duration: 4 },
          { roman: "V7", duration: 2 },
          { roman: "IM7", duration: 2 },
        ],
      }
      expect(prog.chords).toHaveLength(3)
    })
  })

  describe("ResolveOptions", () => {
    it("supports boolean debug mode", () => {
      const opts: ResolveOptions = { type: "melody", debug: true }
      expect(opts.debug).toBe(true)
    })

    it("supports callback debug mode", () => {
      const traces: PositionTrace[] = []
      const opts: ResolveOptions = {
        type: "bass",
        debug: (trace) => { traces.push(trace) },
      }
      expect(typeof opts.debug).toBe("function")
    })
  })

  describe("PositionTrace", () => {
    it("contains all required trace fields", () => {
      const trace: PositionTrace = {
        position: 0,
        figureToken: { rest: false, degree: 1, anchor: true, octaveDown: false },
        rhythmToken: { play: true, tie: false, accent: false, staccato: false },
        harmony: {
          key: "C",
          roman: "iim7",
          chord: "Dm7",
          scale: ["D", "E", "F", "G", "A", "B", "C"],
          chordTones: ["D", "F", "A", "C"],
        },
        pitchPool: ["D", "E", "F", "G", "A", "B", "C"],
        resolvedNote: "D4",
      }
      expect(trace.position).toBe(0)
      expect(trace.resolvedNote).toBe("D4")
    })
  })
})
