# Story 1.2: Chord/Bass Degree Resolution

Status: done

## Story

As a developer,
I want to resolve figure degrees against chord tones,
so that bass and chord figures resolve to the correct chord tone pitches with modulo wrapping and ascending-from-root octave placement.

## Acceptance Criteria

1. **AC1 — Chord degree 1 resolves to root:** Given chord tones `["D","F","A","C"]` (Dm7) and degree 1, resolveChordDegree returns `"D4"`
2. **AC2 — Chord degree 2 resolves to third:** Given Dm7 and degree 2, returns `"F4"`
3. **AC3 — Chord degree 3 resolves to fifth:** Given Dm7 and degree 3, returns `"A4"`
4. **AC4 — Chord degree 4 resolves to seventh:** Given Dm7 and degree 4, returns `"C5"` (C is below D at same octave, so bumped up — ascending-from-root rule)
5. **AC5 — Degree overflow wraps modulo pool size:** Given 4 chord tones and degree 5, wraps to degree 1 in next octave (e.g. Dm7 degree 5 = `"D5"`)
6. **AC6 — Zero and negative degrees wrap:** Given degree 0 or negative values, wraps correctly and never throws (consistent with resolveScaleDegree)
7. **AC7 — Multiple chord contexts work:** resolveChordDegree produces correct results for Dm7, G7, and Cmaj7
8. **AC8 — Chord degree 2 differs from scale degree 2:** Over Dm7, chord degree 2 = `"F4"` (third), NOT `"E4"` (which is scale degree 2)
9. **AC9 — Throws on unrecognised chord:** Given an invalid chord name like `"Xblorp"`, throws an Error with descriptive message

## Tasks / Subtasks

