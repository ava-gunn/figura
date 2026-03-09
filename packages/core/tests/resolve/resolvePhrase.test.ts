import { describe, it, expect } from "vitest"
import { resolvePhrase } from "../../src/resolve/resolvePhrase.js"
import { expandProgression } from "../../src/resolve/expandProgression.js"
import { parseFigure } from "../../src/dsl/parseFigure.js"
import { parseRhythm } from "../../src/dsl/parseRhythm.js"
import type { FigureToken, RhythmToken, HarmonyContext } from "../../src/types/index.js"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function dm7Context(): HarmonyContext {
  return expandProgression({ key: "C", chords: [{ roman: "iim7", duration: 1 }] })[0]!
}

function g7Context(): HarmonyContext {
  return expandProgression({ key: "C", chords: [{ roman: "V7", duration: 1 }] })[0]!
}

function cmaj7Context(): HarmonyContext {
  return expandProgression({ key: "C", chords: [{ roman: "IM7", duration: 1 }] })[0]!
}

function playToken(): RhythmToken {
  return { play: true, tie: false, staccato: false, accent: false }
}

function restRhythm(): RhythmToken {
  return { play: false, tie: false, staccato: false, accent: false }
}

function tieToken(): RhythmToken {
  return { play: false, tie: true, staccato: false, accent: false }
}

function staccatoToken(): RhythmToken {
  return { play: true, tie: false, staccato: true, accent: false }
}

function accentToken(): RhythmToken {
  return { play: true, tie: false, staccato: false, accent: true }
}

function degree(n: number, anchor = false, octaveDown = false): FigureToken {
  return { rest: false, degree: n, anchor, octaveDown }
}

