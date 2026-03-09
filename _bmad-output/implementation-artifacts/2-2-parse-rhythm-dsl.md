# Story 2.2: Parse Rhythm DSL

Status: done

## Story

As a composer,
I want to write a rhythm as a space-separated string like `"1 _ 1 . ~ ! 1 _"`,
so that I can express timing and articulation independently from the figure.

## Acceptance Criteria

1. **AC1 — Play token:** Given `"1"`, parseRhythm returns a RhythmToken with play: true, tie: false, staccato: false, accent: false
2. **AC2 — Tie token:** Given `"_"`, returns a token with play: false, tie: true, staccato: false, accent: false
3. **AC3 — Staccato token:** Given `"."`, returns a token with play: true, tie: false, staccato: true, accent: false
4. **AC4 — Rest token:** Given `"~"`, returns a token with play: false, tie: false, staccato: false, accent: false
5. **AC5 — Accent token:** Given `"!"`, returns a token with play: true, tie: false, staccato: false, accent: true
6. **AC6 — Error on invalid input:** Given `"x"`, `""`, or multi-character tokens like `"1_"`, throws an Error with a descriptive message including the invalid token and position
7. **AC7 — Reference phrase:** Given `"1 _ 1 . ~ ! 1 _"`, returns 8 correctly typed RhythmToken objects matching the design reference
8. **AC8 — Whitespace tolerance:** Extra leading, trailing, and inter-token whitespace is handled gracefully

## Tasks / Subtasks

- [x] Task 1: Confirm existing tests fail (Red phase) (AC: #1-#8)
  - [x] 1.1 Run `pnpm vitest run packages/core/tests/dsl/parseRhythm.test.ts` — 10 tests fail with "Not implemented", 4 error tests pass
  - [x] 1.2 Review each test case to understand expected behavior before implementing

- [x] Task 2: Check for missing test coverage (AC: #4, #6)
  - [x] 2.1 Compare test file against all ACs — all ACs have at least one test
  - [x] 2.2 Verify tie vs rest distinction is tested — "tie and rest are distinct tokens" test exists
  - [x] 2.3 No missing tests found — test suite is complete

- [x] Task 3: Implement parseRhythm (AC: #1-#8)
  - [x] 3.1 Open `packages/core/src/dsl/parseRhythm.ts`
  - [x] 3.2 Trim and split input on whitespace (`input.trim().split(/\s+/)`)
  - [x] 3.3 Throw if the resulting array is empty or input is blank
  - [x] 3.4 For each raw token string, map single-character tokens via switch statement
  - [x] 3.5 Return the array of parsed RhythmTokens
  - [x] 3.6 Run tests — confirmed all 14 green

- [x] Task 4: Verify error messages are descriptive (AC: #6)
  - [x] 4.1 Ensure thrown errors include the invalid token string and its position index
  - [x] 4.2 Format: `'Invalid rhythm token "x" at position 3'` — implemented
  - [x] 4.3 Multi-character tokens (e.g., `"11"`) fall through to default case and throw correctly

- [x] Task 5: Refactor if needed
  - [x] 5.1 Review implementation — clean switch statement, no refactoring needed
  - [x] 5.2 Run tests — confirmed still green

- [x] Task 6: Verify quality gates
  - [x] 6.1 `pnpm typecheck` — pre-existing errors only; no new errors introduced
  - [x] 6.2 `pnpm test` — all 118 tests pass across 6 test files, zero regressions
  - [x] 6.3 Coverage — parseRhythm fully covered (all 5 token branches + default error branch)

## Dev Notes

### Architecture & Patterns

- **RhythmToken is a flat boolean struct** (NOT a discriminated union like FigureToken). All four fields are always present: `{ play, tie, staccato, accent }`. Rests are `play: false` with all others false. Ties are `play: false, tie: true`.
- **Single-character tokens only** — unlike parseFigure which has degree + modifiers, each rhythm token is exactly one character. No modifier combinations.
- **Parsers throw, resolvers don't** — parseRhythm must throw `Error` on invalid input (empty string, unrecognized tokens, multi-char tokens). No custom error classes needed.
- **Follow parseFigure's implementation pattern** — same trim/split/map approach, same error message style.

### Key Differences from parseFigure

| Aspect | parseFigure | parseRhythm |
|---|---|---|
| Token complexity | Degree digit + optional modifiers | Single character only |
| Type shape | Discriminated union (`rest: true \| rest: false`) | Flat boolean struct |
| Valid tokens | `1-7`, `~`, `*`, `-` (as modifiers) | `1`, `_`, `.`, `~`, `!` |
| Parsing logic | Extract digit, scan modifiers | Direct character switch/map |

### Files to Touch

| File | Action |
|---|---|
| `packages/core/src/dsl/parseRhythm.ts` | Replace stub with implementation |
| `packages/core/tests/dsl/parseRhythm.test.ts` | Add any missing test cases (likely complete already) |

### Files NOT to Touch

- `packages/core/src/types/index.ts` — RhythmToken type is already defined correctly
- `packages/core/src/index.ts` — parseRhythm is already exported from barrel
- Any resolve/ files — out of scope

### Project Structure Notes

- Source: `packages/core/src/dsl/parseRhythm.ts`
- Tests: `packages/core/tests/dsl/parseRhythm.test.ts`
- Types: `packages/core/src/types/index.ts` (RhythmToken already defined)
- Barrel: `packages/core/src/index.ts` (parseRhythm already exported)
- Import pattern: `import type { RhythmToken } from '../types/index.js'` (ESM .js extension required)

### Previous Story Intelligence (2-1: Parse Figure DSL)

- Story 2-1 followed TDD: confirmed tests fail first, then implemented, then verified quality gates
- parseFigure uses trim/split/iterate pattern — follow the same approach
- Error messages include both the invalid token and its position index
- The test file was nearly complete from scaffolding — only rest token tests were missing. Check parseRhythm.test.ts for similar gaps.

### References

- [Source: .claude/DSL.md#Rhythm DSL] — Full rhythm grammar spec
- [Source: .claude/DECISIONS.md] — Tie/rest token design rationale
- [Source: _bmad-output/planning-artifacts/architecture.md#Type System] — RhythmToken flat boolean design
- [Source: _bmad-output/planning-artifacts/architecture.md#Error Handling] — Parsers throw policy
- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.2] — BDD acceptance criteria

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Implemented parseRhythm: trim/split/switch pattern, 14 tests all green
- No missing tests found — test suite was complete from scaffolding
- Error messages include token string and position index: `Invalid rhythm token "${token}" at position ${index}`
- Implementation: single `.map()` with switch statement over 5 valid tokens + default error case
- All 118 tests pass across full suite (zero regressions)

### File List

- `packages/core/src/dsl/parseRhythm.ts` — replaced stub with implementation
- `packages/core/tests/dsl/parseRhythm.test.ts` — added error message assertions, mid-sequence position test (code review fix, +1 test)
