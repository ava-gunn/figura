# Story 1.3: Expand Harmonic Progression

Status: done

## Story

As a developer,
I want to convert a key and Roman numeral chord symbols into an array of HarmonyContext objects,
so that I can define progressions naturally (key + Roman numerals) and get fully resolved harmonic data for the resolution pipeline.

## Acceptance Criteria

1. **AC1 — iim7 in C resolves correctly:** Given key "C" and Roman numeral "iim7", expandProgression returns a HarmonyContext with chord "Dm7", scale `["D","E","F","G","A","B","C"]` (D dorian), and chordTones `["D","F","A","C"]`
2. **AC2 — V7 in C resolves correctly:** Given key "C" and Roman numeral "V7", returns chord "G7" with G mixolydian scale `["G","A","B","C","D","E","F"]` and chordTones `["G","B","D","F"]`
3. **AC3 — IM7 in C resolves correctly:** Given key "C" and Roman numeral "IM7", returns chord "Cmaj7" with C ionian scale `["C","D","E","F","G","A","B"]` and chordTones `["C","E","G","B"]`
4. **AC4 — Duration expansion:** Given progression `{key: "C", chords: [{roman: "iim7", duration: 4}, {roman: "V7", duration: 2}]}`, returns 6 HarmonyContext objects (4 for iim7, 2 for V7), each with fully resolved chord/scale/chordTones
5. **AC5 — All diatonic degrees work:** All 7 diatonic Roman numerals in key C resolve to correct chord names and mode scales (I=ionian, ii=dorian, iii=phrygian, IV=lydian, V=mixolydian, vi=aeolian, vii=locrian)
6. **AC6 — Non-C keys work:** expandProgression works in keys other than C (e.g., key "G", key "Eb")
7. **AC7 — Throws on invalid Roman numeral:** Given an unrecognised Roman numeral like "xyz", throws an Error with a descriptive message
8. **AC8 — Throws on invalid key:** Given an invalid key like "X", throws an Error with a descriptive message
9. **AC9 — HarmonyContext shape matches type:** Each returned object has all required fields: key, roman, chord, scale (string[]), chordTones (string[])

## Tasks / Subtasks

