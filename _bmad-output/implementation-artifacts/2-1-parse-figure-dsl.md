# Story 2.1: Parse Figure DSL

Status: done

## Story

As a composer,
I want to write a figure as a space-separated string like `"1* 3 5 3 2* 1 7- 1*"`,
so that I can express melodic shapes concisely and get back typed tokens for the resolution pipeline.

## Acceptance Criteria

1. **AC1 — Basic degrees:** Given `"1 3 5"`, parseFigure returns 3 FigureToken objects with degrees 1, 3, 5 and rest: false, anchor: false, octaveDown: false
2. **AC2 — Anchor modifier:** Given `"1*"`, returns a token with degree 1, anchor: true, octaveDown: false
3. **AC3 — Octave down modifier:** Given `"7-"`, returns a token with degree 7, anchor: false, octaveDown: true
4. **AC4 — Combined modifiers (order-independent):** Given `"1*-"` or `"1-*"`, both return identical tokens with anchor: true, octaveDown: true
5. **AC5 — Rest token:** Given `"~"`, returns a token with rest: true
6. **AC6 — Error on invalid input:** Given `"x"`, `"8"`, `"0"`, or `""`, throws an Error with a descriptive message including the invalid token and position
7. **AC7 — Reference phrase:** Given `"1* 3 5 3 2* 1 7- 1*"`, returns 8 correctly typed FigureToken objects matching the design reference
8. **AC8 — Whitespace tolerance:** Extra leading, trailing, and inter-token whitespace is handled gracefully

## Tasks / Subtasks

- [x] Task 1: Confirm existing tests fail (Red phase) (AC: #1-#8)
  - [x] 1.1 Run `pnpm vitest run packages/core/tests/dsl/parseFigure.test.ts` — confirm all 15 tests fail with "Not implemented" (5 error tests pass since stub throws)
  - [x] 1.2 Review each test case to understand expected behavior before implementing

- [x] Task 2: Add missing rest token test (AC: #5)
  - [x] 2.1 The existing test file has NO test for the `~` rest token — added a `describe("rest token")` block
  - [x] 2.2 Assert `parseFigure("~")` returns `[{ rest: true }]`
  - [x] 2.3 Assert `parseFigure("1 ~ 3")` returns 3 tokens where index 1 has `{ rest: true }`
  - [x] 2.4 Run test — confirmed it fails

- [x] Task 3: Implement parseFigure (AC: #1-#8)
  - [x] 3.1 Open `packages/core/src/dsl/parseFigure.ts`
  - [x] 3.2 Trim and split input on whitespace (`input.trim().split(/\s+/)`)
  - [x] 3.3 Throw if the resulting array is empty or input is blank
  - [x] 3.4 For each raw token string, parse:
    - If token is `"~"` -> return `{ rest: true }`
    - Otherwise: extract the degree digit (must be 1-7), then scan remaining characters for `*` (anchor) and `-` (octaveDown)
    - Throw if degree is not 1-7
    - Throw if any unrecognised character remains after degree + modifiers
    - Return `{ rest: false, degree, anchor, octaveDown }`
  - [x] 3.5 Return the array of parsed FigureTokens
  - [x] 3.6 Run tests — confirmed all 22 green

- [x] Task 4: Verify error messages are descriptive (AC: #6)
  - [x] 4.1 Ensure thrown errors include the invalid token string and its position index
  - [x] 4.2 Format: `'Invalid figure token "x" at position 3'` — implemented

- [x] Task 5: Refactor if needed
  - [x] 5.1 Review implementation for clarity and simplicity — clean, no refactoring needed
  - [x] 5.2 Run tests — confirmed still green

- [x] Task 6: Verify quality gates
  - [x] 6.1 `pnpm typecheck` — pre-existing errors only (strudel package resolution, vitest workspace type); no new errors introduced
  - [x] 6.2 `pnpm test` — all 22 parseFigure tests pass, no regressions in other test files (108 pass across all suites)
  - [x] 6.3 Coverage — parseFigure fully covered (all branches: basic degrees, anchor, octaveDown, combined, rest, errors, whitespace)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Implemented parseFigure: trim/split/map pattern, 22 tests all green
- Added 2 missing rest token tests (single rest, mixed phrase with rest)
- Error messages include token string and position index: `Invalid figure token "${token}" at position ${index}`
- Implementation: single `.map()` over split tokens — degree extraction + modifier scanning loop
- Pre-existing typecheck errors (strudel/vitest) confirmed unrelated to this story

### File List

- `packages/core/src/dsl/parseFigure.ts` — replaced stub with implementation; added duplicate modifier rejection (code review fix)
- `packages/core/tests/dsl/parseFigure.test.ts` — added rest token describe block (2 tests); added error message assertions, duplicate modifier tests, mid-sequence position test (code review fix, +3 tests)
