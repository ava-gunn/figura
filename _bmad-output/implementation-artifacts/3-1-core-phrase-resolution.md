# Story 3.1: Core Phrase Resolution

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a composer,
I want to resolve a complete phrase by combining figure tokens, rhythm tokens, and a harmonic context,
so that I get back a ResolvedFigure with concrete pitched events that preserve melodic contour and respect rhythm articulations.

## Acceptance Criteria

1. **AC1 — Basic melody resolution:** Given figure tokens `[1, 3, 5]`, rhythm tokens `[play, play, play]`, and HarmonyContext for Dm7 in key C, when resolvePhrase is called with type "melody", then it returns a ResolvedFigure with 3 events containing correct pitches (D4, F4, A4) resolved against the diatonic scale.

2. **AC2 — Rest wins (rhythm precedence):** Given a rhythm token with `play: false` (rest) at any position, when resolvePhrase is called, then that event has `note: "~"`, `degree: 0`, `duration: 0`, `velocity: 0`, `tie: false`.

3. **AC3 — Tie sustains previous pitch:** Given a rhythm token with `tie: true` at position N, when resolvePhrase is called, then position N-1 has `tie: true` and position N sustains the previous pitch (note = previous note, `tie: false` on the tied position itself). The tied position has `struct: f` semantics (no retrigger).

4. **AC4 — Staccato halves duration:** Given a rhythm token with `staccato: true`, when resolvePhrase is called, then the event has `duration: 0.5`.

5. **AC5 — Accent raises velocity:** Given a rhythm token with `accent: true`, when resolvePhrase is called, then the event has `velocity: 1.0`.

6. **AC6 — Contour preservation across chord changes:** Given the same figure `[1, 3, 5]` over Dm7 then G7, when resolvePhrase is called, then the ascending contour is preserved across both chords even though pitch classes differ. Direction (ascending/descending) and relative magnitude are maintained.

7. **AC7 — Melody voice leading (nearest-overall):** Given figure type "melody", when resolvePhrase resolves consecutive notes, then octave placement uses nearest-overall voice leading (minimize interval motion).

8. **AC8 — Bass/chord voice leading (nearest-below):** Given figure type "bass" or "chord", when resolvePhrase resolves consecutive notes, then octave placement uses nearest-below voice leading (chord tones indexed, octave selected nearest below previous note).

9. **AC9 — First anchor at octave 4:** Given no previous note context, when resolvePhrase resolves the first anchor (or first note if no anchor), then it places it at octave 4.

10. **AC10 — Octave-down modifier:** Given a figure token with `octaveDown: true`, when resolvePhrase resolves it, then the resulting pitch is dropped one octave from where it would otherwise be placed.

11. **AC11 — Normal event defaults:** A normally played event (play: true, no staccato, no accent) has `duration: 1` and `velocity: 0.8`.

12. **AC12 — Reference phrase end-to-end:** Given the reference phrase figure `"1* 3 5 3 2* 1 7- 1*"` with rhythm `"1 _ 1 . ~ ! 1 _"` over progression `iim7(3) V7(3) IM7(2)` in key C with 8 positions, when resolvePhrase is called with type "melody", then the events match:
    - Pos 0: D4, degree 1, anchor true, duration 1, velocity 0.8, tie true
    - Pos 1: D4, degree 3, anchor false, duration 1, velocity 0.8, tie false (tied position — sustains D4)
    - Pos 2: A4, degree 5, anchor false, duration 1, velocity 0.8, tie false
    - Pos 3: B4, degree 3, anchor false, duration 0.5, velocity 0.8, tie false (staccato, chord changed to G7)
    - Pos 4: ~, degree 0, anchor false, duration 0, velocity 0, tie false (rest wins over anchor)
    - Pos 5: G4, degree 1, anchor false, duration 1, velocity 1.0, tie false (accent)
    - Pos 6: B3, degree 7, anchor false, duration 1, velocity 0.8, tie true (octave down)
    - Pos 7: B3, degree 1, anchor true, duration 1, velocity 0.8, tie false (tied position — sustains B3, not C4)

## Tasks / Subtasks

