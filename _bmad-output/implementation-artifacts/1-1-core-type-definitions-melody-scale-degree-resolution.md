# Story 1.1: Core Type Definitions & Melody Scale Degree Resolution

Status: ready-for-dev

## Story

As a developer,
I want to define the core type system and resolve melody figure degrees against a diatonic scale,
so that I have the foundational types and can look up the correct pitch class for any scale degree in any key/chord context.

## Acceptance Criteria

1. **AC1 — Scale degree 1 resolves to root:** Given scale `["D","E","F","G","A","B","C"]` (D dorian) and degree 1, resolveScaleDegree returns `"D"` (with octave: `"D4"`)
2. **AC2 — Scale degree 3 resolves correctly:** Given the same scale and degree 3, returns `"F"` (`"F4"`)
3. **AC3 — Degree overflow wraps modulo pool size:** Given a 7-tone scale and degree 8, wraps to degree 1 in the next octave (e.g. degree 8 on D dorian at octave 4 = `"D5"`)
4. **AC4 — Zero and negative degrees wrap:** Given degree 0 or negative values, wraps correctly and never throws an error
5. **AC5 — All core types match architecture spec:** FigureToken is a discriminated union (`rest: true` | `rest: false` with degree/anchor/octaveDown), HarmonyContext includes `scale: string[]` and `chordTones: string[]`, ResolvedEvent uses `note: string` (with `"~"` for rests, not `null`), ResolvedFigure contains only `type` and `events` (no Strudel fields)
6. **AC6 — Missing types defined:** `Progression`, `ResolveOptions`, and `PositionTrace` types exist and match architecture spec
7. **AC7 — Multiple scale contexts work:** resolveScaleDegree produces correct results for D dorian, G mixolydian, and C major (ionian)

## Tasks / Subtasks

