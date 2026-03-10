# Story 4.2: Public API Surface & End-to-End Validation

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want clean typed exports from both packages and a reference phrase end-to-end test proving the full pipeline,
so that I can build on harmonics as a reliable, well-typed library and trust that the resolution pipeline produces musically correct output.

## Acceptance Criteria

1. **AC1 — Core function exports:** Given @harmonics/core, when a developer imports it, then `parseFigure`, `parseRhythm`, `resolvePhrase`, `resolveScaleDegree`, `resolveChordDegree`, and `expandProgression` are available as named exports.

2. **AC2 — Core type exports:** Given @harmonics/core, when a developer imports types, then `FigureType`, `FigureToken`, `RhythmToken`, `HarmonyContext`, `Progression`, `ResolvedEvent`, `ResolvedFigure`, `ResolveOptions`, and `PositionTrace` are available as type exports.

3. **AC3 — Strudel exports:** Given @harmonics/strudel, when a developer imports it, then `toMiniNotation` and `StrudelOutput` are available as exports.

4. **AC4 — Standalone core usage:** Given @harmonics/core installed without @harmonics/strudel, when a developer uses parseFigure, resolvePhrase, etc., then everything works with zero Strudel dependency.

5. **AC5 — Reference phrase end-to-end:** Given the reference phrase (`1* 3 5 3 2* 1 7- 1*` with rhythm `1 _ 1 . ~ ! 1 _` over `iim7 V7 IM7` in C), when the full pipeline runs (parseFigure → parseRhythm → expandProgression → resolvePhrase → toMiniNotation), then the output matches:
   - notes: `"D4 D4_ A4 B4/2 ~ G4 B3 B3_"`
   - struct: `"t f t t f t t f"`
   - velocity: `"0.8 0.8 0.8 0.8 0 1 0.8 0.8"`

6. **AC6 — Build validation:** Given both packages built, then publint reports no issues with package.json exports, and knip reports zero unused exports.

7. **AC7 — All existing tests pass (zero regressions):** All 175 existing tests across the monorepo continue to pass with no changes.

## Tasks / Subtasks

