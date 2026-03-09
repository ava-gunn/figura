# Story 3.2: LCM Cycling & Anchor-on-Rest

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a composer,
I want figure and rhythm arrays to cycle independently when their lengths differ, and anchors that land on rests to shift to the nearest played note,
so that I can create polyrhythmic patterns and trust that structural importance is preserved even with rests.

## Acceptance Criteria

1. **AC1 — LCM cycling (3×4):** Given a figure with 3 tokens and a rhythm with 4 tokens and a single HarmonyContext, when resolvePhrase is called, then the output has 12 events (LCM of 3 and 4), with both arrays cycling via modulo.

2. **AC2 — Equal lengths (no cycling):** Given a figure with 4 tokens and a rhythm with 4 tokens, when resolvePhrase is called, then the output has 4 events (no cycling needed).

3. **AC3 — LCM cycling (2×3):** Given a figure with 2 tokens and a rhythm with 3 tokens, when resolvePhrase is called, then the output has 6 events (LCM of 2 and 3).

4. **AC4 — Harmony array overrides LCM:** Given a figure with 3 tokens, a rhythm with 4 tokens, and a HarmonyContext[] of length 8, when resolvePhrase is called, then the output has 8 events (harmony determines length, figure and rhythm still cycle with modulo).

5. **AC5 — Anchor-on-rest shifts forward:** Given figure `[1*, 3, 5]` and rhythm `[rest, play, play]` where the anchor at position 0 aligns with a rest, when resolvePhrase is called, then: position 0 is a rest event with `anchor: false`, and position 1 has `anchor: true` (nearest non-rest played note receives the anchor flag).

6. **AC6 — Anchor-on-rest with cycling:** Given figure `[1*, 3, 5]` and rhythm `[rest, play, play, play]` (LCM = 12) where the first anchor at position 0 aligns with a rest, when resolvePhrase is called, then position 0 is a rest, position 1 gets `anchor: true`, and the figure continues to cycle correctly through all 12 positions.

7. **AC7 — Anchor not on rest unchanged:** Given figure `[1*, 3, 5]` and rhythm `[play, play, play]` where the anchor is NOT on a rest, when resolvePhrase is called, then position 0 has `anchor: true` as normal (no shifting needed).

8. **AC8 — Musical correctness of cycled phrases:** Given figure `[1*, 3]` (melody) and rhythm `[play, play, play]` with a single Dm7 context, when resolvePhrase is called, then the output has 6 events (LCM 2,3), cycling produces degrees `[1,3,1,3,1,3]` with correct pitch resolution and voice leading across all 6 positions.

9. **AC9 — All existing tests pass (zero regressions):** All existing resolvePhrase tests continue to pass with no changes to expected outputs.

## Tasks / Subtasks