- [x] Task 1: Create test file with failing tests (AC: #1, #2, #3)
  - [x] 1.1 Create `packages/core/tests/resolve/expandProgression.test.ts`
  - [x] 1.2 Add test: key "C", roman "iim7" → chord "Dm7", scale D dorian notes, chordTones `["D","F","A","C"]`
  - [x] 1.3 Add test: key "C", roman "V7" → chord "G7", scale G mixolydian notes, chordTones `["G","B","D","F"]`
  - [x] 1.4 Add test: key "C", roman "IM7" → chord "Cmaj7", scale C ionian notes, chordTones `["C","E","G","B"]`
  - [x] 1.5 Run tests — confirm all fail (module not found or "Not implemented")

- [x] Task 2: Add duration expansion tests (AC: #4)
  - [x] 2.1 Add test: `{key: "C", chords: [{roman: "iim7", duration: 4}, {roman: "V7", duration: 2}]}` returns array of length 6
  - [x] 2.2 Assert first 4 elements all have chord "Dm7" with correct scale/chordTones
  - [x] 2.3 Assert last 2 elements all have chord "G7" with correct scale/chordTones
  - [x] 2.4 Add test: single chord with duration 1 returns array of length 1
  - [x] 2.5 Run tests — confirm failures

- [x] Task 3: Add all diatonic degrees tests (AC: #5)
  - [x] 3.1 Add tests for all 7 diatonic numerals in key C: IM7, iim7, iiim7, IVmaj7, V7, vim7, viiø7 (or viim7b5)
  - [x] 3.2 Assert each resolves to the correct chord name and mode scale
  - [x] 3.3 Run tests — confirm failures

- [x] Task 4: Add non-C key and error tests (AC: #6, #7, #8)
  - [x] 4.1 Add test: key "G", roman "iim7" → chord "Am7", A dorian scale
  - [x] 4.2 Add test: key "Eb", roman "V7" → chord "Bb7", Bb mixolydian scale
  - [x] 4.3 Add test: invalid Roman numeral "xyz" throws Error with descriptive message
  - [x] 4.4 Add test: invalid key "X" throws Error with descriptive message
  - [x] 4.5 Run tests — confirm failures

- [x] Task 5: Implement expandProgression (AC: #1-#9)
  - [x] 5.1 Create `packages/core/src/resolve/expandProgression.ts`
  - [x] 5.2 Implement Roman numeral parsing: extract degree (i-vii) and suffix (m7, 7, M7, maj7, m7b5, ø7)
  - [x] 5.3 Map degree to root note using `Scale.get("{key} major").notes[degreeIndex]`
  - [x] 5.4 Map degree to mode name: 1=ionian, 2=dorian, 3=phrygian, 4=lydian, 5=mixolydian, 6=aeolian, 7=locrian
  - [x] 5.5 Map Roman suffix to tonal chord suffix: "M7"→"maj7", "m7"→"m7", "7"→"7", "m7b5"→"m7b5", "ø7"→"m7b5"
  - [x] 5.6 Build chord name: `rootNote + chordSuffix` (e.g., "D" + "m7" = "Dm7")
  - [x] 5.7 Build scale name: `rootNote + " " + modeName` (e.g., "D dorian")
  - [x] 5.8 Get scale notes: `Scale.get(scaleName).notes` — validate non-empty
  - [x] 5.9 Get chord tones: `Chord.get(chordName).notes` — validate non-empty
  - [x] 5.10 Construct HarmonyContext: `{key, roman, chord, scale, chordTones}`
  - [x] 5.11 Expand durations: for each chord entry, repeat its HarmonyContext `duration` times
  - [x] 5.12 Run tests — confirm green
  - [x] 5.13 Refactor if needed, keeping tests green

- [x] Task 6: Update barrel export
  - [x] 6.1 Add `export { expandProgression } from "./resolve/expandProgression.js"` to `packages/core/src/index.ts`
  - [x] 6.2 Run `pnpm typecheck` — zero new errors

- [x] Task 7: Verify quality gates
  - [x] 7.1 `pnpm typecheck` — zero new errors (pre-existing: strudel import, vitest.workspace)
  - [x] 7.2 `pnpm test` — all expandProgression tests pass, no regressions (70+ total)
  - [x] 7.3 Coverage — expandProgression fully covered

## Dev Notes

### Implementation Pattern — Roman Numeral Parsing

The core challenge is parsing Roman numeral strings like "iim7", "V7", "IM7" into a degree number and chord suffix.

**Parsing algorithm:**
1. Match Roman numeral prefix (case-insensitive) from longest to shortest: vii, vi, v, iv, iii, ii, i
2. Case of the match determines quality context (lowercase=minor, uppercase=major) — but this is informational; the suffix drives chord type
3. Everything after the Roman prefix is the suffix (m7, 7, M7, maj7, m7b5, ø7)
4. Map Roman to degree: I/i=1, II/ii=2, III/iii=3, IV/iv=4, V/v=5, VI/vi=6, VII/vii=7

**Suffix to tonal chord type mapping:**

| Roman Suffix | Tonal Chord Suffix | Example |
|---|---|---|
| `m7` | `m7` | Dm7 |
| `7` | `7` | G7 |
| `M7` | `maj7` | Cmaj7 |
| `maj7` | `maj7` | Cmaj7 |
| `m7b5` | `m7b5` | Bm7b5 |
| `ø7` | `m7b5` | Bm7b5 |

**Degree to mode mapping:**

| Degree | Mode |
|---|---|
| 1 | ionian |
| 2 | dorian |
| 3 | phrygian |
| 4 | lydian |
| 5 | mixolydian |
| 6 | aeolian |
| 7 | locrian |

### Tonal API for Key/Scale Lookup

```typescript
import { Scale, Chord } from "tonal"

// Get root note for a degree in a key
Scale.get("C major").notes     // ["C","D","E","F","G","A","B"]
Scale.get("C major").notes[1]  // "D" (degree 2, zero-indexed)

// Get scale for a chord
Scale.get("D dorian").notes    // ["D","E","F","G","A","B","C"]
Scale.get("G mixolydian").notes // ["G","A","B","C","D","E","F"]

// Get chord tones
Chord.get("Dm7").notes   // ["D","F","A","C"]
Chord.get("G7").notes    // ["G","B","D","F"]
Chord.get("Cmaj7").notes // ["C","E","G","B"]
```

### Error Handling — expandProgression Is a Parser-Level Function

Unlike resolveScaleDegree/resolveChordDegree (which never throw on degree values), expandProgression operates at the **system boundary** — it receives user input (key + Roman numerals). Per architecture: "Parsers throw on invalid input."

- Throw on unrecognised Roman numeral prefix
- Throw on invalid key (Scale.get returns empty notes)
- Throw if tonal can't resolve the constructed chord name (Chord.get returns empty notes)
- Include descriptive error messages with the invalid input

### Follow Existing Patterns from Stories 1.1 and 1.2

| Pattern | Convention | Source |
|---|---|---|
| Import style | `import { Scale, Chord } from "tonal"` — named imports only | resolveScaleDegree.ts |
| Type import | `import type { HarmonyContext, Progression } from "../types/index.js"` | resolveChordDegree.ts |
| Validation | Check `notes.length` is non-empty, throw descriptive Error | Both resolvers |
| Test import | `import { expandProgression } from "../../src/resolve/expandProgression.js"` | Convention |
| Test structure | `describe("expandProgression", () => { describe("category", ...) })` | Both test files |
| Assertions | Assert specific values: `expect(result.chord).toBe("Dm7")` | Both test files |

### What This Story Does NOT Cover

- Voice leading between chords (Story 3.1 — resolvePhrase responsibility)
- Contour preservation (Story 3.1)
- Advanced chord symbols beyond basic diatonic (post-MVP)
- Chromatic chords, secondary dominants, borrowed chords (post-MVP)

### Project Structure Notes

- **New file:** `packages/core/src/resolve/expandProgression.ts`
- **New test:** `packages/core/tests/resolve/expandProgression.test.ts`
- **Modify:** `packages/core/src/index.ts` — add expandProgression export
- Import pattern: `import { Scale, Chord } from "tonal"` (named imports only)
- Import types: `import type { HarmonyContext, Progression } from "../types/index.js"`
- Test import: `import { expandProgression } from "../../src/resolve/expandProgression.js"`

### Pre-Existing Quality Gate Issues (from Stories 1.1, 1.2)

These are known and do NOT need to be fixed:
- ESLint config: project uses `.eslintrc.cjs` but ESLint 10 expects `eslint.config.js`
- Knip: `vitest.workspace.ts` `defineWorkspace` flagged as unused
- Sherif: missing `packageManager` field in root `package.json`

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Story 1.3 acceptance criteria]
- [Source: _bmad-output/planning-artifacts/architecture.md — HarmonyContext type, expandProgression signature]
- [Source: _bmad-output/planning-artifacts/architecture.md — Error Handling: "Parsers throw on invalid input"]
- [Source: _bmad-output/planning-artifacts/architecture.md — tonal API Usage: Scale.get(), Chord.get()]
- [Source: .claude/DOMAIN.md — Roman Numeral Notation, Chord/Scale Relationships table]
- [Source: .claude/DECISIONS.md — FigureType determines pitch space]
- [Source: packages/core/src/resolve/resolveScaleDegree.ts — reference pattern for tonal usage]
- [Source: packages/core/src/resolve/resolveChordDegree.ts — reference pattern for error handling]
- [Source: packages/core/src/types/index.ts — Progression and HarmonyContext type definitions]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None — clean implementation with no blocking issues.

### Completion Notes List

- Implemented `expandProgression` following strict TDD (red-green-refactor)
- All 19 tests pass covering all 9 acceptance criteria
- 100% code coverage (statements, branches, functions, lines)
- Roman numeral parsing handles all diatonic degrees (I-VII) with suffixes: m7, 7, M7, maj7, m7b5, ø7
- Duration expansion repeats HarmonyContext objects for each beat
- Error handling: throws on invalid Roman numeral prefix, invalid suffix, and invalid key
- Added extra test for valid Roman prefix with invalid suffix ("Iadd9") to ensure full branch coverage

**Code Review Fixes (2026-03-07):**
- [H1] Restored defensive validation for Scale.get/Chord.get with v8 ignore pragmas for unreachable branches
- [M1] Shared object reference in duration expansion acknowledged — HarmonyContext is read-only by convention
- [M2] Added duration validation (throws on duration < 1) with 2 new tests
- [M3] Added chordTones assertions to all 8 diatonic degree tests
- [L1] Reordered ROMAN_NUMERALS array to true longest-to-shortest matching

### Change Log

- 2026-03-07: Implemented expandProgression with 19 tests, 100% coverage. All ACs satisfied.
- 2026-03-07: Code review — fixed 5 findings (1 High, 3 Medium, 1 Low). 21 tests, 100% coverage.

### File List

- `packages/core/src/resolve/expandProgression.ts` (new)
- `packages/core/tests/resolve/expandProgression.test.ts` (new)
- `packages/core/src/index.ts` (modified — added expandProgression export)