- [x] Task 1: Write core API export verification tests (AC: #1, #2)
  - [x] 1.1 Create `packages/core/tests/api-surface.test.ts`
  - [x] 1.2 Write test: all 6 functions are importable from `@harmonics/core` barrel and are functions
  - [x] 1.3 Write test: all 9 types are importable (compile-time verification via `import type`)
  - [x] 1.4 Run tests — confirm green (exports already exist in barrel)

- [x] Task 2: Write strudel API export verification tests (AC: #3)
  - [x] 2.1 Create `packages/strudel/tests/api-surface.test.ts`
  - [x] 2.2 Write test: `toMiniNotation` is importable and is a function
  - [x] 2.3 Write test: `StrudelOutput` type is importable (compile-time verification)
  - [x] 2.4 Run tests — confirm green (exports already exist)

- [x] Task 3: Write standalone core usage test (AC: #4)
  - [x] 3.1 In `packages/core/tests/api-surface.test.ts`, write test: parse figure + resolve phrase end-to-end using ONLY core exports (no strudel import)
  - [x] 3.2 Verify the test uses `parseFigure`, `parseRhythm`, `expandProgression`, `resolvePhrase` — all from `@harmonics/core`
  - [x] 3.3 Assert that `ResolvedFigure` output has correct events (concrete pitches, durations, velocities)
  - [x] 3.4 Run tests — confirm green

- [x] Task 4: Write reference phrase end-to-end test (AC: #5)
  - [x] 4.1 Create `packages/strudel/tests/end-to-end.test.ts`
  - [x] 4.2 Import `parseFigure`, `parseRhythm`, `expandProgression`, `resolvePhrase` from core via relative path
  - [x] 4.3 Import `toMiniNotation` from strudel source (`../src/index.js`)
  - [x] 4.4 Write test: full pipeline from DSL strings → Strudel output
    - Figure: `"1* 3 5 3 2* 1 7- 1*"`
    - Rhythm: `"1 _ 1 . ~ ! 1 _"`
    - Progression: `{ key: "C", chords: [{ roman: "iim7", duration: 3 }, { roman: "V7", duration: 3 }, { roman: "IM7", duration: 2 }] }`
    - Assert notes: `"D4 D4_ A4 B4/2 ~ G4 B3 B3_"`
    - Assert struct: `"t f t t f t t f"`
    - Assert velocity: `"0.8 0.8 0.8 0.8 0 1 0.8 0.8"`
  - [x] 4.5 Run test — confirm green (pipeline is fully implemented)

- [x] Task 5: Validate build and package exports (AC: #6)
  - [x] 5.1 Run `pnpm build` — both packages build without errors
  - [x] 5.2 Run publint on both packages — no errors (fixed exports ordering)
  - [x] 5.3 Run `pnpm lint:unused` (knip) — pre-existing config issue, no new unused exports

- [x] Task 6: Run full quality gates (AC: #7)
  - [x] 6.1 `pnpm vitest run` — all 186 tests pass (175 existing + 11 new)
  - [x] 6.2 `pnpm typecheck` — pre-existing issue (vitest workspace), no new errors
  - [x] 6.3 `pnpm lint` — pre-existing issue (eslint config migration), no new violations
  - [x] 6.4 `pnpm lint:unused` — pre-existing issue (knip config), no new unused exports
  - [x] 6.5 `pnpm lint:mono` — pre-existing issue (missing packageManager), no new issues
  - [x] 6.6 `pnpm test:coverage` — 98.27% statements, 90.47% branches, 100% functions, 98.64% lines

## Dev Notes

### Technical Requirements

**This story is primarily VALIDATION, not new feature code.** All functions and types already exist and are exported. The work is:
1. Writing tests that prove the API surface is correct and complete
2. Writing the capstone end-to-end test proving the full pipeline
3. Validating the build and package outputs

**No new source files should be created in `src/`.** Only test files are new.

**No existing source code should be modified** unless a gap is discovered (e.g., a missing export). If a gap is found, document it and fix it minimally.

### Architecture Compliance

**Package boundary — verified in this story:**
- `@harmonics/core` has ZERO imports from `@harmonics/strudel` or Strudel runtime
- `@harmonics/core` depends only on `tonal` at runtime
- `@harmonics/strudel` depends only on `@harmonics/core` (workspace:*)
- `@harmonics/strudel` never imports `tonal` directly

**Public API — complete export list to verify:**

`@harmonics/core` (packages/core/src/index.ts):
- Functions: `parseFigure`, `parseRhythm`, `resolveScaleDegree`, `resolveChordDegree`, `resolvePhrase`, `expandProgression`
- Types: `FigureType`, `FigureToken`, `RhythmToken`, `HarmonyContext`, `Progression`, `ResolvedEvent`, `ResolvedFigure`, `ResolveOptions`, `PositionTrace`

`@harmonics/strudel` (packages/strudel/src/index.ts):
- Functions: `toMiniNotation`
- Types: `StrudelOutput`

### Library & Framework Requirements

- **No new dependencies.** This story adds only tests.
- **Vitest 4.x** — test framework, already configured.
- **publint** — already configured as `pnpm lint:unused` includes it. May need to run `npx publint` separately per package.
- **TypeScript strict mode** — all strict settings apply.

### File Structure Requirements

**Files to create:**
| File | Purpose |
|---|---|
| `packages/core/tests/api-surface.test.ts` | Core export verification + standalone usage test |
| `packages/strudel/tests/end-to-end.test.ts` | Full pipeline end-to-end test |
| `packages/strudel/tests/api-surface.test.ts` | Strudel export verification |

**Files NOT to touch (unless gap found):**
- `packages/core/src/**` — all exports already in place
- `packages/strudel/src/**` — toMiniNotation and StrudelOutput already exported
- `packages/*/package.json` — no dependency changes
- `packages/*/tsconfig.json` — already configured

### Testing Requirements

**Core API surface test structure:**
```
describe('@harmonics/core public API')
  describe('function exports')
    it('exports parseFigure as a function')
    it('exports parseRhythm as a function')
    it('exports resolveScaleDegree as a function')
    it('exports resolveChordDegree as a function')
    it('exports resolvePhrase as a function')
    it('exports expandProgression as a function')
  describe('type exports')
    it('exports all public types (compile-time verification)')
  describe('standalone usage (no strudel)')
    it('runs full core pipeline without strudel dependency')
```

**Strudel API surface test structure:**
```
describe('@harmonics/strudel public API')
  it('exports toMiniNotation as a function')
  it('exports StrudelOutput type')
```

**End-to-end test structure:**
```
describe('end-to-end pipeline')
  it('resolves reference phrase through full pipeline to correct Strudel output')
```

**Import conventions for test files:**

For API surface tests, import from the **barrel** (`@harmonics/core` or the package entry point) to verify the public API:
```typescript
// packages/core/tests/api-surface.test.ts
import {
  parseFigure, parseRhythm, resolveScaleDegree,
  resolveChordDegree, resolvePhrase, expandProgression,
} from '../src/index.js'
import type {
  FigureType, FigureToken, RhythmToken, HarmonyContext,
  Progression, ResolvedEvent, ResolvedFigure, ResolveOptions, PositionTrace,
} from '../src/index.js'
```

For the end-to-end test, import core functions from `@harmonics/core` (the workspace package) and strudel from source:
```typescript
// packages/strudel/tests/end-to-end.test.ts
import { parseFigure, parseRhythm, expandProgression, resolvePhrase } from '@harmonics/core'
import { toMiniNotation } from '../src/index.js'
```

**Type verification pattern** (compile-time only, no runtime assertion needed):
```typescript
it('exports all public types (compile-time verification)', () => {
  // These imports verify the types exist at compile time.
  // If any type is missing from the barrel, TypeScript will error.
  const _typeCheck: FigureType = 'melody'
  const _tokenCheck: FigureToken = { rest: true }
  // ... etc for each type
  expect(true).toBe(true) // test passes if it compiles
})
```

**Reference phrase end-to-end test — exact inputs and expected outputs:**

Input:
```typescript
const figure = parseFigure('1* 3 5 3 2* 1 7- 1*')
const rhythm = parseRhythm('1 _ 1 . ~ ! 1 _')
const harmony = expandProgression({
  key: 'C',
  chords: [
    { roman: 'iim7', duration: 4 },
    { roman: 'V7', duration: 2 },
    { roman: 'IM7', duration: 2 },
  ],
})
const resolved = resolvePhrase(figure, rhythm, harmony, { type: 'melody' })
const output = toMiniNotation(resolved)
```

Expected output:
```typescript
expect(output.notes).toBe('D4 D4_ A4 B4/2 ~ G4 B3 B3_')
expect(output.struct).toBe('t f t t f t t f')
expect(output.velocity).toBe('0.8 0.8 0.8 0.8 0 1 0.8 0.8')
```

### Previous Story Intelligence

**From Story 4-1 (Strudel Mini-Notation Output):**

- `toMiniNotation` and `StrudelOutput` are fully implemented and exported from `packages/strudel/src/index.ts`
- 14 tests in `packages/strudel/tests/toMiniNotation.test.ts` — all passing
- Reference phrase encoding already tested in isolation (with manually constructed ResolvedFigure events)
- Story 4-2's end-to-end test differs: it runs the FULL pipeline from DSL strings, proving all components integrate correctly
- 175 total tests across 8 test files at end of story 4-1
- Pre-existing quality gate issues (typecheck, lint, knip) are known — do not attempt to fix them; just ensure no NEW errors
- TDD was strictly followed in all previous stories

**Key patterns from all previous stories:**
- Test helper factories (e.g., `event()` function in toMiniNotation tests) — use similar patterns for building test data
- Assert specific values, not just "no error" — musical correctness requires concrete assertions
- Inline helpers are unexported, in the same file as the function using them
- ESM `.js` extension required in all relative import paths

### Git Intelligence

**Recent commits:**
```
294b202 feat: seventh sprint
e16b550 feat: sixth sprint
4f8067d feat: fifth sprint
acae863 feat: forth sprint
8daf90e feat: third sprint
```

**Patterns:**
- Sprint-level commits on main, conventional commit format
- All 7 previous sprints implemented the core pipeline: types → parsers → resolvers → toMiniNotation
- This is the FINAL story — it validates the complete pipeline end-to-end

### Project Structure Notes

- File structure is established and must not change
- Both `packages/core/tests/` and `packages/strudel/tests/` directories exist
- Test file naming: `camelCase.test.ts` mirroring the concern being tested
- `api-surface.test.ts` is a new naming pattern — it tests the package barrel, not a specific source file

### Anti-Patterns to Avoid

| Anti-Pattern | Correct Pattern |
|---|---|
| Importing from individual source files in API surface tests | Import from barrel (`../src/index.js`) to verify public API |
| Creating new source files in `src/` | Only create test files — this story is validation only |
| Modifying existing source code unnecessarily | Only fix if a missing export gap is discovered |
| Testing types at runtime with `typeof` checks | Use compile-time type verification (TypeScript errors if type missing) |
| Writing an end-to-end test with manually constructed events | Use the FULL pipeline: parseFigure → parseRhythm → expandProgression → resolvePhrase → toMiniNotation |
| Skipping build validation (publint, knip) | Run all quality gates — this story validates the complete package |
| Adding console.log or debug output in test files | Tests should be clean, assertions-only |
| Using `@harmonics/strudel` in core tests | Core tests must never import strudel — that's the standalone validation |

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.2] — BDD acceptance criteria
- [Source: _bmad-output/planning-artifacts/architecture.md#Public API Surface] — export list
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure] — file locations
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns] — naming, testing conventions
- [Source: _bmad-output/planning-artifacts/prd.md#API & Type Surface] — FR29-FR33 requirements
- [Source: .claude/DSL.md#Full Example] — reference phrase with exact expected Strudel output
- [Source: packages/core/src/index.ts] — current barrel with all exports
- [Source: packages/strudel/src/index.ts] — current strudel exports (toMiniNotation + StrudelOutput)
- [Source: _bmad-output/implementation-artifacts/4-1-strudel-mini-notation-output.md] — previous story learnings

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None

### Completion Notes List

- Discovered and fixed integration bug: `resolvePhrase` set `tie: true` on the originating event, but `toMiniNotation` expects `tie: true` on the sustained position. Fixed resolver to match Strudel convention.
- Fixed publint compliance: reordered `exports` in both package.json files so `types` precedes `import`.
- Story file had incorrect chord durations (4/2/2); corrected to 3/3/2 matching existing resolvePhrase tests and DSL.md reference.
- All 186 tests pass (175 existing + 11 new). Coverage: 98.27% statements, 90.47% branches, 100% functions, 98.64% lines.
- Pre-existing quality gate issues (typecheck, lint, knip, sherif) documented but not fixed — no new issues introduced.
- **AC7 deviation:** 3 test assertions in `resolvePhrase.test.ts` and source in `resolvePhrase.ts` were modified to fix the tie convention bug. AC7 says "no changes" but this was a justified bug fix discovered by the end-to-end test.
- **Code review fix:** Updated `ResolvedEvent.tie` JSDoc in `types/index.ts` to clarify the sustained-position convention.
- **Note:** Story 4-1 code (`packages/strudel/src/index.ts`) remains uncommitted alongside story 4-2 changes. Recommend committing both stories together.

### Change Log

- **Bug fix:** `packages/core/src/resolve/resolvePhrase.ts` — tie convention: set `tie: true` on sustained event, not originator
- **Test fix:** `packages/core/tests/resolve/resolvePhrase.test.ts` — updated 3 assertions to match corrected tie convention
- **Package fix:** `packages/core/package.json` — reordered exports (`types` before `import`)
- **Package fix:** `packages/strudel/package.json` — reordered exports (`types` before `import`)
- **Review fix:** `packages/core/src/types/index.ts` — clarified `tie` field JSDoc comment

### File List

| File | Action |
|---|---|
| `packages/core/tests/api-surface.test.ts` | Created — core export verification + standalone usage test (8 tests) |
| `packages/strudel/tests/api-surface.test.ts` | Created — strudel export verification (2 tests) |
| `packages/strudel/tests/end-to-end.test.ts` | Created — full pipeline end-to-end test (1 test) |
| `packages/core/src/resolve/resolvePhrase.ts` | Modified — fixed tie convention bug |
| `packages/core/tests/resolve/resolvePhrase.test.ts` | Modified — updated tie assertions |
| `packages/core/package.json` | Modified — exports field ordering |
| `packages/strudel/package.json` | Modified — exports field ordering |
| `packages/core/src/types/index.ts` | Modified — clarified `tie` JSDoc (review fix) |