- [x] Task 1: Fix existing test expectations for degree overflow (AC: #6)
  - [x] 1.1 Change "throws on degree less than 1" test: degree 0 should WRAP (degree 0 = degree 4 of previous octave for a 4-tone chord), not throw — consistent with resolveScaleDegree behavior from Story 1.1
  - [x] 1.2 Add test for negative degrees wrapping correctly
  - [x] 1.3 Keep "throws on unrecognised chord name" test — input validation at system boundary is acceptable
  - [x] 1.4 Run tests — confirm all fail for the right reason (stub throws "Not implemented")
- [x] Task 2: Add additional test cases (AC: #4, #5, #7)
  - [x] 2.1 Add test: Dm7 degree 4 = `"C5"` (seventh sits above root at same octave due to ascending-from-root)
  - [x] 2.2 Add test: G7 degree 3 = `"D5"` and degree 4 = `"F5"` (D and F above G at same octave)
  - [x] 2.3 Add test: Cmaj7 degree 3 = `"G4"` (fifth), degree 4 = `"B4"` (seventh)
  - [x] 2.4 Add test: degree 5 over Dm7 = `"D5"` (wraps to root, next octave)
  - [x] 2.5 Add test: degree 8 over Dm7 = `"C6"` (wraps twice — seventh, not root)
  - [x] 2.6 Add test: degree 0 wraps to last chord tone of previous octave
  - [x] 2.7 Add test: negative degree wraps correctly
  - [x] 2.8 Run tests — confirm all new tests fail for the right reason
- [x] Task 3: Implement resolveChordDegree (AC: #1-#9)
  - [x] 3.1 Use `Chord.get(chordName).notes` to get pitch classes
  - [x] 3.2 Validate: if chord notes array is empty, throw Error with descriptive message
  - [x] 3.3 Implement modulo wrapping: same `((degree - 1) % len + len) % len` pattern as resolveScaleDegree
  - [x] 3.4 Implement octave offset: `Math.floor((degree - 1) / len)`
  - [x] 3.5 Implement ascending-from-root adjustment: compare candidate MIDI to root MIDI, bump octave if below root (same pattern as resolveScaleDegree)
  - [x] 3.6 Return `pitchClass + String(finalOctave)`
  - [x] 3.7 Run tests — confirm green
  - [x] 3.8 Refactor if needed, keeping tests green
- [x] Task 4: Update stub docstring
  - [x] 4.1 Remove `@throws if degree is less than 1` from the docstring (resolvers never throw on degree values)
  - [x] 4.2 Add `@throws if chordName is not recognised by tonal`
- [x] Task 5: Verify quality gates
  - [x] 5.1 `pnpm typecheck` — zero new errors (pre-existing: strudel import, vitest.workspace)
  - [x] 5.2 `pnpm test` — all 22 resolveChordDegree tests pass, 65 total pass, no regressions
  - [x] 5.3 Coverage — resolveChordDegree fully covered by 22 tests

## Dev Notes

### Implementation Pattern — Follow resolveScaleDegree Exactly

The implementation is structurally identical to `resolveScaleDegree` (Story 1.1). The only difference is the pitch pool source:

| | resolveScaleDegree | resolveChordDegree |
|---|---|---|
| Pitch pool | `Scale.get(name).notes` (7 tones) | `Chord.get(name).notes` (3-4 tones) |
| Tonal import | `Scale` | `Chord` |
| Pool size | 7 (diatonic) | 3-4 (triad or 7th chord) |
| Wrapping | modulo 7 | modulo 3 or 4 |
| Ascending-from-root | same | same |

Reference the working implementation at `packages/core/src/resolve/resolveScaleDegree.ts` for the exact pattern.

### Existing Test Conflict (MUST FIX FIRST)

The existing `resolveChordDegree.test.ts` line 69-71 has:
```typescript
it("throws on degree less than 1", () => {
  expect(() => resolveChordDegree(0, "Dm7", 4)).toThrow()
})
```

This is **WRONG** per architecture: resolvers never throw on degree values. Degree 0 should **wrap** to the last chord tone in the previous octave, consistent with resolveScaleDegree from Story 1.1. Fix this test BEFORE implementing.

### Tonal Chord API

```typescript
import { Chord, Note } from 'tonal'

Chord.get('Dm7').notes  // ["D","F","A","C"]
Chord.get('G7').notes   // ["G","B","D","F"]
Chord.get('Cmaj7').notes // ["C","E","G","B"]
Chord.get('Xblorp').notes // [] (empty for invalid)
```

### Ascending-from-Root Rule

Chord tones that are chromatically below the root at the same octave number must be bumped up one octave. This ensures chord tones always ascend from the root:

```
Dm7 at octave 4:
  D4 (root) → D4
  F4 (third) → F4  (F4 > D4, no bump)
  A4 (fifth) → A4  (A4 > D4, no bump)
  C4 (seventh) → C5 (C4 < D4, bump to C5)
```

Use `Note.midi()` for comparison — same pattern as resolveScaleDegree.

### Voice Leading Is NOT Part of This Story

The "nearest-below voice leading" mentioned in the epic acceptance criteria for bass figures is a **resolvePhrase responsibility** (Story 3.1), not a resolveChordDegree responsibility. resolveChordDegree is a stateless pitch lookup — it maps `(degree, chordName, octave)` to a note name. It has no knowledge of previous notes or voice leading.

### Project Structure Notes

- Source: `packages/core/src/resolve/resolveChordDegree.ts` (modify existing stub)
- Tests: `packages/core/tests/resolve/resolveChordDegree.test.ts` (modify existing)
- Barrel: `packages/core/src/index.ts` — already exports `resolveChordDegree`, no changes needed
- Import pattern: `import { Chord, Note } from "tonal"` (named imports only)
- Test import: `import { resolveChordDegree } from "../../src/resolve/resolveChordDegree.js"` (already in place)

### Pre-Existing Quality Gate Issues (from Story 1.1)

These are known and do NOT need to be fixed in this story:
- ESLint config: project uses `.eslintrc.cjs` but ESLint 10 expects `eslint.config.js`
- Knip: `vitest.workspace.ts` `defineWorkspace` flagged as unused
- Sherif: missing `packageManager` field in root `package.json`

### References

- [Source: packages/core/src/resolve/resolveScaleDegree.ts — reference implementation pattern]
- [Source: _bmad-output/planning-artifacts/architecture.md — Error Handling: "Resolver never throws — always produces music"]
- [Source: _bmad-output/planning-artifacts/architecture.md — tonal API Usage: Chord.get()]
- [Source: _bmad-output/planning-artifacts/epics.md — Story 1.2 acceptance criteria]
- [Source: .claude/DOMAIN.md — Scale Degrees vs Chord Tones, Tonal.js API Reference]
- [Source: .claude/DECISIONS.md — FigureType determines pitch space]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Implemented resolveChordDegree using identical pattern to resolveScaleDegree: Chord.get().notes for pitch pool, modulo wrapping for degree overflow, ascending-from-root octave adjustment via Note.midi() comparison
- Fixed incorrect test expectation: degree 0 now wraps to C4 (seventh of Dm7, previous cycle) instead of throwing — consistent with resolver-never-throws architecture
- Added 8 new tests: Cmaj7 extended (degree 3, 4), degree overflow (5, 8, 9), zero/negative wrapping (0, -1, -3)
- Corrected story task 2.5: degree 8 over Dm7 = C6 (seventh wraps twice), not D6 (root) — math verified
- All 22 resolveChordDegree tests pass, 65 total tests pass across suite, no regressions
- Pre-existing quality gate issues unchanged from Story 1.1 (ESLint config, knip, sherif)
- Code review fixes: corrected misleading test description (degree 8 = seventh not root), added triad tests (Dm 3-tone pool), strengthened error assertions, added empty string edge case
- Final: 27 resolveChordDegree tests pass, 70 total tests pass across suite

### Change Log

- 2026-03-06: Story 1.2 implementation complete — resolveChordDegree implemented with full wrapping support
- 2026-03-06: Code review fixes — 3 medium + 2 low issues resolved (test description, triad coverage, error assertions)

### File List

- packages/core/src/resolve/resolveChordDegree.ts (modified — implemented from stub)
- packages/core/tests/resolve/resolveChordDegree.test.ts (modified — fixed throw expectation, added overflow/negative/extended/triad tests, strengthened error assertions)