- [ ] Task 1: Align type definitions with architecture (AC: #5, #6)
  - [ ] 1.1 Write failing tests that import and use the discriminated union FigureToken (rest variant)
  - [ ] 1.2 Refactor `FigureToken` to discriminated union: `{ rest: false; degree: number; anchor: boolean; octaveDown: boolean } | { rest: true }`
  - [ ] 1.3 Update `HarmonyContext`: change `scale: string` to `scale: string[]`, add `chordTones: string[]`
  - [ ] 1.4 Update `ResolvedEvent`: change `note: string | null` to `note: string` (use `"~"` for rests), change degree to `0` for rests
  - [ ] 1.5 Update `ResolvedFigure`: remove `notes?`, `struct?`, `velocity?` fields (Strudel strings belong in `StrudelOutput`)
  - [ ] 1.6 Add `Progression` type: `{ key: string; chords: { roman: string; duration: number }[] }`
  - [ ] 1.7 Add `ResolveOptions` type: `{ type: FigureType; debug?: boolean | ((trace: PositionTrace) => void) }`
  - [ ] 1.8 Add `PositionTrace` type with all fields per architecture
  - [ ] 1.9 Update barrel exports in `index.ts` for new/changed types
  - [ ] 1.10 Evaluate whether `RomanChord` should remain — it is NOT in the architecture's public API; remove if unused
  - [ ] 1.11 Run typecheck to verify all type changes compile
- [ ] Task 2: Fix existing test expectations for degree overflow (AC: #3, #4)
  - [ ] 2.1 Change `resolveScaleDegree.test.ts` error cases: degree 8 should WRAP to degree 1 next octave, not throw
  - [ ] 2.2 Change degree 0 test: should wrap correctly (degree 0 = degree 7 in previous octave), not throw
  - [ ] 2.3 Add tests for negative degrees (e.g., degree -1 wraps)
  - [ ] 2.4 Keep the "unrecognised scale name" throw test — parsers/validators can throw, but clarify this is input validation
- [ ] Task 3: Implement resolveScaleDegree (AC: #1, #2, #3, #4, #7)
  - [ ] 3.1 Confirm all tests fail for the right reason (stub throws "Not implemented")
  - [ ] 3.2 Implement: use `Scale.get(scaleName).notes` to get pitch classes
  - [ ] 3.3 Implement: convert 1-based degree to 0-based index with modulo wrapping
  - [ ] 3.4 Implement: calculate octave offset for wrapped degrees
  - [ ] 3.5 Implement: construct note name as `pitchClass + octave` using tonal (NOT string concat)
  - [ ] 3.6 Run tests — confirm green
  - [ ] 3.7 Refactor if needed, keeping tests green
- [ ] Task 4: Verify quality gates pass
  - [ ] 4.1 `pnpm lint`
  - [ ] 4.2 `pnpm typecheck`
  - [ ] 4.3 `pnpm lint:unused` (knip)
  - [ ] 4.4 `pnpm lint:mono` (sherif)

## Dev Notes

### Critical Type Alignment Issues (MUST FIX)

The existing `types/index.ts` has several deviations from the architecture spec. These MUST be corrected in this story:

| Current | Architecture Spec | Action |
|---|---|---|
| `FigureToken` is a flat object | Discriminated union with rest variant | Refactor to `{ rest: false; ... } \| { rest: true }` |
| `ResolvedEvent.note: string \| null` | `note: string` with `"~"` for rests | Change to string, use `"~"` for rests |
| `ResolvedFigure` has `notes?`, `struct?`, `velocity?` | Only `type` and `events` | Remove Strudel fields |
| `HarmonyContext.scale: string` | `scale: string[]` (pitch class array) | Change to `string[]` |
| `HarmonyContext` missing `chordTones` | Has `chordTones: string[]` | Add field |
| Missing `Progression` type | Defined in architecture | Add |
| Missing `ResolveOptions` type | Defined in architecture | Add |
| Missing `PositionTrace` type | Defined in architecture | Add |
| `RomanChord` type exists | Not in architecture public API | Evaluate removal |

### Existing Test Conflict (MUST FIX)

The existing `resolveScaleDegree.test.ts` has **incorrect expectations** for degree overflow:

- **Line 61:** `expect(() => resolveScaleDegree(0, "D dorian", 4)).toThrow()` — WRONG. Architecture says resolvers never throw. Degree 0 should WRAP.
- **Line 64:** `expect(() => resolveScaleDegree(8, "D dorian", 4)).toThrow()` — WRONG. Story AC says degree 8 wraps to degree 1 in next octave.
- **Line 67:** Throwing on unrecognised scale name is ACCEPTABLE — this is input validation at the system boundary (tonal returns empty for invalid scales).

Fix these tests BEFORE implementing. The resolver philosophy is: **always resolve, never error** (except for truly invalid input like a non-existent scale).

### resolveScaleDegree Implementation Pattern

```typescript
import { Scale } from 'tonal'

export function resolveScaleDegree(degree: number, scaleName: string, octave = 4): string {
  const scale = Scale.get(scaleName)
  if (!scale.notes.length) throw new Error(`Unrecognised scale: "${scaleName}"`)

  const len = scale.notes.length // 7 for diatonic
  // Wrap degree to 0-based index, handling 0, negatives, and overflow
  const zeroIndex = ((degree - 1) % len + len) % len
  const octaveOffset = Math.floor((degree - 1) / len)

  const pitchClass = scale.notes[zeroIndex]!
  const finalOctave = octave + octaveOffset
  // Return using tonal — do NOT string-concat pitchClass + octave
  return pitchClass + String(finalOctave)
}
```

**Important:** This is a reference sketch, not copy-paste code. The dev agent must follow TDD — write/fix failing tests first, then implement.

### Tonal API Usage

- `Scale.get('D dorian').notes` returns `["D","E","F","G","A","B","C"]` (pitch classes, no octave)
- `Scale.get('X blorp').notes` returns `[]` (empty for invalid scales)
- Named imports only: `import { Scale } from 'tonal'`
- Never use `Note.get()` to construct note names by string concatenation — but for resolveScaleDegree, appending octave to a pitch class is acceptable since tonal doesn't provide a "pitchClass + octave → note name" utility

### Impact on Other Files

Changing `FigureToken` to a discriminated union will break existing parser tests/stubs in `parseFigure.ts` — specifically anywhere that creates `FigureToken` objects without the `rest` discriminant. The parseFigure tests and stub must be updated to include `rest: false` on degree tokens and `rest: true` on rest tokens. This is expected — those files are stubs anyway.

Similarly, changing `HarmonyContext` will affect any test that constructs one. Since resolveScaleDegree tests don't use HarmonyContext directly, this should not block the resolver work.

### Ripple Effects Checklist

- [ ] `parseFigure.ts` and its tests — FigureToken shape changed (add `rest: false`/`rest: true`)
- [ ] `parseRhythm.ts` — RhythmToken unchanged, no impact
- [ ] `resolveChordDegree.ts` tests — may reference HarmonyContext, check
- [ ] `resolvePhrase.ts` stub — ResolvedFigure/ResolvedEvent shape changed
- [ ] `index.ts` barrel — add new type exports, remove RomanChord if dropped
- [ ] `@harmonics/strudel` — verify it doesn't reference removed ResolvedFigure fields

### Project Structure Notes

- Types: `packages/core/src/types/index.ts`
- Resolver: `packages/core/src/resolve/resolveScaleDegree.ts`
- Tests: `packages/core/tests/resolve/resolveScaleDegree.test.ts`
- Barrel: `packages/core/src/index.ts`
- All imports use `.js` extension (ESM requirement)
- Test imports from source directly, not from barrel

### References

- [Source: .claude/ARCHITECTURE.md — Type System, Resolution Output, HarmonyContext sections]
- [Source: _bmad-output/planning-artifacts/architecture.md — Core Architectural Decisions > Type System, Error Handling]
- [Source: _bmad-output/planning-artifacts/epics.md — Story 1.1 acceptance criteria]
- [Source: .claude/DOMAIN.md — Scale Degrees vs Chord Tones, Tonal.js API Reference]
- [Source: .claude/DECISIONS.md — FigureType determines pitch space]
- [Source: _bmad-output/planning-artifacts/architecture.md — Implementation Patterns > Error Handling, tonal API Usage]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### Change Log

### File List