- [x] Task 1: Write failing tests (Red phase) (AC: #1-#12)
  - [x] 1.1 Create `packages/core/tests/resolve/resolvePhrase.test.ts`
  - [x] 1.2 Write test: basic melody resolution — 3 degrees over Dm7 → correct pitches (AC: #1)
  - [x] 1.3 Write test: rest rhythm token produces rest event (AC: #2)
  - [x] 1.4 Write test: tie sets `tie: true` on preceding event, sustains pitch (AC: #3)
  - [x] 1.5 Write test: staccato produces `duration: 0.5` (AC: #4)
  - [x] 1.6 Write test: accent produces `velocity: 1.0` (AC: #5)
  - [x] 1.7 Write test: contour preserved across chord changes (AC: #6)
  - [x] 1.8 Write test: melody voice leading nearest-overall (AC: #7)
  - [x] 1.9 Write test: bass/chord voice leading nearest-below (AC: #8)
  - [x] 1.10 Write test: first anchor at octave 4 (AC: #9)
  - [x] 1.11 Write test: octaveDown modifier drops pitch one octave (AC: #10)
  - [x] 1.12 Write test: normal event defaults (duration 1, velocity 0.8) (AC: #11)
  - [x] 1.13 Write test: reference phrase full resolution (AC: #12)
  - [x] 1.14 Run tests — confirm all fail with "Not implemented"

- [x] Task 2: Implement resolvePhrase — anchor resolution (AC: #1, #9)
  - [x] 2.1 Open `packages/core/src/resolve/resolvePhrase.ts`
  - [x] 2.2 Find the first anchor token in figure array (or first non-rest token if no anchor)
  - [x] 2.3 Resolve anchor to pitch at octave 4 using appropriate resolver (melody → resolveScaleDegree, bass/chord → resolveChordDegree)
  - [x] 2.4 Store as `previousNote` for voice leading chain

- [x] Task 3: Implement single-pass left-to-right resolution (AC: #1, #6, #7, #8)
  - [x] 3.1 Iterate positions left to right
  - [x] 3.2 For each position, resolve degree against harmony context using figure type
  - [x] 3.3 Apply voice leading: melody = nearest-overall, bass/chord = nearest-below
  - [x] 3.4 Choose octave placement that minimizes interval from previousNote
  - [x] 3.5 Update previousNote after each resolved pitch

- [x] Task 4: Implement rhythm application (AC: #2, #3, #4, #5, #11)
  - [x] 4.1 For each position, apply rhythm token to determine duration, velocity, tie
  - [x] 4.2 Rest: note="~", degree=0, duration=0, velocity=0, tie=false
  - [x] 4.3 Tie: set `tie: true` on the PREVIOUS event, current position sustains previous pitch
  - [x] 4.4 Staccato: duration=0.5
  - [x] 4.5 Accent: velocity=1.0
  - [x] 4.6 Normal: duration=1, velocity=0.8

- [x] Task 5: Implement octaveDown modifier (AC: #10)
  - [x] 5.1 After resolving pitch, if figureToken.octaveDown is true, subtract 1 from octave

- [x] Task 6: Run tests and iterate (AC: #1-#12)
  - [x] 6.1 Run `pnpm vitest run packages/core/tests/resolve/resolvePhrase.test.ts`
  - [x] 6.2 Fix failures one by one, re-running after each fix
  - [x] 6.3 Confirm reference phrase test passes (AC: #12 is the integration gate)

- [x] Task 7: Refactor if needed
  - [x] 7.1 Review implementation for clarity and simplicity
  - [x] 7.2 Ensure function signature matches existing stub (no breaking changes)
  - [x] 7.3 Run tests — confirm still green

- [x] Task 8: Verify quality gates
  - [x] 8.1 `pnpm typecheck` — pre-existing errors only, no new errors
  - [x] 8.2 `pnpm lint` — pre-existing config issue only, no new violations
  - [x] 8.3 `pnpm test` — all 137 tests pass (zero regressions across all packages)
  - [x] 8.4 `pnpm lint:unused` — pre-existing vitest.workspace.ts error only

## Dev Notes

### Architecture & Resolution Algorithm

**Single-pass left-to-right resolution.** No two-pass, no look-ahead. Each position resolves based only on: the current figure token, the current rhythm token, the current harmony context, and the previous resolved note (for voice leading).

**Resolution pipeline per position:**
1. Get figure token at `position % figureLength` and rhythm token at `position % rhythmLength`
2. Get harmony context at `position` (one HarmonyContext per output position — expandProgression handles expansion)
3. If rhythm is rest → emit rest event, skip pitch resolution
4. If rhythm is tie → emit tied event (sustain previous pitch), set `tie: true` on previous event
5. If figure is rest → emit rest event
6. Resolve degree to pitch class using figure type:
   - `"melody"` → `resolveScaleDegree(degree, scaleName, octave)`
   - `"chord"` or `"bass"` → `resolveChordDegree(degree, chordName, octave)`
7. Apply voice leading to choose octave:
   - `"melody"` → nearest-overall (closest octave to previousNote)
   - `"bass"` / `"chord"` → nearest-below (closest octave below previousNote)
8. Apply octaveDown modifier if present (subtract 1 from octave)
9. Apply rhythm articulations (duration, velocity)
10. Store resolved note as previousNote for next iteration

### Voice Leading Implementation

**Nearest-overall (melody):** For each candidate octave (previous octave -1, 0, +1), compute MIDI distance from previousNote. Choose the octave with the smallest absolute distance.

**Nearest-below (bass/chord):** Same as nearest-overall but constrained to choose an octave at or below the previous note's octave. If all candidates are above, choose the lowest available.

**Implementation approach:** Use `Note.midi()` from tonal to compute distances. Resolve the pitch class first, then try multiple octaves, select best by distance.

### Function Signature

The existing stub signature is:
```typescript
resolvePhrase(
  figure:  FigureToken[],
  rhythm:  RhythmToken[],
  context: HarmonyContext,
  type:    FigureType,
): ResolvedFigure
```

**IMPORTANT:** The current signature takes a single `HarmonyContext`. For Story 3.1, this means ONE chord context for the entire phrase. The reference phrase test (AC: #12) needs MULTIPLE harmony contexts (one per position) — this requires either:
- Changing the signature to accept `HarmonyContext[]` (breaking change to stub)
- Or providing a single HarmonyContext and testing chord changes via a different mechanism

**Recommendation:** Change the signature to accept `HarmonyContext | HarmonyContext[]`. If a single context, apply it to all positions. If an array, index by position. This matches the architecture doc: "events[i] resolves against harmonies[i]". The epics doc says "one HarmonyContext per output position".

**Note:** The `ResolveOptions` type exists with `type` and `debug` fields. Story 3.1 does NOT implement debug mode (that's Story 3.3). The function signature should use positional args for now; ResolveOptions integration comes in 3.3.

### Tie Semantics (Critical Detail)

From the reference phrase (DSL.md):
- Position 0: figure `1*`, rhythm `1` (play) → D4, tie: true (because position 1 is a tie)
- Position 1: figure `3`, rhythm `_` (tie) → D4 (sustains position 0's pitch, NOT F4)
- The TIE rhythm token means "sustain the previous note" — the figure degree at the tied position is IGNORED
- `tie: true` is set on the event BEFORE the tie, not on the tied position itself

Similarly at positions 6-7:
- Position 6: figure `7-`, rhythm `1` (play) → B3, tie: true
- Position 7: figure `1*`, rhythm `_` (tie) → B3 (sustains B3, NOT C4)

### Anchor Resolution Strategy

1. Scan figure array for first token with `anchor: true`
2. If no anchor, use the first non-rest token
3. Resolve the anchor at octave 4 (the default starting octave)
4. This becomes the initial `previousNote` for the voice leading chain
5. If the anchor position has a rest rhythm, the rest wins — anchor importance shifts to the nearest non-rest played note (Story 3.2 handles the full anchor-on-rest logic, but basic rest-wins behavior is needed here)

### Existing Resolver APIs

The existing resolvers take `(degree, scaleName/chordName, octave)` and return absolute note strings:
```typescript
resolveScaleDegree(degree: number, scaleName: string, octave?: number): string
resolveChordDegree(degree: number, chordName: string, octave?: number): string
```

**Scale name format:** `"D dorian"`, `"G mixolydian"`, `"C ionian"` — constructed as `"${rootPitchClass} ${modeName}"`.

**IMPORTANT:** These resolvers take a scale/chord NAME (string), not the HarmonyContext fields directly. You need to construct the scale name from HarmonyContext. The `scale` field on HarmonyContext is `string[]` (pitch class array), NOT a scale name string. You need to determine the scale name. Options:
- Use `expandProgression` which gives you chord name and you can derive scale name
- Or add a `scaleName` field to HarmonyContext (not in the type definition currently)
- **Simplest approach:** Use the pitch class arrays directly instead of calling resolveScaleDegree/resolveChordDegree. The resolvers internally just do `Scale.get(name).notes` to get the same array. Resolve in-place: index into `context.scale` (melody) or `context.chordTones` (chord/bass) using the degree, handle wrapping and octave placement yourself.

This avoids needing a scale name string and leverages the already-resolved arrays in HarmonyContext.

### Pitch Resolution Without Resolver Functions

Since HarmonyContext already has `scale: string[]` and `chordTones: string[]`, you can resolve degrees directly:

```typescript
const pool = type === "melody" ? context.scale : context.chordTones
const len = pool.length
const zeroIndex = ((((degree - 1) % len) + len) % len)
const octaveOffset = Math.floor((degree - 1) / len)
const pitchClass = pool[zeroIndex]!
```

Then apply voice leading to choose the concrete octave. Use `Note.midi()` to compare distances.

### Files to Touch

| File | Action |
|---|---|
| `packages/core/src/resolve/resolvePhrase.ts` | Replace stub with implementation |
| `packages/core/tests/resolve/resolvePhrase.test.ts` | Create — full test suite |

### Files NOT to Touch

- `packages/core/src/types/index.ts` — All types are already defined correctly
- `packages/core/src/index.ts` — resolvePhrase is already exported
- `packages/core/src/resolve/resolveScaleDegree.ts` — No changes needed
- `packages/core/src/resolve/resolveChordDegree.ts` — No changes needed
- `packages/core/src/resolve/expandProgression.ts` — No changes needed
- `packages/core/src/dsl/*.ts` — Out of scope
- `packages/strudel/` — Out of scope

### Project Structure Notes

- Source: `packages/core/src/resolve/resolvePhrase.ts`
- Tests: `packages/core/tests/resolve/resolvePhrase.test.ts`
- Import pattern: `import type { ... } from '../types/index.js'` (ESM .js extension required)
- Import tonal: `import { Note } from 'tonal'` (named imports only)
- Test imports: import from source file directly, not from barrel

### Previous Story Intelligence

**From Story 2-2 (Parse Rhythm DSL):**
- TDD was followed strictly: confirmed tests fail first, then implemented
- Tests were nearly complete from scaffolding — check if resolvePhrase.test.ts exists (it does NOT — must be created from scratch)
- Error messages include both the invalid token and its position index
- All 118 tests passed across 6 test files after implementation — maintain zero regressions
- Implementation pattern: trim/split/map with switch statement

**From Story 1-3 (Expand Harmonic Progression):**
- `expandProgression` outputs one HarmonyContext per duration beat
- HarmonyContext fields: `{ key, roman, chord, scale: string[], chordTones: string[] }`
- Scale field is the pitch class array (e.g., `["D","E","F","G","A","B","C"]`), NOT the scale name string

**From Stories 1-1 and 1-2 (Scale/Chord Degree Resolution):**
- resolveScaleDegree and resolveChordDegree handle degree wrapping (modulo pool size)
- They handle ascending pitch placement (notes below root get bumped up one octave)
- They take a scale/chord NAME string, not pitch class arrays
- resolvePhrase may choose to use these functions OR resolve directly from HarmonyContext arrays

### Git Intelligence

Recent commits show sprint-based development (one commit per sprint). All previous epics (1 and 2) are complete. This is the first story in Epic 3, beginning the phrase resolution pipeline.

### Testing Standards

- Use `describe` blocks named after the function: `describe('resolvePhrase', () => { ... })`
- Use nested `describe` for categories: `describe('basic resolution')`, `describe('rhythm precedence')`, `describe('voice leading')`, `describe('contour preservation')`
- Use `it` with sentence-style descriptions
- Assert specific pitch values: `expect(events[0]!.note).toBe("D4")` — not just `toBeDefined()`
- Import from source file: `import { resolvePhrase } from '../../src/resolve/resolvePhrase.js'`
- Helper to create HarmonyContext for tests: use `expandProgression` or construct manually

### Reference Phrase Test Data

```
Key: C
Progression: iim7(2 beats) → V7(2 beats) → IM7(2 beats) = 6 HarmonyContexts for 8 positions

Wait — 6 contexts for 8 positions doesn't align. Looking at DSL.md:

Pos | Figure | Rhythm | Chord
 0  | 1*     | 1      | Dm7
 1  | 3      | _      | Dm7
 2  | 5      | 1      | Dm7
 3  | 3      | .      | G7
 4  | 2*     | ~      | G7
 5  | 1      | !      | G7
 6  | 7-     | 1      | Cmaj7
 7  | 1*     | _      | Cmaj7

So: Dm7 for 3 positions, G7 for 3 positions, Cmaj7 for 2 positions.
Progression: [{ roman: "iim7", duration: 3 }, { roman: "V7", duration: 3 }, { roman: "IM7", duration: 2 }]
= 8 HarmonyContext objects total.
```

The HarmonyContext array for the reference phrase:
```typescript
const progression: Progression = {
  key: "C",
  chords: [
    { roman: "iim7", duration: 3 },
    { roman: "V7", duration: 3 },
    { roman: "IM7", duration: 2 },
  ],
}
// expandProgression(progression) → 8 HarmonyContext objects
```

### References

- [Source: .claude/DSL.md#Zipping Figure + Rhythm] — Full resolution reference table
- [Source: .claude/DSL.md#Full Example] — Reference phrase expected output
- [Source: .claude/DECISIONS.md#Anchor on a rest: rest wins] — Anchor-on-rest semantics
- [Source: .claude/DECISIONS.md#Rhythm DSL uses different tie/rest tokens] — Tie translation rules
- [Source: .claude/DOMAIN.md#Voice Leading] — Nearest-overall and nearest-below strategies
- [Source: .claude/DOMAIN.md#Anchor Notes] — Anchor resolution priority
- [Source: .claude/ARCHITECTURE.md] — Resolution pipeline data flow
- [Source: _bmad-output/planning-artifacts/architecture.md#Resolution Output] — ResolvedEvent field values
- [Source: _bmad-output/planning-artifacts/architecture.md#Error Handling] — Resolvers never throw
- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.1] — BDD acceptance criteria
- [Source: packages/core/src/types/index.ts] — All type definitions
- [Source: packages/core/src/resolve/resolveScaleDegree.ts] — Melody pitch resolver
- [Source: packages/core/src/resolve/resolveChordDegree.ts] — Chord/bass pitch resolver
- [Source: packages/core/src/resolve/expandProgression.ts] — Progression expansion

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Implemented resolvePhrase: single-pass left-to-right resolution with voice leading
- Function signature changed from `HarmonyContext` to `HarmonyContext | HarmonyContext[]` to support multi-chord phrases
- Resolved degrees directly from HarmonyContext pitch class arrays (scale/chordTones) instead of calling resolveScaleDegree/resolveChordDegree — avoids needing scale name strings
- Key insight: tie voice leading must advance the theoretical pitch for the voice leading chain even though the output sustains the previous note — prevents octave drift after tied positions
- Voice leading: `placeNearestOctave` helper tries 3 candidate octaves (ref-1, ref, ref+1) and picks nearest by MIDI distance. `"nearest-below"` constrains to candidates at or below reference.
- `resolveDegree` helper extracts shared pitch resolution logic (first-note octave 4 placement, voice leading, octaveDown modifier)
- 18 tests: basic melody, chord (nearest-below), rest, tie, staccato, accent, contour, voice leading (melody+bass), anchor octave (including non-position-0 anchor), octaveDown, normal defaults, tie-at-position-0 edge case, figure-rest voice leading continuity, reference phrase end-to-end
- All 140 tests pass across 7 test files (18 new + 122 existing), zero regressions
- Pre-existing quality gate issues (typecheck, lint, knip) unchanged — no new errors introduced

### Change Log

- 2026-03-09: Implemented resolvePhrase — core phrase resolution pipeline (Story 3.1)
- 2026-03-09: Code review fixes — added 3 edge case tests (tie-at-position-0, figure-rest voice leading, non-position-0 anchor), added tie voice leading comment, fixed AC12 progression durations

### File List

- `packages/core/src/resolve/resolvePhrase.ts` — replaced stub with full implementation
- `packages/core/tests/resolve/resolvePhrase.test.ts` — created, 18 tests
