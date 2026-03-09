# Story 3.3: Debug Mode

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a composer,
I want to enable debug mode on resolvePhrase to see a per-position trace of how each note was resolved,
so that I can understand and troubleshoot unexpected resolution results.

## Acceptance Criteria

1. **AC1 — Debug boolean logs to console:** Given `debug: true` in ResolveOptions passed to resolvePhrase, when resolvePhrase is called, then it logs per-position trace output to the console including: figure token, rhythm token, active harmony, pitch pool, and resolved note.

2. **AC2 — Debug callback captures traces:** Given `debug: (trace) => traces.push(trace)` as a callback in ResolveOptions, when resolvePhrase is called, then it invokes the callback for each position with a PositionTrace object.

3. **AC3 — PositionTrace structure:** Given a PositionTrace object emitted by debug mode, then it contains: `position` (number), `figureToken` (FigureToken), `rhythmToken` (RhythmToken), `harmony` (HarmonyContext), `pitchPool` (string[]), and `resolvedNote` (string | null).

4. **AC4 — Debug with rests:** Given a position that resolves to a rest (rhythm rest or figure rest), when debug mode is active, then the PositionTrace has `resolvedNote: null` for that position.

5. **AC5 — Default rhythm in debug mode:** Given no rhythm DSL is provided (rhythm parameter is omitted or undefined), when debug mode is active, then resolvePhrase assumes default play tokens (8th note durations) for all positions matching figure length.

6. **AC6 — ResolveOptions replaces type parameter:** Given the 4th parameter to resolvePhrase is a ResolveOptions object `{ type: "melody", debug: true }`, when resolvePhrase is called, then it uses `options.type` as the figure type and enables debug mode.

7. **AC7 — Backward compatibility:** Given the 4th parameter is a plain FigureType string (e.g., `"melody"`), when resolvePhrase is called, then it works exactly as before with no debug output (existing API unchanged).

8. **AC8 — Debug with LCM cycling:** Given debug mode is active and figure/rhythm lengths differ (LCM cycling), when resolvePhrase is called, then a PositionTrace is emitted for every position in the LCM-expanded output.

9. **AC9 — All existing tests pass (zero regressions):** All 150 existing resolvePhrase tests continue to pass with no changes to expected outputs.

## Tasks / Subtasks

