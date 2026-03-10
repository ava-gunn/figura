# Story 4.1: Strudel Mini-Notation Output

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a composer,
I want to convert a ResolvedFigure into Strudel mini-notation strings,
so that I can play resolved phrases through Strudel with correct notes, timing, and dynamics.

## Acceptance Criteria

1. **AC1 — Normal note encoding:** Given a ResolvedFigure with events `[{note: "D4", tie: false, duration: 1, velocity: 0.8}]`, when toMiniNotation is called, then notes contains `"D4"`, struct contains `"t"`, velocity contains `"0.8"`.

2. **AC2 — Tie encoding:** Given an event with `tie: true` followed by a tied position, when toMiniNotation is called, then the note name has `_` appended (e.g., `"D4_"`) and the tied position has `"f"` in struct.

3. **AC3 — Staccato encoding:** Given an event with `duration: 0.5` (staccato), when toMiniNotation is called, then the note name has `/2` appended (e.g., `"B4/2"`).

4. **AC4 — Rest encoding:** Given an event with `note: "~"` (rest), when toMiniNotation is called, then notes contains `"~"`, struct contains `"f"`, and velocity contains `"0"` at that position.

5. **AC5 — Accent encoding:** Given an event with `velocity: 1.0` (accent), when toMiniNotation is called, then velocity contains `"1"` at that position.

6. **AC6 — Reference phrase end-to-end:** Given the reference phrase ResolvedFigure (8 events over iim7 V7 IM7), when toMiniNotation is called, then it returns:
   - notes: `"D4 D4_ A4 B4/2 ~ G4 B3 B3_"`
   - struct: `"t f t t f t t f"`
   - velocity: `"0.8 0.8 0.8 0.8 0 1 0.8 0.8"`

7. **AC7 — AGPL isolation:** Given that @figura/strudel imports only from @figura/core, then it never imports Strudel runtime code.

8. **AC8 — StrudelOutput type exported:** Given @figura/strudel, when a developer imports it, then `toMiniNotation` and `StrudelOutput` are available as exports.

9. **AC9 — All existing tests pass (zero regressions):** All 161 existing tests across the monorepo continue to pass with no changes.

## Tasks / Subtasks

