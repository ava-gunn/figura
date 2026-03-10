import { describe, it, expect } from "vitest"
import type { ResolvedEvent, ResolvedFigure } from "@harmonics/core"
import { toMiniNotation, type StrudelOutput } from "../src/index.js"

function event(overrides: Partial<ResolvedEvent> = {}): ResolvedEvent {
  return {
    note: "C4",
    degree: 1,
    anchor: false,
    duration: 1,
    velocity: 0.8,
    tie: false,
    ...overrides,
  }
}

function figure(events: ResolvedEvent[]): ResolvedFigure {
  return { type: "melody", events }
}

describe("toMiniNotation", () => {
  describe("individual encodings", () => {
    it("encodes a normal note as plain note name", () => {
      const result = toMiniNotation(figure([event({ note: "D4" })]))
      expect(result.notes).toBe("D4")
      expect(result.struct).toBe("t")
      expect(result.velocity).toBe("0.8")
    })

    it("encodes a rest as ~ with f struct and 0 velocity", () => {
      const result = toMiniNotation(
        figure([
          event({ note: "~", degree: 0, duration: 0, velocity: 0 }),
        ]),
      )
      expect(result.notes).toBe("~")
      expect(result.struct).toBe("f")
      expect(result.velocity).toBe("0")
    })

    it("encodes an accent with velocity 1", () => {
      const result = toMiniNotation(
        figure([event({ note: "G4", velocity: 1.0 })]),
      )
      expect(result.notes).toBe("G4")
      expect(result.struct).toBe("t")
      expect(result.velocity).toBe("1")
    })

    it("encodes staccato as /2 appended to note name", () => {
      const result = toMiniNotation(
        figure([event({ note: "B4", duration: 0.5 })]),
      )
      expect(result.notes).toBe("B4/2")
      expect(result.struct).toBe("t")
      expect(result.velocity).toBe("0.8")
    })

    it("encodes a tie as _ appended to note name with f struct", () => {
      const result = toMiniNotation(
        figure([
          event({ note: "D4" }),
          event({ note: "D4", tie: true }),
        ]),
      )
      expect(result.notes).toBe("D4 D4_")
      expect(result.struct).toBe("t f")
      expect(result.velocity).toBe("0.8 0.8")
    })
  })

  describe("reference phrase", () => {
    it("produces correct output for the canonical 8-event phrase", () => {
      const referenceEvents: ResolvedEvent[] = [
        { note: "D4", degree: 1, anchor: true, duration: 1, velocity: 0.8, tie: false },
        { note: "D4", degree: 3, anchor: false, duration: 1, velocity: 0.8, tie: true },
        { note: "A4", degree: 5, anchor: false, duration: 1, velocity: 0.8, tie: false },
        { note: "B4", degree: 3, anchor: false, duration: 0.5, velocity: 0.8, tie: false },
        { note: "~", degree: 0, anchor: false, duration: 0, velocity: 0, tie: false },
        { note: "G4", degree: 1, anchor: false, duration: 1, velocity: 1.0, tie: false },
        { note: "B3", degree: 7, anchor: false, duration: 1, velocity: 0.8, tie: false },
        { note: "B3", degree: 1, anchor: true, duration: 1, velocity: 0.8, tie: true },
      ]
      const result = toMiniNotation({ type: "melody", events: referenceEvents })
      expect(result.notes).toBe("D4 D4_ A4 B4/2 ~ G4 B3 B3_")
      expect(result.struct).toBe("t f t t f t t f")
      expect(result.velocity).toBe("0.8 0.8 0.8 0.8 0 1 0.8 0.8")
    })
  })

  describe("edge cases", () => {
    it("returns empty strings for empty events array", () => {
      const result = toMiniNotation(figure([]))
      expect(result.notes).toBe("")
      expect(result.struct).toBe("")
      expect(result.velocity).toBe("")
    })

    it("handles single rest-only phrase", () => {
      const result = toMiniNotation(
        figure([
          event({ note: "~", degree: 0, duration: 0, velocity: 0 }),
        ]),
      )
      expect(result.notes).toBe("~")
      expect(result.struct).toBe("f")
      expect(result.velocity).toBe("0")
    })

    it("handles multiple consecutive ties", () => {
      const result = toMiniNotation(
        figure([
          event({ note: "E4" }),
          event({ note: "E4", tie: true }),
          event({ note: "E4", tie: true }),
        ]),
      )
      expect(result.notes).toBe("E4 E4_ E4_")
      expect(result.struct).toBe("t f f")
      expect(result.velocity).toBe("0.8 0.8 0.8")
    })

    it("handles accent combined with staccato", () => {
      const result = toMiniNotation(
        figure([event({ note: "A4", velocity: 1.0, duration: 0.5 })]),
      )
      expect(result.notes).toBe("A4/2")
      expect(result.struct).toBe("t")
      expect(result.velocity).toBe("1")
    })

    it("tie takes priority over staccato when both present", () => {
      const result = toMiniNotation(
        figure([
          event({ note: "C4" }),
          event({ note: "C4", tie: true, duration: 0.5 }),
        ]),
      )
      expect(result.notes).toBe("C4 C4_")
      expect(result.struct).toBe("t f")
      expect(result.velocity).toBe("0.8 0.8")
    })

    it("rest with tie flag still encodes as rest", () => {
      const result = toMiniNotation(
        figure([
          event({ note: "~", degree: 0, duration: 0, velocity: 0, tie: true }),
        ]),
      )
      expect(result.notes).toBe("~")
      expect(result.struct).toBe("f")
      expect(result.velocity).toBe("0")
    })

    it("works with non-melody figure types", () => {
      const result = toMiniNotation({
        type: "bass",
        events: [
          event({ note: "E2" }),
          event({ note: "~", degree: 0, duration: 0, velocity: 0 }),
          event({ note: "G2", velocity: 1.0 }),
        ],
      })
      expect(result.notes).toBe("E2 ~ G2")
      expect(result.struct).toBe("t f t")
      expect(result.velocity).toBe("0.8 0 1")
    })

    it("returns StrudelOutput type with correct shape", () => {
      const result: StrudelOutput = toMiniNotation(figure([event()]))
      expect(result).toHaveProperty("notes")
      expect(result).toHaveProperty("struct")
      expect(result).toHaveProperty("velocity")
    })
  })
})