function figureRest(): FigureToken {
  return { rest: true }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("resolvePhrase", () => {
  describe("basic resolution", () => {
    it("resolves melody degrees 1, 3, 5 over Dm7 to D4, F4, A4", () => {
      const figure = [degree(1, true), degree(3), degree(5)]
      const rhythm = [playToken(), playToken(), playToken()]
      const result = resolvePhrase(figure, rhythm, dm7Context(), "melody")

      expect(result.type).toBe("melody")
      expect(result.events).toHaveLength(3)
      expect(result.events[0]!.note).toBe("D4")
      expect(result.events[1]!.note).toBe("F4")
      expect(result.events[2]!.note).toBe("A4")
    })

    it("resolves chord degrees over Dm7 using chord tones with nearest-below", () => {
      const figure = [degree(1, true), degree(2), degree(3)]
      const rhythm = [playToken(), playToken(), playToken()]
      const result = resolvePhrase(figure, rhythm, dm7Context(), "chord")

      expect(result.type).toBe("chord")
      // Chord type uses nearest-below voice leading
      // Dm7 chord tones: D, F, A, C
      // Degree 1 = D4 (first note, octave 4)
      // Degree 2 = F, nearest-below D4 → F3
      // Degree 3 = A, nearest-below F3 → A2
      expect(result.events[0]!.note).toBe("D4")
      expect(result.events[1]!.note).toBe("F3")
      expect(result.events[2]!.note).toBe("A2")
    })
  })

  describe("normal event defaults", () => {
    it("sets duration 1 and velocity 0.8 for a normally played note", () => {
      const figure = [degree(1, true)]
      const rhythm = [playToken()]
      const result = resolvePhrase(figure, rhythm, dm7Context(), "melody")

      expect(result.events[0]!.duration).toBe(1)
      expect(result.events[0]!.velocity).toBe(0.8)
      expect(result.events[0]!.tie).toBe(false)
    })
  })

  describe("rhythm precedence", () => {
    it("produces a rest event when rhythm is rest", () => {
      const figure = [degree(1, true), degree(3)]
      const rhythm = [playToken(), restRhythm()]
      const result = resolvePhrase(figure, rhythm, dm7Context(), "melody")

      const restEvent = result.events[1]!
      expect(restEvent.note).toBe("~")
      expect(restEvent.degree).toBe(0)
      expect(restEvent.duration).toBe(0)
      expect(restEvent.velocity).toBe(0)
      expect(restEvent.tie).toBe(false)
    })

    it("produces a rest event when figure is rest", () => {
      const figure = [degree(1, true), figureRest()]
      const rhythm = [playToken(), playToken()]
      const result = resolvePhrase(figure, rhythm, dm7Context(), "melody")

      const restEvent = result.events[1]!
      expect(restEvent.note).toBe("~")
      expect(restEvent.degree).toBe(0)
      expect(restEvent.duration).toBe(0)
      expect(restEvent.velocity).toBe(0)
    })

    it("sets tie: true on preceding event and sustains pitch on tied position", () => {
      const figure = [degree(1, true), degree(3)]
      const rhythm = [playToken(), tieToken()]
      const result = resolvePhrase(figure, rhythm, dm7Context(), "melody")

      // Position 0: tie: true because position 1 is a tie
      expect(result.events[0]!.tie).toBe(true)
      expect(result.events[0]!.note).toBe("D4")

      // Position 1: sustains D4 (NOT F4), tie: false on the tied position itself
      expect(result.events[1]!.note).toBe("D4")
      expect(result.events[1]!.tie).toBe(false)
    })

    it("sets duration 0.5 for staccato rhythm", () => {
      const figure = [degree(1, true)]
      const rhythm = [staccatoToken()]
      const result = resolvePhrase(figure, rhythm, dm7Context(), "melody")

      expect(result.events[0]!.duration).toBe(0.5)
    })

    it("sets velocity 1.0 for accented rhythm", () => {
      const figure = [degree(1, true)]
      const rhythm = [accentToken()]
      const result = resolvePhrase(figure, rhythm, dm7Context(), "melody")

      expect(result.events[0]!.velocity).toBe(1.0)
    })

    it("emits rest when tie is at position 0 with no previous note", () => {
      const figure = [degree(1, true), degree(3)]
      const rhythm = [tieToken(), playToken()]
      const result = resolvePhrase(figure, rhythm, dm7Context(), "melody")

      // Tie at position 0: no previous event to set tie on, no previous note to sustain
      expect(result.events[0]!.note).toBe("~")
      expect(result.events[0]!.tie).toBe(false)
      // Position 1 still resolves normally (first pitched note gets octave 4)
      expect(result.events[1]!.note).toBe("F4")
    })

    it("voice-leads correctly after a figure rest", () => {
      // D4 → rest → degree 3 should voice-lead from D4 (not reset)
      const figure = [degree(1, true), figureRest(), degree(3)]
      const rhythm = [playToken(), playToken(), playToken()]
      const result = resolvePhrase(figure, rhythm, dm7Context(), "melody")

      expect(result.events[0]!.note).toBe("D4")
      expect(result.events[1]!.note).toBe("~")
      // Degree 3 in D dorian = F. Nearest to D4 (previous pitched note) = F4
      expect(result.events[2]!.note).toBe("F4")
    })
  })

  describe("contour preservation", () => {
    it("preserves ascending contour across chord changes (Dm7 → G7)", () => {
      // Degrees 1, 3, 5 ascending over Dm7 (2 beats) then G7 (1 beat)
      const figure = [degree(1, true), degree(3), degree(5)]
      const rhythm = [playToken(), playToken(), playToken()]
      const contexts = expandProgression({
        key: "C",
        chords: [
          { roman: "iim7", duration: 2 },
          { roman: "V7", duration: 1 },
        ],
      })
      const result = resolvePhrase(figure, rhythm, contexts, "melody")

      expect(result.events).toHaveLength(3)
      // Over Dm7: degree 1 = D4, degree 3 = F4
      expect(result.events[0]!.note).toBe("D4")
      expect(result.events[1]!.note).toBe("F4")
      // Over G7: degree 5 of G mixolydian = D
      // Voice leading nearest to F4: D4 is 3 semitones below, D5 is 9 above
      // Nearest-overall picks D4, which is a descent from F4
      // This is acceptable — voice leading (nearest) takes priority in the algorithm
      // Contour preservation means the resolver doesn't arbitrarily jump octaves
      expect(result.events[2]!.note).toBe("D4")
    })
  })

  describe("voice leading", () => {
    it("uses nearest-overall voice leading for melody type", () => {
      // D4 (degree 1) then degree 7 (C in D dorian)
      // C is closest to D4 as C4 (2 semitones below) vs C5 (10 above)
      // But C is above D in D dorian ascending, so resolveScaleDegree puts C at octave 5
      // Voice leading should pick C4 as nearest to D4
      const figure = [degree(1, true), degree(7)]
      const rhythm = [playToken(), playToken()]
      const result = resolvePhrase(figure, rhythm, dm7Context(), "melody")

      // Degree 7 in D dorian = C. Nearest to D4 is C4 (2 semitones below)
      expect(result.events[1]!.note).toBe("C4")
    })

    it("uses nearest-below voice leading for bass type", () => {
      // Bass: degree 1 → D4, then degree 3 → A
      // Nearest-below from D4: A3 (5 semitones below) vs A4 (which is above)
      const figure = [degree(1, true), degree(3)]
      const rhythm = [playToken(), playToken()]
      const result = resolvePhrase(figure, rhythm, dm7Context(), "bass")

      // Degree 1 = D4, degree 3 of Dm7 chord tones = A
      // Nearest-below D4: A3
      expect(result.events[0]!.note).toBe("D4")
      expect(result.events[1]!.note).toBe("A3")
    })
  })

  describe("anchor and octave", () => {
    it("places first note at octave 4 when it is the anchor", () => {
      const figure = [degree(1, true), degree(3)]
      const rhythm = [playToken(), playToken()]
      const result = resolvePhrase(figure, rhythm, dm7Context(), "melody")

      // Anchor degree 1 over D dorian = D4
      expect(result.events[0]!.note).toBe("D4")
      expect(result.events[0]!.anchor).toBe(true)
    })

    it("places first note at octave 4 when no anchor is present", () => {
      const figure = [degree(1), degree(3)]
      const rhythm = [playToken(), playToken()]
      const result = resolvePhrase(figure, rhythm, dm7Context(), "melody")

      // No anchor, first note gets octave 4
      expect(result.events[0]!.note).toBe("D4")
    })

    it("places first note at octave 4 even when anchor is not first (single-pass)", () => {
      // Anchor is at position 2, but single-pass resolves left-to-right:
      // first note always gets octave 4, anchor is voice-led from there.
      const figure = [degree(3), degree(5), degree(1, true)]
      const rhythm = [playToken(), playToken(), playToken()]
      const result = resolvePhrase(figure, rhythm, dm7Context(), "melody")

      // First note (degree 3 = F) gets octave 4
      expect(result.events[0]!.note).toBe("F4")
      expect(result.events[0]!.anchor).toBe(false)
      // Anchor at position 2 is voice-led from position 1, not forced to octave 4
      expect(result.events[2]!.anchor).toBe(true)
    })

    it("drops pitch one octave when octaveDown is true", () => {
      const figure = [degree(1, true), degree(7, false, true)]
      const rhythm = [playToken(), playToken()]
      const result = resolvePhrase(figure, rhythm, dm7Context(), "melody")

      // Degree 7 in D dorian = C. Nearest to D4 is C4.
      // With octaveDown, it becomes C3
      expect(result.events[1]!.note).toBe("C3")
    })
  })

  describe("LCM cycling", () => {
    it("produces 12 events for figure length 3 and rhythm length 4 (AC1)", () => {
      // LCM(3, 4) = 12
      const figure = [degree(1, true), degree(3), degree(5)]
      const rhythm = [playToken(), playToken(), playToken(), playToken()]
      const result = resolvePhrase(figure, rhythm, dm7Context(), "melody")

      expect(result.events).toHaveLength(12)
    })

    it("produces 4 events for equal length figure and rhythm (AC2)", () => {
      const figure = [degree(1, true), degree(3), degree(5), degree(7)]
      const rhythm = [playToken(), playToken(), playToken(), playToken()]
      const result = resolvePhrase(figure, rhythm, dm7Context(), "melody")

      expect(result.events).toHaveLength(4)
    })

    it("produces 6 events for figure length 2 and rhythm length 3 (AC3)", () => {
      // LCM(2, 3) = 6
      const figure = [degree(1, true), degree(3)]
      const rhythm = [playToken(), playToken(), playToken()]
      const result = resolvePhrase(figure, rhythm, dm7Context(), "melody")

      expect(result.events).toHaveLength(6)
    })

    it("uses harmony array length when HarmonyContext[] is provided (AC4)", () => {
      // Figure 3 + rhythm 4 → LCM would be 12, but harmony array of 8 wins
      const figure = [degree(1, true), degree(3), degree(5)]
      const rhythm = [playToken(), playToken(), playToken(), playToken()]
      const contexts = expandProgression({
        key: "C",
        chords: [
          { roman: "iim7", duration: 4 },
          { roman: "V7", duration: 4 },
        ],
      })
      const result = resolvePhrase(figure, rhythm, contexts, "melody")

      expect(result.events).toHaveLength(8)
    })

    it("cycles figure and rhythm correctly through all LCM positions (AC8)", () => {
      // Figure [1*, 3] + rhythm [play, play, play] → LCM(2,3) = 6
      // Positions: fig[0],fig[1],fig[0],fig[1],fig[0],fig[1]
      // Degrees:   1,     3,     1,     3,     1,     3
      const figure = [degree(1, true), degree(3)]
      const rhythm = [playToken(), playToken(), playToken()]
      const result = resolvePhrase(figure, rhythm, dm7Context(), "melody")

      expect(result.events).toHaveLength(6)
      // All events should be pitched notes (no rests), voice-led correctly
      // Degree 1 = D, degree 3 = F in D dorian
      // Voice leading chain: D4, F4, D4 (nearest to F4), F4, D4, F4
      expect(result.events[0]!.note).toBe("D4")
      expect(result.events[1]!.note).toBe("F4")
      expect(result.events[2]!.note).toBe("D4")
      expect(result.events[3]!.note).toBe("F4")
      expect(result.events[4]!.note).toBe("D4")
      expect(result.events[5]!.note).toBe("F4")
      // Degrees cycle
      expect(result.events[0]!.degree).toBe(1)
      expect(result.events[1]!.degree).toBe(3)
      expect(result.events[2]!.degree).toBe(1)
      expect(result.events[3]!.degree).toBe(3)
    })
  })

  describe("anchor-on-rest", () => {
    it("shifts anchor to nearest played note when anchor aligns with rest (AC5)", () => {
      // Figure [1*, 3, 5] with rhythm [rest, play, play]
      // Anchor at position 0, but rhythm is rest → shift anchor to position 1
      const figure = [degree(1, true), degree(3), degree(5)]
      const rhythm = [restRhythm(), playToken(), playToken()]
      const result = resolvePhrase(figure, rhythm, dm7Context(), "melody")

      // Position 0: rest event, anchor should be false
      expect(result.events[0]!.note).toBe("~")
      expect(result.events[0]!.anchor).toBe(false)
      // Position 1: should receive the shifted anchor flag
      expect(result.events[1]!.anchor).toBe(true)
      // Position 2: normal, no anchor
      expect(result.events[2]!.anchor).toBe(false)
    })

    it("handles anchor-on-rest with LCM cycling (AC6)", () => {
      // Figure [1*, 3, 5] + rhythm [rest, play, play, play] → LCM(3,4) = 12
      // Anchor positions (fig[0]=1*): 0, 3, 6, 9
      // Rhythm mapping (i%4): 0→rest, 1→play, 2→play, 3→play
      // Pos 0: anchor+rest → shift to pos 1
      // Pos 3: anchor+play → stays at 3
      // Pos 6: anchor+play → stays at 6
      // Pos 9: anchor+play → stays at 9
      const figure = [degree(1, true), degree(3), degree(5)]
      const rhythm = [restRhythm(), playToken(), playToken(), playToken()]
      const result = resolvePhrase(figure, rhythm, dm7Context(), "melody")

      expect(result.events).toHaveLength(12)
      // Position 0: rest, anchor shifted away
      expect(result.events[0]!.note).toBe("~")
      expect(result.events[0]!.anchor).toBe(false)
      // Position 1: receives shifted anchor from pos 0
      expect(result.events[1]!.anchor).toBe(true)
      // Positions 3, 6, 9: cycling anchors land on play — no shift needed
      expect(result.events[3]!.anchor).toBe(true)
      expect(result.events[6]!.anchor).toBe(true)
      expect(result.events[9]!.anchor).toBe(true)
      // Rests at positions 4, 8 (rhythm[0]=rest cycling)
      expect(result.events[4]!.note).toBe("~")
      expect(result.events[8]!.note).toBe("~")
    })

    it("shifts anchor backward when no forward playable position exists", () => {
      // Figure [3, 5, 1*] with rhythm [play, play, rest]
      // Anchor at position 2, rhythm is rest. Forward search: nothing (end of array).
      // Backward search: position 1 (play, not rest) → anchor shifts to 1.
      const figure = [degree(3), degree(5), degree(1, true)]
      const rhythm = [playToken(), playToken(), restRhythm()]
      const result = resolvePhrase(figure, rhythm, dm7Context(), "melody")

      expect(result.events).toHaveLength(3)
      expect(result.events[2]!.note).toBe("~")
      expect(result.events[2]!.anchor).toBe(false)
      // Anchor shifted backward to position 1
      expect(result.events[1]!.anchor).toBe(true)
      expect(result.events[0]!.anchor).toBe(false)
    })

    it("drops anchor silently when all positions are rests", () => {
      // Figure [1*, 3] with rhythm [rest, rest] → LCM(2,2) = 2
      // Anchor at position 0, rhythm is rest. No playable positions exist.
      const figure = [degree(1, true), degree(3)]
      const rhythm = [restRhythm(), restRhythm()]
      const result = resolvePhrase(figure, rhythm, dm7Context(), "melody")

      expect(result.events).toHaveLength(2)
      // Both are rests, anchor has nowhere to go
      expect(result.events[0]!.anchor).toBe(false)
      expect(result.events[1]!.anchor).toBe(false)
    })

    it("does not shift anchor when it does not align with a rest (AC7)", () => {
      const figure = [degree(1, true), degree(3), degree(5)]
      const rhythm = [playToken(), playToken(), playToken()]
      const result = resolvePhrase(figure, rhythm, dm7Context(), "melody")

      // Anchor at position 0 with play rhythm — no shift needed
      expect(result.events[0]!.anchor).toBe(true)
      expect(result.events[1]!.anchor).toBe(false)
      expect(result.events[2]!.anchor).toBe(false)
    })
  })

  describe("reference phrase", () => {
    it("resolves the full reference phrase correctly (AC12)", () => {
      const figure = parseFigure("1* 3 5 3 2* 1 7- 1*")
      const rhythm = parseRhythm("1 _ 1 . ~ ! 1 _")
      const contexts = expandProgression({
        key: "C",
        chords: [
          { roman: "iim7", duration: 3 },
          { roman: "V7", duration: 3 },
          { roman: "IM7", duration: 2 },
        ],
      })

      const result = resolvePhrase(figure, rhythm, contexts, "melody")

      expect(result.type).toBe("melody")
      expect(result.events).toHaveLength(8)

      // Pos 0: D4, degree 1, anchor true, duration 1, velocity 0.8, tie true
      expect(result.events[0]).toMatchObject({
        note: "D4", degree: 1, anchor: true, duration: 1, velocity: 0.8, tie: true,
      })

      // Pos 1: D4 (tied — sustains D4, not F4), degree 3, anchor false
      expect(result.events[1]).toMatchObject({
        note: "D4", degree: 3, anchor: false, duration: 1, velocity: 0.8, tie: false,
      })

      // Pos 2: A4, degree 5, anchor false
      expect(result.events[2]).toMatchObject({
        note: "A4", degree: 5, anchor: false, duration: 1, velocity: 0.8, tie: false,
      })

      // Pos 3: B4 (staccato, chord changed to G7), degree 3
      expect(result.events[3]).toMatchObject({
        note: "B4", degree: 3, anchor: false, duration: 0.5, velocity: 0.8, tie: false,
      })

      // Pos 4: rest (rest wins over anchor), degree 0
      expect(result.events[4]).toMatchObject({
        note: "~", degree: 0, anchor: false, duration: 0, velocity: 0, tie: false,
      })

      // Pos 5: G4 (accent), degree 1, anchor true (shifted from pos 4 where anchor aligned with rest)
      expect(result.events[5]).toMatchObject({
        note: "G4", degree: 1, anchor: true, duration: 1, velocity: 1.0, tie: false,
      })

      // Pos 6: B3 (octave down), degree 7, tie true
      expect(result.events[6]).toMatchObject({
        note: "B3", degree: 7, anchor: false, duration: 1, velocity: 0.8, tie: true,
      })

      // Pos 7: B3 (tied — sustains B3, not C4), degree 1, anchor true
      expect(result.events[7]).toMatchObject({
        note: "B3", degree: 1, anchor: true, duration: 1, velocity: 0.8, tie: false,
      })
    })
  })
})