- [x] Task 1: Write failing tests for debug callback (Red phase) (AC: #2, #3, #4, #6, #7)
  - [x] 1.1 Open `packages/core/tests/resolve/resolvePhrase.test.ts`
  - [x] 1.2 Add `describe('debug mode')` block
  - [x] 1.3 Write test: passing `ResolveOptions` with `debug` callback collects PositionTrace for each position (AC: #2, #3)
  - [x] 1.4 Write test: PositionTrace contains correct fields — position, figureToken, rhythmToken, harmony, pitchPool, resolvedNote (AC: #3)
  - [x] 1.5 Write test: rest positions emit `resolvedNote: null` in trace (AC: #4)
  - [x] 1.6 Write test: passing `{ type: "melody", debug: callback }` works as ResolveOptions (AC: #6)
  - [x] 1.7 Write test: passing plain `"melody"` string still works (backward compat) (AC: #7)
  - [x] 1.8 Run tests — confirm new tests fail, existing 150 tests still pass

- [x] Task 2: Implement ResolveOptions parameter handling (AC: #6, #7)
  - [x] 2.1 Change `resolvePhrase` 4th parameter type from `type: FigureType` to `options: FigureType | ResolveOptions`
  - [x] 2.2 At function start, normalize: `const type = typeof options === "string" ? options : options.type`
  - [x] 2.3 Extract debug setting: `const debug = typeof options === "string" ? undefined : options.debug`
  - [x] 2.4 Import `ResolveOptions` and `PositionTrace` types from `../types/index.js`
  - [x] 2.5 Run tests — confirm existing tests pass (backward compat), new ResolveOptions tests pass

- [x] Task 3: Implement debug trace emission (AC: #1, #2, #3, #4)
  - [x] 3.1 Create helper: `function emitTrace(debug, position, figureToken, rhythmToken, harmony, pitchPool, resolvedNote)`
  - [x] 3.2 If `debug` is a function, call it with a `PositionTrace` object
  - [x] 3.3 If `debug === true`, `console.log` a formatted trace string
  - [x] 3.4 Insert `emitTrace` call in the main loop after each position resolves (after rest, tie, figure-rest, and normal pitch branches)
  - [x] 3.5 For rest positions (rhythm rest or figure rest), emit `resolvedNote: null`
  - [x] 3.6 For tie positions, emit `resolvedNote` as the sustained note string
  - [x] 3.7 For normal positions, emit `resolvedNote` as the resolved note string
  - [x] 3.8 Run tests — confirm debug callback tests pass

- [x] Task 4: Write and implement console logging test (AC: #1)
  - [x] 4.1 Write test: `debug: true` calls `console.log` for each position (spy on console.log)
  - [x] 4.2 Verify console.log output includes position, pitch pool, and resolved note
  - [x] 4.3 Run tests — confirm green

- [x] Task 5: Write and implement default rhythm test (AC: #5)
  - [x] 5.1 Write test: when rhythm is undefined/omitted, resolvePhrase generates default play tokens matching figure length
  - [x] 5.2 Change rhythm parameter type to `rhythm: RhythmToken[] | undefined`
  - [x] 5.3 If rhythm is undefined, generate default: `Array.from({ length: figure.length }, () => playToken)` where playToken is `{ play: true, tie: false, staccato: false, accent: false }`
  - [x] 5.4 Run tests — confirm green

- [x] Task 6: Write and implement LCM cycling debug test (AC: #8)
  - [x] 6.1 Write test: debug callback with mismatched figure/rhythm lengths emits traces for all LCM positions
  - [x] 6.2 Verify trace count equals LCM of figure and rhythm lengths
  - [x] 6.3 Run tests — confirm green

- [x] Task 7: Run full test suite and iterate (AC: #9)
  - [x] 7.1 `pnpm vitest run packages/core/tests/resolve/resolvePhrase.test.ts`
  - [x] 7.2 Fix failures one by one, re-running after each fix
  - [x] 7.3 Confirm all existing tests still pass (zero regressions)

- [x] Task 8: Refactor if needed
  - [x] 8.1 Review emitTrace helper for clarity
  - [x] 8.2 Review parameter normalization for simplicity
  - [x] 8.3 Run tests — confirm still green

- [x] Task 9: Verify quality gates
  - [x] 9.1 `pnpm typecheck` — no new errors (pre-existing strudel/vitest.workspace errors only)
  - [x] 9.2 `pnpm lint` — no new violations (pre-existing ESLint config issue only)
  - [x] 9.3 `pnpm test` — all 161 tests pass (150 existing + 11 new)
  - [x] 9.4 `pnpm lint:unused` — no new unused exports (pre-existing knip config issue only)

## Dev Notes

### Key Change: Parameter Signature

**Current signature** at `resolvePhrase.ts:175`:
```typescript
export function resolvePhrase(
  figure: FigureToken[],
  rhythm: RhythmToken[],
  context: HarmonyContext | HarmonyContext[],
  type: FigureType,
): ResolvedFigure {
```

**Change to:**
```typescript
export function resolvePhrase(
  figure: FigureToken[],
  rhythm: RhythmToken[] | undefined,
  context: HarmonyContext | HarmonyContext[],
  options: FigureType | ResolveOptions,
): ResolvedFigure {
```

**Normalization at function start (before any existing logic):**
```typescript
const type: FigureType = typeof options === "string" ? options : options.type
const debug = typeof options === "string" ? undefined : options.debug
```

**Default rhythm generation (after normalization, before length calc):**
```typescript
const DEFAULT_PLAY: RhythmToken = { play: true, tie: false, staccato: false, accent: false }
const effectiveRhythm = rhythm ?? Array.from({ length: figure.length }, () => ({ ...DEFAULT_PLAY }))
```
Then replace all `rhythm` references in the function body with `effectiveRhythm`.

### Key Change: Debug Trace Emission

**Add an inline helper (unexported, inside resolvePhrase.ts):**
```typescript
function emitTrace(
  debug: boolean | ((trace: PositionTrace) => void) | undefined,
  trace: PositionTrace,
): void {
  if (debug === undefined) return
  if (typeof debug === "function") {
    debug(trace)
  } else {
    console.log(
      `[${String(trace.position)}] ${trace.resolvedNote ?? "~"} | pool: [${trace.pitchPool.join(",")}] | chord: ${trace.harmony.chord}`
    )
  }
}
```

**Insert in main loop — after each branch resolves a position, before `continue`:**
```typescript
const trace: PositionTrace = {
  position: i,
  figureToken: fig,
  rhythmToken: rhy,
  harmony: harm,
  pitchPool: pool,
  resolvedNote: /* null for rests, note string for pitched/tied */,
}
emitTrace(debug, trace)
```

**Four insertion points in the main loop:**
1. After rhythm rest branch (line ~202): `resolvedNote: null`
2. After tie branch (line ~228): `resolvedNote: previousNote ?? null`
3. After figure rest branch (line ~234): `resolvedNote: null`
4. After normal pitch resolution (line ~251): `resolvedNote: resolvedNote`

### Architecture Compliance

**Types already exist — do NOT create or modify:**
- `PositionTrace` — already defined in `packages/core/src/types/index.ts:94-101`
- `ResolveOptions` — already defined in `packages/core/src/types/index.ts:107-110`
- Both are already exported from the barrel `packages/core/src/index.ts`

**ResolveOptions type (already correct):**
```typescript
type ResolveOptions = {
  type: FigureType
  debug?: boolean | ((trace: PositionTrace) => void)
}
```

**Import additions needed in resolvePhrase.ts:**
```typescript
import type {
  FigureType,
  FigureToken,
  RhythmToken,
  HarmonyContext,
  ResolvedEvent,
  ResolvedFigure,
  ResolveOptions,   // ADD
  PositionTrace,    // ADD
} from "../types/index.js"
```

### Console.log Format

When `debug: true`, log a human-readable line per position. Keep it concise — composers will read this in a terminal:
```
[0] D4 | pool: [D,E,F,G,A,B,C] | chord: Dm7
[1] D4 (tie) | pool: [D,E,F,G,A,B,C] | chord: Dm7
[4] ~ (rest) | pool: [G,A,B,C,D,E,F] | chord: G7
```

### Default Rhythm (FR28)

FR28 says "Debug mode can assume 8th notes when no rhythm DSL is provided." This means:
- The `rhythm` parameter becomes optional (`RhythmToken[] | undefined`)
- When undefined, generate default play tokens: `{ play: true, tie: false, staccato: false, accent: false }` for each figure position
- "8th notes" refers to the assumed subdivision — each position = one 8th note. This is a labeling/documentation concern, not a RhythmToken field change
- Output length when rhythm is undefined: `figure.length` (no LCM needed since effective rhythm length = figure length)

### Library & Framework Requirements

- **tonal ^6.0.0** — sole runtime dependency; already in use. No new dependencies needed for this story.
- **No new libraries required.** Debug mode is pure instrumentation — `console.log` for boolean mode, callback invocation for function mode.
- **Vitest 4.x** — use `vi.spyOn(console, "log")` to test `debug: true` mode. Restore spy after each test with `vi.restoreAllMocks()`.
- **TypeScript strict mode** — the union type `FigureType | ResolveOptions` requires proper narrowing. Use `typeof options === "string"` as the discriminant (FigureType is a string literal union, ResolveOptions is an object).

### Files to Touch

| File | Action |
|---|---|
| `packages/core/src/resolve/resolvePhrase.ts` | Change 4th param type, make rhythm optional, add debug trace emission, add emitTrace helper |
| `packages/core/tests/resolve/resolvePhrase.test.ts` | Add `describe('debug mode')` block with all debug tests |

### Files NOT to Touch

- `packages/core/src/types/index.ts` — `PositionTrace` and `ResolveOptions` already defined correctly
- `packages/core/src/index.ts` — barrel already exports `ResolveOptions` and `PositionTrace`
- `packages/core/src/resolve/resolveScaleDegree.ts` — out of scope
- `packages/core/src/resolve/resolveChordDegree.ts` — out of scope
- `packages/core/src/resolve/expandProgression.ts` — out of scope
- `packages/core/src/dsl/*.ts` — out of scope
- `packages/strudel/` — out of scope

### Project Structure Notes

- Source: `packages/core/src/resolve/resolvePhrase.ts`
- Tests: `packages/core/tests/resolve/resolvePhrase.test.ts`
- Import pattern: `import type { ... } from '../types/index.js'` (ESM .js extension required)
- Import tonal: `import { Note } from 'tonal'` (named imports only)
- Test imports: import from source file directly, not from barrel
- Helpers (`emitTrace`) are unexported, inline in resolvePhrase.ts — no `utils/` directory [Source: architecture.md#Module Organization]

### Testing Standards

- Use `describe('debug mode')` as the new top-level block inside the existing `describe('resolvePhrase')` wrapper
- Use `it` with sentence-style descriptions
- For callback tests: collect traces in an array, assert length and field values
- For console.log tests: `vi.spyOn(console, "log")`, assert call count and argument contents
- For backward compat: ensure existing test patterns (passing `"melody"` as 4th arg) still work unchanged
- Use existing helpers: `degree()`, `playToken()`, `restRhythm()`, `dm7Context()`, etc. — all already defined in the test file
- Assert specific values in PositionTrace: check `pitchPool` against known scale, check `resolvedNote` against expected pitch

### Anti-Patterns to Avoid

| Anti-Pattern | Correct Pattern |
|---|---|
| Creating a separate `debug.ts` module | Inline `emitTrace` helper in resolvePhrase.ts, unexported |
| Adding `debug` field to `ResolvedEvent` | Debug traces are emitted via callback/console, not stored in output |
| Modifying `PositionTrace` or `ResolveOptions` types | Types are already correct in `types/index.ts` — use as-is |
| Making resolvePhrase async for debug | All functions remain synchronous — debug callback is sync too |
| Using `any` for the options parameter type | Use `FigureType \| ResolveOptions` union with `typeof` narrowing |
| Breaking existing callers by removing `type` param | Union type `FigureType \| ResolveOptions` preserves backward compat |
| `console.log(JSON.stringify(trace))` | Format a human-readable string with position, note, pool, chord |
| Creating DEFAULT_PLAY as module-level mutable | Spread or factory each time: `() => ({ ...DEFAULT_PLAY })` to avoid shared mutation |

## Previous Story Intelligence

**From Story 3-2 (LCM Cycling & Anchor-on-Rest):**

- `resolvePhrase` current signature: `(figure: FigureToken[], rhythm: RhythmToken[], context: HarmonyContext | HarmonyContext[], type: FigureType): ResolvedFigure`
- Added inline helpers `gcd`, `lcm`, `buildAnchorShifts` — all unexported, all in resolvePhrase.ts. Follow this same pattern for `emitTrace`.
- The main loop has 4 branches in order: (1) rhythm rest, (2) tie, (3) figure rest, (4) normal pitch. Debug trace emission needs to be inserted in all 4 branches.
- `REST_EVENT` constant at line 156 — spread `{ ...REST_EVENT }` for rest positions. Do NOT add debug fields to REST_EVENT.
- `previousMidi` and `previousNote` track voice leading state. Tie branch updates `previousMidi` (theoretical advancement) but keeps `previousNote` (sustained pitch). For debug trace on ties, `resolvedNote` should be `previousNote` (the sustained note the listener hears).
- 150 tests across 7 test files at end of 3-2. All must continue to pass.
- Pre-existing quality gate issues (typecheck, lint, knip) are known — do not attempt to fix them; just ensure no NEW errors.
- Code review in 3-2 added 2 edge-case tests and expanded AC6 test. Follow same thoroughness for debug mode tests.
- TDD was strictly followed in 3-2: tests written first, confirmed failing, then implementation added. Follow the same pattern.

**Key learnings from 3-2:**
- The `buildAnchorShifts` pre-scan runs before the main loop. Debug trace emission runs inside the main loop — no conflict.
- `anchorPositions.has(i)` determines anchor status per position — this is already computed. The debug trace should report the *shifted* anchor status (from `anchorPositions`), not the original figure anchor.
- When testing, use existing helpers (`degree()`, `playToken()`, `dm7Context()`, etc.) — they're already defined at the top of the test file.

## Git Intelligence

**Recent commits (last 5):**
```
e16b550 feat: sixth sprint
4f8067d feat: fifth sprint
acae863 feat: forth sprint
8daf90e feat: third sprint
5251577 feat: second sprint
```

**Patterns observed:**
- Sprint-level commits — each commit represents a full sprint of work
- The commit for this story should follow conventional commit format: `feat(core): add debug mode to resolvePhrase` or similar
- All work is on `main` branch — no feature branches in use
- No CI/CD pipeline detected — quality gates are local (pre-commit hooks)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.3] — BDD acceptance criteria for debug mode
- [Source: _bmad-output/planning-artifacts/architecture.md#Debug Mode] — ResolveOptions design with boolean/callback pattern
- [Source: _bmad-output/planning-artifacts/architecture.md#Public API Surface] — ResolveOptions and PositionTrace in public exports
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns] — Anti-patterns, naming, test conventions
- [Source: .claude/DECISIONS.md] — Architectural decisions (anchor-on-rest, LCM cycling, etc.)
- [Source: .claude/DSL.md#Full Example] — Reference phrase with expected resolution
- [Source: packages/core/src/types/index.ts:94-110] — PositionTrace and ResolveOptions type definitions (already exist)
- [Source: packages/core/src/resolve/resolvePhrase.ts] — Current implementation (255 lines, 4 main-loop branches)
- [Source: packages/core/tests/resolve/resolvePhrase.test.ts] — Existing test suite (150 tests across repo, ~30 in this file)
- [Source: _bmad-output/implementation-artifacts/3-2-lcm-cycling-anchor-on-rest.md] — Previous story learnings, patterns, and completion notes

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Changed `resolvePhrase` 4th parameter from `type: FigureType` to `options: FigureType | ResolveOptions` with `typeof` narrowing for backward compatibility
- Made `rhythm` parameter optional (`RhythmToken[] | undefined`); when undefined, generates default play tokens matching figure length (FR28)
- Added inline `emitTrace` helper (unexported) that dispatches to callback function or `console.log` based on debug option type
- Inserted `emitTrace` calls in all 4 main-loop branches: rhythm rest, tie, figure rest, and normal pitch resolution
- Rest positions (rhythm rest and figure rest) emit `resolvedNote: null`; tie positions emit `previousNote` (the sustained note); normal positions emit the resolved note string
- 9 new tests added in `describe('debug mode')` block: callback capture, PositionTrace structure, rest handling (rhythm + figure), ResolveOptions acceptance, backward compatibility, console.log spy, default rhythm, LCM cycling traces
- Code review: fixed `debug: false` bug (was triggering console.log), added 2 tests (debug:false silence, tie trace), added tie/rest annotations to console.log format. 161 tests pass.
- All 161 tests pass across 7 test files (150 existing + 11 new), zero regressions
- Pre-existing quality gate issues (typecheck, lint, knip) unchanged — no new errors introduced
- Types `PositionTrace` and `ResolveOptions` were already defined in `types/index.ts` and exported from barrel — no type changes needed

### Change Log

- 2026-03-09: Implemented debug mode for resolvePhrase (Story 3.3)

### File List

- `packages/core/src/resolve/resolvePhrase.ts` — changed 4th param to `FigureType | ResolveOptions`, made rhythm optional, added `emitTrace` helper, inserted trace calls in all 4 main-loop branches
- `packages/core/tests/resolve/resolvePhrase.test.ts` — added 9 tests in `describe('debug mode')` block covering callback, console.log, rests, backward compat, default rhythm, LCM cycling