- [x] Task 1: Define StrudelOutput type and update exports (AC: #8)
  - [x] 1.1 Add `StrudelOutput` type to `packages/strudel/src/index.ts`: `{ notes: string; struct: string; velocity: string }`
  - [x] 1.2 Update `toMiniNotation` return type annotation to use `StrudelOutput`
  - [x] 1.3 Add `export type { StrudelOutput }` (re-export the type so consumers can import it)
  - [x] 1.4 Run `pnpm typecheck` — confirm no new errors

- [x] Task 2: Write failing tests for individual encoding rules (Red phase) (AC: #1, #2, #3, #4, #5)
  - [x] 2.1 Create `packages/strudel/tests/toMiniNotation.test.ts`
  - [x] 2.2 Write test: single normal note → notes `"D4"`, struct `"t"`, velocity `"0.8"` (AC: #1)
  - [x] 2.3 Write test: single rest event → notes `"~"`, struct `"f"`, velocity `"0"` (AC: #4)
  - [x] 2.4 Write test: single accent event → velocity `"1"` (AC: #5)
  - [x] 2.5 Write test: single staccato event → notes contains `/2`, struct `"t"` (AC: #3)
  - [x] 2.6 Write test: tie pair (note with tie:true + tied position) → first note has `_` appended, tied position struct is `"f"` (AC: #2)
  - [x] 2.7 Run tests — confirm all new tests fail (toMiniNotation throws "Not implemented")

- [x] Task 3: Implement toMiniNotation core logic (AC: #1, #2, #3, #4, #5)
  - [x] 3.1 Remove the `void figure` and `throw new Error("Not implemented")` lines
  - [x] 3.2 Iterate over `figure.events` array, building three parallel string arrays: `notesParts`, `structParts`, `velocityParts`
  - [x] 3.3 For each event, apply encoding rules in priority order:
    - Rest (`note === "~"`): notes `"~"`, struct `"f"`, velocity `"0"`
    - Tie (`tie === true`): notes `"{prevNote}_"`, struct `"f"`, velocity from event
    - Staccato (`duration === 0.5`): notes `"{note}/2"`, struct `"t"`, velocity from event
    - Normal: notes `"{note}"`, struct `"t"`, velocity from event
  - [x] 3.4 Velocity encoding: `velocity === 1` → `"1"`, `velocity === 0` → `"0"`, else `"0.8"`
  - [x] 3.5 Join each array with spaces and return `{ notes, struct, velocity }`
  - [x] 3.6 Run tests — confirm green

- [x] Task 4: Write and implement reference phrase test (AC: #6)
  - [x] 4.1 Write test: construct the 8-event ResolvedFigure matching the reference phrase resolution
  - [x] 4.2 Assert exact output: notes `"D4 D4_ A4 B4/2 ~ G4 B3 B3_"`, struct `"t f t t f t t f"`, velocity `"0.8 0.8 0.8 0.8 0 1 0.8 0.8"`
  - [x] 4.3 Run test — confirm green (should pass if individual encoding rules are correct)

- [x] Task 5: Write edge case tests
  - [x] 5.1 Write test: empty events array → returns `{ notes: "", struct: "", velocity: "" }`
  - [x] 5.2 Write test: single rest-only phrase → notes `"~"`, struct `"f"`, velocity `"0"`
  - [x] 5.3 Write test: multiple consecutive ties → each tied position gets `"f"` in struct
  - [x] 5.4 Write test: accent + staccato on same event (velocity 1.0, duration 0.5) → notes `"{note}/2"`, velocity `"1"`
  - [x] 5.5 Run tests — confirm green

- [x] Task 6: Verify AGPL isolation (AC: #7)
  - [x] 6.1 Confirm `packages/strudel/src/index.ts` imports ONLY from `@figura/core`
  - [x] 6.2 Confirm `packages/strudel/package.json` dependencies contain ONLY `@figura/core`
  - [x] 6.3 No new dependencies added

- [x] Task 7: Run full test suite and quality gates (AC: #9)
  - [x] 7.1 `pnpm vitest run` — all tests pass (171 total: 161 existing + 10 new)
  - [x] 7.2 `pnpm typecheck` — no new errors (pre-existing only)
  - [x] 7.3 `pnpm lint` — no new violations (pre-existing only)
  - [x] 7.4 `pnpm lint:unused` — no new unused exports (pre-existing only)
  - [x] 7.5 `pnpm test:coverage` — strudel package: 100% statements, branches, functions, lines

## Dev Notes

### Technical Requirements

**Encoding Rules (priority order within each event):**

| Condition | notes | struct | velocity |
|-----------|-------|--------|----------|
| `note === "~"` (rest) | `"~"` | `"f"` | `"0"` |
| `tie === true` | `"{prevNote}_"` | `"f"` | event velocity |
| `duration === 0.5` (staccato) | `"{note}/2"` | `"t"` | event velocity |
| normal | `"{note}"` | `"t"` | event velocity |

**Velocity encoding:**
- `velocity === 0` → `"0"` (rest)
- `velocity === 1` → `"1"` (accent)
- Otherwise → `"0.8"` (normal)

**Tie behavior — critical detail:**
A tied event sustains the *previous* note. The `note` field on a tied event contains the pitch that *would have* resolved (e.g., C4), but the output encodes the *previous* note with `_` appended (e.g., `"B3_"`). The resolver already handles this — `resolvePhrase` sets the tied event's `note` to the previous note's value when `tie: true`. So `toMiniNotation` simply reads `event.note` and appends `_`. No look-back logic needed in toMiniNotation.

**Struct semantics:**
- `"t"` = the note triggers (play, staccato, accent)
- `"f"` = no trigger (rest, tie). Ties sustain via the `_` suffix in notes; struct `"f"` tells Strudel not to retrigger.

**Empty events edge case:**
If `figure.events` is empty, return `{ notes: "", struct: "", velocity: "" }`. This is defensive — resolvePhrase always returns at least 1 event, but toMiniNotation should not crash on empty input.

### Architecture Compliance

**Package boundary — the hard line:**
- `@figura/strudel` imports ONLY from `@figura/core` (types only)
- `@figura/strudel` NEVER imports `tonal` directly
- `@figura/strudel` NEVER imports Strudel runtime code (AGPL isolation)
- `toMiniNotation` consumes `ResolvedFigure` and produces plain strings — no music theory logic, no pitch manipulation, pure string formatting

**StrudelOutput type — define in strudel package, not core:**
```typescript
// packages/strudel/src/index.ts
export type StrudelOutput = {
  notes: string
  struct: string
  velocity: string
}
```
This type lives in the strudel package because it's a Strudel-specific concern. Core defines `ResolvedFigure`; strudel defines `StrudelOutput`. [Source: architecture.md#Public API Surface]

**Function must be pure:**
- No side effects, no console.log, no mutation of input
- Synchronous — no async, no Promises
- Deterministic — same ResolvedFigure always produces same output
- Return a new object, never mutate the input figure

**Named export only:**
```typescript
export function toMiniNotation(figure: ResolvedFigure): StrudelOutput {
```
No default export. [Source: architecture.md#Naming Patterns]

### Library & Framework Requirements

- **No new dependencies.** toMiniNotation is pure string formatting — no libraries needed.
- **Import only `ResolvedFigure` type** from `@figura/core` (already in place).
- **Do NOT import `tonal`** — strudel package has no tonal dependency and must never add one.
- **Vitest 4.x** — test framework, already configured in strudel package via workspace.
- **TypeScript strict mode** — all the same strict settings as core apply (`strict`, `noImplicitReturns`, `noUncheckedIndexedAccess`).

### File Structure Requirements

**Files to create:**
| File | Purpose |
|---|---|
| `packages/strudel/tests/toMiniNotation.test.ts` | All tests for toMiniNotation |

**Files to modify:**
| File | Action |
|---|---|
| `packages/strudel/src/index.ts` | Add `StrudelOutput` type, implement `toMiniNotation`, update return type |

**Files NOT to touch:**
- `packages/core/src/**` — all core code is complete and out of scope
- `packages/core/tests/**` — core tests are out of scope
- `packages/strudel/package.json` — no dependency changes needed
- `packages/strudel/tsconfig.json` — already configured correctly

**Test file conventions:**
- Import from source file directly: `import { toMiniNotation } from '../src/index.js'`
- Import types from core if needed: `import type { ResolvedFigure, ResolvedEvent, FigureType } from '@figura/core'`
- ESM `.js` extension required in relative import paths
- Use `describe('toMiniNotation')` as the top-level block
- Use nested `describe` for categories: `describe('individual encodings')`, `describe('reference phrase')`, `describe('edge cases')`
- Use `it` with sentence-style descriptions

### Testing Requirements

**Test structure:**
```
describe('toMiniNotation')
  describe('individual encodings')
    it('encodes a normal note as plain note name')
    it('encodes a rest as ~ with f struct and 0 velocity')
    it('encodes an accent with velocity 1')
    it('encodes staccato as /2 appended to note name')
    it('encodes a tie as _ appended to note name with f struct')
  describe('reference phrase')
    it('produces correct output for the canonical 8-event phrase')
  describe('edge cases')
    it('returns empty strings for empty events array')
    it('handles consecutive ties')
    it('handles accent combined with staccato')
    it('handles single rest-only phrase')
```

**Helper factory for building test ResolvedEvents:**
```typescript
function event(overrides: Partial<ResolvedEvent> = {}): ResolvedEvent {
  return {
    note: "C4", degree: 1, anchor: false,
    duration: 1, velocity: 0.8, tie: false,
    ...overrides,
  }
}
```

**Reference phrase ResolvedFigure for AC6:**
Build this exact input — these are the 8 resolved events from the design session:
```typescript
const referenceEvents: ResolvedEvent[] = [
  { note: "D4",  degree: 1, anchor: true,  duration: 1,   velocity: 0.8, tie: false }, // pos 1: 1* play Dm7
  { note: "D4",  degree: 3, anchor: false, duration: 1,   velocity: 0.8, tie: true  }, // pos 2: 3 tie Dm7 (sustains D4)
  { note: "A4",  degree: 5, anchor: false, duration: 1,   velocity: 0.8, tie: false }, // pos 3: 5 play Dm7
  { note: "B4",  degree: 3, anchor: false, duration: 0.5, velocity: 0.8, tie: false }, // pos 4: 3 staccato G7
  { note: "~",   degree: 0, anchor: false, duration: 0,   velocity: 0,   tie: false }, // pos 5: 2* rest G7
  { note: "G4",  degree: 1, anchor: false, duration: 1,   velocity: 1.0, tie: false }, // pos 6: 1 accent G7
  { note: "B3",  degree: 7, anchor: false, duration: 1,   velocity: 0.8, tie: false }, // pos 7: 7- play Cmaj7
  { note: "B3",  degree: 1, anchor: true,  duration: 1,   velocity: 0.8, tie: true  }, // pos 8: 1* tie Cmaj7 (sustains B3)
]
const referenceFigure: ResolvedFigure = { type: "melody", events: referenceEvents }
```

**Critical test assertion — position 2 (tie):**
The event at position 2 has `tie: true` and `note: "D4"` (the resolver set note to the previous note D4, not the would-resolve F4). toMiniNotation reads `event.note` → `"D4"`, appends `_` → `"D4_"`. Struct is `"f"`.

**Critical test assertion — position 8 (tie):**
Same pattern: `tie: true`, `note: "B3"` (sustains from pos 7). Output: `"B3_"`, struct `"f"`.

## Previous Story Intelligence

**From Story 3-3 (Debug Mode) — most recent story:**

- resolvePhrase signature changed to: `(figure, rhythm | undefined, context, options: FigureType | ResolveOptions)`
- Tied events: the resolver sets `note` on the tied event to the *previous* note value (the note being sustained). This means toMiniNotation does NOT need look-back — just read `event.note` and append `_`.
- REST_EVENT constant in resolvePhrase: `{ note: "~", degree: 0, anchor: false, duration: 0, velocity: 0, tie: false }` — this is the shape of rest events toMiniNotation will receive.
- 161 tests across 7 test files at end of story 3-3. All must continue passing.
- Pre-existing quality gate issues (typecheck, lint, knip) are known — do not attempt to fix them; just ensure no NEW errors.
- TDD was strictly followed: tests written first, confirmed failing, then implementation.
- Code review found and fixed edge cases in previous stories — be thorough in test coverage.

**Key pattern from all previous stories:**
- Inline helpers are unexported, in the same file as the function using them
- Use existing test helper patterns (factory functions for building test data)
- Assert specific values, not just "no error" — musical correctness requires concrete assertions

## Git Intelligence

**Recent commits (last 5):**
```
294b202 feat: seventh sprint
e16b550 feat: sixth sprint
4f8067d feat: fifth sprint
acae863 feat: forth sprint
8daf90e feat: third sprint
```

**Patterns:**
- Sprint-level commits — each commit represents a full sprint of work
- All work on `main` branch, no feature branches
- Conventional commit format required
- This is the first story touching `packages/strudel/` — the test file is brand new

## Project Context Reference

**No project-context.md exists.** Use these canonical references instead:
- `.claude/ARCHITECTURE.md` — package structure, resolution rules, Strudel output format
- `.claude/DSL.md` — full DSL spec with reference phrase and expected Strudel output
- `.claude/DECISIONS.md` — tie encoding, staccato encoding, struct semantics
- `.claude/DOMAIN.md` — music theory concepts

### Anti-Patterns to Avoid

| Anti-Pattern | Correct Pattern |
|---|---|
| Importing `tonal` in strudel package | Import only `ResolvedFigure` type from `@figura/core` |
| Look-back logic to find previous note for ties | Read `event.note` directly — resolver already set it to the sustained note |
| `velocity.toFixed(1)` (floating point formatting) | Map to exact strings: `0` → `"0"`, `1` → `"1"`, else `"0.8"` |
| Importing Strudel runtime (`@strudel/core`, etc.) | String output only — AGPL isolation |
| Putting StrudelOutput type in `@figura/core` | Define in strudel package — it's a Strudel-specific concern |
| `export default function toMiniNotation` | `export function toMiniNotation` — named exports only |
| Mutating the input `figure.events` array | Build new arrays, return new object |
| Using `any` type anywhere | Full strict TypeScript — type everything explicitly |
| Test file importing from barrel (`@figura/strudel`) | Import from source: `import { toMiniNotation } from '../src/index.js'` |
| Creating a `utils/` directory in strudel | Keep everything in `src/index.ts` — single module, single file |

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.1] — BDD acceptance criteria
- [Source: _bmad-output/planning-artifacts/architecture.md#Core Architectural Decisions] — StrudelOutput type, package boundaries
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns] — naming, testing, anti-patterns
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure] — file locations, test organization
- [Source: _bmad-output/planning-artifacts/prd.md#Strudel Output] — FR20-FR25 requirements
- [Source: .claude/DSL.md#Full Example] — reference phrase with exact expected Strudel output
- [Source: .claude/DECISIONS.md#Ties encoded inline] — tie encoding rationale
- [Source: .claude/DECISIONS.md#Staccato encoded as /2] — staccato encoding rationale
- [Source: .claude/ARCHITECTURE.md#Strudel Output Format] — notes/struct/velocity format
- [Source: packages/strudel/src/index.ts] — current stub with docstring and signature
- [Source: _bmad-output/implementation-artifacts/3-3-debug-mode.md] — previous story learnings

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Defined `StrudelOutput` type in `packages/strudel/src/index.ts` and updated `toMiniNotation` return type to use it
- Implemented `toMiniNotation` as a pure string formatter: iterates events, applies encoding rules (rest → tie → staccato → normal), builds three parallel arrays, joins with spaces
- Velocity mapped to exact strings: `0` → `"0"`, `1` → `"1"`, else `"0.8"` (no floating point formatting)
- Tie encoding reads `event.note` directly and appends `_` — no look-back needed since resolver pre-fills sustained note
- 14 tests written: 5 individual encoding rules, 1 reference phrase (8 events), 8 edge cases (empty, rest-only, consecutive ties, accent+staccato combo, tie+staccato priority, rest+tie, non-melody figure type, StrudelOutput type shape)
- Reference phrase test validates exact expected output: `"D4 D4_ A4 B4/2 ~ G4 B3 B3_"` / `"t f t t f t t f"` / `"0.8 0.8 0.8 0.8 0 1 0.8 0.8"`
- AGPL isolation verified: only import is `type { ResolvedFigure }` from `@figura/core`, no tonal, no Strudel runtime
- 175 total tests pass (161 existing + 14 new), zero regressions
- Strudel package coverage: 100% across all metrics
- Pre-existing quality gate issues (typecheck, lint, knip) unchanged — no new errors

### Code Review Record

**Reviewer:** Claude Opus 4.6 (adversarial review)
**Date:** 2026-03-09
**Findings:** 0 HIGH, 2 MEDIUM, 4 LOW — all fixed automatically

| ID | Severity | Finding | Resolution |
|----|----------|---------|------------|
| M1 | MEDIUM | Missing test for tie+staccato priority ordering | Added test: "tie takes priority over staccato when both present" |
| M2 | MEDIUM | StrudelOutput type not import-verified in tests | Added `type StrudelOutput` import and shape assertion test |
| L1 | LOW | ARCHITECTURE.md velocity typo at position 5 (0.8 → 0) | Fixed in `.claude/ARCHITECTURE.md` |
| L2 | LOW | Redundant vel computation before rest branch | Restructured: vel computed only inside non-rest else branch |
| L3 | LOW | No test with non-melody figure type | Added test with `type: "bass"` figure |
| L4 | LOW | Missing test for rest+tie combination | Added test for `note: "~"` with `tie: true` |

### Change Log

- 2026-03-09: Implemented toMiniNotation (Story 4.1)
- 2026-03-09: Code review fixes — 4 new tests, vel restructure, ARCHITECTURE.md typo fix

### File List

- `packages/strudel/src/index.ts` — added `StrudelOutput` type, implemented `toMiniNotation` (was stub throwing "Not implemented")
- `packages/strudel/tests/toMiniNotation.test.ts` — created, 14 tests covering all encoding rules, reference phrase, and edge cases
- `.claude/ARCHITECTURE.md` — fixed velocity typo at position 5 (0.8 → 0)
