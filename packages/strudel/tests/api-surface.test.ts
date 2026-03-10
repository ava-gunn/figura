import { describe, it, expect } from "vitest"
import { toMiniNotation } from "../src/index.js"
import type { StrudelOutput } from "../src/index.js"

describe("@figura/strudel public API", () => {
  it("exports toMiniNotation as a function", () => {
    expect(typeof toMiniNotation).toBe("function")
  })

  it("exports StrudelOutput type (compile-time verification)", () => {
    const _output: StrudelOutput = {
      notes: "",
      struct: "",
      velocity: "",
    }
    void _output
    expect(true).toBe(true)
  })
})
