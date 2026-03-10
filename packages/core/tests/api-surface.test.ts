import { describe, it, expect } from "vitest"
import {
  parseFigure,
  parseRhythm,
  resolveScaleDegree,
  resolveChordDegree,
  resolvePhrase,
  expandProgression,
} from "../src/index.js"
import type {
  FigureType,
  FigureToken,
  RhythmToken,
  HarmonyContext,
  Progression,
  ResolvedEvent,
  ResolvedFigure,
  ResolveOptions,
  PositionTrace,
} from "../src/index.js"

describe("@harmonics/core public API", () => {
  describe("function exports", () => {
    it("exports parseFigure as a function", () => {
      expect(typeof parseFigure).toBe("function")
    })

    it("exports parseRhythm as a function", () => {
      expect(typeof parseRhythm).toBe("function")
    })

    it("exports resolveScaleDegree as a function", () => {
      expect(typeof resolveScaleDegree).toBe("function")
    })

    it("exports resolveChordDegree as a function", () => {
      expect(typeof resolveChordDegree).toBe("function")
    })

    it("exports resolvePhrase as a function", () => {
      expect(typeof resolvePhrase).toBe("function")
    })

    it("exports expandProgression as a function", () => {
      expect(typeof expandProgression).toBe("function")
    })
  })

  describe("type exports", () => {
    it("exports all public types (compile-time verification)", () => {
      // These imports verify the types exist at compile time.
      // If any type is missing from the barrel, TypeScript will error.
      const _figureType: FigureType = "melody"
      const _figureToken: FigureToken = { rest: true }
      const _rhythmToken: RhythmToken = {
        play: false,
        tie: false,
        accent: false,
        staccato: false,
      }
      const _harmonyContext: HarmonyContext = {
        key: "C",
        roman: "IM7",
        chord: "Cmaj7",
        scale: ["C"],
        chordTones: ["C"],
      }
      const _progression: Progression = {
        key: "C",
        chords: [{ roman: "IM7", duration: 1 }],
      }
      const _resolvedEvent: ResolvedEvent = {
        note: "C4",
        degree: 1,
        anchor: false,
        duration: 1,
        velocity: 0.8,
        tie: false,
      }
      const _resolvedFigure: ResolvedFigure = {
        type: "melody",
        events: [_resolvedEvent],
      }
      const _resolveOptions: ResolveOptions = { type: "melody" }
      const _positionTrace: PositionTrace = {
        position: 0,
        figureToken: { rest: true },
        rhythmToken: _rhythmToken,
        harmony: _harmonyContext,
        pitchPool: ["C"],
        resolvedNote: null,
      }

      // Suppress unused variable warnings — the point is compile-time verification
      void [
        _figureType,
        _figureToken,
        _rhythmToken,
        _harmonyContext,
        _progression,
        _resolvedEvent,
        _resolvedFigure,
        _resolveOptions,
        _positionTrace,
      ]

      expect(true).toBe(true)
    })
  })

  describe("standalone usage (no strudel)", () => {
    it("runs full core pipeline without strudel dependency", () => {
      const figure = parseFigure("1* 3 5 3 2* 1 7- 1*")
      const rhythm = parseRhythm("1 _ 1 . ~ ! 1 _")
      const harmony = expandProgression({
        key: "C",
        chords: [
          { roman: "iim7", duration: 3 },
          { roman: "V7", duration: 3 },
          { roman: "IM7", duration: 2 },
        ],
      })
      const resolved = resolvePhrase(figure, rhythm, harmony, {
        type: "melody",
      })

      expect(resolved.type).toBe("melody")
      expect(resolved.events).toHaveLength(8)

      // Verify concrete pitch resolution — specific values, not just "defined"
      expect(resolved.events[0]!.note).toBe("D4")
      expect(resolved.events[2]!.note).toBe("A4")
      expect(resolved.events[4]!.note).toBe("~") // rest
      expect(resolved.events[5]!.note).toBe("G4")
      expect(resolved.events[6]!.note).toBe("B3")
    })
  })
})