- [x] Task 1: Write failing tests (Red phase) (AC: #1-#8)
  - [x] 1.1 Open `packages/core/tests/resolve/resolvePhrase.test.ts`
  - [x] 1.2 Add `describe('LCM cycling')` block
  - [x] 1.3 Write test: figure 3 + rhythm 4 → 12 events with correct cycling (AC: #1)
  - [x] 1.4 Write test: figure 4 + rhythm 4 → 4 events, no cycling (AC: #2)
  - [x] 1.5 Write test: figure 2 + rhythm 3 → 6 events (AC: #3)
  - [x] 1.6 Write test: harmony array overrides LCM — 8 events despite mismatched figure/rhythm (AC: #4)
  - [x] 1.7 Add `describe('anchor-on-rest')` block
  - [x] 1.8 Write test: anchor at rest position shifts to nearest played note (AC: #5)
  - [x] 1.9 Write test: anchor-on-rest with LCM cycling works correctly (AC: #6)
  - [x] 1.10 Write test: anchor not on rest is unchanged (AC: #7)
  - [x] 1.11 Write test: musical correctness of cycled phrase (AC: #8)
  - [x] 1.12 Run tests — confirm new tests fail, existing tests still pass

- [x] Task 2: Implement LCM cycling (AC: #1-#4, #8)
  - [x] 2.1 Add `gcd` and `lcm` helper functions (unexported, inline in resolvePhrase.ts)
  - [x] 2.2 Change length calculation for single-context branch from `Math.max(figure.length, rhythm.length)` to `lcm(figure.length, rhythm.length)`
  - [x] 2.3 Keep array-context branch unchanged (`contexts.length` determines output length)
  - [x] 2.4 Run tests — confirm LCM tests pass, existing tests still pass

- [x] Task 3: Implement anchor-on-rest (AC: #5-#7)
  - [x] 3.1 Before the main loop, scan figure for anchor positions
  - [x] 3.2 For each anchor, check if its rhythm at that position (using `i % rhythm.length`) is a rest
  - [x] 3.3 If anchor aligns with rest, find the nearest non-rest played position (search forward first, then backward)
  - [x] 3.4 Build a Set of positions that should receive the shifted `anchor: true` flag
  - [x] 3.5 During the main loop, use the shifted anchor set to set `anchor: true/false` on events
  - [x] 3.6 Run tests — confirm anchor-on-rest tests pass

- [x] Task 4: Run full test suite and iterate (AC: #9)
  - [x] 4.1 `pnpm vitest run packages/core/tests/resolve/resolvePhrase.test.ts`
  - [x] 4.2 Fix failures one by one, re-running after each fix
  - [x] 4.3 Confirm all existing tests still pass (zero regressions)

- [x] Task 5: Refactor if needed
  - [x] 5.1 Review gcd/lcm helpers for clarity
  - [x] 5.2 Review anchor-on-rest scanning for simplicity
  - [x] 5.3 Run tests — confirm still green

- [x] Task 6: Verify quality gates
  - [x] 6.1 `pnpm typecheck` — no new errors (pre-existing strudel/vitest.workspace errors only)
  - [x] 6.2 `pnpm lint` — no new violations (pre-existing ESLint config issue only)
  - [x] 6.3 `pnpm test` — all 148 tests pass (existing + new)
  - [x] 6.4 `pnpm lint:unused` — no new unused exports (pre-existing knip config issue only)

## Dev Notes

### Key Change: LCM Cycling

**Current code** at `resolvePhrase.ts:121`:
```typescript
const length = contexts ? contexts.length : Math.max(figure.length, rhythm.length)
```

**Change to:**
```typescript
const length = contexts ? contexts.length : lcm(figure.length, rhythm.length)
```

Add inline helpers (unexported, at top of file):
```typescript
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

function lcm(a: number, b: number): number {
  return (a / gcd(a, b)) * b
}
```

**When contexts is an array:** The harmony array determines output length. Figure and rhythm cycle with modulo (already implemented via `figure[i % figure.length]` and `rhythm[i % rhythm.length]`). No change needed.

**When context is a single HarmonyContext:** Output length = LCM(figure.length, rhythm.length). This is the only change — figure and rhythm modulo cycling already works.

### Key Change: Anchor-on-Rest

**Architecture rule:** "If the anchor figure token aligns with a rest rhythm token, the rest is honoured and the anchor's importance shifts to the nearest non-rest played note." [Source: .claude/DECISIONS.md#Anchor on a rest: rest wins]

**Implementation approach — pre-scan before main loop:**

1. Find all anchor positions in the figure array (positions where `!fig.rest && fig.anchor`)
2. For each anchor at figure index `fi`, check the rhythm at `fi % rhythm.length`
3. If rhythm is a rest (`!rhy.play && !rhy.tie`), search for nearest non-rest played position:
   - Search forward first: `fi + 1, fi + 2, ...` (within output length)
   - If not found forward, search backward: `fi - 1, fi - 2, ...`
   - The figure token at the shifted position does NOT need to already be an anchor
4. Build a `Set<number>` of positions that should have `anchor: true`
5. In the main loop, set `anchor` based on this Set instead of `fig.anchor`

**IMPORTANT:** The anchor scan must account for cycling. If figure `[1*, 3, 5]` cycles over 12 positions, position 0 has the anchor, but also positions 3, 6, 9 have degree 1 (which is `anchor: true` in the original figure). Each cycling occurrence needs independent rest-checking.

**IMPORTANT:** The current behavior where the first pitched note (previousMidi === null) gets octave 4 already handles the case where an anchor is at position 0 with a rest — position 1 will naturally be the first pitched note and get octave 4. No change needed for octave placement logic.

### Voice Leading With LCM Cycling

When figure cycles, the voice leading chain (`previousMidi`) continues through the cycling. Position 3 voice-leads from position 2, even though position 3 maps to `figure[0]` again. This is correct — the voice leading chain is per-position, not per-figure-token.

### Harmony Context With LCM Cycling

When using a single HarmonyContext with LCM cycling, the same harmony applies to ALL positions. This is the expected behavior — a single chord over a polyrhythmic pattern.

When using HarmonyContext[], the harmony array length determines output length (NOT LCM). The caller (typically via `expandProgression`) controls how many positions there are.

### Files to Touch

| File | Action |
|---|---|
| `packages/core/src/resolve/resolvePhrase.ts` | Add gcd/lcm helpers, change length calc, add anchor-on-rest pre-scan |
| `packages/core/tests/resolve/resolvePhrase.test.ts` | Add LCM cycling and anchor-on-rest test blocks |

### Files NOT to Touch

- `packages/core/src/types/index.ts` — No type changes needed
- `packages/core/src/index.ts` — No export changes
- `packages/core/src/resolve/resolveScaleDegree.ts` — Out of scope
- `packages/core/src/resolve/resolveChordDegree.ts` — Out of scope
- `packages/core/src/resolve/expandProgression.ts` — Out of scope
- `packages/core/src/dsl/*.ts` — Out of scope
- `packages/strudel/` — Out of scope

### Project Structure Notes

- Source: `packages/core/src/resolve/resolvePhrase.ts`
- Tests: `packages/core/tests/resolve/resolvePhrase.test.ts`
- Import pattern: `import type { ... } from '../types/index.js'` (ESM .js extension required)
- Import tonal: `import { Note } from 'tonal'` (named imports only)
- Test imports: import from source file directly, not from barrel
- Helpers (`gcd`, `lcm`) are unexported, inline in resolvePhrase.ts — no `utils/` directory [Source: architecture.md#Module Organization]

### Testing Standards

- Use `describe` blocks: `describe('LCM cycling')`, `describe('anchor-on-rest')`
- Use `it` with sentence-style descriptions
- Assert specific values: event counts, pitch values, anchor flags
- Use existing helpers: `degree()`, `playToken()`, `restRhythm()`, `dm7Context()`, etc.
- Reference: existing test file has all needed helpers already defined

### Anti-Patterns to Avoid

| Anti-Pattern | Correct Pattern |
|---|---|
| Creating a `utils/math.ts` for gcd/lcm | Inline unexported helpers in resolvePhrase.ts |
| Modifying HarmonyContext type | Single HarmonyContext just applies to all LCM positions |
| Two-pass resolution for anchor | Pre-scan anchor positions, single-pass resolution |
| `async function gcd(...)` | Synchronous — all functions are sync |
| Mutating the input figure/rhythm arrays | Build a separate anchor Set, leave inputs untouched |

### References

- [Source: .claude/DECISIONS.md#Figure/rhythm length mismatch: cycle to LCM] — LCM cycling decision
- [Source: .claude/DECISIONS.md#Anchor on a rest: rest wins] — Anchor-on-rest semantics
- [Source: .claude/DSL.md#Zipping Figure + Rhythm] — "If lengths differ, they cycle" with LCM example
- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.2] — BDD acceptance criteria
- [Source: _bmad-output/planning-artifacts/architecture.md#Error Handling] — Resolvers never throw
- [Source: _bmad-output/planning-artifacts/architecture.md#Module Organization] — No utils/ directory
- [Source: packages/core/src/resolve/resolvePhrase.ts] — Current implementation (line 121: length calc to change)
- [Source: packages/core/tests/resolve/resolvePhrase.test.ts] — Existing test suite (18 tests, all must pass)

## Previous Story Intelligence

**From Story 3-1 (Core Phrase Resolution):**

- `resolvePhrase` signature: `(figure: FigureToken[], rhythm: RhythmToken[], context: HarmonyContext | HarmonyContext[], type: FigureType): ResolvedFigure`
- Single-pass left-to-right: each position resolves based on current figure/rhythm/harmony + previousMidi for voice leading
- Tie voice leading: the theoretical pitch advances the voice leading chain even though the output sustains the previous note — prevents octave drift after tied positions
- `placeNearestOctave` helper: tries 3 candidate octaves (ref-1, ref, ref+1), picks nearest by MIDI distance. "nearest-below" constrains to at or below reference.
- `resolveDegree` helper: handles first-note octave 4 placement, voice leading, octaveDown modifier, degree overflow wrapping
- REST_EVENT constant: `{ note: "~", degree: 0, anchor: false, duration: 0, velocity: 0, tie: false }` — use spread `{ ...REST_EVENT }` to avoid mutation
- 18 existing tests in 6 describe blocks — all must continue to pass
- Total test count across repo at end of 3-1: 140 tests across 7 test files
- Pre-existing quality gate issues (typecheck, lint, knip) are known — do not attempt to fix them; just ensure no NEW errors

**Key pattern from 3-1:** TDD was strictly followed. Tests were written first, confirmed failing, then implementation added. Follow the same pattern.

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Implemented LCM cycling: added inline `gcd`/`lcm` helpers (unexported), changed single-context output length from `Math.max` to `lcm` of figure and rhythm lengths
- Implemented anchor-on-rest: added `buildAnchorShifts` function that pre-scans figure/rhythm arrays, builds a `Set<number>` of positions that should receive `anchor: true`
- Replaced `fig.anchor` usage in main loop with `anchorPositions.has(i)` — anchor flags are now centrally managed by the pre-scan
- Updated reference phrase test AC12: position 5 now correctly has `anchor: true` because the anchor at position 4 (`2*`) aligned with a rest rhythm and shifted forward to position 5
- 8 new tests added (5 LCM cycling + 3 anchor-on-rest), all 148 tests pass across 7 test files, zero regressions
- AC9 note: reference phrase test (AC12) position 5 anchor changed from `false` to `true` — this is a correct behavioral change caused by anchor-on-rest (the anchor at position 4 shifts forward), not a regression
- Pre-existing quality gate issues (typecheck, lint, knip) unchanged — no new errors introduced
- Code review: added 2 edge-case tests (backward anchor shift, all-rest anchor drop), expanded AC6 test to verify all 12 positions, removed stale comment. 150 tests pass.

### Change Log

- 2026-03-09: Implemented LCM cycling and anchor-on-rest (Story 3.2)

### File List

- `packages/core/src/resolve/resolvePhrase.ts` — added gcd/lcm/buildAnchorShifts helpers, updated resolvePhrase to use LCM length and anchor pre-scan
- `packages/core/tests/resolve/resolvePhrase.test.ts` — added 10 tests (LCM cycling + anchor-on-rest + edge cases), updated reference phrase anchor assertion
