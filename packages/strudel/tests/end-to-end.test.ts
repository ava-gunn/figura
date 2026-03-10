import { describe, it, expect } from "vitest"
import {
  parseFigure,
  parseRhythm,
  expandProgression,
  resolvePhrase,
} from "../../core/src/index.js"
import { toMiniNotation } from "../src/index.js"

describe("end-to-end pipeline", () => {
  it("resolves reference phrase through full pipeline to correct Strudel output", () => {
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
    const output = toMiniNotation(resolved)

    expect(output.notes).toBe("D4 D4_ A4 B4/2 ~ G4 B3 B3_")
    expect(output.struct).toBe("t f t t f t t f")
    expect(output.velocity).toBe("0.8 0.8 0.8 0.8 0 1 0.8 0.8")
  })
})
